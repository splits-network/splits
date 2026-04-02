import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import {
    SupportConversation,
    SupportMessage,
    CreateConversationInput,
    SupportConversationStatus,
} from './types.js';

export class SupportRepository {
    constructor(private supabase: SupabaseClient) {}

    // ── Visitor endpoints ──

    async createConversation(input: CreateConversationInput): Promise<{
        conversation: SupportConversation;
        message: SupportMessage;
    }> {
        // Resolve user_id and auto-populate name/email if authenticated
        let userId: string | null = null;
        let visitorName = input.visitorName || null;
        let visitorEmail = input.visitorEmail || null;

        if (input.clerkUserId) {
            try {
                const ctx = await resolveAccessContext(this.supabase, input.clerkUserId);
                userId = ctx.identityUserId || null;

                if (userId && (!visitorName || !visitorEmail)) {
                    const { data: user } = await this.supabase
                        .from('users')
                        .select('name, email')
                        .eq('id', userId)
                        .single();
                    if (user) {
                        visitorName = visitorName || user.name || null;
                        visitorEmail = visitorEmail || user.email || null;
                    }
                }
            } catch {
                // Anonymous fallback — user_id stays null
            }
        }

        const { data: conversation, error: convError } = await this.supabase
            .from('support_conversations')
            .insert({
                visitor_session_id: input.sessionId,
                clerk_user_id: input.clerkUserId || null,
                user_id: userId,
                visitor_name: visitorName,
                visitor_email: visitorEmail,
                source_app: input.sourceApp,
                category: input.category || null,
                subject: input.subject || null,
                page_url: input.pageUrl || null,
                user_agent: input.userAgent || null,
                last_message_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (convError) throw new Error(`Failed to create conversation: ${convError.message}`);

        const { data: message, error: msgError } = await this.supabase
            .from('support_messages')
            .insert({
                conversation_id: conversation.id,
                sender_type: 'visitor',
                sender_id: userId,
                body: input.body,
            })
            .select()
            .single();

        if (msgError) throw new Error(`Failed to create message: ${msgError.message}`);

        return { conversation, message };
    }

    async findVisitorConversations(
        sessionId?: string,
        clerkUserId?: string,
    ): Promise<SupportConversation[]> {
        let query = this.supabase
            .from('support_conversations')
            .select('*')
            .in('status', ['open', 'waiting_on_visitor', 'waiting_on_admin'])
            .order('last_message_at', { ascending: false })
            .limit(10);

        if (clerkUserId) {
            query = query.eq('clerk_user_id', clerkUserId);
        } else if (sessionId) {
            query = query.eq('visitor_session_id', sessionId);
        } else {
            return [];
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to list conversations: ${error.message}`);
        return data || [];
    }

    async getConversation(id: string): Promise<SupportConversation | null> {
        const { data, error } = await this.supabase
            .from('support_conversations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    }

    async listMessages(
        conversationId: string,
        limit: number = 50,
        before?: string,
    ): Promise<SupportMessage[]> {
        let query = this.supabase
            .from('support_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (before) {
            query = query.lt('created_at', before);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to list messages: ${error.message}`);
        return data || [];
    }

    async addMessage(
        conversationId: string,
        senderType: 'visitor' | 'admin' | 'system',
        senderId: string | null,
        body: string,
        metadata?: Record<string, any>,
    ): Promise<SupportMessage> {
        const { data, error } = await this.supabase
            .from('support_messages')
            .insert({
                conversation_id: conversationId,
                sender_type: senderType,
                sender_id: senderId,
                body,
                metadata: metadata || null,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to add message: ${error.message}`);

        // Update last_message_at on conversation
        await this.supabase
            .from('support_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data;
    }

    async linkSessionToUser(sessionId: string, clerkUserId: string): Promise<void> {
        try {
            const ctx = await resolveAccessContext(this.supabase, clerkUserId);
            const userId = ctx.identityUserId || null;

            const updates: Record<string, any> = {
                clerk_user_id: clerkUserId,
                user_id: userId,
            };

            // Auto-populate name/email from users table
            if (userId) {
                const { data: user } = await this.supabase
                    .from('users')
                    .select('name, email')
                    .eq('id', userId)
                    .single();
                if (user) {
                    if (user.name) updates.visitor_name = user.name;
                    if (user.email) updates.visitor_email = user.email;
                }
            }

            await this.supabase
                .from('support_conversations')
                .update(updates)
                .eq('visitor_session_id', sessionId)
                .is('clerk_user_id', null);
        } catch {
            // Best-effort linking
        }
    }

    // ── Admin endpoints ──

    async listAllConversations(filters: {
        status?: SupportConversationStatus;
        category?: string;
        limit: number;
        cursor?: string;
    }): Promise<{ data: SupportConversation[]; total: number }> {
        let query = this.supabase
            .from('support_conversations')
            .select('*', { count: 'exact' })
            .order('last_message_at', { ascending: false, nullsFirst: false })
            .limit(filters.limit);

        if (filters.status) {
            query = query.eq('status', filters.status);
        } else {
            // Default: show active conversations
            query = query.in('status', ['open', 'waiting_on_visitor', 'waiting_on_admin']);
        }

        if (filters.category) {
            query = query.eq('category', filters.category);
        }

        if (filters.cursor) {
            query = query.lt('last_message_at', filters.cursor);
        }

        const { data, count, error } = await query;
        if (error) throw new Error(`Failed to list conversations: ${error.message}`);
        return { data: data || [], total: count || 0 };
    }

    async updateConversation(
        id: string,
        updates: Partial<Pick<SupportConversation, 'status' | 'assigned_admin_id' | 'resolved_at'>>,
    ): Promise<SupportConversation> {
        const { data, error } = await this.supabase
            .from('support_conversations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update conversation: ${error.message}`);
        return data;
    }

    async claimConversation(id: string, adminUserId: string): Promise<SupportConversation> {
        const ctx = await resolveAccessContext(this.supabase, adminUserId);
        return this.updateConversation(id, {
            assigned_admin_id: ctx.identityUserId || undefined,
            status: 'waiting_on_visitor',
        });
    }
}
