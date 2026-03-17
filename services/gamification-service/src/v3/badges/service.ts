/**
 * Badges V3 Service — Read-only
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { NotFoundError } from "@splits-network/shared-fastify";
import { BadgeRepository } from "./repository";
import { BadgeListParams } from "./types";

export class BadgeService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: BadgeRepository,
        private supabase: SupabaseClient,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getAll(
        params: BadgeListParams,
        clerkUserId: string,
    ) {
        await this.accessResolver.resolve(clerkUserId);
        const { data, total } = await this.repository.findAll(params);
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
    ) {
        await this.accessResolver.resolve(clerkUserId);
        const badge = await this.repository.findById(id);
        if (!badge) throw new NotFoundError("Badge", id);
        return badge;
    }
}
