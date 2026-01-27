import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Plan, PlanCreateInput, PlanListFilters, PlanUpdateInput } from './types';

interface RepositoryListResult<T> {
    data: T[];
    total: number;
}

export class PlanRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async listPlans(filters: PlanListFilters = {}): Promise<RepositoryListResult<Plan>> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            
            .from('plans')
            .select('*', { count: 'exact' });

        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }
        // Map 'status' filter to 'is_active' boolean column
        if (filters.status) {
            const isActive = filters.status === 'active';
            query = query.eq('is_active', isActive);
        }
        if (filters.tier) {
            query = query.eq('tier', filters.tier);
        }

        const sortBy = filters.sort_by || 'price_monthly';
        const sortOrder = (filters.sort_order || 'asc').toLowerCase() === 'asc';
        query = query.order(sortBy, { ascending: sortOrder });

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findPlan(id: string): Promise<Plan | null> {
        const { data, error } = await this.supabase
            
            .from('plans')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createPlan(payload: PlanCreateInput): Promise<Plan> {
        const { data, error } = await this.supabase
            
            .from('plans')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async updatePlan(id: string, updates: PlanUpdateInput): Promise<Plan> {
        const { data, error } = await this.supabase
            
            .from('plans')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async archivePlan(id: string): Promise<Plan> {
        return this.updatePlan(id, {
            is_active: false,
        } as PlanUpdateInput);
    }
}
