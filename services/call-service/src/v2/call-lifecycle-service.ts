import { CallRepository } from './repository.js';
import { IEventPublisher } from './shared/events.js';
import { Call } from './types.js';

export class CallLifecycleService {
    constructor(
        private repository: CallRepository,
        private eventPublisher: IEventPublisher,
    ) {}

    async startCall(id: string): Promise<Call> {
        const call = await this.repository.getCall(id);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }
        if (call.status !== 'scheduled') {
            throw Object.assign(
                new Error(`Cannot start call with status "${call.status}"`),
                { statusCode: 409 },
            );
        }

        const roomName = `call-${id}-${Date.now()}`;
        const updated = await this.repository.updateCallStatus(id, 'active', {
            started_at: new Date().toISOString(),
            livekit_room_name: roomName,
        });

        await this.eventPublisher.publish('call.started', {
            call_id: id,
            call_type: call.call_type,
            room_name: roomName,
            started_at: updated.started_at,
        });

        return updated;
    }

    async endCall(id: string): Promise<Call> {
        const call = await this.repository.getCall(id);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }
        if (call.status !== 'active') {
            throw Object.assign(
                new Error(`Cannot end call with status "${call.status}"`),
                { statusCode: 409 },
            );
        }

        const endedAt = new Date();
        const startedAt = call.started_at ? new Date(call.started_at) : endedAt;
        const durationMinutes = Math.round(
            (endedAt.getTime() - startedAt.getTime()) / 60000,
        );

        const updated = await this.repository.updateCallStatus(id, 'completed', {
            ended_at: endedAt.toISOString(),
            duration_minutes: durationMinutes,
        });

        await this.eventPublisher.publish('call.ended', {
            call_id: id,
            call_type: call.call_type,
            duration_minutes: durationMinutes,
            ended_at: updated.ended_at,
        });

        return updated;
    }

    async cancelCall(id: string, clerkUserId: string, reason?: string): Promise<Call> {
        const resolvedUserId = await this.repository.resolveUserId(clerkUserId);
        if (!resolvedUserId) {
            throw Object.assign(new Error('Could not resolve user'), { statusCode: 400 });
        }

        const call = await this.repository.getCall(id);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }

        if (call.created_by !== resolvedUserId) {
            throw Object.assign(
                new Error('Only the call creator can cancel'),
                { statusCode: 403 },
            );
        }

        if (call.status !== 'scheduled' && call.status !== 'active') {
            throw Object.assign(
                new Error(`Cannot cancel call with status "${call.status}"`),
                { statusCode: 409 },
            );
        }

        const updated = await this.repository.cancelCall(id, resolvedUserId, reason);

        const participants = await this.repository.participants.getCallParticipants(id);

        await this.eventPublisher.publish('call.cancelled', {
            call_id: id,
            call_type: call.call_type,
            cancelled_by: resolvedUserId,
            cancel_reason: reason || null,
            cancelled_at: new Date().toISOString(),
            participants: participants.map(p => ({ user_id: p.user_id, role: p.role })),
        });

        return updated;
    }

    async rescheduleCall(
        id: string,
        newScheduledAt: string,
        clerkUserId: string,
    ): Promise<Call> {
        const resolvedUserId = await this.repository.resolveUserId(clerkUserId);
        if (!resolvedUserId) {
            throw Object.assign(new Error('Could not resolve user'), { statusCode: 400 });
        }

        const call = await this.repository.getCall(id);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }

        if (call.created_by !== resolvedUserId) {
            throw Object.assign(
                new Error('Only the call creator can reschedule'),
                { statusCode: 403 },
            );
        }

        if (call.status !== 'scheduled') {
            throw Object.assign(
                new Error('Can only reschedule calls with status "scheduled"'),
                { statusCode: 409 },
            );
        }

        const scheduledAt = new Date(newScheduledAt);
        if (scheduledAt <= new Date()) {
            throw Object.assign(
                new Error('Scheduled time must be in the future'),
                { statusCode: 400 },
            );
        }

        const oldScheduledAt = call.scheduled_at;
        const updated = await this.repository.updateCall(id, {
            scheduled_at: newScheduledAt,
        });

        const participants = await this.repository.participants.getCallParticipants(id);

        await this.eventPublisher.publish('call.rescheduled', {
            call_id: id,
            call_type: call.call_type,
            old_scheduled_at: oldScheduledAt,
            new_scheduled_at: newScheduledAt,
            rescheduled_by: resolvedUserId,
            participants: participants.map(p => ({ user_id: p.user_id, role: p.role })),
        });

        return updated;
    }
}
