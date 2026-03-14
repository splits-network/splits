/**
 * Support Tickets V3 Service — Business Logic
 *
 * Visitor creation (optional auth), admin management.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { NotFoundError, BadRequestError } from "@splits-network/shared-fastify";
import { TicketRepository } from "./repository";
import {
    TicketListParams,
    CreateTicketInput,
    UpdateTicketInput,
} from "./types";
import { IEventPublisher } from "../../v2/shared/events";

export class TicketService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: TicketRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getAll(params: TicketListParams) {
        const { data, total } = await this.repository.findAll(params);
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async getById(id: string) {
        const ticket = await this.repository.findById(id);
        if (!ticket) throw new NotFoundError("Ticket", id);
        return ticket;
    }

    async create(input: CreateTicketInput, clerkUserId?: string) {
        let userId: string | null = null;
        let visitorName = input.visitor_name || null;
        let visitorEmail = input.visitor_email || null;

        if (clerkUserId) {
            try {
                const ctx = await this.accessResolver.resolve(clerkUserId);
                userId = ctx.identityUserId || null;

                if (userId && (!visitorName || !visitorEmail)) {
                    const { data: user } = await this.supabase
                        .from("users")
                        .select("name, email")
                        .eq("id", userId)
                        .single();
                    if (user) {
                        visitorName = visitorName || user.name || null;
                        visitorEmail = visitorEmail || user.email || null;
                    }
                }
            } catch {
                // Anonymous fallback
            }
        }

        const record = {
            visitor_session_id: input.visitor_session_id,
            clerk_user_id: clerkUserId || null,
            user_id: userId,
            visitor_name: visitorName,
            visitor_email: visitorEmail,
            source_app: input.source_app || null,
            category: input.category || "question",
            subject: input.subject || null,
            body: input.body,
            page_url: input.page_url || null,
            user_agent: input.user_agent || null,
        };

        const ticket = await this.repository.create(record);

        await this.eventPublisher?.publish(
            "support_ticket.created",
            {
                ticket_id: ticket.id,
                category: ticket.category,
                subject: ticket.subject,
            },
            "support-service",
        );

        return ticket;
    }

    async update(id: string, input: UpdateTicketInput) {
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("Ticket", id);

        const updates: Record<string, any> = { ...input };
        if (input.status === "resolved") {
            updates.resolved_at = new Date().toISOString();
        }

        return this.repository.update(id, updates);
    }

    async getVisitorTickets(sessionId?: string, clerkUserId?: string) {
        return this.repository.findByVisitor(sessionId, clerkUserId);
    }

    async getStatusCounts() {
        return this.repository.getStatusCounts();
    }
}
