import Fastify, { FastifyInstance } from "fastify";
import { createLogger } from "@splits-network/shared-logging";
import { createSupabaseClient } from "@splits-network/shared-config";
import * as amqp from "amqplib";

// V2 Architecture imports
import { DocumentRepositoryV2 } from "./v2/documents/repository.js";
import { DocumentServiceV2 } from "./v2/documents/service.js";
import { registerV2Routes } from "./v2/routes.js";
import { registerV3Routes } from "./v3/routes.js";
import { EventPublisher } from "@splits-network/shared-job-queue";

// Processing imports (to be updated to use V2)
import { DomainConsumer } from "./domain-consumer.js";

const logger = createLogger("document-processing-service");

async function buildServer(): Promise<FastifyInstance> {
    const app = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || "info",
        },
        disableRequestLogging: true, // Eliminate health check noise
    });

    // Initialize Supabase client
    const supabase = createSupabaseClient({
        url: process.env.SUPABASE_URL!,
        key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    });

    // Initialize V2 architecture
    const documentRepository = new DocumentRepositoryV2(supabase);
    const documentService = new DocumentServiceV2(documentRepository);

    // Register V2 routes
    await registerV2Routes(app, documentRepository, documentService);

    registerV3Routes(app, { supabase });

    // Health check
    app.get("/health", async () => ({
        status: "healthy",
        service: "document-processing-service",
        timestamp: new Date().toISOString(),
    }));

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
        const supabase = createSupabaseClient({
            url: process.env.SUPABASE_URL!,
            key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });
        const repository = new DocumentRepositoryV2(supabase);

        // Start HTTP server
        const server = await buildServer();
        const port = parseInt(process.env.PORT || "3006", 10);

        await server.listen({ port, host: "0.0.0.0" });
        logger.info(
            `Document processing service HTTP server started on port ${port}`,
        );

        // Connect to RabbitMQ with heartbeat for faster dead-connection detection
        const rabbitMqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
        logger.info("Connecting to RabbitMQ");

        let connection: amqp.ChannelModel;
        let channel: amqp.Channel;
        let consumer: DomainConsumer;
        let isClosing = false;

        async function connectRabbitMQ(): Promise<void> {
            connection = await amqp.connect(rabbitMqUrl, {
                heartbeat: 30,
            });
            channel = await connection.createChannel();

            connection.on('error', (err) => {
                logger.error({ err }, 'Document processing RabbitMQ connection error');
            });

            connection.on('close', () => {
                logger.warn('Document processing RabbitMQ connection closed');
                if (!isClosing) {
                    logger.info('Attempting to reconnect document processing consumer...');
                    setTimeout(() => connectRabbitMQ().catch((err) => {
                        logger.error({ err }, 'Failed to reconnect document processing consumer');
                    }), 5000);
                }
            });

            channel.on('error', (err) => {
                logger.error({ err }, 'Document processing RabbitMQ channel error');
            });

            channel.on('close', () => {
                logger.warn('Document processing RabbitMQ channel closed');
            });

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

            consumer = new DomainConsumer(channel, eventPublisher);
            await consumer.initialize();
        }

        // Initialize EventPublisher
        const eventPublisher = new EventPublisher(
            rabbitMqUrl,
            logger,
            "document-processing-service"
        );
        await eventPublisher.connect();

        await connectRabbitMQ();

        logger.info("Document Processing Service started successfully");

        // Process pending documents in the background (non-blocking)
        setImmediate(async () => {
            try {
                const pendingDocs = await repository.getPendingDocuments(1000);
                const pendingCount = pendingDocs.length;

                logger.info(
                    `Initial processing statistics: ${pendingCount} pending documents`,
                );

                if (pendingCount > 0) {
                    logger.info(
                        `Found ${pendingCount} pending documents, starting retroactive processing`,
                    );

                    const batchSize = 5;
                    let remainingPending = pendingCount;

                    while (remainingPending > 0) {
                        await consumer.processPendingDocuments(batchSize);
                        remainingPending -= batchSize;

                        if (remainingPending > 0) {
                            logger.info(
                                `Processed batch, waiting before next batch. Remaining: ${remainingPending}`,
                            );
                            await new Promise((resolve) => setTimeout(resolve, 10000));
                        }
                    }

                    logger.info("Retroactive processing completed");
                }
            } catch (error) {
                logger.error(
                    `Retroactive document processing failed: ${error instanceof Error ? error.message : String(error)}`,
                );
            }
        });

        // Graceful shutdown handling
        process.on("SIGTERM", async () => {
            logger.info("Received SIGTERM, shutting down gracefully");
            isClosing = true;
            await server.close();
            try { await channel.close(); } catch (_) { }
            try { await connection.close(); } catch (_) { }
            if (eventPublisher) await eventPublisher.close();
            process.exit(0);
        });

        process.on("SIGINT", async () => {
            logger.info("Received SIGINT, shutting down gracefully");
            isClosing = true;
            await server.close();
            try { await channel.close(); } catch (_) { }
            try { await connection.close(); } catch (_) { }
            if (eventPublisher) await eventPublisher.close();
            process.exit(0);
        });
    } catch (error) {
        logger.error(
            `Failed to start Document Processing Service: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
    }
}

// Handle uncaught exceptions / unhandled rejections — logs the full error with
// stack trace and exits with code 1 so Kubernetes restarts the pod.
const handleFatalError = async (error: Error, origin: string): Promise<void> => {
    logger.error({ err: error, origin }, `Fatal process error [${origin}] — service is shutting down`);
    process.exit(1);
};

process.on("uncaughtException", (error: Error, origin: string) => {
    void handleFatalError(error, origin);
});

process.on("unhandledRejection", (reason: unknown) => {
    const error =
        reason instanceof Error
            ? reason
            : new Error(typeof reason === "string" ? reason : JSON.stringify(reason));
    void handleFatalError(error, "unhandledRejection");
});

main().catch((error) => {
    logger.error(`Service startup failed: ${error.message}`);
    process.exit(1);
});
