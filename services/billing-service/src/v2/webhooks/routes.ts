import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebhookServiceV2 } from './service-simple';
import { UnauthorizedError } from '@splits-network/shared-fastify';
import Stripe from 'stripe';

/**
 * Webhook Routes V2
 * Handles Stripe webhook endpoints using V2 architecture
 */
export function registerWebhookRoutes(
    app: FastifyInstance,
    deps: { webhookService: WebhookServiceV2 }
) {
    
    /**
     * POST /v2/webhooks/stripe
     * Process Stripe webhook events
     */
    app.post(
        '/v2/webhooks/stripe',
        {
            schema: {
                tags: ['Webhooks'],
                summary: 'Process Stripe webhook event',
                description: 'Handles incoming Stripe webhook events for subscription lifecycle management'
            }
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const signature = request.headers['stripe-signature'];

            if (!signature) {
                throw new UnauthorizedError('Missing stripe-signature header');
            }

            let event: Stripe.Event;

            try {
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                    apiVersion: '2025-11-17.clover',
                });

                // Verify the webhook signature
                event = stripe.webhooks.constructEvent(
                    (request as any).rawBody as Buffer,
                    signature as string,
                    process.env.STRIPE_WEBHOOK_SECRET!
                );
            } catch (err: any) {
                request.log.error('Webhook signature verification failed', err);
                throw new UnauthorizedError('Invalid webhook signature');
            }

            // Process the webhook event
            await deps.webhookService.handleStripeWebhook(event);
            
            return reply.send({ data: { received: true } });
        }
    );
}