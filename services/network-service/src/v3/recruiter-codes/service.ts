/**
 * Recruiter-Codes V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver, EntitlementChecker } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { RecruiterCodeRepository } from './repository.js';
import { RecruiterCodeListParams, CreateRecruiterCodeInput, RecruiterCodeUpdate, LogCodeUsageInput } from './types.js';

export class RecruiterCodeService {
  private accessResolver: AccessContextResolver;
  private entitlementChecker: EntitlementChecker;

  constructor(
    private repository: RecruiterCodeRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
    this.entitlementChecker = new EntitlementChecker(supabase);
  }

  async getAll(params: RecruiterCodeListParams, clerkUserId: string) {
    const scopeFilters = await this.buildScopeFilters(clerkUserId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    if (scopeFilters === null) return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
    const { data, total } = await this.repository.findAll(params, scopeFilters);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const code = await this.repository.findById(id);
    if (!code) throw new NotFoundError('RecruiterCode', id);
    return code;
  }

  async getDefault(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.recruiterId) return null;
    return this.repository.findDefaultByRecruiterId(ctx.recruiterId);
  }

  async create(input: CreateRecruiterCodeInput, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.recruiterId) throw new ForbiddenError('Only recruiters can create referral codes');
    if (!ctx.identityUserId) throw new BadRequestError('User identity could not be resolved');

    const activeCount = await this.repository.countActiveByRecruiterId(ctx.recruiterId);
    const withinLimit = await this.entitlementChecker.checkLimit(ctx.identityUserId, 'max_referral_codes', activeCount);
    if (!withinLimit) {
      throw new ForbiddenError('You have reached the maximum number of referral codes for your plan. Please upgrade to create more.');
    }

    const code = await this.repository.create(ctx.recruiterId, {
      label: input.label,
      is_default: input.is_default,
      expiry_date: input.expiry_date,
      max_uses: input.max_uses,
      uses_remaining: input.uses_remaining,
    });

    await this.eventPublisher?.publish('recruiter_code.created', {
      code_id: code.id, recruiter_id: code.recruiter_id, code: code.code,
    }, 'network-service');

    return code;
  }

  async update(id: string, updates: RecruiterCodeUpdate, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('RecruiterCode', id);

    if (updates.is_default) {
      await this.repository.clearDefault(existing.recruiter_id);
    }

    return this.repository.update(id, updates);
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('RecruiterCode', id);
    await this.repository.delete(id);
  }

  async lookupByCode(code: string) {
    const recruiterCode = await this.repository.findByCode(code);
    if (!recruiterCode) {
      return { id: '', code, recruiter_id: '', is_valid: false, error_message: 'Referral code not found' };
    }
    if (recruiterCode.status !== 'active') {
      return { id: recruiterCode.id, code: recruiterCode.code, recruiter_id: recruiterCode.recruiter_id, is_valid: false, error_message: 'This referral code is no longer active' };
    }
    const raw = recruiterCode.recruiter as any;
    return {
      id: recruiterCode.id, code: recruiterCode.code, recruiter_id: recruiterCode.recruiter_id, is_valid: true,
      recruiter: { id: raw?.id || recruiterCode.recruiter_id, name: raw?.user?.name || 'Unknown', profile_image_url: raw?.user?.profile_image_url },
    };
  }

  async logCodeUsage(input: LogCodeUsageInput, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.identityUserId) throw new BadRequestError('User must be authenticated');

    const recruiterCode = await this.repository.findByCode(input.code);
    if (!recruiterCode) throw new NotFoundError('RecruiterCode', input.code);
    if (recruiterCode.status !== 'active') throw new BadRequestError('Referral code is no longer active');

    const existingLog = await this.repository.findLogByUserId(ctx.identityUserId);
    if (existingLog) return existingLog;

    const logEntry = await this.repository.logUsage(
      recruiterCode.id, recruiterCode.recruiter_id, ctx.identityUserId,
      input.signup_type, input.ip_address, input.user_agent,
    );

    await this.eventPublisher?.publish('recruiter_code.used', {
      code_id: recruiterCode.id, recruiter_id: recruiterCode.recruiter_id,
      user_id: ctx.identityUserId, code: recruiterCode.code,
    }, 'network-service');

    return logEntry;
  }

  async getUsageLog(params: { page?: number; limit?: number; recruiter_code_id?: string }, clerkUserId: string) {
    const scopeFilters = await this.buildScopeFilters(clerkUserId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    if (scopeFilters === null) return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
    const { data, total } = await this.repository.getUsageLog(params, scopeFilters);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  private async buildScopeFilters(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (ctx.isPlatformAdmin) return {};
    if (ctx.recruiterId) return { recruiter_id: ctx.recruiterId };
    return null;
  }
}
