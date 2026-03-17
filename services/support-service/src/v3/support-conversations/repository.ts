/**
 * Support Conversations V3 Repository — Core CRUD
 *
 * Single table queries on support_conversations. NO joins, NO role logic.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { SupportConversationListParams } from "./types";

export class SupportConversationRepository {
    constructor(private supabase: SupabaseClient) {}

    async findAll(
        params: SupportConversationListParams,
    ): Promise<{ data: any[]; total: number }> {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from("support_conversations")
            .select("*", { count: "exact" });

        if (params.status) query = query.eq("status", params.status);
        if (params.search) {
            query = query.or(
                `visitor_name.ilike.%${params.search}%,visitor_email.ilike.%${params.search}%`,
            );
        }

        query = query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async findById(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from("support_conversations")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async findBySession(sessionId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .from("support_conversations")
            .select("*")
            .eq("visitor_session_id", sessionId)
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) throw error;
        return data || [];
    }

    async create(record: Record<string, any>): Promise<any> {
        const { data, error } = await this.supabase
            .from("support_conversations")
            .insert(record)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, updates: Record<string, any>): Promise<any> {
        const { data, error } = await this.supabase
            .from("support_conversations")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async softDelete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from("support_conversations")
            .update({ status: "closed" })
            .eq("id", id);

        if (error) throw error;
    }

    async listMessages(
        conversationId: string,
        limit: number = 50,
        before?: string,
    ): Promise<any[]> {
        let query = this.supabase
            .from("support_messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true })
            .limit(limit);

        if (before) {
            query = query.lt("created_at", before);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async addMessage(
        conversationId: string,
        senderType: "visitor" | "admin" | "system",
        senderId: string | null,
        body: string,
    ): Promise<any> {
        const { data, error } = await this.supabase
            .from("support_messages")
            .insert({
                conversation_id: conversationId,
                sender_type: senderType,
                sender_id: senderId,
                body,
            })
            .select()
            .single();

        if (error) throw error;

        await this.supabase
            .from("support_conversations")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", conversationId);

        return data;
    }

    async linkSessionToUser(
        sessionId: string,
        clerkUserId: string,
        headers?: Record<string, unknown>,
    ): Promise<void> {
        const { resolveAccessContext } = await import(
            "@splits-network/shared-access-context"
        );
        const ctx = await resolveAccessContext(this.supabase, clerkUserId, headers);
        const userId = ctx.identityUserId || null;

        const updates: Record<string, any> = {
            clerk_user_id: clerkUserId,
            user_id: userId,
        };

        if (userId) {
            const { data: user } = await this.supabase
                .from("users")
                .select("name, email")
                .eq("id", userId)
                .single();

            if (user) {
                if (user.name) updates.visitor_name = user.name;
                if (user.email) updates.visitor_email = user.email;
            }
        }

        await this.supabase
            .from("support_conversations")
            .update(updates)
            .eq("visitor_session_id", sessionId)
            .is("clerk_user_id", null);
    }

    async findVisitorConversations(
        sessionId?: string,
        clerkUserId?: string,
    ): Promise<any[]> {
        if (clerkUserId) {
            const { data, error } = await this.supabase
                .from("support_conversations")
                .select("*")
                .eq("clerk_user_id", clerkUserId)
                .neq("status", "closed")
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            return data || [];
        }

        if (sessionId) {
            const { data, error } = await this.supabase
                .from("support_conversations")
                .select("*")
                .eq("visitor_session_id", sessionId)
                .neq("status", "closed")
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            return data || [];
        }

        return [];
    }
}
