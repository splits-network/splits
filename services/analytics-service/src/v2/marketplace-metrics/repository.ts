import { SupabaseClient } from '@supabase/supabase-js';
import { MarketplaceMetric, MetricFilters, MetricUpdate, CreateMetricInput } from './types';
import { StandardListResponse, PaginationResponse } from '@splits-network/shared-types';

/**
 * Repository for marketplace metrics (analytics.marketplace_health_daily)
 * Provides CRUD operations and date range queries
 */
export class MarketplaceMetricsRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Map database row to domain model
     */
    private mapRow(row: any): MarketplaceMetric {
        return {
            id: row.id,
            date: row.metric_date,
            total_placements: row.total_placements || 0,
            total_applications: row.total_applications || 0,
            total_earnings_cents: Math.round((row.total_fees_generated || 0) * 100), // Convert dollars to cents
            avg_placement_duration_days: row.avg_time_to_hire_days || null,
            active_recruiters: row.active_recruiters || 0,
            active_jobs: row.active_jobs || 0,
            health_score: this.calculateHealthScore(row),
            created_at: row.created_at,
            updated_at: row.created_at, // marketplace_health_daily doesn't have updated_at
        };
    }

    /**
     * Calculate health score from various metrics
     * Returns 0-100 score based on activity and quality indicators
     */
    private calculateHealthScore(row: any): number {
        let score = 0;

        // Activity metrics (40 points)
        if (row.active_recruiters > 0) score += 10;
        if (row.active_jobs > 0) score += 10;
        if (row.total_applications > 0) score += 10;
        if (row.total_placements > 0) score += 10;

        // Quality metrics (40 points)
        const hireRate = row.hire_rate || 0;
        const completionRate = row.placement_completion_rate || 0;
        score += Math.min(20, hireRate / 5); // 0-20 points (max at 100% hire rate)
        score += Math.min(20, completionRate / 5); // 0-20 points (max at 100% completion)

        // Risk metrics (20 points - deductions)
        const fraudSignals = row.fraud_signals_raised || 0;
        const disputes = row.disputes_opened || 0;
        score -= Math.min(10, fraudSignals * 2); // -2 points per fraud signal
        score -= Math.min(10, disputes * 5); // -5 points per dispute

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * List marketplace metrics with filters and pagination
     */
    async list(filters: MetricFilters = {}): Promise<StandardListResponse<MarketplaceMetric>> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .schema('analytics')
            .from('marketplace_health_daily')
            .select('*', { count: 'exact' });

        // Date range filters
        if (filters.date_from) {
            query = query.gte('metric_date', filters.date_from);
        }
        if (filters.date_to) {
            query = query.lte('metric_date', filters.date_to);
        }

        // Sorting and pagination
        const { data, error, count } = await query
            .order('metric_date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        const pagination: PaginationResponse = {
            total: count || 0,
            page,
            limit,
            total_pages: Math.ceil((count || 0) / limit),
        };

        return {
            data: (data || []).map((row) => this.mapRow(row)),
            pagination,
        };
    }

    /**
     * Get single marketplace metric by ID
     */
    async findById(id: string): Promise<MarketplaceMetric | null> {
        const { data, error } = await this.supabase
            .schema('analytics')
            .from('marketplace_health_daily')
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

    /**
     * Create new marketplace metric
     */
    async create(input: CreateMetricInput): Promise<MarketplaceMetric> {
        const { data, error } = await this.supabase
            .schema('analytics')
            .from('marketplace_health_daily')
            .insert({
                metric_date: input.date,
                total_placements: input.total_placements,
                total_applications: input.total_applications,
                total_fees_generated: input.total_earnings_cents / 100, // Convert cents to dollars
                avg_time_to_hire_days: input.avg_placement_duration_days ?? null,
                active_recruiters: input.active_recruiters,
                active_jobs: input.active_jobs,
                // health_score is calculated, not stored directly
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    /**
     * Update existing marketplace metric
     */
    async update(id: string, updates: MetricUpdate): Promise<MarketplaceMetric> {
        const payload: Record<string, any> = {};

        if (typeof updates.total_placements !== 'undefined') {
            payload.total_placements = updates.total_placements;
        }
        if (typeof updates.total_applications !== 'undefined') {
            payload.total_applications = updates.total_applications;
        }
        if (typeof updates.total_earnings_cents !== 'undefined') {
            payload.total_fees_generated = updates.total_earnings_cents / 100;
        }
        if (typeof updates.avg_placement_duration_days !== 'undefined') {
            payload.avg_time_to_hire_days = updates.avg_placement_duration_days;
        }
        if (typeof updates.active_recruiters !== 'undefined') {
            payload.active_recruiters = updates.active_recruiters;
        }
        if (typeof updates.active_jobs !== 'undefined') {
            payload.active_jobs = updates.active_jobs;
        }

        const { data, error } = await this.supabase
            .schema('analytics')
            .from('marketplace_health_daily')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    /**
     * Delete marketplace metric
     */
    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('analytics')
            .from('marketplace_health_daily')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
