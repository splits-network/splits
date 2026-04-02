import { loadBaseConfig, loadDatabaseConfig, createSupabaseClient } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, registerHealthCheck, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { EventPublisherV2, OutboxPublisher, ResilientPublisher } from './v2/shared/events.js';
import { registerV2Routes } from './v2/routes.js';
import { registerV3Routes } from './v3/routes.js';
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? 'development',
        release: process.env.SENTRY_RELEASE,
        tracesSampleRate: 0.1,
    });
}

async function main() {
    const baseConfig = loadBaseConfig('gamification-service');
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
        cors: { origin: true, credentials: true },
        disableRequestLogging: true,
    });

    app.setErrorHandler(errorHandler);

    app.addHook('onError', async (request, reply, error) => {
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error, {
                tags: { service: baseConfig.serviceName },
                extra: { path: request.url, method: request.method },
            });
        }
    });

    await app.register(swagger as any, {
        openapi: {
            info: {
                title: 'Gamification Service API',
                description: 'Badges, XP, levels, streaks, and leaderboards',
                version: '1.0.0',
            },
            servers: [{ url: 'http://localhost:3018', description: 'Development server' }],
            tags: [
                { name: 'badges', description: 'Badge definitions, awards, and progress' },
                { name: 'xp', description: 'Experience points and levels' },
                { name: 'streaks', description: 'Activity streaks' },
                { name: 'leaderboards', description: 'Rankings and leaderboards' },
            ],
        },
    });

    await app.register(swaggerUi as any, {
        routePrefix: '/docs',
        uiConfig: { docExpansion: 'list', deepLinking: true },
    });

    // Event publisher
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    const v2EventPublisher = new EventPublisherV2(rabbitMqUrl, logger);
    try {
        await v2EventPublisher.connect();
        logger.info('Gamification event publisher connected');
    } catch (error) {
        logger.warn({ err: error }, 'Failed to connect event publisher - continuing without it');
    }

    // Supabase client for outbox + health checks
    const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

    // Outbox for durable event delivery
    const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);

    // Resilient publisher: tries direct RabbitMQ first, falls back to outbox
    const resilientPublisher = new ResilientPublisher(v2EventPublisher, outboxPublisher, logger);

    // Register V2 routes and get services
    const { consumer, leaderboardScheduler } = await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: resilientPublisher,
        rabbitMqUrl,
        logger,
    });

    // Start event consumer
    try {
        await consumer.start();
    } catch (error) {
        logger.warn({ err: error }, 'Failed to start gamification consumer - continuing without it');
    }

    // Start leaderboard scheduler
    leaderboardScheduler.start();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        leaderboardScheduler.stop();
        await consumer.stop();
        await v2EventPublisher.close();
        await app.close();
        process.exit(0);
    });

    registerV3Routes(app, { supabase: supabaseClient });

    // Health check
    registerHealthCheck(app, {
        serviceName: 'gamification-service',
        logger,
    });

    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`Gamification service listening on port ${baseConfig.port}`);
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
