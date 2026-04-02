/**
 * Connect Webhook Handler - Stripe Connect account events
 *
 * Handles: account.updated
 * Publishes: recruiter.stripe_connect_onboarded, recruiter.stripe_connect_disabled
 */

import Stripe from 'stripe';
import { WebhookHandler, WebhookHandlerDeps } from './types.js';

export class ConnectWebhookHandler implements WebhookHandler {
  constructor(private deps: WebhookHandlerDeps) {}

  async handle(eventType: string, dataObject: any): Promise<void> {
    if (eventType === 'account.updated') {
      await this.handleAccountUpdated(dataObject as Stripe.Account);
    }
  }

  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    if (!account.id) return;

    const onboarded = !!account.charges_enabled && !!account.payouts_enabled && !!account.details_submitted;
    const onboardedAt = onboarded ? new Date().toISOString() : null;

    const { data: recruiter } = await this.deps.supabase
      .from('recruiters')
      .select('id, stripe_connect_onboarded')
      .eq('stripe_connect_account_id', account.id)
      .single();

    const previouslyOnboarded = !!recruiter?.stripe_connect_onboarded;

    const { error } = await this.deps.supabase
      .from('recruiters')
      .update({
        stripe_connect_onboarded: onboarded,
        stripe_connect_onboarded_at: onboardedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_connect_account_id', account.id);

    if (error) {
      this.deps.logger.error({ err: error, account_id: account.id }, 'Failed to update recruiter connect status');
      return;
    }

    if (!recruiter?.id) return;

    if (!previouslyOnboarded && onboarded) {
      await this.deps.eventPublisher.publish('recruiter.stripe_connect_onboarded', {
        recruiter_id: recruiter.id,
        account_id: account.id,
        onboarded_at: onboardedAt,
      });
      this.deps.logger.info({ recruiter_id: recruiter.id, account_id: account.id }, 'Published recruiter.stripe_connect_onboarded event');
    } else if (previouslyOnboarded && !onboarded) {
      await this.deps.eventPublisher.publish('recruiter.stripe_connect_disabled', {
        recruiter_id: recruiter.id,
        account_id: account.id,
        disabled_reason: (account.requirements as any)?.disabled_reason || 'requirements_changed',
      });
      this.deps.logger.info({ recruiter_id: recruiter.id, account_id: account.id }, 'Published recruiter.stripe_connect_disabled event');
    }
  }
}
