/**
 * Pages V3 Routes
 *
 * Public: GET list, GET by slug. Admin: full CRUD.
 * Non-parameterized routes before :id routes.
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { IEventPublisher } from "../../v2/shared/events";
import { PageRepository } from "./repository";
import { PageService } from "./service";
import {
    CreatePageInput,
    UpdatePageInput,
    PageListParams,
    listQuerySchema,
    createSchema,
    updateSchema,
    idParamSchema,
    slugParamSchema,
} from "./types";

export function registerPageRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
) {
    const repository = new PageRepository(supabase);
    const service = new PageService(repository, supabase, eventPublisher);

    // GET /api/v3/pages/views/by-slug/:slug — public, no auth
    app.get(
        "/api/v3/pages/views/by-slug/:slug",
        {
            schema: { params: slugParamSchema },
        },
        async (request, reply) => {
            const { slug } = request.params as { slug: string };
            const data = await service.getBySlug(slug);
            return reply.send({ data });
        },
    );

    // GET /api/v3/pages — list (public)
    app.get(
        "/api/v3/pages",
        {
            schema: { querystring: listQuerySchema },
        },
        async (request, reply) => {
            const result = await service.getAll(
                request.query as PageListParams,
            );
            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        },
    );

    // GET /api/v3/pages/:id
    app.get(
        "/api/v3/pages/:id",
        {
            schema: { params: idParamSchema },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const data = await service.getById(id);
            return reply.send({ data });
        },
    );

    // POST /api/v3/pages — admin only
    app.post(
        "/api/v3/pages",
        {
            schema: { body: createSchema },
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
                request.body as CreatePageInput,
                clerkUserId,
                request.headers,
            );
            return reply.code(201).send({ data });
        },
    );

    // PATCH /api/v3/pages/:id — admin only
    app.patch(
        "/api/v3/pages/:id",
        {
            schema: { params: idParamSchema, body: updateSchema },
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
                request.body as UpdatePageInput,
                clerkUserId,
                request.headers,
            );
            return reply.send({ data });
        },
    );

    // DELETE /api/v3/pages/:id — admin only
    app.delete(
        "/api/v3/pages/:id",
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
            await service.delete(id, clerkUserId, request.headers);
            return reply.send({
                data: { message: "Page deleted successfully" },
            });
        },
    );
}
