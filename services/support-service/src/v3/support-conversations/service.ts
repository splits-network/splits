/**
 * Support Conversations V3 Service — Business Logic
 *
 * Optional auth (visitors may not be logged in).
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError, BadRequestError } from "@splits-network/shared-fastify";
import { SupportConversationRepository } from "./repository";
import {
    SupportConversationListParams,
    CreateSupportConversationInput,
    UpdateSupportConversationInput,
} from "./types";
import { IEventPublisher } from "../../v2/shared/events";
import { SupportEventPublisher } from "../shared/support-event-publisher";

export class SupportConversationService {
    constructor(
        private repository: SupportConversationRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher,
        private supportEventPublisher?: SupportEventPublisher,
    ) {}

    async getAll(params: SupportConversationListParams) {
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
        const conversation = await this.repository.findById(id);
        if (!conversation) throw new NotFoundError("SupportConversation", id);
        return conversation;
    }

    async create(input: CreateSupportConversationInput, clerkUserId?: string) {
        const record = {
            visitor_session_id: input.visitor_session_id,
            clerk_user_id: clerkUserId || null,
            visitor_name: input.visitor_name || null,
            visitor_email: input.visitor_email || null,
            source_app: input.source_app || null,
            status: "open",
        };

        const conversation = await this.repository.create(record);

        await this.eventPublisher?.publish(
            "support_conversation.created",
            {
                conversation_id: conversation.id,
                visitor_session_id: conversation.visitor_session_id,
            },
            "support-service",
        );

        if (this.supportEventPublisher) {
            await this.supportEventPublisher.publishToConversation(
                conversation.id,
                {
                    type: "conversation.created",
                    eventVersion: 1,
                    serverTime: new Date().toISOString(),
                    data: { conversation },
                },
            );
            await this.supportEventPublisher.publishToAdminQueue({
                type: "support.conversation.new",
                eventVersion: 1,
                serverTime: new Date().toISOString(),
                data: { conversation },
            });
        }

        return conversation;
    }

    async update(id: string, input: UpdateSupportConversationInput) {
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("SupportConversation", id);
        return this.repository.update(id, input);
    }

    async close(id: string) {
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("SupportConversation", id);
        await this.repository.softDelete(id);
    }

    async getBySession(sessionId: string) {
        return this.repository.findBySession(sessionId);
    }

    async checkAdminOnline(): Promise<boolean> {
        if (!this.supportEventPublisher) return false;
        return this.supportEventPublisher.isAnyAdminOnline();
    }

    async getVisitorConversations(sessionId?: string, clerkUserId?: string) {
        return this.repository.findVisitorConversations(sessionId, clerkUserId);
    }

    async listMessages(
        conversationId: string,
        limit: number = 50,
        before?: string,
    ) {
        return this.repository.listMessages(conversationId, limit, before);
    }

    async sendVisitorMessage(
        conversationId: string,
        senderId: string | null,
        body: string,
    ) {
        const message = await this.repository.addMessage(
            conversationId,
            "visitor",
            senderId,
            body,
        );
        await this.repository.update(conversationId, {
            status: "waiting_on_admin",
        });

        if (this.supportEventPublisher) {
            await this.supportEventPublisher.publishToConversation(
                conversationId,
                {
                    type: "message.new",
                    eventVersion: 1,
                    serverTime: new Date().toISOString(),
                    data: { message },
                },
            );
            await this.supportEventPublisher.publishToAdminQueue({
                type: "support.message.new",
                eventVersion: 1,
                serverTime: new Date().toISOString(),
                data: { conversationId, message },
            });
        }

        return message;
    }

    async linkSession(
        sessionId: string,
        clerkUserId: string,
        headers?: Record<string, unknown>,
    ) {
        await this.repository.linkSessionToUser(
            sessionId,
            clerkUserId,
            headers,
        );
    }
}
