/**
 * Transfer Webhook Handler - Stripe transfer and payout events
 *
 * Handles: transfer.created, .updated, .reversed, payout.paid, .failed, .canceled
 * Delegates funds availability to BalanceWebhookHandler on payout.paid
 */

import Stripe from 'stripe';
import * as Sentry from '@sentry/node';
import { WebhookHandler, WebhookHandlerDeps } from './types.js';
import { BalanceWebhookHandler } from './balance-webhook-handler.js';

export class TransferWebhookHandler implements WebhookHandler {
  private balanceHandler: BalanceWebhookHandler;

  constructor(private deps: WebhookHandlerDeps) {
    this.balanceHandler = new BalanceWebhookHandler(deps);
  }

  async handle(eventType: string, dataObject: any): Promise<void> {
    switch (eventType) {
      case 'transfer.created':
      case 'transfer.updated':
      case 'transfer.reversed':
        return this.handleTransferEvent(eventType, dataObject as Stripe.Transfer);
      case 'payout.paid':
      case 'payout.failed':
      case 'payout.canceled':
        return this.handlePayoutEvent(eventType, dataObject as Stripe.Payout);
    }
  }

  private async handleTransferEvent(eventType: string, transfer: Stripe.Transfer): Promise<void> {
    if (!transfer.id) return;

    const status = eventType === 'transfer.created'
      ? 'paid'
      : eventType === 'transfer.reversed'
        ? 'reversed'
        : 'processing';

    const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (status === 'processing') updates.processing_started_at = new Date().toISOString();
    if (status === 'paid') updates.completed_at = new Date().toISOString();

    const { error } = await this.deps.supabase
      .from('placement_payout_transactions')
      .update(updates)
      .eq('stripe_transfer_id', transfer.id);

    if (error) {
      this.deps.logger.error({ err: error, transfer_id: transfer.id }, 'Failed to update payout transaction from transfer');
    }
  }

  private async handlePayoutEvent(eventType: string, payout: Stripe.Payout): Promise<void> {
    if (!payout.id) return;

    const status = eventType === 'payout.paid'
      ? 'paid'
      : eventType === 'payout.failed' || eventType === 'payout.canceled'
        ? 'failed'
        : 'processing';

    const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (status === 'paid') updates.completed_at = new Date().toISOString();
    if (status === 'failed') {
      updates.failed_at = new Date().toISOString();
      updates.failure_reason = payout.failure_message || 'Stripe payout failed';
    }

    const transferIds = await this.getTransferIdsForPayout(payout.id);

    if (transferIds.length === 0) {
      this.deps.logger.warn(
        { payout_id: payout.id, metric: 'stripe_payout_missing_transfers', value: 1 },
        'No transfer IDs found for payout; attempting payout_id match'
      );
      if (process.env.SENTRY_DSN) {
        Sentry.captureMessage('Stripe payout missing transfers', {
          level: 'warning',
          tags: { module: 'billing-webhooks' },
          extra: { payout_id: payout.id },
        });
      }

      const { error } = await this.deps.supabase
        .from('placement_payout_transactions')
        .update({ ...updates, stripe_payout_id: payout.id })
        .eq('stripe_payout_id', payout.id);

      if (error) {
        this.deps.logger.error({ err: error, payout_id: payout.id }, 'Failed to update payout transaction from payout');
      }
      return;
    }

    const { error } = await this.deps.supabase
      .from('placement_payout_transactions')
      .update({ ...updates, stripe_payout_id: payout.id })
      .in('stripe_transfer_id', transferIds);

    if (error) {
      this.deps.logger.error({ err: error, payout_id: payout.id }, 'Failed to update payout transaction from payout transfers');
    }

    if (eventType === 'payout.paid') {
      await this.balanceHandler.handleIncomingFundsAvailable(payout);
    }
  }

  private async getTransferIdsForPayout(payoutId: string): Promise<string[]> {
    const transferIds: string[] = [];
    let startingAfter: string | undefined = undefined;

    try {
      while (true) {
        const response: Stripe.ApiList<Stripe.BalanceTransaction> = await this.deps.stripe.balanceTransactions.list({
          payout: payoutId,
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });

        for (const balanceTx of response.data) {
          const source = balanceTx.source;
          if (typeof source === 'string' && source.startsWith('tr_')) {
            transferIds.push(source);
          }
        }

        if (!response.has_more) break;
        startingAfter = response.data[response.data.length - 1]?.id;
        if (!startingAfter) break;
      }
    } catch (error) {
      this.deps.logger.error({ err: error, payout_id: payoutId }, 'Failed to load payout balance transactions');
    }

    return Array.from(new Set(transferIds));
  }
}
