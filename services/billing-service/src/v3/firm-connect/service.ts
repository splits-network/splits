/**
 * Firm Connect V3 Service — Stripe Connect for firms
 *
 * Similar to individual connect but uses company business_type.
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { FirmConnectRepository } from './repository';

export class FirmConnectService {
  private stripe: Stripe;
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: FirmConnectRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    });
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async requireFirmAdmin(clerkUserId: string, firmId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    // Firm admins or platform admins can manage firm connect
    if (!context.isPlatformAdmin && !context.organizationIds.includes(firmId)) {
      throw new ForbiddenError('Firm admin access required');
    }
    return context;
  }

  async getOrCreateAccount(clerkUserId: string, firmId: string) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    let firmAccount = await this.repository.getByFirmId(firmId);

    if (!firmAccount?.stripe_connect_account_id) {
      const account = await this.stripe.accounts.create({
        country: 'US',
        business_type: 'company',
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        controller: {
          stripe_dashboard: { type: 'none' },
          fees: { payer: 'application' },
          losses: { payments: 'application' },
          requirement_collection: 'application',
        },
        metadata: { firm_id: firmId },
      });
      firmAccount = await this.repository.create(firmId, account.id);
    }

    return this.getAccountStatus(clerkUserId, firmId);
  }

  async getAccountStatus(clerkUserId: string, firmId: string) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    const firmAccount = await this.repository.getByFirmId(firmId);
    if (!firmAccount?.stripe_connect_account_id) throw new NotFoundError('FirmConnect', firmId);

    const account = await this.stripe.accounts.retrieve(firmAccount.stripe_connect_account_id);
    const onboarded = !!account.charges_enabled && !!account.payouts_enabled && !!account.details_submitted;

    if (onboarded !== firmAccount.stripe_connect_onboarded) {
      await this.repository.updateOnboardingStatus(firmId, onboarded);
    }

    const externalAccounts = (account.external_accounts?.data || []) as any[];
    const bankAccount = externalAccounts.find((ea: any) => ea.object === 'bank_account');

    return {
      account_id: firmAccount.stripe_connect_account_id,
      firm_id: firmId,
      charges_enabled: !!account.charges_enabled,
      payouts_enabled: !!account.payouts_enabled,
      details_submitted: !!account.details_submitted,
      requirements: account.requirements,
      onboarded,
      bank_account: bankAccount ? { bank_name: bankAccount.bank_name || 'Bank Account', last4: bankAccount.last4, account_type: bankAccount.account_holder_type || 'company' } : null,
      payout_schedule: (account.settings as any)?.payouts?.schedule || null,
      pending_balance: 0,
    };
  }

  async updateAccountDetails(clerkUserId: string, firmId: string, body: any) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    const firmAccount = await this.repository.getByFirmId(firmId);
    if (!firmAccount?.stripe_connect_account_id) throw new NotFoundError('FirmConnect', firmId);

    const updateParams: any = {
      individual: {
        first_name: body.first_name, last_name: body.last_name,
        email: body.email, phone: body.phone, dob: body.dob,
        ...(body.ssn_last_4 && { ssn_last_4: body.ssn_last_4 }),
        address: body.address,
      },
    };
    if (body.company_name) updateParams.company = { name: body.company_name, phone: body.company_phone, tax_id: body.company_tax_id };

    await this.stripe.accounts.update(firmAccount.stripe_connect_account_id, updateParams);
    return this.getAccountStatus(clerkUserId, firmId);
  }

  async addBankAccount(clerkUserId: string, firmId: string, token: string) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    const firmAccount = await this.repository.getByFirmId(firmId);
    if (!firmAccount?.stripe_connect_account_id) throw new NotFoundError('FirmConnect', firmId);

    await this.stripe.accounts.createExternalAccount(firmAccount.stripe_connect_account_id, { external_account: token });
    return this.getAccountStatus(clerkUserId, firmId);
  }

  async acceptTos(clerkUserId: string, firmId: string, ip: string) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    const firmAccount = await this.repository.getByFirmId(firmId);
    if (!firmAccount?.stripe_connect_account_id) throw new NotFoundError('FirmConnect', firmId);

    await this.stripe.accounts.update(firmAccount.stripe_connect_account_id, {
      tos_acceptance: { date: Math.floor(Date.now() / 1000), ip },
    });

    const status = await this.getAccountStatus(clerkUserId, firmId);
    const account = await this.stripe.accounts.retrieve(firmAccount.stripe_connect_account_id);
    const needsVerification = (account.requirements?.currently_due || []).some((r: string) => r.includes('verification'));

    return { ...status, needs_identity_verification: needsVerification };
  }

  async createVerificationSession(clerkUserId: string, firmId: string) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    const firmAccount = await this.repository.getByFirmId(firmId);
    if (!firmAccount?.stripe_connect_account_id) throw new NotFoundError('FirmConnect', firmId);

    const session = await this.stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { firm_id: firmId, stripe_account_id: firmAccount.stripe_connect_account_id },
    });

    return { client_secret: session.client_secret!, session_id: session.id, status: session.status };
  }

  async listPayouts(clerkUserId: string, firmId: string, limit: number = 10) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    const firmAccount = await this.repository.getByFirmId(firmId);
    if (!firmAccount?.stripe_connect_account_id) return [];

    const payouts = await this.stripe.payouts.list({ limit }, { stripeAccount: firmAccount.stripe_connect_account_id });
    return payouts.data.map(p => ({
      id: p.id, amount: p.amount, currency: p.currency,
      status: p.status, arrival_date: new Date(p.arrival_date * 1000).toISOString(),
      created: new Date(p.created * 1000).toISOString(),
    }));
  }

  async createOnboardingLink(clerkUserId: string, firmId: string, body: { return_url: string; refresh_url: string }) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    const firmAccount = await this.repository.getByFirmId(firmId);
    if (!firmAccount?.stripe_connect_account_id) throw new NotFoundError('FirmConnect', firmId);

    const link = await this.stripe.accountLinks.create({
      account: firmAccount.stripe_connect_account_id,
      return_url: body.return_url, refresh_url: body.refresh_url,
      type: 'account_onboarding',
    });

    return { url: link.url };
  }
}
