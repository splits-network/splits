import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '@splits-network/shared-logging';

export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    name: string;
    details?: Record<string, any>;
    error?: string;
}

export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    service: string;
    timestamp: string;
    checks: Record<string, HealthCheckResult>;
    uptime: number;
}

export type HealthChecker = () => Promise<HealthCheckResult>;

export interface HealthCheckOptions {
    /**
     * Service name to include in response
     */
    serviceName: string;
    /**
     * Logger instance for health check errors
     */
    logger: Logger;
    /**
     * Dependency health checkers
     */
    checkers?: Record<string, HealthChecker>;
    /**
     * Custom route path for health check endpoint
     * @default '/health'
     */
    path?: string;
    /**
     * Disable request logging for health check endpoint
     * @default true
     */
    disableLogging?: boolean;
    /**
     * Timeout for all health checks in milliseconds
     * @default 5000
     */
    timeout?: number;
}

/**
 * Built-in health checkers for common dependencies
 */
export class HealthCheckers {
    /**
     * Create a Supabase database health checker
     */
    static database(supabaseUrl: string, supabaseKey: string): HealthChecker {
        return async (): Promise<HealthCheckResult> => {
            try {
                const { createClient } = require('@supabase/supabase-js');
                const supabase = createClient(supabaseUrl, supabaseKey);

                // Simple query to test connectivity
                const { error } = await supabase
                    .from('users')
                    .select('id')
                    .limit(1);

                if (error && !error.message.includes('permission denied')) {
                    // If it's not a permissions issue, it's likely a connectivity problem
                    throw error;
                }

                return {
                    status: 'healthy',
                    name: 'database',
                    details: { provider: 'supabase' }
                };
            } catch (error) {
                return {
                    status: 'unhealthy',
                    name: 'database',
                    error: error instanceof Error ? error.message : 'Database connectivity failed'
                };
            }
        };
    }

    /**
     * Create a RabbitMQ event publisher health checker
     */
    static rabbitMqPublisher(eventPublisher: any): HealthChecker {
        return async (): Promise<HealthCheckResult> => {
            try {
                const isConnected = eventPublisher?.isConnected() ?? false;
                const hasChannel = eventPublisher?.channel && !eventPublisher.channel.closed;

                if (isConnected && hasChannel) {
                    return {
                        status: 'healthy',
                        name: 'rabbitmq_publisher',
                        details: {
                            connected: true,
                            channel_open: true
                        }
                    };
                } else if (isConnected) {
                    return {
                        status: 'degraded',
                        name: 'rabbitmq_publisher',
                        details: {
                            connected: true,
                            channel_open: false
                        }
                    };
                } else {
                    return {
                        status: 'unhealthy',
                        name: 'rabbitmq_publisher',
                        details: {
                            connected: false,
                            channel_open: false
                        }
                    };
                }
            } catch (error) {
                return {
                    status: 'unhealthy',
                    name: 'rabbitmq_publisher',
                    error: error instanceof Error ? error.message : 'RabbitMQ publisher check failed'
                };
            }
        };
    }

    /**
     * Create a RabbitMQ event consumer health checker
     */
    static rabbitMqConsumer(eventConsumer: any): HealthChecker {
        return async (): Promise<HealthCheckResult> => {
            try {
                const isConnected = eventConsumer?.isConnected() ?? false;
                const hasChannel = eventConsumer?.channel && !eventConsumer.channel.closed;

                if (isConnected && hasChannel) {
                    return {
                        status: 'healthy',
                        name: 'rabbitmq_consumer',
                        details: {
                            connected: true,
                            channel_open: true
                        }
                    };
                } else if (isConnected) {
                    return {
                        status: 'degraded',
                        name: 'rabbitmq_consumer',
                        details: {
                            connected: true,
                            channel_open: false
                        }
                    };
                } else {
                    return {
                        status: 'unhealthy',
                        name: 'rabbitmq_consumer',
                        details: {
                            connected: false,
                            channel_open: false
                        }
                    };
                }
            } catch (error) {
                return {
                    status: 'unhealthy',
                    name: 'rabbitmq_consumer',
                    error: error instanceof Error ? error.message : 'RabbitMQ consumer check failed'
                };
            }
        };
    }

    /**
     * Create a Redis health checker
     */
    static redis(redisClient: any): HealthChecker {
        return async (): Promise<HealthCheckResult> => {
            try {
                if (!redisClient) {
                    return {
                        status: 'unhealthy',
                        name: 'redis',
                        error: 'Redis client not initialized'
                    };
                }

                // Try a simple ping
                const result = await redisClient.ping();

                if (result === 'PONG') {
                    return {
                        status: 'healthy',
                        name: 'redis',
                        details: { connected: true }
                    };
                } else {
                    return {
                        status: 'unhealthy',
                        name: 'redis',
                        error: 'Redis ping failed'
                    };
                }
            } catch (error) {
                return {
                    status: 'unhealthy',
                    name: 'redis',
                    error: error instanceof Error ? error.message : 'Redis connectivity failed'
                };
            }
        };
    }

    /**
     * Create a custom health checker with timeout
     */
    static custom(name: string, checkFn: () => Promise<boolean>, details?: Record<string, any>): HealthChecker {
        return async (): Promise<HealthCheckResult> => {
            try {
                const isHealthy = await checkFn();
                return {
                    status: isHealthy ? 'healthy' : 'unhealthy',
                    name,
                    details
                };
            } catch (error) {
                return {
                    status: 'unhealthy',
                    name,
                    error: error instanceof Error ? error.message : 'Custom health check failed'
                };
            }
        };
    }
}

/**
 * Register a health check endpoint on a Fastify instance
 */
export function registerHealthCheck(app: FastifyInstance, options: HealthCheckOptions): void {
    const {
        serviceName,
        logger,
        checkers = {},
        path = '/health',
        disableLogging = true,
        timeout = 5000
    } = options;

    const startTime = Date.now();

    // Override logging for health check endpoint if requested
    const routeOptions: any = {};
    if (disableLogging) {
        routeOptions.logLevel = 'silent';
    }

    app.get(path, routeOptions, async (request: FastifyRequest, reply: FastifyReply) => {
        const checks: Record<string, HealthCheckResult> = {};
        let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        // Run all health checkers with timeout
        const checkerResults = await Promise.allSettled(
            Object.entries(checkers).map(async ([key, checker]) => {
                const timeoutPromise = new Promise<HealthCheckResult>((_, reject) =>
                    setTimeout(() => reject(new Error('Health check timeout')), timeout)
                );

                try {
                    const result = await Promise.race([checker(), timeoutPromise]);
                    return { key, result };
                } catch (error) {
                    return {
                        key,
                        result: {
                            status: 'unhealthy' as const,
                            name: key,
                            error: error instanceof Error ? error.message : 'Health check failed'
                        }
                    };
                }
            })
        );

        // Process results
        for (const checkerResult of checkerResults) {
            if (checkerResult.status === 'fulfilled') {
                const { key, result } = checkerResult.value;
                checks[key] = result;

                // Determine overall status
                if (result.status === 'unhealthy') {
                    overallStatus = 'unhealthy';
                } else if (result.status === 'degraded' && overallStatus === 'healthy') {
                    overallStatus = 'degraded';
                }
            } else {
                // Handle rejected promises (shouldn't happen with our error handling, but just in case)
                logger.error({ err: checkerResult.reason }, 'Health checker promise rejected');
                overallStatus = 'unhealthy';
            }
        }

        const response: HealthCheckResponse = {
            status: overallStatus,
            service: serviceName,
            timestamp: new Date().toISOString(),
            checks,
            uptime: Math.floor((Date.now() - startTime) / 1000)
        };

        // Set appropriate HTTP status code
        const statusCode = overallStatus === 'healthy' ? 200 :
            overallStatus === 'degraded' ? 200 : 503;

        return reply.status(statusCode).send(response);
    });

    logger.debug(`Health check endpoint registered at ${path}`);
}

/**
 * Simple health check registration for services without dependencies
 */
export function registerBasicHealthCheck(app: FastifyInstance, serviceName: string, logger?: Logger): void {
    registerHealthCheck(app, {
        serviceName,
        logger: logger || console as any,
        checkers: {}
    });
}