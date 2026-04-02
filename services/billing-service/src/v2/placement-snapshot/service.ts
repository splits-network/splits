import { SupabaseClient } from '@supabase/supabase-js';
import { PlacementSnapshotRepository } from './repository.js';
import { PlacementSnapshotCreate, PlacementSnapshot } from './types.js';
import { SplitsRateService } from '../splits-rates/service.js';

interface FirmContext {
    firm_id: string | null;
    admin_take_rate: number | null;
}

export class PlacementSnapshotService {
    constructor(
        private repository: PlacementSnapshotRepository,
        private splitsRateService: SplitsRateService,
        private supabase?: SupabaseClient,
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
     * Resolve firm context for a recruiter at snapshot time.
     * Returns the firm_id and admin_take_rate (0 for owners, since they're exempt).
     */
    private async resolveFirmContext(recruiterId: string): Promise<FirmContext> {
        if (!this.supabase) {
            return { firm_id: null, admin_take_rate: null };
        }

        // Find active firm membership
        const { data: member } = await this.supabase
            .from('firm_members')
            .select('firm_id, role')
            .eq('recruiter_id', recruiterId)
            .eq('status', 'active')
            .maybeSingle();

        if (!member) {
            return { firm_id: null, admin_take_rate: null };
        }

        // Get firm details
        const { data: firm } = await this.supabase
            .from('firms')
            .select('id, admin_take_rate, owner_user_id')
            .eq('id', member.firm_id)
            .single();

        if (!firm) {
            return { firm_id: null, admin_take_rate: null };
        }

        // Owner exemption: check if this recruiter is the firm owner
        if (member.role === 'owner') {
            return { firm_id: firm.id, admin_take_rate: 0 };
        }

        // Also check via user_id for safety (in case role isn't perfectly synced)
        const { data: recruiter } = await this.supabase
            .from('recruiters')
            .select('user_id')
            .eq('id', recruiterId)
            .single();

        if (recruiter && recruiter.user_id === firm.owner_user_id) {
            return { firm_id: firm.id, admin_take_rate: 0 };
        }

        return { firm_id: firm.id, admin_take_rate: firm.admin_take_rate || 0 };
    }

    /**
     * Create immutable placement snapshot with commission rates from database.
     * Rates are looked up from splits_rates table at snapshot time.
     * Firm context (firm_id + admin_take_rate) is frozen per role.
     */
    async createSnapshot(createData: PlacementSnapshotCreate): Promise<PlacementSnapshot> {
        // Resolve firm context for each role
        const roleRecruiters = [
            { id: createData.candidate_recruiter_id, firmIdKey: 'candidate_recruiter_firm_id', takeRateKey: 'candidate_recruiter_admin_take_rate' },
            { id: createData.company_recruiter_id, firmIdKey: 'company_recruiter_firm_id', takeRateKey: 'company_recruiter_admin_take_rate' },
            { id: createData.job_owner_recruiter_id, firmIdKey: 'job_owner_firm_id', takeRateKey: 'job_owner_admin_take_rate' },
            { id: createData.candidate_sourcer_recruiter_id, firmIdKey: 'candidate_sourcer_firm_id', takeRateKey: 'candidate_sourcer_admin_take_rate' },
            { id: createData.company_sourcer_recruiter_id, firmIdKey: 'company_sourcer_firm_id', takeRateKey: 'company_sourcer_admin_take_rate' },
        ] as const;

        const firmContextData: Record<string, string | number | null> = {};
        for (const { id, firmIdKey, takeRateKey } of roleRecruiters) {
            if (id) {
                const ctx = await this.resolveFirmContext(id);
                firmContextData[firmIdKey] = ctx.firm_id;
                firmContextData[takeRateKey] = ctx.admin_take_rate;
            } else {
                firmContextData[firmIdKey] = null;
                firmContextData[takeRateKey] = null;
            }
        }

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
            // Firm context per role
            candidate_recruiter_firm_id: firmContextData.candidate_recruiter_firm_id as string | null,
            candidate_recruiter_admin_take_rate: firmContextData.candidate_recruiter_admin_take_rate as number | null,
            company_recruiter_firm_id: firmContextData.company_recruiter_firm_id as string | null,
            company_recruiter_admin_take_rate: firmContextData.company_recruiter_admin_take_rate as number | null,
            job_owner_firm_id: firmContextData.job_owner_firm_id as string | null,
            job_owner_admin_take_rate: firmContextData.job_owner_admin_take_rate as number | null,
            candidate_sourcer_firm_id: firmContextData.candidate_sourcer_firm_id as string | null,
            candidate_sourcer_admin_take_rate: firmContextData.candidate_sourcer_admin_take_rate as number | null,
            company_sourcer_firm_id: firmContextData.company_sourcer_firm_id as string | null,
            company_sourcer_admin_take_rate: firmContextData.company_sourcer_admin_take_rate as number | null,
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
