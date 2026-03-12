import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupportRepository } from './repository';
import { SupportEventPublisher } from './events';
import {
    CreateConversationInput,
    SupportConversation,
    SupportConversationStatus,
    SupportMessage,
} from './types';

export class SupportServiceV2 {
    constructor(
        private repository: SupportRepository,
        private eventPublisher: SupportEventPublisher,
        private supabase: SupabaseClient,
    ) {}

    async checkAdminOnline(): Promise<boolean> {
        return this.eventPublisher.isAnyAdminOnline();
    }

    async createConversation(input: CreateConversationInput): Promise<{
        conversation: SupportConversation;
        message: SupportMessage;
    }> {
        const result = await this.repository.createConversation(input);

        await this.eventPublisher.publishToConversation(result.conversation.id, {
            type: 'conversation.created',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { conversation: result.conversation, message: result.message },
        });

        await this.eventPublisher.publishToAdminQueue({
            type: 'support.conversation.new',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { conversation: result.conversation, message: result.message },
        });

        return result;
    }

    async getVisitorConversations(
        sessionId?: string,
        clerkUserId?: string,
    ): Promise<SupportConversation[]> {
        return this.repository.findVisitorConversations(sessionId, clerkUserId);
    }

    async getConversation(id: string): Promise<SupportConversation | null> {
        return this.repository.getConversation(id);
    }

    async listMessages(
        conversationId: string,
        limit: number = 50,
        before?: string,
    ): Promise<SupportMessage[]> {
        return this.repository.listMessages(conversationId, limit, before);
    }

    async sendVisitorMessage(
        conversationId: string,
        senderId: string | null,
        body: string,
    ): Promise<SupportMessage> {
        const message = await this.repository.addMessage(
            conversationId, 'visitor', senderId, body,
        );

        await this.repository.updateConversation(conversationId, {
            status: 'waiting_on_admin',
        });

        await this.eventPublisher.publishToConversation(conversationId, {
            type: 'message.new',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { message },
        });

        await this.eventPublisher.publishToAdminQueue({
            type: 'support.message.new',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { conversationId, message },
        });

        return message;
    }

    async sendAdminMessage(
        conversationId: string,
        adminClerkUserId: string,
        body: string,
    ): Promise<SupportMessage> {
        const conversation = await this.repository.getConversation(conversationId);
        if (!conversation) {
            const error = new Error('Conversation not found') as any;
            error.statusCode = 404;
            throw error;
        }

        const ctx = await resolveAccessContext(this.supabase, adminClerkUserId);

        const message = await this.repository.addMessage(
            conversationId, 'admin', ctx.identityUserId || null, body,
        );

        await this.repository.updateConversation(conversationId, {
            status: 'waiting_on_visitor',
        });

        await this.eventPublisher.publishToConversation(conversationId, {
            type: 'message.new',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { message },
        });

        return message;
    }

    async linkSession(sessionId: string, clerkUserId: string): Promise<void> {
        await this.repository.linkSessionToUser(sessionId, clerkUserId);
    }

    // ── Admin operations ──

    async listAllConversations(filters: {
        status?: SupportConversationStatus;
        category?: string;
        limit: number;
        cursor?: string;
    }): Promise<{ data: SupportConversation[]; total: number }> {
        return this.repository.listAllConversations(filters);
    }

    async updateConversationStatus(
        id: string,
        status: SupportConversationStatus,
    ): Promise<SupportConversation> {
        const updates: any = { status };
        if (status === 'resolved') {
            updates.resolved_at = new Date().toISOString();
        }

        const conversation = await this.repository.updateConversation(id, updates);

        await this.eventPublisher.publishToConversation(id, {
            type: 'conversation.updated',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { conversation },
        });

        return conversation;
    }

    async claimConversation(
        id: string,
        adminClerkUserId: string,
    ): Promise<SupportConversation> {
        const conversation = await this.repository.claimConversation(id, adminClerkUserId);

        await this.eventPublisher.publishToConversation(id, {
            type: 'conversation.claimed',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { conversation },
        });

        await this.eventPublisher.publishToAdminQueue({
            type: 'support.conversation.claimed',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { conversation },
        });

        return conversation;
    }
}
