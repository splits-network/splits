/**
 * Recruiters V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { RecruiterRepository } from './repository';
import { RecruiterActivityService } from '../recruiter-activity/service';
import { RecruiterListParams, RecruiterUpdate, CreateRecruiterInput } from './types';

export class RecruiterService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private activityService?: RecruiterActivityService
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: RecruiterListParams, clerkUserId?: string) {
    const { data, total } = await this.repository.findAll(params);
    const flattenedData = data.map(r => this.flattenRecruiterData(r));

    const recruiterIds = flattenedData.map((r: any) => r.id).filter(Boolean);
    const tierMap = await this.repository.batchGetPlanTiers(recruiterIds);
    for (const recruiter of flattenedData) {
      recruiter.plan_tier = tierMap.get(recruiter.id) || 'starter';
    }

    if (params.sort_by === 'plan_tier') {
      const tierPriority: Record<string, number> = { partner: 0, pro: 1, starter: 2 };
      const ascending = params.sort_order === 'asc';
      flattenedData.sort((a: any, b: any) => {
        const aP = tierPriority[a.plan_tier] ?? 3;
        const bP = tierPriority[b.plan_tier] ?? 3;
        return ascending ? aP - bP : bP - aP;
      });
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data: flattenedData, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId?: string, include?: string) {
    const recruiter = await this.repository.findById(id, include);
    if (!recruiter) throw new NotFoundError('Recruiter', id);
    return this.flattenRecruiterData(recruiter);
  }

  async getBySlug(slug: string, include?: string) {
    const recruiter = await this.repository.findBySlug(slug, include);
    if (!recruiter) throw new NotFoundError('Recruiter', slug);
    return this.flattenRecruiterData(recruiter);
  }

  async getByClerkId(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) throw new NotFoundError('Recruiter', clerkUserId);
    const recruiter = await this.repository.findByUserId(context.identityUserId);
    if (!recruiter) throw new NotFoundError('Recruiter', clerkUserId);
    return recruiter;
  }

  async create(input: CreateRecruiterInput, clerkUserId: string) {
    const existing = await this.repository.findByUserId(input.user_id);
    if (existing) throw new BadRequestError('Recruiter profile already exists for this user');

    let slug: string | undefined;
    if (input.name) slug = await this.generateUniqueSlug(input.name);

    const now = new Date().toISOString();
    const recruiter = await this.repository.create({
      ...input, ...(slug ? { slug } : {}),
      status: input.status || 'active', created_at: now, updated_at: now,
    });

    if (recruiter.user_id && recruiter.status === 'active') {
      await this.repository.createUserRole(recruiter.user_id, recruiter.id);
    }

    await this.eventPublisher?.publish('recruiter.created', {
      recruiterId: recruiter.id, userId: recruiter.user_id, status: recruiter.status,
    }, 'network-service');

    return recruiter;
  }

  async update(id: string, updates: RecruiterUpdate, clerkUserId: string) {
    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      throw new BadRequestError('Invalid email format');
    }
    if (updates.name !== undefined && !updates.name.trim()) {
      throw new BadRequestError('Name cannot be empty');
    }
    if (updates.slug !== undefined && updates.slug) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(updates.slug)) {
        throw new BadRequestError('Slug must be lowercase alphanumeric with hyphens only');
      }
      const taken = await this.repository.isSlugTaken(updates.slug, id);
      if (taken) throw new BadRequestError('This slug is already taken');
    }
    if (updates.status) {
      const current = await this.repository.findById(id);
      if (!current) throw new NotFoundError('Recruiter', id);
      this.validateStatusTransition(current.status, updates.status);
    }

    const recruiter = await this.repository.update(id, updates);
    if (!recruiter) throw new NotFoundError('Recruiter', id);

    if (updates.status === 'active' && recruiter.user_id) {
      await this.repository.createUserRole(recruiter.user_id, recruiter.id);
    }

    await this.eventPublisher?.publish('recruiter.updated', {
      recruiterId: id, updates: Object.keys(updates),
    }, 'network-service');

    if (updates.status === 'active') {
      await this.activityService?.recordActivity({
        recruiter_id: id, activity_type: 'profile_verified', description: 'Profile verified and activated',
      });
    } else {
      await this.activityService?.recordActivity({
        recruiter_id: id, activity_type: 'profile_updated', description: 'Updated profile',
      });
    }

    return recruiter;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Recruiter', id);
    await this.repository.delete(id);
    await this.eventPublisher?.publish('recruiter.deleted', { recruiterId: id }, 'network-service');
  }

  private flattenRecruiterData(recruiter: any): any {
    if (!recruiter) return recruiter;
    const { recruiter_reputation, firm_members, recruiter_activity_recent, ...rest } = recruiter;
    if (recruiter_activity_recent && Array.isArray(recruiter_activity_recent)) rest.recent_activity = recruiter_activity_recent;
    if (firm_members && Array.isArray(firm_members) && firm_members.length > 0) {
      const m = firm_members[0];
      rest.firm_name = m.firms?.name || null;
      rest.firm_slug = m.firms?.slug || null;
      rest.firm_role = m.role || null;
    }
    const flattenRep = (rep: any) => ({
      ...rest, reputation_score: rep.reputation_score, total_submissions: rep.total_submissions,
      total_hires: rep.total_hires, hire_rate: rep.hire_rate, completion_rate: rep.completion_rate,
      total_placements: rep.total_placements, completed_placements: rep.completed_placements,
      failed_placements: rep.failed_placements, total_collaborations: rep.total_collaborations,
      collaboration_rate: rep.collaboration_rate, avg_response_time_hours: rep.avg_response_time_hours,
    });
    if (recruiter_reputation && Array.isArray(recruiter_reputation) && recruiter_reputation.length > 0) return flattenRep(recruiter_reputation[0]);
    if (recruiter_reputation && !Array.isArray(recruiter_reputation)) return flattenRep(recruiter_reputation);
    return rest;
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!base) return '';
    let slug = base;
    let counter = 2;
    while (await this.repository.isSlugTaken(slug)) { slug = `${base}-${counter}`; counter++; }
    return slug;
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const valid: Record<string, string[]> = {
      pending: ['active', 'suspended'], active: ['suspended', 'inactive'],
      suspended: ['active', 'inactive'], inactive: ['active'],
    };
    if (!(valid[currentStatus] || []).includes(newStatus)) {
      throw new BadRequestError(`Cannot transition recruiter from ${currentStatus} to ${newStatus}`);
    }
  }
}
