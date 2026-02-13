import { FastifyInstance } from 'fastify';
import { Logger } from '@splits-network/shared-logging';
import { Webhook } from 'svix';
import { OAuthService } from './oauth-service';

export function registerWebhookRoutes(
    app: FastifyInstance,
    deps: { oauthService: OAuthService; logger: Logger; clerkWebhookSecret?: string }
) {
    app.post('/api/v2/webhooks/clerk', async (request, reply) => {
        const { oauthService, logger, clerkWebhookSecret } = deps;

        try {
            // Verify webhook signature in production
            if (clerkWebhookSecret) {
                const svixId = request.headers['svix-id'] as string;
                const svixTimestamp = request.headers['svix-timestamp'] as string;
                const svixSignature = request.headers['svix-signature'] as string;

                if (!svixId || !svixTimestamp || !svixSignature) {
                    logger.warn('Missing svix headers on webhook request');
                    return reply.status(400).send({ error: 'Missing webhook verification headers' });
                }

                const wh = new Webhook(clerkWebhookSecret);
                try {
                    wh.verify(JSON.stringify(request.body), {
                        'svix-id': svixId,
                        'svix-timestamp': svixTimestamp,
                        'svix-signature': svixSignature,
                    });
                } catch (verifyError) {
                    logger.warn({ err: verifyError }, 'Invalid webhook signature');
                    return reply.status(400).send({ error: 'Invalid webhook signature' });
                }
            } else {
                logger.warn('GPT_CLERK_WEBHOOK_SECRET not configured -- skipping webhook signature verification (development only)');
            }

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
}
