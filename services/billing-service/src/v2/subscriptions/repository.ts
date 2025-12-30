import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    Subscription,
    SubscriptionCreateInput,
    SubscriptionListFilters,
    SubscriptionUpdateInput,
} from './types';

interface RepositoryListResult<T> {
    data: T[];
    total: number;
}

export class SubscriptionRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async listSubscriptions(filters: SubscriptionListFilters = {}): Promise<RepositoryListResult<Subscription>> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .schema('billing')
            .from('subscriptions')
            .select('*', { count: 'exact' });

        if (filters.user_id) {
            query = query.eq('user_id', filters.user_id);
        }
        if (filters.plan_id) {
            query = query.eq('plan_id', filters.plan_id);
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

    async findSubscription(id: string): Promise<Subscription | null> {
        const { data, error } = await this.supabase
            .schema('billing')
            .from('subscriptions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createSubscription(payload: SubscriptionCreateInput): Promise<Subscription> {
        const { data, error } = await this.supabase
            .schema('billing')
            .from('subscriptions')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async updateSubscription(id: string, updates: SubscriptionUpdateInput): Promise<Subscription> {
        const { data, error } = await this.supabase
            .schema('billing')
            .from('subscriptions')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }
}
