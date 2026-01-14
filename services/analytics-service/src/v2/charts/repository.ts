/**
 * Chart Data Repository
 * 
 * Queries analytics.metrics_monthly table to provide time series data
 * for various chart types.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChartType, ChartFilters, CHART_METRIC_MAPPING } from './types';

interface MetricRow {
    metric_type: string;
    time_value: string;
    value: number;
}

export class ChartRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Query monthly metrics for a specific chart type
     * Uses RPC function since PostgREST doesn't expose analytics schema by default
     */
    async getChartData(
        chartType: ChartType,
        filters: ChartFilters
    ): Promise<MetricRow[]> {
        const months = filters.months || 12;
        const metricTypes = CHART_METRIC_MAPPING[chartType];

        if (!metricTypes || metricTypes.length === 0) {
            throw new Error(`Invalid chart type: ${chartType}`);
        }

        // Calculate date range (last N months)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const { data, error } = await this.supabase
            .schema('analytics')
            .rpc('get_chart_metrics', {
                p_metric_types: metricTypes,
                p_start_date: startDate.toISOString().split('T')[0],
                p_end_date: endDate.toISOString().split('T')[0],
                p_recruiter_id: filters.recruiter_id || null,
                p_company_id: filters.company_id || null
            });

        console.log('[ChartRepository] RPC Response:', {
            chartType,
            metricTypes,
            dataLength: data?.length || 0,
            sampleData: data?.slice(0, 3),
            error
        });

        if (error) {
            throw new Error(`Failed to query chart data: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get time range for chart query
     */
    getTimeRange(months: number): { start: Date; end: Date } {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        return { start: startDate, end: endDate };
    }
}
