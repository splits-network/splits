/**
 * Firm Billing V3 Service — Business Logic
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { FirmBillingRepository } from './repository';

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
    const profile = await this.repository.findByFirmId(firmId);
    if (!profile) throw new NotFoundError('FirmBillingProfile', firmId);
    return profile;
  }

  async createProfile(firmId: string, input: any, clerkUserId: string) {
    await this.requireFirmAccess(clerkUserId, firmId);

    const existing = await this.repository.findByFirmId(firmId);
    if (existing) throw new BadRequestError('Firm billing profile already exists');

    const record = {
      firm_id: firmId,
      billing_email: input.billing_email,
      billing_terms: input.billing_terms || 'net_30',
      invoice_delivery_method: input.invoice_delivery_method || 'email',
      billing_contact_name: input.billing_contact_name || null,
      billing_address: input.billing_address || null,
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
