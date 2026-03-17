/**
 * Company Contacts View Repository
 *
 * Queries memberships joined with users for a company's organization.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CompanyContactsRepository {
  constructor(private supabase: SupabaseClient) {}

  async findContacts(companyId: string): Promise<any[]> {
    // Look up the company's identity_organization_id
    const { data: company, error: companyError } = await this.supabase
      .from('companies')
      .select('identity_organization_id')
      .eq('id', companyId)
      .maybeSingle();

    if (companyError) throw companyError;
    if (!company?.identity_organization_id) return [];

    const { data, error } = await this.supabase
      .from('memberships')
      .select('id, role_name, user_id, users(id, name, email, profile_image_url)')
      .eq('organization_id', company.identity_organization_id)
      .in('role_name', ['hiring_manager', 'company_admin'])
      .is('deleted_at', null);

    if (error) throw error;

    return (data || []).map((m: any) => ({
      id: m.id,
      role: m.role_name,
      user_id: m.user_id,
      name: m.users?.name || null,
      email: m.users?.email || null,
      profile_image_url: m.users?.profile_image_url || null,
    }));
  }
}
