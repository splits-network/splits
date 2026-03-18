/**
 * Badges V3 Routes — Core CRUD (GET list, GET by id) + Views
 *
 * Auth is enforced at the gateway level (auth: 'required' for CRUD).
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { BadgeRepository } from "./repository";
import { BadgeService } from "./service";
import { BadgeListParams, idParamSchema, listQuerySchema } from "./types";
import { registerBadgeProgressView } from "./views/progress/route";

export function registerBadgeRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
) {
    const repository = new BadgeRepository(supabase);
    const service = new BadgeService(repository);

    // Register views first (before :id routes to avoid collision)
    registerBadgeProgressView(app, supabase);

    app.get(
        "/api/v3/badges",
        { schema: { querystring: listQuerySchema } },
        async (request, reply) => {
            const result = await service.getAll(
                request.query as BadgeListParams,
            );
            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        },
    );

    app.get(
        "/api/v3/badges/:id",
        { schema: { params: idParamSchema } },
        async (request, reply) => {
            const data = await service.getById(
                (request.params as { id: string }).id,
            );
            return reply.send({ data });
        },
    );
}
