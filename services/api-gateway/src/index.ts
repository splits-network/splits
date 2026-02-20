import { loadBaseConfig, loadDatabaseConfig, loadMultiClerkConfig, loadRabbitMQConfig, loadRedisConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Redis from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { AuthMiddleware } from './auth';
import { ServiceRegistry } from './clients';
import { registerV2GatewayRoutes } from './routes/v2/routes';
import * as Sentry from '@sentry/node';
import { EventPublisher } from './events/event-publisher';

// Initialize Sentry at module level so startup errors are captured before main() runs
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? 'development',
        release: process.env.SENTRY_RELEASE,
        tracesSampleRate: 0.1,
    });
}

async function main() {
    const baseConfig = loadBaseConfig('api-gateway');
    const clerkConfig = loadMultiClerkConfig();
    const dbConfig = loadDatabaseConfig();
    const redisConfig = loadRedisConfig();
    const rabbitConfig = loadRabbitMQConfig();

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    // Register process-level error handlers as early as possible.
    // For uncaughtException / unhandledRejection: logs the full error, flushes
    // Sentry so the event is not lost, then exits with code 1.
    setupProcessErrorHandlers({
        logger,
        ...(process.env.SENTRY_DSN && {
            onFatalError: async (error) => {
                Sentry.captureException(error);
                await Sentry.flush(2000);
            },
        }),
    });

    // Initialize Redis for rate limiting
    // Note: Password is optional if Redis is configured without authentication
    const redis = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
    });

    // ChatGPT origins for GPT API access
    const GPT_ORIGINS = ['https://chat.openai.com', 'https://chatgpt.com'];

    // CORS configuration - stricter in production
    const allowedOrigins = baseConfig.nodeEnv === 'production'
        ? [...(process.env.CORS_ORIGIN || '').split(',').filter(Boolean), ...GPT_ORIGINS]
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
        // Disable built-in Fastify request logging to reduce health check noise
        disableRequestLogging: true,
    });

    app.setErrorHandler(errorHandler);

    // Add raw body for Stripe webhook proxy
    // Store the raw buffer on the request for signature verification
    app.addContentTypeParser(
        'application/json',
        { parseAs: 'buffer' },
        (req, body, done) => {
            try {
                // Store raw body for webhook signature verification
                (req as any).rawBody = body;
                const json = JSON.parse(body.toString());
                done(null, json);
            } catch (err: any) {
                err.statusCode = 400;
                done(err, undefined);
            }
        }
    );

    // Parse application/x-www-form-urlencoded bodies (used by OAuth2 token exchange)
    app.addContentTypeParser(
        'application/x-www-form-urlencoded',
        { parseAs: 'string' },
        (req, body, done) => {
            try {
                const parsed = Object.fromEntries(new URLSearchParams(body as string));
                done(null, parsed);
            } catch (err: any) {
                err.statusCode = 400;
                done(err, undefined);
            }
        }
    );

    // Allow multipart/form-data requests to pass through without parsing
    // This is needed for proxying file uploads to downstream services (document-service)
    // The downstream services have their own multipart parsing configured
    app.addContentTypeParser('multipart/form-data', (req, payload, done) => {
        done(null); // Don't parse - let proxy routes forward the raw stream
    });

    // Capture per-request errors with route context.
    // Sentry.captureException is a no-op when Sentry was not initialized.
    app.addHook('onError', async (request, reply, error) => {
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error, {
                tags: { service: baseConfig.serviceName },
                extra: { path: request.url, method: request.method },
            });
        }
    });

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
                { name: 'presence', description: 'User presence and activity tracking' },
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
    // Authenticated users get a higher limit since SPAs with dashboards
    // can easily fire 10+ requests on page load across multiple widgets
    await app.register(rateLimit as any, {
        max: async (request: any) => {
            const hasAuth = request.headers['authorization'];
            return hasAuth ? 500 : 100;
        },
        timeWindow: '1 minute',
        redis,
        keyGenerator: (request: any) => {
            // Use bearer token hash for authenticated users so different users
            // on the same IP don't share a rate limit bucket
            const auth = request.headers['authorization'];
            if (auth) {
                // Use last 16 chars of token as key (unique per session, avoids storing full JWT)
                return `auth:${auth.slice(-16)}`;
            }
            return request.ip;
        },
        allowList: async (request: any) => {
            const url = request.raw?.url || request.url || '';
            if (url.startsWith('/api/v2/chat')) return true;
            if (url.startsWith('/api/v2/admin/chat')) return true;
            return false;
        },
    });

    // NOTE: Multipart plugin removed - API gateway passes through multipart requests
    // to downstream services without parsing. The document-service handles multipart parsing.
    // File size limits are enforced at the document-service level.

    // Add correlation ID and request logging middleware
    app.addHook('onRequest', async (request, reply) => {
        // Generate or use existing correlation ID
        const correlationId = (request.headers['x-correlation-id'] as string) || randomUUID();

        // Store correlation ID and start time in request context
        (request as any).correlationId = correlationId;
        (request as any).startTime = Date.now();

        // Add correlation ID to response headers
        reply.header('x-correlation-id', correlationId);

        // Skip logging for noisy endpoints to reduce log spam
        if (request.url === '/health' ||
            request.url.includes('/docs') ||
            request.url.includes('/notifications/unread-count') ||
            request.url.includes('/notifications?') ||
            request.url.includes('/activity/heartbeat') ||
            request.method === 'OPTIONS') {
            return;
        }

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
        // Skip logging for noisy endpoints to reduce log spam
        if (request.url === '/health' ||
            request.url.includes('/docs') ||
            request.url.includes('/notifications/unread-count') ||
            request.url.includes('/notifications?') ||
            request.url.includes('/activity/heartbeat') ||
            request.method === 'OPTIONS') {
            return;
        }

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

    // Initialize auth middleware with multi-tenant Clerk support
    // Accepts tokens from both Portal (SPLITS_) and Candidate (APP_) apps
    const authMiddleware = new AuthMiddleware(clerkConfig);
    let eventPublisher: EventPublisher | null = null;

    try {
        eventPublisher = new EventPublisher(rabbitConfig.url, logger, baseConfig.serviceName);
        await eventPublisher.connect();
    } catch (error) {
        eventPublisher = null;
        logger.error({ err: error }, 'Failed to initialize event publisher');
    }



    // Register auth hook for all /api routes (except webhooks, health, docs, and public routes)
    app.addHook('onRequest', async (request, reply) => {
        // Skip auth for health check endpoint (used by Kubernetes probes and monitoring)
        // This is checked first as it's the most common non-authenticated request
        if (request.url === '/health' || request.url.startsWith('/health?')) {
            return;
        }

        // Skip auth for swagger docs endpoints
        if (request.url.startsWith('/docs')) {
            return;
        }

        // Skip auth for webhook endpoints (verified by signature)
        if (request.url.includes('/webhooks/')) {
            return;
        }

        // Skip auth for GPT routes (gpt-service handles its own token validation)
        if (request.url.startsWith('/api/v1/gpt/')) {
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

        // Skip auth for public system health and site notification endpoints
        // Note: /api/v2/site-notifications/all is an admin endpoint and must NOT be skipped
        if (request.method === 'GET' && request.url.startsWith('/api/v2/system-health')) {
            return;
        }
        if (request.method === 'GET' && (
            request.url === '/api/v2/site-notifications' ||
            request.url.startsWith('/api/v2/site-notifications?')
        )) {
            return;
        }

        // Skip auth for public V2 plans endpoint (pricing page)
        // GET /api/v2/plans - list all plans for public pricing page
        if (request.method === 'GET' && request.url.startsWith('/api/v2/plans')) {
            return;
        }

        // Skip auth for public company invitation lookup (join platform flow)
        // GET /api/v2/company-invitations/lookup - lookup invitation by code or token
        if (request.method === 'GET' && request.url.startsWith('/api/v2/company-invitations/lookup')) {
            return;
        }

        // Skip auth for public content pages endpoints (CMS pages)
        // GET /api/v2/pages - list published pages
        // GET /api/v2/pages/by-slug/:slug - get page by slug
        // GET /api/v2/pages/:id - get page by ID
        if (request.method === 'GET' && request.url.startsWith('/api/v2/pages')) {
            return;
        }

        // Skip auth for public navigation endpoints (CMS navigation)
        // GET /api/v2/navigation - get nav config by app + location
        // GET /api/v2/navigation/:id - get nav config by ID
        if (request.method === 'GET' && request.url.startsWith('/api/v2/navigation')) {
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
    services.register('document-processing', process.env.DOCUMENT_PROCESSING_SERVICE_URL || 'http://localhost:3008');
    services.register('ai', process.env.AI_SERVICE_URL || 'http://localhost:3009');
    services.register('analytics', process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3010');
    services.register('chat', process.env.CHAT_SERVICE_URL || 'http://localhost:3011');
    services.register('search', process.env.SEARCH_SERVICE_URL || 'http://localhost:3013');
    services.register('gpt', process.env.GPT_SERVICE_URL || 'http://localhost:3014');
    services.register('content', process.env.CONTENT_SERVICE_URL || 'http://localhost:3015');

    // Initialize Supabase client for system health and site notifications
    const supabase = createClient(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
    );

    // Register V2 proxy routes only
    registerV2GatewayRoutes(app, services, { eventPublisher, redis, supabase });

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
