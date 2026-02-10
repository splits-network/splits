import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import { buildServer, errorHandler, registerHealthCheck, HealthCheckers } from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { registerV2Routes } from "./v2/routes";
import { EventPublisher } from "./v2/shared/events";
import { DomainEventConsumer } from "./v2/shared/domain-consumer";
import { ReputationRepository, ReputationService, ReputationEventConsumer } from "./v2/reputation";

async function main() {
    const baseConfig = loadBaseConfig("automation-service");
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();

    let v2EventPublisher: EventPublisher | null = null;
    let domainConsumer: DomainEventConsumer | null = null;
    let reputationConsumer: ReputationEventConsumer | null = null;

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

        // Initialize reputation event consumer for reputation recalculation
        const reputationRepository = new ReputationRepository(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey!,
        );
        const reputationService = new ReputationService(
            reputationRepository,
            v2EventPublisher,
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
            eventPublisher: v2EventPublisher,
        });

        // Create Supabase client for health check
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseClient = createClient(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
        );

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
