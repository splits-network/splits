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
