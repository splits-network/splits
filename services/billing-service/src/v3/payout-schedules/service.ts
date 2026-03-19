/**
 * Payout Schedules V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { PayoutScheduleRepository } from './repository';
import {
  CreatePayoutScheduleInput,
  UpdatePayoutScheduleInput,
  PayoutScheduleListParams,
} from './types';

export class PayoutScheduleService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: PayoutScheduleRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: PayoutScheduleListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);

    // Enrich with transaction totals
    if (data.length > 0) {
      const placementIds = [...new Set(data.map((s: any) => s.placement_id))];
      const { data: totals } = await this.supabase
        .from('placement_payout_transactions')
        .select('placement_id, amount')
        .in('placement_id', placementIds);

      const amountMap = new Map<string, { total: number; count: number }>();
      for (const row of totals || []) {
        const entry = amountMap.get(row.placement_id) || { total: 0, count: 0 };
        entry.total += Number(row.amount) || 0;
        entry.count += 1;
        amountMap.set(row.placement_id, entry);
      }

      const enriched = data.map((schedule: any) => ({
        ...schedule,
        total_amount: amountMap.get(schedule.placement_id)?.total || 0,
        transaction_count: amountMap.get(schedule.placement_id)?.count || 0,
      }));

      return { data: enriched, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
    }

    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const schedule = await this.repository.findById(id);
    if (!schedule) throw new NotFoundError('PayoutSchedule', id);
    return schedule;
  }

  async create(input: CreatePayoutScheduleInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can create payout schedules');
    }

    this.validateDates(input.scheduled_date, input.guarantee_completion_date);

    const record = {
      ...input,
      status: 'scheduled',
      retry_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('payout_schedule.created', {
      schedule_id: created.id,
      placement_id: input.placement_id,
      scheduled_date: input.scheduled_date,
      trigger_event: input.trigger_event,
      created_by: context.identityUserId,
    }, 'billing-service');

    return created;
  }

  async update(id: string, input: UpdatePayoutScheduleInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can update payout schedules');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('PayoutSchedule', id);

    if (input.scheduled_date) this.validateDates(input.scheduled_date);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('PayoutSchedule', id);

    await this.eventPublisher?.publish('payout_schedule.updated', {
      schedule_id: id,
      updated_fields: Object.keys(input),
      updated_by: context.identityUserId,
    }, 'billing-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can delete payout schedules');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('PayoutSchedule', id);

    await this.repository.delete(id);

    await this.eventPublisher?.publish('payout_schedule.deleted', {
      schedule_id: id,
      deleted_by: context.identityUserId,
    }, 'billing-service');
  }

  async trigger(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can trigger payout schedules');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('PayoutSchedule', id);
    if (existing.status !== 'scheduled') {
      throw new BadRequestError(`Cannot trigger schedule in ${existing.status} status`);
    }

    return this.repository.markTriggered(id);
  }

  private validateDates(scheduledDate?: string, guaranteeDate?: string) {
    if (scheduledDate && isNaN(new Date(scheduledDate).getTime())) {
      throw new BadRequestError('Invalid scheduled_date format');
    }
    if (guaranteeDate && isNaN(new Date(guaranteeDate).getTime())) {
      throw new BadRequestError('Invalid guarantee_completion_date format');
    }
  }
}
