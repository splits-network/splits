import { FastifyInstance } from 'fastify';
import { EntitlementService } from './service';
import { requireUserContext } from '../shared/helpers';

interface RegisterEntitlementRoutesConfig {
    entitlementService: EntitlementService;
}

export function registerEntitlementRoutes(
    app: FastifyInstance,
    config: RegisterEntitlementRoutesConfig,
) {
    app.get('/api/v2/entitlements/me', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const entitlements = await config.entitlementService.getMyEntitlements(clerkUserId);
            return reply.send({ data: entitlements });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: { message: error.message || 'Failed to resolve entitlements' } });
        }
    });
}
