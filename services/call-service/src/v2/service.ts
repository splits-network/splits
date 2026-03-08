import crypto from 'crypto';
import { CallRepository } from './repository';
import { IEventPublisher } from './shared/events';
import {
    Call,
    CallDetail,
    CallWithParticipants,
    CallEntityLink,
    CallEntityType,
    CallParticipant,
    CallParticipantRole,
    CreateCallInput,
    UpdateCallInput,
    CallListFilters,
} from './types';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export class CallService {
    constructor(
        private repository: CallRepository,
        private eventPublisher: IEventPublisher,
    ) {}

    async createCall(
        input: CreateCallInput,
        createdByClerkUserId: string,
    ): Promise<CallWithParticipants> {
        // Resolve Clerk user ID to internal user ID
        const resolvedUserId = await this.repository.resolveUserId(createdByClerkUserId);
        if (!resolvedUserId) {
            throw Object.assign(
                new Error('Could not resolve user'),
                { statusCode: 400 },
            );
        }

        // Validate scheduled_at is in the future if provided
        if (input.scheduled_at) {
            const scheduledAt = new Date(input.scheduled_at);
            if (scheduledAt <= new Date()) {
                throw Object.assign(
                    new Error('Scheduled time must be in the future'),
                    { statusCode: 400 },
                );
            }
        }

        // Create call record
        const call = await this.repository.createCall(input, resolvedUserId);

        // Bulk insert entity links
        const entityLinks: CallEntityLink[] = [];
        for (const link of input.entity_links || []) {
            const created = await this.repository.artifacts.addEntityLink(call.id, link);
            entityLinks.push(created);
        }

        // Auto-add creator as host if not in participants list
        const participants = [...(input.participants || [])];
        const creatorInList = participants.some((p) => p.user_id === resolvedUserId);
        if (!creatorInList) {
            participants.unshift({ user_id: resolvedUserId, role: 'host' });
        }

        // Bulk insert participants
        const createdParticipants = [];
        for (const p of participants) {
            const created = await this.repository.participants.addParticipant(call.id, p);
            createdParticipants.push(created);
        }

        // Enrich participants with user data
        const enrichedParticipants = await this.repository.participants.getCallParticipants(call.id);

        // Publish event
        await this.eventPublisher.publish('call.created', {
            call_id: call.id,
            call_type: call.call_type,
            created_by: resolvedUserId,
            entity_links: entityLinks.map((l) => ({
                entity_type: l.entity_type,
                entity_id: l.entity_id,
            })),
            participant_count: createdParticipants.length,
        });

        return {
            ...call,
            participants: enrichedParticipants,
            entity_links: entityLinks,
        };
    }

    async listCalls(
        params: StandardListParams,
        filters: CallListFilters,
    ): Promise<StandardListResponse<CallWithParticipants>> {
        return this.repository.listCalls(params, filters);
    }

    async getCallDetail(id: string, include?: string[]): Promise<CallDetail> {
        const detail = await this.repository.getCallDetail(id, include);
        if (!detail) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }
        return detail;
    }

    async updateCall(id: string, input: UpdateCallInput): Promise<Call> {
        const call = await this.repository.getCall(id);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }

        if (input.scheduled_at) {
            const scheduledAt = new Date(input.scheduled_at);
            if (scheduledAt <= new Date()) {
                throw Object.assign(
                    new Error('Scheduled time must be in the future'),
                    { statusCode: 400 },
                );
            }
            if (call.status !== 'scheduled') {
                throw Object.assign(
                    new Error('Can only reschedule calls with status "scheduled"'),
                    { statusCode: 409 },
                );
            }
        }

        return this.repository.updateCall(id, input);
    }

    async deleteCall(id: string): Promise<void> {
        const call = await this.repository.getCall(id);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }
        await this.repository.deleteCall(id);
    }

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

    async cancelCall(id: string): Promise<Call> {
        const call = await this.repository.getCall(id);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }
        if (call.status !== 'scheduled' && call.status !== 'active') {
            throw Object.assign(
                new Error(`Cannot cancel call with status "${call.status}"`),
                { statusCode: 409 },
            );
        }

        const updated = await this.repository.updateCallStatus(id, 'cancelled');

        await this.eventPublisher.publish('call.cancelled', {
            call_id: id,
            call_type: call.call_type,
            cancelled_at: new Date().toISOString(),
        });

        return updated;
    }

    async addParticipant(
        callId: string,
        input: { user_id: string; role: CallParticipantRole },
    ): Promise<CallParticipant> {
        const call = await this.repository.getCall(callId);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }
        return this.repository.participants.addParticipant(callId, input);
    }

    async removeParticipant(callId: string, participantId: string): Promise<void> {
        // Validate participant belongs to this call
        const participants = await this.repository.participants.getCallParticipants(callId);
        const participant = participants.find((p) => p.id === participantId);
        if (!participant) {
            throw Object.assign(
                new Error('Participant not found in this call'),
                { statusCode: 404 },
            );
        }
        await this.repository.participants.removeParticipant(participantId);
    }

    async addEntityLink(
        callId: string,
        input: { entity_type: CallEntityType; entity_id: string },
    ): Promise<CallEntityLink> {
        const call = await this.repository.getCall(callId);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }
        return this.repository.artifacts.addEntityLink(callId, input);
    }

    async removeEntityLink(callId: string, linkId: string): Promise<void> {
        // Validate link belongs to this call
        const links = await this.repository.artifacts.getCallEntityLinks(callId);
        const link = links.find((l) => l.id === linkId);
        if (!link) {
            throw Object.assign(
                new Error('Entity link not found in this call'),
                { statusCode: 404 },
            );
        }
        await this.repository.artifacts.removeEntityLink(linkId);
    }
}
