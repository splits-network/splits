/**
 * Recruiter-Candidates V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, ConflictError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { RecruiterCandidateRepository } from './repository';
import { RecruiterActivityService } from '../recruiter-activity/service';
import { RecruiterCandidateListParams, CreateRecruiterCandidateInput, RecruiterCandidateUpdate, TerminateInput } from './types';

export class RecruiterCandidateService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterCandidateRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private activityService?: RecruiterActivityService
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: RecruiterCandidateListParams, clerkUserId?: string) {
    const scopeFilters = clerkUserId ? await this.buildScopeFilters(clerkUserId) : undefined;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    if (scopeFilters === null) return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const enriched = data.map((row: any) => this.enrichRelationship(row));
    return { data: enriched, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const rel = await this.repository.findById(id);
    if (!rel) throw new NotFoundError('RecruiterCandidate', id);
    return rel;
  }

  async create(input: CreateRecruiterCandidateInput, clerkUserId: string) {
    if (!input.recruiter_id || !input.candidate_id) {
      throw new BadRequestError('recruiter_id and candidate_id are required');
    }

    const existing = await this.repository.findExistingRelationship(input.recruiter_id, input.candidate_id);
    if (existing) {
      if (existing.status === 'active') {
        throw new ConflictError('An active relationship already exists with this candidate');
      }

      if (['terminated', 'declined', 'inactive'].includes(existing.status)) {
        const token = this.repository.generateInvitationToken();
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        const now = new Date().toISOString();

        const reactivated = await this.repository.update(existing.id, {
          status: 'active', invitation_token: token,
          invitation_expires_at: expires.toISOString(), invited_at: now,
          consent_given: null, consent_given_at: null,
          declined_at: null, declined_reason: null,
          termination_reason: null, terminated_by: null,
          relationship_start_date: null, relationship_end_date: null,
        });

        await this.eventPublisher?.publish('candidate.invited', {
          relationship_id: reactivated!.id, recruiter_id: reactivated!.recruiter_id,
          candidate_id: reactivated!.candidate_id, invitation_token: token,
          invitation_expires_at: expires.toISOString(),
        }, 'network-service');
        await this.activityService?.recordActivity({
          recruiter_id: reactivated!.recruiter_id, activity_type: 'candidate_connected',
          description: 'Reconnected with a candidate', metadata: { candidate_id: reactivated!.candidate_id },
        });
        return reactivated;
      }
    }

    const token = this.repository.generateInvitationToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    const now = new Date().toISOString();

    const rel = await this.repository.create({
      recruiter_id: input.recruiter_id, candidate_id: input.candidate_id,
      status: input.status || 'active',
      invitation_token: token, invitation_expires_at: expires.toISOString(),
      invited_at: now, created_at: now, updated_at: now,
    });

    await this.eventPublisher?.publish('recruiter_candidate.created', {
      relationship_id: rel.id, recruiter_id: rel.recruiter_id, candidate_id: rel.candidate_id,
    }, 'network-service');
    await this.eventPublisher?.publish('candidate.invited', {
      relationship_id: rel.id, recruiter_id: rel.recruiter_id, candidate_id: rel.candidate_id,
      invitation_token: token, invitation_expires_at: expires.toISOString(),
    }, 'network-service');
    await this.activityService?.recordActivity({
      recruiter_id: rel.recruiter_id, activity_type: 'candidate_connected',
      description: 'Connected with a new candidate', metadata: { candidate_id: rel.candidate_id },
    });
    return rel;
  }

  async update(id: string, updates: RecruiterCandidateUpdate, clerkUserId: string) {
    if (updates.resend_invitation) return this.resendInvitation(id, clerkUserId);
    if (updates.cancel_invitation) return this.cancelInvitation(id);
    if (updates.status) {
      const valid = ['active', 'inactive', 'blocked'];
      if (!valid.includes(updates.status)) throw new BadRequestError(`Invalid status. Must be one of: ${valid.join(', ')}`);
    }
    const rel = await this.repository.update(id, updates);
    if (!rel) throw new NotFoundError('RecruiterCandidate', id);
    await this.eventPublisher?.publish('recruiter_candidate.updated', { relationship_id: id, updates: Object.keys(updates) }, 'network-service');
    return rel;
  }

  async terminate(id: string, input: TerminateInput, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    const rel = await this.repository.update(id, {
      status: 'terminated', termination_reason: input.reason,
      terminated_by: ctx.identityUserId || undefined, relationship_end_date: new Date().toISOString(),
    });
    if (!rel) throw new NotFoundError('RecruiterCandidate', id);
    await this.eventPublisher?.publish('recruiter_candidate.terminated', {
      relationship_id: id, recruiter_id: rel.recruiter_id, candidate_id: rel.candidate_id,
      reason: input.reason, terminated_by: ctx.identityUserId,
    }, 'network-service');
    return rel;
  }

  async delete(id: string) {
    await this.repository.delete(id);
    await this.eventPublisher?.publish('recruiter_candidate.deleted', { relationship_id: id }, 'network-service');
  }

  async getInvitationByToken(token: string) {
    const rel = await this.repository.findByInvitationToken(token);
    if (!rel) throw new NotFoundError('Invitation', token);
    if (rel.invitation_expires_at && new Date(rel.invitation_expires_at) < new Date()) {
      throw new BadRequestError('This invitation has expired');
    }
    if (rel.consent_given) throw new BadRequestError('This invitation has already been accepted');
    if (rel.declined_at) throw new BadRequestError('This invitation has already been declined');
    return {
      relationship_id: rel.id, recruiter_id: rel.recruiter_id, candidate_id: rel.candidate_id,
      invited_at: rel.invited_at, expires_at: rel.invitation_expires_at, status: 'pending',
      recruiter_name: rel.recruiter?.user?.name, recruiter_email: rel.recruiter?.user?.email,
      recruiter_bio: rel.recruiter?.bio,
    };
  }

  async acceptInvitation(token: string, metadata: { userId?: string; ip_address?: string; user_agent?: string }) {
    const rel = await this.repository.findByInvitationToken(token);
    if (!rel) throw new NotFoundError('Invitation', token);
    if (rel.invitation_expires_at && new Date(rel.invitation_expires_at) < new Date()) throw new BadRequestError('Invitation has expired');
    if (rel.consent_given) throw new BadRequestError('Invitation has already been accepted');
    if (rel.declined_at) throw new BadRequestError('Invitation has already been declined');

    const updated = await this.repository.update(rel.id, {
      consent_given: true, consent_given_at: new Date().toISOString(),
      consent_ip_address: metadata.ip_address || null, consent_user_agent: metadata.user_agent || null,
      relationship_start_date: new Date().toISOString(),
      relationship_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      status: 'active',
    });

    if (metadata.userId && rel.candidate_id) {
      await this.eventPublisher?.publish('candidate.link_requested', { candidate_id: rel.candidate_id, user_id: metadata.userId, recruiter_id: rel.recruiter_id }, 'network-service');
    }
    if (rel.candidate_id && rel.recruiter_id) {
      await this.eventPublisher?.publish('candidate.sourcer_assignment_requested', { candidate_id: rel.candidate_id, recruiter_id: rel.recruiter_id, source_method: 'invitation_accepted' }, 'network-service');
    }
    await this.eventPublisher?.publish('candidate.consent_given', { relationship_id: updated!.id, recruiter_id: updated!.recruiter_id, candidate_id: updated!.candidate_id, consent_given_at: updated!.consent_given_at }, 'network-service');
    return { success: true, message: 'Invitation accepted successfully', relationship_id: updated!.id, consent_given_at: updated!.consent_given_at };
  }

  async declineInvitation(token: string, metadata: { reason?: string; ip_address?: string; user_agent?: string }) {
    const rel = await this.repository.findByInvitationToken(token);
    if (!rel) throw new NotFoundError('Invitation', token);
    if (rel.consent_given) throw new BadRequestError('Invitation has already been accepted');
    if (rel.declined_at) throw new BadRequestError('Invitation has already been declined');

    const updated = await this.repository.update(rel.id, {
      consent_given: false, declined_at: new Date().toISOString(), declined_reason: metadata.reason || null,
      consent_ip_address: metadata.ip_address || null, consent_user_agent: metadata.user_agent || null,
      status: 'declined', relationship_start_date: null, relationship_end_date: null,
    });
    await this.eventPublisher?.publish('candidate.consent_declined', { relationship_id: updated!.id, recruiter_id: updated!.recruiter_id, candidate_id: updated!.candidate_id, declined_at: updated!.declined_at, declined_reason: updated!.declined_reason }, 'network-service');
    return { success: true, message: 'Invitation declined', relationship_id: updated!.id, declined_at: updated!.declined_at };
  }

  private async resendInvitation(id: string, clerkUserId: string) {
    const rel = await this.repository.findById(id);
    if (!rel) throw new NotFoundError('RecruiterCandidate', id);
    if (rel.consent_given) throw new BadRequestError('Candidate has already accepted');
    if (rel.declined_at) throw new BadRequestError('Candidate has already declined');
    const updated = await this.repository.resendInvitation(id);
    await this.eventPublisher?.publish('candidate.invited', {
      relationship_id: updated.id, recruiter_id: updated.recruiter_id, candidate_id: updated.candidate_id,
      invitation_token: updated.invitation_token, invitation_expires_at: updated.invitation_expires_at, resend: true,
    }, 'network-service');
    return updated;
  }

  private async cancelInvitation(id: string) {
    const rel = await this.repository.findById(id);
    if (!rel) throw new NotFoundError('RecruiterCandidate', id);
    if (rel.consent_given) throw new BadRequestError('Candidate has already accepted');
    const updated = await this.repository.update(id, { status: 'terminated' });
    await this.eventPublisher?.publish('candidate.invitation_cancelled', { relationship_id: updated!.id, recruiter_id: updated!.recruiter_id, candidate_id: updated!.candidate_id }, 'network-service');
    return updated;
  }

  private enrichRelationship(row: any): any {
    let daysUntilExpiry: number | undefined;
    if (row.relationship_end_date) {
      daysUntilExpiry = Math.ceil((new Date(row.relationship_end_date).getTime() - Date.now()) / 86400000);
    }
    return { ...row, recruiter_name: row.recruiter?.user?.name ?? null, recruiter_email: row.recruiter?.user?.email ?? null, days_until_expiry: daysUntilExpiry };
  }

  private async buildScopeFilters(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (ctx.isPlatformAdmin) return {};
    if (ctx.recruiterId) return { recruiter_id: ctx.recruiterId };
    return null;
  }
}
