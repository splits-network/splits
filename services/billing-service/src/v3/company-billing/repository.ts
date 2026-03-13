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
      .maybeSingle();
    if (error) throw error;
    return data;
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

  async upsert(companyId: string, record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_billing_profiles')
      .upsert({ ...record, company_id: companyId })
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
      .single();
    if (error) throw error;
    return data;
  }
}
