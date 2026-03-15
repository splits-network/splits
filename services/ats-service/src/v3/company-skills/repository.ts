/**
 * Company Skills V3 Repository — Junction CRUD
 *
 * Single table queries only. NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CompanySkillRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByCompanyId(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('company_skills')
      .select('*, skill:skills(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_skills')
      .upsert(record)
      .select('*, skill:skills(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async delete(companyId: string, skillId: string): Promise<void> {
    const { error } = await this.supabase
      .from('company_skills')
      .delete()
      .eq('company_id', companyId)
      .eq('skill_id', skillId);

    if (error) throw error;
  }

  async bulkReplace(
    companyId: string,
    skills: Array<{ skill_id: string }>
  ): Promise<any[]> {
    const { error: deleteError } = await this.supabase
      .from('company_skills')
      .delete()
      .eq('company_id', companyId);

    if (deleteError) throw deleteError;
    if (skills.length === 0) return [];

    const rows = skills.map(s => ({
      company_id: companyId,
      skill_id: s.skill_id,
    }));

    const { data, error } = await this.supabase
      .from('company_skills')
      .insert(rows)
      .select('*, skill:skills(*)');

    if (error) throw error;
    return data || [];
  }
}
