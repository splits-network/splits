import { PlacementSnapshotRepository } from './repository';
import { PlacementSnapshotCreate, PlacementSnapshot } from './types';
import { COMMISSION_RATES } from '@splits-network/shared-types';

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

        // Store commission percentages (0-100) in snapshot
        // Only set rate if role ID is present (null roles get null rates)
        const snapshot = await this.repository.create({
            ...createData,
            candidate_recruiter_rate: createData.candidate_recruiter_id
                ? rates.candidate_recruiter
                : null,
            company_recruiter_rate: createData.company_recruiter_id
                ? rates.company_recruiter
                : null,
            job_owner_rate: createData.job_owner_recruiter_id
                ? rates.job_owner
                : null,
            candidate_sourcer_rate: createData.candidate_sourcer_recruiter_id
                ? rates.candidate_sourcer
                : null,
            company_sourcer_rate: createData.company_sourcer_recruiter_id
                ? rates.company_sourcer
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
        const totalFee = snapshot.total_placement_fee;
        return (
            (totalFee * (snapshot.candidate_recruiter_rate || 0)) / 100 +
            (totalFee * (snapshot.company_recruiter_rate || 0)) / 100 +
            (totalFee * (snapshot.job_owner_rate || 0)) / 100 +
            (totalFee * (snapshot.candidate_sourcer_rate || 0)) / 100 +
            (totalFee * (snapshot.company_sourcer_rate || 0)) / 100
        );
    }

    /**
     * Calculate platform remainder for a snapshot
     * (total_placement_fee - sum of all commissions)
     */
    calculatePlatformRemainder(snapshot: PlacementSnapshot): number {
        const totalCommissions = this.calculateTotalCommissions(snapshot);
        return snapshot.total_placement_fee - totalCommissions;
    }
}
