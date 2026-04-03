/**
 * Pages V3 Routes
 *
 * Public: GET list, GET by slug. Admin: full CRUD.
 * Non-parameterized routes before :id routes.
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { IEventPublisher } from "../../v2/shared/events.js";
import { PageRepository } from "./repository.js";
import { PageService } from "./service.js";
import { registerTypedListingView } from "./views/typed-listing.route.js";
import {
    CreatePageInput,
    UpdatePageInput,
    PageListParams,
    listQuerySchema,
    createSchema,
    updateSchema,
    idParamSchema,
    slugParamSchema,
} from "./types.js";

export function registerPageRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
) {
    const repository = new PageRepository(supabase);
    const service = new PageService(repository, supabase, eventPublisher);

    // Register views before parameterized routes
    registerTypedListingView(app, supabase);

    // GET /api/v3/public/pages/by-slug/:slug — public, no auth (new /public/ convention)
    app.get(
        "/api/v3/public/pages/by-slug/:slug",
        {
            schema: { params: slugParamSchema },
        },
        async (request, reply) => {
            const { slug } = request.params as { slug: string };
            const data = await service.getBySlug(slug);
            return reply.send({ data });
        },
    );

    // GET /api/v3/public/pages/typed-listing — public typed listing view
    app.get(
        "/api/v3/public/pages/typed-listing",
        {
            schema: {
                querystring: {
                    type: "object",
                    required: ["page_type"],
                    properties: {
                        page_type: { type: "string", enum: ["blog", "article", "help", "partner", "press", "legal", "page"] },
                        app: { type: "string" },
                        tag: { type: "string" },
                        page: { type: "integer", minimum: 1, default: 1 },
                        limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
                    },
                    additionalProperties: true,
                },
            },
        },
        async (request, reply) => {
            const { TypedListingRepository } = await import("./views/typed-listing.repository.js");
            const listingRepo = new TypedListingRepository(supabase);
            const params = request.query as {
                page_type: string;
                app?: string;
                tag?: string;
                page?: number;
                limit?: number;
            };
            const { data, total } = await listingRepo.findPublished(params);
            const p = params.page || 1;
            const l = Math.min(params.limit || 25, 100);
            return reply.send({
                data,
                pagination: { total, page: p, limit: l, total_pages: Math.ceil(total / l) },
            });
        },
    );

    // GET /api/v3/pages/views/by-slug/:slug — legacy, still supported
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
            await service.delete(id, clerkUserId);
            return reply.send({
                data: { message: "Page deleted successfully" },
            });
        },
    );
}
