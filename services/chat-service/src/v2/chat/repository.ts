import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChatAttachment, ChatConversation, ChatMessage, ChatParticipantState, ChatModerationAudit, ChatReport } from './types';

export class ChatRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    async findConversation(
        participantAId: string,
        participantBId: string,
        context: {
            application_id?: string | null;
            job_id?: string | null;
            company_id?: string | null;
        }
    ): Promise<ChatConversation | null> {
        let query = this.supabase
            .from('chat_conversations')
            .select('*')
            .eq('participant_a_id', participantAId)
            .eq('participant_b_id', participantBId);

        if (context.application_id) {
            query = query.eq('application_id', context.application_id);
        } else {
            query = query.is('application_id', null);
        }

        if (context.job_id) {
            query = query.eq('job_id', context.job_id);
        } else {
            query = query.is('job_id', null);
        }

        if (context.company_id) {
            query = query.eq('company_id', context.company_id);
        } else {
            query = query.is('company_id', null);
        }

        const { data, error } = await query.maybeSingle();
        if (error) {
            throw error;
        }
        return data as ChatConversation | null;
    }

    async createConversation(
        participantAId: string,
        participantBId: string,
        context: {
            application_id?: string | null;
            job_id?: string | null;
            company_id?: string | null;
        }
    ): Promise<ChatConversation> {
        const { data, error } = await this.supabase
            .from('chat_conversations')
            .insert({
                participant_a_id: participantAId,
                participant_b_id: participantBId,
                application_id: context.application_id ?? null,
                job_id: context.job_id ?? null,
                company_id: context.company_id ?? null,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as ChatConversation;
    }

    async ensureParticipants(
        conversationId: string,
        participants: Array<{
            user_id: string;
            request_state: 'none' | 'pending' | 'accepted' | 'declined';
        }>
    ): Promise<void> {
        const rows = participants.map((participant) => ({
            conversation_id: conversationId,
            user_id: participant.user_id,
            request_state: participant.request_state,
        }));

        const { error } = await this.supabase
            .from('chat_conversation_participants')
            .upsert(rows, { onConflict: 'conversation_id,user_id' });

        if (error) {
            throw error;
        }
    }

    async getParticipantState(
        conversationId: string,
        userId: string
    ): Promise<ChatParticipantState | null> {
        const { data, error } = await this.supabase
            .from('chat_conversation_participants')
            .select('*')
            .eq('conversation_id', conversationId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            throw error;
        }
        return data as ChatParticipantState | null;
    }

    async getConversation(conversationId: string): Promise<ChatConversation | null> {
        const { data, error } = await this.supabase
            .from('chat_conversations')
            .select('*')
            .eq('id', conversationId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data as ChatConversation | null;
    }

    async listConversations(
        userId: string,
        filter: 'inbox' | 'requests' | 'archived',
        limit: number,
        cursor?: string
    ): Promise<{ data: ChatParticipantState[]; total: number }> {
        let query = this.supabase
            .from('chat_conversation_participants')
            .select(
                `
                conversation_id,
                user_id,
                muted_at,
                archived_at,
                request_state,
                last_read_at,
                last_read_message_id,
                unread_count,
                chat_conversations (
                    id,
                    participant_a_id,
                    participant_b_id,
                    application_id,
                    job_id,
                    company_id,
                    last_message_at,
                    last_message_id,
                    created_at,
                    updated_at
                )
                `,
                { count: 'exact' }
            )
            .eq('user_id', userId);

        if (filter === 'archived') {
            query = query.not('archived_at', 'is', null);
        } else {
            query = query.is('archived_at', null);
        }

        if (filter === 'requests') {
            query = query.eq('request_state', 'pending');
        } else if (filter === 'inbox') {
            query = query.neq('request_state', 'pending');
        }

        if (cursor) {
            query = query.lt('chat_conversations.last_message_at', cursor as any);
        }

        const { data, error, count } = await query
            .order('last_message_at', { foreignTable: 'chat_conversations', ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return {
            data: (data || []) as ChatParticipantState[],
            total: count || 0,
        };
    }

    async listMessages(
        conversationId: string,
        afterMessageId?: string,
        limit: number = 50
    ): Promise<ChatMessage[]> {
        let query = this.supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (afterMessageId) {
            const { data: afterMessage } = await this.supabase
                .from('chat_messages')
                .select('created_at')
                .eq('id', afterMessageId)
                .maybeSingle();
            if (afterMessage?.created_at) {
                query = query.gt('created_at', afterMessage.created_at);
            }
        }

        const { data, error } = await query.limit(limit);
        if (error) {
            throw error;
        }

        return (data || []) as ChatMessage[];
    }

    async listMessagesByIds(messageIds: string[]): Promise<ChatMessage[]> {
        if (messageIds.length === 0) {
            return [];
        }
        const { data, error } = await this.supabase
            .from('chat_messages')
            .select('*')
            .in('id', messageIds)
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        return (data || []) as ChatMessage[];
    }

    async listParticipantStates(conversationId: string): Promise<ChatParticipantState[]> {
        const { data, error } = await this.supabase
            .from('chat_conversation_participants')
            .select('*')
            .eq('conversation_id', conversationId);

        if (error) {
            throw error;
        }

        return (data || []) as ChatParticipantState[];
    }

    async insertMessage(input: {
        conversation_id: string;
        sender_id: string;
        body?: string | null;
        client_message_id?: string | null;
        kind?: 'user' | 'system';
    }): Promise<ChatMessage> {
        const { data, error } = await this.supabase
            .from('chat_messages')
            .insert({
                conversation_id: input.conversation_id,
                sender_id: input.sender_id,
                body: input.body ?? null,
                client_message_id: input.client_message_id ?? null,
                kind: input.kind ?? 'user',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as ChatMessage;
    }

    async updateMessageMetadata(messageId: string, metadata: Record<string, any>): Promise<ChatMessage> {
        const { data, error } = await this.supabase
            .from('chat_messages')
            .update({ metadata })
            .eq('id', messageId)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as ChatMessage;
    }

    async updateConversationLastMessage(conversationId: string, message: ChatMessage): Promise<void> {
        const { error } = await this.supabase
            .from('chat_conversations')
            .update({
                last_message_at: message.created_at,
                last_message_id: message.id,
            })
            .eq('id', conversationId);

        if (error) {
            throw error;
        }
    }

    async updateParticipantState(
        conversationId: string,
        userId: string,
        updates: Partial<ChatParticipantState>
    ): Promise<ChatParticipantState> {
        const { data, error } = await this.supabase
            .from('chat_conversation_participants')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as ChatParticipantState;
    }

    async incrementUnread(conversationId: string, userId: string, delta: number): Promise<void> {
        const { data, error } = await this.supabase
            .from('chat_conversation_participants')
            .select('unread_count')
            .eq('conversation_id', conversationId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        const unreadCount = (data?.unread_count ?? 0) + delta;
        const { error: updateError } = await this.supabase
            .from('chat_conversation_participants')
            .update({ unread_count: Math.max(unreadCount, 0), updated_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', userId);

        if (updateError) {
            throw updateError;
        }
    }

    async setReadReceipt(
        conversationId: string,
        userId: string,
        lastReadMessageId?: string | null
    ): Promise<void> {
        const updates: Partial<ChatParticipantState> = {
            last_read_at: new Date().toISOString(),
            last_read_message_id: lastReadMessageId ?? null,
            unread_count: 0,
        };

        const { error } = await this.supabase
            .from('chat_conversation_participants')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', userId);

        if (error) {
            throw error;
        }
    }

    async isBlocked(senderId: string, recipientId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('chat_user_blocks')
            .select('blocker_user_id')
            .or(
                `and(blocker_user_id.eq.${recipientId},blocked_user_id.eq.${senderId}),and(blocker_user_id.eq.${senderId},blocked_user_id.eq.${recipientId})`
            )
            .limit(1);

        if (error) {
            throw error;
        }

        return (data?.length || 0) > 0;
    }

    async addBlock(blockerUserId: string, blockedUserId: string, reason?: string | null): Promise<void> {
        const { error } = await this.supabase
            .from('chat_user_blocks')
            .insert({
                blocker_user_id: blockerUserId,
                blocked_user_id: blockedUserId,
                reason: reason ?? null,
            });

        if (error) {
            throw error;
        }
    }

    async removeBlock(blockerUserId: string, blockedUserId: string): Promise<void> {
        const { error } = await this.supabase
            .from('chat_user_blocks')
            .delete()
            .eq('blocker_user_id', blockerUserId)
            .eq('blocked_user_id', blockedUserId);

        if (error) {
            throw error;
        }
    }

    async createReport(input: {
        reporter_user_id: string;
        reported_user_id: string;
        conversation_id: string;
        category: string;
        description?: string | null;
        evidence_pointer?: string | null;
    }): Promise<void> {
        const { error } = await this.supabase
            .from('chat_reports')
            .insert({
                reporter_user_id: input.reporter_user_id,
                reported_user_id: input.reported_user_id,
                conversation_id: input.conversation_id,
                category: input.category,
                description: input.description ?? null,
                evidence_pointer: input.evidence_pointer ?? null,
            });

        if (error) {
            throw error;
        }
    }

    async listReports(limit: number, cursor?: string): Promise<{ data: ChatReport[]; total: number }> {
        let query = this.supabase
            .from('chat_reports')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (cursor) {
            query = query.lt('created_at', cursor as any);
        }

        const { data, error, count } = await query;
        if (error) {
            throw error;
        }

        return {
            data: (data || []) as ChatReport[],
            total: count || 0,
        };
    }

    async getReport(reportId: string): Promise<ChatReport | null> {
        const { data, error } = await this.supabase
            .from('chat_reports')
            .select('*')
            .eq('id', reportId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data as ChatReport | null;
    }

    async updateReportStatus(reportId: string, status: ChatReport['status']): Promise<ChatReport> {
        const { data, error } = await this.supabase
            .from('chat_reports')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', reportId)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as ChatReport;
    }

    async createModerationAudit(input: {
        actor_user_id: string;
        target_user_id: string;
        action: ChatModerationAudit['action'];
        details?: Record<string, any> | null;
    }): Promise<ChatModerationAudit> {
        const { data, error } = await this.supabase
            .from('chat_moderation_audit')
            .insert({
                actor_user_id: input.actor_user_id,
                target_user_id: input.target_user_id,
                action: input.action,
                details: input.details ?? null,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as ChatModerationAudit;
    }

    async listModerationAudit(limit: number, cursor?: string): Promise<{ data: ChatModerationAudit[]; total: number }> {
        let query = this.supabase
            .from('chat_moderation_audit')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (cursor) {
            query = query.lt('created_at', cursor as any);
        }

        const { data, error, count } = await query;
        if (error) {
            throw error;
        }

        return {
            data: (data || []) as ChatModerationAudit[],
            total: count || 0,
        };
    }

    async createAttachment(input: {
        conversation_id: string;
        uploader_id: string;
        file_name: string;
        content_type: string;
        size_bytes: number;
        storage_key: string;
    }): Promise<ChatAttachment> {
        const { data, error } = await this.supabase
            .from('chat_attachments')
            .insert({
                conversation_id: input.conversation_id,
                uploader_id: input.uploader_id,
                file_name: input.file_name,
                content_type: input.content_type,
                size_bytes: input.size_bytes,
                storage_key: input.storage_key,
                status: 'pending_upload',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as ChatAttachment;
    }

    async updateAttachment(
        attachmentId: string,
        updates: Partial<ChatAttachment>
    ): Promise<ChatAttachment> {
        const { data, error } = await this.supabase
            .from('chat_attachments')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', attachmentId)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as ChatAttachment;
    }

    async findAttachment(attachmentId: string): Promise<ChatAttachment | null> {
        const { data, error } = await this.supabase
            .from('chat_attachments')
            .select('*')
            .eq('id', attachmentId)
            .maybeSingle();

        if (error) {
            throw error;
        }
        return data as ChatAttachment | null;
    }

    async getAdminMetrics(rangeDays: number): Promise<{
        rangeDays: number;
        since: string;
        totals: {
            messages: number;
            conversations: number;
            reports: number;
            blocks: number;
            attachments: number;
            attachments_blocked: number;
            redactions: number;
            moderation_actions: number;
        };
        requests: {
            pending: number;
            declined: number;
        };
        retention: {
            last_run_at: string | null;
            last_status: string | null;
            messages_redacted: number;
            attachments_deleted: number;
            audits_archived: number;
        };
    }> {
        const sinceDate = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);
        const since = sinceDate.toISOString();

        const countRows = async (
            table: string,
            filters: Array<{ key: string; op: 'eq' | 'neq' | 'gte' | 'not' | 'is'; value: any }>
        ) => {
            let query = this.supabase.from(table).select('id', { count: 'exact', head: true });
            for (const filter of filters) {
                if (filter.op === 'eq') {
                    query = query.eq(filter.key, filter.value);
                } else if (filter.op === 'neq') {
                    query = query.neq(filter.key, filter.value);
                } else if (filter.op === 'gte') {
                    query = query.gte(filter.key, filter.value);
                } else if (filter.op === 'is') {
                    query = query.is(filter.key, filter.value);
                } else if (filter.op === 'not') {
                    query = query.not(filter.key, 'is', filter.value);
                }
            }
            const { count, error } = await query;
            if (error) {
                throw error;
            }
            return count || 0;
        };

        const [
            messages,
            conversations,
            reports,
            blocks,
            attachments,
            attachmentsBlocked,
            redactions,
            moderationActions,
            pendingRequests,
            declinedRequests,
        ] = await Promise.all([
            countRows('chat_messages', [{ key: 'created_at', op: 'gte', value: since }]),
            countRows('chat_conversations', [{ key: 'created_at', op: 'gte', value: since }]),
            countRows('chat_reports', [{ key: 'created_at', op: 'gte', value: since }]),
            countRows('chat_user_blocks', [{ key: 'created_at', op: 'gte', value: since }]),
            countRows('chat_attachments', [{ key: 'created_at', op: 'gte', value: since }]),
            countRows('chat_attachments', [
                { key: 'created_at', op: 'gte', value: since },
                { key: 'status', op: 'eq', value: 'blocked' },
            ]),
            countRows('chat_messages', [
                { key: 'created_at', op: 'gte', value: since },
                { key: 'redacted_at', op: 'not', value: null },
            ]),
            countRows('chat_moderation_audit', [{ key: 'created_at', op: 'gte', value: since }]),
            countRows('chat_conversation_participants', [
                { key: 'request_state', op: 'eq', value: 'pending' },
            ]),
            countRows('chat_conversation_participants', [
                { key: 'request_state', op: 'eq', value: 'declined' },
            ]),
        ]);

        const { data: lastRetention } = await this.supabase
            .from('chat_retention_runs')
            .select('started_at, completed_at, status, messages_redacted, attachments_deleted, audits_archived')
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return {
            rangeDays,
            since,
            totals: {
                messages,
                conversations,
                reports,
                blocks,
                attachments,
                attachments_blocked: attachmentsBlocked,
                redactions,
                moderation_actions: moderationActions,
            },
            requests: {
                pending: pendingRequests,
                declined: declinedRequests,
            },
            retention: {
                last_run_at: lastRetention?.completed_at || lastRetention?.started_at || null,
                last_status: lastRetention?.status || null,
                messages_redacted: lastRetention?.messages_redacted || 0,
                attachments_deleted: lastRetention?.attachments_deleted || 0,
                audits_archived: lastRetention?.audits_archived || 0,
            },
        };
    }
}
