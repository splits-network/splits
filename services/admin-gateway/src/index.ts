import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRedisConfig,
    getEnvOrThrow,
    createSupabaseClient,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import {
    buildServer,
    errorHandler,
    setupProcessErrorHandlers,
} from "@splits-network/shared-fastify";
import rateLimit from "@fastify/rate-limit";
import Redis from "ioredis";
import { AdminAuthMiddleware } from "./auth";
import { registerAdminRoutes } from "./routes";
import { setupRealtimeServer } from "./realtime";

async function main() {
    // Set PORT default before loadBaseConfig reads it (admin-gateway uses 3030, not the 3000 default)
    if (!process.env.PORT) {
        process.env.PORT = "3030";
    }
    const baseConfig = loadBaseConfig("admin-gateway");
    const dbConfig = loadDatabaseConfig();
    const redisConfig = loadRedisConfig();

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === "development" ? "debug" : "info",
        prettyPrint: baseConfig.nodeEnv === "development",
    });

    setupProcessErrorHandlers({ logger });

    // Admin gateway uses its own Clerk instance — read directly (not via loadClerkConfig
    // which reads CLERK_SECRET_KEY; admin uses ADMIN_CLERK_SECRET_KEY)
    const adminClerkSecretKey =
        baseConfig.nodeEnv === "production"
            ? getEnvOrThrow("ADMIN_CLERK_SECRET_KEY")
            : (process.env.ADMIN_CLERK_SECRET_KEY ?? "");

    if (!adminClerkSecretKey) {
        logger.warn(
            "ADMIN_CLERK_SECRET_KEY not set — auth will fail for all requests",
        );
    }

    const supabaseServiceRoleKey = dbConfig.supabaseServiceRoleKey;
    if (!supabaseServiceRoleKey) {
        throw new Error(
            "SUPABASE_SERVICE_ROLE_KEY is required for admin-gateway",
        );
    }

    const redis = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
    });

    const supabase = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseServiceRoleKey });

    const authMiddleware = new AdminAuthMiddleware(
        adminClerkSecretKey,
        dbConfig.supabaseUrl,
        supabaseServiceRoleKey,
    );

    // CORS configuration — supports comma-separated origins in production
    const allowedOrigins =
        baseConfig.nodeEnv === "production"
            ? (process.env.CORS_ORIGIN || "").split(",").filter(Boolean)
            : process.env.CORS_ORIGIN || "http://localhost:3200";

    const app = await buildServer({
        logger,
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
        disableRequestLogging: true,
    });

    app.setErrorHandler(errorHandler);

    await app.register(rateLimit as any, {
        max: 100,
        timeWindow: "1 minute",
        redis,
        keyGenerator: (req: any) => {
            const auth = req.headers["authorization"];
            return auth ? `admin-auth:${auth.slice(-16)}` : req.ip;
        },
    });

    // Auth hook — enforces isPlatformAdmin on all routes except /health
    app.addHook("onRequest", async (request, reply) => {
        if (
            request.url === "/health" ||
            request.url.startsWith("/health?") ||
            request.url.startsWith("/ws")
        ) {
            return;
        }
        await authMiddleware.createMiddleware()(request, reply);
    });

    const services: Record<string, string> = {
        identity: process.env.IDENTITY_SERVICE_URL || "http://localhost:3001",
        ats: process.env.ATS_SERVICE_URL || "http://localhost:3002",
        network: process.env.NETWORK_SERVICE_URL || "http://localhost:3003",
        billing: process.env.BILLING_SERVICE_URL || "http://localhost:3004",
        notification:
            process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3005",
        document: process.env.DOCUMENT_SERVICE_URL || "http://localhost:3006",
        automation:
            process.env.AUTOMATION_SERVICE_URL || "http://localhost:3007",
        "document-processing":
            process.env.DOCUMENT_PROCESSING_SERVICE_URL ||
            "http://localhost:3008",
        ai: process.env.AI_SERVICE_URL || "http://localhost:3009",
        analytics: process.env.ANALYTICS_SERVICE_URL || "http://localhost:3010",
        content: process.env.CONTENT_SERVICE_URL || "http://localhost:3015",
        integration:
            process.env.INTEGRATION_SERVICE_URL || "http://localhost:3016",
        matching: process.env.MATCHING_SERVICE_URL || "http://localhost:3017",
        support:
            process.env.SUPPORT_SERVICE_URL || "http://localhost:3021",
    };

    await registerAdminRoutes(app, services);

    app.get("/health", async () => ({
        status: "healthy",
        service: "admin-gateway",
        timestamp: new Date().toISOString(),
    }));

    // Graceful shutdown
    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down gracefully");
        await redis.quit();
        await app.close();
        process.exit(0);
    });

    try {
        await app.listen({ port: baseConfig.port, host: "0.0.0.0" });
        logger.info(`Admin Gateway listening on port ${baseConfig.port}`);

        // Attach WebSocket server for real-time admin updates
        setupRealtimeServer(
            app.server,
            {
                clerkSecretKey: adminClerkSecretKey,
                supabaseUrl: dbConfig.supabaseUrl,
                supabaseServiceRoleKey: supabaseServiceRoleKey,
            },
            redis,
        );
    } catch (err) {
        logger.error(err);
        await redis.quit();
        process.exit(1);
    }
}

main();
