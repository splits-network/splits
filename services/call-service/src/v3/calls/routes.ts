/**
 * Calls V3 Routes — Core 5 CRUD + Lifecycle
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { IEventPublisher } from "../../v2/shared/events";
import { CallRepository } from "./repository";
import { CallService } from "./service";
import { registerCallLifecycleRoutes } from "./lifecycle-routes";
import {
    CreateCallInput,
    UpdateCallInput,
    CallListParams,
    idParamSchema,
    listQuerySchema,
    createCallSchema,
    updateCallSchema,
} from "./types";
import { registerMyCallsView } from "./views/my-calls.route";

export function registerCallRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
) {
    const repository = new CallRepository(supabase);
    const service = new CallService(repository, supabase, eventPublisher);

    // Register views before parameterized CRUD routes
    registerMyCallsView(app, supabase);

    // Register lifecycle routes (start, end, cancel, reschedule, decline)
    if (eventPublisher) {
        registerCallLifecycleRoutes(app, supabase, eventPublisher);
    }

    // GET /api/v3/calls
    app.get(
        "/api/v3/calls",
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
            // Merge filters from JSON string (sent by useStandardList) into top-level params
            const raw = request.query as any;
            let filters: Record<string, any> = {};
            if (typeof raw.filters === "string") {
                try {
                    filters = JSON.parse(raw.filters);
                } catch {
                    /* ignore */
                }
            } else if (raw.filters && typeof raw.filters === "object") {
                filters = raw.filters;
            }
            const params: CallListParams = { ...raw, ...filters };
            const result = await service.getAll(
                params,
                clerkUserId,
            );
            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        },
    );

    // GET /api/v3/calls/:id
    app.get(
        "/api/v3/calls/:id",
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

    // POST /api/v3/calls
    app.post(
        "/api/v3/calls",
        {
            schema: { body: createCallSchema },
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
                request.body as CreateCallInput,
                clerkUserId,
            );
            return reply.code(201).send({ data });
        },
    );

    // PATCH /api/v3/calls/:id
    app.patch(
        "/api/v3/calls/:id",
        {
            schema: { params: idParamSchema, body: updateCallSchema },
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
                request.body as UpdateCallInput,
                clerkUserId,
            );
            return reply.send({ data });
        },
    );

    // DELETE /api/v3/calls/:id
    app.delete(
        "/api/v3/calls/:id",
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
                data: { message: "Call deleted successfully" },
            });
        },
    );
}
