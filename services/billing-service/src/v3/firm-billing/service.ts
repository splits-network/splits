/**
 * Firm Billing V3 Service — Business Logic
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { FirmBillingRepository } from './repository.js';

export class FirmBillingService {
  private stripe: Stripe;
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: FirmBillingRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-11-17.clover' });
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async requireFirmAccess(clerkUserId: string, firmId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (context.isPlatformAdmin) return context;

    // Firm members are stored in firm_members (not memberships), so check directly
    const { data: recruiter } = await this.supabase
      .from('recruiters').select('id').eq('user_id', context.identityUserId).single();
    if (!recruiter) throw new ForbiddenError('Firm admin access required');

    const { data: member } = await this.supabase
      .from('firm_members').select('role')
      .eq('firm_id', firmId).eq('recruiter_id', recruiter.id).eq('status', 'active')
      .in('role', ['owner', 'admin']).maybeSingle();
    if (!member) throw new ForbiddenError('Firm admin access required');

    return context;
  }

  async getProfile(firmId: string, clerkUserId: string) {
    await this.requireFirmAccess(clerkUserId, firmId);
    return (await this.repository.findByFirmId(firmId)) ?? null;
  }

  async createProfile(firmId: string, input: any, clerkUserId: string) {
    await this.requireFirmAccess(clerkUserId, firmId);

    const existing = await this.repository.findByFirmId(firmId);
    if (existing) {
      return this.updateProfile(firmId, input, clerkUserId);
    }

    const record = {
      firm_id: firmId,
      billing_email: input.billing_email,
      billing_terms: input.billing_terms || 'net_30',
      invoice_delivery_method: input.invoice_delivery_method || 'email',
      billing_contact_name: input.billing_contact_name || null,
      billing_address: input.billing_address || null,
      stripe_tax_id: input.stripe_tax_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return this.repository.create(record);
  }

  async updateProfile(firmId: string, updates: any, clerkUserId: string) {
    await this.requireFirmAccess(clerkUserId, firmId);

    const existing = await this.repository.findByFirmId(firmId);
    if (!existing) throw new NotFoundError('FirmBillingProfile', firmId);

    const updated = await this.repository.update(firmId, updates);
    if (!updated) throw new NotFoundError('FirmBillingProfile', firmId);
    return updated;
  }

  async createSetupIntent(firmId: string, clerkUserId: string) {
    await this.requireFirmAccess(clerkUserId, firmId);
    const profile = await this.repository.findByFirmId(firmId);
    if (!profile) throw new NotFoundError('FirmBillingProfile', firmId);

    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: profile.billing_email,
        name: profile.billing_contact_name || undefined,
        metadata: { firm_id: firmId },
      });
      customerId = customer.id;
      await this.repository.update(firmId, { stripe_customer_id: customerId });
    }

    const si = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: { firm_id: firmId },
    });

    return { client_secret: si.client_secret!, customer_id: customerId };
  }

  async getPaymentMethod(firmId: string, clerkUserId: string) {
    await this.requireFirmAccess(clerkUserId, firmId);
    const profile = await this.repository.findByFirmId(firmId);
    if (!profile) return { has_payment_method: false, default_payment_method: null };

    if (!profile.stripe_customer_id || !profile.stripe_default_payment_method_id) {
      return { has_payment_method: false, default_payment_method: null };
    }

    try {
      const pm = await this.stripe.paymentMethods.retrieve(profile.stripe_default_payment_method_id);
      return {
        has_payment_method: true,
        default_payment_method: {
          id: pm.id,
          type: pm.type,
          brand: pm.card?.brand || undefined,
          last4: pm.card?.last4 || pm.us_bank_account?.last4 || undefined,
          exp_month: pm.card?.exp_month || undefined,
          exp_year: pm.card?.exp_year || undefined,
          bank_name: pm.us_bank_account?.bank_name || undefined,
          account_type: pm.us_bank_account?.account_type || undefined,
          display_label: pm.card
            ? `${(pm.card.brand || 'Card').charAt(0).toUpperCase() + (pm.card.brand || 'card').slice(1)} ••••${pm.card.last4}`
            : pm.us_bank_account
              ? `${pm.us_bank_account.bank_name || 'Bank'} ••••${pm.us_bank_account.last4}`
              : pm.type,
        },
      };
    } catch {
      return { has_payment_method: false, default_payment_method: null };
    }
  }

  async updatePaymentMethod(firmId: string, paymentMethodId: string, clerkUserId: string) {
    await this.requireFirmAccess(clerkUserId, firmId);
    const profile = await this.repository.findByFirmId(firmId);
    if (!profile?.stripe_customer_id) throw new BadRequestError('No Stripe customer');

    await this.stripe.paymentMethods.attach(paymentMethodId, { customer: profile.stripe_customer_id });
    await this.stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    await this.repository.update(firmId, { stripe_default_payment_method_id: paymentMethodId });
    return { success: true };
  }

  async getReadiness(firmId: string, clerkUserId: string) {
    await this.requireFirmAccess(clerkUserId, firmId);
    const profile = await this.repository.findByFirmId(firmId);

    if (!profile) {
      return {
        status: 'not_started', has_billing_profile: false, has_billing_email: false,
        has_billing_terms: false, has_stripe_customer: false, has_payment_method: false,
        has_billing_contact: false, has_billing_address: false,
        requires_payment_method: true, billing_terms: null,
      };
    }

    const ready = !!profile.billing_email && !!profile.stripe_customer_id && !!profile.stripe_default_payment_method_id;
    return {
      status: ready ? 'ready' : 'incomplete',
      has_billing_profile: true,
      has_billing_email: !!profile.billing_email,
      has_billing_terms: !!profile.billing_terms,
      has_stripe_customer: !!profile.stripe_customer_id,
      has_payment_method: !!profile.stripe_default_payment_method_id,
      has_billing_contact: !!profile.billing_contact_name,
      has_billing_address: !!profile.billing_address,
      requires_payment_method: profile.billing_terms === 'immediate',
      billing_terms: profile.billing_terms,
    };
  }
}
