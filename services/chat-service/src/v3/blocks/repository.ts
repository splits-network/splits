/**
 * Blocks V3 Repository -- Core CRUD
 *
 * Flat select('*') on chat_user_blocks. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BlockListParams, ChatUserBlock } from './types';

const SORTABLE_FIELDS = ['created_at'];

export class BlockRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: BlockListParams,
    blockerUserId: string,
  ): Promise<{ data: ChatUserBlock[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const sortAscending = params.sort_order === 'asc';

    const { data, count, error } = await this.supabase
      .from('chat_user_blocks')
      .select('*', { count: 'exact' })
      .eq('blocker_user_id', blockerUserId)
      .order(sortBy, { ascending: sortAscending })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: (data || []) as ChatUserBlock[], total: count || 0 };
  }

  async findById(id: string): Promise<ChatUserBlock | null> {
    const { data, error } = await this.supabase
      .from('chat_user_blocks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ChatUserBlock | null;
  }

  async findByBlockerAndBlocked(
    blockerUserId: string,
    blockedUserId: string,
  ): Promise<ChatUserBlock | null> {
    const { data, error } = await this.supabase
      .from('chat_user_blocks')
      .select('*')
      .eq('blocker_user_id', blockerUserId)
      .eq('blocked_user_id', blockedUserId)
      .maybeSingle();

    if (error) throw error;
    return data as ChatUserBlock | null;
  }

  async create(
    blockerUserId: string,
    blockedUserId: string,
    reason?: string | null,
  ): Promise<ChatUserBlock> {
    const { data, error } = await this.supabase
      .from('chat_user_blocks')
      .insert({
        blocker_user_id: blockerUserId,
        blocked_user_id: blockedUserId,
        reason: reason ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChatUserBlock;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_user_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
