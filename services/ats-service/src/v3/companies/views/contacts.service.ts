/**
 * Company Contacts View Service
 *
 * Returns contacts (hiring managers, company admins) for a company.
 * Handles authorization: platform admins, org members, and recruiters can access.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { CompanyContactsRepository } from './contacts.repository.js';

export class CompanyContactsService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyContactsRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getContacts(companyId: string, clerkUserId: string) {
    // Verify the company exists
    const { data: company, error } = await this.supabase
      .from('companies')
      .select('id, identity_organization_id')
      .eq('id', companyId)
      .maybeSingle();

    if (error) throw error;
    if (!company) throw new NotFoundError('Company', companyId);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      const isOrgMember = company.identity_organization_id &&
        context.organizationIds.includes(company.identity_organization_id);
      const isRecruiter = context.recruiterId && context.roles.includes('recruiter');
      if (!isOrgMember && !isRecruiter) {
        throw new ForbiddenError('You do not have access to this company\'s contacts');
      }
    }

    return this.repository.findContacts(companyId);
  }
}
