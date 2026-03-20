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
    registerHealthCheck,
    setupProcessErrorHandlers,
} from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
    EventPublisher,
    OutboxPublisher,
} from "./v2/shared/events";
import { registerV2Routes } from "./v2/routes";
import { registerV3Routes } from "./v3/routes";
import { DomainEventConsumer } from "./domain-consumer";
import { MatchRepository } from "./v2/matches/repository";
import { EmbeddingService } from "./v2/embeddings/service";
import { EmbeddingRepository } from "./v2/embeddings/repository";
import { MatchingOrchestrator } from "./v2/matches/matching-orchestrator";
import { MatchRepository as V3MatchRepository } from "./v3/matches/repository";
import { MatchingOrchestrator as V3MatchingOrchestrator } from "./v3/shared/matching-orchestrator";
import { DomainEventConsumer as V3DomainEventConsumer } from "./v3/shared/domain-consumer";
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? "development",
        release: process.env.SENTRY_RELEASE,
        tracesSampleRate: 0.1,
    });
}

async function main() {
    const baseConfig = loadBaseConfig("matching-service");
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
        cors: { origin: true, credentials: true },
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
                title: "Matching Service API",
                description:
                    "Candidate-job matching engine with rule-based, skills, and AI scoring",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3017",
                    description: "Development server",
                },
            ],
            tags: [
                {
                    name: "matches",
                    description: "Candidate-job match recommendations",
                },
            ],
        },
    });

    await app.register(swaggerUi as any, {
        routePrefix: "/docs",
        uiConfig: { docExpansion: "list", deepLinking: true },
    });

    // Initialize event publisher
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

    // Create Supabase client
    const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

    // Set up transactional outbox
    const outboxPublisher = eventPublisher
        ? new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger)
        : null;

    // Initialize core services
    const matchRepository = new MatchRepository(
        dbConfig.supabaseUrl,
        supabaseKey,
    );
    const embeddingService = new EmbeddingService(logger);
    const embeddingRepository = new EmbeddingRepository(supabaseClient);

    const orchestrator = new MatchingOrchestrator(
        matchRepository,
        embeddingService,
        embeddingRepository,
        supabaseClient,
        outboxPublisher || undefined,
        logger,
    );

    // Register V2 routes
    registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey,
        eventPublisher: outboxPublisher || undefined,
        logger,
        orchestrator,
    });

    registerV3Routes(app, {
        supabase: supabaseClient,
        eventPublisher: outboxPublisher || undefined,
    });

    // Initialize V2 domain event consumer
    let domainConsumer: DomainEventConsumer | null = null;
    try {
        domainConsumer = new DomainEventConsumer(
            rabbitConfig.url,
            orchestrator,
            logger,
        );
        await domainConsumer.connect();
        logger.info("V2 domain event consumer connected and listening");
    } catch (error) {
        logger.error({ err: error }, "Failed to connect V2 domain event consumer");
    }

    // Initialize V3 matching orchestrator and domain consumer
    const v3MatchRepository = new V3MatchRepository(supabaseClient);
    const v3Orchestrator = new V3MatchingOrchestrator({
        repository: v3MatchRepository,
        embeddingService,
        embeddingRepository,
        supabase: supabaseClient,
        eventPublisher: outboxPublisher || undefined,
        logger,
    });

    let v3DomainConsumer: V3DomainEventConsumer | null = null;
    try {
        v3DomainConsumer = new V3DomainEventConsumer({
            rabbitMqUrl: rabbitConfig.url,
            orchestrator: v3Orchestrator,
            logger,
        });
        await v3DomainConsumer.connect();
        logger.info("V3 domain event consumer connected and listening");
    } catch (error) {
        logger.error({ err: error }, "Failed to connect V3 domain event consumer");
    }

    // Health check
    registerHealthCheck(app, {
        serviceName: "matching-service",
        logger,
    });

    // Start server
    const port = Number(process.env.PORT) || 3017;
    await app.listen({ port, host: "0.0.0.0" });
    logger.info(`Matching service listening on port ${port}`);

    // Graceful shutdown
    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down matching-service");
        try {
            await app.close();
            if (v3DomainConsumer) await v3DomainConsumer.close();
            if (domainConsumer) await domainConsumer.close();
            if (eventPublisher) await eventPublisher.close();
        } finally {
            process.exit(0);
        }
    });
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
