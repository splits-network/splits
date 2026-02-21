import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { EventPublisher as V2EventPublisher, OutboxPublisher, OutboxWorker } from './v2/shared/events';
import { DomainEventConsumer } from './v2/shared/domain-consumer';
import { ApplicationRepository } from './v2/applications/repository';
import { CandidateRepository } from './v2/candidates/repository';
import { CandidateSourcerRepository } from './v2/candidate-sourcers/repository';
import { registerV2Routes } from './v2/routes';
import * as Sentry from '@sentry/node';

// Initialize Sentry at module level so startup errors are captured before main() runs
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? 'development',
        release: process.env.SENTRY_RELEASE,
        tracesSampleRate: 0.1,
    });
}

async function main() {
    const baseConfig = loadBaseConfig('ats-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    // Register process-level error handlers as early as possible.
    // For uncaughtException / unhandledRejection: logs the full error, flushes
    // Sentry so the event is not lost, then exits with code 1.
    setupProcessErrorHandlers({
        logger,
        ...(process.env.SENTRY_DSN && {
            onFatalError: async (error) => {
                Sentry.captureException(error);
                await Sentry.flush(2000);
            },
        }),
    });

    const app = await buildServer({
        logger,
        cors: {
            origin: true,
            credentials: true,
        },
        // Disable built-in Fastify request logging to reduce health check noise
        disableRequestLogging: true,
    });

    app.setErrorHandler(errorHandler);

    // Capture per-request errors with route context.
    // Sentry.captureException is a no-op when Sentry was not initialized.
    app.addHook('onError', async (request, reply, error) => {
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error, {
                tags: { service: baseConfig.serviceName },
                extra: { path: request.url, method: request.method },
            });
        }
    });

    // Register Swagger
    await app.register(swagger as any, {
        openapi: {
            info: {
                title: 'ATS Service API',
                description: 'Applicant Tracking System - Jobs, candidates, applications, and placements',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3002',
                    description: 'Development server',
                },
            ],
            tags: [
                { name: 'companies', description: 'Company management' },
                { name: 'jobs', description: 'Job/role management' },
                { name: 'candidates', description: 'Candidate management' },
                { name: 'applications', description: 'Job applications and pipeline' },
                { name: 'placements', description: 'Successful hires and placements' },
                { name: 'proposals', description: 'Unified proposal workflows (Phase 1A)' },
                { name: 'integrations', description: 'ATS integration management' },
            ],
        },
    });

    await app.register(swaggerUi as any, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
        },
    });

    // Initialize V2 event publisher
    const v2EventPublisher = new V2EventPublisher(
        rabbitConfig.url,
        logger,
        baseConfig.serviceName
    );

    try {
        await v2EventPublisher.connect();
        logger.info('🐰 RabbitMQ EventPublisher connected successfully');
    } catch (error) {
        logger.error({ err: error }, '❌ Failed to connect RabbitMQ EventPublisher on startup');
        throw error;
    }

    // Initialize V2 domain event consumer to sync events from other services
    const applicationRepository = new ApplicationRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );

    const candidateRepository = new CandidateRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );

    const candidateSourcerRepository = new CandidateSourcerRepository(
        candidateRepository.getSupabase()
    );

    // Initialize outbox publisher (writes events to DB) and worker (delivers DB events → RabbitMQ)
    const supabase = applicationRepository.getSupabase();
    const outboxPublisher = new OutboxPublisher(supabase, baseConfig.serviceName, logger);
    const outboxWorker = new OutboxWorker(supabase, v2EventPublisher, baseConfig.serviceName, logger);
    outboxWorker.start();
    logger.info('📤 Outbox worker started - events will be durably delivered');

    // Initialize placement service for domain consumer
    const placementRepository = new (await import('./v2/placements/repository')).PlacementRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );
    const companySourcerRepository = new (await import('./v2/company-sourcers/repository')).CompanySourcerRepository(
        candidateRepository.getSupabase()
    );
    const placementService = new (await import('./v2/placements/service')).PlacementServiceV2(
        placementRepository.getSupabase(),
        placementRepository,
        companySourcerRepository,
        candidateSourcerRepository,
        outboxPublisher
    );

    const domainConsumer = new DomainEventConsumer(
        rabbitConfig.url,
        applicationRepository,
        candidateRepository,
        candidateSourcerRepository,
        placementService,
        outboxPublisher,
        logger
    );

    try {
        await domainConsumer.connect();
        logger.info('🐰 RabbitMQ DomainConsumer connected successfully');
    } catch (error) {
        logger.error({ err: error }, '❌ Failed to connect RabbitMQ DomainConsumer on startup');
        throw error;
    }

    logger.info('✅ RabbitMQ initialization complete - EventPublisher and DomainConsumer ready');

    // Register V2 routes (V2-only architecture)
    registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey: dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        eventPublisher: outboxPublisher,
    });

    // Health check endpoint
    app.get('/health', async (request, reply) => {
        try {
            // Check database connectivity using V2 repository
            const healthRepo = new ApplicationRepository(
                dbConfig.supabaseUrl,
                dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
            );

            // Test database connectivity by doing a simple query
            await healthRepo.findApplications('internal-service', { limit: 1 });

            // Check RabbitMQ connectivity by attempting to ensure connection
            let rabbitHealthy = true;
            try {
                await v2EventPublisher.ensureConnection();
            } catch (error) {
                rabbitHealthy = false;
                logger.warn('RabbitMQ not connected during health check');
            }

            return reply.status(200).send({
                status: 'healthy',
                service: 'ats-service',
                version: 'v2-only',
                timestamp: new Date().toISOString(),
                rabbitmq: {
                    connected: rabbitHealthy,
                    status: rabbitHealthy ? 'connected' : 'disconnected'
                }
            });
        } catch (error) {
            logger.error({ err: error }, 'Health check failed');
            return reply.status(503).send({
                status: 'unhealthy',
                service: 'ats-service',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await domainConsumer.disconnect();
        outboxWorker.stop();
        await v2EventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`ATS service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        await domainConsumer.disconnect();
        outboxWorker.stop();
        await v2EventPublisher.close();
        process.exit(1);
    }
}

main();
