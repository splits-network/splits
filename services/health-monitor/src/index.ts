import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRedisConfig,
    loadRabbitMQConfig,
    createSupabaseClient,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import {
    buildServer,
    errorHandler,
    registerHealthCheck,
    HealthCheckers,
} from "@splits-network/shared-fastify";
import { Redis } from 'ioredis';
import { loadServiceDefinitions } from "./config.js";
import { HealthChecker } from "./health-checker.js";
import { SlidingWindowManager } from "./sliding-window.js";
import { IncidentManager } from "./incident-manager.js";
import { NotificationManager } from "./notification-manager.js";
import { EventPublisher, OutboxPublisher, ResilientPublisher } from "./event-publisher.js";
import type { IEventPublisher } from "./event-publisher.js";
import { MonitorLoop } from "./monitor-loop.js";
import { registerHealthRoutes } from "./routes.js";

async function main() {
    const baseConfig = loadBaseConfig("health-monitor");
    const dbConfig = loadDatabaseConfig();
    const redisConfig = loadRedisConfig();
    const rabbitConfig = loadRabbitMQConfig();

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === "development" ? "debug" : "info",
        prettyPrint: baseConfig.nodeEnv === "development",
    });

    // Initialize Redis
    const redis = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
    });

    // Build Fastify server
    const app = await buildServer({
        logger,
        cors: { origin: true, credentials: true },
        disableRequestLogging: true,
    });
    app.setErrorHandler(errorHandler);

    // Load service definitions
    const serviceDefinitions = loadServiceDefinitions();
    const supabaseKey =
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey;

    if (!supabaseKey) {
        throw new Error(
            "Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY",
        );
    }
    const dryRun = process.env.DRY_RUN === "true";

    if (dryRun) {
        logger.info(
            "DRY_RUN mode enabled - health checks and Redis will run, but database writes are disabled",
        );
    }

    // Initialize components
    const healthChecker = new HealthChecker(serviceDefinitions, logger);
    const slidingWindow = new SlidingWindowManager(
        redis,
        serviceDefinitions,
        logger,
    );

    // Initialize event publisher (skip entirely in dry-run)
    let resilientPublisher: IEventPublisher | null = null;
    let rawEventPublisher: EventPublisher | null = null;
    if (!dryRun) {
        const eventPublisher = new EventPublisher(
            rabbitConfig.url,
            logger,
            baseConfig.serviceName,
        );
        rawEventPublisher = eventPublisher;
        try {
            await eventPublisher.connect();
        } catch (error) {
            logger.warn({ err: error }, "Failed to connect event publisher - ResilientPublisher will use outbox only");
        }

        const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });
        const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);
        resilientPublisher = new ResilientPublisher(eventPublisher, outboxPublisher, logger);
    }

    // In dry-run mode, skip DB-dependent managers (no reads or writes to staging)
    let incidentManager: IncidentManager | null = null;
    let notificationManager: NotificationManager | null = null;

    if (!dryRun) {
        incidentManager = new IncidentManager(
            dbConfig.supabaseUrl,
            supabaseKey,
            logger,
        );
        await incidentManager.initialize();

        notificationManager = new NotificationManager(
            dbConfig.supabaseUrl,
            supabaseKey,
            logger,
            resilientPublisher,
        );
        await notificationManager.initialize();
    }

    // Start the monitoring loop
    const monitorLoop = new MonitorLoop(
        healthChecker,
        slidingWindow,
        incidentManager,
        notificationManager,
        resilientPublisher,
        dbConfig.supabaseUrl,
        supabaseKey,
        logger,
        dryRun,
    );
    monitorLoop.start();

    // Register V3 API routes for system health, incidents, and status contact
    registerHealthRoutes(app, {
        redis,
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: resilientPublisher,
    });

    // Register health check for the health-monitor itself
    registerHealthCheck(app, {
        serviceName: "health-monitor",
        logger,
        checkers: {
            redis: HealthCheckers.redis(redis),
            ...(rawEventPublisher && {
                rabbitmq_publisher:
                    HealthCheckers.rabbitMqPublisher(rawEventPublisher),
            }),
        },
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down gracefully");
        monitorLoop.stop();
        await redis.quit();
        if (rawEventPublisher) await rawEventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Start server
    const HOST = process.env.HOST || "0.0.0.0";
    try {
        await app.listen({ port: baseConfig.port, host: HOST });
        logger.info(
            { port: baseConfig.port, host: HOST, env: baseConfig.nodeEnv },
            "Health monitor service started",
        );
    } catch (err) {
        logger.error(err);
        monitorLoop.stop();
        await redis.quit();
        if (rawEventPublisher) await rawEventPublisher.close();
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Failed to start health-monitor:", error);
    process.exit(1);
});
