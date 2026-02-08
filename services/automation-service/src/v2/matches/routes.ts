import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createClient } from "@supabase/supabase-js";
import { CandidateMatchServiceV2 } from "./service";
import { CandidateMatchRepository, CreateMatchInput } from "./repository";
import { MatchFilters, MatchUpdate } from "./types";
import {
    requireUserContext,
    validatePaginationParams,
} from "../shared/helpers";
import { EventPublisher } from "../shared/events";
import { resolveAccessContext } from "../shared/access";

interface RegisterMatchRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerMatchRoutes(
    app: FastifyInstance,
    config: RegisterMatchRoutesConfig,
) {
    const repository = new CandidateMatchRepository(
        config.supabaseUrl,
        config.supabaseKey,
    );
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) =>
        resolveAccessContext(accessClient, clerkUserId);
    const service = new CandidateMatchServiceV2(
        repository,
        accessResolver,
        config.eventPublisher,
    );

    app.get("/api/v2/matches", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);

            // Parse filters object if present (comes as JSON string from query params)
            let parsedFilters: Record<string, any> = {};
            if (query.filters) {
                try {
                    parsedFilters =
                        typeof query.filters === "string"
                            ? JSON.parse(query.filters)
                            : query.filters;
                } catch (e) {
                    console.error("Failed to parse filters:", e);
                }
            }

            const filters: MatchFilters = {
                candidate_id: query.candidate_id,
                job_id: query.job_id,
                status: query.status,
                min_score: query.min_score
                    ? Number(query.min_score)
                    : undefined,
                page: pagination.page,
                limit: pagination.limit,
                filters: parsedFilters,
            };
            const result = await service.listMatches(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply
                .code(400)
                .send({
                    error: {
                        message: error.message || "Failed to fetch matches",
                    },
                });
        }
    });

    app.get("/api/v2/matches/:id", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const match = await service.getMatch(clerkUserId, id);
            return reply.send({ data: match });
        } catch (error: any) {
            return reply
                .code(404)
                .send({
                    error: { message: error.message || "Match not found" },
                });
        }
    });

    app.post(
        "/api/v2/matches",
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const body = request.body as CreateMatchInput;
                if (
                    !body?.candidate_id ||
                    !body.job_id ||
                    typeof body.match_score === "undefined" ||
                    !body.match_reason
                ) {
                    return reply.code(400).send({
                        error: {
                            message:
                                "candidate_id, job_id, match_score, and match_reason are required",
                        },
                    });
                }
                const match = await service.createMatch(clerkUserId, body);
                return reply.code(201).send({ data: match });
            } catch (error: any) {
                return reply
                    .code(400)
                    .send({
                        error: {
                            message: error.message || "Failed to create match",
                        },
                    });
            }
        },
    );

    app.patch("/api/v2/matches/:id", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as MatchUpdate;
            const match = await service.updateMatch(clerkUserId, id, updates);
            return reply.send({ data: match });
        } catch (error: any) {
            return reply
                .code(400)
                .send({
                    error: {
                        message: error.message || "Failed to update match",
                    },
                });
        }
    });

    app.delete("/api/v2/matches/:id", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await service.deleteMatch(clerkUserId, id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(400)
                .send({
                    error: {
                        message: error.message || "Failed to delete match",
                    },
                });
        }
    });
}
