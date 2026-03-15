/**
 * Balance Webhook Handler - Stripe balance and funds availability events
 *
 * Handles: balance.available
 * Also provides handleIncomingFundsAvailable for payout.paid (called by TransferWebhookHandler)
 * Publishes: invoice.funds_available
 */

import Stripe from 'stripe';
import { WebhookHandler, WebhookHandlerDeps } from './types';

export class BalanceWebhookHandler implements WebhookHandler {
  constructor(private deps: WebhookHandlerDeps) {}

  async handle(eventType: string, dataObject: any): Promise<void> {
    if (eventType === 'balance.available') {
      await this.handleBalanceAvailable(dataObject as Stripe.Balance);
    }
  }

  /** Called by TransferWebhookHandler when payout.paid settles funds */
  async handleIncomingFundsAvailable(payout: Stripe.Payout): Promise<void> {
    this.deps.logger.info({ payout_id: payout.id, amount: payout.amount / 100 }, 'Processing incoming funds availability from payout.paid');

    try {
      let startingAfter: string | undefined = undefined;

      while (true) {
        const response: Stripe.ApiList<Stripe.BalanceTransaction> = await this.deps.stripe.balanceTransactions.list({
          payout: payout.id,
          limit: 100,
          expand: ['data.source'],
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });

        for (const transaction of response.data) {
          if (transaction.type === 'charge' && transaction.source) {
            const charge = transaction.source as any;
            if (charge.invoice) {
              await this.markInvoiceFundsAvailable(charge.invoice, payout.id, transaction.amount);
            }
          }
        }

        if (!response.has_more) break;
        startingAfter = response.data[response.data.length - 1]?.id;
        if (!startingAfter) break;
      }
    } catch (error) {
      this.deps.logger.error({ err: error, payout_id: payout.id }, 'Failed to process incoming funds availability');
    }
  }

  private async markInvoiceFundsAvailable(invoiceId: string, payoutId: string, amount: number): Promise<void> {
    const { error } = await this.deps.supabase
      .from('placement_invoices')
      .update({
        funds_available: true,
        funds_available_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_invoice_id', invoiceId);

    if (error) {
      this.deps.logger.error({ err: error, invoice_id: invoiceId, payout_id: payoutId }, 'Failed to mark invoice funds as available');
      return;
    }

    this.deps.logger.info({ invoice_id: invoiceId, payout_id: payoutId, amount: amount / 100 }, 'Invoice funds now available');

    try {
      await this.deps.eventPublisher.publish('invoice.funds_available', {
        stripe_invoice_id: invoiceId,
        payout_id: payoutId,
        amount_available: amount / 100,
        available_at: new Date().toISOString(),
      });
    } catch (eventError) {
      this.deps.logger.error({ err: eventError, invoice_id: invoiceId }, 'Failed to publish invoice.funds_available event');
    }
  }

  private async handleBalanceAvailable(balance: Stripe.Balance): Promise<void> {
    this.deps.logger.info({
      available_usd: balance.available.find(b => b.currency === 'usd')?.amount || 0,
      pending_usd: balance.pending.find(b => b.currency === 'usd')?.amount || 0,
    }, 'Balance available event received - checking for newly available invoice funds');

    try {
      const { data: pendingInvoices, error } = await this.deps.supabase
        .from('placement_invoices')
        .select('id, stripe_invoice_id, paid_at')
        .eq('invoice_status', 'paid')
        .eq('funds_available', false)
        .not('paid_at', 'is', null)
        .order('paid_at', { ascending: true })
        .limit(50);

      if (error) {
        this.deps.logger.error({ err: error }, 'Failed to query pending invoice funds');
        return;
      }

      if (!pendingInvoices || pendingInvoices.length === 0) {
        this.deps.logger.debug('No pending invoice funds to update on balance.available');
        return;
      }

      const now = new Date().toISOString();
      const invoiceIds = pendingInvoices.map(inv => inv.id);

      const { error: updateError } = await this.deps.supabase
        .from('placement_invoices')
        .update({ funds_available: true, funds_available_at: now, updated_at: now })
        .in('id', invoiceIds);

      if (updateError) {
        this.deps.logger.error({ err: updateError }, 'Failed to update invoice funds availability');
        return;
      }

      this.deps.logger.info({ updated_count: invoiceIds.length }, 'Marked invoice funds as available via balance.available');

      for (const invoice of pendingInvoices) {
        if (invoice.stripe_invoice_id) {
          try {
            await this.deps.eventPublisher.publish('invoice.funds_available', {
              stripe_invoice_id: invoice.stripe_invoice_id,
              detection_method: 'balance.available',
              available_at: now,
            });
          } catch (eventError) {
            this.deps.logger.error({ err: eventError, invoice_id: invoice.stripe_invoice_id }, 'Failed to publish invoice.funds_available from balance.available');
          }
        }
      }
    } catch (error) {
      this.deps.logger.error({ err: error }, 'Failed to process balance.available event');
    }
  }
}
