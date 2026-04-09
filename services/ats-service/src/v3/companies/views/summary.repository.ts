/**
 * Company Summary View Repository
 *
 * Flat projection of public display fields for a single company.
 * Used by any authenticated context (candidate chat, marketplace, etc.)
 * that needs to render a company's name/logo without full CRUD access.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface CompanySummary {
  id: string;
  name: string | null;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  headquarters_location: string | null;
}

export class CompanySummaryRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(companyId: string): Promise<CompanySummary | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('id, name, logo_url, website, industry, headquarters_location')
      .eq('id', companyId)
      .maybeSingle();

    if (error) throw error;
    return (data as CompanySummary) ?? null;
  }
}
