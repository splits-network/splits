import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig, loadRedisConfig } from '@splits-network/shared-config';
import { Redis } from 'ioredis';
import { AiClient } from '@splits-network/shared-ai-client';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { EventPublisher as V2EventPublisher, OutboxPublisher, ResilientPublisher } from './v2/shared/events.js';
import { CandidateRepository } from './v2/candidates/repository.js';
import { CandidateSourcerRepository as V2CandidateSourcerRepository } from './v2/candidate-sourcers/repository.js';
import { registerV2Routes } from './v2/routes.js';
import { registerV3Routes } from './v3/routes.js';
import { DomainEventConsumerV3 } from './v3/shared/domain-consumer.js';
import { ApplicationRepository as V3ApplicationRepository } from './v3/applications/repository.js';
import { CandidateSourcerRepository as V3CandidateSourcerRepository } from './v3/candidate-sourcers/repository.js';
import { AIReviewService } from './v3/applications/actions/ai-review.service.js';
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
    const supabaseKey = dbConfig.supabaseServiceRoleKey ?? dbConfig.supabaseAnonKey;

    if (!supabaseKey) {
        throw new Error('Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    }

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

    // Initialize repositories
    const candidateRepository = new CandidateRepository(
        dbConfig.supabaseUrl,
        supabaseKey
    );

    const supabase = candidateRepository.getSupabase();
    const outboxPublisher = new OutboxPublisher(supabase, baseConfig.serviceName, logger);

    // Resilient publisher: tries RabbitMQ first, falls back to outbox
    const resilientPublisher = new ResilientPublisher(v2EventPublisher, outboxPublisher, logger);

    // Initialize Redis + AI client for provider-agnostic AI calls
    const redisConfig = loadRedisConfig();
    const redis = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
        db: redisConfig.db || 0,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
    });
    try {
        await redis.connect();
    } catch (err) {
        logger.warn({ err }, 'Redis connection failed — AI config will use DB/env fallback');
    }

    const aiClient = new AiClient({
        supabase,
        redis,
        serviceName: 'ats-service',
        logger,
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        anthropicApiKey: process.env.ANTHROPIC_API_KEY || undefined,
    });

    // V2 candidate-sourcer repo (still needed by placement service)
    const v2CandidateSourcerRepository = new V2CandidateSourcerRepository(
        candidateRepository.getSupabase()
    );

    // V3 repositories + services for domain consumer
    const v3ApplicationRepository = new V3ApplicationRepository(supabase);
    const v3CandidateSourcerRepository = new V3CandidateSourcerRepository(supabase);
    const aiReviewService = new AIReviewService(v3ApplicationRepository, supabase, resilientPublisher);

    // Initialize placement service (still used by V2 routes)
    const placementRepository = new (await import('./v2/placements/repository.js')).PlacementRepository(
        dbConfig.supabaseUrl,
        supabaseKey
    );
    const companySourcerRepository = new (await import('./v2/company-sourcers/repository.js')).CompanySourcerRepository(
        candidateRepository.getSupabase()
    );
    const placementService = new (await import('./v2/placements/service.js')).PlacementServiceV2(
        placementRepository.getSupabase(),
        placementRepository,
        companySourcerRepository,
        v2CandidateSourcerRepository,
        resilientPublisher
    );

    // Initialize V3 domain event consumer (replaces V2 consumer)
    const domainConsumer = new DomainEventConsumerV3(
        rabbitConfig.url,
        supabase,
        v3ApplicationRepository,
        v3CandidateSourcerRepository,
        aiReviewService,
        resilientPublisher,
        logger
    );

    try {
        await domainConsumer.connect();
        logger.info('🐰 RabbitMQ V3 DomainConsumer connected successfully');
    } catch (error) {
        logger.error({ err: error }, '❌ Failed to connect RabbitMQ V3 DomainConsumer on startup');
        throw error;
    }

    logger.info('✅ RabbitMQ initialization complete - EventPublisher and V3 DomainConsumer ready');

    // Register V2 routes (legacy — coexists with V3)
    registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: resilientPublisher,
    });

    // Register V3 routes (jobs, job-requirements, job-skills, saved-jobs)
    registerV3Routes(app, {
        supabase,
        eventPublisher: resilientPublisher,
        aiClient,
    });

    // Health check endpoint
    app.get('/health', async () => ({
        status: 'healthy',
        service: 'ats-service',
        timestamp: new Date().toISOString(),
    }));

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
