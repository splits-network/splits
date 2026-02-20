import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { EventPublisher } from './v2/shared/events';
import { registerV2Routes } from './v2/routes';
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
    const baseConfig = loadBaseConfig('content-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();

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
        cors: {
            origin: true,
            credentials: true,
        },
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
                title: 'Content Service API',
                description: 'CMS for structured page content with composable blocks',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3015',
                    description: 'Development server',
                },
            ],
            tags: [
                { name: 'pages', description: 'Content page management' },
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

    // Initialize event publisher
    const eventPublisher = new EventPublisher(
        rabbitConfig.url,
        logger,
        baseConfig.serviceName
    );

    try {
        await eventPublisher.connect();
        logger.info('RabbitMQ EventPublisher connected successfully');
    } catch (error) {
        logger.error({ err: error }, 'Failed to connect RabbitMQ EventPublisher on startup');
        throw error;
    }

    // Register V2 routes
    registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey: dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        eventPublisher,
    });

    // Health check
    app.get('/health', async (request, reply) => {
        try {
            let rabbitHealthy = true;
            try {
                await eventPublisher.ensureConnection();
            } catch {
                rabbitHealthy = false;
            }

            return reply.status(200).send({
                status: 'healthy',
                service: 'content-service',
                version: 'v2',
                timestamp: new Date().toISOString(),
                rabbitmq: {
                    connected: rabbitHealthy,
                    status: rabbitHealthy ? 'connected' : 'disconnected',
                },
            });
        } catch (error) {
            logger.error({ err: error }, 'Health check failed');
            return reply.status(503).send({
                status: 'unhealthy',
                service: 'content-service',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`Content service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        await eventPublisher.close();
        process.exit(1);
    }
}

main();
