import Fastify, { FastifyInstance } from "fastify";
import { createLogger } from "@splits-network/shared-logging";
import * as amqp from "amqplib";
import { createClient } from "@supabase/supabase-js";

// V2 Architecture imports
import { DocumentRepositoryV2 } from "./v2/documents/repository";
import { DocumentServiceV2 } from "./v2/documents/service";
import { registerV2Routes } from "./v2/routes";

// Processing imports (to be updated to use V2)
import { DomainConsumer } from "./domain-consumer";

const logger = createLogger("document-processing-service");

async function buildServer(): Promise<FastifyInstance> {
    const app = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || "info",
        },
        disableRequestLogging: true, // Eliminate health check noise
    });

    // Initialize Supabase client
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Initialize V2 architecture
    const documentRepository = new DocumentRepositoryV2(supabase);
    const documentService = new DocumentServiceV2(documentRepository);

    // Register V2 routes
    await registerV2Routes(app, documentRepository, documentService);

    // Health check
    app.get("/health", async () => {
        return {
            status: "healthy",
            service: "document-processing-service",
            version: "1.0.0",
            architecture: "v2",
        };
    });

    // Processing stats endpoint
    app.get("/stats", async () => {
        const pendingDocs = await documentRepository.getPendingDocuments(1000);
        return {
            data: {
                pending_count: pendingDocs.length,
                service_status: "running",
            },
        };
    });

    return app;
}

async function main() {
    logger.info("Starting Document Processing Service");

    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        const repository = new DocumentRepositoryV2(supabase);

        // Start HTTP server
        const server = await buildServer();
        const port = parseInt(process.env.PORT || "3006", 10);

        await server.listen({ port, host: "0.0.0.0" });
        logger.info(
            `Document processing service HTTP server started on port ${port}`,
        );

        // Connect to RabbitMQ
        logger.info("Connecting to RabbitMQ");
        const connection = await amqp.connect(
            process.env.RABBITMQ_URL || "amqp://localhost:5672",
        );
        const channel = await connection.createChannel();

        // Ensure exchange exists
        await channel.assertExchange("splits-network-events", "topic", {
            durable: true,
        });

        // Ensure queue exists and bind to routing keys
        const queue = "document-processing-service";
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(
            queue,
            "splits-network-events",
            "document.uploaded",
        );

        // Initialize domain consumer (will be updated to use V2)
        const consumer = new DomainConsumer(channel);
        await consumer.initialize();

        logger.info("Document Processing Service started successfully");

        // Get initial processing statistics
        const pendingDocs = await repository.getPendingDocuments(1000);
        const pendingCount = pendingDocs.length;

        logger.info(
            `Initial processing statistics: ${pendingCount} pending documents`,
        );

        // Process any existing pending documents on startup
        if (pendingCount > 0) {
            logger.info(
                `Found ${pendingCount} pending documents, starting retroactive processing`,
            );

            // Process in small batches to avoid overwhelming the system
            const batchSize = 5;
            let remainingPending = pendingCount;

            while (remainingPending > 0) {
                await consumer.processPendingDocuments(batchSize);
                remainingPending -= batchSize;

                if (remainingPending > 0) {
                    // Wait 10 seconds between batches
                    logger.info(
                        `Processed batch, waiting before next batch. Remaining: ${remainingPending}`,
                    );
                    await new Promise((resolve) => setTimeout(resolve, 10000));
                }
            }

            logger.info("Retroactive processing completed");
        }

        // Graceful shutdown handling
        process.on("SIGTERM", async () => {
            logger.info("Received SIGTERM, shutting down gracefully");
            await server.close();
            await channel.close();
            await connection.close();
            process.exit(0);
        });

        process.on("SIGINT", async () => {
            logger.info("Received SIGINT, shutting down gracefully");
            await server.close();
            await channel.close();
            await connection.close();
            process.exit(0);
        });
    } catch (error) {
        logger.error(
            `Failed to start Document Processing Service: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    if (error.stack) logger.debug(error.stack);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled rejection: ${reason}`);
    process.exit(1);
});

main().catch((error) => {
    logger.error(`Service startup failed: ${error.message}`);
    process.exit(1);
});
