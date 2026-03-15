/**
 * Invoice Webhook Handler - Stripe invoice lifecycle events
 *
 * Handles: invoice.payment_succeeded, .payment_failed, .finalized, .marked_uncollectible, .voided
 * Publishes: invoice.paid
 */

import Stripe from 'stripe';
import { WebhookHandler, WebhookHandlerDeps } from './types';

export class InvoiceWebhookHandler implements WebhookHandler {
  constructor(private deps: WebhookHandlerDeps) {}

  async handle(eventType: string, dataObject: any): Promise<void> {
    const invoice = dataObject as Stripe.Invoice;

    switch (eventType) {
      case 'invoice.payment_succeeded':
        return this.handleInvoicePaid(invoice);
      case 'invoice.payment_failed':
        return this.handleInvoiceFailed(invoice);
      case 'invoice.finalized':
        return this.handleInvoiceFinalized(invoice);
      case 'invoice.marked_uncollectible':
        return this.handleInvoiceMarkedUncollectible(invoice);
      case 'invoice.voided':
        return this.handleInvoiceVoided(invoice);
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.id) return;

    const paidDate = invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : new Date();

    // 7-day settlement buffer for all payment methods (credit card 2 days, ACH 3-5 days)
    const settlementDate = new Date(paidDate);
    settlementDate.setDate(settlementDate.getDate() + 7);

    const updates: Record<string, any> = {
      invoice_status: 'paid',
      amount_paid: (invoice.amount_paid ?? 0) / 100,
      paid_at: paidDate.toISOString(),
      collectible_at: settlementDate.toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.deps.supabase
      .from('placement_invoices')
      .update(updates)
      .eq('stripe_invoice_id', invoice.id);

    if (error) {
      this.deps.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice to paid');
      return;
    }

    this.deps.logger.info({
      invoice_id: invoice.id,
      paid_at: paidDate.toISOString(),
      collectible_at: settlementDate.toISOString(),
    }, 'Invoice marked as paid with settlement buffer');

    try {
      await this.deps.eventPublisher.publish('invoice.paid', {
        stripe_invoice_id: invoice.id,
        amount_paid: (invoice.amount_paid ?? 0) / 100,
        paid_at: updates.paid_at,
      });
    } catch (eventError) {
      this.deps.logger.error({ err: eventError, invoice_id: invoice.id }, 'Failed to publish invoice.paid event');
    }
  }

  private async handleInvoiceFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.id) return;

    const { error } = await this.deps.supabase
      .from('placement_invoices')
      .update({
        invoice_status: 'failed',
        failure_reason: invoice.last_finalization_error?.message || 'Unknown error',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_invoice_id', invoice.id);

    if (error) {
      this.deps.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice on failure');
    }
  }

  private async handleInvoiceFinalized(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.id) return;

    const updates: Record<string, any> = {
      invoice_status: invoice.status || 'open',
      amount_due: (invoice.amount_due ?? 0) / 100,
      amount_paid: (invoice.amount_paid ?? 0) / 100,
      hosted_invoice_url: invoice.hosted_invoice_url || null,
      invoice_pdf_url: invoice.invoice_pdf || null,
      finalized_at: invoice.status_transitions?.finalized_at
        ? new Date(invoice.status_transitions.finalized_at * 1000).toISOString()
        : new Date().toISOString(),
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString().slice(0, 10) : null,
      collectible_at: invoice.due_date
        ? new Date(invoice.due_date * 1000).toISOString()
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.deps.supabase
      .from('placement_invoices')
      .update(updates)
      .eq('stripe_invoice_id', invoice.id);

    if (error) {
      this.deps.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice on finalize');
    }
  }

  private async handleInvoiceMarkedUncollectible(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.id) return;

    const { error } = await this.deps.supabase
      .from('placement_invoices')
      .update({
        invoice_status: 'uncollectible',
        failure_reason: 'Invoice marked uncollectible',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_invoice_id', invoice.id);

    if (error) {
      this.deps.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice on uncollectible');
    }
  }

  private async handleInvoiceVoided(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.id) return;

    const { error } = await this.deps.supabase
      .from('placement_invoices')
      .update({
        invoice_status: 'void',
        voided_at: invoice.status_transitions?.voided_at
          ? new Date(invoice.status_transitions.voided_at * 1000).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_invoice_id', invoice.id);

    if (error) {
      this.deps.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice to voided');
    }
  }
}
