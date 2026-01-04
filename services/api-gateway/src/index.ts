import { loadBaseConfig, loadClerkConfig, loadRabbitMQConfig, loadRedisConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler } from '@splits-network/shared-fastify';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import { AuthMiddleware } from './auth';
import { ServiceRegistry } from './clients';
import { registerV2GatewayRoutes } from './routes/v2/routes';
import * as Sentry from '@sentry/node';
import { EventPublisher } from './events/event-publisher';

async function main() {
    const baseConfig = loadBaseConfig('api-gateway');
    const clerkConfig = loadClerkConfig();
    const redisConfig = loadRedisConfig();
    const rabbitConfig = loadRabbitMQConfig();

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    // Initialize Redis for rate limiting
    // Note: Password is optional if Redis is configured without authentication
    const redis = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
    });

    // CORS configuration - stricter in production
    const allowedOrigins = baseConfig.nodeEnv === 'production'
        ? (process.env.CORS_ORIGIN || '').split(',').filter(Boolean)
        : true;

    if (baseConfig.nodeEnv === 'production' && (!allowedOrigins || (allowedOrigins as string[]).length === 0)) {
        throw new Error('CORS_ORIGIN must be set in production environment');
    }

    const app = await buildServer({
        logger,
        cors: {
            origin: allowedOrigins,
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
    await app.register(swagger as any, {
        openapi: {
            info: {
                title: 'Splits Network API Gateway',
                description: 'API Gateway for Splits Network - Routes requests to backend services',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Development server',
                },
                {
                    url: 'https://api.splits.network',
                    description: 'Production server',
                },
            ],
            components: {
                securitySchemes: {
                    clerkAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Clerk JWT token from authentication',
                    },
                    oauthToken: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'OAuth 2.0 access token',
                    },
                    apiKey: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'API Key',
                        description: 'API key for server-to-server authentication (format: sk_...)',
                    },
                },
            },
            tags: [
                { name: 'oauth', description: 'OAuth 2.0 token management' },
                { name: 'webhooks', description: 'Webhook subscription management' },
                { name: 'meta', description: 'API metadata and versioning' },
                { name: 'identity', description: 'User and organization management' },
                { name: 'roles', description: 'RBAC-filtered job listings' },
                { name: 'jobs', description: 'Job management' },
                { name: 'companies', description: 'Company management' },
                { name: 'candidates', description: 'Candidate management' },
                { name: 'applications', description: 'Application lifecycle' },
                { name: 'placements', description: 'Placement management' },
                { name: 'recruiters', description: 'Recruiter profiles and stats' },
                { name: 'assignments', description: 'Recruiter-to-job assignments' },
                { name: 'proposals', description: 'Job proposals (Phase 2)' },
                { name: 'reputation', description: 'Recruiter reputation (Phase 2)' },
                { name: 'billing', description: 'Subscription plans and billing' },
                { name: 'documents', description: 'Document storage and retrieval' },
                { name: 'dashboards', description: 'Dashboard stats and insights' },
                { name: 'admin', description: 'Platform admin and automation' },
                { name: 'automation', description: 'Automation rules, matches, fraud signals, marketplace metrics' },
                { name: 'status', description: 'System status and support contact' },
            ],
        },
    });

    await app.register(swaggerUi as any, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
        },
    });

    // Register rate limiting
    await app.register(rateLimit as any, {
        max: 100,
        timeWindow: '1 minute',
        redis,
    });

    // Register multipart support for file uploads
    await app.register(multipart as any, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max file size
        },
    });

    // Add correlation ID and request logging middleware
    app.addHook('onRequest', async (request, reply) => {
        // Generate or use existing correlation ID
        const correlationId = (request.headers['x-correlation-id'] as string) || randomUUID();
        
        // Store correlation ID and start time in request context
        (request as any).correlationId = correlationId;
        (request as any).startTime = Date.now();
        
        // Add correlation ID to response headers
        reply.header('x-correlation-id', correlationId);
        
        // Log incoming request
        logger.info({
            correlationId,
            method: request.method,
            url: request.url,
            headers: {
                'user-agent': request.headers['user-agent'],
                'content-type': request.headers['content-type'],
            },
            ip: request.ip,
        }, 'Incoming request');
    });

    // Add response logging middleware
    app.addHook('onResponse', async (request, reply) => {
        const correlationId = (request as any).correlationId;
        const startTime = (request as any).startTime;
        const responseTime = Date.now() - startTime;
        
        logger.info({
            correlationId,
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            responseTime: `${responseTime}ms`,
        }, 'Request completed');
    });

    // Initialize auth middleware
    const authMiddleware = new AuthMiddleware(clerkConfig.secretKey);
    let eventPublisher: EventPublisher | null = null;

    try {
        eventPublisher = new EventPublisher(rabbitConfig.url, logger, baseConfig.serviceName);
        await eventPublisher.connect();
    } catch (error) {
        eventPublisher = null;
        logger.error({ err: error }, 'Failed to initialize event publisher');
    }



    // Register auth hook for all /api routes (except webhooks and public routes)
    app.addHook('onRequest', async (request, reply) => {
        // Skip auth for webhook endpoints (verified by signature)
        if (request.url.includes('/webhooks/')) {
            return;
        }
        
        // Skip auth for internal service calls (authenticated by service key)
        const internalServiceKey = request.headers['x-internal-service-key'] as string;
        if (internalServiceKey) {
            return;
        }
        
        // Skip auth for public API endpoints (candidate website, marketplace browsing, etc.)
        if (request.url.startsWith('/api/public/') || request.url.startsWith('/api/marketplace/')) {
            return;
        }
        
        // Skip auth for public V2 job endpoints (optional authentication)
        // GET /api/v2/jobs - list all jobs (or filter by company if authenticated)
        // GET /api/v2/jobs/:id - get job details
        if (request.method === 'GET' && (
            request.url.startsWith('/api/v2/jobs') || 
            request.url.match(/^\/api\/v2\/jobs\/[^/]+(\?|$)/)
        )) {
            // Try to authenticate if token is present, but don't fail if missing
            try {
                await authMiddleware.createMiddleware()(request, reply);
            } catch (error) {
                // Ignore auth errors for public endpoints
                request.log.debug('No valid auth token for public endpoint, continuing as anonymous');
            }
            return;
        }
        
        // Skip auth for public V2 recruiters endpoints (marketplace browsing)
        // GET /api/v2/recruiters - list all recruiters for marketplace browsing
        // GET /api/v2/recruiters/:id - view recruiter details for marketplace
        // Note: Other recruiter endpoints (POST, PATCH, DELETE) require authentication
        if (request.method === 'GET' && (
            request.url === '/api/v2/recruiters' ||
            request.url.startsWith('/api/v2/recruiters?') ||
            request.url.match(/^\/api\/v2\/recruiters\/[^/?]+(?:\?.*)?$/)
        )) {
            // Try to authenticate if token is present, but don't fail if missing
            try {
                await authMiddleware.createMiddleware()(request, reply);
            } catch (error) {
                // Ignore auth errors for public marketplace endpoint
                request.log.debug('No valid auth token for public marketplace endpoint, continuing as anonymous');
            }
            return;
        }
        
        if (request.url.startsWith('/api/v2/status-contact')) {
            return;
        }

        if (request.url.startsWith('/api/')) {
            await authMiddleware.createMiddleware()(request, reply);
        }
    });

    // Initialize service registry
    const services = new ServiceRegistry(logger);

    // Register services (use env vars or defaults)
    services.register('identity', process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001');
    services.register('ats', process.env.ATS_SERVICE_URL || 'http://localhost:3002');
    services.register('network', process.env.NETWORK_SERVICE_URL || 'http://localhost:3003');
    services.register('billing', process.env.BILLING_SERVICE_URL || 'http://localhost:3004');
    services.register('notification', process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005');
    services.register('document', process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3006');
    services.register('automation', process.env.AUTOMATION_SERVICE_URL || 'http://localhost:3007');
    services.register('ai', process.env.AI_SERVICE_URL || 'http://localhost:3009');

    // Register V2 proxy routes only
    registerV2GatewayRoutes(app, services, { eventPublisher });

    // Health check endpoint (no auth required)
    app.get('/health', async (request, reply) => {
        try {
            // Check Redis connectivity
            await redis.ping();
            
            return reply.status(200).send({
                status: 'healthy',
                service: 'api-gateway',
                timestamp: new Date().toISOString(),
                checks: {
                    redis: 'connected',
                    auth: 'configured',
                },
            });
        } catch (error) {
            logger.error({ err: error }, 'Health check failed');
            return reply.status(503).send({
                status: 'unhealthy',
                service: 'api-gateway',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await redis.quit();
        if (eventPublisher) {
            await eventPublisher.close();
        }
        await app.close();
        process.exit(0);
    });

    // Start server
    try {
        await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
        logger.info(`API Gateway listening on port ${baseConfig.port}`);
    } catch (err) {
        logger.error(err);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(err as Error);
            await Sentry.flush(2000);
        }
        await redis.quit();
        if (eventPublisher) {
            await eventPublisher.close();
        }
        process.exit(1);
    }
}

main();
