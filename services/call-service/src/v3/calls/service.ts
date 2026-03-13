/**
 * Calls V3 Service
 * Business logic, validation, event publishing
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { CallRepository } from './repository';
import { CreateCallInput, UpdateCallInput, CallListParams } from './types';

export class CallService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CallRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: CallListParams, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const userId = await this.repository.resolveUserId(clerkUserId);
    if (!userId) throw new BadRequestError('Could not resolve user');
    const { data, total } = await this.repository.findAll(params, userId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const call = await this.repository.findById(id);
    if (!call) throw new NotFoundError('Call', id);
    return call;
  }

  async create(input: CreateCallInput, clerkUserId: string) {
    const resolvedUserId = await this.repository.resolveUserId(clerkUserId);
    if (!resolvedUserId) throw new BadRequestError('Could not resolve user');

    if (input.scheduled_at) {
      const scheduledAt = new Date(input.scheduled_at);
      if (scheduledAt <= new Date()) {
        throw new BadRequestError('Scheduled time must be in the future');
      }
    }

    if (input.transcription_enabled || input.ai_analysis_enabled) {
      const tier = await this.repository.getCreatorTier(resolvedUserId);
      if (input.transcription_enabled && tier === 'starter') {
        throw new BadRequestError('Transcription requires a Pro or Partner subscription');
      }
      if (input.ai_analysis_enabled && tier !== 'partner') {
        throw new BadRequestError('AI analysis requires a Partner subscription');
      }
    }

    const call = await this.repository.create({
      call_type: input.call_type,
      title: input.title || null,
      scheduled_at: input.scheduled_at || null,
      agenda: input.agenda || null,
      duration_minutes_planned: input.duration_minutes_planned || null,
      pre_call_notes: input.pre_call_notes || null,
      created_by: resolvedUserId,
      recording_enabled: input.recording_enabled ?? false,
      transcription_enabled: input.transcription_enabled ?? false,
      ai_analysis_enabled: input.ai_analysis_enabled ?? false,
    });

    await this.eventPublisher?.publish('call.created', {
      call_id: call.id,
      call_type: call.call_type,
      title: call.title,
      created_by: resolvedUserId,
      scheduled_at: call.scheduled_at,
    }, 'call-service');

    return call;
  }

  async update(id: string, input: UpdateCallInput, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Call', id);

    if (input.scheduled_at) {
      const scheduledAt = new Date(input.scheduled_at);
      if (scheduledAt <= new Date()) {
        throw new BadRequestError('Scheduled time must be in the future');
      }
      if (existing.status !== 'scheduled') {
        throw new BadRequestError('Can only reschedule calls with status "scheduled"');
      }
    }

    return this.repository.update(id, input);
  }

  async delete(id: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Call', id);
    await this.repository.softDelete(id);
  }
}
