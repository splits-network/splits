/**
 * XP V3 Service — Read-only
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { NotFoundError } from "@splits-network/shared-fastify";
import { XpRepository } from "./repository.js";
import { XpListParams } from "./types.js";

export class XpService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: XpRepository,
        private supabase: SupabaseClient,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getAll(
        params: XpListParams,
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
        const entry = await this.repository.findById(id);
        if (!entry) throw new NotFoundError("XpEntry", id);
        return entry;
    }
}
