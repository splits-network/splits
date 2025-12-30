import { loadBaseConfig, loadDatabaseConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler } from '@splits-network/shared-fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { NetworkRepository } from './repository';
import { NetworkService } from './service';
import { EventPublisher as LegacyEventPublisher } from './events';
import { EventPublisherV2 } from './v2/shared/events';
import { registerRoutes } from './routes';
import { CandidateRoleAssignmentService } from './services/proposals/service';
import { RecruiterReputationService } from './services/reputation/service';
import { DomainEventConsumer } from './domain-consumer';
import { registerV2Routes } from './v2/routes';
import * as Sentry from '@sentry/node';

async function main() {
    const baseConfig = loadBaseConfig('network-service');
    const dbConfig = loadDatabaseConfig();

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

    // Initialize Sentry if DSN is provided
    const sentryDsn = process.env.SENTRY_DSN;
    if (sentryDsn) {
        Sentry.init({
            dsn: sentryDsn,
            environment: baseConfig.nodeEnv,
            release: process.env.SENTRY_RELEASE,
            tracesSampleRate: 0.1,
        });

        app.addHook('onError', async (request, reply, error) => {
            Sentry.captureException(error, {
                tags: { service: baseConfig.serviceName },
                extra: { path: request.url, method: request.method },
            });
        });
    }

    // Register Swagger
    await app.register(swagger, {
        openapi: {
            info: {
                title: 'Network Service API',
                description: 'Recruiter network management - profiles, assignments, teams, and statistics',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3003',
                    description: 'Development server',
                },
            ],
            tags: [
                { name: 'recruiters', description: 'Recruiter profile management' },
                { name: 'assignments', description: 'Job role assignments to recruiters' },
                { name: 'stats', description: 'Recruiter performance statistics' },
                { name: 'teams', description: 'Recruiting teams and agencies (Phase 4B)' },
            ],
        },
    });

    await app.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
        },
    });

    // Initialize repository and service
    const repository = new NetworkRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );

    // Initialize event publisher
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    const eventPublisher = new LegacyEventPublisher(rabbitMqUrl, logger);
    
    try {
        await eventPublisher.connect();
        logger.info('Event publisher connected');
    } catch (error) {
        logger.warn({ err: error }, 'Failed to connect event publisher - continuing without it');
    }

    const v2EventPublisher = new EventPublisherV2(rabbitMqUrl, logger);
    try {
        await v2EventPublisher.connect();
        logger.info('Network V2 event publisher connected');
    } catch (error) {
        logger.warn({ err: error }, 'Failed to connect Network V2 event publisher - continuing without it');
    }

    const service = new NetworkService(repository, eventPublisher);
    
    // Phase 2 services
    const proposalService = new CandidateRoleAssignmentService(repository);
    const reputationService = new RecruiterReputationService(repository);

    // Initialize and start domain event consumer (for recruiter-candidate relationships)
    const domainConsumer = new DomainEventConsumer(rabbitMqUrl, service, logger);
    
    try {
        await domainConsumer.start();
        logger.info('Domain event consumer started');
    } catch (error) {
        logger.warn({ err: error }, 'Failed to start domain event consumer - continuing without it');
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await domainConsumer.stop();
        await eventPublisher.close();
        await v2EventPublisher.close();
        await app.close();
        process.exit(0);
    });

    // Register all routes (Phase 1, Phase 2, and Phase 4B)
    registerRoutes(app, service, proposalService, reputationService);

    // Register V2 routes
    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey: dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        eventPublisher: v2EventPublisher,
    });

    // Health check endpoint
    app.get('/health', async (request, reply) => {
        try {
            // Check database connectivity
            await repository.healthCheck();
            return reply.status(200).send({
                status: 'healthy',
                service: 'network-service',
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            logger.error({ err: error }, 'Health check failed');
            return reply.status(503).send({
                status: 'unhealthy',
                service: 'network-service',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`Network service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        process.exit(1);
    }
}

main();
