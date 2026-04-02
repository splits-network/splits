/**
 * Recruiter-Companies V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { RecruiterCompanyRepository } from './repository.js';
import { RecruiterActivityService } from '../recruiter-activity/service.js';
import {
  RecruiterCompanyListParams, RecruiterCompanyUpdate, RecruiterCompanyPermissions,
  DEFAULT_PERMISSIONS, InviteRecruiterInput, RespondInput, TerminateInput, RequestConnectionInput,
} from './types.js';

export class RecruiterCompanyService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterCompanyRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private activityService?: RecruiterActivityService
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: RecruiterCompanyListParams, clerkUserId?: string) {
    const scopeFilters = clerkUserId ? await this.buildScopeFilters(clerkUserId) : undefined;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    if (scopeFilters === null) return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
    const { data, total } = await this.repository.findAll(params, scopeFilters);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const rel = await this.repository.findById(id);
    if (!rel) throw new NotFoundError('RecruiterCompany', id);
    return rel;
  }

  async inviteRecruiter(input: InviteRecruiterInput, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    const exists = await this.repository.hasActiveRelationship(input.recruiter_id, input.company_id);
    if (exists) throw new BadRequestError('Recruiter is already actively working with this company');

    const rel = await this.repository.create({
      recruiter_id: input.recruiter_id, company_id: input.company_id,
      relationship_type: input.relationship_type || 'recruiter',
      permissions: input.permissions || DEFAULT_PERMISSIONS,
      invited_by: ctx.identityUserId || undefined, request_message: input.message || undefined,
    });
    await this.eventPublisher?.publish('recruiter_company.invited', {
      relationshipId: rel.id, recruiterId: input.recruiter_id, companyId: input.company_id,
      relationshipType: rel.relationship_type, permissions: rel.permissions,
      invitedBy: ctx.identityUserId, message: input.message,
    }, 'network-service');
    return rel;
  }

  async requestConnection(input: RequestConnectionInput, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.recruiterId) throw new ForbiddenError('Only recruiters can request company connections');

    const { data: company } = await this.supabase.from('companies').select('id, name').eq('id', input.company_id).maybeSingle();
    if (!company) throw new NotFoundError('Company', input.company_id);

    const exists = await this.repository.hasPendingOrActiveRelationship(ctx.recruiterId, input.company_id);
    if (exists) throw new BadRequestError('An active or pending relationship already exists with this company');

    const rel = await this.repository.create({
      recruiter_id: ctx.recruiterId, company_id: input.company_id,
      relationship_type: input.relationship_type || 'recruiter',
      invited_by: ctx.identityUserId || undefined, request_message: input.message || undefined,
    });
    await this.eventPublisher?.publish('recruiter_company.connection_requested', {
      relationshipId: rel.id, recruiterId: ctx.recruiterId, companyId: input.company_id,
      relationshipType: rel.relationship_type, requestedBy: ctx.identityUserId,
      message: input.message,
    }, 'network-service');
    return rel;
  }

  async respondToInvitation(id: string, input: RespondInput, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    const rel = await this.repository.findById(id);
    if (!rel) throw new NotFoundError('RecruiterCompany', id);
    if (rel.status !== 'pending') throw new BadRequestError('This invitation has already been responded to');

    const updates: RecruiterCompanyUpdate = { status: input.accept ? 'active' : 'declined' };
    if (input.accept) updates.permissions = input.permissions || DEFAULT_PERMISSIONS;
    const updated = await this.repository.update(id, updates);

    const eventType = input.accept ? 'recruiter_company.accepted' : 'recruiter_company.declined';
    await this.eventPublisher?.publish(eventType, {
      relationshipId: id, recruiterId: rel.recruiter_id, companyId: rel.company_id,
      respondedBy: ctx.identityUserId, permissions: input.accept ? updated.permissions : undefined,
    }, 'network-service');

    if (input.accept) {
      await this.activityService?.recordActivity({
        recruiter_id: rel.recruiter_id, activity_type: 'company_connected',
        description: 'Partnered with a new company', metadata: { company_id: rel.company_id },
      });
    }
    return updated;
  }

  async update(id: string, updates: RecruiterCompanyUpdate, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    const rel = await this.repository.update(id, updates);
    if (updates.status || updates.permissions) {
      await this.eventPublisher?.publish('recruiter_company.updated', {
        relationshipId: id, changes: Object.keys(updates), updatedBy: ctx.identityUserId,
      }, 'network-service');
    }
    return rel;
  }

  async terminate(id: string, input: TerminateInput, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    const rel = await this.repository.update(id, {
      status: 'terminated', termination_reason: input.reason,
      relationship_end_date: new Date().toISOString(), terminated_by: ctx.identityUserId || undefined,
    });
    await this.eventPublisher?.publish('recruiter_company.terminated', {
      relationshipId: id, recruiterId: rel.recruiter_id, companyId: rel.company_id,
      reason: input.reason, terminatedBy: ctx.identityUserId,
    }, 'network-service');
    return rel;
  }

  async delete(id: string, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    const rel = await this.repository.findById(id);
    if (!rel) throw new NotFoundError('RecruiterCompany', id);
    await this.repository.update(id, {
      status: 'terminated', termination_reason: 'deleted', relationship_end_date: new Date().toISOString(),
    });
    await this.eventPublisher?.publish('recruiter_company.deleted', {
      relationshipId: id, recruiterId: rel.recruiter_id, companyId: rel.company_id, deletedBy: ctx.identityUserId,
    }, 'network-service');
  }

  async getPermissions(recruiterId: string, companyId: string) {
    return this.repository.getPermissions(recruiterId, companyId);
  }

  async getAllPermissionsForRecruiter(recruiterId: string) {
    return this.repository.getAllPermissionsForRecruiter(recruiterId);
  }

  private async buildScopeFilters(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (ctx.isPlatformAdmin) return {};
    if (ctx.recruiterId) return { recruiter_id: ctx.recruiterId };
    if (ctx.organizationIds.length > 0) {
      const { data: companies } = await this.supabase.from('companies').select('id').in('identity_organization_id', ctx.organizationIds);
      const ids = companies?.map(c => c.id) || [];
      return ids.length > 0 ? { company_ids: ids } : null;
    }
    return null;
  }
}
