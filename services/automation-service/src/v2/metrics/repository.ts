import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MarketplaceMetric, MetricFilters, MetricUpdate } from './types';

export interface CreateMetricInput {
    date: string;
    total_placements: number;
    total_applications: number;
    total_earnings_cents: number;
    avg_placement_duration_days?: number | null;
    active_recruiters: number;
    active_jobs: number;
    health_score: number;
}

export class MarketplaceMetricsRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: any): MarketplaceMetric {
        return {
            id: row.id,
            date: row.metric_date,
            total_placements: row.total_placements,
            total_applications: row.total_applications,
            total_earnings_cents: row.total_earnings_cents,
            avg_placement_duration_days: row.avg_placement_duration_days,
            active_recruiters: row.active_recruiters,
            active_jobs: row.active_jobs,
            health_score: row.health_score,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async findMetrics(filters: MetricFilters = {}): Promise<{
        data: MarketplaceMetric[];
        total: number;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .schema('platform')
            .from('marketplace_metrics_daily')
            .select('*', { count: 'exact' });

        if (filters.date_from) {
            query = query.gte('metric_date', filters.date_from);
        }
        if (filters.date_to) {
            query = query.lte('metric_date', filters.date_to);
        }

        const { data, error, count } = await query
            .order('metric_date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            data: (data || []).map((row) => this.mapRow(row)),
            total: count || 0,
        };
    }

    async findMetric(id: string): Promise<MarketplaceMetric | null> {
        const { data, error } = await this.supabase
            .schema('platform')
            .from('marketplace_metrics_daily')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data ? this.mapRow(data) : null;
    }

    async createMetric(input: CreateMetricInput): Promise<MarketplaceMetric> {
        const { data, error } = await this.supabase
            .schema('platform')
            .from('marketplace_metrics_daily')
            .insert({
                metric_date: input.date,
                total_placements: input.total_placements,
                total_applications: input.total_applications,
                total_earnings_cents: input.total_earnings_cents,
                avg_placement_duration_days: input.avg_placement_duration_days ?? null,
                active_recruiters: input.active_recruiters,
                active_jobs: input.active_jobs,
                health_score: input.health_score,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async updateMetric(id: string, updates: MetricUpdate): Promise<MarketplaceMetric> {
        const payload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof updates.total_placements !== 'undefined') {
            payload.total_placements = updates.total_placements;
        }
        if (typeof updates.total_applications !== 'undefined') {
            payload.total_applications = updates.total_applications;
        }
        if (typeof updates.total_earnings_cents !== 'undefined') {
            payload.total_earnings_cents = updates.total_earnings_cents;
        }
        if (typeof updates.avg_placement_duration_days !== 'undefined') {
            payload.avg_placement_duration_days = updates.avg_placement_duration_days;
        }
        if (typeof updates.active_recruiters !== 'undefined') {
            payload.active_recruiters = updates.active_recruiters;
        }
        if (typeof updates.active_jobs !== 'undefined') {
            payload.active_jobs = updates.active_jobs;
        }
        if (typeof updates.health_score !== 'undefined') {
            payload.health_score = updates.health_score;
        }

        const { data, error } = await this.supabase
            .schema('platform')
            .from('marketplace_metrics_daily')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async deleteMetric(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('platform')
            .from('marketplace_metrics_daily')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
