import Fastify from "fastify";
import cors from "@fastify/cors";
import { createClient } from "@supabase/supabase-js";
import { loadConfig } from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import { registerV2Routes } from "./v2/routes";

const logger = createLogger("SearchService");

// Load configuration
const config = loadConfig();

// Initialize Supabase client
const supabase: any = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
        auth: { persistSession: false },
    },
);

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

// Skip request logging for health checks to reduce noise
app.addHook("onRequest", async (request, reply) => {
    if (request.url === "/health") {
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
        service: "search-service",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});

// Register V2 routes (routes include full /api/v2 paths since API Gateway forwards them)
app.register(registerV2Routes, {
    supabase,
});

async function startServer() {
    try {
        // Start Fastify server
        const port = Number(process.env.PORT || 3012);
        await app.listen({ port, host: "0.0.0.0" });
        logger.info(`Search service started on port ${port}`);
    } catch (error) {
        logger.error({ error }, "Failed to start search service");
        process.exit(1);
    }
}

// Graceful shutdown
async function shutdown() {
    logger.info("Shutting down search service...");

    try {
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
