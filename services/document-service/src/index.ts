import { buildServer, errorHandler, registerHealthCheck, HealthCheckers } from "@splits-network/shared-fastify";
import { createLogger } from "@splits-network/shared-logging";
import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
} from "@splits-network/shared-config";
import { StorageClient } from "./storage.js";
import { registerV2Routes } from "./v2/routes.js";
import { EventPublisher, OutboxPublisher, OutboxWorker } from "./v2/shared/events.js";

async function start() {
    let eventPublisher: EventPublisher | null = null;
    let outboxWorker: OutboxWorker | null = null;
    try {
        const baseConfig = loadBaseConfig("document-service");
        const dbConfig = loadDatabaseConfig();
        const rabbitConfig = loadRabbitMQConfig();

        const logger = createLogger({
            serviceName: baseConfig.serviceName,
            level: baseConfig.nodeEnv === "development" ? "debug" : "info",
            prettyPrint: baseConfig.nodeEnv === "development",
        });

        const fastify = await buildServer({
            logger,
            cors: {
                origin: true,
                credentials: true,
            },
            disableRequestLogging: true, // Eliminate health check noise
        });

        // Set error handler
        fastify.setErrorHandler(errorHandler);

        // Initialize storage
        const storage = new StorageClient(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        );

        // Ensure storage buckets exist (development)
        if (baseConfig.nodeEnv === "development") {
            logger.info("Ensuring storage buckets exist...");
            await storage.ensureBucketsExist();
        }

        eventPublisher = new EventPublisher(
            rabbitConfig.url,
            logger,
            baseConfig.serviceName,
        );
        await eventPublisher.connect();

        // Skip request logging for health checks to reduce noise
        fastify.addHook("onRequest", async (request, reply) => {
            if (request.url === "/health") {
                request.log = {
                    ...request.log,
                    info: () => { },
                    debug: () => { },
                    trace: () => { },
                } as any;
            }
        });

        // Create Supabase client (needed for outbox + health check)
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseClient = createClient(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
        );

        // Set up transactional outbox for durable event delivery
        const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);
        outboxWorker = new OutboxWorker(supabaseClient, eventPublisher!, baseConfig.serviceName, logger);
        outboxWorker.start();
        logger.info('📤 Outbox worker started - events will be durably delivered');

        // Register V2 routes
        await registerV2Routes(fastify, {
            supabaseUrl: dbConfig.supabaseUrl,
            supabaseKey:
                dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
            storage,
            eventPublisher: outboxPublisher,
        });

        // Register standardized health check
        registerHealthCheck(fastify, {
            serviceName: 'document-service',
            logger,
            checkers: {
                database: HealthCheckers.database(supabaseClient),
                ...(eventPublisher && {
                    rabbitmq_publisher: HealthCheckers.rabbitMqPublisher(eventPublisher)
                }),
                storage: HealthCheckers.externalProvider('storage', async (signal) => {
                    // Uses externalProvider so a Supabase Storage outage caps status at
                    // 'degraded' rather than 'unhealthy' — a pod restart can't fix a
                    // storage-side outage, it would just cause a crash-loop.
                    return await storage.healthCheck();
                }, { provider: 'supabase-storage' }),
            },
        });

        process.on("SIGTERM", async () => {
            logger.info(
                "SIGTERM received, shutting down document-service gracefully",
            );
            try {
                await fastify.close();
                outboxWorker?.stop();
                if (eventPublisher) {
                    await eventPublisher.close();
                }
            } finally {
                process.exit(0);
            }
        });

        // Start server
        await fastify.listen({
            port: baseConfig.port,
            host: "0.0.0.0",
        });

        logger.info(`Document service listening on port ${baseConfig.port}`);
    } catch (error) {
        console.error("Failed to start document service", error);
        outboxWorker?.stop();
        if (eventPublisher) {
            try {
                await eventPublisher.close();
            } catch {
                // ignore close errors
            }
        }
        process.exit(1);
    }
}

start();
