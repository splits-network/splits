/**
 * Company Skills "with-details" View Repository
 *
 * Joins company_skills with skills to include skill name/slug.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const WITH_DETAILS_SELECT = '*, skill:skills(*)';

export class WithDetailsCompanySkillRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByCompanyId(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('company_skills')
      .select(WITH_DETAILS_SELECT)
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
