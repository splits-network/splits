import { IEventPublisher } from '../shared/events.js';
import { requireBillingAdmin } from '../shared/helpers.js';
import type { AccessContext } from '../shared/access.js';
import { SplitsRateRepository } from './repository.js';
import { SplitsRateWithPlan, SplitsRateUpdateInput } from './types.js';

/**
 * Tier name mapping: snapshot tiers → plan tiers.
 * Placement snapshots use 'free'/'paid'/'premium',
 * while the plans table uses 'starter'/'pro'/'partner'.
 */
const SNAPSHOT_TIER_TO_PLAN_TIER: Record<string, string> = {
    free: 'starter',
    paid: 'pro',
    premium: 'partner',
};

export class SplitsRateService {
    constructor(
        private repository: SplitsRateRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: IEventPublisher,
    ) {}

    /**
     * Get all currently active rates (one per plan tier).
     */
    async getActiveRates(): Promise<SplitsRateWithPlan[]> {
        return this.repository.getActiveRates();
    }

    /**
     * Get the active rate for a specific plan.
     */
    async getActiveRateByPlanId(planId: string): Promise<SplitsRateWithPlan> {
        const rate = await this.repository.getActiveRateByPlanId(planId);
        if (!rate) {
            throw new Error(`No active splits rate found for plan ${planId}`);
        }
        return rate;
    }

    /**
     * Get the active rate by plan tier name (starter/pro/partner).
     */
    async getActiveRateByPlanTier(planTier: string): Promise<SplitsRateWithPlan> {
        const rate = await this.repository.getActiveRateByTier(planTier);
        if (!rate) {
            throw new Error(`No active splits rate found for tier ${planTier}`);
        }
        return rate;
    }

    /**
     * Get the active rate by snapshot tier name (free/paid/premium).
     * Maps to plan tier before lookup.
     */
    async getActiveRateBySnapshotTier(snapshotTier: string): Promise<SplitsRateWithPlan> {
        const planTier = SNAPSHOT_TIER_TO_PLAN_TIER[snapshotTier];
        if (!planTier) {
            throw new Error(`Unknown snapshot tier: ${snapshotTier}`);
        }
        return this.getActiveRateByPlanTier(planTier);
    }

    /**
     * Update rates for a plan. Deactivates the old rate and creates a new one.
     * Admin only.
     */
    async updateRate(planId: string, updates: SplitsRateUpdateInput, clerkUserId: string): Promise<SplitsRateWithPlan> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

        const sum =
            updates.candidate_recruiter_rate +
            updates.job_owner_rate +
            updates.company_recruiter_rate +
            updates.candidate_sourcer_rate +
            updates.company_sourcer_rate;

        if (sum > 100) {
            throw new Error(`Role rates must not exceed 100, got ${sum}`);
        }

        const created = await this.repository.createRate({
            plan_id: planId,
            ...updates,
        });

        await this.publishEvent('splits_rate.updated', {
            plan_id: planId,
            rate_id: created.id,
        });

        // Re-fetch with plan info
        return this.getActiveRateByPlanId(planId);
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
