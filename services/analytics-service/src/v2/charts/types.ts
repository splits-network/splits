/**
 * Chart Types and Data Structures for Analytics Visualization
 * 
 * Provides Chart.js-compatible data structures for frontend visualization.
 * Supports multiple chart types with consistent formatting.
 */

export type ChartType =
    | 'recruiter-activity'
    | 'application-trends'
    | 'placement-trends'
    | 'placement-stacked'
    | 'role-trends'
    | 'candidate-trends'
    | 'time-to-hire-trends'
    | 'submission-trends'
    | 'submission-heatmap'
    | 'earnings-trends'
    | 'time-to-place-trends'
    | 'commission-breakdown'
    | 'recruitment-funnel'
    | 'reputation-radar'
    | 'hiring-pipeline'
    | 'company-health-radar';

/**
 * Chart.js compatible dataset structure
 */
export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
}

/**
 * Chart.js compatible data structure
 */
export interface ChartData {
    labels: string[]; // X-axis labels (e.g., month names)
    datasets: ChartDataset[];
}

/**
 * Chart response wrapper
 */
export interface ChartResponse {
    chart_type: ChartType;
    time_range: {
        start: string; // ISO date
        end: string;   // ISO date
    };
    data: ChartData;
}

/**
 * Chart query filters
 */
export interface ChartFilters {
    months?: number;        // Number of months to query (default: 12)
    recruiter_id?: string;  // Filter by recruiter
    company_id?: string;    // Filter by company
    scope?: 'recruiter' | 'candidate' | 'company' | 'platform'; // Scope for role-based filtering
}

/**
 * Metric types for different chart types
 */
export const CHART_METRIC_MAPPING: Record<ChartType, string[]> = {
    'recruiter-activity': ['applications_submitted', 'placements_completed'],
    'application-trends': ['applications_submitted'],
    'placement-trends': ['placements_completed'],
    'placement-stacked': ['placements_by_state'],
    'role-trends': ['roles_created', 'roles_active'],
    'candidate-trends': ['applications_submitted'],
    'time-to-hire-trends': ['avg_time_to_hire'],
    'submission-trends': ['recruiter_submissions'],
    'submission-heatmap': ['daily_submissions'],
    'earnings-trends': ['recruiter_earnings'],
    'time-to-place-trends': ['recruiter_avg_time_to_place'],
    'commission-breakdown': ['commission_by_role'],
    'recruitment-funnel': ['funnel_stage_counts'],
    'reputation-radar': ['reputation_metrics'],
    'hiring-pipeline': ['hiring_stage_counts'],
    'company-health-radar': ['company_health_metrics'],
};
