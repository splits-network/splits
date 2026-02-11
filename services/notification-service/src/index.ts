import {
    loadBaseConfig,
    loadDatabaseConfig,
    loadRabbitMQConfig,
    loadResendConfig,
} from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, registerHealthCheck, HealthCheckers } from '@splits-network/shared-fastify';
import { NotificationRepository } from './repository';
import { NotificationService } from './service';
import { DomainEventConsumer } from './domain-consumer';
import { ServiceRegistry } from './clients';
import { registerV2Routes } from './v2/routes';
import { EventPublisher as V2EventPublisher } from './v2/shared/events';
import * as Sentry from '@sentry/node';

async function main() {
    const baseConfig = loadBaseConfig('notification-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const resendConfig = loadResendConfig();

    // Load service URLs from environment
    const identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';
    const atsServiceUrl = process.env.ATS_SERVICE_URL || 'http://localhost:3002';
    const networkServiceUrl = process.env.NETWORK_SERVICE_URL || 'http://localhost:3003';
    const candidateWebsiteUrl = process.env.CANDIDATE_WEBSITE_URL || 'http://localhost:3101';
    const portalUrl = process.env.PORTAL_URL || 'http://localhost:3001';

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    logger.info(
        { identityServiceUrl, atsServiceUrl, networkServiceUrl, candidateWebsiteUrl },
        'Service URLs configured'
    );

    const app = await buildServer({
        logger,
        cors: {
            origin: true,
            credentials: true,
        },
        // Disable built-in Fastify request logging to reduce health check noise
        disableRequestLogging: true,
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

    // Initialize repository and notification service
    const repository = new NotificationRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );

    const notificationService = new NotificationService(
        repository,
        resendConfig.apiKey,
        resendConfig.fromEmail,
        logger
    );

    const services = new ServiceRegistry(
        identityServiceUrl,
        atsServiceUrl,
        networkServiceUrl,
        logger
    );

    // Initialize domain event consumer with connection monitoring
    const consumer = new DomainEventConsumer(
        rabbitConfig.url,
        notificationService,
        services,
        repository,
        logger,
        portalUrl,
        candidateWebsiteUrl
    );

    try {
        await consumer.connect();
        logger.info('Domain event consumer connected successfully');
    } catch (error) {
        logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to connect domain event consumer');
        throw error;
    }

    const v2EventPublisher = new V2EventPublisher(
        rabbitConfig.url,
        logger,
        baseConfig.serviceName
    );

    try {
        await v2EventPublisher.connect();
        logger.info('V2 event publisher connected successfully');
    } catch (error) {
        logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to connect V2 event publisher');
        throw error;
    }

    // Register V2 HTTP routes only
    await registerV2Routes(app, {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseKey: dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        eventPublisher: v2EventPublisher,
    });

    // Create Supabase client for health checks
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );

    // Enhanced health checkers with detailed logging
    const createEnhancedChecker = (name: string, originalChecker: () => Promise<any>, logger: any) => {
        return async () => {
            const startTime = Date.now();
            try {
                logger.debug({ dependency: name }, 'Starting health check');
                const result = await originalChecker();
                const duration = Date.now() - startTime;

                if (result.status !== 'healthy') {
                    logger.warn({
                        dependency: name,
                        status: result.status,
                        error: result.error,
                        details: result.details,
                        duration
                    }, 'Health check failed or degraded');
                } else {
                    logger.debug({
                        dependency: name,
                        status: result.status,
                        duration
                    }, 'Health check passed');
                }

                return result;
            } catch (error) {
                const duration = Date.now() - startTime;
                logger.error({
                    dependency: name,
                    error: error instanceof Error ? error.message : String(error),
                    duration
                }, 'Health check threw exception');
                throw error;
            }
        };
    };

    // Create enhanced Resend checker with retry logic
    const createResendChecker = () => {
        return HealthCheckers.custom('resend', async () => {
            let lastError;
            const maxRetries = 2;

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

                    const response = await fetch('https://api.resend.com/domains', {
                        headers: { 'Authorization': `Bearer ${resendConfig.apiKey}` },
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        if (attempt > 0) {
                            logger.info({ attempt: attempt + 1 }, 'Resend API recovered after retry');
                        }
                        return true;
                    } else {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                } catch (error) {
                    lastError = error;
                    if (attempt < maxRetries - 1) {
                        logger.warn({
                            attempt: attempt + 1,
                            error: error instanceof Error ? error.message : String(error)
                        }, 'Resend API check failed, retrying');
                        await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1))); // Exponential backoff
                    }
                }
            }

            logger.error({
                attempts: maxRetries,
                lastError: lastError instanceof Error ? lastError.message : String(lastError)
            }, 'Resend API check failed after all retries');

            return false;
        }, { provider: 'resend' });
    };

    // Register standardized health check with enhanced monitoring
    registerHealthCheck(app, {
        serviceName: 'notification-service',
        logger,
        timeout: 8000, // Increase timeout to 8s for better reliability
        checkers: {
            database: createEnhancedChecker('database', HealthCheckers.database(supabaseClient), logger),
            ...(v2EventPublisher && {
                rabbitmq_publisher: createEnhancedChecker('rabbitmq_publisher', HealthCheckers.rabbitMqPublisher(v2EventPublisher), logger)
            }),
            ...(consumer && {
                rabbitmq_consumer: createEnhancedChecker('rabbitmq_consumer', HealthCheckers.rabbitMqConsumer(consumer), logger)
            }),
            // Resend removed from critical health checks - monitored separately every hour to avoid rate limiting
        },
    });

    // Setup periodic health monitoring (every 30 seconds)
    const healthMonitorInterval = setInterval(async () => {
        try {
            // Test database connectivity
            const { error } = await supabaseClient.from('users').select('id').limit(1);
            if (error && !error.message.includes('permission denied')) {
                logger.warn({ error: error.message }, 'Database health check warning during monitoring');
            }

            // Test RabbitMQ connections
            if (consumer.connection && !consumer.isConnected()) {
                logger.warn('RabbitMQ consumer connection unhealthy during monitoring');
            }
            if (v2EventPublisher.connection && !v2EventPublisher.isConnected()) {
                logger.warn('RabbitMQ publisher connection unhealthy during monitoring');
            }

        } catch (error) {
            logger.warn({ error: error instanceof Error ? error.message : String(error) }, 'Health monitoring check failed');
        }
    }, 30000); // Every 30 seconds

    // Setup hourly Resend API monitoring (less critical, avoid rate limiting)
    const resendChecker = createResendChecker();

    // Check Resend at startup
    setTimeout(async () => {
        try {
            await resendChecker();
            logger.info('Resend API startup check completed successfully');
        } catch (error) {
            logger.warn({ error: error instanceof Error ? error.message : String(error) }, 'Resend API startup check failed - will retry hourly');
        }
    }, 5000); // 5 seconds after startup

    // Check Resend every hour
    const resendMonitorInterval = setInterval(async () => {
        try {
            await resendChecker();
            logger.info('Resend API hourly check completed successfully');
        } catch (error) {
            logger.warn({ error: error instanceof Error ? error.message : String(error) }, 'Resend API hourly check failed');
        }
    }, 60 * 60 * 1000); // Every 60 minutes

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        clearInterval(healthMonitorInterval);
        clearInterval(resendMonitorInterval);

        try {
            await consumer.close();
            logger.info('Domain event consumer closed');
        } catch (error) {
            logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error closing consumer');
        }

        try {
            await v2EventPublisher.close();
            logger.info('V2 event publisher closed');
        } catch (error) {
            logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error closing event publisher');
        }

        await app.close();
        process.exit(0);
    });

    // Handle uncaught errors
    process.on('unhandledRejection', (reason, promise) => {
        logger.error({ reason, promise }, 'Unhandled promise rejection');
    });

    process.on('uncaughtException', (error) => {
        logger.error({ error }, 'Uncaught exception');
        process.exit(1);
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`Notification service listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        await consumer.close();
        await v2EventPublisher.close();
        process.exit(1);
    }
}

main();
