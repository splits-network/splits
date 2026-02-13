import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig, loadGptConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, registerHealthCheck, HealthCheckers } from '@splits-network/shared-fastify';
import formbody from '@fastify/formbody';
import { EventPublisher } from './v2/shared/events';
import { AuditEventConsumer } from './v2/shared/audit-consumer';
import { registerV2Routes } from './v2/routes';

async function main() {
    const baseConfig = loadBaseConfig('gpt-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const gptConfig = loadGptConfig();

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    const app = await buildServer({
        logger,
        cors: {
            origin: true,
            credentials: true,
        },
        disableRequestLogging: true,
    });

    app.setErrorHandler(errorHandler);

    // Register @fastify/formbody for OAuth token endpoint (application/x-www-form-urlencoded)
    await app.register(formbody);

    // Initialize EventPublisher
    const eventPublisher = new EventPublisher(
        rabbitConfig.url,
        logger,
        baseConfig.serviceName
    );

    try {
        await eventPublisher.connect();
        logger.info('RabbitMQ EventPublisher connected successfully');
    } catch (error) {
        logger.error({ err: error }, 'Failed to connect RabbitMQ EventPublisher on startup');
        throw error;
    }

    // Initialize AuditEventConsumer to write gpt.oauth.* and gpt.action.* events to DB
    const auditConsumer = new AuditEventConsumer(
        rabbitConfig.url,
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        logger
    );

    try {
        await auditConsumer.connect();
        logger.info('RabbitMQ AuditEventConsumer connected successfully');
    } catch (error) {
        logger.error({ err: error }, 'Failed to connect RabbitMQ AuditEventConsumer on startup');
        throw error;
    }

    // Register V2 routes
    registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey: dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        gptConfig,
        eventPublisher,
        clerkWebhookSecret: process.env.GPT_CLERK_WEBHOOK_SECRET,
    });

    // Register health check endpoint
    registerHealthCheck(app, {
        serviceName: 'gpt-service',
        logger,
        checkers: {
            rabbitmq: HealthCheckers.rabbitMqPublisher(eventPublisher),
        },
    });

    // Log GPT config summary (non-sensitive fields only)
    logger.info({
        gptClientId: gptConfig.clientId,
        gptRedirectUri: gptConfig.redirectUri,
        accessTokenExpiry: gptConfig.accessTokenExpiry,
        refreshTokenExpiry: gptConfig.refreshTokenExpiry,
        authCodeExpiry: gptConfig.authCodeExpiry,
    }, 'GPT OAuth configuration loaded');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await auditConsumer.disconnect();
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`gpt-service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        await auditConsumer.disconnect();
        await eventPublisher.close();
        process.exit(1);
    }
}

main();
