/**
 * Splits Rates V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { SplitsRateRepository } from './repository.js';
import { SplitsRateUpdateInput } from './types.js';

const SNAPSHOT_TIER_TO_PLAN_TIER: Record<string, string> = {
  free: 'starter',
  paid: 'pro',
  premium: 'partner',
};

export class SplitsRateService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: SplitsRateRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getActiveRates(): Promise<any[]> {
    return this.repository.getActiveRates();
  }

  async getActiveRateByPlanId(planId: string): Promise<any> {
    const rate = await this.repository.getActiveRateByPlanId(planId);
    if (!rate) throw new NotFoundError('SplitsRate', planId);
    return rate;
  }

  async getActiveRateByPlanTier(planTier: string): Promise<any> {
    const rate = await this.repository.getActiveRateByTier(planTier);
    if (!rate) throw new NotFoundError('SplitsRate', planTier);
    return rate;
  }

  async getActiveRateBySnapshotTier(snapshotTier: string): Promise<any> {
    const planTier = SNAPSHOT_TIER_TO_PLAN_TIER[snapshotTier];
    if (!planTier) throw new BadRequestError(`Unknown snapshot tier: ${snapshotTier}`);
    return this.getActiveRateByPlanTier(planTier);
  }

  async updateRate(planId: string, updates: SplitsRateUpdateInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can update splits rates');
    }

    const sum =
      updates.candidate_recruiter_rate +
      updates.job_owner_rate +
      updates.company_recruiter_rate +
      updates.candidate_sourcer_rate +
      updates.company_sourcer_rate;

    if (sum > 100) {
      throw new BadRequestError(`Role rates must not exceed 100, got ${sum}`);
    }

    await this.repository.createRate({ plan_id: planId, ...updates });

    await this.eventPublisher?.publish('splits_rate.updated', {
      plan_id: planId,
      updated_by: context.identityUserId,
    }, 'billing-service');

    return this.getActiveRateByPlanId(planId);
  }
}
