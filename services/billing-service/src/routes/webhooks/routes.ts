import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BillingService } from '../../service';
import { UnauthorizedError } from '@splits-network/shared-fastify';
import { WebhookEventRepository } from '../../v2/webhook-events/repository';
import Stripe from 'stripe';

/**
 * Webhook Routes
 * - Stripe webhook handling with event storage and idempotency
 */
export function registerWebhookRoutes(
    app: FastifyInstance,
    service: BillingService,
    stripeWebhookSecret: string,
    webhookEventRepository: WebhookEventRepository
) {
    // Stripe webhook
    app.post(
        '/webhooks/stripe',
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

                event = stripe.webhooks.constructEvent(
                    (request as any).rawBody as Buffer,
                    signature as string,
                    stripeWebhookSecret
                );
            } catch (err: any) {
                request.log.error('Webhook signature verification failed', err);
                throw new UnauthorizedError('Invalid webhook signature');
            }

            // Store event and check for duplicates
            let isNew: boolean;
            try {
                const result = await webhookEventRepository.store({
                    stripe_event_id: event.id,
                    event_type: event.type,
                    api_version: event.api_version,
                    livemode: event.livemode,
                    payload: event.data.object as Record<string, any>,
                });
                isNew = result.isNew;

                if (!isNew && result.record.processing_status === 'succeeded') {
                    request.log.info(
                        { stripe_event_id: event.id, type: event.type },
                        'Skipping duplicate webhook event (already succeeded)'
                    );
                    return reply.send({ received: true });
                }
            } catch (storeErr: any) {
                // Log but don't block processing — storage is non-critical
                request.log.error(
                    { err: storeErr, stripe_event_id: event.id },
                    'Failed to store webhook event'
                );
                isNew = true;
            }

            // Process the event
            try {
                await webhookEventRepository.markProcessing(event.id);
                await service.handleStripeWebhook(event);
                await webhookEventRepository.markSucceeded(event.id);
            } catch (processErr: any) {
                request.log.error(
                    { err: processErr, stripe_event_id: event.id, type: event.type },
                    'Webhook event processing failed'
                );
                await webhookEventRepository.markFailed(
                    event.id,
                    processErr.message || 'Unknown error'
                ).catch(() => {}); // Don't let status update failure mask the real error
                throw processErr;
            }

            return reply.send({ received: true });
        }
    );
}
