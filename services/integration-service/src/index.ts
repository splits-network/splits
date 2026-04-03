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
import { getCryptoService } from "@splits-network/shared-config/src/crypto";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { registerV3Routes } from "./v3/routes.js";
// V2 legacy routes — only register resources that still serve /api/v2/ paths
import { registerProviderRoutes as registerV2ProviderRoutes } from "./v2/providers/routes.js";
import { registerConnectionRoutes as registerV2ConnectionRoutes } from "./v2/connections/routes.js";
import { registerATSRoutes as registerV2ATSRoutes } from "./v2/ats/routes.js";
import {
    EventPublisher,
    OutboxPublisher,
    ResilientPublisher,
} from "./v2/shared/events.js";
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
    const baseConfig = loadBaseConfig("integration-service");
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
                title: "Integration Service API",
                description:
                    "OAuth connections and third-party integration management",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3016",
                    description: "Development server",
                },
            ],
            tags: [
                {
                    name: "providers",
                    description: "Integration provider catalog",
                },
                {
                    name: "connections",
                    description: "OAuth connections management",
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

    const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

    const outboxPublisher = new OutboxPublisher(
        supabaseClient,
        baseConfig.serviceName,
        logger,
    );

    // Resilient publisher: tries direct RabbitMQ first, falls back to outbox
    const resilientPublisher = new ResilientPublisher(eventPublisher, outboxPublisher, logger);

    const crypto = await getCryptoService();
    logger.info("Encryption service initialized from Vault");

    // V2 legacy routes — only register resources that still serve /api/v2/ paths
    // Calendar, email, LinkedIn, call-calendar routes now registered via V3 (shared SupabaseClient)
    await registerV2ProviderRoutes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
    });

    await registerV2ConnectionRoutes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: resilientPublisher,
        logger,
        crypto,
    });

    await registerV2ATSRoutes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: resilientPublisher,
        logger,
        crypto,
    });

    registerV3Routes(app, {
        supabase: supabaseClient,
        eventPublisher: resilientPublisher,
        logger,
        crypto,
    });

    app.get("/health", async () => ({
        status: "healthy",
        service: "integration-service",
        timestamp: new Date().toISOString(),
    }));

    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down gracefully");
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });

    try {
        await app.listen({ port: baseConfig.port, host: "0.0.0.0" });
        logger.info(`Integration service listening on port ${baseConfig.port}`);
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
