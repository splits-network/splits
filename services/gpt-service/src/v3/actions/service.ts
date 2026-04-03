/**
 * GPT Actions V3 Service
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { NotFoundError, ForbiddenError } from "@splits-network/shared-fastify";
import { GptActionsRepository } from "./repository.js";
import { JobSearchParams, ApplicationListParams } from "./types.js";

export class GptActionsService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: GptActionsRepository,
        private supabase: SupabaseClient,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async searchJobs(params: JobSearchParams) {
        const page = params.page || 1;
        const limit = 10;
        const { data, total } = await this.repository.searchJobs(
            params.keywords,
            params.location,
            params.commute_type,
            params.job_level,
            page,
            limit,
        );
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

    async getJobDetail(id: string) {
        const job = await this.repository.getJobById(id);
        if (!job) throw new NotFoundError("Job", id);
        return job;
    }

    async getApplications(
        clerkUserId: string,
        params: ApplicationListParams,
    ) {
        const context = await this.accessResolver.resolve(clerkUserId);
        if (!context.candidateId)
            throw new ForbiddenError("Candidate profile not found");

        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        const includeInactive = params.include_inactive === "true";

        const { data, total } = await this.repository.getApplicationsByCandidate(
            context.candidateId,
            includeInactive,
            page,
            limit,
        );

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
}
