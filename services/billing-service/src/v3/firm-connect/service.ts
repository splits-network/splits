/**
 * Firm Connect V3 Service — Stripe Connect for firms
 *
 * Uses Stripe-hosted onboarding exclusively. No custom form collection.
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { FirmConnectRepository } from './repository.js';

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

  async getOrCreateAccount(clerkUserId: string, firmId: string) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    let firmAccount = await this.repository.getByFirmId(firmId);

    if (!firmAccount?.stripe_connect_account_id) {
      const account = await this.stripe.accounts.create({
        country: 'US',
        business_type: 'company',
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { firm_id: firmId },
      });
      firmAccount = await this.repository.create(firmId, account.id);
    }

    return this.getAccountStatus(clerkUserId, firmId);
  }

  async getAccountStatus(clerkUserId: string, firmId: string) {
    await this.requireFirmAdmin(clerkUserId, firmId);
    const firmAccount = await this.repository.getByFirmId(firmId);
    if (!firmAccount?.stripe_connect_account_id) {
      return {
        account_id: null,
        firm_id: firmId,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
        requirements: null,
        onboarded: false,
        bank_account: null,
        payout_schedule: null,
        pending_balance: 0,
      };
    }

    const account = await this.safeRetrieveAccount(firmAccount.stripe_connect_account_id);
    const onboarded = !!account.charges_enabled && !!account.payouts_enabled && !!account.details_submitted;

    if (onboarded !== firmAccount.stripe_connect_onboarded) {
      await this.repository.updateOnboardingStatus(firmId, onboarded);
    }

    const externalAccounts = (account.external_accounts?.data || []) as any[];
    const bankAccount = externalAccounts.find((ea: any) => ea.object === 'bank_account');

    // Fetch pending balance
    let pendingBalance = 0;
    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: firmAccount.stripe_connect_account_id,
      });
      pendingBalance = balance.pending?.reduce((sum, b) => sum + b.amount, 0) || 0;
    } catch {
      // Balance may not be available for all account states
    }

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
      pending_balance: pendingBalance,
    };
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
      return_url: body.return_url,
      refresh_url: body.refresh_url,
      type: 'account_onboarding',
    });

    return { url: link.url };
  }

  /**
   * Safely retrieve a Stripe account, handling OAuth/Express permission errors.
   */
  private async safeRetrieveAccount(accountId: string): Promise<Stripe.Account> {
    try {
      return await this.stripe.accounts.retrieve(accountId);
    } catch (err: any) {
      if (err.code === 'oauth_not_supported' || err.statusCode === 403) {
        return await this.stripe.accounts.retrieve(accountId, {
          expand: ['external_accounts'],
        });
      }
      throw err;
    }
  }
}
