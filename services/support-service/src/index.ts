import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRedisConfig,
    loadRabbitMQConfig,
} from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerV2Routes } from './v2/routes';
import { registerV3Routes } from './v3/routes';
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
    const baseConfig = loadBaseConfig('support-service');
    const dbConfig = loadDatabaseConfig();
    const redisConfig = loadRedisConfig();
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
                title: 'Support Service API',
                description: 'Support chat service for Splits Network',
                version: '1.0.0',
            },
            servers: [{ url: `http://localhost:${baseConfig.port}`, description: 'Development server' }],
            tags: [{ name: 'support', description: 'Support conversations and messages' }],
        },
    });

    await app.register(swaggerUi as any, {
        routePrefix: '/docs',
        uiConfig: { docExpansion: 'list', deepLinking: true },
    });

    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        redisConfig,
        rabbitMqUrl: rabbitConfig.url,
    });

    // Register V3 routes (coexist with V2)
    const { createClient } = await import('@supabase/supabase-js');
    const { SupportEventPublisher: V2SupportEventPublisher } = await import('./v2/support/events');
    const { SupportEventPublisher: V3SupportEventPublisher } = await import('./v3/shared/support-event-publisher');
    const supabaseClient = createClient(dbConfig.supabaseUrl, supabaseKey);
    // V2 publisher used by V2 routes (unchanged)
    const supportEventPublisher = new V2SupportEventPublisher(redisConfig, app.log as any);
    // V3 publisher used by V3 routes
    const v3SupportEventPublisher = new V3SupportEventPublisher(redisConfig, app.log as any);

    app.addHook('onClose', async () => {
        await supportEventPublisher.close();
        await v3SupportEventPublisher.close();
    });

    registerV3Routes(app, {
        supabase: supabaseClient,
        supportEventPublisher: v3SupportEventPublisher,
    });

    app.get('/health', async (_request, reply) => {
        return reply.status(200).send({
            status: 'healthy',
            service: 'support-service',
            timestamp: new Date().toISOString(),
        });
    });

    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await app.close();
        process.exit(0);
    });

    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`Support service listening on port ${baseConfig.port}`);
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
