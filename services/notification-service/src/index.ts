import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    loadResendConfig,
    createSupabaseClient,
} from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, registerHealthCheck, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import { NotificationRepository } from './repository';
import { NotificationService } from './service';
import { DomainEventConsumer } from './domain-consumer';
import { PORTAL_URL, CANDIDATE_URL } from './helpers/urls';
import { registerV2Routes } from './v2/routes';
import { registerV3Routes } from './v3/routes';
import { EventPublisher as V2EventPublisher, OutboxPublisher } from './v2/shared/events';
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
    const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

    // Set up transactional outbox for durable event delivery
    const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);

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

    // Register standardized health check
    registerHealthCheck(app, {
        serviceName: 'notification-service',
        logger,
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
        await v2EventPublisher.close();
        process.exit(1);
    }
}

main();
