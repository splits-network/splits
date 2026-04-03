/**
 * Notifications V3 Repository — Core CRUD
 *
 * Single table queries on notification_log. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { NotificationListParams, NotificationUpdateInput } from './types.js';

const SORTABLE_FIELDS = ['created_at', 'sent_at', 'priority', 'status'];

export class NotificationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: NotificationListParams,
    recipientUserId: string,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('notification_log')
      .select('*', { count: 'exact' })
      .eq('recipient_user_id', recipientUserId);

    if (params.channel) query = query.eq('channel', params.channel);
    if (params.status) query = query.eq('status', params.status);
    if (params.category) query = query.eq('category', params.category);
    if (params.priority) query = query.eq('priority', params.priority);
    if (params.unread_only) query = query.eq('read', false);
    if (params.search) {
      query = query.or(
        `subject.ilike.%${params.search}%,event_type.ilike.%${params.search}%`,
      );
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('notification_log')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: NotificationUpdateInput): Promise<any> {
    const { data, error } = await this.supabase
      .from('notification_log')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notification_log')
      .update({ dismissed: true })
      .eq('id', id);

    if (error) throw error;
  }

  async markAllAsRead(recipientUserId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('notification_log')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('recipient_user_id', recipientUserId)
      .eq('read', false)
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  }

  async countUnread(recipientUserId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('notification_log')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_user_id', recipientUserId)
      .eq('read', false)
      .eq('dismissed', false);

    if (error) throw error;
    return count || 0;
  }

  async countUnreadByCategory(recipientUserId: string): Promise<Record<string, number>> {
    const { data, error } = await this.supabase
      .from('notification_log')
      .select('category, action_url')
      .eq('recipient_user_id', recipientUserId)
      .eq('read', false)
      .eq('dismissed', false);

    if (error) throw error;

    // Count distinct resources per category using action_url as the resource identifier.
    // This prevents 10 notifications for the same application showing as "10 applications".
    const counts: Record<string, Set<string>> = {};
    for (const row of data || []) {
      const cat = row.category || 'uncategorized';
      if (!counts[cat]) counts[cat] = new Set();
      // Use action_url as distinct key; fall back to a unique counter if missing
      counts[cat].add(row.action_url || `no-url-${counts[cat].size}`);
    }

    const result: Record<string, number> = {};
    for (const [cat, urls] of Object.entries(counts)) {
      result[cat] = urls.size;
    }
    return result;
  }

  async markAsReadByCategory(recipientUserId: string, category: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('notification_log')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('recipient_user_id', recipientUserId)
      .eq('category', category)
      .eq('read', false)
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  }
}
