import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    loadRedisConfig,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";
import { buildServer, errorHandler } from "@splits-network/shared-fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { registerV2Routes } from "./v2/routes";
import { EventPublisher } from "./v2/shared/events";
import * as Sentry from "@sentry/node";

async function main() {
    const baseConfig = loadBaseConfig("chat-service");
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const redisConfig = loadRedisConfig();

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

    await app.register(swagger as any, {
        openapi: {
            info: {
                title: "Chat Service API",
                description: "Internal chat service for Splits Network",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3011",
                    description: "Development server",
                },
            ],
            tags: [
                {
                    name: "chat",
                    description: "Chat conversations and messages",
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

    const eventPublisher = new EventPublisher(
        rabbitConfig.url,
        logger,
        baseConfig.serviceName,
    );
    await eventPublisher.connect();

    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey:
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        rabbitMqUrl: rabbitConfig.url,
        redisConfig,
        eventPublisher,
    });

    app.get("/health", async (request, reply) => {
        return reply.status(200).send({
            status: "healthy",
            service: "chat-service",
            rabbitmq_connected: eventPublisher.isConnected(),
            timestamp: new Date().toISOString(),
        });
    });

    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down gracefully");
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });

    try {
        await app.listen({ port: baseConfig.port, host: "0.0.0.0" });
        logger.info(`Chat service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        await eventPublisher.close();
        process.exit(1);
    }
}

main();
