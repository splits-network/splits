import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";

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
}
