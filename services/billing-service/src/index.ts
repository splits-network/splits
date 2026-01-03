import { loadBaseConfig, loadDatabaseConfig, loadStripeConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerWebhookRoutes } from './routes/webhooks/routes';
import { BillingService } from './service'; // V1 - Keep for webhook compatibility until V2 migration
import { BillingRepository } from './repository'; // V1 - Keep for webhook compatibility until V2 migration
import { registerV2Routes } from './v2/routes';
import { EventPublisher as V2EventPublisher } from './v2/shared/events';
import * as Sentry from '@sentry/node';

async function main() {
    const baseConfig = loadBaseConfig('billing-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const stripeConfig = loadStripeConfig();

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
                title: 'Billing Service API',
                description: 'Subscription management and Stripe integration',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3004',
                    description: 'Development server',
                },
            ],
            tags: [
                { name: 'plans', description: 'Subscription plan management' },
                { name: 'subscriptions', description: 'Recruiter subscription management' },
                { name: 'webhooks', description: 'Stripe webhook endpoints' },
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

    // Add raw body for Stripe webhooks
    app.addContentTypeParser(
        'application/json',
        { parseAs: 'buffer' },
        (req, body, done) => {
            try {
                const json = JSON.parse(body.toString());
                done(null, json);
            } catch (err: any) {
                err.statusCode = 400;
                done(err, undefined);
            }
        }
    );

    // Initialize V1 repository and service (for webhook compatibility only)
    const repository = new BillingRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );
    const service = new BillingService(repository, stripeConfig.secretKey, logger);

    // Initialize V2 event publisher
    const v2EventPublisher = new V2EventPublisher(
        rabbitConfig.url,
        logger,
        baseConfig.serviceName
    );

    try {
        await v2EventPublisher.connect();
        logger.info('Billing V2 event publisher connected');
    } catch (error) {
        logger.warn({ err: error }, 'Failed to connect Billing V2 event publisher - continuing without events');
    }

    // Register V2 routes (plans, subscriptions, payouts)
    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey: dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        eventPublisher: v2EventPublisher,
    });

    // Register webhook routes (V1 - TODO: migrate to V2)
    registerWebhookRoutes(app, service, stripeConfig.webhookSecret);

    // Health check endpoint
    app.get('/health', async (request, reply) => {
        try {
            // Check database connectivity
            await repository.healthCheck();
            return reply.status(200).send({
                status: 'healthy',
                service: 'billing-service',
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            logger.error({ err: error }, 'Health check failed');
            return reply.status(503).send({
                status: 'unhealthy',
                service: 'billing-service',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down billing service');
        await v2EventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`Billing service listening on port ${baseConfig.port}`);
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
