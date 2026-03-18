/**
 * Company Perks "with-details" View Repository
 *
 * Joins company_perks with perks to include perk name/details.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const WITH_DETAILS_SELECT = '*, perk:perks(*)';

export class WithDetailsCompanyPerkRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByCompanyId(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('company_perks')
      .select(WITH_DETAILS_SELECT)
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
