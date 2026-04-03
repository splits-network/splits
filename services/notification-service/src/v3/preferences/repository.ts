/**
 * Notification Preferences V3 Repository — Core CRUD
 *
 * Single table queries on notification_preferences. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PreferenceUpdateInput } from './types.js';

export class PreferenceRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('category');

    if (error) throw error;
    return data || [];
  }

  async upsertPreference(
    userId: string,
    category: string,
    update: PreferenceUpdateInput,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: userId,
          category,
          email_enabled: update.email_enabled ?? true,
          in_app_enabled: update.in_app_enabled ?? true,
          push_enabled: update.push_enabled ?? true,
        },
        { onConflict: 'user_id,category' },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async bulkUpsert(
    userId: string,
    updates: Array<{ category: string; email_enabled: boolean; in_app_enabled: boolean; push_enabled: boolean }>,
  ): Promise<any[]> {
    const rows = updates.map((u) => ({
      user_id: userId,
      category: u.category,
      email_enabled: u.email_enabled,
      in_app_enabled: u.in_app_enabled,
      push_enabled: u.push_enabled,
    }));

    const { data, error } = await this.supabase
      .from('notification_preferences')
      .upsert(rows, { onConflict: 'user_id,category' })
      .select();

    if (error) throw error;
    return data || [];
  }
}
