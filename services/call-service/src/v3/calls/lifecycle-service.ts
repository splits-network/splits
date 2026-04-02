/**
 * Call Lifecycle State Machine — V3
 * Handles state transitions: start, end, cancel, reschedule, decline
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { CallRepository } from './repository.js';

export class CallLifecycleService {
  constructor(
    private repository: CallRepository,
    private supabase: SupabaseClient,
    private eventPublisher: IEventPublisher,
  ) {}

  async startCall(id: string): Promise<any> {
    const call = await this.requireCall(id);
    this.assertStatus(call, 'scheduled', 'start');

    const roomName = `call-${id}-${Date.now()}`;
    const updated = await this.repository.updateStatus(id, 'active', {
      started_at: new Date().toISOString(),
      livekit_room_name: roomName,
    });

    await this.eventPublisher.publish('call.started', {
      call_id: id,
      call_type: call.call_type,
      room_name: roomName,
      started_at: updated.started_at,
    }, 'call-service');

    return updated;
  }

  async endCall(id: string): Promise<any> {
    const call = await this.requireCall(id);
    this.assertStatus(call, 'active', 'end');

    const endedAt = new Date();
    const startedAt = call.started_at ? new Date(call.started_at) : endedAt;
    const durationMinutes = Math.round(
      (endedAt.getTime() - startedAt.getTime()) / 60000,
    );

    const updated = await this.repository.updateStatus(id, 'completed', {
      ended_at: endedAt.toISOString(),
      duration_minutes: durationMinutes,
    });

    await this.eventPublisher.publish('call.ended', {
      call_id: id,
      call_type: call.call_type,
      duration_minutes: durationMinutes,
      ended_at: updated.ended_at,
    }, 'call-service');

    return updated;
  }

  async cancelCall(id: string, clerkUserId: string, reason?: string): Promise<any> {
    const resolvedUserId = await this.resolveUser(clerkUserId);
    const call = await this.requireCall(id);

    if (call.created_by !== resolvedUserId) {
      throw new BadRequestError('Only the call creator can cancel');
    }
    if (call.status !== 'scheduled' && call.status !== 'active') {
      throw new BadRequestError(`Cannot cancel call with status "${call.status}"`);
    }

    const updated = await this.repository.updateStatus(id, 'cancelled', {
      cancelled_by: resolvedUserId,
      cancel_reason: reason || null,
    });

    const participants = await this.getParticipants(id);

    await this.eventPublisher.publish('call.cancelled', {
      call_id: id,
      call_type: call.call_type,
      cancelled_by: resolvedUserId,
      cancel_reason: reason || null,
      cancelled_at: new Date().toISOString(),
      participants: participants.map((p: any) => ({ user_id: p.user_id, role: p.role })),
    }, 'call-service');

    return updated;
  }

  async rescheduleCall(id: string, newScheduledAt: string, clerkUserId: string): Promise<any> {
    const resolvedUserId = await this.resolveUser(clerkUserId);
    const call = await this.requireCall(id);

    if (call.created_by !== resolvedUserId) {
      throw new BadRequestError('Only the call creator can reschedule');
    }
    this.assertStatus(call, 'scheduled', 'reschedule');

    const scheduledAt = new Date(newScheduledAt);
    if (scheduledAt <= new Date()) {
      throw new BadRequestError('Scheduled time must be in the future');
    }

    const oldScheduledAt = call.scheduled_at;
    const updated = await this.repository.update(id, { scheduled_at: newScheduledAt });
    const participants = await this.getParticipants(id);

    await this.eventPublisher.publish('call.rescheduled', {
      call_id: id,
      call_type: call.call_type,
      old_scheduled_at: oldScheduledAt,
      new_scheduled_at: newScheduledAt,
      rescheduled_by: resolvedUserId,
      participants: participants.map((p: any) => ({ user_id: p.user_id, role: p.role })),
    }, 'call-service');

    return updated;
  }

  async declineCall(id: string, clerkUserId: string): Promise<void> {
    const resolvedUserId = await this.resolveUser(clerkUserId);
    const call = await this.requireCall(id);

    if (call.status !== 'scheduled' && call.status !== 'active') {
      throw new BadRequestError(`Cannot decline call with status "${call.status}"`);
    }

    const participants = await this.getParticipants(id);
    const participant = participants.find((p: any) => p.user_id === resolvedUserId);
    if (!participant) {
      throw new BadRequestError('You are not a participant in this call');
    }

    await this.deleteParticipant(participant.id);

    const remaining = participants.filter((p: any) => p.user_id !== resolvedUserId);

    await this.eventPublisher.publish('call.declined', {
      call_id: id,
      call_type: call.call_type,
      title: call.title,
      declined_by: resolvedUserId,
      participants: remaining.map((p: any) => ({ user_id: p.user_id, role: p.role })),
    }, 'call-service');
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private async requireCall(id: string): Promise<any> {
    const call = await this.repository.findById(id);
    if (!call) throw new NotFoundError('Call', id);
    return call;
  }

  private assertStatus(call: any, expected: string, action: string): void {
    if (call.status !== expected) {
      throw new BadRequestError(`Cannot ${action} call with status "${call.status}"`);
    }
  }

  private async resolveUser(clerkUserId: string): Promise<string> {
    const userId = await this.repository.resolveUserId(clerkUserId);
    if (!userId) throw new BadRequestError('Could not resolve user');
    return userId;
  }

  private async getParticipants(callId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('call_participants')
      .select('id, user_id, role')
      .eq('call_id', callId);
    if (error) throw error;
    return data || [];
  }

  private async deleteParticipant(participantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('call_participants')
      .delete()
      .eq('id', participantId);
    if (error) throw error;
  }
}
