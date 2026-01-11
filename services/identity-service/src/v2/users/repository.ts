import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StandardListParams, StandardListResponse, parseFilters } from '@splits-network/shared-types';
import { resolveAccessContext } from '../shared/access';

export class UserRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findUsers(
        clerkUserId: string,
        params: StandardListParams = {}
    ): Promise<StandardListResponse<any>> {
        const page = Math.max(1, params.page ?? 1);
        const limit = Math.min(100, Math.max(1, params.limit ?? 25));
        const offset = (page - 1) * limit;
        let filters: Record<string, any> = {}

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        filters = typeof params.filters === 'string' ? parseFilters(params.filters) : (params.filters || {});

        let query = this.supabase.from('users').select('*', { count: 'exact' }).eq('clerk_user_id', clerkUserId);

        for (const key of Object.keys(filters)) {
            const value = filters[key];
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        }

        // if (params.search) {
        //     query = query.or(`email.ilike.%${params.search}%,name.ilike.%${params.search}%`);
        // }

        // const equalityFilterFields = ['status', 'clerk_user_id', 'email', 'id'];
        // for (const key of equalityFilterFields) {
        //     const value = filters[key];
        //     if (value !== undefined && value !== null && value !== '') {
        //         query = query.eq(key, value);
        //     }
        // }

        // if (!accessContext.isPlatformAdmin) {
        //     query = query.eq('id', accessContext.identityUserId as string);
        // }

        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order?.toLowerCase() === 'asc';
        query = query.order(sortBy, { ascending });

        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) throw error;

        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit),
            },
        };
    }

    async findUserById(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async findUserByClerkId(clerkUserId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    }

    async createUser(data: any): Promise<any> {
        const { data: user, error } = await this.supabase
            .from('users')
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        return user;
    }

    async updateUser(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async create(clerkUserId: string, userData: any): Promise<any> {
        const { data, error } = await this.supabase
            .from('users')
            .insert(userData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteUser(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('users')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
