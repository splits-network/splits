import { EventPublisher } from '../shared/events';
import { buildPaginationResponse, requireBillingAdmin } from '../shared/helpers';
import type { AccessContext } from '../shared/access';
import { PayoutRepository } from './repository';
import { PayoutCreateInput, PayoutListFilters, PayoutUpdateInput, PayoutRole } from './types';
import { PlacementSnapshotRepository } from '../placement-snapshot/repository';
import { PlacementSnapshot } from '../placement-snapshot/types';
import { PlacementSplitRepository } from './placement-split-repository';
import { PlacementPayoutTransactionRepository } from './placement-payout-transaction-repository';
import type { PlacementSplit, PlacementPayoutTransaction, PlacementSplitInsert, PlacementPayoutTransactionInsert } from './types';

export class PayoutServiceV2 {
    constructor(
        private repository: PayoutRepository,
        private snapshotRepository: PlacementSnapshotRepository,
        private splitRepository: PlacementSplitRepository,
        private transactionRepository: PlacementPayoutTransactionRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher
    ) { }

    async getPayouts(
        filters: PayoutListFilters = {},
        clerkUserId: string
    ): Promise<{
        data: any[];
        pagination: ReturnType<typeof buildPaginationResponse>;
    }> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const { data, total } = await this.repository.listPayouts(filters);
        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async getPayout(id: string, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        const payout = await this.repository.findPayout(id);
        if (!payout) {
            throw new Error(`Payout ${id} not found`);
        }
        return payout;
    }

    async createPayout(payload: PayoutCreateInput, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        if (!payload.recruiter_id) {
            throw new Error('recruiter_id is required');
        }
        if (payload.payout_amount <= 0) {
            throw new Error('payout_amount must be positive');
        }

        const payout = await this.repository.createPayout({
            ...payload,
            status: payload.status || 'pending',
        });

        await this.publishEvent('payout.created', payout);
        return payout;
    }

    async updatePayout(id: string, updates: PayoutUpdateInput, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        await this.getPayout(id, clerkUserId);
        const updated = await this.repository.updatePayout(id, updates);
        await this.publishEvent('payout.updated', {
            id: updated.id,
            changes: updates,
        });
        return updated;
    }

    async deletePayout(id: string, clerkUserId: string): Promise<void> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        await this.getPayout(id, clerkUserId);
        await this.repository.updatePayout(id, {
            status: 'failed',
        } as PayoutUpdateInput);
        await this.publishEvent('payout.deleted', { id });
    }

    /**
     * Phase 6: Commission Calculator - REFACTORED FOR CANONICAL ARCHITECTURE
     * Creates placement_splits (attribution) and placement_payout_transactions (execution)
     * This is the source of truth for commission attribution - reads immutable snapshot
     * 
     * Data flow: placement → placement_snapshot → placement_splits → placement_payout_transactions
     * 
     * @returns Both splits (attribution records) and transactions (Stripe execution records)
     */
    async createSplitsAndTransactionsForPlacement(
        placementId: string,
        clerkUserId: string
    ): Promise<{ splits: PlacementSplit[], transactions: PlacementPayoutTransaction[] }> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

        // Check if splits already exist (idempotency)
        const existingSplits = await this.splitRepository.getByPlacementId(placementId);
        if (existingSplits.length > 0) {
            // Splits exist - return existing data
            const existingTransactions = await this.transactionRepository.getByPlacementId(placementId);
            return { splits: existingSplits, transactions: existingTransactions };
        }

        // Get immutable snapshot (source of truth for commission attribution)
        const snapshot = await this.snapshotRepository.getByPlacementId(placementId);
        if (!snapshot) {
            throw new Error(`Placement snapshot not found for placement ${placementId}`);
        }

        // === STEP 1: Create placement_splits (attribution layer) ===
        const splitsToCreate: PlacementSplitInsert[] = [];

        // Role 1: candidate_recruiter (Closer)
        if (snapshot.candidate_recruiter_id && snapshot.candidate_recruiter_rate) {
            splitsToCreate.push({
                placement_id: placementId,
                recruiter_id: snapshot.candidate_recruiter_id,
                role: 'candidate_recruiter', // ✅ Explicit role from snapshot
                split_percentage: snapshot.candidate_recruiter_rate,
                split_amount: (snapshot.total_placement_fee * snapshot.candidate_recruiter_rate) / 100,
            });
        }

        // Role 2: company_recruiter (Client/Hiring Facilitator)
        if (snapshot.company_recruiter_id && snapshot.company_recruiter_rate) {
            splitsToCreate.push({
                placement_id: placementId,
                recruiter_id: snapshot.company_recruiter_id,
                role: 'company_recruiter',
                split_percentage: snapshot.company_recruiter_rate,
                split_amount: (snapshot.total_placement_fee * snapshot.company_recruiter_rate) / 100,
            });
        }

        // Role 3: job_owner (Specs Owner)
        if (snapshot.job_owner_recruiter_id && snapshot.job_owner_rate) {
            splitsToCreate.push({
                placement_id: placementId,
                recruiter_id: snapshot.job_owner_recruiter_id,
                role: 'job_owner',
                split_percentage: snapshot.job_owner_rate,
                split_amount: (snapshot.total_placement_fee * snapshot.job_owner_rate) / 100,
            });
        }

        // Role 4: candidate_sourcer (Discovery)
        if (snapshot.candidate_sourcer_recruiter_id && snapshot.candidate_sourcer_rate) {
            splitsToCreate.push({
                placement_id: placementId,
                recruiter_id: snapshot.candidate_sourcer_recruiter_id,
                role: 'candidate_sourcer',
                split_percentage: snapshot.candidate_sourcer_rate,
                split_amount: (snapshot.total_placement_fee * snapshot.candidate_sourcer_rate) / 100,
            });
        }

        // Role 5: company_sourcer (BD)
        if (snapshot.company_sourcer_recruiter_id && snapshot.company_sourcer_rate) {
            splitsToCreate.push({
                placement_id: placementId,
                recruiter_id: snapshot.company_sourcer_recruiter_id,
                role: 'company_sourcer',
                split_percentage: snapshot.company_sourcer_rate,
                split_amount: (snapshot.total_placement_fee * snapshot.company_sourcer_rate) / 100,
            });
        }

        if (splitsToCreate.length === 0) {
            throw new Error(`No valid commission roles found in snapshot for placement ${placementId}`);
        }

        // Create all splits in batch
        const createdSplits = await this.splitRepository.createBatch(splitsToCreate);

        // === STEP 2: Create placement_payout_transactions (execution layer) ===
        // One transaction per split (1-to-1 relationship)
        const transactionsToCreate: PlacementPayoutTransactionInsert[] = createdSplits.map(split => ({
            placement_split_id: split.id,
            placement_id: split.placement_id,
            recruiter_id: split.recruiter_id,
            amount: split.split_amount || 0,
            status: 'pending', // Initial status
        }));

        const createdTransactions = await this.transactionRepository.createBatch(transactionsToCreate);

        // Calculate platform remainder for reporting
        const platformRemainder = this.calculatePlatformRemainder(snapshot);
        const totalPaidOut = createdSplits.reduce((sum, s) => sum + (s.split_amount || 0), 0);

        // Publish event with summary
        await this.publishEvent('placement.splits_created', {
            placementId,
            splitCount: createdSplits.length,
            transactionCount: createdTransactions.length,
            totalPaidOut,
            platformRemainder,
            subscriptionTier: snapshot.subscription_tier,
        });

        return { splits: createdSplits, transactions: createdTransactions };
    }

    /**
     * LEGACY METHOD - Deprecated in favor of createSplitsAndTransactionsForPlacement
     * @deprecated Use createSplitsAndTransactionsForPlacement instead
     */
    async createPayoutsForPlacement(placementId: string, clerkUserId: string): Promise<any[]> {
        // Redirect to new method for backwards compatibility
        const { splits } = await this.createSplitsAndTransactionsForPlacement(placementId, clerkUserId);
        return splits as any[];
    }

    /**
     * Phase 6: Helper - Calculate platform's remainder commission
     * Returns the dollar amount the platform keeps after all role commissions
     */
    calculatePlatformRemainder(snapshot: PlacementSnapshot): number {
        // Sum all commission rates
        const totalPaid = [
            snapshot.candidate_recruiter_rate || 0,
            snapshot.company_recruiter_rate || 0,
            snapshot.job_owner_rate || 0,
            snapshot.candidate_sourcer_rate || 0,
            snapshot.company_sourcer_rate || 0,
        ].reduce((sum, rate) => sum + rate, 0);

        // Calculate remainder percentage (should always be 0-100)
        const remainderPercent = 100 - totalPaid;

        // Return dollar amount
        return (snapshot.total_placement_fee * remainderPercent) / 100;
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
