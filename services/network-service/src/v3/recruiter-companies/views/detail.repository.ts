/**
 * Recruiter-Companies Detail View Repository
 * GET /api/v3/recruiter-companies/:id/view/detail
 *
 * Returns the full relationship with recruiter (user), company profile, and open roles count.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const DETAIL_SELECT = `
  *,
  recruiter:recruiters!inner(
    id, user_id, phone, bio, tagline,
    user:users!recruiters_user_id_fkey!inner(name, email)
  ),
  company:companies!inner(
    id, name, industry, headquarters_location, description,
    website, company_size, stage, logo_url, founded_year, tagline
  )
`;

export class RecruiterCompanyDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_companies')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    if (data.company?.id) {
      const { data: jobs } = await this.supabase
        .from('jobs')
        .select('id')
        .eq('company_id', data.company.id)
        .eq('status', 'active');

      return {
        ...data,
        company: { ...data.company, open_roles_count: jobs?.length ?? 0 },
      };
    }

    return data;
  }
}
