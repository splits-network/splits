import { FastifyInstance } from "fastify";
import Redis from "ioredis";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const AGGREGATED_KEY = "health-monitor:aggregated";

export function registerSystemHealthRoutes(
    app: FastifyInstance,
    redis: Redis,
    supabase: SupabaseClient,
) {
    // GET /api/v2/system-health - aggregated health status from Redis
    app.get(
        "/api/v2/system-health",
        {
            schema: {
                summary: "Get current system health status",
                tags: ["status"],
            },
        },
        async (request, reply) => {
            try {
                const data = await redis.get(AGGREGATED_KEY);
                if (!data) {
                    return reply.status(503).send({
                        data: {
                            status: "unknown",
                            services: [],
                            lastUpdated: null,
                            message:
                                "Health monitoring data temporarily unavailable",
                        },
                    });
                }

                const parsed = JSON.parse(data);
                return reply.send({ data: parsed });
            } catch (error) {
                request.log.error(
                    { err: error },
                    "Failed to read health status from Redis",
                );
                return reply.status(503).send({
                    data: {
                        status: "unknown",
                        services: [],
                        lastUpdated: null,
                        message:
                            "Health monitoring data temporarily unavailable",
                    },
                });
            }
        },
    );

    // GET /api/v2/system-health/incidents - recent incidents from DB
    app.get(
        "/api/v2/system-health/incidents",
        {
            schema: {
                summary: "Get recent health incidents",
                tags: ["status"],
            },
        },
        async (request, reply) => {
            try {
                const { limit = 20, active_only = false } =
                    request.query as {
                        limit?: number;
                        active_only?: boolean;
                    };

                let query = supabase
                    .from("health_incidents")
                    .select("*")
                    .order("started_at", { ascending: false })
                    .limit(Math.min(Number(limit) || 20, 100));

                if (
                    active_only === true ||
                    (active_only as any) === "true"
                ) {
                    query = query.is("resolved_at", null);
                }

                const { data, error } = await query;

                if (error) {
                    request.log.error(
                        { err: error },
                        "Failed to fetch incidents",
                    );
                    return reply
                        .status(500)
                        .send({ data: [], error: "Failed to fetch incidents" });
                }

                return reply.send({ data: data || [] });
            } catch (error) {
                request.log.error(
                    { err: error },
                    "Failed to fetch incidents",
                );
                return reply
                    .status(500)
                    .send({ data: [], error: "Failed to fetch incidents" });
            }
        },
    );
}
