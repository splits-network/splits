import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    createSupabaseClient,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import {
    buildServer,
    errorHandler,
    setupProcessErrorHandlers,
} from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import multipart from "@fastify/multipart";
import { EventPublisher, OutboxPublisher, ResilientPublisher } from "./v2/shared/events.js";
import { registerV2Routes } from "./v2/routes.js";
import { registerV3Routes } from "./v3/routes.js";
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? "development",
        release: process.env.SENTRY_RELEASE,
        tracesSampleRate: 0.1,
    });
}

async function main() {
    const baseConfig = loadBaseConfig("content-service");
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const supabaseKey =
        dbConfig.supabaseServiceRoleKey ?? dbConfig.supabaseAnonKey;

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
                title: "Content Service API",
                description:
                    "CMS for structured page content with composable blocks",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3015",
                    description: "Development server",
                },
            ],
            tags: [{ name: "pages", description: "Content page management" }],
        },
    });

    await app.register(swaggerUi as any, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "list",
            deepLinking: true,
        },
    });

    // Register multipart support for image uploads
    await app.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        },
    });

    // Initialize event publisher (non-fatal — ResilientPublisher falls back to outbox)
    const eventPublisher = new EventPublisher(
        rabbitConfig.url,
        logger,
        baseConfig.serviceName,
    );
    try {
        await eventPublisher.connect();
    } catch (error) {
        logger.warn({ err: error }, "Failed to connect event publisher - ResilientPublisher will use outbox only");
    }

    const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });
    const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);
    const resilientPublisher = new ResilientPublisher(eventPublisher, outboxPublisher, logger);

    // Register V2 routes
    registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: resilientPublisher,
    });

    // Register V3 routes (coexist with V2)
    registerV3Routes(app, {
        supabase: supabaseClient,
        eventPublisher: resilientPublisher,
    });

    // Health check
    app.get("/health", async () => ({
        status: "healthy",
        service: "content-service",
        timestamp: new Date().toISOString(),
    }));

    // Graceful shutdown
    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down gracefully");
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: "0.0.0.0" });
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
