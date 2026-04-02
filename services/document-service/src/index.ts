import { buildServer, errorHandler, registerHealthCheck } from "@splits-network/shared-fastify";
import { createLogger } from "@splits-network/shared-logging";
import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    createSupabaseClient,
} from "@splits-network/shared-config";
import { StorageClient } from "./storage.js";
import { registerV2Routes } from "./v2/routes.js";
import { registerV3Routes } from "./v3/routes.js";
import { EventPublisher, OutboxPublisher, ResilientPublisher } from "./v2/shared/events.js";

async function start() {
    let eventPublisher: EventPublisher | null = null;
    try {
        const baseConfig = loadBaseConfig("document-service");
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
            supabaseKey,
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
        const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

        // Set up transactional outbox for durable event delivery
        const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);

        // Resilient publisher: tries direct RabbitMQ first, falls back to outbox
        const resilientPublisher = new ResilientPublisher(eventPublisher, outboxPublisher, logger);

        // Register V2 routes
        await registerV2Routes(fastify, {
            supabaseUrl: dbConfig.supabaseUrl,
            supabaseKey,
            storage,
            eventPublisher: resilientPublisher,
        });

        // Register V3 routes (coexist with V2)
        registerV3Routes(fastify, {
            supabase: supabaseClient,
            eventPublisher: resilientPublisher,
        });

        // Register standardized health check
        registerHealthCheck(fastify, {
            serviceName: 'document-service',
            logger,
        });

        process.on("SIGTERM", async () => {
            logger.info(
                "SIGTERM received, shutting down document-service gracefully",
            );
            try {
                await fastify.close();
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
