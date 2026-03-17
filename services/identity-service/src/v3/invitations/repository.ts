/**
 * Invitations V3 Repository — Pure data layer
 *
 * NO role logic. Scope filtering set by service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { InvitationListParams } from './types';

const INVITATION_SELECT = '*, organizations(*), companies(*)';

export class InvitationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: InvitationListParams
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('invitations')
      .select(INVITATION_SELECT, { count: 'exact' })
      .is('deleted_at', null);

    if (params.organization_id) query = query.eq('organization_id', params.organization_id);
    if (params.company_id !== undefined) {
      if (params.company_id === null) {
        query = query.is('company_id', null);
      } else {
        query = query.eq('company_id', params.company_id);
      }
    }
    if (params.email) query = query.eq('email', params.email);
    if (params.status) query = query.eq('status', params.status);

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('invitations')
      .select(INVITATION_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('invitations')
      .insert(record)
      .select(INVITATION_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('invitations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(INVITATION_SELECT)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('invitations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
