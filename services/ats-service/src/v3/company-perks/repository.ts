/**
 * Company Perks V3 Repository — Junction CRUD
 *
 * Single table queries only. NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CompanyPerkRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByCompanyId(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('company_perks')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_perks')
      .upsert(record)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async delete(companyId: string, perkId: string): Promise<void> {
    const { error } = await this.supabase
      .from('company_perks')
      .delete()
      .eq('company_id', companyId)
      .eq('perk_id', perkId);

    if (error) throw error;
  }

  async bulkReplace(
    companyId: string,
    perks: Array<{ perk_id: string }>
  ): Promise<any[]> {
    const { error: deleteError } = await this.supabase
      .from('company_perks')
      .delete()
      .eq('company_id', companyId);

    if (deleteError) throw deleteError;
    if (perks.length === 0) return [];

    const rows = perks.map(p => ({
      company_id: companyId,
      perk_id: p.perk_id,
    }));

    const { data, error } = await this.supabase
      .from('company_perks')
      .insert(rows)
      .select('*');

    if (error) throw error;
    return data || [];
  }
}
