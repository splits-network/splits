/**
 * Search V3 Routes — single GET endpoint
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { SearchRepository } from "./repository.js";
import { SearchService } from "./service.js";
import { SearchParams, searchQuerySchema } from "./types.js";

export function registerSearchRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
) {
    const repository = new SearchRepository(supabase);
    const service = new SearchService(repository, supabase);

    app.get(
        "/api/v3/search",
        { schema: { querystring: searchQuerySchema } },
        async (request, reply) => {
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
            const result = await service.search(
                clerkUserId,
                request.query as SearchParams,
            );
            return reply.send({ data: result });
        },
    );
}
