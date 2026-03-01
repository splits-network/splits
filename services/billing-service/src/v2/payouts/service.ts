import Stripe from 'stripe';
import { IEventPublisher } from '../shared/events';
import { buildPaginationResponse, requireBillingAdmin } from '../shared/helpers';
import type { AccessContext } from '../shared/access';
import { PlacementSnapshotRepository } from '../placement-snapshot/repository';
import { PlacementSnapshot } from '../placement-snapshot/types';
import { PlacementSplitRepository } from './placement-split-repository';
import { PlacementPayoutTransactionRepository, TransactionListFilters } from './placement-payout-transaction-repository';
import type { PlacementSplit, PlacementPayoutTransaction, PlacementSplitInsert, PlacementPayoutTransactionInsert, PayoutRole } from './types';
import { RecruiterConnectRepository } from './recruiter-connect-repository';
import { FirmStripeConnectRepository } from '../firm-connect/repository';

export class PayoutServiceV2 {
    private stripe: Stripe;

    constructor(
        private snapshotRepository: PlacementSnapshotRepository,
        private splitRepository: PlacementSplitRepository,
        private transactionRepository: PlacementPayoutTransactionRepository,
        private recruiterConnectRepository: RecruiterConnectRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: IEventPublisher,
        stripeSecretKey?: string,
        private firmConnectRepository?: FirmStripeConnectRepository
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    /**
     * List payout transactions with pagination and filtering
     */
    async listTransactions(
        filters: TransactionListFilters = {},
        clerkUserId: string
    ): Promise<{
        data: PlacementPayoutTransaction[];
        pagination: ReturnType<typeof buildPaginationResponse>;
    }> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const { data, total } = await this.transactionRepository.listTransactions(filters);
        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    /**
     * Commission Calculator - Creates placement_splits (attribution) and
     * placement_payout_transactions (execution) from the immutable placement snapshot.
     */
    async createSplitsAndTransactionsForPlacement(
        placementId: string,
        clerkUserId: string
    ): Promise<{ splits: PlacementSplit[], transactions: PlacementPayoutTransaction[] }> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        return this.createSplitsAndTransactionsCore(placementId);
    }

    /**
     * INTERNAL: Create splits and transactions for placement - used by event consumers.
     * Bypasses permission checks for automated system processing.
     */
    async createSplitsAndTransactionsForPlacementInternal(
        placementId: string
    ): Promise<{ splits: PlacementSplit[], transactions: PlacementPayoutTransaction[] }> {
        return this.createSplitsAndTransactionsCore(placementId);
    }

    /**
     * Core split/transaction creation logic (shared by public and internal methods)
     */
    private async createSplitsAndTransactionsCore(
        placementId: string
    ): Promise<{ splits: PlacementSplit[], transactions: PlacementPayoutTransaction[] }> {
        // Check if splits already exist (idempotency)
        const existingSplits = await this.splitRepository.getByPlacementId(placementId);
        if (existingSplits.length > 0) {
            const existingTransactions = await this.transactionRepository.getByPlacementId(placementId);
            return { splits: existingSplits, transactions: existingTransactions };
        }

        const snapshot = await this.snapshotRepository.getByPlacementId(placementId);
        if (!snapshot) {
            throw new Error(`Placement snapshot not found for placement ${placementId}`);
        }

        // === STEP 1: Create placement_splits (attribution layer) ===
        const roles: {
            idKey: keyof PlacementSnapshot;
            rateKey: keyof PlacementSnapshot;
            firmIdKey: keyof PlacementSnapshot;
            takeRateKey: keyof PlacementSnapshot;
            role: PayoutRole;
        }[] = [
            { idKey: 'candidate_recruiter_id', rateKey: 'candidate_recruiter_rate', firmIdKey: 'candidate_recruiter_firm_id', takeRateKey: 'candidate_recruiter_admin_take_rate', role: 'candidate_recruiter' },
            { idKey: 'company_recruiter_id', rateKey: 'company_recruiter_rate', firmIdKey: 'company_recruiter_firm_id', takeRateKey: 'company_recruiter_admin_take_rate', role: 'company_recruiter' },
            { idKey: 'job_owner_recruiter_id', rateKey: 'job_owner_rate', firmIdKey: 'job_owner_firm_id', takeRateKey: 'job_owner_admin_take_rate', role: 'job_owner' },
            { idKey: 'candidate_sourcer_recruiter_id', rateKey: 'candidate_sourcer_rate', firmIdKey: 'candidate_sourcer_firm_id', takeRateKey: 'candidate_sourcer_admin_take_rate', role: 'candidate_sourcer' },
            { idKey: 'company_sourcer_recruiter_id', rateKey: 'company_sourcer_rate', firmIdKey: 'company_sourcer_firm_id', takeRateKey: 'company_sourcer_admin_take_rate', role: 'company_sourcer' },
        ];

        const splitsToCreate: PlacementSplitInsert[] = [];
        for (const { idKey, rateKey, firmIdKey, takeRateKey, role } of roles) {
            const recruiterId = snapshot[idKey] as string | null;
            const rate = snapshot[rateKey] as number | null;
            if (recruiterId && rate) {
                const splitAmount = (snapshot.total_placement_fee * rate) / 100;
                const firmId = snapshot[firmIdKey] as string | null;
                const adminTakeRate = snapshot[takeRateKey] as number | null;
                const effectiveTakeRate = (firmId && adminTakeRate && adminTakeRate > 0) ? adminTakeRate : 0;
                const firmTakeAmount = (splitAmount * effectiveTakeRate) / 100;
                const netAmount = splitAmount - firmTakeAmount;

                splitsToCreate.push({
                    placement_id: placementId,
                    recruiter_id: recruiterId,
                    role,
                    split_percentage: rate,
                    split_amount: splitAmount,
                    firm_id: firmId || undefined,
                    firm_admin_take_rate: effectiveTakeRate || undefined,
                    firm_admin_take_amount: firmTakeAmount || undefined,
                    net_amount: netAmount,
                });
            }
        }

        if (splitsToCreate.length === 0) {
            return { splits: [], transactions: [] };
        }

        const createdSplits = await this.splitRepository.createBatch(splitsToCreate);

        // === STEP 2: Create placement_payout_transactions (execution layer) ===
        const transactionsToCreate: PlacementPayoutTransactionInsert[] = [];

        for (const split of createdSplits) {
            const hasAdminTake = (split.firm_admin_take_amount || 0) > 0;

            if (hasAdminTake) {
                // Member payout (net amount after firm take)
                transactionsToCreate.push({
                    placement_split_id: split.id,
                    placement_id: split.placement_id,
                    recruiter_id: split.recruiter_id,
                    amount: split.net_amount || 0,
                    status: 'pending',
                    transaction_type: 'member_payout',
                });
                // Firm admin take (goes to firm's Stripe Connect account)
                transactionsToCreate.push({
                    placement_split_id: split.id,
                    placement_id: split.placement_id,
                    recruiter_id: split.recruiter_id,
                    amount: split.firm_admin_take_amount || 0,
                    status: 'pending',
                    transaction_type: 'firm_admin_take',
                    firm_id: split.firm_id || undefined,
                });
            } else {
                // No firm take — single transaction for full amount
                transactionsToCreate.push({
                    placement_split_id: split.id,
                    placement_id: split.placement_id,
                    recruiter_id: split.recruiter_id,
                    amount: split.split_amount || 0,
                    status: 'pending',
                    transaction_type: 'member_payout',
                });
            }
        }

        const createdTransactions = await this.transactionRepository.createBatch(transactionsToCreate);

        const platformRemainder = this.calculatePlatformRemainder(snapshot);
        const totalPaidOut = createdSplits.reduce((sum, s) => sum + (s.split_amount || 0), 0);

        await this.publishEvent('placement.splits_created', {
            placementId,
            splitCount: createdSplits.length,
            transactionCount: createdTransactions.length,
            totalPaidOut,
            platformRemainder,
            roleTiers: {
                candidate_recruiter: snapshot.candidate_recruiter_tier,
                company_recruiter: snapshot.company_recruiter_tier,
                job_owner: snapshot.job_owner_tier,
                candidate_sourcer: snapshot.candidate_sourcer_tier,
                company_sourcer: snapshot.company_sourcer_tier,
            },
        });

        return { splits: createdSplits, transactions: createdTransactions };
    }

    /**
     * Process a single payout transaction via Stripe Connect transfer
     */
    async processPayoutTransaction(
        transactionId: string,
        clerkUserId: string
    ): Promise<PlacementPayoutTransaction> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        return this.executeTransactionProcessing(transactionId);
    }

    /**
     * Internal: process a transaction without auth checks (for system/cron use)
     */
    private async executeTransactionProcessing(
        transactionId: string
    ): Promise<PlacementPayoutTransaction> {
        const transaction = await this.transactionRepository.getById(transactionId);
        if (!transaction) {
            throw new Error(`Payout transaction ${transactionId} not found`);
        }

        if (transaction.status !== 'pending' && transaction.status !== 'failed') {
            throw new Error(`Cannot process transaction in ${transaction.status} status`);
        }

        if (transaction.amount <= 0) {
            throw new Error(`Transaction amount must be positive (recruiter ${transaction.recruiter_id}, amount: $${transaction.amount})`);
        }

        // Route to firm or recruiter Connect account based on transaction type
        if (transaction.transaction_type === 'firm_admin_take' && transaction.firm_id) {
            return this.processFirmAdminTakeTransaction(transaction);
        }

        return this.processMemberPayoutTransaction(transaction);
    }

    /**
     * Process a member payout transaction (to recruiter's Stripe Connect)
     */
    private async processMemberPayoutTransaction(
        transaction: PlacementPayoutTransaction
    ): Promise<PlacementPayoutTransaction> {
        const recruiterStatus = await this.recruiterConnectRepository.getStatus(transaction.recruiter_id);
        if (!recruiterStatus?.stripe_connect_account_id) {
            await this.publishEvent('payout_transaction.connect_required', {
                recruiterId: transaction.recruiter_id,
                placementId: transaction.placement_id,
                transactionId: transaction.id,
                amount: transaction.amount,
                reason: 'no_connect_account',
            });
            throw new Error(`Recruiter ${transaction.recruiter_id} does not have a Stripe Connect account — they must complete Stripe onboarding before payouts can be processed`);
        }

        if (!recruiterStatus.stripe_connect_onboarded) {
            await this.publishEvent('payout_transaction.connect_required', {
                recruiterId: transaction.recruiter_id,
                placementId: transaction.placement_id,
                transactionId: transaction.id,
                amount: transaction.amount,
                reason: 'not_onboarded',
            });
            throw new Error(`Recruiter ${transaction.recruiter_id} has not completed Stripe Connect onboarding — payouts cannot be sent until onboarding is finished`);
        }

        return this.executeStripeTransfer(transaction, recruiterStatus.stripe_connect_account_id, {
            placement_id: transaction.placement_id,
            recruiter_id: transaction.recruiter_id,
            placement_split_id: transaction.placement_split_id,
            transaction_id: transaction.id,
            transaction_type: 'member_payout',
        });
    }

    /**
     * Process a firm admin take transaction (to firm's Stripe Connect)
     */
    private async processFirmAdminTakeTransaction(
        transaction: PlacementPayoutTransaction
    ): Promise<PlacementPayoutTransaction> {
        if (!this.firmConnectRepository) {
            throw new Error('FirmStripeConnectRepository not configured — cannot process firm admin take transactions');
        }

        const firmAccount = await this.firmConnectRepository.getByFirmId(transaction.firm_id!);
        if (!firmAccount?.stripe_connect_account_id) {
            await this.publishEvent('payout_transaction.connect_required', {
                firmId: transaction.firm_id,
                placementId: transaction.placement_id,
                transactionId: transaction.id,
                amount: transaction.amount,
                reason: 'no_firm_connect_account',
            });
            throw new Error(`Firm ${transaction.firm_id} does not have a Stripe Connect account — firm must complete Stripe onboarding before admin take payouts can be processed`);
        }

        if (!firmAccount.stripe_connect_onboarded) {
            await this.publishEvent('payout_transaction.connect_required', {
                firmId: transaction.firm_id,
                placementId: transaction.placement_id,
                transactionId: transaction.id,
                amount: transaction.amount,
                reason: 'firm_not_onboarded',
            });
            throw new Error(`Firm ${transaction.firm_id} has not completed Stripe Connect onboarding — admin take payouts cannot be sent until onboarding is finished`);
        }

        return this.executeStripeTransfer(transaction, firmAccount.stripe_connect_account_id, {
            placement_id: transaction.placement_id,
            firm_id: transaction.firm_id!,
            recruiter_id: transaction.recruiter_id,
            placement_split_id: transaction.placement_split_id,
            transaction_id: transaction.id,
            transaction_type: 'firm_admin_take',
        });
    }

    /**
     * Common Stripe transfer execution
     */
    private async executeStripeTransfer(
        transaction: PlacementPayoutTransaction,
        connectAccountId: string,
        metadata: Record<string, string>
    ): Promise<PlacementPayoutTransaction> {
        const amountCents = Math.round(transaction.amount * 100);
        if (amountCents <= 0) {
            throw new Error('Transaction amount must be at least $0.01');
        }

        await this.transactionRepository.updateStatus(transaction.id, 'processing', {
            stripe_connect_account_id: connectAccountId,
        });

        try {
            const transfer = await this.stripe.transfers.create(
                {
                    amount: amountCents,
                    currency: 'usd',
                    destination: connectAccountId,
                    metadata,
                },
                {
                    idempotencyKey: `placement_payout_transaction_${transaction.id}`,
                }
            );

            return await this.transactionRepository.updateStatus(transaction.id, 'paid', {
                stripe_transfer_id: transfer.id,
                stripe_connect_account_id: connectAccountId,
                retry_count: transaction.retry_count || 0,
            });
        } catch (error: any) {
            const retryCount = (transaction.retry_count || 0) + 1;
            await this.transactionRepository.updateStatus(transaction.id, 'failed', {
                failure_reason: error?.message || 'Stripe transfer failed',
                retry_count: retryCount,
            });
            throw error;
        }
    }

    /**
     * Process all pending payout transactions for a placement (admin-gated)
     */
    async processPlacementTransactions(
        placementId: string,
        clerkUserId: string
    ): Promise<PlacementPayoutTransaction[]> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        return this.executePlacementTransactionProcessing(placementId);
    }

    /**
     * Process all pending payout transactions for a placement (system/cron use, no auth check)
     */
    async processPlacementTransactionsInternal(
        placementId: string
    ): Promise<PlacementPayoutTransaction[]> {
        return this.executePlacementTransactionProcessing(placementId);
    }

    private async executePlacementTransactionProcessing(
        placementId: string
    ): Promise<PlacementPayoutTransaction[]> {
        const transactions = await this.transactionRepository.getByPlacementId(placementId);
        const pending = transactions.filter(t => t.status === 'pending' || t.status === 'failed');

        if (pending.length === 0) {
            return [];
        }

        const results: PlacementPayoutTransaction[] = [];
        const errors: Array<{ transactionId: string; recruiterId: string; amount: number; error: string }> = [];

        for (const transaction of pending) {
            // Skip zero-amount transactions (no-op, mark as paid)
            if (transaction.amount <= 0) {
                const skipped = await this.transactionRepository.updateStatus(transaction.id, 'paid', {
                    failure_reason: 'Skipped: zero amount',
                });
                results.push(skipped);
                continue;
            }

            try {
                const processed = await this.executeTransactionProcessing(transaction.id);
                results.push(processed);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push({
                    transactionId: transaction.id,
                    recruiterId: transaction.recruiter_id,
                    amount: transaction.amount,
                    error: errorMessage,
                });
                // Continue processing remaining transactions
            }
        }

        // If ALL transactions failed, throw a summary error
        if (errors.length > 0 && results.filter(r => r.status === 'paid').length === 0) {
            const summary = errors.map(e => `$${e.amount} to ${e.recruiterId}: ${e.error}`).join('; ');
            throw new Error(`All ${errors.length} transaction(s) failed: ${summary}`);
        }

        // If some failed but some succeeded, log but don't throw (partial success)
        if (errors.length > 0) {
            console.warn(
                `Partial payout processing for placement ${placementId}: ` +
                `${results.filter(r => r.status === 'paid').length} succeeded, ${errors.length} failed`,
                errors
            );
        }

        return results;
    }

    calculatePlatformRemainder(snapshot: PlacementSnapshot): number {
        const totalPaid = [
            snapshot.candidate_recruiter_rate || 0,
            snapshot.company_recruiter_rate || 0,
            snapshot.job_owner_rate || 0,
            snapshot.candidate_sourcer_rate || 0,
            snapshot.company_sourcer_rate || 0,
        ].reduce((sum, rate) => sum + rate, 0);

        const remainderPercent = 100 - totalPaid;
        return (snapshot.total_placement_fee * remainderPercent) / 100;
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
