/**
 * Company Culture Tags V3 Repository — Junction CRUD
 *
 * Single table queries only. NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CompanyCultureTagRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByCompanyId(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('company_culture_tags')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_culture_tags')
      .upsert(record)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async delete(companyId: string, cultureTagId: string): Promise<void> {
    const { error } = await this.supabase
      .from('company_culture_tags')
      .delete()
      .eq('company_id', companyId)
      .eq('culture_tag_id', cultureTagId);

    if (error) throw error;
  }

  async bulkReplace(
    companyId: string,
    cultureTags: Array<{ culture_tag_id: string }>
  ): Promise<any[]> {
    const { error: deleteError } = await this.supabase
      .from('company_culture_tags')
      .delete()
      .eq('company_id', companyId);

    if (deleteError) throw deleteError;
    if (cultureTags.length === 0) return [];

    const rows = cultureTags.map(ct => ({
      company_id: companyId,
      culture_tag_id: ct.culture_tag_id,
    }));

    const { data, error } = await this.supabase
      .from('company_culture_tags')
      .insert(rows)
      .select('*');

    if (error) throw error;
    return data || [];
  }
}
