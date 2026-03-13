/**
 * Support Tickets V3 Repository — Core CRUD
 *
 * Single table queries on support_tickets. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { TicketListParams, TicketStatus } from './types';

export class TicketRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: TicketListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('support_tickets')
      .select('*', { count: 'exact' });

    if (params.status) query = query.eq('status', params.status);
    if (params.category) query = query.eq('category', params.category);
    if (params.search) {
      query = query.or(
        `subject.ilike.%${params.search}%,body.ilike.%${params.search}%,visitor_name.ilike.%${params.search}%`,
      );
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByVisitor(
    sessionId?: string,
    clerkUserId?: string,
  ): Promise<any[]> {
    let query = this.supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (clerkUserId) {
      query = query.eq('clerk_user_id', clerkUserId);
    } else if (sessionId) {
      query = query.eq('visitor_session_id', sessionId);
    } else {
      return [];
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getStatusCounts(): Promise<Record<string, number>> {
    const statuses: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
    const counts: Record<string, number> = {};

    for (const status of statuses) {
      const { count } = await this.supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      counts[status] = count || 0;
    }

    return counts;
  }
}
