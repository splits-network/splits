/**
 * Placement Invoices V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PlacementInvoiceListParams } from './types';

export class PlacementInvoiceRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: PlacementInvoiceListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('placement_invoices')
      .select('*', { count: 'exact' });

    if (params.placement_id) query = query.eq('placement_id', params.placement_id);
    if (params.company_id) query = query.eq('company_id', params.company_id);
    if (params.firm_id) query = query.eq('firm_id', params.firm_id);
    if (params.invoice_status) query = query.eq('invoice_status', params.invoice_status);

    const sortBy = params.sort_by || 'created_at';
    const ascending = (params.sort_order || 'desc').toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findByPlacementId(placementId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('placement_invoices')
      .select('*')
      .eq('placement_id', placementId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findByCompanyId(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('placement_invoices')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('placement_invoices')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('placement_invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}
