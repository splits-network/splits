/**
 * Payouts V3 Service — Business Logic
 *
 * Commission calculator + Stripe transfer execution.
 * Split creation logic in split-calculator.ts.
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { PayoutRepository, PayoutScopeFilters } from './repository.js';
import { SplitCalculator } from './split-calculator.js';
import { TransactionListParams } from './types.js';

export class PayoutService {
  private stripe: Stripe;
  private accessResolver: AccessContextResolver;
  private splitCalculator: SplitCalculator;

  constructor(
    private repository: PayoutRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    });
    this.accessResolver = new AccessContextResolver(supabase);
    this.splitCalculator = new SplitCalculator(repository, eventPublisher);
  }

  async listTransactions(params: TransactionListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: PayoutScopeFilters = {};

    if (!context.isPlatformAdmin) {
      if (!context.recruiterId) throw new ForbiddenError('Insufficient permissions');
      scopeFilters.recruiter_id = context.recruiterId;
    }

    const { data, total } = await this.repository.listTransactions(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async createSplitsAndTransactions(placementId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can create splits');
    }
    return this.splitCalculator.createSplitsAndTransactions(placementId);
  }

  /** Internal: bypasses auth for event consumers */
  async createSplitsAndTransactionsInternal(placementId: string) {
    return this.splitCalculator.createSplitsAndTransactions(placementId);
  }

  async processTransaction(transactionId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can process payouts');
    }
    return this.executeTransfer(transactionId);
  }

  async processPlacementTransactions(placementId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can process payouts');
    }
    return this.executePlacementTransfers(placementId);
  }

  /** Internal: bypasses auth for system/cron use */
  async processPlacementTransactionsInternal(placementId: string) {
    return this.executePlacementTransfers(placementId);
  }

  private async executeTransfer(transactionId: string): Promise<any> {
    const transaction = await this.repository.getTransactionById(transactionId);
    if (!transaction) throw new NotFoundError('PayoutTransaction', transactionId);

    if (transaction.status !== 'pending' && transaction.status !== 'failed') {
      throw new BadRequestError(`Cannot process transaction in ${transaction.status} status`);
    }
    if (transaction.amount <= 0) {
      throw new BadRequestError('Transaction amount must be positive');
    }

    // Route to firm or recruiter based on type
    const connectAccountId = transaction.transaction_type === 'firm_admin_take' && transaction.firm_id
      ? await this.resolveFirmConnect(transaction.firm_id)
      : await this.resolveRecruiterConnect(transaction.recruiter_id);

    return this.doStripeTransfer(transaction, connectAccountId);
  }

  private async resolveFirmConnect(firmId: string): Promise<string> {
    const firm = await this.repository.getFirmConnectAccount(firmId);
    if (!firm?.stripe_connect_account_id) {
      throw new BadRequestError(`Firm ${firmId} has no Stripe Connect account`);
    }
    if (!firm.stripe_connect_onboarded) {
      throw new BadRequestError(`Firm ${firmId} has not completed Stripe onboarding`);
    }
    return firm.stripe_connect_account_id;
  }

  private async resolveRecruiterConnect(recruiterId: string): Promise<string> {
    const recruiter = await this.repository.getRecruiterConnectStatus(recruiterId);
    if (!recruiter?.stripe_connect_account_id) {
      throw new BadRequestError(`Recruiter ${recruiterId} has no Stripe Connect account`);
    }
    if (!recruiter.stripe_connect_onboarded) {
      throw new BadRequestError(`Recruiter ${recruiterId} has not completed Stripe onboarding`);
    }
    return recruiter.stripe_connect_account_id;
  }

  private async doStripeTransfer(transaction: any, connectAccountId: string): Promise<any> {
    const amountCents = Math.round(transaction.amount * 100);
    await this.repository.updateTransactionStatus(transaction.id, 'processing', {
      stripe_connect_account_id: connectAccountId,
    });

    try {
      const transfer = await this.stripe.transfers.create(
        {
          amount: amountCents,
          currency: 'usd',
          destination: connectAccountId,
          metadata: {
            placement_id: transaction.placement_id,
            transaction_id: transaction.id,
            transaction_type: transaction.transaction_type || 'member_payout',
          },
        },
        { idempotencyKey: `placement_payout_transaction_${transaction.id}` }
      );

      return this.repository.updateTransactionStatus(transaction.id, 'paid', {
        stripe_transfer_id: transfer.id,
        stripe_connect_account_id: connectAccountId,
      });
    } catch (error: any) {
      await this.repository.updateTransactionStatus(transaction.id, 'failed', {
        failure_reason: error?.message || 'Stripe transfer failed',
        retry_count: (transaction.retry_count || 0) + 1,
      });
      throw error;
    }
  }

  private async executePlacementTransfers(placementId: string): Promise<any[]> {
    const transactions = await this.repository.getTransactionsByPlacementId(placementId);
    const pending = transactions.filter(t => t.status === 'pending' || t.status === 'failed');
    if (pending.length === 0) return [];

    const results: any[] = [];
    for (const transaction of pending) {
      if (transaction.amount <= 0) {
        const skipped = await this.repository.updateTransactionStatus(transaction.id, 'paid', {
          failure_reason: 'Skipped: zero amount',
        });
        results.push(skipped);
        continue;
      }
      try {
        const processed = await this.executeTransfer(transaction.id);
        results.push(processed);
      } catch {
        // Continue processing remaining — partial success is OK
      }
    }
    return results;
  }
}
