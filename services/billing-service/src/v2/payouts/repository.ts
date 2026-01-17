import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Payout, PayoutCreateInput, PayoutListFilters, PayoutUpdateInput } from './types';

interface RepositoryListResult<T> {
    data: T[];
    total: number;
}

export class PayoutRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async listPayouts(filters: PayoutListFilters = {}): Promise<RepositoryListResult<Payout>> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase

            .from('payouts')
            .select('*', { count: 'exact' });

        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters.placement_id) {
            query = query.eq('placement_id', filters.placement_id);
        }
        if (filters.role) {
            query = query.eq('role', filters.role);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const sortBy = filters.sort_by || 'created_at';
        const ascending = (filters.sort_order || 'desc').toLowerCase() === 'asc';
        query = query.order(sortBy, { ascending });

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findPayout(id: string): Promise<Payout | null> {
        const { data, error } = await this.supabase

            .from('payouts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createPayout(payload: PayoutCreateInput): Promise<Payout> {
        const { data, error } = await this.supabase

            .from('payouts')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async updatePayout(id: string, updates: PayoutUpdateInput): Promise<Payout> {
        const { data, error } = await this.supabase

            .from('payouts')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }
}
