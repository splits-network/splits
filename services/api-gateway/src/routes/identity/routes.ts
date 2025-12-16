import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';

/**
 * Identity Routes
 * - User profile (/me)
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
}
