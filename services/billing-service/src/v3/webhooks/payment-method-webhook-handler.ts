/**
 * Payment Method Webhook Handler - Payment method and customer lifecycle events
 *
 * Handles: payment_method.attached, .updated, .detached, customer.deleted
 * Publishes: company.billing_payment_method_attached, firm.billing_payment_method_attached,
 *   billing.payment_method_updated, company.billing_payment_method_removed,
 *   firm.billing_payment_method_removed, company.billing_customer_deleted,
 *   firm.billing_customer_deleted, jobs.billing_reverted_to_draft
 */

import Stripe from 'stripe';
import { WebhookHandler, WebhookHandlerDeps } from './types';
import { revertJobsToDraft } from './billing-utils';

export class PaymentMethodWebhookHandler implements WebhookHandler {
  constructor(private deps: WebhookHandlerDeps) {}

  async handle(eventType: string, dataObject: any): Promise<void> {
    switch (eventType) {
      case 'payment_method.attached':
        return this.handleAttached(dataObject as Stripe.PaymentMethod);
      case 'payment_method.updated':
        return this.handleUpdated(dataObject as Stripe.PaymentMethod);
      case 'payment_method.detached':
        return this.handleDetached(dataObject as Stripe.PaymentMethod);
      case 'customer.deleted':
        return this.handleCustomerDeleted(dataObject as Stripe.Customer);
    }
  }

  private async handleAttached(pm: Stripe.PaymentMethod): Promise<void> {
    if (!pm.id || !pm.customer) return;

    const pmId = pm.id;
    const customerId = typeof pm.customer === 'string' ? pm.customer : pm.customer.id;
    const now = new Date().toISOString();

    const { data: companyProfile } = await this.deps.supabase
      .from('company_billing_profiles')
      .select('company_id, stripe_default_payment_method_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (companyProfile && !companyProfile.stripe_default_payment_method_id) {
      await this.deps.supabase
        .from('company_billing_profiles')
        .update({ stripe_default_payment_method_id: pmId, updated_at: now })
        .eq('company_id', companyProfile.company_id);

      this.deps.logger.info({ company_id: companyProfile.company_id, payment_method_id: pmId }, 'Auto-set default PM for company');
      await this.deps.eventPublisher.publish('company.billing_payment_method_attached', {
        company_id: companyProfile.company_id, payment_method_id: pmId,
      });
    }

    const { data: firmProfile } = await this.deps.supabase
      .from('firm_billing_profiles')
      .select('firm_id, stripe_default_payment_method_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (firmProfile && !firmProfile.stripe_default_payment_method_id) {
      await this.deps.supabase
        .from('firm_billing_profiles')
        .update({ stripe_default_payment_method_id: pmId, updated_at: now })
        .eq('firm_id', firmProfile.firm_id);

      this.deps.logger.info({ firm_id: firmProfile.firm_id, payment_method_id: pmId }, 'Auto-set default PM for firm');
      await this.deps.eventPublisher.publish('firm.billing_payment_method_attached', {
        firm_id: firmProfile.firm_id, payment_method_id: pmId,
      });
    }
  }

  private async handleUpdated(pm: Stripe.PaymentMethod): Promise<void> {
    if (!pm.id) return;
    const customerId = typeof pm.customer === 'string' ? pm.customer : pm.customer?.id;
    this.deps.logger.info({ payment_method_id: pm.id, customer_id: customerId, type: pm.type }, 'Payment method updated');

    if (customerId) {
      await this.deps.eventPublisher.publish('billing.payment_method_updated', {
        payment_method_id: pm.id, customer_id: customerId, type: pm.type,
      });
    }
  }

  private async handleDetached(pm: Stripe.PaymentMethod): Promise<void> {
    if (!pm.id) return;
    const pmId = pm.id;
    const now = new Date().toISOString();

    const { data: companyProfile } = await this.deps.supabase
      .from('company_billing_profiles').select('company_id')
      .eq('stripe_default_payment_method_id', pmId).maybeSingle();

    if (companyProfile) {
      await this.deps.supabase.from('company_billing_profiles')
        .update({ stripe_default_payment_method_id: null, updated_at: now })
        .eq('stripe_default_payment_method_id', pmId);
      this.deps.logger.info({ company_id: companyProfile.company_id, payment_method_id: pmId }, 'Cleared detached PM from company');
      await revertJobsToDraft(this.deps, { companyId: companyProfile.company_id });
      await this.deps.eventPublisher.publish('company.billing_payment_method_removed', {
        company_id: companyProfile.company_id, payment_method_id: pmId,
      });
    }

    const { data: firmProfile } = await this.deps.supabase
      .from('firm_billing_profiles').select('firm_id')
      .eq('stripe_default_payment_method_id', pmId).maybeSingle();

    if (firmProfile) {
      await this.deps.supabase.from('firm_billing_profiles')
        .update({ stripe_default_payment_method_id: null, updated_at: now })
        .eq('stripe_default_payment_method_id', pmId);
      this.deps.logger.info({ firm_id: firmProfile.firm_id, payment_method_id: pmId }, 'Cleared detached PM from firm');
      await revertJobsToDraft(this.deps, { firmId: firmProfile.firm_id });
      await this.deps.eventPublisher.publish('firm.billing_payment_method_removed', {
        firm_id: firmProfile.firm_id, payment_method_id: pmId,
      });
    }
  }

  private async handleCustomerDeleted(customer: Stripe.Customer): Promise<void> {
    if (!customer.id) return;
    const customerId = customer.id;
    const now = new Date().toISOString();

    const { data: companyProfile } = await this.deps.supabase
      .from('company_billing_profiles').select('company_id')
      .eq('stripe_customer_id', customerId).maybeSingle();

    if (companyProfile) {
      await this.deps.supabase.from('company_billing_profiles')
        .update({ stripe_customer_id: null, stripe_default_payment_method_id: null, updated_at: now })
        .eq('stripe_customer_id', customerId);
      this.deps.logger.info({ company_id: companyProfile.company_id, customer_id: customerId }, 'Cleared deleted customer from company');
      await revertJobsToDraft(this.deps, { companyId: companyProfile.company_id });
      await this.deps.eventPublisher.publish('company.billing_customer_deleted', {
        company_id: companyProfile.company_id, stripe_customer_id: customerId,
      });
    }

    const { data: firmProfile } = await this.deps.supabase
      .from('firm_billing_profiles').select('firm_id')
      .eq('stripe_customer_id', customerId).maybeSingle();

    if (firmProfile) {
      await this.deps.supabase.from('firm_billing_profiles')
        .update({ stripe_customer_id: null, stripe_default_payment_method_id: null, updated_at: now })
        .eq('stripe_customer_id', customerId);
      this.deps.logger.info({ firm_id: firmProfile.firm_id, customer_id: customerId }, 'Cleared deleted customer from firm');
      await revertJobsToDraft(this.deps, { firmId: firmProfile.firm_id });
      await this.deps.eventPublisher.publish('firm.billing_customer_deleted', {
        firm_id: firmProfile.firm_id, stripe_customer_id: customerId,
      });
    }
  }
}
