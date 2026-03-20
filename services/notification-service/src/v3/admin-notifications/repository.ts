/**
 * Admin Notifications V3 Repository
 *
 * Queries site_notifications and notification_log tables.
 * Admin-only — no user scoping, no role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AdminListParams } from './types';

const SITE_SORTABLE = ['created_at', 'title', 'severity'];
const LOG_SORTABLE = ['created_at', 'sent_at', 'status'];

export class AdminNotificationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAllSiteNotifications(
    params: AdminListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;
    const sortBy = SITE_SORTABLE.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('site_notifications')
      .select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,message.ilike.%${params.search}%`);
    }
    if (params.is_active !== undefined) {
      query = query.eq('is_active', params.is_active === 'true' || params.is_active === true);
    }
    if (params.severity) {
      query = query.eq('severity', params.severity);
    }

    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findSiteNotificationById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('site_notifications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createSiteNotification(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('site_notifications')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSiteNotification(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('site_notifications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSiteNotification(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('site_notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async findActiveSiteNotifications(): Promise<any[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('site_notifications')
      .select('*')
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('severity', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findAllNotificationLog(
    params: AdminListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;
    const sortBy = LOG_SORTABLE.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('notification_log')
      .select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(
        `recipient_email.ilike.%${params.search}%,event_type.ilike.%${params.search}%`,
      );
    }
    if (params.status) query = query.eq('status', params.status);
    if (params.channel) query = query.eq('channel', params.channel);

    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async getAdminCounts(): Promise<{
    active_site_notifications: number;
    notification_log_total: number;
  }> {
    const [activeRes, logRes] = await Promise.all([
      this.supabase
        .from('site_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      this.supabase
        .from('notification_log')
        .select('id', { count: 'exact', head: true }),
    ]);

    return {
      active_site_notifications: activeRes.count || 0,
      notification_log_total: logRes.count || 0,
    };
  }
}
