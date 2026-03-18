import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import { buildServer, errorHandler, setupProcessErrorHandlers } from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { registerV2Routes } from "./v2/routes";
import { registerV3Routes } from "./v3/routes";
import { EventPublisher, OutboxPublisher, OutboxWorker } from "./v2/shared/events";
import { CallScheduler } from "./v2/scheduler";
import { SchedulerRepository } from "./v2/scheduler-repository";
import * as Sentry from "@sentry/node";

// Initialize Sentry at module level so startup errors are captured before main() runs
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? "development",
        release: process.env.SENTRY_RELEASE,
        tracesSampleRate: 0.1,
    });
}

async function main() {
    const baseConfig = loadBaseConfig("call-service");
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const supabaseKey = dbConfig.supabaseServiceRoleKey ?? dbConfig.supabaseAnonKey;

    if (!supabaseKey) {
        throw new Error(
            "Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY",
        );
    }

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === "development" ? "debug" : "info",
        prettyPrint: baseConfig.nodeEnv === "development",
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

    app.addHook("onError", async (request, reply, error) => {
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
                title: "Call Service API",
                description: "Internal call management service for Splits Network",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3020",
                    description: "Development server",
                },
            ],
            tags: [
                {
                    name: "calls",
                    description: "Call lifecycle management",
                },
            ],
        },
    });

    await app.register(swaggerUi as any, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "list",
            deepLinking: true,
        },
    });

    const eventPublisher = new EventPublisher(
        rabbitConfig.url,
        logger,
        baseConfig.serviceName,
    );
    await eventPublisher.connect();

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(
        dbConfig.supabaseUrl,
        supabaseKey,
    );

    const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);
    const outboxWorker = new OutboxWorker(supabaseClient, eventPublisher, baseConfig.serviceName, logger);
    outboxWorker.start();
    logger.info('Outbox worker started - events will be durably delivered');

    const livekitApiKey = process.env.LIVEKIT_API_KEY || '';
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET || '';
    const livekitWsUrl = process.env.LIVEKIT_WS_URL || '';

    if (!livekitApiKey || !livekitApiSecret) {
        logger.warn('LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set - token generation will fail');
    }

    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        rabbitMqUrl: rabbitConfig.url,
        eventPublisher: outboxPublisher,
        livekitApiKey,
        livekitApiSecret,
        livekitWsUrl,
    });

    registerV3Routes(app, {
        supabase: supabaseClient,
        eventPublisher: outboxPublisher,
        livekitApiKey,
        livekitApiSecret,
    });

    // ── Scheduler ─────────────────────────────────────────────────────
    const schedulerRepo = new SchedulerRepository(supabaseClient);
    const scheduler = new CallScheduler(schedulerRepo, outboxPublisher, logger);
    scheduler.start();
    logger.info('Call scheduler started - reminders, timeouts, no-shows');

    app.addHook('onClose', () => scheduler.stop());

    app.get("/health", async (request, reply) => {
        return reply.status(200).send({
            status: "healthy",
            service: "call-service",
            rabbitmq_connected: eventPublisher.isConnected(),
            timestamp: new Date().toISOString(),
        });
    });

    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down gracefully");
        scheduler.stop();
        outboxWorker.stop();
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });

    try {
        await app.listen({ port: baseConfig.port, host: "0.0.0.0" });
        logger.info(`Call service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        outboxWorker.stop();
        await eventPublisher.close();
        process.exit(1);
    }
}

main();
