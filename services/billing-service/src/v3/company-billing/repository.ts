/**
 * Company Billing V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CompanyBillingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByCompanyId(companyId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_billing_profiles')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data?.[0] || null;
  }

  async list(page: number, limit: number): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;
    const { data, error, count } = await this.supabase
      .from('company_billing_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async create(companyId: string, record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_billing_profiles')
      .insert({ ...record, company_id: companyId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(companyId: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_billing_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('company_id', companyId)
      .select()
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data?.[0] || null;
  }
}
