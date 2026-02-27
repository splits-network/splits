import { PlacementSnapshotRepository } from './repository';
import { PlacementSnapshotCreate, PlacementSnapshot } from './types';
import { SplitsRateService } from '../splits-rates/service';

export class PlacementSnapshotService {
    constructor(
        private repository: PlacementSnapshotRepository,
        private splitsRateService: SplitsRateService,
    ) { }

    /**
     * Resolve the commission rate for a role from the database.
     * Maps snapshot tier names (free/paid/premium) to plan tiers via SplitsRateService.
     */
    private async resolveRate(
        snapshotTier: string | null,
        roleKey: 'candidate_recruiter_rate' | 'job_owner_rate' | 'company_recruiter_rate' | 'candidate_sourcer_rate' | 'company_sourcer_rate',
    ): Promise<number> {
        const rate = await this.splitsRateService.getActiveRateBySnapshotTier(snapshotTier || 'free');
        return rate[roleKey];
    }

    /**
     * Create immutable placement snapshot with commission rates from database.
     * Rates are looked up from splits_rates table at snapshot time.
     */
    async createSnapshot(createData: PlacementSnapshotCreate): Promise<PlacementSnapshot> {
        const snapshot = await this.repository.create({
            ...createData,
            candidate_recruiter_rate: createData.candidate_recruiter_id
                ? await this.resolveRate(createData.candidate_recruiter_tier, 'candidate_recruiter_rate')
                : null,
            company_recruiter_rate: createData.company_recruiter_id
                ? await this.resolveRate(createData.company_recruiter_tier, 'company_recruiter_rate')
                : null,
            job_owner_rate: createData.job_owner_recruiter_id
                ? await this.resolveRate(createData.job_owner_tier, 'job_owner_rate')
                : null,
            candidate_sourcer_rate: createData.candidate_sourcer_recruiter_id
                ? await this.resolveRate(createData.candidate_sourcer_tier, 'candidate_sourcer_rate')
                : null,
            company_sourcer_rate: createData.company_sourcer_recruiter_id
                ? await this.resolveRate(createData.company_sourcer_tier, 'company_sourcer_rate')
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
