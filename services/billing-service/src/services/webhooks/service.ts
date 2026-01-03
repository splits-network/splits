import Stripe from 'stripe';
import { Logger } from '@splits-network/shared-logging';

/**
 * Webhook Service
 * Handles Stripe webhook events
 * TODO: Migrate to V2 architecture with proper event publishing
 */
export class WebhookService {
    constructor(
        private logger: Logger
    ) {}

    async handleStripeWebhook(event: Stripe.Event): Promise<void> {
        this.logger.info({ type: event.type }, 'Processing Stripe webhook');

        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                // TODO: Replace with V2 event publishing when webhooks are migrated
                this.logger.info({ event_type: event.type }, 'Subscription webhook received - needs V2 migration');
                break;

            case 'customer.subscription.deleted':
                // TODO: Replace with V2 event publishing when webhooks are migrated
                this.logger.info({ event_type: event.type }, 'Subscription deletion webhook received - needs V2 migration');
                break;

            default:
                this.logger.debug({ type: event.type }, 'Unhandled webhook event type');
        }
    }
}
