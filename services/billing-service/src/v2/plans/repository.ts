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
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.billing_interval) {
            query = query.eq('billing_interval', filters.billing_interval);
        }

        const sortBy = filters.sort_by || 'price_cents';
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
            status: 'archived',
        } as PlanUpdateInput);
    }
}
