/**
 * Call Participants V3 Routes
 * Nested under /api/v3/calls/:callId/participants
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { IEventPublisher } from "../../v2/shared/events";
import { ParticipantRepository } from "./repository";
import { ParticipantService } from "./service";
import {
    AddParticipantInput,
    ParticipantListParams,
    callIdParamSchema,
    participantIdParamSchema,
    listQuerySchema,
    addParticipantSchema,
} from "./types";

export function registerParticipantRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
) {
    const repository = new ParticipantRepository(supabase);
    const service = new ParticipantService(
        repository,
        supabase,
        eventPublisher,
    );

    // GET /api/v3/calls/:callId/participants
    app.get(
        "/api/v3/calls/:callId/participants",
        {
            schema: { params: callIdParamSchema, querystring: listQuerySchema },
        },
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
            const { callId } = request.params as { callId: string };
            const result = await service.getAll(
                callId,
                request.query as ParticipantListParams,
                clerkUserId,
                request.headers,
            );
            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        },
    );

    // GET /api/v3/calls/:callId/participants/:id
    app.get(
        "/api/v3/calls/:callId/participants/:id",
        {
            schema: { params: participantIdParamSchema },
        },
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
            const { id } = request.params as { id: string };
            const data = await service.getById(
                id,
                clerkUserId,
                request.headers,
            );
            return reply.send({ data });
        },
    );

    // POST /api/v3/calls/:callId/participants
    app.post(
        "/api/v3/calls/:callId/participants",
        {
            schema: { params: callIdParamSchema, body: addParticipantSchema },
        },
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
            const { callId } = request.params as { callId: string };
            const data = await service.create(
                callId,
                request.body as AddParticipantInput,
                clerkUserId,
                request.headers,
            );
            return reply.code(201).send({ data });
        },
    );

    // DELETE /api/v3/calls/:callId/participants/:id
    app.delete(
        "/api/v3/calls/:callId/participants/:id",
        {
            schema: { params: participantIdParamSchema },
        },
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
            const { callId, id } = request.params as {
                callId: string;
                id: string;
            };
            await service.delete(callId, id, clerkUserId, request.headers);
            return reply.send({
                data: { message: "Participant removed successfully" },
            });
        },
    );
}
