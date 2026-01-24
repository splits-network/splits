import Stripe from 'stripe';
import { WebhookRepositoryV2 } from './repository';
import { SubscriptionServiceV2 } from '../subscriptions/service';
import { EventPublisher } from '../shared/events';

/**
 * Simplified Webhook Service V2
 * Handles basic Stripe webhook events
 */
export class WebhookServiceV2 {
    constructor(
        private repository: WebhookRepositoryV2,
        private subscriptionService: SubscriptionServiceV2,
        private eventPublisher: EventPublisher
    ) {}

    /**
     * Process Stripe webhook event with idempotency
     */
    async handleStripeWebhook(event: Stripe.Event): Promise<void> {
        const { id: eventId, type: eventType } = event;

        console.log(`Processing Stripe webhook: ${eventType} (${eventId})`);

        try {
            // Check idempotency
            if (await this.repository.isEventProcessed(eventId)) {
                console.log(`Event ${eventId} already processed, skipping`);
                return;
            }

            // Log event as processing
            await this.repository.logWebhookEvent(
                eventType,
                eventId,
                'processing',
                event.data
            );

            // Process the specific event type
            await this.processWebhookEvent(event);

            // Mark as completed
            await this.repository.logWebhookEvent(
                eventType,
                eventId,
                'completed',
                event.data
            );

            console.log(`Successfully processed webhook: ${eventType} (${eventId})`);

        } catch (error) {
            console.error(`Error processing webhook ${eventType} (${eventId}):`, error);

            // Log the error
            await this.repository.logWebhookEvent(
                eventType,
                eventId,
                'failed',
                event.data,
                error instanceof Error ? error.message : 'Unknown error'
            );

            // Re-throw to let caller handle
            throw error;
        }
    }

    /**
     * Process specific webhook event types
     */
    private async processWebhookEvent(event: Stripe.Event): Promise<void> {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                await this.handleSubscriptionEvent(event);
                break;

            case 'invoice.payment_succeeded':
            case 'invoice.payment_failed':
                await this.handleInvoiceEvent(event);
                break;

            case 'customer.created':
            case 'customer.updated':
                await this.handleCustomerEvent(event);
                break;

            default:
                console.log(`Unhandled webhook event type: ${event.type}`);
                break;
        }
    }

    /**
     * Handle subscription events
     */
    private async handleSubscriptionEvent(event: Stripe.Event): Promise<void> {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`Processing subscription event: ${event.type} for ${subscription.id}`);

        // Publish event for other services to handle
        await this.eventPublisher.publish('stripe.subscription.event', {
            eventType: event.type,
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            status: subscription.status,
            eventData: event.data
        });
    }

    /**
     * Handle invoice events  
     */
    private async handleInvoiceEvent(event: Stripe.Event): Promise<void> {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log(`Processing invoice event: ${event.type} for ${invoice.id}`);

        // Publish event for other services to handle
        await this.eventPublisher.publish('stripe.invoice.event', {
            eventType: event.type,
            invoiceId: invoice.id,
            subscriptionId: typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id || null,
            customerId: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id,
            amount: invoice.amount_paid,
            eventData: event.data
        });
    }

    /**
     * Handle customer events
     */
    private async handleCustomerEvent(event: Stripe.Event): Promise<void> {
        const customer = event.data.object as Stripe.Customer;
        
        console.log(`Processing customer event: ${event.type} for ${customer.id}`);

        // Publish event for other services to handle
        await this.eventPublisher.publish('stripe.customer.event', {
            eventType: event.type,
            customerId: customer.id,
            email: customer.email,
            eventData: event.data
        });
    }
}