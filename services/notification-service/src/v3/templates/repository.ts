/**
 * Email Templates V3 Repository — Core CRUD
 *
 * Single table queries on email_templates. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { TemplateListParams } from './types';

export class TemplateRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: TemplateListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('email_templates')
      .select('*', { count: 'exact' });

    if (params.event_type) query = query.eq('event_type', params.event_type);
    if (params.status) query = query.eq('status', params.status);
    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,event_type.ilike.%${params.search}%,subject.ilike.%${params.search}%`,
      );
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('email_templates')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
