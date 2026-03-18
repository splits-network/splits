/**
 * Support Conversations V3 Routes
 *
 * POST create is public (optional auth). List/get for visitors by session.
 * Admin routes use x-clerk-user-id auth.
 * Visitor routes use requireSupportIdentity / getSupportContext from shared helpers.
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { IEventPublisher } from "../../v2/shared/events";
import { SupportEventPublisher } from "../shared/support-event-publisher";
import {
    requireSupportIdentity,
    getSupportContext,
} from "../../v2/shared/helpers";
import { SupportConversationRepository } from "./repository";
import { SupportConversationService } from "./service";
import {
    SupportConversationListParams,
    CreateSupportConversationInput,
    UpdateSupportConversationInput,
    SendSupportMessageInput,
    listQuerySchema,
    createSchema,
    updateSchema,
    idParamSchema,
    sendMessageSchema,
} from "./types";
import { registerLinkSessionAction } from "./actions/link-session.route";
import { registerConversationClaimAction } from "./actions/claim.route";
import { registerAdminDetailView } from "./views/admin-detail.route";

export function registerSupportConversationRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
    supportEventPublisher?: SupportEventPublisher,
) {
    const repository = new SupportConversationRepository(supabase);
    const service = new SupportConversationService(
        repository,
        supabase,
        eventPublisher,
        supportEventPublisher,
    );

    // ── Public: no auth required ──

    // GET /api/v3/public/support/admin-status
    app.get("/api/v3/public/support/admin-status", async (_request, reply) => {
        const online = await service.checkAdminOnline();
        return reply.send({ data: { online } });
    });

    // ── Views & Actions (before parameterized routes) ──

    registerAdminDetailView(app, supabase);
    registerLinkSessionAction(app, supabase);
    registerConversationClaimAction(app, supabase, eventPublisher);

    // GET /api/v3/support/conversations/mine — visitor's conversations
    app.get("/api/v3/support/conversations/mine", async (request, reply) => {
        const ctx = requireSupportIdentity(request);
        const query = request.query as any;
        const data = await service.getVisitorConversations(
            ctx.sessionId || query.sessionId,
            ctx.clerkUserId,
        );
        return reply.send({ data });
    });

    // POST /api/v3/support/conversations/link-session (backward compat)
    app.post(
        "/api/v3/support/conversations/link-session",
        async (request, reply) => {
            const ctx = getSupportContext(request);
            if (!ctx.sessionId) {
                return reply.status(400).send({
                    error: {
                        code: "BAD_REQUEST",
                        message: "sessionId required",
                    },
                });
            }

            if (ctx.clerkUserId) {
                await service.linkSession(
                    ctx.sessionId,
                    ctx.clerkUserId,
                );
            }

            return reply.send({ data: { status: "ok" } });
        },
    );

    // ── Core 5 CRUD routes ──

    // GET /api/v3/support/conversations — list (admin)
    app.get(
        "/api/v3/support/conversations",
        {
            schema: { querystring: listQuerySchema },
        },
        async (request, reply) => {
            const clerkUserId = request.headers["x-clerk-user-id"] as string;
            if (!clerkUserId) {
                return reply.status(401).send({
                    error: {
                        code: "AUTH_REQUIRED",
                        message: "Authentication required",
                    },
                });
            }
            const result = await service.getAll(
                request.query as SupportConversationListParams,
            );
            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        },
    );

    // GET /api/v3/support/conversations/:id — requires auth
    app.get(
        "/api/v3/support/conversations/:id",
        {
            schema: { params: idParamSchema },
        },
        async (request, reply) => {
            const clerkUserId = request.headers["x-clerk-user-id"] as string;
            if (!clerkUserId) {
                return reply.status(401).send({
                    error: {
                        code: "AUTH_REQUIRED",
                        message: "Authentication required",
                    },
                });
            }
            const { id } = request.params as { id: string };
            const data = await service.getById(id);
            return reply.send({ data });
        },
    );

    // POST /api/v3/support/conversations — visitor creates (optional auth)
    app.post(
        "/api/v3/support/conversations",
        {
            schema: { body: createSchema },
        },
        async (request, reply) => {
            const clerkUserId = request.headers["x-clerk-user-id"] as
                | string
                | undefined;
            const data = await service.create(
                request.body as CreateSupportConversationInput,
                clerkUserId,
            );
            return reply.code(201).send({ data });
        },
    );

    // PATCH /api/v3/support/conversations/:id — admin update
    app.patch(
        "/api/v3/support/conversations/:id",
        {
            schema: { params: idParamSchema, body: updateSchema },
        },
        async (request, reply) => {
            const clerkUserId = request.headers["x-clerk-user-id"] as string;
            if (!clerkUserId) {
                return reply.status(401).send({
                    error: {
                        code: "AUTH_REQUIRED",
                        message: "Authentication required",
                    },
                });
            }
            const { id } = request.params as { id: string };
            const data = await service.update(
                id,
                request.body as UpdateSupportConversationInput,
            );
            return reply.send({ data });
        },
    );

    // DELETE /api/v3/support/conversations/:id — close conversation
    app.delete(
        "/api/v3/support/conversations/:id",
        {
            schema: { params: idParamSchema },
        },
        async (request, reply) => {
            const clerkUserId = request.headers["x-clerk-user-id"] as string;
            if (!clerkUserId) {
                return reply.status(401).send({
                    error: {
                        code: "AUTH_REQUIRED",
                        message: "Authentication required",
                    },
                });
            }
            const { id } = request.params as { id: string };
            await service.close(id);
            return reply.send({
                data: { message: "Support conversation closed successfully" },
            });
        },
    );

    // ── Parameterized sub-resource routes (after :id) ──

    // GET /api/v3/support/conversations/:id/messages
    app.get(
        "/api/v3/support/conversations/:id/messages",
        {
            schema: { params: idParamSchema },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const query = request.query as any;
            const limit = Math.min(parseInt(query.limit || "50", 10), 100);
            const before = query.before as string | undefined;
            const data = await service.listMessages(id, limit, before);
            return reply.send({ data });
        },
    );

    // POST /api/v3/support/conversations/:id/messages
    app.post(
        "/api/v3/support/conversations/:id/messages",
        {
            schema: { params: idParamSchema, body: sendMessageSchema },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const body = request.body as SendSupportMessageInput;
            const message = await service.sendVisitorMessage(
                id,
                null,
                body.body,
            );
            return reply.code(201).send({ data: message });
        },
    );
}
