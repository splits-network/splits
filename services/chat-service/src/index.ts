import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    loadRedisConfig,
    createSupabaseClient,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import { buildServer, errorHandler, setupProcessErrorHandlers } from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { registerV2Routes } from "./v2/routes.js";
import { registerV3Routes } from "./v3/routes.js";
import { EventPublisher, OutboxPublisher, ResilientPublisher } from "./v2/shared/events.js";
import { ChatEventPublisher } from "./v3/shared/chat-event-publisher.js";
import { JobQueue } from "@splits-network/shared-job-queue";
import { Redis } from 'ioredis';
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
    const baseConfig = loadBaseConfig("chat-service");
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const redisConfig = loadRedisConfig();
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
        disableRequestLogging: true, // Eliminate health check noise
    });

    app.setErrorHandler(errorHandler);

    // Capture per-request errors with route context.
    // Sentry.captureException is a no-op when Sentry was not initialized.
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
                title: "Chat Service API",
                description: "Internal chat service for Splits Network",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3011",
                    description: "Development server",
                },
            ],
            tags: [
                {
                    name: "chat",
                    description: "Chat conversations and messages",
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

    // Create Supabase client for outbox
    const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

    // Set up transactional outbox for durable event delivery
    const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);

    // Resilient publisher: tries direct RabbitMQ first, falls back to outbox
    const resilientPublisher = new ResilientPublisher(eventPublisher, outboxPublisher, logger);

    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        rabbitMqUrl: rabbitConfig.url,
        redisConfig,
        eventPublisher: resilientPublisher,
    });

    // Create Redis client for V3 real-time chat events
    const v3Redis = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
    });
    const chatEventPublisher = new ChatEventPublisher(v3Redis);

    // Create attachment scan queue for V3 attachments
    const v3AttachmentQueue = new JobQueue({
        rabbitMqUrl: rabbitConfig.url,
        queueName: "chat-attachment-scan",
        logger: logger as any,
    });
    await v3AttachmentQueue.connect();

    // Register V3 routes (coexist with V2)
    registerV3Routes(app, {
        supabase: supabaseClient,
        eventPublisher: resilientPublisher,
        chatEventPublisher,
        redis: v3Redis,
        attachmentQueue: v3AttachmentQueue,
    });

    app.get("/health", async () => ({
        status: "healthy",
        service: "chat-service",
        timestamp: new Date().toISOString(),
    }));

    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down gracefully");
        await chatEventPublisher.close();
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });

    try {
        await app.listen({ port: baseConfig.port, host: "0.0.0.0" });
        logger.info(`Chat service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        await chatEventPublisher.close();
        await eventPublisher.close();
        process.exit(1);
    }
}

main();
