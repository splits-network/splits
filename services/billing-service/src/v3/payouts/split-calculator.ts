/**
 * Payouts V3 — Split Calculator
 *
 * Creates placement_splits (attribution) and placement_payout_transactions (execution)
 * from the immutable placement snapshot.
 */

import { IEventPublisher } from '../../v2/shared/events';
import { PayoutRepository } from './repository';
import { PayoutRole } from './types';

interface SnapshotRoleMapping {
  idKey: string;
  rateKey: string;
  firmIdKey: string;
  takeRateKey: string;
  role: PayoutRole;
}

const ROLE_MAPPINGS: SnapshotRoleMapping[] = [
  { idKey: 'candidate_recruiter_id', rateKey: 'candidate_recruiter_rate', firmIdKey: 'candidate_recruiter_firm_id', takeRateKey: 'candidate_recruiter_admin_take_rate', role: 'candidate_recruiter' },
  { idKey: 'company_recruiter_id', rateKey: 'company_recruiter_rate', firmIdKey: 'company_recruiter_firm_id', takeRateKey: 'company_recruiter_admin_take_rate', role: 'company_recruiter' },
  { idKey: 'job_owner_recruiter_id', rateKey: 'job_owner_rate', firmIdKey: 'job_owner_firm_id', takeRateKey: 'job_owner_admin_take_rate', role: 'job_owner' },
  { idKey: 'candidate_sourcer_recruiter_id', rateKey: 'candidate_sourcer_rate', firmIdKey: 'candidate_sourcer_firm_id', takeRateKey: 'candidate_sourcer_admin_take_rate', role: 'candidate_sourcer' },
  { idKey: 'company_sourcer_recruiter_id', rateKey: 'company_sourcer_rate', firmIdKey: 'company_sourcer_firm_id', takeRateKey: 'company_sourcer_admin_take_rate', role: 'company_sourcer' },
];

export class SplitCalculator {
  constructor(
    private repository: PayoutRepository,
    private eventPublisher?: IEventPublisher
  ) {}

  async createSplitsAndTransactions(placementId: string) {
    // Idempotency check
    const existingSplits = await this.repository.getSplitsByPlacementId(placementId);
    if (existingSplits.length > 0) {
      const existingTransactions = await this.repository.getTransactionsByPlacementId(placementId);
      return { splits: existingSplits, transactions: existingTransactions };
    }

    const snapshot = await this.repository.getSnapshotByPlacementId(placementId);
    if (!snapshot) {
      throw new Error(`Placement snapshot not found for placement ${placementId}`);
    }

    // Step 1: Create splits
    const splitsToCreate = this.buildSplits(placementId, snapshot);
    if (splitsToCreate.length === 0) {
      return { splits: [], transactions: [] };
    }

    const createdSplits = await this.repository.createSplitsBatch(splitsToCreate);

    // Step 2: Create transactions
    const transactionsToCreate = this.buildTransactions(createdSplits);
    const createdTransactions = await this.repository.createTransactionsBatch(transactionsToCreate);

    await this.eventPublisher?.publish('placement.splits_created', {
      placementId,
      splitCount: createdSplits.length,
      transactionCount: createdTransactions.length,
    }, 'billing-service');

    return { splits: createdSplits, transactions: createdTransactions };
  }

  private buildSplits(placementId: string, snapshot: any): Record<string, any>[] {
    const splits: Record<string, any>[] = [];

    for (const mapping of ROLE_MAPPINGS) {
      const recruiterId = snapshot[mapping.idKey] as string | null;
      const rate = snapshot[mapping.rateKey] as number | null;
      if (!recruiterId || !rate) continue;

      const splitAmount = (snapshot.total_placement_fee * rate) / 100;
      const firmId = snapshot[mapping.firmIdKey] as string | null;
      const adminTakeRate = snapshot[mapping.takeRateKey] as number | null;
      const effectiveTakeRate = firmId && adminTakeRate && adminTakeRate > 0 ? adminTakeRate : 0;
      const firmTakeAmount = (splitAmount * effectiveTakeRate) / 100;
      const netAmount = splitAmount - firmTakeAmount;

      splits.push({
        placement_id: placementId,
        recruiter_id: recruiterId,
        role: mapping.role,
        split_percentage: rate,
        split_amount: splitAmount,
        firm_id: firmId || undefined,
        firm_admin_take_rate: effectiveTakeRate || undefined,
        firm_admin_take_amount: firmTakeAmount || undefined,
        net_amount: netAmount,
      });
    }

    return splits;
  }

  private buildTransactions(splits: any[]): Record<string, any>[] {
    const transactions: Record<string, any>[] = [];

    for (const split of splits) {
      const hasAdminTake = (split.firm_admin_take_amount || 0) > 0;

      if (hasAdminTake) {
        // Member payout (net after firm take)
        transactions.push({
          placement_split_id: split.id,
          placement_id: split.placement_id,
          recruiter_id: split.recruiter_id,
          amount: split.net_amount || 0,
          status: 'pending',
          transaction_type: 'member_payout',
        });
        // Firm admin take
        transactions.push({
          placement_split_id: split.id,
          placement_id: split.placement_id,
          recruiter_id: split.recruiter_id,
          amount: split.firm_admin_take_amount || 0,
          status: 'pending',
          transaction_type: 'firm_admin_take',
          firm_id: split.firm_id || undefined,
        });
      } else {
        // Single transaction for full amount
        transactions.push({
          placement_split_id: split.id,
          placement_id: split.placement_id,
          recruiter_id: split.recruiter_id,
          amount: split.split_amount || 0,
          status: 'pending',
          transaction_type: 'member_payout',
        });
      }
    }

    return transactions;
  }
}
