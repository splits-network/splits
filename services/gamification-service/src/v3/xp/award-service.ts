/**
 * V3 XP Award Service
 *
 * Awards XP based on domain events using configurable xp_rules.
 * Publishes `level.up` event when an entity levels up.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';

type EntityType = 'recruiter' | 'candidate' | 'company' | 'firm';

interface LevelThreshold {
  level: number;
  xp_required: number;
  title: string;
}

interface XpRule {
  base_points: number;
  max_per_day: number | null;
}

interface EntityLevel {
  entity_type: EntityType;
  entity_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
}

export class XpAwardService {
  private thresholdsCache: LevelThreshold[] | null = null;

  constructor(
    private supabase: SupabaseClient,
    private eventPublisher: IEventPublisher
  ) {}

  async awardXp(
    entityType: EntityType,
    entityId: string,
    source: string,
    referenceId?: string,
    description?: string
  ): Promise<{ points: number; newLevel: number | null }> {
    const rule = await this.getRule(source, entityType);
    if (!rule) return { points: 0, newLevel: null };

    if (rule.max_per_day) {
      const todayTotal = await this.getTodayPoints(entityType, entityId, source);
      if (todayTotal >= rule.max_per_day) return { points: 0, newLevel: null };
    }

    const points = rule.base_points;

    await this.supabase.from('xp_ledger').insert({
      entity_type: entityType,
      entity_id: entityId,
      source,
      points,
      reference_id: referenceId,
      description,
    });

    const newLevel = await this.updateLevel(entityType, entityId, points);
    return { points, newLevel };
  }

  private async updateLevel(
    entityType: EntityType,
    entityId: string,
    pointsAdded: number
  ): Promise<number | null> {
    let current = await this.getLevel(entityType, entityId);

    if (!current) {
      current = await this.upsertLevel({
        entity_type: entityType,
        entity_id: entityId,
        total_xp: 0,
        current_level: 1,
        xp_to_next_level: 100,
      });
    }

    const newTotalXp = current.total_xp + pointsAdded;
    const thresholds = await this.getThresholds();
    const newLevel = this.computeLevel(newTotalXp, thresholds);
    const nextThreshold = thresholds.find(t => t.level === newLevel + 1);
    const xpToNext = nextThreshold ? nextThreshold.xp_required - newTotalXp : 0;

    await this.upsertLevel({
      entity_type: entityType,
      entity_id: entityId,
      total_xp: newTotalXp,
      current_level: newLevel,
      xp_to_next_level: Math.max(0, xpToNext),
    });

    if (newLevel > current.current_level) {
      const levelInfo = thresholds.find(t => t.level === newLevel);
      await this.eventPublisher.publish('level.up', {
        entity_type: entityType,
        entity_id: entityId,
        new_level: newLevel,
        title: levelInfo?.title || '',
        total_xp: newTotalXp,
      });
      return newLevel;
    }

    return null;
  }

  private computeLevel(totalXp: number, thresholds: LevelThreshold[]): number {
    let level = 1;
    for (const t of thresholds) {
      if (totalXp >= t.xp_required) level = t.level;
      else break;
    }
    return level;
  }

  private async getThresholds(): Promise<LevelThreshold[]> {
    if (!this.thresholdsCache) {
      const { data, error } = await this.supabase
        .from('level_thresholds')
        .select('*')
        .order('level', { ascending: true });
      if (error) throw error;
      this.thresholdsCache = data || [];
    }
    return this.thresholdsCache;
  }

  private async getRule(source: string, entityType: EntityType): Promise<XpRule | null> {
    const { data, error } = await this.supabase
      .from('xp_rules')
      .select('base_points, max_per_day')
      .eq('source', source)
      .eq('entity_type', entityType)
      .eq('active', true)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  private async getTodayPoints(entityType: EntityType, entityId: string, source: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await this.supabase
      .from('xp_ledger')
      .select('points')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('source', source)
      .gte('created_at', today.toISOString());

    if (error) throw error;
    return (data || []).reduce((sum, row) => sum + row.points, 0);
  }

  private async getLevel(entityType: EntityType, entityId: string): Promise<EntityLevel | null> {
    const { data, error } = await this.supabase
      .from('entity_levels')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  private async upsertLevel(level: Omit<EntityLevel, 'updated_at'>): Promise<EntityLevel> {
    const { data, error } = await this.supabase
      .from('entity_levels')
      .upsert(level, { onConflict: 'entity_type,entity_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
