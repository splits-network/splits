import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BillingService } from '../../service';
import { UnauthorizedError } from '@splits-network/shared-fastify';
import Stripe from 'stripe';

/**
 * Webhook Routes
 * - Stripe webhook handling
 */
export function registerWebhookRoutes(
    app: FastifyInstance,
    service: BillingService,
    stripeWebhookSecret: string
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

            await service.handleStripeWebhook(event);
            return reply.send({ received: true });
        }
    );
}
