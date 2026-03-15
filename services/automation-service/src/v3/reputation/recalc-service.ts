/**
 * V3 Reputation Recalculation Service
 *
 * Computes the reputation score from gathered metrics,
 * detects tier changes, and publishes events.
 *
 * Reuses V2 calculator logic and delegates metric gathering
 * to MetricsGatherer for file-size compliance.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../../v2/shared/events';
import { ReputationMetrics, TierChangeEvent } from '../../v2/reputation/types';
import { calculateReputationScore } from '../../v2/reputation/calculator';
import { getTierFromScore } from './types';
import { MetricsGatherer } from './metrics-gatherer';

export class RecalcService {
  private metricsGatherer: MetricsGatherer;

  constructor(
    private supabase: SupabaseClient,
    private eventPublisher: IEventPublisher | undefined,
    private logger: Logger,
  ) {
    this.metricsGatherer = new MetricsGatherer(supabase);
  }

  /**
   * Recalculate reputation for a single recruiter.
   * Detects tier changes and publishes events.
   */
  async recalculateForRecruiter(recruiterId: string): Promise<any> {
    this.logger.info({ recruiterId }, 'Recalculating reputation');

    const currentReputation = await this.getReputation(recruiterId);
    const currentScore = currentReputation?.reputation_score ?? 50;
    const currentTier = getTierFromScore(currentScore);

    const metrics = await this.metricsGatherer.gather(recruiterId);
    const result = calculateReputationScore(metrics);
    const newReputation = await this.upsertReputation(recruiterId, metrics, result.final_score);
    const newTier = getTierFromScore(result.final_score);

    this.logger.info(
      { recruiterId, oldScore: currentScore, newScore: result.final_score, oldTier: currentTier, newTier },
      'Reputation recalculated',
    );

    if (currentTier !== newTier) {
      await this.publishTierChange(recruiterId, currentTier, newTier, currentScore, result.final_score);
    }

    return newReputation;
  }

  /**
   * Handle a placement event: recalculate for all involved recruiters.
   */
  async handlePlacementEvent(placementId: string): Promise<void> {
    const { data: splits, error } = await this.supabase
      .from('placement_splits')
      .select('recruiter_id')
      .eq('placement_id', placementId);

    if (error) throw error;
    const recruiterIds = (splits || []).map((s: any) => s.recruiter_id);

    this.logger.info({ placementId, recruiterCount: recruiterIds.length }, 'Recalculating for placement');

    for (const id of recruiterIds) {
      try {
        await this.recalculateForRecruiter(id);
      } catch (err) {
        this.logger.error({ err, recruiterId: id, placementId }, 'Failed to recalculate after placement');
      }
    }
  }

  /**
   * Handle a hire event: recalculate for the submitting recruiter.
   */
  async handleHireEvent(recruiterId: string): Promise<void> {
    if (!recruiterId) {
      this.logger.warn('No recruiter ID for hire event');
      return;
    }
    try {
      await this.recalculateForRecruiter(recruiterId);
    } catch (err) {
      this.logger.error({ err, recruiterId }, 'Failed to recalculate after hire');
    }
  }

  private async publishTierChange(
    recruiterId: string,
    oldTier: string,
    newTier: string,
    oldScore: number,
    newScore: number,
  ): Promise<void> {
    const { data: recruiter } = await this.supabase
      .from('recruiters')
      .select('user_id')
      .eq('id', recruiterId)
      .single();

    if (!recruiter?.user_id) {
      this.logger.warn({ recruiterId }, 'Cannot find user_id, skipping tier change event');
      return;
    }

    const event: TierChangeEvent = {
      recruiter_id: recruiterId,
      recruiter_user_id: recruiter.user_id,
      old_tier: oldTier as TierChangeEvent['old_tier'],
      new_tier: newTier as TierChangeEvent['new_tier'],
      old_score: oldScore,
      new_score: newScore,
    };

    this.logger.info({ recruiterId, oldTier, newTier, oldScore, newScore }, 'Tier change detected');
    await this.eventPublisher?.publish('reputation.tier_changed', event, 'automation-service');
  }

  private async getReputation(recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_reputation')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  private async upsertReputation(
    recruiterId: string,
    metrics: ReputationMetrics,
    finalScore: number,
  ): Promise<any> {
    const now = new Date().toISOString();
    const hireRate = metrics.total_submissions > 0
      ? (metrics.total_hires / metrics.total_submissions) * 100 : null;
    const completionRate = metrics.total_placements > 0
      ? (metrics.completed_placements / metrics.total_placements) * 100 : null;
    const collaborationRate = metrics.total_placements > 0
      ? (metrics.total_collaborations / metrics.total_placements) * 100 : null;
    const pipelineRate = metrics.total_reached_screen > 0
      ? (1 - metrics.total_expired_in_recruiter_stages / metrics.total_reached_screen) * 100 : null;

    const { data, error } = await this.supabase
      .from('recruiter_reputation')
      .upsert({
        recruiter_id: recruiterId,
        total_submissions: metrics.total_submissions,
        total_hires: metrics.total_hires,
        hire_rate: hireRate,
        total_placements: metrics.total_placements,
        completed_placements: metrics.completed_placements,
        failed_placements: metrics.failed_placements,
        completion_rate: completionRate,
        total_collaborations: metrics.total_collaborations,
        collaboration_rate: collaborationRate,
        avg_response_time_hours: metrics.avg_response_time_hours,
        total_expired_in_recruiter_stages: metrics.total_expired_in_recruiter_stages,
        pipeline_reliability_rate: pipelineRate,
        reputation_score: finalScore,
        last_calculated_at: now,
        updated_at: now,
      }, { onConflict: 'recruiter_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
