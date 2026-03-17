/**
 * Companies V3 Service — Business Logic
 *
 * Handles authorization, validation, and event publishing.
 * No HTTP concepts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { CompanyRepository } from './repository';
import { CreateCompanyInput, UpdateCompanyInput, CompanyListParams } from './types';

export class CompanyService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: CompanyListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { organization_ids?: string[]; status_override?: string } = {};

    if (context.isPlatformAdmin) {
      // Admins see everything
    } else if (context.recruiterId && context.roles.includes('recruiter')) {
      // Recruiters see all companies (marketplace browse)
    } else if (context.organizationIds.length > 0) {
      // Company users see only their org's companies
      scopeFilters.organization_ids = context.organizationIds;
    } else {
      return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const company = await this.repository.findById(id);
    if (!company) throw new NotFoundError('Company', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      const isOrgMember = company.identity_organization_id &&
        context.organizationIds.includes(company.identity_organization_id);
      const isRecruiter = context.recruiterId && context.roles.includes('recruiter');
      if (!isOrgMember && !isRecruiter) {
        throw new ForbiddenError('You do not have access to this company');
      }
    }

    return company;
  }

  async create(input: CreateCompanyInput, clerkUserId: string) {
    if (!input.name?.trim()) {
      throw new BadRequestError('Company name is required');
    }
    if (!input.identity_organization_id) {
      throw new BadRequestError('Organization ID is required');
    }

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      const isOrgMember = context.organizationIds.includes(input.identity_organization_id);
      if (!isOrgMember) {
        throw new ForbiddenError('You can only create companies for your own organization');
      }
    }

    const now = new Date().toISOString();
    const record = {
      ...input,
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('company.created', {
      companyId: created.id,
      organizationId: created.identity_organization_id,
      createdBy: context.identityUserId,
    }, 'ats-service');

    return created;
  }

  async update(id: string, input: UpdateCompanyInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Company', id);

    if (input.name !== undefined && !input.name.trim()) {
      throw new BadRequestError('Company name cannot be empty');
    }

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      const isOrgMember = existing.identity_organization_id &&
        context.organizationIds.includes(existing.identity_organization_id);
      if (!isOrgMember) {
        throw new ForbiddenError('You can only update companies in your own organization');
      }
    }

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('Company', id);

    await this.eventPublisher?.publish('company.updated', {
      companyId: id,
      updatedFields: Object.keys(input),
      updatedBy: context.identityUserId,
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Company', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      const isOrgMember = existing.identity_organization_id &&
        context.organizationIds.includes(existing.identity_organization_id);
      if (!isOrgMember) {
        throw new ForbiddenError('You can only delete companies in your own organization');
      }
    }

    await this.repository.delete(id);

    await this.eventPublisher?.publish('company.deleted', {
      companyId: id,
      deletedBy: context.identityUserId,
    }, 'ats-service');
  }

}
