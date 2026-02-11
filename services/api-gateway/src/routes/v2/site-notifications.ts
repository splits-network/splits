import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { requireAuth } from "../../middleware/auth";

export function registerSiteNotificationRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
) {
    // GET /api/v2/site-notifications - active notifications (public)
    app.get(
        "/api/v2/site-notifications",
        {
            schema: {
                summary: "Get active site notifications",
                tags: ["status"],
            },
        },
        async (request, reply) => {
            try {
                const now = new Date().toISOString();

                const { data, error } = await supabase
                    .from("site_notifications")
                    .select("*")
                    .eq("is_active", true)
                    .or(`starts_at.is.null,starts_at.lte.${now}`)
                    .or(`expires_at.is.null,expires_at.gt.${now}`)
                    .order("severity", { ascending: true }) // critical first
                    .order("created_at", { ascending: false });

                if (error) {
                    request.log.error(
                        { err: error },
                        "Failed to fetch site notifications",
                    );
                    return reply.status(500).send({ data: [] });
                }

                return reply.send({ data: data || [] });
            } catch (error) {
                request.log.error(
                    { err: error },
                    "Failed to fetch site notifications",
                );
                return reply.status(500).send({ data: [] });
            }
        },
    );

    // GET /api/v2/site-notifications/all - all notifications for admin (auth required)
    app.get(
        "/api/v2/site-notifications/all",
        {
            preHandler: requireAuth(),
            schema: {
                summary: "Get all site notifications (admin)",
                tags: ["admin"],
            },
        },
        async (request, reply) => {
            try {
                const {
                    page = 1,
                    limit = 20,
                    type,
                    severity,
                    source,
                    is_active,
                    search,
                } = request.query as {
                    page?: number;
                    limit?: number;
                    type?: string;
                    severity?: string;
                    source?: string;
                    is_active?: string;
                    search?: string;
                };

                const pageNum = Number(page) || 1;
                const limitNum = Math.min(Number(limit) || 20, 100);
                const offset = (pageNum - 1) * limitNum;

                let query = supabase
                    .from("site_notifications")
                    .select("*", { count: "exact" })
                    .order("created_at", { ascending: false })
                    .range(offset, offset + limitNum - 1);

                if (type) query = query.eq("type", type);
                if (severity) query = query.eq("severity", severity);
                if (source) query = query.eq("source", source);
                if (is_active === "true") query = query.eq("is_active", true);
                if (is_active === "false") query = query.eq("is_active", false);
                if (search) query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);

                const { data, count, error } = await query;

                if (error) {
                    request.log.error(
                        { err: error },
                        "Failed to fetch notifications",
                    );
                    return reply.status(500).send({ data: [] });
                }

                const total = count || 0;
                return reply.send({
                    data: data || [],
                    pagination: {
                        total,
                        page: pageNum,
                        limit: limitNum,
                        total_pages: Math.ceil(total / limitNum),
                    },
                });
            } catch (error) {
                request.log.error(
                    { err: error },
                    "Failed to fetch notifications",
                );
                return reply.status(500).send({ data: [] });
            }
        },
    );

    // POST /api/v2/site-notifications - create notification (admin, auth required)
    app.post(
        "/api/v2/site-notifications",
        {
            preHandler: requireAuth(),
            schema: {
                summary: "Create a site notification",
                tags: ["admin"],
                body: {
                    type: "object",
                    required: ["type", "severity", "title"],
                    properties: {
                        type: { type: "string" },
                        severity: { type: "string" },
                        title: { type: "string" },
                        message: { type: "string" },
                        starts_at: { type: "string" },
                        expires_at: { type: "string" },
                        dismissible: { type: "boolean" },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const body = request.body as Record<string, any>;
                const clerkUserId = (request as any).auth?.clerkUserId;

                const { data, error } = await supabase
                    .from("site_notifications")
                    .insert({
                        type: body.type,
                        severity: body.severity,
                        source: "admin",
                        title: body.title,
                        message: body.message || null,
                        starts_at: body.starts_at || null,
                        expires_at: body.expires_at || null,
                        is_active: true,
                        dismissible:
                            body.dismissible !== undefined
                                ? body.dismissible
                                : true,
                        created_by: clerkUserId,
                    })
                    .select()
                    .single();

                if (error) {
                    request.log.error(
                        { err: error },
                        "Failed to create notification",
                    );
                    return reply
                        .status(500)
                        .send({ error: "Failed to create notification" });
                }

                return reply.status(201).send({ data });
            } catch (error) {
                request.log.error(
                    { err: error },
                    "Failed to create notification",
                );
                return reply
                    .status(500)
                    .send({ error: "Failed to create notification" });
            }
        },
    );

    // PATCH /api/v2/site-notifications/:id - update notification (admin, auth required)
    app.patch(
        "/api/v2/site-notifications/:id",
        {
            preHandler: requireAuth(),
            schema: {
                summary: "Update a site notification",
                tags: ["admin"],
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: string };
                const body = request.body as Record<string, any>;

                const updates: Record<string, any> = {
                    updated_at: new Date().toISOString(),
                };

                const allowedFields = [
                    "type",
                    "severity",
                    "title",
                    "message",
                    "starts_at",
                    "expires_at",
                    "is_active",
                    "dismissible",
                ];
                for (const field of allowedFields) {
                    if (body[field] !== undefined) {
                        updates[field] = body[field];
                    }
                }

                const { data, error } = await supabase
                    .from("site_notifications")
                    .update(updates)
                    .eq("id", id)
                    .select()
                    .single();

                if (error) {
                    request.log.error(
                        { err: error },
                        "Failed to update notification",
                    );
                    return reply
                        .status(500)
                        .send({ error: "Failed to update notification" });
                }

                return reply.send({ data });
            } catch (error) {
                request.log.error(
                    { err: error },
                    "Failed to update notification",
                );
                return reply
                    .status(500)
                    .send({ error: "Failed to update notification" });
            }
        },
    );

    // POST /api/v2/site-notifications/bulk-delete - delete multiple notifications (admin, auth required)
    app.post(
        "/api/v2/site-notifications/bulk-delete",
        {
            preHandler: requireAuth(),
            schema: {
                summary: "Delete multiple site notifications",
                tags: ["admin"],
                body: {
                    type: "object",
                    required: ["ids"],
                    properties: {
                        ids: {
                            type: "array",
                            items: { type: "string" },
                            minItems: 1,
                            maxItems: 100,
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { ids } = request.body as { ids: string[] };

                const { error } = await supabase
                    .from("site_notifications")
                    .delete()
                    .in("id", ids);

                if (error) {
                    request.log.error(
                        { err: error },
                        "Failed to bulk delete notifications",
                    );
                    return reply
                        .status(500)
                        .send({ error: "Failed to delete notifications" });
                }

                return reply.send({
                    data: { success: true, deleted: ids.length },
                });
            } catch (error) {
                request.log.error(
                    { err: error },
                    "Failed to bulk delete notifications",
                );
                return reply
                    .status(500)
                    .send({ error: "Failed to delete notifications" });
            }
        },
    );

    // DELETE /api/v2/site-notifications/:id - delete notification (admin, auth required)
    app.delete(
        "/api/v2/site-notifications/:id",
        {
            preHandler: requireAuth(),
            schema: {
                summary: "Delete a site notification",
                tags: ["admin"],
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: string };

                const { error } = await supabase
                    .from("site_notifications")
                    .delete()
                    .eq("id", id);

                if (error) {
                    request.log.error(
                        { err: error },
                        "Failed to delete notification",
                    );
                    return reply
                        .status(500)
                        .send({ error: "Failed to delete notification" });
                }

                return reply.send({ data: { success: true } });
            } catch (error) {
                request.log.error(
                    { err: error },
                    "Failed to delete notification",
                );
                return reply
                    .status(500)
                    .send({ error: "Failed to delete notification" });
            }
        },
    );
}
