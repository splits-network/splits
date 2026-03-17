/**
 * Connections V3 Routes
 * Core CRUD: GET list, GET by id, DELETE (disconnect)
 * Actions: POST initiate (OAuth flow), POST callback (OAuth exchange)
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { EntitlementChecker } from "@splits-network/shared-access-context";
import { Logger } from "@splits-network/shared-logging";
import { CryptoService } from "@splits-network/shared-config/src/crypto";
import { IEventPublisher } from "../../v2/shared/events";
import { ConnectionRepository } from "./repository";
import { ConnectionService } from "./service";
import { OAuthService } from "./oauth-service";
import { ProviderRepository } from "../providers/repository";
import {
    ConnectionListParams,
    InitiateConnectionInput,
    CallbackInput,
    idParamSchema,
    listQuerySchema,
    initiateSchema,
    callbackSchema,
} from "./types";

export function registerConnectionRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
    logger?: Logger,
    crypto?: CryptoService,
) {
    const repository = new ConnectionRepository(supabase);
    const service = new ConnectionService(repository, supabase, eventPublisher);

    // GET /api/v3/integrations/connections
    app.get(
        "/api/v3/integrations/connections",
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
                request.query as ConnectionListParams,
                clerkUserId,
                request.headers,
            );
            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        },
    );

    // GET /api/v3/integrations/connections/:id
    app.get(
        "/api/v3/integrations/connections/:id",
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
                request.headers,
            );
            return reply.send({ data });
        },
    );

    // DELETE /api/v3/integrations/connections/:id
    app.delete(
        "/api/v3/integrations/connections/:id",
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
                data: { message: "Connection disconnected successfully" },
            });
        },
    );

    // ── OAuth Action Routes ─────────────────────────────────────────────
    if (!logger || !crypto || !eventPublisher) return;

    const providerRepo = new ProviderRepository(supabase);
    const oauthService = new OAuthService(
        repository,
        providerRepo,
        eventPublisher,
        logger,
        crypto,
    );
    const entitlementChecker = new EntitlementChecker(supabase);

    const EMAIL_PROVIDER_SLUGS = ["google_email", "microsoft_email"];
    const CALENDAR_PROVIDER_SLUGS = ["google_calendar", "microsoft_calendar"];

    // POST /api/v3/integrations/connections/initiate — start OAuth flow
    app.post(
        "/api/v3/integrations/connections/initiate",
        {
            schema: { body: initiateSchema },
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

            const body = request.body as InitiateConnectionInput;

            // Entitlement gate for email/calendar integrations
            const isEmail = EMAIL_PROVIDER_SLUGS.includes(body.provider_slug);
            const isCalendar = CALENDAR_PROVIDER_SLUGS.includes(
                body.provider_slug,
            );
            const requiredEntitlement = isEmail
                ? "email_integration"
                : isCalendar
                  ? "calendar_integration"
                  : null;

            if (requiredEntitlement) {
                const entitled =
                    await entitlementChecker.hasEntitlementByClerkId(
                        clerkUserId,
                        requiredEntitlement as
                            | "email_integration"
                            | "calendar_integration",
                    );
                if (!entitled) {
                    return reply.status(403).send({
                        error: {
                            code: "UPGRADE_REQUIRED",
                            message: "Upgrade required",
                        },
                        requiredTier: "pro",
                        entitlement: requiredEntitlement,
                    });
                }
            }

            try {
                const result = await oauthService.initiateOAuth(
                    clerkUserId,
                    body.provider_slug,
                    body.redirect_uri,
                    body.organization_id,
                );
                return reply.send({ data: result });
            } catch (err: any) {
                return reply
                    .status(400)
                    .send({
                        error: {
                            code: "INITIATE_FAILED",
                            message: err.message,
                        },
                    });
            }
        },
    );

    // POST /api/v3/integrations/connections/callback — handle OAuth callback
    app.post(
        "/api/v3/integrations/connections/callback",
        {
            schema: { body: callbackSchema },
        },
        async (request, reply) => {
            const body = request.body as CallbackInput;

            try {
                const connection = await oauthService.handleCallback(
                    body.code,
                    body.state,
                );
                return reply.send({ data: connection });
            } catch (err: any) {
                return reply
                    .status(400)
                    .send({
                        error: {
                            code: "CALLBACK_FAILED",
                            message: err.message,
                        },
                    });
            }
        },
    );
}
