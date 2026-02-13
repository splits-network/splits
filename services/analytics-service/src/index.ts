import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { createClient } from "@supabase/supabase-js";
import { loadConfig } from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import { CacheManager } from "./cache/cache-manager";
import { CacheInvalidator } from "./cache/invalidation";
import { registerV2Routes } from "./v2/routes";
import { DomainEventConsumer } from "./consumers/domain-consumer";
import { DashboardEventPublisher } from "./v2/shared/dashboard-events";
import { startBackgroundJobs } from "./jobs";
import { ActivityService } from "./v2/activity/service";
import { ActivityPublisher } from "./v2/activity/publisher";
import Redis from "ioredis";

const logger = createLogger("AnalyticsService");

// Load configuration
const config = loadConfig();

// Initialize Supabase client (using public schema - access analytics via RPC)
const supabase: any = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
        auth: { persistSession: false },
    },
);

// Initialize Redis cache
const cache = new CacheManager({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
});

// Initialize cache invalidator
const cacheInvalidator = new CacheInvalidator(cache);

// Initialize Fastify server
const app = Fastify({
    logger: true,
    requestIdHeader: "x-request-id",
    disableRequestLogging: true, // Eliminate health check noise
});

// Register CORS
app.register(cors, {
    origin: true,
    credentials: true,
});

// Register Swagger
app.register(swagger, {
    swagger: {
        info: {
            title: "Analytics Service API",
            description:
                "Event-driven analytics, metrics, and chart data endpoints",
            version: "1.0.0",
        },
        host: config.apiUrl || "localhost:3007",
        schemes: ["http", "https"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
            { name: "metrics", description: "User/company stats endpoints" },
            { name: "charts", description: "Chart data endpoints" },
            {
                name: "marketplace-health",
                description: "Platform health metrics",
            },
            { name: "admin", description: "Admin endpoints" },
        ],
    },
});

app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
        docExpansion: "list",
        deepLinking: false,
    },
});

// Skip request logging for health checks and docs to reduce noise
app.addHook("onRequest", async (request, reply) => {
    if (request.url === "/health" || request.url.includes("/docs")) {
        request.log = {
            ...request.log,
            info: () => {},
            debug: () => {},
            trace: () => {},
        } as any;
    }
});

// Health check endpoint
app.get("/health", async (request, reply) => {
    return reply.send({
        status: "healthy",
        service: "analytics-service",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});

// Create a Redis data client for presence queries (reads presence:user:* keys set by chat-gateway)
const redisData = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

// Create ActivityService at the top level so it's accessible outside the plugin scope
const activityService = new ActivityService(redisData);

// Register V2 routes (routes include full /api/v2 paths since API Gateway forwards them)
app.register(registerV2Routes, {
    supabase,
    cache,
    config,
    redis: redisData,
    activityService,
});

// Initialize event consumer and activity publisher
let eventConsumer: DomainEventConsumer | null = null;
let activityPublisher: ActivityPublisher | null = null;

async function startServer() {
    try {
        // Start Fastify server
        const port = Number(process.env.PORT || 3010);
        await app.listen({ port, host: "0.0.0.0" });
        logger.info(`Analytics service started on port ${port}`);

        // Start event consumer
        eventConsumer = new DomainEventConsumer(
            process.env.RABBITMQ_URL || "amqp://localhost",
            supabase,
            cache,
            cacheInvalidator,
        );

        // Wire dashboard event publisher for real-time WebSocket updates
        const pubRedis = new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        });
        eventConsumer.setDashboardPublisher(new DashboardEventPublisher(pubRedis));

        await eventConsumer.connect();
        await eventConsumer.start();
        logger.info("Event consumer started and listening for domain events");

        // Start background jobs
        startBackgroundJobs(supabase, cache, redisData);
        logger.info("Background aggregation jobs started");

        // Start activity publisher (15s interval pushing online counts via WebSocket)
        activityPublisher = new ActivityPublisher(activityService, pubRedis);
        activityPublisher.start();
        logger.info("Activity publisher started");
    } catch (error) {
        logger.error({ error }, "Failed to start analytics service");
        process.exit(1);
    }
}

// Graceful shutdown
async function shutdown() {
    logger.info("Shutting down analytics service...");

    try {
        // Stop activity publisher
        if (activityPublisher) {
            activityPublisher.stop();
            logger.info("Activity publisher stopped");
        }

        // Close event consumer
        if (eventConsumer) {
            await eventConsumer.close();
            logger.info("Event consumer closed");
        }

        // Close Redis connection
        await cache.close();
        logger.info("Redis connection closed");

        // Close Fastify server
        await app.close();
        logger.info("Fastify server closed");

        process.exit(0);
    } catch (error) {
        logger.error({ error }, "Error during shutdown");
        process.exit(1);
    }
}

// Handle shutdown signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start the server
startServer();
