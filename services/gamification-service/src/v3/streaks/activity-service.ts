/**
 * V3 Streak Activity Service
 *
 * Records activity, increments/resets streaks, detects milestones,
 * and publishes `streak.milestone` and `streak.updated` events.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';

type EntityType = 'recruiter' | 'candidate' | 'company' | 'firm';

const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365];

interface EntityStreak {
  entity_type: EntityType;
  entity_id: string;
  streak_type: string;
  current_count: number;
  longest_count: number;
  last_activity_at: string | null;
  streak_started_at: string | null;
}

export class ActivityService {
  constructor(
    private supabase: SupabaseClient,
    private eventPublisher: IEventPublisher
  ) {}

  /**
   * Record activity for a streak. If within the valid window, increments.
   * If outside the window, resets the streak.
   */
  async recordActivity(
    entityType: EntityType,
    entityId: string,
    streakType: string,
    windowHours = 168
  ): Promise<{ current_count: number; milestone_hit: number | null }> {
    const now = new Date();
    const existing = await this.getStreak(entityType, entityId, streakType);

    let currentCount: number;
    let longestCount: number;
    let streakStartedAt: string;

    if (!existing || !existing.last_activity_at) {
      currentCount = 1;
      longestCount = 1;
      streakStartedAt = now.toISOString();
    } else {
      const lastActivity = new Date(existing.last_activity_at);
      const hoursSinceLast = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLast <= windowHours) {
        currentCount = existing.current_count + 1;
        longestCount = Math.max(existing.longest_count, currentCount);
        streakStartedAt = existing.streak_started_at || now.toISOString();
      } else {
        currentCount = 1;
        longestCount = existing.longest_count;
        streakStartedAt = now.toISOString();
      }
    }

    await this.upsertStreak({
      entity_type: entityType,
      entity_id: entityId,
      streak_type: streakType,
      current_count: currentCount,
      longest_count: longestCount,
      last_activity_at: now.toISOString(),
      streak_started_at: streakStartedAt,
    });

    const milestoneHit = STREAK_MILESTONES.includes(currentCount) ? currentCount : null;

    if (milestoneHit) {
      await this.eventPublisher.publish('streak.milestone', {
        entity_type: entityType,
        entity_id: entityId,
        streak_type: streakType,
        milestone: milestoneHit,
        current_count: currentCount,
      });
    }

    await this.eventPublisher.publish('streak.updated', {
      entity_type: entityType,
      entity_id: entityId,
      streak_type: streakType,
      current_count: currentCount,
    });

    return { current_count: currentCount, milestone_hit: milestoneHit };
  }

  private async getStreak(
    entityType: EntityType,
    entityId: string,
    streakType: string
  ): Promise<EntityStreak | null> {
    const { data, error } = await this.supabase
      .from('entity_streaks')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('streak_type', streakType)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  private async upsertStreak(streak: EntityStreak): Promise<void> {
    const { error } = await this.supabase
      .from('entity_streaks')
      .upsert({
        entity_type: streak.entity_type,
        entity_id: streak.entity_id,
        streak_type: streak.streak_type,
        current_count: streak.current_count,
        longest_count: streak.longest_count,
        last_activity_at: streak.last_activity_at,
        streak_started_at: streak.streak_started_at,
      }, { onConflict: 'entity_type,entity_id,streak_type' });

    if (error) throw error;
  }
}
