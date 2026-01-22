import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { EventPublisher as V2EventPublisher } from './v2/shared/events';
import { DomainEventConsumer } from './v2/shared/domain-consumer';
import { ApplicationRepository } from './v2/applications/repository';
import { CandidateRepository } from './v2/candidates/repository';
import { CandidateSourcerRepository } from './v2/candidate-sourcers/repository';
import { registerV2Routes } from './v2/routes';
import * as Sentry from '@sentry/node';

async function main() {
    const baseConfig = loadBaseConfig('ats-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    const app = await buildServer({
        logger,
        cors: {
            origin: true,
            credentials: true,
        },
    });

    app.setErrorHandler(errorHandler);

    // Initialize Sentry if DSN is provided
    const sentryDsn = process.env.SENTRY_DSN;
    if (sentryDsn) {
        Sentry.init({
            dsn: sentryDsn,
            environment: baseConfig.nodeEnv,
            release: process.env.SENTRY_RELEASE,
            tracesSampleRate: 0.1,
        });

        app.addHook('onError', async (request, reply, error) => {
            Sentry.captureException(error, {
                tags: { service: baseConfig.serviceName },
                extra: { path: request.url, method: request.method },
            });
        });
    }

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
    await v2EventPublisher.connect();

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
        v2EventPublisher
    );

    const domainConsumer = new DomainEventConsumer(
        rabbitConfig.url,
        applicationRepository,
        candidateRepository,
        candidateSourcerRepository,
        placementService,
        v2EventPublisher,
        logger
    );
    await domainConsumer.connect();

    // Register V2 routes (V2-only architecture)
    registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey: dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        eventPublisher: v2EventPublisher,
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

            // Check RabbitMQ connectivity
            const rabbitHealthy = v2EventPublisher.isConnected();
            if (!rabbitHealthy) {
                logger.warn('RabbitMQ not connected');
            }
            return reply.status(200).send({
                status: 'healthy',
                service: 'ats-service',
                version: 'v2-only',
                timestamp: new Date().toISOString(),
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
        await v2EventPublisher.close();
        process.exit(1);
    }
}

main();
