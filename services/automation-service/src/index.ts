import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { AutomationRepository } from './repository';
import { MatchingService } from './matching-service';
import { FraudDetectionService } from './fraud-service';
import { AutomationExecutor } from './automation-executor';
import { MetricsAggregationService } from './metrics-service';
import { registerRoutes } from './routes';
import { registerV2Routes } from './v2/routes';
import { EventPublisher } from './v2/shared/events';
import { DomainEventConsumer } from './v2/shared/domain-consumer';

async function main() {
    const baseConfig = loadBaseConfig('automation-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();

    let v2EventPublisher: EventPublisher | null = null;
    let domainConsumer: DomainEventConsumer | null = null;

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

    // Swagger documentation
    await app.register(swagger, {
        openapi: {
            info: {
                title: 'Splits Network Automation API',
                description: 'AI matching, fraud detection, and automation rules',
                version: '1.0.0',
            },
            servers: [{ url: 'http://localhost:3007' }],
        },
    });

    await app.register(swaggerUi, {
        routePrefix: '/docs',
    });

    // Health check
    app.get('/health', async () => {
        return { 
            status: 'healthy', 
            service: 'automation-service',
            timestamp: new Date().toISOString(),
        };
    });

    try {
        // Initialize repository and services
        const repository = new AutomationRepository(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey!
        );

        const matchingService = new MatchingService(repository, logger);
        const fraudService = new FraudDetectionService(repository, logger);
        const automationExecutor = new AutomationExecutor(repository, logger);
        const metricsService = new MetricsAggregationService(repository, logger);

        v2EventPublisher = new EventPublisher(
            rabbitConfig.url,
            logger,
            baseConfig.serviceName
        );
        await v2EventPublisher.connect();

        // Initialize V2 domain event consumer to trigger automated workflows (AI reviews, etc)
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3009';
        domainConsumer = new DomainEventConsumer(rabbitConfig.url, aiServiceUrl, logger);
        await domainConsumer.connect();
        logger.info('V2 domain event consumer connected - listening for automation triggers');

        // Register routes
        registerRoutes(app, matchingService, fraudService, automationExecutor, metricsService, repository, logger);
        await registerV2Routes(app, {
            supabaseUrl: dbConfig.supabaseUrl,
            supabaseKey: dbConfig.supabaseServiceRoleKey!,
            eventPublisher: v2EventPublisher,
        });

        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received, shutting down automation-service gracefully');
            try {
                await app.close();
                if (v2EventPublisher) {
                    await v2EventPublisher.close();
                }
                if (domainConsumer) {
                    await domainConsumer.close();
                }
            } finally {
                process.exit(0);
            }
        });

        // Start server
        const HOST = process.env.HOST || '0.0.0.0';
        await app.listen({ port: baseConfig.port, host: HOST });

        logger.info(
            { port: baseConfig.port, host: HOST, env: baseConfig.nodeEnv },
            'Automation service started'
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
    console.error('Failed to start automation service:', error);
    process.exit(1);
});
