/**
 * Messages V3 Repository — Core CRUD
 *
 * Single table queries on chat_messages. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MessageListParams } from './types';

export class MessageRepository {
    constructor(private supabase: SupabaseClient) { }

    async findAll(
        conversationId: string,
        params: MessageListParams,
    ): Promise<{ data: any[]; total: number }> {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 50, 100);
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('chat_messages')
            .select('*', { count: 'exact' })
            .eq('conversation_id', conversationId);

        if (params.after) {
            query = query.gt('id', params.after);
        }
        if (params.before) {
            query = query.lt('id', params.before);
        }

        query = query
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async findById(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('chat_messages')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    /**
     * Send a message using the atomic chat_send_message RPC.
     * The RPC handles insert + last_message_at update atomically.
     */
    async sendViaRpc(
        conversationId: string,
        senderId: string,
        body: string,
        clientMessageId: string | null,
    ): Promise<any> {
        const { data, error } = await this.supabase
            .rpc('chat_send_message', {
                p_conversation_id: conversationId,
                p_sender_id: senderId,
                p_body: body ?? null,
                p_client_message_id: clientMessageId ?? null,
            });

        if (error) throw error;
        return data;
    }

    async findByClientMessageId(senderId: string, clientMessageId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('chat_messages')
            .select('*')
            .eq('sender_id', senderId)
            .eq('client_message_id', clientMessageId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async getParticipantState(conversationId: string, userId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('chat_conversation_participants')
            .select('*')
            .eq('conversation_id', conversationId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async getOtherParticipant(conversationId: string, excludeUserId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('chat_conversation_participants')
            .select('*')
            .eq('conversation_id', conversationId)
            .neq('user_id', excludeUserId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async getOtherParticipantUserIds(conversationId: string, excludeUserId: string): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('chat_conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId)
            .neq('user_id', excludeUserId);

        if (error) throw error;
        return (data || []).map((r: any) => r.user_id);
    }

    async isBlocked(userA: string, userB: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('chat_user_blocks')
            .select('blocker_user_id')
            .or(
                `and(blocker_user_id.eq.${userA},blocked_user_id.eq.${userB}),and(blocker_user_id.eq.${userB},blocked_user_id.eq.${userA})`
            )
            .limit(1);

        if (error) throw error;
        return (data?.length || 0) > 0;
    }

    async countMessages(conversationId: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conversationId);

        if (error) throw error;
        return count || 0;
    }
}
