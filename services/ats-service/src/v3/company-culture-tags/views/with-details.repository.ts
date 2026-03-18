/**
 * Company Culture Tags "with-details" View Repository
 *
 * Joins company_culture_tags with culture_tags to include tag name/details.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const WITH_DETAILS_SELECT = '*, culture_tag:culture_tags(*)';

export class WithDetailsCompanyCultureTagRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByCompanyId(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('company_culture_tags')
      .select(WITH_DETAILS_SELECT)
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
