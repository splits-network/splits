import Stripe from 'stripe';
import { Logger } from '@splits-network/shared-logging';
import { SubscriptionService } from '../subscriptions/service';

/**
 * Webhook Service
 * Handles Stripe webhook events
 */
export class WebhookService {
    constructor(
        private subscriptionService: SubscriptionService,
        private logger: Logger
    ) {}

    async handleStripeWebhook(event: Stripe.Event): Promise<void> {
        this.logger.info({ type: event.type }, 'Processing Stripe webhook');

        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await this.subscriptionService.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await this.subscriptionService.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            default:
                this.logger.debug({ type: event.type }, 'Unhandled webhook event type');
        }
    }
}
