/**
 * Streaks V3 Service — Read-only
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { NotFoundError } from "@splits-network/shared-fastify";
import { StreakRepository } from "./repository";
import { StreakListParams } from "./types";

export class StreakService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: StreakRepository,
        private supabase: SupabaseClient,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getAll(
        params: StreakListParams,
        clerkUserId: string,
        headers?: Record<string, any>,
    ) {
        await this.accessResolver.resolve(clerkUserId, headers);
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
        headers?: Record<string, any>,
    ) {
        await this.accessResolver.resolve(clerkUserId, headers);
        const streak = await this.repository.findById(id);
        if (!streak) throw new NotFoundError("Streak", id);
        return streak;
    }
}
