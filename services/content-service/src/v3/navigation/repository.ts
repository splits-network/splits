/**
 * Navigation V3 Repository — Core CRUD
 *
 * Single table queries on content_navigation. NO joins, NO role logic.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { NavigationListParams } from "./types";

export class NavigationRepository {
    constructor(private supabase: SupabaseClient) {}

    async findAll(
        params: NavigationListParams,
    ): Promise<{ data: any[]; total: number }> {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from("content_navigation")
            .select("*", { count: "exact" });

        if (params.app) query = query.eq("app", params.app);
        if (params.location) query = query.eq("location", params.location);

        query = query
            .order("updated_at", { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async findById(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from("content_navigation")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async upsert(record: Record<string, any>): Promise<any> {
        const { data, error } = await this.supabase
            .from("content_navigation")
            .upsert(record, { onConflict: "app,location" })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from("content_navigation")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
}
