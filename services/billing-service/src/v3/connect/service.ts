/**
 * Connect V3 Service — Stripe Connect for individual recruiters
 *
 * Uses Stripe-hosted onboarding exclusively. No custom form collection.
 * All identity, bank account, and TOS handled by Stripe's hosted flow.
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { ConnectRepository } from './repository';

export class ConnectService {
  private stripe: Stripe;
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ConnectRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    });
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getOrCreateAccount(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.recruiterId) throw new ForbiddenError('Recruiter access required');

    const recruiter = await this.repository.getRecruiterById(context.recruiterId);
    if (!recruiter) throw new NotFoundError('Recruiter', context.recruiterId);

    if (!recruiter.stripe_connect_account_id) {
      const account = await this.stripe.accounts.create({
        country: 'US',
        business_type: 'individual',
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { recruiter_id: context.recruiterId, user_id: context.identityUserId || '' },
      });
      await this.repository.setConnectAccount(context.recruiterId, account.id);
    }

    return this.getAccountStatus(clerkUserId);
  }

  async getAccountStatus(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.recruiterId) throw new ForbiddenError('Recruiter access required');

    const recruiter = await this.repository.getRecruiterById(context.recruiterId);
    if (!recruiter?.stripe_connect_account_id) throw new NotFoundError('StripeConnect', context.recruiterId);

    const account = await this.safeRetrieveAccount(recruiter.stripe_connect_account_id);
    const onboarded = !!account.charges_enabled && !!account.payouts_enabled && !!account.details_submitted;

    if (onboarded !== !!recruiter.stripe_connect_onboarded) {
      await this.repository.updateConnectStatus(context.recruiterId, onboarded, onboarded ? new Date().toISOString() : null);
    }

    const externalAccounts = (account.external_accounts?.data || []) as any[];
    const bankAccount = externalAccounts.find((ea: any) => ea.object === 'bank_account');

    // Fetch pending balance
    let pendingBalance = 0;
    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: recruiter.stripe_connect_account_id,
      });
      pendingBalance = balance.pending?.reduce((sum, b) => sum + b.amount, 0) || 0;
    } catch {
      // Balance may not be available for all account states
    }

    return {
      account_id: recruiter.stripe_connect_account_id,
      account_type: account.type || 'custom',
      charges_enabled: !!account.charges_enabled,
      payouts_enabled: !!account.payouts_enabled,
      details_submitted: !!account.details_submitted,
      requirements: account.requirements || null,
      onboarded,
      recruiter_id: context.recruiterId,
      bank_account: bankAccount ? { bank_name: bankAccount.bank_name || 'Bank Account', last4: bankAccount.last4, account_type: bankAccount.account_holder_type || 'individual' } : null,
      payout_schedule: (account.settings as any)?.payouts?.schedule || null,
      pending_balance: pendingBalance,
    };
  }

  async listPayouts(clerkUserId: string, limit: number = 10) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.recruiterId) throw new ForbiddenError('Recruiter access required');

    const recruiter = await this.repository.getRecruiterById(context.recruiterId);
    if (!recruiter?.stripe_connect_account_id) return [];

    const payouts = await this.stripe.payouts.list({ limit }, { stripeAccount: recruiter.stripe_connect_account_id });
    return payouts.data.map(p => ({
      id: p.id, amount: p.amount, currency: p.currency,
      status: p.status, arrival_date: new Date(p.arrival_date * 1000).toISOString(),
      created: new Date(p.created * 1000).toISOString(),
    }));
  }

  async createOnboardingLink(clerkUserId: string, body: { return_url: string; refresh_url: string }) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.recruiterId) throw new ForbiddenError('Recruiter access required');

    const recruiter = await this.repository.getRecruiterById(context.recruiterId);
    if (!recruiter?.stripe_connect_account_id) throw new NotFoundError('StripeConnect', context.recruiterId);

    const link = await this.stripe.accountLinks.create({
      account: recruiter.stripe_connect_account_id,
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
