import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    loadResendConfig,
} from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, registerHealthCheck, HealthCheckers, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import { NotificationRepository } from './repository';
import { NotificationService } from './service';
import { DomainEventConsumer } from './domain-consumer';
import { PORTAL_URL, CANDIDATE_URL } from './helpers/urls';
import { registerV2Routes } from './v2/routes';
import { registerV3Routes } from './v3/routes';
import { EventPublisher as V2EventPublisher, OutboxPublisher, OutboxWorker } from './v2/shared/events';
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
    const baseConfig = loadBaseConfig('notification-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const resendConfig = loadResendConfig();
    const supabaseKey = dbConfig.supabaseServiceRoleKey ?? dbConfig.supabaseAnonKey;

    if (!supabaseKey) {
        throw new Error('Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    }

    // User-facing URLs — hardcoded per environment (see helpers/urls.ts)
    const portalUrl = PORTAL_URL;
    const candidateWebsiteUrl = CANDIDATE_URL;

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

    logger.info({ portalUrl, candidateWebsiteUrl }, 'User-facing URLs configured');

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

    // Initialize repository and notification service
    const repository = new NotificationRepository(
        dbConfig.supabaseUrl,
        supabaseKey
    );

    const notificationService = new NotificationService(
        repository,
        resendConfig.apiKey,
        resendConfig.fromEmail,
        resendConfig.candidateFromEmail,
        logger
    );

    // Initialize domain event consumer with connection monitoring
    const consumer = new DomainEventConsumer(
        rabbitConfig.url,
        notificationService,
        repository,
        logger,
        portalUrl,
        candidateWebsiteUrl
    );

    try {
        await consumer.connect();
        logger.info('Domain event consumer connected successfully');
    } catch (error) {
        logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to connect domain event consumer');
        throw error;
    }

    const v2EventPublisher = new V2EventPublisher(
        rabbitConfig.url,
        logger,
        baseConfig.serviceName
    );

    try {
        await v2EventPublisher.connect();
        logger.info('V2 event publisher connected successfully');
    } catch (error) {
        logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to connect V2 event publisher');
        throw error;
    }

    // Create Supabase client (needed for outbox + health checks)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(
        dbConfig.supabaseUrl,
        supabaseKey
    );

    // Set up transactional outbox for durable event delivery
    const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);
    const outboxWorker = new OutboxWorker(supabaseClient, v2EventPublisher, baseConfig.serviceName, logger);
    outboxWorker.start();
    logger.info('📤 Outbox worker started - events will be durably delivered');

    // Register V2 HTTP routes
    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: outboxPublisher,
    });

    // Register V3 HTTP routes (coexist with V2)
    registerV3Routes(app, {
        supabase: supabaseClient,
        eventPublisher: outboxPublisher,
    });

    // Simple health check wrapper
    const createChecker = (name: string, originalChecker: () => Promise<any>) => {
        return async () => {
            try {
                return await originalChecker();
            } catch (error) {
                logger.error({ dependency: name, error: error instanceof Error ? error.message : String(error) }, 'Health check failed');
                throw error;
            }
        };
    };

    // Simple Resend check
    const createResendChecker = () => {
        return HealthCheckers.custom('resend', async () => {
            return !!resendConfig.apiKey;
        }, { provider: 'resend' });
    };

    // Register standardized health check
    registerHealthCheck(app, {
        serviceName: 'notification-service',
        logger,
        checkers: {
            database: createChecker('database', HealthCheckers.database(supabaseClient)),
            ...(v2EventPublisher && {
                rabbitmq_publisher: createChecker('rabbitmq_publisher', HealthCheckers.rabbitMqPublisher(v2EventPublisher))
            }),
            ...(consumer && {
                rabbitmq_consumer: createChecker('rabbitmq_consumer', HealthCheckers.rabbitMqConsumer(consumer))
            }),
            resend: createResendChecker(),
        },
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');

        try {
            await consumer.close();
            logger.info('Domain event consumer closed');
        } catch (error) {
            logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error closing consumer');
        }

        try {
            outboxWorker.stop();
            await v2EventPublisher.close();
            logger.info('V2 event publisher closed');
        } catch (error) {
            logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error closing event publisher');
        }

        await app.close();
        process.exit(0);
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`Notification service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        await consumer.close();
        outboxWorker.stop();
        await v2EventPublisher.close();
        process.exit(1);
    }
}

main();
