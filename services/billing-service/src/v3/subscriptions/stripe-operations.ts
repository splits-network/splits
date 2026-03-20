/**
 * Subscriptions V3 — Stripe Operations
 *
 * Handles all Stripe API interactions for subscriptions.
 * Extracted from service to keep files under ~200 lines.
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestError } from '@splits-network/shared-fastify';
import {
  UpdateSubscriptionInput,
  SetupIntentRequest,
  ActivateSubscriptionRequest,
} from './types';

export class SubscriptionStripeOperations {
  private stripe: Stripe;

  constructor(private supabase: SupabaseClient) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    });
  }

  /**
   * Handle payment method attachment and plan changes during update
   */
  async handleUpdateOperations(
    existing: any,
    input: UpdateSubscriptionInput,
    clerkUserId: string
  ): Promise<Record<string, any>> {
    const updates: Record<string, any> = { ...input };

    if (input.payment_method_id) {
      const customerId = input.customer_id || existing.stripe_customer_id;
      if (customerId) {
        await this.stripe.paymentMethods.attach(input.payment_method_id, { customer: customerId });
        await this.stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: input.payment_method_id },
        });
        if (!existing.stripe_customer_id) updates.stripe_customer_id = customerId;
      }
      delete updates.payment_method_id;
      delete updates.customer_id;
    }

    if (input.plan_id || input.billing_period) {
      if (existing.stripe_subscription_id) {
        await this.handleStripePlanChange(existing, updates);
      } else {
        await this.handleStripeSubscriptionCreate(existing, updates, clerkUserId);
      }
    }

    return updates;
  }

  async cancelStripeSubscription(subscription: any): Promise<string | null> {
    if (!subscription.stripe_subscription_id) return null;

    const stripeSub = await this.stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: true }
    );
    const cancelAtTs = (stripeSub as any).current_period_end;
    return cancelAtTs ? new Date(cancelAtTs * 1000).toISOString() : null;
  }

  async createSetupIntent(
    input: SetupIntentRequest,
    userId: string,
    clerkUserId: string,
    existingCustomerId?: string | null
  ) {
    let customerId = existingCustomerId;

    if (!customerId) {
      const { data: user } = await this.supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();

      const customer = await this.stripe.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        metadata: {
          user_id: userId,
          clerk_user_id: clerkUserId,
          ...(input.plan_id ? { plan_id: input.plan_id } : {}),
        },
      });
      customerId = customer.id;
    }

    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        user_id: userId,
        clerk_user_id: clerkUserId,
        ...(input.plan_id ? { plan_id: input.plan_id } : {}),
      },
    });

    return { client_secret: setupIntent.client_secret!, customer_id: customerId, plan_id: input.plan_id };
  }

  async activateSubscription(
    input: ActivateSubscriptionRequest,
    userId: string,
    clerkUserId: string
  ) {
    const { data: plan } = await this.supabase.from('plans').select('*').eq('id', input.plan_id).single();
    if (!plan) throw new BadRequestError('Plan not found');

    if (plan.tier === 'starter' || plan.price_monthly === 0) {
      return { stripe_subscription_id: null, stripe_customer_id: null, current_period_end: null };
    }

    if (!input.payment_method_id || !input.customer_id) {
      throw new BadRequestError('payment_method_id and customer_id are required for paid plans');
    }

    await this.stripe.paymentMethods.attach(input.payment_method_id, { customer: input.customer_id });
    await this.stripe.customers.update(input.customer_id, {
      invoice_settings: { default_payment_method: input.payment_method_id },
    });

    const billingPeriod = input.billing_period || 'monthly';
    const priceId = billingPeriod === 'annual' ? plan.stripe_price_id_annual : plan.stripe_price_id_monthly;
    if (!priceId) throw new BadRequestError(`No Stripe price configured for ${billingPeriod}`);

    const params: any = {
      customer: input.customer_id,
      items: [{ price: priceId }],
      payment_settings: { payment_method_types: ['card'], save_default_payment_method: 'on_subscription' },
      metadata: { user_id: userId, clerk_user_id: clerkUserId, plan_id: input.plan_id, billing_period: billingPeriod },
    };
    if (input.promotion_code) params.promotion_code = input.promotion_code;

    const stripeSub = await this.stripe.subscriptions.create(params);
    const periodEnd = (stripeSub as any).current_period_end;

    return {
      stripe_subscription_id: stripeSub.id,
      stripe_customer_id: input.customer_id,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    };
  }

  async getPaymentMethods(stripeCustomerId?: string | null) {
    if (!stripeCustomerId) return { has_payment_method: false, default_payment_method: null };

    try {
      const customer = await this.stripe.customers.retrieve(stripeCustomerId, {
        expand: ['invoice_settings.default_payment_method'],
      });
      if ((customer as any).deleted) return { has_payment_method: false, default_payment_method: null };

      const pm = (customer as Stripe.Customer).invoice_settings?.default_payment_method;
      if (!pm || typeof pm === 'string') return { has_payment_method: false, default_payment_method: null };

      const card = (pm as Stripe.PaymentMethod).card;
      if (!card) return { has_payment_method: false, default_payment_method: null };

      return {
        has_payment_method: true,
        default_payment_method: {
          id: (pm as Stripe.PaymentMethod).id,
          brand: card.brand, last4: card.last4,
          exp_month: card.exp_month, exp_year: card.exp_year,
        },
      };
    } catch (error: any) {
      if (error.code === 'resource_missing') return { has_payment_method: false, default_payment_method: null };
      throw error;
    }
  }

  async updatePaymentMethod(stripeCustomerId: string, paymentMethodId: string) {
    await this.stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (!pm.card) throw new BadRequestError('Payment method is not a card');

    return {
      success: true,
      payment_method: {
        id: pm.id, brand: pm.card.brand, last4: pm.card.last4,
        exp_month: pm.card.exp_month, exp_year: pm.card.exp_year,
      },
    };
  }

  async getInvoices(stripeCustomerId?: string | null, limit: number = 10) {
    if (!stripeCustomerId) return { invoices: [], has_more: false };

    try {
      const result = await this.stripe.invoices.list({ customer: stripeCustomerId, limit });
      const invoices = result.data.map(inv => ({
        id: inv.id, number: inv.number,
        amount_due: inv.amount_due, amount_paid: inv.amount_paid,
        currency: inv.currency, status: inv.status,
        created: new Date(inv.created * 1000).toISOString(),
        invoice_pdf: inv.invoice_pdf ?? null,
        period_start: new Date(inv.period_start * 1000).toISOString(),
        period_end: new Date(inv.period_end * 1000).toISOString(),
      }));
      return { invoices, has_more: result.has_more };
    } catch (error: any) {
      if (error.code === 'resource_missing') return { invoices: [], has_more: false };
      throw error;
    }
  }

  private async handleStripePlanChange(subscription: any, updates: Record<string, any>) {
    const newPlanId = updates.plan_id || subscription.plan_id;
    const billingPeriod = updates.billing_period || subscription.billing_period || 'monthly';
    const promotionCode = updates.promotion_code;
    delete updates.promotion_code;

    const { data: plan } = await this.supabase.from('plans').select('*').eq('id', newPlanId).single();
    if (!plan || plan.tier === 'starter' || plan.price_monthly === 0) return;

    const priceId = billingPeriod === 'annual' ? plan.stripe_price_id_annual : plan.stripe_price_id_monthly;
    if (!priceId) throw new BadRequestError(`No Stripe price for ${billingPeriod}`);

    const stripeSub = await this.stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    const itemId = stripeSub.items.data[0]?.id;
    if (!itemId) throw new BadRequestError('Unable to find subscription item');

    const updateParams: any = {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: 'create_prorations',
      metadata: { ...stripeSub.metadata, plan_id: newPlanId, billing_period: billingPeriod },
    };
    if (promotionCode) {
      updateParams.discounts = [{ promotion_code: promotionCode }];
    }

    const updated = await this.stripe.subscriptions.update(subscription.stripe_subscription_id, updateParams);

    const endTs = (updated as any).current_period_end;
    if (endTs) updates.current_period_end = new Date(endTs * 1000).toISOString();
    const startTs = (updated as any).current_period_start;
    if (startTs) updates.current_period_start = new Date(startTs * 1000).toISOString();
    updates.billing_period = billingPeriod;
  }

  private async handleStripeSubscriptionCreate(
    subscription: any,
    updates: Record<string, any>,
    clerkUserId: string
  ) {
    const newPlanId = updates.plan_id || subscription.plan_id;
    const billingPeriod = updates.billing_period || subscription.billing_period || 'monthly';

    const { data: plan } = await this.supabase.from('plans').select('*').eq('id', newPlanId).single();
    if (!plan || plan.tier === 'starter' || plan.price_monthly === 0) return;

    const customerId = updates.stripe_customer_id || subscription.stripe_customer_id;
    if (!customerId) throw new BadRequestError('Stripe customer ID required for paid subscription');

    const priceId = billingPeriod === 'annual' ? plan.stripe_price_id_annual : plan.stripe_price_id_monthly;
    if (!priceId) throw new BadRequestError(`No Stripe price for ${billingPeriod}`);

    const params: any = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_settings: { payment_method_types: ['card'], save_default_payment_method: 'on_subscription' },
      metadata: { user_id: subscription.user_id, clerk_user_id: clerkUserId, plan_id: newPlanId, billing_period: billingPeriod },
    };
    if (updates.promotion_code) { params.promotion_code = updates.promotion_code; delete updates.promotion_code; }

    const stripeSub = await this.stripe.subscriptions.create(params);
    updates.stripe_subscription_id = stripeSub.id;
    if (!subscription.stripe_customer_id) updates.stripe_customer_id = customerId;

    const endTs = (stripeSub as any).current_period_end;
    if (endTs) updates.current_period_end = new Date(endTs * 1000).toISOString();
    const startTs = (stripeSub as any).current_period_start;
    if (startTs) updates.current_period_start = new Date(startTs * 1000).toISOString();
    updates.billing_period = billingPeriod;
  }
}
