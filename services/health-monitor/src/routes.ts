import { FastifyInstance } from "fastify";
import Redis from "ioredis";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { EventPublisher } from "./event-publisher";

const AGGREGATED_KEY = "health-monitor:aggregated";

interface StatusContactBody {
    name?: string;
    email?: string;
    topic?: string;
    urgency?: string;
    message?: string;
    source?: string;
    submitted_at?: string;
    ip_address?: string;
    user_agent?: string;
}

const sanitize = (value?: string) =>
    typeof value === "string" ? value.trim() : "";

export function registerHealthRoutes(
    app: FastifyInstance,
    options: {
        redis: Redis;
        supabaseUrl: string;
        supabaseKey: string;
        eventPublisher: EventPublisher | null;
    },
) {
    const { redis, eventPublisher } = options;
    const supabase = createClient(options.supabaseUrl, options.supabaseKey);

    // GET /api/v3/public/system-health — aggregated health status from Redis
    app.get("/api/v3/public/system-health", async (request, reply) => {
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

            return reply.send({ data: JSON.parse(data) });
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
    });

    // GET /api/v3/public/system-health/incidents — recent incidents from DB
    app.get("/api/v3/public/system-health/incidents", async (request, reply) => {
        try {
            const { limit = 20, active_only = false } = request.query as {
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
    });

    // POST /api/v3/public/status-contact — submit status page contact form
    app.post(
        "/api/v3/public/status-contact",
        {
            schema: {
                body: {
                    type: "object",
                    required: [
                        "name",
                        "email",
                        "message",
                        "source",
                        "submitted_at",
                    ],
                    properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                        topic: { type: "string" },
                        urgency: { type: "string" },
                        message: { type: "string" },
                        source: { type: "string" },
                        submitted_at: { type: "string" },
                        ip_address: { type: "string" },
                        user_agent: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            const body = request.body as StatusContactBody;

            const name = sanitize(body.name);
            const email = sanitize(body.email).toLowerCase();
            const topic = sanitize(body.topic) || "general";
            const urgency = sanitize(body.urgency || "normal");
            const message = sanitize(body.message);
            const source = sanitize(body.source) || "status-page";
            const submittedAt = sanitize(body.submitted_at);

            if (!name || !email || !message || !submittedAt) {
                return reply
                    .status(400)
                    .send({ error: "Missing required fields." });
            }

            if (!email.includes("@")) {
                return reply
                    .status(400)
                    .send({ error: "Invalid email address." });
            }

            if (message.length < 10) {
                return reply.status(400).send({
                    error: "Message must be at least 10 characters long.",
                });
            }

            if (!eventPublisher || !eventPublisher.isConnected()) {
                request.log.error(
                    "Event publisher unavailable for status contact submission",
                );
                return reply.status(503).send({
                    error: "Support form temporarily unavailable.",
                });
            }

            await eventPublisher.publish("status.contact_submitted", {
                name,
                email,
                topic,
                urgency,
                message,
                source,
                submitted_at: submittedAt,
                ip_address: sanitize(body.ip_address),
                user_agent: sanitize(body.user_agent),
            });

            return reply.status(202).send({ success: true });
        },
    );
}
