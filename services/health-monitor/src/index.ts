import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRedisConfig,
    loadRabbitMQConfig,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import {
    buildServer,
    errorHandler,
    registerHealthCheck,
    HealthCheckers,
} from "@splits-network/shared-fastify";
import Redis from "ioredis";
import { loadServiceDefinitions } from "./config";
import { HealthChecker } from "./health-checker";
import { SlidingWindowManager } from "./sliding-window";
import { IncidentManager } from "./incident-manager";
import { NotificationManager } from "./notification-manager";
import { EventPublisher } from "./event-publisher";
import { MonitorLoop } from "./monitor-loop";

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

    // Initialize components
    const healthChecker = new HealthChecker(serviceDefinitions, logger);
    const slidingWindow = new SlidingWindowManager(
        redis,
        serviceDefinitions,
        logger,
    );
    const incidentManager = new IncidentManager(
        dbConfig.supabaseUrl,
        supabaseKey,
        logger,
    );
    await incidentManager.initialize();

    const notificationManager = new NotificationManager(
        dbConfig.supabaseUrl,
        supabaseKey,
        logger,
    );
    await notificationManager.initialize();

    // Initialize optional event publisher
    let eventPublisher: EventPublisher | null = null;
    try {
        eventPublisher = new EventPublisher(
            rabbitConfig.url,
            logger,
            baseConfig.serviceName,
        );
        await eventPublisher.connect();
    } catch (error) {
        logger.warn(
            { err: error },
            "RabbitMQ unavailable - events will not be published",
        );
        eventPublisher = null;
    }

    // Start the monitoring loop
    const monitorLoop = new MonitorLoop(
        healthChecker,
        slidingWindow,
        incidentManager,
        notificationManager,
        eventPublisher,
        dbConfig.supabaseUrl,
        supabaseKey,
        logger,
    );
    monitorLoop.start();

    // Register health check for the health-monitor itself
    registerHealthCheck(app, {
        serviceName: "health-monitor",
        logger,
        checkers: {
            redis: HealthCheckers.redis(redis),
            ...(eventPublisher && {
                rabbitmq_publisher:
                    HealthCheckers.rabbitMqPublisher(eventPublisher),
            }),
        },
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down gracefully");
        monitorLoop.stop();
        await redis.quit();
        if (eventPublisher) await eventPublisher.close();
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
        if (eventPublisher) await eventPublisher.close();
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Failed to start health-monitor:", error);
    process.exit(1);
});
