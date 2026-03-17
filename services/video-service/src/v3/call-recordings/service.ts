/**
 * Call Recordings V3 Service — Core CRUD Business Logic
 *
 * Uses AccessContextResolver for authorization.
 * Throws typed errors from shared-fastify.
 * Publishes domain events for mutations.
 * No HTTP concepts — no status codes, no request/reply.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { CallRecordingRepository } from './repository';
import { CallRecordingListParams, CreateCallRecordingInput, UpdateCallRecordingInput } from './types';

export class CallRecordingService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CallRecordingRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: CallRecordingListParams, clerkUserId: string, headers?: Record<string, any>) {
    await this.accessResolver.resolve(clerkUserId, headers);

    const { data, total } = await this.repository.findAll(params);

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string, headers?: Record<string, any>) {
    await this.accessResolver.resolve(clerkUserId, headers);

    const recording = await this.repository.findById(id);
    if (!recording) throw new NotFoundError('CallRecording', id);
    return recording;
  }

  async create(input: CreateCallRecordingInput, clerkUserId: string, headers?: Record<string, any>) {
    const context = await this.accessResolver.resolve(clerkUserId, headers);

    const recording = await this.repository.create(input);

    await this.eventPublisher?.publish('call_recording.created', {
      recording_id: recording.id,
      call_id: recording.call_id,
      created_by: context.identityUserId,
    }, 'video-service');

    return recording;
  }

  async update(id: string, input: UpdateCallRecordingInput, clerkUserId: string, headers?: Record<string, any>) {
    const context = await this.accessResolver.resolve(clerkUserId, headers);

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('CallRecording', id);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('CallRecording', id);

    await this.eventPublisher?.publish('call_recording.updated', {
      recording_id: id,
      call_id: existing.call_id,
      updated_fields: Object.keys(input),
      updated_by: context.identityUserId,
    }, 'video-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string, headers?: Record<string, any>) {
    const context = await this.accessResolver.resolve(clerkUserId, headers);

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('CallRecording', id);

    await this.repository.delete(id);

    await this.eventPublisher?.publish('call_recording.deleted', {
      recording_id: id,
      call_id: existing.call_id,
      deleted_by: context.identityUserId,
    }, 'video-service');
  }
}
