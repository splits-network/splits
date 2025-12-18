import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';

/**
 * Identity Routes
 * - User profile (/me)
 * - User consent (cookie/privacy preferences)
 */
export function registerIdentityRoutes(app: FastifyInstance, services: ServiceRegistry) {
    /**
     * Get current user profile
     */
    app.get('/api/me', {
        schema: {
            description: 'Get current user profile',
            tags: ['identity'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as any;
        const identityService = services.get('identity');
        const correlationId = (request as any).correlationId;

        const profile = await identityService.get(`/users/${req.auth.userId}`, undefined, correlationId);
        return reply.send(profile);
    });

    /**
     * Get current user's consent preferences
     */
    app.get('/api/consent', {
        schema: {
            description: 'Get current user cookie consent preferences',
            tags: ['identity'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as any;
        const identityService = services.get('identity');
        const correlationId = (request as any).correlationId;

        const consent = await identityService.get('/consent', { userId: req.auth.userId }, correlationId);
        return reply.send(consent);
    });

    /**
     * Save or update user's consent preferences
     */
    app.post('/api/consent', {
        schema: {
            description: 'Save or update user cookie consent preferences',
            tags: ['identity'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as any;
        const identityService = services.get('identity');
        const correlationId = (request as any).correlationId;

        const consent = await identityService.post('/consent', request.body, correlationId);
        return reply.status(201).send(consent);
    });
}
