import { FastifyInstance, FastifyBaseLogger } from 'fastify';
import { OAuthService } from './oauth-service';

export function registerWebhookRoutes(
    app: FastifyInstance,
    deps: { oauthService: OAuthService; logger: FastifyBaseLogger }
) {
    app.post('/api/v2/webhooks/clerk', async (request, reply) => {
        const { oauthService, logger } = deps;

        try {
            // Parse Clerk webhook payload
            const payload = request.body as any;
            const eventType = payload?.type;

            if (eventType !== 'user.deleted') {
                // Ignore non-deletion events
                return reply.status(200).send({ received: true });
            }

            const clerkUserId = payload?.data?.id;
            if (!clerkUserId) {
                logger.warn({ payload }, 'user.deleted webhook missing user ID');
                return reply.status(400).send({ error: 'Missing user ID' });
            }

            logger.info({ clerkUserId }, 'Processing user.deleted webhook -- revoking all GPT sessions');
            await oauthService.revokeAllSessions(clerkUserId);

            return reply.status(200).send({ received: true });
        } catch (error) {
            logger.error({ err: error }, 'Failed to process Clerk webhook');
            return reply.status(500).send({ error: 'Internal error' });
        }
    });

    // TODO: Add webhook signature verification for production (Phase 15: Production Hardening)
    // Use Clerk's svix library to verify webhook signatures
}
