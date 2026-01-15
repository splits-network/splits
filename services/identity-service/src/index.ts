import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerV2Routes } from './v2/routes';
import { EventPublisherV2 } from './v2/shared/events';
import * as Sentry from '@sentry/node';

async function main() {
    const baseConfig = loadBaseConfig('identity-service');
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

    // Set error handler
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
                title: 'Identity Service API V2',
                description: 'V2 Identity Service - User identity, organizations, and membership management',
                version: '2.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3001',
                    description: 'Development server',
                },
            ],
            tags: [
                { name: 'users', description: 'User management V2' },
                { name: 'organizations', description: 'Organization management V2' },
                { name: 'memberships', description: 'User-organization memberships V2' },
                { name: 'invitations', description: 'Organization invitations V2' },
                { name: 'consent', description: 'User consent management V2' },
                { name: 'webhooks', description: 'Webhook endpoints V2' },
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
    const eventPublisher = new EventPublisherV2(rabbitConfig.url, logger);
    try {
        await eventPublisher.connect();
        logger.info('Successfully connected to RabbitMQ for event publishing');
    } catch (error) {
        logger.warn({ err: error }, 'Failed to connect to RabbitMQ - events will not be published. Service will continue without event publishing.');
        // Don't throw - service should continue without RabbitMQ
    }

    // Register V2 routes only
    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey: dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        eventPublisher,
        logger,
    });

    // Health check endpoint
    app.get('/health', async (request, reply) => {
        try {
            return reply.status(200).send({
                status: 'healthy',
                service: 'identity-service',
                version: '2.0.0',
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            logger.error({ err: error }, 'Health check failed');
            return reply.status(503).send({
                status: 'unhealthy',
                service: 'identity-service',
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`Identity service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        await eventPublisher.close();
        process.exit(1);
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });
}

main();
