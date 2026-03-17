/**
 * Recruiters V3 Service — Core CRUD Business Logic
 *
 * NO joins, NO enrichment, NO plan tier lookups.
 * Views handle all enriched data (marketplace-listing, by-slug, etc.)
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

  async getAll(params: RecruiterListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const recruiter = await this.repository.findById(id);
    if (!recruiter) throw new NotFoundError('Recruiter', id);
    return recruiter;
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
