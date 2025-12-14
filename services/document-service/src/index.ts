import { buildServer, errorHandler } from '@splits-network/shared-fastify';
import { createLogger } from '@splits-network/shared-logging';
import { loadBaseConfig, loadDatabaseConfig } from '@splits-network/shared-config';
import { registerRoutes } from './routes.js';
import { StorageClient } from './storage.js';
import { DocumentRepository } from './repository.js';
import { DocumentService } from './service.js';

async function start() {
    try {
        const baseConfig = loadBaseConfig('document-service');
        const dbConfig = loadDatabaseConfig();

        const logger = createLogger({
            serviceName: baseConfig.serviceName,
            level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
            prettyPrint: baseConfig.nodeEnv === 'development',
        });

        // Build Fastify server
        const fastify = await buildServer({
            logger,
            cors: {
                origin: true,
                credentials: true,
            },
        });

        // Set error handler
        fastify.setErrorHandler(errorHandler);

        // Initialize repository, storage, and service
        const repository = new DocumentRepository(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
        );
        const storage = new StorageClient(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
        );
        const service = new DocumentService(repository, storage);

        // Ensure storage buckets exist (development)
        if (baseConfig.nodeEnv === 'development') {
            logger.info('Ensuring storage buckets exist...');
            await storage.ensureBucketsExist();
        }

        // Register routes
        await registerRoutes(fastify, service);

        // Start server
        await fastify.listen({
            port: baseConfig.port,
            host: '0.0.0.0',
        });

        logger.info(`Document service listening on port ${baseConfig.port}`);
    } catch (error) {
        console.error('Failed to start document service', error);
        process.exit(1);
    }
}

start();
