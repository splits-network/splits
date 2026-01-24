import Stripe from 'stripe';
import { loadStripeConfig } from '@splits-network/shared-config';

export class StripeService {
    private stripe: Stripe;

    constructor() {
        const stripeConfig = loadStripeConfig();

        this.stripe = new Stripe(stripeConfig.secretKey, {
            apiVersion: '2025-11-17.clover',
        });
    }

    /**
     * Create a customer in Stripe
     */
    async createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
        return this.stripe.customers.create({
            email,
            name,
            metadata: metadata || {},
        });
    }

    /**
     * Create a Checkout session for subscription
     */
    async createCheckoutSession(
        priceId: string,
        customerId: string,
        successUrl: string,
        cancelUrl: string,
        metadata?: Record<string, string>
    ): Promise<Stripe.Checkout.Session> {
        return this.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: metadata || {},
            subscription_data: {
                metadata: metadata || {},
            },
        });
    }

    /**
     * Create a Customer Portal session
     */
    async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
        return this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
    }

    /**
     * Cancel a subscription
     */
    async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        return this.stripe.subscriptions.cancel(subscriptionId);
    }

    /**
     * Update a subscription (change plan)
     */
    async updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

        return this.stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: subscription.items.data[0].id,
                    price: newPriceId,
                },
            ],
            proration_behavior: 'always_invoice',
        });
    }

    /**
     * Create a product in Stripe
     */
    async createProduct(name: string, description: string): Promise<Stripe.Product> {
        return this.stripe.products.create({
            name,
            description,
        });
    }

    /**
     * Create a price for a product
     */
    async createPrice(
        productId: string,
        unitAmount: number,
        currency: string = 'usd',
        interval: 'month' | 'year' = 'month'
    ): Promise<Stripe.Price> {
        return this.stripe.prices.create({
            product: productId,
            unit_amount: unitAmount,
            currency,
            recurring: {
                interval,
            },
        });
    }

    /**
     * Create a Connect account for recruiter payouts
     */
    async createConnectAccount(
        email: string,
        type: 'standard' | 'express' = 'express',
        metadata?: Record<string, string>
    ): Promise<Stripe.Account> {
        return this.stripe.accounts.create({
            type,
            email,
            metadata: metadata || {},
        });
    }

    /**
     * Create an account link for Connect onboarding
     */
    async createAccountLink(
        accountId: string,
        refreshUrl: string,
        returnUrl: string
    ): Promise<Stripe.AccountLink> {
        return this.stripe.accountLinks.create({
            account: accountId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        });
    }

    /**
     * Create a transfer to a Connect account
     */
    async createTransfer(
        amount: number,
        destination: string,
        metadata?: Record<string, string>
    ): Promise<Stripe.Transfer> {
        return this.stripe.transfers.create({
            amount,
            currency: 'usd',
            destination,
            metadata: metadata || {},
        });
    }

    /**
     * Create a payment intent for one-time charges (promotions)
     */
    async createPaymentIntent(
        amount: number,
        currency: string = 'usd',
        customerId?: string,
        metadata?: Record<string, string>
    ): Promise<Stripe.PaymentIntent> {
        const params: Stripe.PaymentIntentCreateParams = {
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: metadata || {},
        };

        if (customerId) {
            params.customer = customerId;
        }

        return this.stripe.paymentIntents.create(params);
    }

    /**
     * Verify webhook signature
     */
    verifyWebhook(body: string, signature: string, secret: string): Stripe.Event {
        return this.stripe.webhooks.constructEvent(body, signature, secret);
    }

    /**
     * Get raw Stripe instance for advanced operations
     */
    getStripeInstance(): Stripe {
        return this.stripe;
    }
}