/**
 * V3 Badge Award Service
 *
 * Evaluates badge definitions triggered by domain events, awards badges
 * when criteria are met, revokes when no longer met.
 * Publishes `badge.awarded` and `badge.revoked` events.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { evaluateBadgeCriteria, BadgeCriteria } from './evaluator';

type EntityType = 'recruiter' | 'candidate' | 'company' | 'firm';

interface BadgeDefinition {
  id: string;
  slug: string;
  entity_type: EntityType;
  criteria: BadgeCriteria;
  data_source: string;
  revocable: boolean;
  xp_reward: number;
}

const ENTITY_ID_FIELDS: Record<EntityType, string[]> = {
  recruiter: ['recruiter_id', 'candidate_recruiter_id', 'company_recruiter_id'],
  candidate: ['candidate_id'],
  company: ['company_id'],
  firm: ['firm_id'],
};

export class BadgeAwardService {
  constructor(
    private supabase: SupabaseClient,
    private eventPublisher: IEventPublisher
  ) {}

  async evaluateForEvent(eventType: string, payload: Record<string, any>): Promise<void> {
    const definitions = await this.getActiveByTriggerEvent(eventType);
    for (const def of definitions) {
      const entityIds = this.extractEntityIds(def.entity_type, payload);
      for (const entityId of entityIds) {
        await this.evaluateAndAward(def, eventType, entityId);
      }
    }
  }

  private async evaluateAndAward(def: BadgeDefinition, eventType: string, entityId: string): Promise<void> {
    const entityData = await this.fetchEntityData(def.data_source, def.entity_type, entityId);
    if (!entityData) return;

    const isEarned = evaluateBadgeCriteria(def.criteria, entityData);
    if (isEarned) {
      await this.award(def, entityId, eventType);
      await this.removeProgress(def.id, def.entity_type, entityId);
    } else if (def.revocable) {
      await this.revoke(def, entityId);
    }
    await this.updateProgress(def, entityId, entityData);
  }

  private async award(def: BadgeDefinition, entityId: string, eventType: string): Promise<void> {
    const existing = await this.findExisting(def.id, def.entity_type, entityId);
    if (existing && !existing.revoked_at) return;

    await this.supabase.from('badges_awarded').upsert({
      badge_definition_id: def.id, entity_type: def.entity_type, entity_id: entityId,
      metadata: { event_type: eventType }, revoked_at: null, awarded_at: new Date().toISOString(),
    }, { onConflict: 'badge_definition_id,entity_type,entity_id' });

    await this.eventPublisher.publish('badge.awarded', {
      badge_definition_id: def.id, badge_slug: def.slug,
      entity_type: def.entity_type, entity_id: entityId, xp_reward: def.xp_reward || 0,
    });
  }

  private async revoke(def: BadgeDefinition, entityId: string): Promise<void> {
    const { data } = await this.supabase.from('badges_awarded')
      .update({ revoked_at: new Date().toISOString() })
      .eq('badge_definition_id', def.id).eq('entity_type', def.entity_type)
      .eq('entity_id', entityId).is('revoked_at', null)
      .select('id').maybeSingle();

    if (!data) return;
    await this.eventPublisher.publish('badge.revoked', {
      badge_definition_id: def.id, entity_type: def.entity_type, entity_id: entityId,
    });
  }

  private extractEntityIds(entityType: EntityType, payload: Record<string, any>): string[] {
    const fields = ENTITY_ID_FIELDS[entityType] || [];
    const ids = fields.map(f => payload[f]).filter(Boolean);
    return [...new Set(ids)];
  }

  private async fetchEntityData(
    dataSource: string, entityType: EntityType, entityId: string
  ): Promise<Record<string, any> | null> {
    const idField = dataSource === 'recruiter_reputation' ? 'recruiter_id'
      : dataSource === 'entity_streaks' ? 'entity_id' : 'id';

    let query = this.supabase.from(dataSource).select('*').eq(idField, entityId);
    if (dataSource === 'entity_streaks') query = query.eq('entity_type', entityType);

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) throw error;
    return data;
  }

  private async findExisting(
    badgeDefinitionId: string, entityType: EntityType, entityId: string
  ): Promise<{ revoked_at: string | null } | null> {
    const { data, error } = await this.supabase.from('badges_awarded')
      .select('revoked_at').eq('badge_definition_id', badgeDefinitionId)
      .eq('entity_type', entityType).eq('entity_id', entityId).maybeSingle();
    if (error) throw error;
    return data;
  }

  private async getActiveByTriggerEvent(eventType: string): Promise<BadgeDefinition[]> {
    const { data, error } = await this.supabase.from('badge_definitions')
      .select('id, slug, entity_type, criteria, data_source, revocable, xp_reward')
      .eq('status', 'active').contains('trigger_events', [eventType]);
    if (error) throw error;
    return data || [];
  }

  private async updateProgress(
    def: BadgeDefinition, entityId: string, entityData: Record<string, any>
  ): Promise<void> {
    if (!def.criteria.all || def.criteria.all.length === 0) return;
    const numericCriterion = def.criteria.all.find(c => c.operator === 'gte' || c.operator === 'gt');
    if (!numericCriterion) return;

    const currentValue = Number(entityData[numericCriterion.field] ?? 0);
    const targetValue = Number(numericCriterion.value);
    if (currentValue < targetValue) {
      await this.supabase.from('badge_progress').upsert({
        badge_definition_id: def.id, entity_type: def.entity_type, entity_id: entityId,
        current_value: currentValue, target_value: targetValue,
      }, { onConflict: 'badge_definition_id,entity_type,entity_id' });
    }
  }

  private async removeProgress(
    badgeDefinitionId: string, entityType: EntityType, entityId: string
  ): Promise<void> {
    await this.supabase.from('badge_progress').delete()
      .eq('badge_definition_id', badgeDefinitionId)
      .eq('entity_type', entityType).eq('entity_id', entityId);
  }
}
