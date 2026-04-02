import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    loadRedisConfig,
    createSupabaseClient,
} from "@splits-network/shared-config";
import { Redis } from "ioredis";
import { AiClient } from "@splits-network/shared-ai-client";
import { createLogger } from "@splits-network/shared-logging";
import {
    buildServer,
    errorHandler,
    registerHealthCheck,
    setupProcessErrorHandlers
} from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { EventPublisher, OutboxPublisher, ResilientPublisher } from "./v2/shared/events.js";
import { registerV2Routes } from "./v2/routes.js";
import { registerV3Routes } from "./v3/routes.js";
import { DomainEventConsumer } from "./v3/shared/domain-consumer.js";
import { AIReviewRepository } from "./v2/reviews/repository.js";
import { AIReviewServiceV2 } from "./v2/reviews/service.js";
import { ResumeExtractionService } from "./v2/resume-extraction/service.js";
import { ResumeExtractionRepository } from "./v2/resume-extraction/repository.js";
import { CallPipelineRepository } from "./v2/call-pipeline/repository.js";
import { CallPipelineService } from "./v2/call-pipeline/service.js";
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
    const baseConfig = loadBaseConfig("ai-service");
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const supabaseKey = dbConfig.supabaseServiceRoleKey ?? dbConfig.supabaseAnonKey;

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

    // Register process-level error handlers as early as possible.
    // For uncaughtException / unhandledRejection: logs the full error, flushes
    // Sentry so the event is not lost, then exits with code 1.
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
        disableRequestLogging: true, // Eliminate health check noise
    });

    app.setErrorHandler(errorHandler);

    // Capture per-request errors with route context.
    // Sentry.captureException is a no-op when Sentry was not initialized.
    app.addHook("onError", async (request, reply, error) => {
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error, {
                tags: { service: baseConfig.serviceName },
                extra: { path: request.url, method: request.method },
            });
        }
    });

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

    // Initialize V2 event publisher (non-fatal — ResilientPublisher falls back to outbox)
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

    // Initialize AI review repository
    const reviewRepository = new AIReviewRepository(
        dbConfig.supabaseUrl,
        supabaseKey,
    );

    // Create Supabase client (needed for outbox + health check)
    const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

    // Initialize Redis + AI client for provider-agnostic AI calls
    const redisConfig = loadRedisConfig();
    const redis = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
        db: redisConfig.db || 0,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
    });
    try {
        await redis.connect();
    } catch (err) {
        logger.warn({ err }, 'Redis connection failed — AI config will use DB/env fallback');
    }

    const aiClient = new AiClient({
        supabase: supabaseClient,
        redis,
        serviceName: 'ai-service',
        logger,
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        anthropicApiKey: process.env.ANTHROPIC_API_KEY || undefined,
    });

    // Set up transactional outbox for durable event delivery
    const outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);

    // Resilient publisher: tries RabbitMQ first, falls back to outbox
    const resilientPublisher = new ResilientPublisher(eventPublisher, outboxPublisher, logger);

    // Initialize AI review service (needed for domain consumer)
    const aiReviewService = new AIReviewServiceV2(
        reviewRepository,
        resilientPublisher,
        logger,
        aiClient,
    );

    // Register V2 routes (passing the same service instance)
    registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: resilientPublisher,
        logger,
        aiReviewService, // Pass the service instance so routes use the same one
    });

    registerV3Routes(app, {
        supabase: supabaseClient,
        eventPublisher: resilientPublisher,
        aiClient,
    });

    // Initialize resume extraction service and repository
    const resumeExtractionService = new ResumeExtractionService(logger, aiClient);
    const resumeExtractionRepository = new ResumeExtractionRepository(supabaseClient, logger);

    // Initialize generalized call pipeline
    const callPipelineRepository = new CallPipelineRepository(supabaseClient, logger);
    const callPipelineService = new CallPipelineService(
        callPipelineRepository,
        resilientPublisher,
        logger,
        aiClient,
    );

    // Initialize V3 domain event consumer (listens for application + document + call recording events)
    let domainConsumer: DomainEventConsumer | null = null;
    try {
        domainConsumer = new DomainEventConsumer({
            rabbitMqUrl: rabbitConfig.url,
            supabase: supabaseClient,
            aiReviewService,
            resumeExtractionService,
            resumeExtractionRepository,
            callPipelineService: callPipelineService,
            eventPublisher: resilientPublisher,
            logger,
        });
        await domainConsumer.connect();
        logger.info("V3 domain event consumer connected and listening for events");
    } catch (error) {
        logger.error({ err: error }, "Failed to connect domain event consumer");
    }

    // Register standardized health check
    registerHealthCheck(app, {
        serviceName: 'ai-service',
        logger,
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
            await redis.quit().catch(() => {});
        } finally {
            process.exit(0);
        }
    });
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
