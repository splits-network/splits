/**
 * Call Stats V3 Service
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { BadRequestError } from "@splits-network/shared-fastify";
import { StatsRepository } from "./repository";
import { CallStats } from "./types";

export class StatsService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: StatsRepository,
        private supabase: SupabaseClient,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getStats(
        clerkUserId: string,
        entityType?: string,
        entityId?: string,
    ): Promise<CallStats> {
        const context = await this.accessResolver.resolve(clerkUserId);

        const resolvedUserId = context.identityUserId;
        if (!resolvedUserId)
            throw new BadRequestError("Could not resolve user");

        return this.repository.getCallStats(
            resolvedUserId,
            entityType,
            entityId,
        );
    }
}
