import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MarketplaceMetric, MetricFilters, MetricUpdate } from './types';

export interface CreateMetricInput {
    metric_date: string;
    active_recruiters: number;
    active_companies: number;
    active_jobs: number;
    total_applications: number;
    total_placements: number;
    avg_time_to_hire_days?: number | null;
    hire_rate?: number | null;
    placement_completion_rate?: number | null;
    avg_recruiter_response_time_hours?: number | null;
    total_fees_generated?: number | null;
    total_payouts_processed?: number | null;
    fraud_signals_raised?: number;
    disputes_opened?: number;
}

export class MarketplaceMetricsRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: any): MarketplaceMetric {
        return {
            id: row.id,
            metric_date: row.metric_date,
            active_recruiters: row.active_recruiters ?? 0,
            active_companies: row.active_companies ?? 0,
            active_jobs: row.active_jobs ?? 0,
            total_applications: row.total_applications ?? 0,
            total_placements: row.total_placements ?? 0,
            avg_time_to_hire_days: row.avg_time_to_hire_days != null ? Number(row.avg_time_to_hire_days) : null,
            hire_rate: row.hire_rate != null ? Number(row.hire_rate) : null,
            placement_completion_rate: row.placement_completion_rate != null ? Number(row.placement_completion_rate) : null,
            avg_recruiter_response_time_hours: row.avg_recruiter_response_time_hours != null ? Number(row.avg_recruiter_response_time_hours) : null,
            total_fees_generated: row.total_fees_generated != null ? Number(row.total_fees_generated) : null,
            total_payouts_processed: row.total_payouts_processed != null ? Number(row.total_payouts_processed) : null,
            fraud_signals_raised: row.fraud_signals_raised ?? 0,
            disputes_opened: row.disputes_opened ?? 0,
            created_at: row.created_at,
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
            .from('marketplace_metrics_daily')
            .insert({
                metric_date: input.metric_date,
                active_recruiters: input.active_recruiters,
                active_companies: input.active_companies,
                active_jobs: input.active_jobs,
                total_applications: input.total_applications,
                total_placements: input.total_placements,
                avg_time_to_hire_days: input.avg_time_to_hire_days ?? null,
                hire_rate: input.hire_rate ?? null,
                placement_completion_rate: input.placement_completion_rate ?? null,
                avg_recruiter_response_time_hours: input.avg_recruiter_response_time_hours ?? null,
                total_fees_generated: input.total_fees_generated ?? null,
                total_payouts_processed: input.total_payouts_processed ?? null,
                fraud_signals_raised: input.fraud_signals_raised ?? 0,
                disputes_opened: input.disputes_opened ?? 0,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async updateMetric(id: string, updates: MetricUpdate): Promise<MarketplaceMetric> {
        const payload: Record<string, any> = {};

        if (typeof updates.active_recruiters !== 'undefined') payload.active_recruiters = updates.active_recruiters;
        if (typeof updates.active_companies !== 'undefined') payload.active_companies = updates.active_companies;
        if (typeof updates.active_jobs !== 'undefined') payload.active_jobs = updates.active_jobs;
        if (typeof updates.total_applications !== 'undefined') payload.total_applications = updates.total_applications;
        if (typeof updates.total_placements !== 'undefined') payload.total_placements = updates.total_placements;
        if (typeof updates.avg_time_to_hire_days !== 'undefined') payload.avg_time_to_hire_days = updates.avg_time_to_hire_days;
        if (typeof updates.hire_rate !== 'undefined') payload.hire_rate = updates.hire_rate;
        if (typeof updates.placement_completion_rate !== 'undefined') payload.placement_completion_rate = updates.placement_completion_rate;
        if (typeof updates.avg_recruiter_response_time_hours !== 'undefined') payload.avg_recruiter_response_time_hours = updates.avg_recruiter_response_time_hours;
        if (typeof updates.total_fees_generated !== 'undefined') payload.total_fees_generated = updates.total_fees_generated;
        if (typeof updates.total_payouts_processed !== 'undefined') payload.total_payouts_processed = updates.total_payouts_processed;
        if (typeof updates.fraud_signals_raised !== 'undefined') payload.fraud_signals_raised = updates.fraud_signals_raised;
        if (typeof updates.disputes_opened !== 'undefined') payload.disputes_opened = updates.disputes_opened;

        const { data, error } = await this.supabase
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
            .from('marketplace_metrics_daily')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
