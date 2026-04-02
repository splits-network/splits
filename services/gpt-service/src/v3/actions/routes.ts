/**
 * GPT Actions V3 Routes
 * GPT-facing endpoints for job search, detail, and applications
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { IEventPublisher } from "../../v2/shared/events.js";
import { GptActionsRepository } from "./repository.js";
import { GptActionsService } from "./service.js";
import { registerSubmitApplicationAction } from "./actions/submit-application.route.js";
import { registerAnalyzeResumeAction } from "./actions/analyze-resume.route.js";
import {
    JobSearchParams,
    ApplicationListParams,
    jobSearchQuerySchema,
    jobIdParamSchema,
    applicationListQuerySchema,
} from "./types.js";

export function registerGptActionRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
) {
    const repository = new GptActionsRepository(supabase);
    const service = new GptActionsService(repository, supabase);

    // Register action routes BEFORE parameterized routes
    registerSubmitApplicationAction(app, supabase, eventPublisher);
    registerAnalyzeResumeAction(app, supabase, eventPublisher);

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

    // GET /api/v3/gpt/applications — with standard pagination
    app.get("/api/v3/gpt/applications", {
        schema: { querystring: applicationListQuerySchema },
    }, async (request, reply) => {
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
        const query = request.query as ApplicationListParams;
        const result = await service.getApplications(clerkUserId, query);
        return reply.send({
            data: result.data,
            pagination: result.pagination,
        });
    });
}
