import { CallRepository } from './repository';
import { CallLifecycleService } from './call-lifecycle-service';
import { IEventPublisher } from './shared/events';
import {
    Call,
    CallDetail,
    CallWithParticipants,
    CallEntityLink,
    CallEntityType,
    CallParticipant,
    CallParticipantRole,
    CallTag,
    CallStats,
    CreateCallInput,
    UpdateCallInput,
    CallListFilters,
} from './types';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export class CallService {
    readonly lifecycle: CallLifecycleService;

    constructor(
        private repository: CallRepository,
        private eventPublisher: IEventPublisher,
    ) {
        this.lifecycle = new CallLifecycleService(repository, eventPublisher);
    }

    async createCall(
        input: CreateCallInput,
        createdByClerkUserId: string,
    ): Promise<CallWithParticipants> {
        const resolvedUserId = await this.repository.resolveUserId(createdByClerkUserId);
        if (!resolvedUserId) {
            throw Object.assign(new Error('Could not resolve user'), { statusCode: 400 });
        }

        if (input.scheduled_at) {
            const scheduledAt = new Date(input.scheduled_at);
            if (scheduledAt <= new Date()) {
                throw Object.assign(
                    new Error('Scheduled time must be in the future'),
                    { statusCode: 400 },
                );
            }
        }

        // Create call record (includes agenda, duration_minutes_planned, pre_call_notes)
        const call = await this.repository.createCall(input, resolvedUserId);

        // Add tags if provided
        if (input.tags && input.tags.length > 0) {
            await this.repository.artifacts.addCallTags(call.id, input.tags);
        }

        // Bulk insert entity links
        const entityLinks: CallEntityLink[] = [];
        for (const link of input.entity_links || []) {
            const created = await this.repository.artifacts.addEntityLink(call.id, link);
            entityLinks.push(created);
        }

        // Resolve all participant Clerk IDs to internal UUIDs
        const rawParticipants = [...(input.participants || [])];
        const resolvedParticipants: { user_id: string; role: CallParticipantRole }[] = [];
        for (const p of rawParticipants) {
            const resolved = await this.repository.resolveUserId(p.user_id);
            if (resolved) {
                resolvedParticipants.push({ user_id: resolved, role: p.role });
            }
        }

        // Auto-add creator as host if not in participants list
        const creatorInList = resolvedParticipants.some((p) => p.user_id === resolvedUserId);
        if (!creatorInList) {
            resolvedParticipants.unshift({ user_id: resolvedUserId, role: 'host' });
        }

        // Bulk insert participants
        const createdParticipants = [];
        for (const p of resolvedParticipants) {
            const created = await this.repository.participants.addParticipant(call.id, p);
            createdParticipants.push(created);
        }

        const enrichedParticipants = await this.repository.participants.getCallParticipants(call.id);

        const tags = input.tags && input.tags.length > 0
            ? await this.repository.artifacts.getCallTags(call.id)
            : [];

        await this.eventPublisher.publish('call.created', {
            call_id: call.id,
            call_type: call.call_type,
            created_by: resolvedUserId,
            scheduled_at: call.scheduled_at,
            agenda: call.agenda,
            entity_links: entityLinks.map((l) => ({
                entity_type: l.entity_type,
                entity_id: l.entity_id,
            })),
            participants: enrichedParticipants.map(p => ({ user_id: p.user_id, role: p.role })),
        });

        return {
            ...call,
            participants: enrichedParticipants,
            entity_links: entityLinks,
            tags,
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

    // ── Lifecycle (delegated) ─────────────────────────────────────────────

    async startCall(id: string): Promise<Call> {
        return this.lifecycle.startCall(id);
    }

    async endCall(id: string): Promise<Call> {
        return this.lifecycle.endCall(id);
    }

    async cancelCall(id: string, clerkUserId: string, reason?: string): Promise<Call> {
        return this.lifecycle.cancelCall(id, clerkUserId, reason);
    }

    async rescheduleCall(id: string, newScheduledAt: string, clerkUserId: string): Promise<Call> {
        return this.lifecycle.rescheduleCall(id, newScheduledAt, clerkUserId);
    }

    async declineCall(id: string, clerkUserId: string): Promise<void> {
        const resolvedUserId = await this.repository.resolveUserId(clerkUserId);
        if (!resolvedUserId) {
            throw Object.assign(new Error('Could not resolve user'), { statusCode: 400 });
        }

        const call = await this.repository.getCall(id);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }

        if (call.status !== 'scheduled' && call.status !== 'active') {
            throw Object.assign(
                new Error(`Cannot decline call with status "${call.status}"`),
                { statusCode: 409 },
            );
        }

        // Verify user is a participant
        const participants = await this.repository.participants.getCallParticipants(id);
        const participant = participants.find((p) => p.user_id === resolvedUserId);
        if (!participant) {
            throw Object.assign(
                new Error('You are not a participant in this call'),
                { statusCode: 403 },
            );
        }

        // Remove the declining participant
        await this.repository.participants.removeParticipant(participant.id);

        // Publish declined event with remaining participants
        const remainingParticipants = participants.filter(
            (p) => p.user_id !== resolvedUserId,
        );

        await this.eventPublisher.publish('call.declined', {
            call_id: id,
            call_type: call.call_type,
            title: call.title,
            declined_by: resolvedUserId,
            participants: remainingParticipants.map((p) => ({
                user_id: p.user_id,
                role: p.role,
            })),
        });
    }

    // ── Stats & Tags ──────────────────────────────────────────────────────

    async getStats(clerkUserId: string): Promise<CallStats> {
        const resolvedUserId = await this.repository.resolveUserId(clerkUserId);
        if (!resolvedUserId) {
            throw Object.assign(new Error('Could not resolve user'), { statusCode: 400 });
        }
        return this.repository.stats.getCallStats(resolvedUserId);
    }

    async listTags(): Promise<CallTag[]> {
        return this.repository.artifacts.listTags();
    }

    // ── Participants ──────────────────────────────────────────────────────

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

    // ── Entity Links ──────────────────────────────────────────────────────

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
