import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import { buildServer, errorHandler } from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { EventPublisher } from "./v2/shared/events";
import { registerV2Routes } from "./v2/routes";
import { DomainEventConsumer } from "./domain-consumer";
import { AIReviewRepository } from "./v2/reviews/repository";
import { AIReviewServiceV2 } from "./v2/reviews/service";
import * as Sentry from "@sentry/node";

async function main() {
    const baseConfig = loadBaseConfig("ai-service");
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === "development" ? "debug" : "info",
        prettyPrint: baseConfig.nodeEnv === "development",
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

    // Initialize Sentry if DSN is provided
    const sentryDsn = process.env.SENTRY_DSN;
    if (sentryDsn) {
        Sentry.init({
            dsn: sentryDsn,
            environment: baseConfig.nodeEnv,
            release: process.env.SENTRY_RELEASE,
            tracesSampleRate: 0.1,
        });

        app.addHook("onError", async (request, reply, error) => {
            Sentry.captureException(error, {
                tags: { service: baseConfig.serviceName },
                extra: { path: request.url, method: request.method },
            });
        });
    }

    // Register Swagger
    await app.register(swagger as any, {
        openapi: {
            info: {
                title: "AI Service API",
                description:
                    "AI-powered features - reviews, matching, fraud detection",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3009",
                    description: "Development server",
                },
            ],
            tags: [
                {
                    name: "ai-reviews",
                    description: "AI-powered candidate-job fit reviews",
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

    // Initialize V2 event publisher
    let eventPublisher: EventPublisher | null = null;
    try {
        eventPublisher = new EventPublisher(
            rabbitConfig.url,
            logger,
            baseConfig.serviceName,
        );
        await eventPublisher.connect();
    } catch (error) {
        logger.error({ err: error }, "Failed to connect event publisher");
    }

    // Initialize AI review service (needed for domain consumer)
    const reviewRepository = new AIReviewRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
    );
    const aiReviewService = new AIReviewServiceV2(
        reviewRepository,
        eventPublisher || undefined,
        logger,
    );

    // Register V2 routes (passing the same service instance)
    registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey:
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        eventPublisher: eventPublisher || undefined,
        logger,
        aiReviewService, // Pass the service instance so routes use the same one
    });

    // Initialize domain event consumer (listens for application events)
    let domainConsumer: DomainEventConsumer | null = null;
    try {
        domainConsumer = new DomainEventConsumer(
            rabbitConfig.url,
            aiReviewService,
            logger,
        );
        await domainConsumer.connect();
        logger.info("Domain event consumer connected and listening for events");
    } catch (error) {
        logger.error({ err: error }, "Failed to connect domain event consumer");
    }

    // Health check
    app.get("/health", async (request, reply) => {
        return reply.send({
            status: "healthy",
            service: "ai-service",
            timestamp: new Date().toISOString(),
        });
    });

    // Start server
    try {
        const port = Number(process.env.PORT) || 3009;
        await app.listen({ port, host: "0.0.0.0" });
        logger.info(`AI Service listening on port ${port}`);
        logger.info(`Swagger docs available at http://localhost:${port}/docs`);
    } catch (error) {
        logger.error({ err: error }, "Failed to start server");
        process.exit(1);
    }

    // Graceful shutdown
    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down ai-service gracefully");
        try {
            await app.close();
            if (domainConsumer) {
                await domainConsumer.close();
            }
            if (eventPublisher) {
                await eventPublisher.close();
            }
        } finally {
            process.exit(0);
        }
    });
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
