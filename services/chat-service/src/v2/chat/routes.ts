import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { ChatRepository } from "./repository";
import { ChatServiceV2 } from "./service";
import { ChatStorageClient } from "./storage";
import { requireUserContext } from "../shared/helpers";
import { JobQueue } from "@splits-network/shared-job-queue";
import { ChatEventPublisher } from "./events";
import { EventPublisher, IEventPublisher } from "../shared/events";
import Redis from "ioredis";

interface RegisterChatRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    rabbitMqUrl: string;
    redisConfig: { host: string; port: number; password?: string };
    eventPublisher: IEventPublisher;
}

export async function registerChatRoutes(
    app: FastifyInstance,
    config: RegisterChatRoutesConfig,
) {
    const repository = new ChatRepository(
        config.supabaseUrl,
        config.supabaseKey,
    );
    const eventPublisher = new ChatEventPublisher(
        config.redisConfig,
        app.log as any,
    );
    const service = new ChatServiceV2(
        repository,
        eventPublisher,
        config.eventPublisher,
    );
    const presenceRedis = new Redis({
        host: config.redisConfig.host,
        port: config.redisConfig.port,
        password: config.redisConfig.password || undefined,
    });
    const bucket = process.env.CHAT_ATTACHMENTS_BUCKET || "chat-attachments";
    const storage = new ChatStorageClient(
        config.supabaseUrl,
        config.supabaseKey,
        bucket,
    );
    const attachmentsEnabled = process.env.CHAT_ATTACHMENTS_ENABLED === "true";
    const attachmentQueue = new JobQueue({
        rabbitMqUrl: config.rabbitMqUrl,
        queueName: "chat-attachment-scan",
        logger: app.log as any,
    });

    presenceRedis.on("error", (err) => {
        app.log.error({ err }, "Redis presence error");
    });

    app.addHook("onClose", async () => {
        await presenceRedis.quit();
    });

    app.get("/api/v2/chat/presence", async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as any;
            const rawUserIds = query.userIds;
            const userIds = Array.isArray(rawUserIds)
                ? rawUserIds.flatMap((value) => String(value).split(","))
                : typeof rawUserIds === "string"
                    ? rawUserIds.split(",")
                    : [];
            const normalized = userIds
                .map((value) => value.trim())
                .filter(Boolean)
                .slice(0, 100);

            if (normalized.length === 0) {
                return reply.send({ data: [] });
            }

            const keys = normalized.map((id) => `presence:user:${id}`);
            const values = await presenceRedis.mget(keys);
            const data = normalized.map((id, index) => {
                const payload = values[index];
                if (!payload) {
                    return { userId: id, status: "offline", lastSeenAt: null };
                }
                try {
                    const parsed = JSON.parse(payload);
                    const s = parsed?.status;
                    return {
                        userId: id,
                        status:
                            s === "online" ? "online" : s === "idle" ? "idle" : "offline",
                        lastSeenAt: parsed?.lastSeenAt || null,
                    };
                } catch {
                    return { userId: id, status: "offline", lastSeenAt: null };
                }
            });

            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // DEPRECATED: These POST endpoints write to presence:user:${clerkUserId} but the
    // GET endpoint reads by identityUserId, so data written here is never read correctly.
    // Presence is now handled via WebSocket presence.ping in the chat-gateway.
    app.post("/api/v2/chat/presence/ping", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const now = new Date().toISOString();

            const presenceData = {
                status: "online",
                lastSeenAt: now,
                updatedAt: now,
            };

            // Set presence with 90-second TTL (matches existing pattern)
            await presenceRedis.setex(
                `presence:user:${clerkUserId}`,
                90,
                JSON.stringify(presenceData),
            );

            return reply.send({ data: { status: "ok" } });
        } catch (error: any) {
            app.log.error({ error }, "Error updating presence");
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message });
        }
    });

    app.post("/api/v2/chat/presence/offline", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const now = new Date().toISOString();

            const presenceData = {
                status: "offline",
                lastSeenAt: now,
                updatedAt: now,
            };

            // Set offline presence with shorter TTL for cleanup
            await presenceRedis.setex(
                `presence:user:${clerkUserId}`,
                30,
                JSON.stringify(presenceData),
            );

            return reply.send({ data: { status: "ok" } });
        } catch (error: any) {
            app.log.error({ error }, "Error setting offline presence");
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message });
        }
    });

    app.post("/api/v2/chat/presence/batch", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const userPresenceUpdates = body.users || [];
            const now = new Date().toISOString();

            if (
                !Array.isArray(userPresenceUpdates) ||
                userPresenceUpdates.length === 0
            ) {
                return reply.code(400).send({ error: "Invalid batch request" });
            }

            // For batch updates, we'll limit to 50 updates max
            const limitedUpdates = userPresenceUpdates.slice(0, 50);
            const pipeline = presenceRedis.pipeline();

            for (const update of limitedUpdates) {
                if (!update.userId || !update.status) continue;

                const presenceData = {
                    status: update.status === "online" ? "online" : "offline",
                    lastSeenAt: update.lastSeenAt || now,
                    updatedAt: now,
                };

                const ttl = update.status === "online" ? 90 : 30;
                pipeline.setex(
                    `presence:user:${update.userId}`,
                    ttl,
                    JSON.stringify(presenceData),
                );
            }

            await pipeline.exec();

            return reply.send({
                data: {
                    status: "ok",
                    updated: limitedUpdates.length,
                },
            });
        } catch (error: any) {
            app.log.error({ error }, "Error updating batch presence");
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message });
        }
    });

    await attachmentQueue.connect();

    app.post("/api/v2/chat/conversations", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const conversation = await service.createOrFindConversation(
                clerkUserId,
                {
                    participantUserId: body.participantUserId,
                    context: body.context || {},
                },
            );
            return reply.code(201).send({ data: conversation });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get("/api/v2/chat/conversations", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            const filter = (query.filter || "inbox") as
                | "inbox"
                | "requests"
                | "archived";
            const limit = Math.min(parseInt(query.limit || "25", 10), 100);
            const cursor = query.cursor as string | undefined;
            // NEW: Use enriched version that includes participant names inline
            // SECURITY: Prevents frontend from calling unauthorized GET /users/:id
            const result = await service.listConversationsWithParticipants(
                clerkUserId,
                filter,
                limit,
                cursor,
            );
            return reply.send({
                data: result.data,
                pagination: {
                    total: result.total,
                    limit,
                    cursor,
                },
            });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get(
        "/api/v2/chat/conversations/:id/messages",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                const query = request.query as any;
                const after = query.after as string | undefined;
                const before = query.before as string | undefined;
                const limit = Math.min(parseInt(query.limit || "50", 10), 100);
                const messages = await service.listMessages(
                    clerkUserId,
                    id,
                    after,
                    before,
                    limit,
                );
                return reply.send({ data: messages });
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.get("/api/v2/chat/conversations/:id/resync", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const query = request.query as any;
            const after = query.after as string | undefined;
            const before = query.before as string | undefined;
            const limit = Math.min(parseInt(query.limit || "50", 10), 100);
            // NEW: Use enriched version that includes participant names inline
            // SECURITY: Prevents frontend from calling unauthorized GET /users/:id
            const result = await service.resyncConversationWithParticipants(
                clerkUserId,
                id,
                after,
                before,
                limit,
            );
            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post(
        "/api/v2/chat/conversations/:id/messages",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                const body = request.body as any;
                const message = await service.sendMessage(clerkUserId, id, {
                    clientMessageId: body.clientMessageId,
                    body: body.body,
                    attachments: body.attachments || [],
                });
                return reply.code(201).send({ data: message });
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.post(
        "/api/v2/chat/conversations/:id/accept",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                await service.acceptConversation(clerkUserId, id);
                return reply.code(204).send();
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.post(
        "/api/v2/chat/conversations/:id/decline",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                await service.declineConversation(clerkUserId, id);
                return reply.code(204).send();
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.post("/api/v2/chat/conversations/:id/mute", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await service.muteConversation(clerkUserId, id, true);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.delete(
        "/api/v2/chat/conversations/:id/mute",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                await service.muteConversation(clerkUserId, id, false);
                return reply.code(204).send();
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.post(
        "/api/v2/chat/conversations/:id/archive",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                await service.archiveConversation(clerkUserId, id, true);
                return reply.code(204).send();
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.delete(
        "/api/v2/chat/conversations/:id/archive",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                await service.archiveConversation(clerkUserId, id, false);
                return reply.code(204).send();
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.post(
        "/api/v2/chat/conversations/:id/read-receipt",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                const body = request.body as any;
                await service.updateReadReceipt(
                    clerkUserId,
                    id,
                    body.lastReadMessageId,
                );
                return reply.code(204).send();
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.post("/api/v2/chat/blocks", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            await service.blockUser(
                clerkUserId,
                body.blockedUserId,
                body.reason,
            );
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.delete("/api/v2/chat/blocks/:blockedUserId", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { blockedUserId } = request.params as {
                blockedUserId: string;
            };
            await service.unblockUser(clerkUserId, blockedUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post("/api/v2/chat/reports", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            await service.reportConversation(
                clerkUserId,
                body.conversationId,
                body.reportedUserId,
                body.category,
                body.description,
            );
            return reply.code(201).send({ status: "ok" });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post("/api/v2/chat/attachments/init", async (request, reply) => {
        try {
            if (!attachmentsEnabled) {
                return reply
                    .code(403)
                    .send({ error: "Attachments are disabled" });
            }
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const attachmentId = randomUUID();
            const fileName = body.file_name as string;
            const storageKey = `${body.conversationId}/${attachmentId}-${fileName}`;
            const attachment = await service.createAttachment(
                clerkUserId,
                body.conversationId,
                {
                    file_name: fileName,
                    content_type: body.content_type,
                    size_bytes: body.size_bytes,
                    storage_key: storageKey,
                },
            );
            const uploadUrl = await storage.createSignedUploadUrl(storageKey);
            return reply.code(201).send({ data: { ...attachment, uploadUrl } });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post(
        "/api/v2/chat/attachments/:id/complete",
        async (request, reply) => {
            try {
                if (!attachmentsEnabled) {
                    return reply
                        .code(403)
                        .send({ error: "Attachments are disabled" });
                }
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                const attachment = await service.markAttachmentUploaded(
                    clerkUserId,
                    id,
                );
                await attachmentQueue.addJob("scan-attachment", {
                    attachmentId: attachment.id,
                    storageKey: attachment.storage_key,
                    conversationId: attachment.conversation_id,
                    uploaderId: attachment.uploader_id,
                });
                return reply.send({ data: attachment });
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.get(
        "/api/v2/chat/attachments/:id/download-url",
        async (request, reply) => {
            try {
                if (!attachmentsEnabled) {
                    return reply
                        .code(403)
                        .send({ error: "Attachments are disabled" });
                }
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                const attachment = await repository.findAttachment(id);
                if (!attachment) {
                    return reply
                        .code(404)
                        .send({ error: "Attachment not found" });
                }
                await service.listMessages(
                    clerkUserId,
                    attachment.conversation_id,
                    undefined,
                    undefined,
                    1,
                );
                const downloadUrl = await storage.createSignedDownloadUrl(
                    attachment.storage_key,
                );
                return reply.send({ data: { url: downloadUrl } });
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.patch("/api/v2/chat/messages/:id", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;
            const message = await service.updateMessageRedaction(
                clerkUserId,
                id,
                {
                    redacted: body.redacted === true,
                    reason: body.reason,
                    editedBody: body.editedBody,
                },
            );
            return reply.send({ data: message });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get("/api/v2/admin/chat/reports", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            const limit = Math.min(parseInt(query.limit || "25", 10), 100);
            const cursor = query.cursor as string | undefined;
            const result = await service.listReports(
                clerkUserId,
                limit,
                cursor,
            );
            return reply.send({
                data: result.data,
                pagination: {
                    total: result.total,
                    limit,
                    cursor,
                },
            });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get(
        "/api/v2/admin/chat/reports/:id/evidence",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                const result = await service.getReportEvidence(clerkUserId, id);
                return reply.send({ data: result });
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.post(
        "/api/v2/admin/chat/reports/:id/action",
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params as { id: string };
                const body = request.body as any;
                const result = await service.takeReportAction(clerkUserId, id, {
                    action: body.action,
                    status: body.status,
                    details: body.details,
                });
                return reply.send({ data: result });
            } catch (error: any) {
                return reply
                    .code(error.statusCode || 400)
                    .send({ error: error.message });
            }
        },
    );

    app.get("/api/v2/admin/chat/audit", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            const limit = Math.min(parseInt(query.limit || "25", 10), 100);
            const cursor = query.cursor as string | undefined;
            const result = await service.listModerationAudit(
                clerkUserId,
                limit,
                cursor,
            );
            return reply.send({
                data: result.data,
                pagination: {
                    total: result.total,
                    limit,
                    cursor,
                },
            });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get("/api/v2/admin/chat/metrics", async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            const rangeDays = parseInt(query.rangeDays || "7", 10);
            const result = await service.getAdminMetrics(
                clerkUserId,
                rangeDays,
            );
            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });
}
