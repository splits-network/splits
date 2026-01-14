/**
 * Chart Service V2
 * 
 * Business logic for chart data formatting and access control.
 * Transforms database metrics into Chart.js-compatible format.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '../shared/access';
import { ChartRepository } from './repository';
import {
    ChartType,
    ChartFilters,
    ChartData,
    ChartDataset,
    ChartResponse,
    CHART_METRIC_MAPPING,
} from './types';

export class ChartServiceV2 {
    constructor(
        private repository: ChartRepository,
        private supabase: SupabaseClient
    ) { }

    /**
     * Get formatted chart data for a specific chart type
     */
    async getChartData(
        clerkUserId: string,
        chartType: ChartType,
        filters: ChartFilters
    ): Promise<ChartResponse> {
        // Resolve access context
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Apply access-based filters
        const effectiveFilters = this.applyAccessFilters(context, filters);

        // Query metrics
        const rows = await this.repository.getChartData(chartType, effectiveFilters);

        // Format for Chart.js
        const chartData = this.formatChartData(chartType, rows, effectiveFilters.months || 12);

        // Get time range
        const timeRange = this.repository.getTimeRange(effectiveFilters.months || 12);

        return {
            chart_type: chartType,
            time_range: {
                start: timeRange.start.toISOString().split('T')[0],
                end: timeRange.end.toISOString().split('T')[0],
            },
            data: chartData,
        };
    }

    /**
     * Apply access-based filtering
     */
    private applyAccessFilters(context: any, filters: ChartFilters): ChartFilters {
        const effectiveFilters = { ...filters };

        // Recruiters can only see their own data
        if (context.role === 'recruiter' && context.userId) {
            effectiveFilters.recruiter_id = context.userId;
        }

        // Company users can only see their company data
        if (context.isCompanyUser && context.accessibleCompanyIds?.length > 0) {
            // Use first accessible company if not specified
            if (!effectiveFilters.company_id) {
                effectiveFilters.company_id = context.accessibleCompanyIds[0];
            }
        }

        return effectiveFilters;
    }

    /**
     * Format raw metric rows into Chart.js data structure
     */
    private formatChartData(
        chartType: ChartType,
        rows: any[],
        months: number
    ): ChartData {
        const metricTypes = CHART_METRIC_MAPPING[chartType];

        console.log('[ChartService] formatChartData called:', {
            chartType,
            metricTypes,
            rowsCount: rows.length,
            sampleRows: rows.slice(0, 3)
        });

        // Generate all month labels
        const labels = this.generateMonthLabels(months);

        // Group data by metric type
        const dataByMetric: Record<string, Map<string, number>> = {};
        metricTypes.forEach((metricType) => {
            dataByMetric[metricType] = new Map();
        });

        // Populate data from rows
        rows.forEach((row) => {
            const monthKey = this.formatMonthLabel(new Date(row.time_value));
            if (dataByMetric[row.metric_type]) {
                dataByMetric[row.metric_type].set(monthKey, row.value);
            }
        });

        // Create datasets
        const datasets: ChartDataset[] = metricTypes.map((metricType, index) => {
            const data = labels.map((label) => dataByMetric[metricType]?.get(label) || 0);

            const dataset = {
                label: this.formatMetricLabel(metricType),
                data,
                backgroundColor: this.getColorForMetric(index),
                borderColor: this.getColorForMetric(index),
                borderWidth: 2,
                fill: false,
            };

            console.log('[ChartService] Dataset created:', {
                metricType,
                label: dataset.label,
                dataPoints: dataset.data.length,
                sampleData: dataset.data.slice(0, 3),
                totalSum: dataset.data.reduce((a, b) => a + b, 0)
            });

            return dataset;
        });

        console.log('[ChartService] Final chart data:', {
            labelsCount: labels.length,
            datasetsCount: datasets.length,
            labels: labels.slice(0, 3)
        });

        return { labels, datasets };
    }

    /**
     * Generate month labels for the last N months
     */
    private generateMonthLabels(months: number): string[] {
        const labels: string[] = [];
        const date = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const targetDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
            labels.push(this.formatMonthLabel(targetDate));
        }

        return labels;
    }

    /**
     * Format date as "MMM YYYY" (e.g., "Jan 2025")
     */
    private formatMonthLabel(date: Date): string {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    /**
     * Convert metric_type to human-readable label
     */
    private formatMetricLabel(metricType: string): string {
        return metricType
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get color for dataset (Chart.js colors)
     */
    private getColorForMetric(index: number): string {
        const colors = [
            'rgb(75, 192, 192)',   // Teal
            'rgb(255, 99, 132)',   // Red
            'rgb(54, 162, 235)',   // Blue
            'rgb(255, 206, 86)',   // Yellow
            'rgb(153, 102, 255)',  // Purple
            'rgb(255, 159, 64)',   // Orange
        ];
        return colors[index % colors.length];
    }
}
