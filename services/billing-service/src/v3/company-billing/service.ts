/**
 * Company Billing V3 Service — Business logic
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError, NotFoundError, BadRequestError } from '@splits-network/shared-fastify';
import { CompanyBillingRepository } from './repository.js';
import { CompanyBillingCreateInput, CompanyBillingUpdateInput } from './types.js';

export class CompanyBillingService {
  private accessResolver: AccessContextResolver;
  private stripe: Stripe;

  constructor(
    private repository: CompanyBillingRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-11-17.clover' });
  }

  async list(clerkUserId: string, page = 1, limit = 25) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.organizationIds.length === 0) {
      throw new ForbiddenError('Insufficient permissions');
    }
    const { data, total } = await this.repository.list(page, limit);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getByCompanyId(companyId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.findByCompanyId(companyId);
  }

  async upsert(companyId: string, input: CompanyBillingCreateInput, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    const existing = await this.repository.findByCompanyId(companyId);
    if (existing) {
      return this.repository.update(companyId, input);
    }
    return this.repository.create(companyId, input);
  }

  async update(companyId: string, input: CompanyBillingUpdateInput, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.update(companyId, input);
  }

  async createSetupIntent(companyId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    const profile = await this.repository.findByCompanyId(companyId);
    if (!profile) throw new NotFoundError('CompanyBillingProfile', companyId);

    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: profile.billing_email,
        name: profile.billing_contact_name || undefined,
        metadata: { company_id: companyId },
      });
      customerId = customer.id;
      await this.repository.update(companyId, { stripe_customer_id: customerId });
    }

    const si = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: { company_id: companyId },
    });

    return { client_secret: si.client_secret!, customer_id: customerId };
  }

  async updatePaymentMethod(companyId: string, paymentMethodId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    const profile = await this.repository.findByCompanyId(companyId);
    if (!profile?.stripe_customer_id) throw new BadRequestError('No Stripe customer');

    await this.stripe.paymentMethods.attach(paymentMethodId, { customer: profile.stripe_customer_id });
    await this.stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    await this.repository.update(companyId, { stripe_default_payment_method_id: paymentMethodId });
    return { success: true };
  }

  async getPaymentMethod(companyId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    const profile = await this.repository.findByCompanyId(companyId);
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

  async getReadiness(companyId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    const profile = await this.repository.findByCompanyId(companyId);

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

  private async assertAccess(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.organizationIds.length === 0) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }
}
