/**
 * Subscription Webhook Handler - Stripe subscription lifecycle events
 *
 * Handles: customer.subscription.created, .updated, .deleted
 * Publishes: subscription.webhook_updated, subscription.webhook_canceled, firm.suspended, firm.reactivated
 */

import Stripe from 'stripe';
import { WebhookHandler, WebhookHandlerDeps } from './types';

export class SubscriptionWebhookHandler implements WebhookHandler {
  constructor(private deps: WebhookHandlerDeps) {}

  async handle(eventType: string, dataObject: any): Promise<void> {
    const subscription = dataObject as Stripe.Subscription;

    if (eventType === 'customer.subscription.created' || eventType === 'customer.subscription.updated') {
      await this.handleSubscriptionUpdated(subscription);
    } else if (eventType === 'customer.subscription.deleted') {
      await this.handleSubscriptionDeleted(subscription);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    if (!subscription.id) return;

    const updates: Record<string, any> = {
      status: subscription.status,
      updated_at: new Date().toISOString(),
    };

    const itemPeriods = subscription.items?.data || [];
    const periodStarts = itemPeriods
      .map((item) => item.current_period_start)
      .filter((value): value is number => typeof value === 'number');
    const periodEnds = itemPeriods
      .map((item) => item.current_period_end)
      .filter((value): value is number => typeof value === 'number');

    if (periodStarts.length > 0) {
      updates.current_period_start = new Date(Math.min(...periodStarts) * 1000).toISOString();
    }
    if (periodEnds.length > 0) {
      updates.current_period_end = new Date(Math.max(...periodEnds) * 1000).toISOString();
    }

    const { error } = await this.deps.supabase
      .from('subscriptions')
      .update(updates)
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      this.deps.logger.error({ err: error, subscription_id: subscription.id }, 'Failed to update subscription from webhook');
      return;
    }

    await this.deps.eventPublisher.publish('subscription.webhook_updated', {
      stripe_subscription_id: subscription.id,
      status: subscription.status,
    });

    await this.checkFirmOwnerSubscription(subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    if (!subscription.id) return;

    const { error } = await this.deps.supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      this.deps.logger.error({ err: error, subscription_id: subscription.id }, 'Failed to cancel subscription from webhook');
      return;
    }

    await this.deps.eventPublisher.publish('subscription.webhook_canceled', {
      stripe_subscription_id: subscription.id,
    });

    await this.checkFirmOwnerSubscription(subscription.id);
  }

  private async checkFirmOwnerSubscription(stripeSubscriptionId: string): Promise<void> {
    try {
      const { data: sub } = await this.deps.supabase
        .from('subscriptions')
        .select('user_id, status, plan:plans(tier)')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .single();

      if (!sub) return;

      const { data: firms } = await this.deps.supabase
        .from('firms')
        .select('id, status')
        .eq('owner_user_id', sub.user_id);

      if (!firms?.length) return;

      const isPartner = sub.status === 'active' && (sub as any).plan?.tier === 'partner';
      const now = new Date().toISOString();

      for (const firm of firms) {
        if (!isPartner && firm.status === 'active') {
          await this.deps.supabase
            .from('firms')
            .update({ status: 'suspended', updated_at: now })
            .eq('id', firm.id);

          this.deps.logger.info({ firmId: firm.id, userId: sub.user_id }, 'Firm suspended: owner lost partner subscription');
          await this.deps.eventPublisher.publish('firm.suspended', { firmId: firm.id, reason: 'owner_subscription_lapsed' });
        } else if (isPartner && firm.status === 'suspended') {
          await this.deps.supabase
            .from('firms')
            .update({ status: 'active', updated_at: now })
            .eq('id', firm.id);

          this.deps.logger.info({ firmId: firm.id, userId: sub.user_id }, 'Firm reactivated: owner regained partner subscription');
          await this.deps.eventPublisher.publish('firm.reactivated', { firmId: firm.id });
        }
      }
    } catch (err) {
      this.deps.logger.error({ err, stripeSubscriptionId }, 'Failed to check firm owner subscription status');
    }
  }
}
