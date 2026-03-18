/**
 * Company-Invitations V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { CompanyInvitationRepository } from './repository';
import { CompanyInvitationListParams, CreateCompanyInvitationInput } from './types';

export class CompanyInvitationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyInvitationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: CompanyInvitationListParams, clerkUserId: string) {
    const scopeFilters = await this.buildScopeFilters(clerkUserId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    if (scopeFilters === null) return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
    const { data, total } = await this.repository.findAll(params, scopeFilters);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const inv = await this.repository.findById(id);
    if (!inv) throw new NotFoundError('CompanyInvitation', id);
    return inv;
  }

  async create(input: CreateCompanyInvitationInput, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.recruiterId) throw new ForbiddenError('Only recruiters can create company invitations');

    const inv = await this.repository.create(ctx.recruiterId, {
      invited_email: input.invited_email, company_name_hint: input.company_name_hint,
      personal_message: input.personal_message,
    });

    if (input.send_email && input.invited_email) {
      const recruiter = await this.resolveRecruiterInfo(inv.recruiter_id);
      await this.eventPublisher?.publish('company_invitation.created', {
        invitation_id: inv.id, recruiter_id: inv.recruiter_id,
        recruiter_name: recruiter?.name, recruiter_email: recruiter?.email,
        invited_email: inv.invited_email, company_name_hint: inv.company_name_hint,
        personal_message: inv.personal_message, invite_code: inv.invite_code,
        invite_link_token: inv.invite_link_token, expires_at: inv.expires_at, send_email: true,
      }, 'network-service');
      await this.repository.update(inv.id, { email_sent_at: new Date().toISOString() });
    }
    return inv;
  }

  async lookupByCode(code: string) {
    const inv = await this.repository.findByCode(code);
    return this.buildLookupResult(inv);
  }

  async lookupByToken(token: string) {
    const inv = await this.repository.findByToken(token);
    return this.buildLookupResult(inv);
  }

  async accept(id: string, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.identityUserId) throw new BadRequestError('User must be authenticated');

    const { data: inv } = await this.supabase.from('recruiter_company_invitations').select('*').eq('id', id).single();
    if (!inv) throw new NotFoundError('CompanyInvitation', id);
    if (inv.status === 'accepted') throw new BadRequestError('This invitation has already been used');
    if (inv.status === 'revoked') throw new BadRequestError('This invitation has been revoked');
    if (new Date(inv.expires_at) < new Date() || inv.status === 'expired') throw new BadRequestError('This invitation has expired');
    if (inv.status !== 'pending') throw new BadRequestError('Invalid invitation');

    const { data: existingRole } = await this.supabase.from('memberships').select('id')
      .eq('user_id', ctx.identityUserId).eq('role_name', 'company_admin').is('deleted_at', null).maybeSingle();
    if (existingRole) throw new BadRequestError('You are already an admin of a company');

    const { data: user } = await this.supabase.from('users').select('id, onboarding_metadata')
      .eq('id', ctx.identityUserId).single();
    if (!user) throw new BadRequestError('User not found');

    const meta = (user.onboarding_metadata as Record<string, unknown>) || {};
    await this.supabase.from('users').update({
      onboarding_status: 'in_progress', onboarding_step: 2,
      onboarding_metadata: { ...meta, user_type: 'company_admin', from_invitation: { id, recruiter_id: inv.recruiter_id, company_name_hint: inv.company_name_hint } },
      updated_at: new Date().toISOString(),
    }).eq('id', ctx.identityUserId);

    await this.repository.update(id, { status: 'accepted', accepted_at: new Date().toISOString(), accepted_by_user_id: ctx.identityUserId });
    return { success: true, redirect_to: '/portal/dashboard' };
  }

  async completeRelationship(invitationId: string, companyId: string, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.identityUserId) throw new BadRequestError('User must be authenticated');

    const { data: inv } = await this.supabase.from('recruiter_company_invitations').select('*')
      .eq('id', invitationId).eq('accepted_by_user_id', ctx.identityUserId).single();
    if (!inv) throw new NotFoundError('CompanyInvitation', invitationId);

    const { error: relError } = await this.supabase.from('recruiter_companies').insert({
      recruiter_id: inv.recruiter_id, company_id: companyId, relationship_type: 'sourcer', status: 'active',
      permissions: { can_view_jobs: true, can_create_jobs: false, can_edit_jobs: false, can_submit_candidates: true, can_view_applications: true, can_advance_candidates: false },
    });
    if (relError && relError.code !== '23505') throw new Error(`Failed to create relationship: ${relError.message}`);

    await this.repository.update(invitationId, { created_company_id: companyId });
    await this.eventPublisher?.publish('company_invitation.completed', {
      invitation_id: invitationId, recruiter_id: inv.recruiter_id,
      accepted_by_user_id: ctx.identityUserId, company_id: companyId,
    }, 'network-service');
    return { success: true };
  }

  async resendEmail(id: string, clerkUserId: string) {
    const inv = await this.repository.findById(id);
    if (!inv) throw new NotFoundError('CompanyInvitation', id);
    if (inv.status !== 'pending') throw new BadRequestError('Can only resend pending invitations');
    if (!inv.invited_email) throw new BadRequestError('No email address associated with this invitation');

    const recruiter = await this.resolveRecruiterInfo(inv.recruiter_id);
    await this.eventPublisher?.publish('company_invitation.created', {
      invitation_id: inv.id, recruiter_id: inv.recruiter_id,
      recruiter_name: recruiter?.name, recruiter_email: recruiter?.email,
      invited_email: inv.invited_email, company_name_hint: inv.company_name_hint,
      personal_message: inv.personal_message, invite_code: inv.invite_code,
      invite_link_token: inv.invite_link_token, expires_at: inv.expires_at, send_email: true, is_resend: true,
    }, 'network-service');
    await this.repository.update(inv.id, { email_sent_at: new Date().toISOString() });
  }

  async revoke(id: string, clerkUserId: string) {
    const inv = await this.repository.findById(id);
    if (!inv) throw new NotFoundError('CompanyInvitation', id);
    if (inv.status !== 'pending') throw new BadRequestError('Can only revoke pending invitations');
    await this.repository.update(id, { status: 'revoked' });
    await this.eventPublisher?.publish('company_invitation.revoked', { invitation_id: id, recruiter_id: inv.recruiter_id }, 'network-service');
  }

  async delete(id: string, clerkUserId: string) {
    const inv = await this.repository.findById(id);
    if (!inv) throw new NotFoundError('CompanyInvitation', id);
    await this.repository.delete(id);
  }

  private buildLookupResult(inv: any) {
    if (!inv) return { id: '', invite_code: '', status: 'expired' as const, expires_at: '', recruiter: { name: '' }, is_valid: false, error_message: 'Invitation not found' };
    const raw = inv.recruiter as any;
    const recruiter = {
      name: raw?.user?.name || 'Unknown', tagline: raw?.tagline, location: raw?.location,
      years_experience: raw?.years_experience, industries: raw?.industries, specialties: raw?.specialties,
      profile_image_url: raw?.user?.profile_image_url,
    };
    if (inv.status === 'accepted') return { id: inv.id, invite_code: inv.invite_code, company_name_hint: inv.company_name_hint, personal_message: inv.personal_message, status: 'accepted' as const, expires_at: inv.expires_at, recruiter, is_valid: false, error_message: 'This invitation has already been used' };
    if (inv.status === 'revoked') return { id: inv.id, invite_code: inv.invite_code, status: 'revoked' as const, expires_at: inv.expires_at, recruiter, is_valid: false, error_message: 'This invitation has been revoked' };
    if (new Date() > new Date(inv.expires_at) || inv.status === 'expired') return { id: inv.id, invite_code: inv.invite_code, status: 'expired' as const, expires_at: inv.expires_at, recruiter, is_valid: false, error_message: 'This invitation has expired' };
    return { id: inv.id, invite_code: inv.invite_code, company_name_hint: inv.company_name_hint, personal_message: inv.personal_message, status: 'pending' as const, expires_at: inv.expires_at, recruiter, is_valid: true };
  }

  private async buildScopeFilters(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (ctx.isPlatformAdmin) return {};
    if (ctx.recruiterId) return { recruiter_id: ctx.recruiterId };
    return null;
  }

  private async resolveRecruiterInfo(recruiterId: string): Promise<{ name?: string; email?: string } | null> {
    const { data } = await this.supabase
      .from('recruiters')
      .select('user:users!recruiters_user_id_fkey(name, email)')
      .eq('id', recruiterId)
      .maybeSingle();
    if (!data) return null;
    const user = (data as any).user;
    return { name: user?.name, email: user?.email };
  }
}
