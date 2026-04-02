import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    createSupabaseClient,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import { buildServer, errorHandler, registerHealthCheck, setupProcessErrorHandlers } from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { registerV2Routes } from "./v2/routes.js";
import { registerV3Routes } from "./v3/routes.js";
import { EventPublisher, OutboxPublisher, ResilientPublisher } from "./v2/shared/events.js";
import { DomainEventConsumer } from "./v2/shared/domain-consumer.js";
import { ReputationRepository, ReputationService, ReputationEventConsumer, CompanyReputationRepository, CompanyReputationService } from "./v2/reputation/index.js";

async function main() {
    const baseConfig = loadBaseConfig("automation-service");
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const supabaseKey = dbConfig.supabaseServiceRoleKey ?? dbConfig.supabaseAnonKey;

    if (!supabaseKey) {
        throw new Error(
            "Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY",
        );
    }

    let v2EventPublisher: EventPublisher | null = null;
    let domainConsumer: DomainEventConsumer | null = null;
    let reputationConsumer: ReputationEventConsumer | null = null;
    let outboxPublisher: OutboxPublisher | null = null;

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === "development" ? "debug" : "info",
        prettyPrint: baseConfig.nodeEnv === "development",
    });

    // Register process-level error handlers as early as possible.
    // For uncaughtException / unhandledRejection: logs the full error and exits
    // with code 1 so Kubernetes restarts the pod and the crash is visible.
    setupProcessErrorHandlers({ logger });

    const app = await buildServer({
        logger,
        cors: {
            origin: true,
            credentials: true,
        },
        disableRequestLogging: true, // Eliminate health check noise
    });

    app.setErrorHandler(errorHandler);

    // Swagger documentation
    await app.register(swagger as any, {
        openapi: {
            info: {
                title: "Splits Network Automation API",
                description: "Fraud detection, and automation rules",
                version: "1.0.0",
            },
            servers: [{ url: "http://localhost:3007" }],
        },
    });

    await app.register(swaggerUi as any, {
        routePrefix: "/docs",
    });

    try {
        v2EventPublisher = new EventPublisher(
            rabbitConfig.url,
            logger,
            baseConfig.serviceName,
        );
        await v2EventPublisher.connect();

        // Create Supabase client (needed for outbox + health check + domain consumer)
        const supabaseClient = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

        // Import access context resolver for domain consumer
        const { resolveAccessContext } = await import('./v2/shared/access.js');
        const accessResolver = (clerkUserId: string) =>
            resolveAccessContext(supabaseClient, clerkUserId);

        // Initialize V2 domain event consumer to evaluate automation rules on events
        domainConsumer = new DomainEventConsumer({
            rabbitMqUrl: rabbitConfig.url,
            supabaseUrl: dbConfig.supabaseUrl,
            supabaseKey,
            eventPublisher: v2EventPublisher!,
            resolveAccessContext: accessResolver,
            logger,
        });
        await domainConsumer.connect();
        logger.info(
            "V2 domain event consumer connected - evaluating automation rules on events",
        );

        // Set up transactional outbox for durable event delivery
        outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);

        // Resilient publisher: tries RabbitMQ first, falls back to outbox
        const resilientPublisher = new ResilientPublisher(v2EventPublisher!, outboxPublisher, logger);

        // Initialize reputation event consumer for reputation recalculation
        const reputationRepository = new ReputationRepository(
            dbConfig.supabaseUrl,
            supabaseKey,
        );
        const reputationService = new ReputationService(
            reputationRepository,
            resilientPublisher,
            logger,
        );
        const companyReputationRepository = new CompanyReputationRepository(
            dbConfig.supabaseUrl,
            supabaseKey,
        );
        const companyReputationService = new CompanyReputationService(
            companyReputationRepository,
            resilientPublisher,
            logger,
        );
        reputationConsumer = new ReputationEventConsumer(
            rabbitConfig.url,
            reputationService,
            companyReputationService,
            logger,
        );
        await reputationConsumer.connect();
        logger.info(
            "Reputation event consumer connected - listening for placement and hire events",
        );

        // Register V2 routes only
        await registerV2Routes(app, {
            supabaseUrl: dbConfig.supabaseUrl,
            supabaseKey,
            eventPublisher: resilientPublisher,
        });

        registerV3Routes(app, {
            supabase: supabaseClient,
            eventPublisher: resilientPublisher,
        });

        // Register standardized health check
        registerHealthCheck(app, {
            serviceName: 'automation-service',
            logger,
        });

        process.on("SIGTERM", async () => {
            logger.info(
                "SIGTERM received, shutting down automation-service gracefully",
            );
            try {
                await app.close();
                if (v2EventPublisher) {
                    await v2EventPublisher.close();
                }
                if (domainConsumer) {
                    await domainConsumer.close();
                }
                if (reputationConsumer) {
                    await reputationConsumer.close();
                }
            } finally {
                process.exit(0);
            }
        });

        // Start server
        const HOST = process.env.HOST || "0.0.0.0";
        await app.listen({ port: baseConfig.port, host: HOST });

        logger.info(
            { port: baseConfig.port, host: HOST, env: baseConfig.nodeEnv },
            "Automation service started",
        );
    } catch (error) {
        if (v2EventPublisher) {
            try {
                await v2EventPublisher.close();
            } catch {
                // ignore close failures
            }
        }
        throw error;
    }
}

main().catch((error) => {
    console.error("Failed to start automation service:", error);
    process.exit(1);
});
