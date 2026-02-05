import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ServiceRegistry } from "../clients";
import { requireAuth, AuthenticatedRequest } from "../rbac";
import { getCorrelationId } from "./v2/common";

/**
 * Register presence routes for site-wide activity tracking
 * Replaces chat-only WebSocket presence with comprehensive activity monitoring
 */
export async function registerPresenceRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
): Promise<void> {
    // Update user presence (called every 30s when active)
    app.post(
        "/api/v2/presence/ping",
        {
            preHandler: requireAuth(),
            schema: {
                description: "Update user presence status",
                tags: ["presence"],
                summary: "Update user presence to online",
                security: [{ bearerAuth: [] }],
                response: {
                    200: {
                        type: "object",
                        properties: {
                            data: {
                                type: "object",
                                properties: {
                                    status: { type: "string", enum: ["ok"] },
                                },
                            },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const req = request as AuthenticatedRequest;
            const clerkUserId = req.auth.clerkUserId;

            try {
                // Forward to chat service for Redis presence update
                const response = await services.get('chat').post("/api/v2/chat/presence/ping", undefined, getCorrelationId(request), {
                    "x-clerk-user-id": clerkUserId,
                });

                return reply.send({ data: { status: "ok" } });
            } catch (error: any) {
                request.log.error({ error }, "Failed to update user presence");
                return reply.code(500).send({
                    error: "Failed to update presence",
                });
            }
        }
    );

    // Mark user offline (called on page unload/idle timeout)
    app.post(
        "/api/v2/presence/offline",
        {
            preHandler: requireAuth(),
            schema: {
                description: "Mark user as offline",
                tags: ["presence"],
                summary: "Set user presence to offline",
                security: [{ bearerAuth: [] }],
                response: {
                    200: {
                        type: "object",
                        properties: {
                            data: {
                                type: "object",
                                properties: {
                                    status: { type: "string", enum: ["ok"] },
                                },
                            },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const req = request as AuthenticatedRequest;
            const clerkUserId = req.auth.clerkUserId;

            try {
                // Forward to chat service for Redis presence update
                const response = await services.get('chat').post("/api/v2/chat/presence/offline", undefined, getCorrelationId(request), {
                    "x-clerk-user-id": clerkUserId,
                });

                return reply.send({ data: { status: "ok" } });
            } catch (error: any) {
                request.log.error({ error }, "Failed to mark user offline");
                return reply.code(500).send({
                    error: "Failed to update presence",
                });
            }
        }
    );

    // Batch presence update (future use)
    app.post(
        "/api/v2/presence/batch",
        {
            preHandler: requireAuth(),
            schema: {
                description: "Batch update multiple user presence statuses",
                tags: ["presence"],
                summary: "Batch update presence for multiple users",
                security: [{ bearerAuth: [] }],
                body: {
                    type: "object",
                    properties: {
                        users: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    userId: { type: "string" },
                                    status: {
                                        type: "string",
                                        enum: ["online", "offline"],
                                    },
                                    lastSeenAt: { type: "string" },
                                },
                                required: ["userId", "status"],
                            },
                        },
                    },
                    required: ["users"],
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            data: {
                                type: "object",
                                properties: {
                                    status: { type: "string", enum: ["ok"] },
                                    updated: { type: "number" },
                                },
                            },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const req = request as AuthenticatedRequest;
            const clerkUserId = req.auth.clerkUserId;

            try {
                // Forward to chat service for batch Redis presence update
                const response: any = await services.get('chat').post("/api/v2/chat/presence/batch", request.body, getCorrelationId(request), {
                    "x-clerk-user-id": clerkUserId,
                });

                return reply.send({ data: response.data });
            } catch (error: any) {
                request.log.error({ error }, "Failed to get batch presence");
                return reply.code(500).send({
                    error: "Failed to update batch presence",
                });
            }
        }
    );
}