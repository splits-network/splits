/**
 * Call Artifacts V3 Service
 * Entity links and tags management
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { NotFoundError } from "@splits-network/shared-fastify";
import { IEventPublisher } from "../../v2/shared/events.js";
import { ArtifactRepository } from "./repository.js";
import { AddEntityLinkInput, ArtifactListParams } from "./types.js";

export class ArtifactService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: ArtifactRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getEntityLinks(
        callId: string,
        params: ArtifactListParams,
        clerkUserId: string,
    ) {
        await this.accessResolver.resolve(clerkUserId);
        const { data, total } = await this.repository.findEntityLinks(
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

    async createEntityLink(
        callId: string,
        input: AddEntityLinkInput,
        clerkUserId: string,
    ) {
        await this.accessResolver.resolve(clerkUserId);
        const link = await this.repository.createEntityLink(callId, input);

        await this.eventPublisher?.publish(
            "call.entity_linked",
            {
                call_id: callId,
                link_id: link.id,
                entity_type: input.entity_type,
                entity_id: input.entity_id,
            },
            "call-service",
        );

        return link;
    }

    async deleteEntityLink(
        callId: string,
        id: string,
        clerkUserId: string,
    ) {
        await this.accessResolver.resolve(clerkUserId);
        const existing = await this.repository.findEntityLinkById(id);
        if (!existing || existing.call_id !== callId) {
            throw new NotFoundError("EntityLink", id);
        }
        await this.repository.deleteEntityLink(id);
    }

    async listTags(clerkUserId: string) {
        await this.accessResolver.resolve(clerkUserId);
        return this.repository.listTags();
    }
}
