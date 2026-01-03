import { buildServer, errorHandler } from '@splits-network/shared-fastify';
import { createLogger } from '@splits-network/shared-logging';
import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { StorageClient } from './storage.js';
import { registerV2Routes } from './v2/routes.js';
import { EventPublisher } from './v2/shared/events.js';

async function start() {
    let eventPublisher: EventPublisher | null = null;
    try {
        const baseConfig = loadBaseConfig('document-service');
        const dbConfig = loadDatabaseConfig();
        const rabbitConfig = loadRabbitMQConfig();

        const logger = createLogger({
            serviceName: baseConfig.serviceName,
            level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
            prettyPrint: baseConfig.nodeEnv === 'development',
        });

        const fastify = await buildServer({
            logger,
            cors: {
                origin: true,
                credentials: true,
            },
        });

        // Set error handler
        fastify.setErrorHandler(errorHandler);

        // Initialize storage
        const storage = new StorageClient(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
        );

        // Ensure storage buckets exist (development)
        if (baseConfig.nodeEnv === 'development') {
            logger.info('Ensuring storage buckets exist...');
            await storage.ensureBucketsExist();
        }

        eventPublisher = new EventPublisher(
            rabbitConfig.url,
            logger,
            baseConfig.serviceName
        );
        await eventPublisher.connect();

        // Add health check route
        fastify.get('/health', async (_request, reply) => {
            reply.send({ status: 'ok', service: 'document-service' });
        });

        // Register V2 routes
        await registerV2Routes(fastify, {
            supabaseUrl: dbConfig.supabaseUrl,
            supabaseKey: dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
            storage,
            eventPublisher,
        });

        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received, shutting down document-service gracefully');
            try {
                await fastify.close();
                if (eventPublisher) {
                    await eventPublisher.close();
                }
            } finally {
                process.exit(0);
            }
        });

        // Start server
        await fastify.listen({
            port: baseConfig.port,
            host: '0.0.0.0',
        });

        logger.info(`Document service listening on port ${baseConfig.port}`);
    } catch (error) {
        console.error('Failed to start document service', error);
        if (eventPublisher) {
            try {
                await eventPublisher.close();
            } catch {
                // ignore close errors
            }
        }
        process.exit(1);
    }
}

start();
