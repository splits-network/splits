import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler } from '@splits-network/shared-fastify';
import { AtsRepository } from './repository';
import { AtsService } from './service';
import { EventPublisher } from './events';
import { registerRoutes } from './routes';

async function main() {
    const baseConfig = loadBaseConfig('ats-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();

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
    });

    app.setErrorHandler(errorHandler);

    // Initialize event publisher
    const eventPublisher = new EventPublisher(rabbitConfig.url, logger);
    await eventPublisher.connect();

    // Initialize repository and service
    const repository = new AtsRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );
    const service = new AtsService(repository, eventPublisher);

    // Register routes
    registerRoutes(app, service);

    // Health check endpoint
    app.get('/health', async (request, reply) => {
        try {
            // Check database connectivity
            await repository.healthCheck();
            // Check RabbitMQ connectivity
            const rabbitHealthy = eventPublisher.isConnected();
            if (!rabbitHealthy) {
                throw new Error('RabbitMQ not connected');
            }
            return reply.status(200).send({
                status: 'healthy',
                service: 'ats-service',
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            logger.error({ err: error }, 'Health check failed');
            return reply.status(503).send({
                status: 'unhealthy',
                service: 'ats-service',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`ATS service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        await eventPublisher.close();
        process.exit(1);
    }
}

main();
