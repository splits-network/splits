import { PlacementSnapshotRepository } from './repository';
import { PlacementSnapshotCreate, PlacementSnapshot } from './types';

/**
 * Commission rate structure by subscription tier
 * Rates are expressed as decimals (0.15 = 15%)
 * 
 * Based on 5-role commission model:
 * 1. Candidate Recruiter ("Closer")
 * 2. Company Recruiter ("Client/Hiring Facilitator")
 * 3. Job Owner ("Specs Owner" - recruiter who posted job)
 * 4. Candidate Sourcer ("Discovery" - first recruiter to bring candidate)
 * 5. Company Sourcer ("BD" - first recruiter to bring company)
 */
const COMMISSION_RATES = {
    free: {
        candidate_recruiter: 0.20,      // 20%
        company_recruiter: 0.10,        // 10%
        job_owner: 0.10,                // 10%
        candidate_sourcer: 0.06,        // 6%
        company_sourcer: 0.06,          // 6%
        platform_remainder: 0.48,       // 48% (goes to platform if roles are null)
    },
    paid: {
        candidate_recruiter: 0.30,      // 30%
        company_recruiter: 0.15,        // 15%
        job_owner: 0.15,                // 15%
        candidate_sourcer: 0.08,        // 8% (6% base + 2% bonus)
        company_sourcer: 0.08,          // 8% (6% base + 2% bonus)
        platform_remainder: 0.24,       // 24%
    },
    premium: {
        candidate_recruiter: 0.40,      // 40%
        company_recruiter: 0.20,        // 20%
        job_owner: 0.20,                // 20%
        candidate_sourcer: 0.10,        // 10% (6% base + 4% bonus)
        company_sourcer: 0.10,          // 10% (6% base + 4% bonus)
        platform_remainder: 0.00,       // 0% (100% paid to roles)
    },
};

export class PlacementSnapshotService {
    constructor(private repository: PlacementSnapshotRepository) { }

    /**
     * Create immutable placement snapshot with commission rates
     * This captures the attribution and rates at placement time
     */
    async createSnapshot(createData: PlacementSnapshotCreate): Promise<PlacementSnapshot> {
        // Get rates for subscription tier
        const rates = COMMISSION_RATES[createData.subscription_tier];

        if (!rates) {
            throw new Error(`Invalid subscription tier: ${createData.subscription_tier}`);
        }

        // Calculate individual commission amounts (dollar values)
        // Only set rate if role ID is present (null roles get null rates)
        const snapshot = await this.repository.create({
            ...createData,
            candidate_recruiter_rate: createData.candidate_recruiter_id
                ? rates.candidate_recruiter * createData.total_placement_fee
                : null,
            company_recruiter_rate: createData.company_recruiter_id
                ? rates.company_recruiter * createData.total_placement_fee
                : null,
            job_owner_rate: createData.job_owner_recruiter_id
                ? rates.job_owner * createData.total_placement_fee
                : null,
            candidate_sourcer_rate: createData.candidate_sourcer_recruiter_id
                ? rates.candidate_sourcer * createData.total_placement_fee
                : null,
            company_sourcer_rate: createData.company_sourcer_recruiter_id
                ? rates.company_sourcer * createData.total_placement_fee
                : null,
        });

        return snapshot;
    }

    /**
     * Get placement snapshot by placement ID
     */
    async getByPlacementId(placementId: string): Promise<PlacementSnapshot | null> {
        return this.repository.getByPlacementId(placementId);
    }

    /**
     * Calculate total commissions paid for a snapshot
     */
    calculateTotalCommissions(snapshot: PlacementSnapshot): number {
        return (
            (snapshot.candidate_recruiter_rate || 0) +
            (snapshot.company_recruiter_rate || 0) +
            (snapshot.job_owner_rate || 0) +
            (snapshot.candidate_sourcer_rate || 0) +
            (snapshot.company_sourcer_rate || 0)
        );
    }

    /**
     * Calculate platform remainder for a snapshot
     * (total_fee - sum of all commissions)
     */
    calculatePlatformRemainder(snapshot: PlacementSnapshot): number {
        const totalCommissions = this.calculateTotalCommissions(snapshot);
        return snapshot.total_placement_fee - totalCommissions;
    }
}
