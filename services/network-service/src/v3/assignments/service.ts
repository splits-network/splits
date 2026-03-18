/**
 * Assignments V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { AssignmentRepository } from './repository';
import { AssignmentListParams, AssignmentUpdate, CreateAssignmentInput } from './types';

export class AssignmentService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: AssignmentRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: AssignmentListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    // Scope by recruiter_id for non-admin users
    if (context.recruiterId) {
      params = { ...params, recruiter_id: params.recruiter_id || context.recruiterId };
    } else if (!context.isPlatformAdmin) {
      return this.emptyPage(params);
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const assignment = await this.repository.findById(id);
    if (!assignment) throw new NotFoundError('Assignment', id);
    return assignment;
  }

  async create(input: CreateAssignmentInput, clerkUserId: string) {
    if (!input.recruiter_id || !input.job_id) {
      throw new BadRequestError('recruiter_id and job_id are required');
    }

    const now = new Date().toISOString();
    const assignment = await this.repository.create({
      recruiter_id: input.recruiter_id,
      job_id: input.job_id,
      status: input.status || 'active',
      created_at: now,
      updated_at: now,
    });

    await this.eventPublisher?.publish('assignment.created', {
      assignmentId: assignment.id,
      recruiterId: assignment.recruiter_id,
      jobId: assignment.job_id,
    }, 'network-service');

    return assignment;
  }

  async update(id: string, updates: AssignmentUpdate, clerkUserId: string) {
    if (updates.status) {
      const current = await this.repository.findById(id);
      if (!current) throw new NotFoundError('Assignment', id);
      this.validateStatusTransition(current.status, updates.status);
    }

    const assignment = await this.repository.update(id, updates);
    if (!assignment) throw new NotFoundError('Assignment', id);

    await this.eventPublisher?.publish('assignment.updated', {
      assignmentId: id,
      updates: Object.keys(updates),
    }, 'network-service');

    return assignment;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Assignment', id);

    await this.repository.delete(id);
    await this.eventPublisher?.publish('assignment.deleted', { assignmentId: id }, 'network-service');
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      active: ['inactive', 'completed'],
      inactive: ['active'],
      completed: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestError(`Cannot transition assignment from ${currentStatus} to ${newStatus}`);
    }
  }

  private emptyPage(params: AssignmentListParams) {
    return {
      data: [],
      pagination: { total: 0, page: params.page || 1, limit: params.limit || 25, total_pages: 0 },
    };
  }
}
