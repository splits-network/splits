/**
 * Call Artifacts V3 Repository
 * Entity links, tags, recordings, notes — single table each
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ArtifactListParams } from './types.js';

export class ArtifactRepository {
  constructor(private supabase: SupabaseClient) {}

  // Entity Links
  async findEntityLinks(callId: string, params: ArtifactListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    const query = this.supabase
      .from('call_entity_links')
      .select('*', { count: 'exact' })
      .eq('call_id', callId)
      .order('created_at', { ascending: params.sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findEntityLinkById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('call_entity_links')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createEntityLink(callId: string, input: { entity_type: string; entity_id: string }): Promise<any> {
    const { data, error } = await this.supabase
      .from('call_entity_links')
      .insert({ call_id: callId, entity_type: input.entity_type, entity_id: input.entity_id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEntityLink(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('call_entity_links')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Tags
  async listTags(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('call_tags')
      .select('*')
      .order('label', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
