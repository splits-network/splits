import { loadBaseConfig, loadDatabaseConfig, loadStripeConfig, loadRabbitMQConfig, getEnvOrThrow } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerWebhookRoutes } from './routes/webhooks/routes';
import { registerV2Routes } from './v2/routes';
import { EventPublisher as V2EventPublisher, OutboxPublisher, OutboxWorker } from './v2/shared/events';
import { BillingEventConsumer } from './events/placement-consumer';
import { PlacementSnapshotRepository } from './v2/placement-snapshot/repository';
import { PlacementSnapshotService } from './v2/placement-snapshot/service';
import { WebhookServiceV2 } from './v2/webhooks/service';
import { createClient } from '@supabase/supabase-js';
import { WebhookEventRepository } from './v2/webhook-events/repository';
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
    const baseConfig = loadBaseConfig('billing-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const stripeConfig = loadStripeConfig();
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
    // Store the raw buffer on the request for signature verification
    app.addContentTypeParser(
        'application/json',
        { parseAs: 'buffer' },
        (req, body, done) => {
            try {
                // Store raw body for Stripe webhook signature verification
                (req as any).rawBody = body;
                const json = JSON.parse(body.toString());
                done(null, json);
            } catch (err: any) {
                err.statusCode = 400;
                done(err, undefined);
            }
        }
    );

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

    // Initialize placement snapshot domain and event consumer
    const supabase = createClient(
        dbConfig.supabaseUrl,
        supabaseKey
    );
    const snapshotRepository = new PlacementSnapshotRepository(supabase);

    // Set up transactional outbox for durable event delivery
    const outboxPublisher = new OutboxPublisher(supabase, baseConfig.serviceName, logger);
    const outboxWorker = new OutboxWorker(supabase, v2EventPublisher, baseConfig.serviceName, logger);
    outboxWorker.start();
    logger.info('📤 Outbox worker started - events will be durably delivered');

    // Register V2 routes (plans, subscriptions, payouts, splits-rates)
    const v2Services = await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: outboxPublisher,
    });

    // Create snapshot service with DB-driven rates (must be after V2 routes init)
    const snapshotService = new PlacementSnapshotService(snapshotRepository, v2Services.splitsRateService, supabase);

    // Phase 6: Initialize billing event consumer with payout service
    const systemUserId = getEnvOrThrow('SYSTEM_USER_ID');
    const billingEventConsumer = new BillingEventConsumer(
        rabbitConfig.url,
        snapshotService,
        v2Services.payoutService,
        systemUserId,
        supabase,
        logger
    );

    // Track consumer connection status for health checks
    let billingEventConsumerConnected = false;

    try {
        await billingEventConsumer.connect();
        billingEventConsumerConnected = true;
        logger.info('Billing event consumer connected and listening');
    } catch (error) {
        billingEventConsumerConnected = false;
        logger.error({ err: error }, 'CRITICAL: Billing event consumer failed to connect - commission processing DISABLED');
    }

    // Initialize V2 webhook service with outbox publisher for durable domain events
    const webhookService = new WebhookServiceV2(supabase, logger, outboxPublisher, stripeConfig.secretKey);
    const webhookEventRepository = new WebhookEventRepository(supabase);
    registerWebhookRoutes(app, webhookService, stripeConfig.webhookSecret, webhookEventRepository);

    // Health check endpoint
    app.get('/health', async (request, reply) => {
        try {
            // Check database connectivity
            const { error: healthError } = await supabase.from('plans').select('id').limit(1);
            if (healthError) throw new Error(`Database health check failed: ${healthError.message}`);
            return reply.status(200).send({
                status: billingEventConsumerConnected ? 'healthy' : 'degraded',
                service: 'billing-service',
                timestamp: new Date().toISOString(),
                event_consumer: billingEventConsumerConnected ? 'connected' : 'disconnected',
            });
        } catch (error) {
            logger.error({ err: error }, 'Health check failed');
            return reply.status(503).send({
                status: 'unhealthy',
                service: 'billing-service',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
                event_consumer: billingEventConsumerConnected ? 'connected' : 'disconnected',
            });
        }
    });

    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down billing service');
        outboxWorker.stop();
        await billingEventConsumer.close();
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
