import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    createSupabaseClient,
} from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import {
    buildServer,
    errorHandler,
    registerHealthCheck,
    setupProcessErrorHandlers,
} from '@splits-network/shared-fastify';
import { EventPublisher } from '@splits-network/shared-job-queue';
import { CentralOutboxWorker } from './outbox-worker';
import { OutboxCleanup } from './outbox-cleanup';

async function main() {
    const baseConfig = loadBaseConfig('outbox-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const supabaseKey = dbConfig.supabaseServiceRoleKey ?? dbConfig.supabaseAnonKey;

    if (!supabaseKey) {
        throw new Error('Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    }

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    setupProcessErrorHandlers({ logger });

    const app = await buildServer({
        logger,
        cors: { origin: true, credentials: true },
        disableRequestLogging: true,
    });
    app.setErrorHandler(errorHandler);

    // Single Supabase client for the entire service
    const supabase = createSupabaseClient({ url: dbConfig.supabaseUrl, key: supabaseKey });

    // Connect RabbitMQ publisher
    const eventPublisher = new EventPublisher(rabbitConfig.url, logger, baseConfig.serviceName);
    await eventPublisher.connect();
    logger.info('RabbitMQ event publisher connected');

    // Start centralized outbox worker (processes ALL services' events)
    const outboxWorker = new CentralOutboxWorker(supabase, eventPublisher, logger);
    outboxWorker.start();

    // Start retention cleanup (purge published/failed events older than 7 days)
    const outboxCleanup = new OutboxCleanup(supabase, logger);
    outboxCleanup.start();

    // Stats endpoint for observability
    app.get('/stats', async () => {
        return { data: outboxWorker.getStats() };
    });

    // Health check
    registerHealthCheck(app, {
        serviceName: 'outbox-service',
        logger,
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down outbox-service');
        outboxWorker.stop();
        outboxCleanup.stop();
        await eventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Start server
    const HOST = process.env.HOST || '0.0.0.0';
    await app.listen({ port: baseConfig.port, host: HOST });
    logger.info(
        { port: baseConfig.port, host: HOST, env: baseConfig.nodeEnv },
        'Outbox service started — centralized event delivery for all services',
    );
}

main().catch((error) => {
    console.error('Failed to start outbox-service:', error);
    process.exit(1);
});
