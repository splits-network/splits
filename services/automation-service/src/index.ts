import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import { buildServer, errorHandler, registerHealthCheck, HealthCheckers, setupProcessErrorHandlers } from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { registerV2Routes } from "./v2/routes";
import { EventPublisher, OutboxPublisher, OutboxWorker } from "./v2/shared/events";
import { DomainEventConsumer } from "./v2/shared/domain-consumer";
import { ReputationRepository, ReputationService, ReputationEventConsumer } from "./v2/reputation";

async function main() {
    const baseConfig = loadBaseConfig("automation-service");
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();

    let v2EventPublisher: EventPublisher | null = null;
    let domainConsumer: DomainEventConsumer | null = null;
    let reputationConsumer: ReputationEventConsumer | null = null;
    let outboxPublisher: OutboxPublisher | null = null;
    let outboxWorker: OutboxWorker | null = null;

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

        // Initialize V2 domain event consumer to trigger automated workflows (AI reviews, etc)
        const aiServiceUrl =
            process.env.AI_SERVICE_URL || "http://localhost:3009";
        domainConsumer = new DomainEventConsumer(
            rabbitConfig.url,
            aiServiceUrl,
            logger,
        );
        await domainConsumer.connect();
        logger.info(
            "V2 domain event consumer connected - listening for automation triggers",
        );

        // Create Supabase client (needed for outbox + health check)
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseClient = createClient(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
        );

        // Set up transactional outbox for durable event delivery
        outboxPublisher = new OutboxPublisher(supabaseClient, baseConfig.serviceName, logger);
        outboxWorker = new OutboxWorker(supabaseClient, v2EventPublisher!, baseConfig.serviceName, logger);
        outboxWorker.start();
        logger.info('📤 Outbox worker started - events will be durably delivered');

        // Initialize reputation event consumer for reputation recalculation
        const reputationRepository = new ReputationRepository(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey!,
        );
        const reputationService = new ReputationService(
            reputationRepository,
            outboxPublisher,
            logger,
        );
        reputationConsumer = new ReputationEventConsumer(
            rabbitConfig.url,
            reputationService,
            logger,
        );
        await reputationConsumer.connect();
        logger.info(
            "Reputation event consumer connected - listening for placement and hire events",
        );

        // Register V2 routes only
        await registerV2Routes(app, {
            supabaseUrl: dbConfig.supabaseUrl,
            supabaseKey: dbConfig.supabaseServiceRoleKey!,
            eventPublisher: outboxPublisher,
        });

        // Register standardized health check
        registerHealthCheck(app, {
            serviceName: 'automation-service',
            logger,
            checkers: {
                database: HealthCheckers.database(supabaseClient),
                ...(v2EventPublisher && {
                    rabbitmq_publisher: HealthCheckers.rabbitMqPublisher(v2EventPublisher)
                }),
                ...(domainConsumer && {
                    rabbitmq_consumer: HealthCheckers.rabbitMqConsumer(domainConsumer)
                }),
                ...(reputationConsumer && {
                    reputation_consumer: HealthCheckers.rabbitMqConsumer(reputationConsumer)
                }),
            },
        });

        process.on("SIGTERM", async () => {
            logger.info(
                "SIGTERM received, shutting down automation-service gracefully",
            );
            try {
                await app.close();
                outboxWorker?.stop();
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
        outboxWorker?.stop();
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
