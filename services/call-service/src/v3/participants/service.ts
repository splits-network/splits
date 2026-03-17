/**
 * Call Participants V3 Service
 * Business logic for managing call participants
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { BadRequestError, NotFoundError } from "@splits-network/shared-fastify";
import { IEventPublisher } from "../../v2/shared/events";
import { ParticipantRepository } from "./repository";
import { AddParticipantInput, ParticipantListParams } from "./types";

export class ParticipantService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: ParticipantRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getAll(
        callId: string,
        params: ParticipantListParams,
        clerkUserId: string,
        headers?: Record<string, any>,
    ) {
        await this.accessResolver.resolve(clerkUserId, headers);
        const { data, total } = await this.repository.findAllForCall(
            callId,
            params,
        );
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async getById(
        id: string,
        clerkUserId: string,
        headers?: Record<string, any>,
    ) {
        await this.accessResolver.resolve(clerkUserId, headers);
        const participant = await this.repository.findById(id);
        if (!participant) throw new NotFoundError("Participant", id);
        return participant;
    }

    async create(
        callId: string,
        input: AddParticipantInput,
        clerkUserId: string,
        headers?: Record<string, any>,
    ) {
        await this.accessResolver.resolve(clerkUserId, headers);

        const resolvedUserId = await this.repository.resolveUserId(
            input.user_id,
        );
        if (!resolvedUserId)
            throw new BadRequestError("Could not resolve participant user");

        const participant = await this.repository.create(callId, {
            user_id: resolvedUserId,
            role: input.role,
        });

        await this.eventPublisher?.publish(
            "call.participant_added",
            {
                call_id: callId,
                participant_id: participant.id,
                user_id: resolvedUserId,
                role: input.role,
            },
            "call-service",
        );

        return participant;
    }

    async delete(
        callId: string,
        id: string,
        clerkUserId: string,
        headers?: Record<string, any>,
    ) {
        await this.accessResolver.resolve(clerkUserId, headers);
        const existing = await this.repository.findById(id);
        if (!existing || existing.call_id !== callId) {
            throw new NotFoundError("Participant", id);
        }
        await this.repository.delete(id);

        await this.eventPublisher?.publish(
            "call.participant_removed",
            {
                call_id: callId,
                participant_id: id,
            },
            "call-service",
        );
    }
}
