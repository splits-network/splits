/**
 * GPT Actions V3 Routes
 * GPT-facing endpoints for job search, detail, and applications
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { GptActionsRepository } from "./repository";
import { GptActionsService } from "./service";
import {
    JobSearchParams,
    jobSearchQuerySchema,
    jobIdParamSchema,
} from "./types";

export function registerGptActionRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
) {
    const repository = new GptActionsRepository(supabase);
    const service = new GptActionsService(repository, supabase);

    // GET /api/v3/gpt/jobs/search
    app.get(
        "/api/v3/gpt/jobs/search",
        {
            schema: { querystring: jobSearchQuerySchema },
        },
        async (request, reply) => {
            const result = await service.searchJobs(
                request.query as JobSearchParams,
            );
            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        },
    );

    // GET /api/v3/gpt/jobs/:id
    app.get(
        "/api/v3/gpt/jobs/:id",
        {
            schema: { params: jobIdParamSchema },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const data = await service.getJobDetail(id);
            return reply.send({ data });
        },
    );

    // GET /api/v3/gpt/applications
    app.get("/api/v3/gpt/applications", async (request, reply) => {
        const clerkUserId = request.headers["x-clerk-user-id"] as string;
        if (!clerkUserId) {
            return reply
                .status(401)
                .send({
                    error: {
                        code: "AUTH_REQUIRED",
                        message: "Authentication required",
                    },
                });
        }
        const query = request.query as { include_inactive?: string };
        const data = await service.getApplications(
            clerkUserId,
            query.include_inactive === "true",
            request.headers,
        );
        return reply.send({ data });
    });
}
