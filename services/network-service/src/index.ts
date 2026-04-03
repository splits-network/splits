import { loadBaseConfig, loadDatabaseConfig, createSupabaseClient } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, registerHealthCheck, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { EventPublisherV2, OutboxPublisher, ResilientPublisher } from './v2/shared/events.js';
import { registerV2Routes } from './v2/routes.js';
import { registerV3Routes } from './v3/routes.js';
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
    const baseConfig = loadBaseConfig('network-service');
    const dbConfig = loadDatabaseConfig();
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
                title: 'Network Service API',
                description: 'Recruiter network management - profiles, assignments, firms, and statistics',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3003',
                    description: 'Development server',
                },
            ],
            tags: [
                { name: 'recruiters', description: 'Recruiter profile management' },
                { name: 'assignments', description: 'Job role assignments to recruiters' },
                { name: 'stats', description: 'Recruiter performance statistics' },
                { name: 'firms', description: 'Recruiting firms and agencies (Phase 4B)' },
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
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    const v2EventPublisher = new EventPublisherV2(rabbitMqUrl, logger);
    try {
        await v2EventPublisher.connect();
        logger.info('Network V2 event publisher connected');
    } catch (error) {
        logger.warn({ err: error }, 'Failed to connect Network V2 event publisher - continuing without it');
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await v2EventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Create Supabase client (needed for outbox + health checks)
    const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

    // Set up transactional outbox for durable event delivery
    const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);

    // Wrap in resilient publisher for durable event delivery
    const resilientPublisher = new ResilientPublisher(v2EventPublisher, outboxPublisher, logger);

    // Register V2 routes
    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: resilientPublisher,
    });

    // Register V3 routes
    registerV3Routes(app, supabaseClient, resilientPublisher);

    // Register standardized health check
    registerHealthCheck(app, {
        serviceName: 'network-service',
        logger,
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`Network service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        process.exit(1);
    }
}

main();
