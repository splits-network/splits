/**
 * ATS Integrations V3 Routes — Core 5 CRUD
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { IEventPublisher } from "../../v2/shared/events";
import { ATSIntegrationRepository } from "./repository";
import { ATSIntegrationService } from "./service";
import {
    CreateATSInput,
    UpdateATSInput,
    ATSListParams,
    idParamSchema,
    listQuerySchema,
    createATSSchema,
    updateATSSchema,
} from "./types";

export function registerATSIntegrationRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
) {
    const repository = new ATSIntegrationRepository(supabase);
    const service = new ATSIntegrationService(
        repository,
        supabase,
        eventPublisher,
    );

    // GET /api/v3/integrations/ats
    app.get(
        "/api/v3/integrations/ats",
        {
            schema: { querystring: listQuerySchema },
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
            const result = await service.getAll(
                request.query as ATSListParams,
                clerkUserId,
            );
            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        },
    );

    // GET /api/v3/integrations/ats/:id
    app.get(
        "/api/v3/integrations/ats/:id",
        {
            schema: { params: idParamSchema },
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
            );
            return reply.send({ data });
        },
    );

    // POST /api/v3/integrations/ats
    app.post(
        "/api/v3/integrations/ats",
        {
            schema: { body: createATSSchema },
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
            const data = await service.create(
                request.body as CreateATSInput,
                clerkUserId,
            );
            return reply.code(201).send({ data });
        },
    );

    // PATCH /api/v3/integrations/ats/:id
    app.patch(
        "/api/v3/integrations/ats/:id",
        {
            schema: { params: idParamSchema, body: updateATSSchema },
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
            const data = await service.update(
                id,
                request.body as UpdateATSInput,
                clerkUserId,
            );
            return reply.send({ data });
        },
    );

    // DELETE /api/v3/integrations/ats/:id
    app.delete(
        "/api/v3/integrations/ats/:id",
        {
            schema: { params: idParamSchema },
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
            await service.delete(id, clerkUserId);
            return reply.send({
                data: { message: "ATS integration disconnected successfully" },
            });
        },
    );
}
