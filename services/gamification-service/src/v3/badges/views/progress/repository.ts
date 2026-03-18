/**
 * Badge Progress View Repository
 *
 * Queries badge_progress joined with badge_definitions.
 * This is a view — cross-table joins are expected.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface BadgeProgressEntry {
  id: string;
  badge_definition_id: string;
  entity_type: string;
  entity_id: string;
  current_value: number;
  target_value: number;
  percentage: number;
  updated_at: string;
  badge_definition: {
    slug: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    tier: string | null;
  };
}

export class BadgeProgressRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<BadgeProgressEntry[]> {
    const { data, error } = await this.supabase
      .from('badge_progress')
      .select(`
        *,
        badge_definition:badge_definitions(slug, name, description, icon, color, tier)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
