/**
 * Calls V3 Repository — Core CRUD
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CallListParams } from './types';

const SORTABLE_FIELDS = ['created_at', 'scheduled_at', 'status'];

const BASE_SELECT = `*,
  participants:call_participants(id, call_id, user_id, role, joined_at, left_at,
    user:users!call_participants_user_id_fkey(name, email, profile_image_url)),
  entity_links:call_entity_links(id, call_id, entity_type, entity_id)`;

export class CallRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: CallListParams, userId?: string): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    // Scope to calls the user participates in
    let callIds: string[] | null = null;
    if (userId) {
      const { data: participantLinks, error: pErr } = await this.supabase
        .from('call_participants')
        .select('call_id')
        .eq('user_id', userId);
      if (pErr) throw pErr;
      callIds = (participantLinks || []).map((l: any) => l.call_id);
      if (callIds.length === 0) return { data: [], total: 0 };
    }

    // When filtering by entity, intersect with participant scope
    if (params.entity_type && params.entity_id) {
      const { data: links, error: linkErr } = await this.supabase
        .from('call_entity_links')
        .select('call_id')
        .eq('entity_type', params.entity_type)
        .eq('entity_id', params.entity_id);
      if (linkErr) throw linkErr;
      const entityCallIds = (links || []).map((l: any) => l.call_id);
      if (callIds) {
        const participantSet = new Set(callIds);
        callIds = entityCallIds.filter(id => participantSet.has(id));
      } else {
        callIds = entityCallIds;
      }
      if (callIds.length === 0) return { data: [], total: 0 };
    }

    let query = this.supabase
      .from('calls')
      .select(BASE_SELECT, { count: 'exact' })
      .is('deleted_at', null);

    if (callIds) query = query.in('id', callIds);
    if (params.call_type) query = query.eq('call_type', params.call_type);
    if (params.status) query = query.eq('status', params.status);
    if (params.date_from) query = query.gte('scheduled_at', params.date_from);
    if (params.date_to) query = query.lte('scheduled_at', params.date_to);
    if (params.needs_follow_up) query = query.eq('needs_follow_up', true);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: this.mapParticipants(data || []), total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('calls')
      .select(BASE_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapParticipants([data])[0] : null;
  }

  async create(input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('calls')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('calls')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('calls')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async updateStatus(id: string, status: string, extraFields?: Record<string, any>): Promise<any> {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
      ...extraFields,
    };

    const { data, error } = await this.supabase
      .from('calls')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resolveUserId(clerkUserId: string): Promise<string | null> {
    const isClerkId = clerkUserId.startsWith('user_');
    const column = isClerkId ? 'clerk_user_id' : 'id';

    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .eq(column, clerkUserId)
      .maybeSingle();

    if (error) throw error;
    return data?.id || null;
  }

  async getCreatorTier(userId: string): Promise<'starter' | 'pro' | 'partner'> {
    const { data: sub } = await this.supabase
      .from('subscriptions')
      .select('plan:plans(tier)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return (sub?.plan as any)?.tier || 'starter';
  }

  /** Map profile_image_url → avatar_url to match frontend expectations */
  private mapParticipants(rows: any[]): any[] {
    return rows.map(row => ({
      ...row,
      participants: (row.participants || []).map((p: any) => ({
        ...p,
        user: p.user ? {
          name: p.user.name || '',
          avatar_url: p.user.profile_image_url || null,
          email: p.user.email || '',
        } : { name: '', avatar_url: null, email: '' },
      })),
      entity_links: row.entity_links || [],
    }));
  }
}
