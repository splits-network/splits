/**
 * Webhooks Routes
 * API endpoints for webhook handling (Clerk)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebhooksService } from '../../services/webhooks/service';
import { Webhook } from 'svix';

export function registerWebhooksRoutes(
    app: FastifyInstance,
    service: WebhooksService
) {
    // Clerk webhook handler
    app.post(
        '/webhooks/clerk',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
            
            if (!webhookSecret) {
                app.log.error('CLERK_WEBHOOK_SECRET not configured');
                return reply.status(500).send({ error: 'Webhook secret not configured' });
            }

            // Get Svix headers for verification
            const svixId = request.headers['svix-id'] as string;
            const svixTimestamp = request.headers['svix-timestamp'] as string;
            const svixSignature = request.headers['svix-signature'] as string;

            if (!svixId || !svixTimestamp || !svixSignature) {
                app.log.warn('Missing Svix headers');
                return reply.status(400).send({ error: 'Missing Svix headers' });
            }

            // Verify the webhook
            const wh = new Webhook(webhookSecret);
            let evt: any;

            try {
                evt = wh.verify(JSON.stringify(request.body), {
                    'svix-id': svixId,
                    'svix-timestamp': svixTimestamp,
                    'svix-signature': svixSignature,
                });
            } catch (err: any) {
                app.log.error('Webhook signature verification failed:', err.message);
                return reply.status(400).send({ error: 'Invalid signature' });
            }

            // Handle the event
            const eventType = evt.type;
            app.log.info(`Received Clerk webhook: ${eventType}`);

            try {
                switch (eventType) {
                    case 'user.created':
                    case 'user.updated': {
                        const { id, email_addresses, first_name, last_name } = evt.data;
                        const primaryEmail = email_addresses?.find((e: any) => e.id === evt.data.primary_email_address_id);
                        
                        if (!primaryEmail?.email_address) {
                            app.log.warn(`No primary email for user ${id}`);
                            return reply.send({ received: true });
                        }

                        await service.handleUserCreatedOrUpdated(
                            id,
                            primaryEmail.email_address,
                            first_name,
                            last_name
                        );
                        app.log.info(`Synced user ${id} (${eventType})`);
                        break;
                    }

                    case 'user.deleted': {
                        const { id } = evt.data;
                        await service.handleUserDeleted(id);
                        break;
                    }

                    default:
                        app.log.info(`Unhandled event type: ${eventType}`);
                }

                return reply.send({ received: true });
            } catch (error: any) {
                app.log.error('Error processing Clerk webhook:', error);
                return reply.status(500).send({ error: 'Failed to process webhook' });
            }
        }
    );
}
