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
     * Get formatted chart data for a specific chart type.
     * Falls back to real-time queries when pre-aggregated metrics are empty.
     */
    async getChartData(
        clerkUserId: string,
        chartType: ChartType,
        filters: ChartFilters
    ): Promise<ChartResponse> {
        // Resolve access context
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Apply access-based filters (async — resolves org→company when needed)
        const effectiveFilters = await this.applyAccessFilters(context, filters);
        const months = effectiveFilters.months || 12;
        const timeRange = this.repository.getTimeRange(months);

        let chartData: ChartData;

        try {
            // Try pre-aggregated metrics first
            const rows = await this.repository.getChartData(chartType, effectiveFilters);

            if (rows && rows.length > 0) {
                chartData = this.formatChartData(chartType, rows, months);
            } else {
                // Fallback: compute from source tables
                chartData = await this.computeChartDataRealtime(
                    chartType, effectiveFilters, months, timeRange
                );
            }
        } catch {
            // RPC failed – fall back to real-time
            chartData = await this.computeChartDataRealtime(
                chartType, effectiveFilters, months, timeRange
            );
        }

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
     * Compute chart data in real-time from source tables.
     * Used when pre-aggregated analytics.metrics_monthly is empty.
     */
    private async computeChartDataRealtime(
        chartType: ChartType,
        filters: ChartFilters,
        months: number,
        timeRange: { start: Date; end: Date }
    ): Promise<ChartData> {
        const labels = this.generateMonthLabels(months);

        switch (chartType) {
            case 'submission-trends':
            case 'application-trends':
            case 'recruiter-activity': {
                return this.computeSubmissionTrends(labels, timeRange, filters);
            }
            case 'placement-trends': {
                return this.computePlacementTrends(labels, timeRange, filters);
            }
            case 'placement-stacked': {
                return this.computePlacementStacked(labels, timeRange, filters);
            }
            case 'submission-heatmap': {
                return this.computeSubmissionHeatmap(timeRange, filters);
            }
            case 'earnings-trends': {
                return this.computeEarningsTrends(labels, timeRange, filters);
            }
            case 'time-to-place-trends':
            case 'time-to-hire-trends': {
                return this.computeTimeToPlaceTrends(labels, timeRange, filters);
            }
            case 'commission-breakdown': {
                return this.computeCommissionBreakdown(filters);
            }
            case 'recruitment-funnel': {
                return this.computeRecruitmentFunnel(filters);
            }
            case 'reputation-radar': {
                return this.computeReputationRadar(filters);
            }
            case 'hiring-pipeline': {
                return this.computeHiringPipeline(filters);
            }
            case 'company-health-radar': {
                return this.computeCompanyHealthRadar(filters);
            }
            default: {
                // Return empty chart for unhandled types
                return { labels, datasets: [{ label: 'Data', data: labels.map(() => 0), borderWidth: 2, fill: false }] };
            }
        }
    }

    private async computeSubmissionTrends(
        labels: string[],
        timeRange: { start: Date; end: Date },
        filters: ChartFilters
    ): Promise<ChartData> {
        // When company_id is set, fetch company job IDs first and push the
        // filter down to the DB (via .in('job_id', ...)) instead of fetching
        // ALL applications system-wide and filtering in JS.
        let companyJobIds: string[] | null = null;
        if (filters.company_id) {
            const { data: companyJobs } = await this.supabase
                .from('jobs').select('id').eq('company_id', filters.company_id);
            companyJobIds = companyJobs?.map(j => j.id) || [];
            if (companyJobIds.length === 0) {
                return { labels, datasets: [{ label: 'Submissions', data: labels.map(() => 0), backgroundColor: 'rgb(54, 162, 235)', borderColor: 'rgb(54, 162, 235)', borderWidth: 2, fill: false }] };
            }
        }

        let query = this.supabase
            .from('applications')
            .select('created_at')
            .gte('created_at', timeRange.start.toISOString())
            .lte('created_at', timeRange.end.toISOString());

        if (filters.recruiter_id) {
            query = query.eq('candidate_recruiter_id', filters.recruiter_id);
        }

        if (companyJobIds) {
            query = query.in('job_id', companyJobIds);
        }

        const { data: apps } = await query;

        const monthCounts = this.bucketByMonth(apps || [], 'created_at', labels);

        return {
            labels,
            datasets: [{
                label: 'Submissions',
                data: monthCounts,
                backgroundColor: 'rgb(54, 162, 235)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2,
                fill: false,
            }],
        };
    }

    private async computePlacementTrends(
        labels: string[],
        timeRange: { start: Date; end: Date },
        filters: ChartFilters
    ): Promise<ChartData> {
        let query = this.supabase
            .from('placements')
            .select('created_at, application_id, candidate_recruiter_id, company_recruiter_id, job_owner_recruiter_id, candidate_sourcer_recruiter_id, company_sourcer_recruiter_id')
            .gte('created_at', timeRange.start.toISOString())
            .lte('created_at', timeRange.end.toISOString())
            .in('state', ['hired', 'active', 'completed']);

        const { data: placements } = await query;

        // Filter to recruiter if scoped
        let filtered = placements || [];
        if (filters.recruiter_id) {
            filtered = filtered.filter(p =>
                p.candidate_recruiter_id === filters.recruiter_id ||
                p.company_recruiter_id === filters.recruiter_id ||
                p.job_owner_recruiter_id === filters.recruiter_id ||
                p.candidate_sourcer_recruiter_id === filters.recruiter_id ||
                p.company_sourcer_recruiter_id === filters.recruiter_id
            );
        }

        // Filter to company if scoped -- run the two lookups in parallel
        if (filters.company_id && filtered.length > 0) {
            const appIds = filtered.map(p => p.application_id).filter(Boolean);
            if (appIds.length > 0) {
                const [placementAppsResult, companyJobsResult] = await Promise.all([
                    this.supabase.from('applications').select('id, job_id').in('id', appIds),
                    this.supabase.from('jobs').select('id').eq('company_id', filters.company_id),
                ]);
                const jobIds = new Set(companyJobsResult.data?.map(j => j.id) || []);
                const validAppIds = new Set(
                    (placementAppsResult.data || []).filter(a => jobIds.has(a.job_id)).map(a => a.id)
                );
                filtered = filtered.filter(p => validAppIds.has(p.application_id));
            }
        }

        const monthCounts = this.bucketByMonth(filtered, 'created_at', labels);

        return {
            labels,
            datasets: [{
                label: 'Placements Completed',
                data: monthCounts,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                fill: false,
            }],
        };
    }

    /**
     * Placement stacked bar: placements bucketed by month with one dataset per state.
     */
    private async computePlacementStacked(
        labels: string[],
        timeRange: { start: Date; end: Date },
        filters: ChartFilters
    ): Promise<ChartData> {
        const states = ['hired', 'active', 'completed'];
        let query = this.supabase
            .from('placements')
            .select('created_at, state, candidate_recruiter_id, company_recruiter_id, job_owner_recruiter_id, candidate_sourcer_recruiter_id, company_sourcer_recruiter_id')
            .gte('created_at', timeRange.start.toISOString())
            .lte('created_at', timeRange.end.toISOString())
            .in('state', states);

        const { data: placements } = await query;

        let filtered = placements || [];
        if (filters.recruiter_id) {
            filtered = filtered.filter(p =>
                p.candidate_recruiter_id === filters.recruiter_id ||
                p.company_recruiter_id === filters.recruiter_id ||
                p.job_owner_recruiter_id === filters.recruiter_id ||
                p.candidate_sourcer_recruiter_id === filters.recruiter_id ||
                p.company_sourcer_recruiter_id === filters.recruiter_id
            );
        }

        const stateColors: Record<string, { bg: string; border: string }> = {
            hired: { bg: 'rgba(54, 162, 235, 0.7)', border: 'rgb(54, 162, 235)' },
            active: { bg: 'rgba(75, 192, 192, 0.7)', border: 'rgb(75, 192, 192)' },
            completed: { bg: 'rgba(153, 102, 255, 0.7)', border: 'rgb(153, 102, 255)' },
        };

        const stateLabels: Record<string, string> = {
            hired: 'Hired',
            active: 'Active',
            completed: 'Completed',
        };

        const datasets = states.map(state => {
            const stateFiltered = filtered.filter(p => p.state === state);
            const counts = this.bucketByMonth(stateFiltered, 'created_at', labels);
            const colors = stateColors[state] || { bg: 'rgba(128,128,128,0.7)', border: 'rgb(128,128,128)' };
            return {
                label: stateLabels[state] || state,
                data: counts,
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: 1,
                fill: false,
            };
        });

        return { labels, datasets };
    }

    /**
     * Submission heatmap: daily submission counts for the last N months.
     * labels = YYYY-MM-DD date strings, datasets[0].data = counts per day.
     */
    private async computeSubmissionHeatmap(
        timeRange: { start: Date; end: Date },
        filters: ChartFilters
    ): Promise<ChartData> {
        let query = this.supabase
            .from('applications')
            .select('created_at')
            .gte('created_at', timeRange.start.toISOString())
            .lte('created_at', timeRange.end.toISOString());

        if (filters.recruiter_id) {
            query = query.eq('candidate_recruiter_id', filters.recruiter_id);
        }

        const { data: apps } = await query;

        // Build a map of date → count
        const dayCounts = new Map<string, number>();
        for (const app of (apps || [])) {
            const day = new Date(app.created_at).toISOString().split('T')[0];
            dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        }

        // Generate all dates in range
        const labels: string[] = [];
        const data: number[] = [];
        const current = new Date(timeRange.start);
        current.setHours(0, 0, 0, 0);
        const end = new Date(timeRange.end);
        end.setHours(23, 59, 59, 999);

        while (current <= end) {
            const key = current.toISOString().split('T')[0];
            labels.push(key);
            data.push(dayCounts.get(key) || 0);
            current.setDate(current.getDate() + 1);
        }

        return {
            labels,
            datasets: [{
                label: 'Submissions',
                data,
                borderWidth: 0,
                fill: false,
            }],
        };
    }

    private async computeEarningsTrends(
        labels: string[],
        timeRange: { start: Date; end: Date },
        filters: ChartFilters
    ): Promise<ChartData> {
        if (!filters.recruiter_id) {
            return { labels, datasets: [{ label: 'Earnings ($)', data: labels.map(() => 0), borderWidth: 2, fill: false }] };
        }

        // Get placement_splits for this recruiter within time range
        const { data: splits } = await this.supabase
            .from('placement_splits')
            .select('split_amount, placement_id')
            .eq('recruiter_id', filters.recruiter_id);

        if (!splits || splits.length === 0) {
            return { labels, datasets: [{ label: 'Earnings ($)', data: labels.map(() => 0), borderWidth: 2, fill: false }] };
        }

        // Get placements within time range
        const placementIds = [...new Set(splits.map(s => s.placement_id))];
        const { data: placements } = await this.supabase
            .from('placements')
            .select('id, created_at')
            .in('id', placementIds)
            .gte('created_at', timeRange.start.toISOString())
            .lte('created_at', timeRange.end.toISOString());

        // Map placement_id → created_at
        const placementDates = new Map((placements || []).map(p => [p.id, p.created_at]));

        // Bucket earnings by month
        const monthEarnings = new Map<string, number>();
        labels.forEach(l => monthEarnings.set(l, 0));

        for (const split of splits) {
            const date = placementDates.get(split.placement_id);
            if (!date) continue;
            const monthKey = this.formatMonthLabel(new Date(date));
            if (monthEarnings.has(monthKey)) {
                monthEarnings.set(monthKey, (monthEarnings.get(monthKey) || 0) + Number(split.split_amount || 0));
            }
        }

        return {
            labels,
            datasets: [{
                label: 'Earnings ($)',
                data: labels.map(l => Math.round(monthEarnings.get(l) || 0)),
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                fill: false,
            }],
        };
    }

    private async computeTimeToPlaceTrends(
        labels: string[],
        timeRange: { start: Date; end: Date },
        filters: ChartFilters
    ): Promise<ChartData> {
        // Get placements with their application's created_at for time calculation
        let query = this.supabase
            .from('placements')
            .select('created_at, hired_at, application_id, candidate_recruiter_id, company_recruiter_id, job_owner_recruiter_id, candidate_sourcer_recruiter_id, company_sourcer_recruiter_id')
            .gte('created_at', timeRange.start.toISOString())
            .lte('created_at', timeRange.end.toISOString())
            .in('state', ['hired', 'active', 'completed']);

        const { data: placements } = await query;
        let filtered = placements || [];

        if (filters.recruiter_id) {
            filtered = filtered.filter(p =>
                p.candidate_recruiter_id === filters.recruiter_id ||
                p.company_recruiter_id === filters.recruiter_id ||
                p.job_owner_recruiter_id === filters.recruiter_id ||
                p.candidate_sourcer_recruiter_id === filters.recruiter_id ||
                p.company_sourcer_recruiter_id === filters.recruiter_id
            );
        }

        // Filter to company if scoped -- run the two lookups in parallel
        if (filters.company_id && filtered.length > 0) {
            const companyAppIds = filtered.map(p => p.application_id).filter(Boolean);
            if (companyAppIds.length > 0) {
                const [placementAppsResult, companyJobsResult] = await Promise.all([
                    this.supabase.from('applications').select('id, job_id').in('id', companyAppIds),
                    this.supabase.from('jobs').select('id').eq('company_id', filters.company_id),
                ]);
                const jobIds = new Set(companyJobsResult.data?.map(j => j.id) || []);
                const validAppIds = new Set(
                    (placementAppsResult.data || []).filter(a => jobIds.has(a.job_id)).map(a => a.id)
                );
                filtered = filtered.filter(p => validAppIds.has(p.application_id));
            }
        }

        if (filtered.length === 0) {
            return { labels, datasets: [{ label: 'Avg Days to Place', data: labels.map(() => 0), borderWidth: 2, fill: false }] };
        }

        // Get applications for time-to-hire calculation
        const appIds = filtered.map(p => p.application_id).filter(Boolean);
        const { data: apps } = await this.supabase
            .from('applications')
            .select('id, created_at')
            .in('id', appIds);

        const appDates = new Map((apps || []).map(a => [a.id, new Date(a.created_at)]));

        // Bucket by month with average calculation
        const monthData = new Map<string, { total: number; count: number }>();
        labels.forEach(l => monthData.set(l, { total: 0, count: 0 }));

        for (const p of filtered) {
            const appDate = appDates.get(p.application_id);
            const hireDate = new Date(p.hired_at || p.created_at);
            if (!appDate) continue;

            const days = Math.floor((hireDate.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
            const monthKey = this.formatMonthLabel(hireDate);
            const bucket = monthData.get(monthKey);
            if (bucket) {
                bucket.total += Math.max(0, days);
                bucket.count += 1;
            }
        }

        return {
            labels,
            datasets: [{
                label: 'Avg Days to Place',
                data: labels.map(l => {
                    const bucket = monthData.get(l);
                    return bucket && bucket.count > 0 ? Math.round(bucket.total / bucket.count) : 0;
                }),
                backgroundColor: 'rgb(255, 159, 64)',
                borderColor: 'rgb(255, 159, 64)',
                borderWidth: 2,
                fill: false,
            }],
        };
    }

    /**
     * Commission breakdown: doughnut data from placement_splits grouped by role.
     */
    private async computeCommissionBreakdown(filters: ChartFilters): Promise<ChartData> {
        if (!filters.recruiter_id) {
            return { labels: [], datasets: [{ label: 'Commission', data: [], borderWidth: 1 }] };
        }

        const { data: splits } = await this.supabase
            .from('placement_splits')
            .select('role, split_amount')
            .eq('recruiter_id', filters.recruiter_id);

        if (!splits || splits.length === 0) {
            return { labels: [], datasets: [{ label: 'Commission', data: [], borderWidth: 1 }] };
        }

        // Group by role
        const roleMap = new Map<string, number>();
        for (const s of splits) {
            const role = s.role || 'unknown';
            roleMap.set(role, (roleMap.get(role) || 0) + Number(s.split_amount || 0));
        }

        const roleLabels: Record<string, string> = {
            candidate_recruiter: 'Closer',
            company_recruiter: 'BD',
            job_owner: 'Specs Owner',
            candidate_sourcer: 'Discovery',
            company_sourcer: 'Company Sourcer',
        };

        const colors = [
            'rgb(75, 192, 192)',   // Teal
            'rgb(54, 162, 235)',   // Blue
            'rgb(255, 206, 86)',   // Yellow
            'rgb(153, 102, 255)', // Purple
            'rgb(255, 159, 64)',   // Orange
        ];

        const labels = Array.from(roleMap.keys()).map(r => roleLabels[r] || r);
        const data = Array.from(roleMap.values()).map(v => Math.round(v));

        return {
            labels,
            datasets: [{
                label: 'Commission',
                data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length),
                borderWidth: 1,
            }],
        };
    }

    /**
     * Recruitment funnel: application counts by stage for the recruiter.
     */
    private async computeRecruitmentFunnel(filters: ChartFilters): Promise<ChartData> {
        if (!filters.recruiter_id) {
            return { labels: [], datasets: [{ label: 'Funnel', data: [], borderWidth: 0 }] };
        }

        const stages = ['screen', 'submitted', 'interview', 'offer', 'hired'];
        const { data: apps } = await this.supabase
            .from('applications')
            .select('stage')
            .eq('candidate_recruiter_id', filters.recruiter_id)
            .in('stage', stages);

        const stageCounts = new Map<string, number>();
        stages.forEach(s => stageCounts.set(s, 0));

        if (apps) {
            for (const app of apps) {
                stageCounts.set(app.stage, (stageCounts.get(app.stage) || 0) + 1);
            }
        }

        const stageLabels: Record<string, string> = {
            screen: 'Screen',
            submitted: 'Submitted',
            interview: 'Interview',
            offer: 'Offer',
            hired: 'Hired',
        };

        const labels = stages.map(s => stageLabels[s] || s);
        const data = stages.map(s => stageCounts.get(s) || 0);

        return {
            labels,
            datasets: [{
                label: 'Candidates',
                data,
                backgroundColor: [
                    'rgb(54, 162, 235)',   // Blue
                    'rgb(75, 192, 192)',   // Teal
                    'rgb(255, 206, 86)',   // Yellow
                    'rgb(255, 159, 64)',   // Orange
                    'rgb(75, 192, 75)',    // Green
                ],
                borderWidth: 0,
            }],
        };
    }

    /**
     * Reputation radar: 5-axis data from recruiter_reputation normalized to 0-100.
     */
    private async computeReputationRadar(filters: ChartFilters): Promise<ChartData> {
        if (!filters.recruiter_id) {
            return { labels: ['Speed', 'Volume', 'Quality', 'Collaboration', 'Consistency'], datasets: [{ label: 'Reputation', data: [0, 0, 0, 0, 0], borderWidth: 2 }] };
        }

        const { data: rep } = await this.supabase
            .from('recruiter_reputation')
            .select('avg_response_time_hours, total_submissions, hire_rate, collaboration_rate, completion_rate')
            .eq('recruiter_id', filters.recruiter_id)
            .single();

        const labels = ['Speed', 'Volume', 'Quality', 'Collaboration', 'Consistency'];

        if (!rep) {
            return { labels, datasets: [{ label: 'Reputation', data: [0, 0, 0, 0, 0], borderWidth: 2 }] };
        }

        // Normalize speed: lower response time = higher score (invert, cap at 100)
        const speed = Math.max(0, Math.min(100, 100 - (Number(rep.avg_response_time_hours || 48) / 48 * 100)));
        // Volume: cap at 100, scale based on reasonable max (50 submissions)
        const volume = Math.min(100, (Number(rep.total_submissions || 0) / 50) * 100);
        // Quality: hire_rate is already 0-1, scale to 0-100
        const quality = Math.min(100, Number(rep.hire_rate || 0) * 100);
        // Collaboration: collaboration_rate is already 0-1
        const collaboration = Math.min(100, Number(rep.collaboration_rate || 0) * 100);
        // Consistency: completion_rate is already 0-1
        const consistency = Math.min(100, Number(rep.completion_rate || 0) * 100);

        return {
            labels,
            datasets: [{
                label: 'Your Profile',
                data: [
                    Math.round(speed),
                    Math.round(volume),
                    Math.round(quality),
                    Math.round(collaboration),
                    Math.round(consistency),
                ],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                fill: true,
            }],
        };
    }

    /**
     * Hiring pipeline: application counts by stage for the company.
     * Similar to recruitment funnel but filtered by company_id via jobs.
     */
    private async computeHiringPipeline(filters: ChartFilters): Promise<ChartData> {
        if (!filters.company_id) {
            return { labels: [], datasets: [{ label: 'Pipeline', data: [], borderWidth: 0 }] };
        }

        // Get company's job IDs
        const { data: companyJobs } = await this.supabase
            .from('jobs')
            .select('id')
            .eq('company_id', filters.company_id)
            .eq('status', 'active');

        const jobIds = companyJobs?.map(j => j.id) || [];
        if (jobIds.length === 0) {
            return { labels: [], datasets: [{ label: 'Pipeline', data: [], borderWidth: 0 }] };
        }

        const stages = ['screen', 'submitted', 'interview', 'offer', 'hired'];
        const { data: apps } = await this.supabase
            .from('applications')
            .select('stage')
            .in('job_id', jobIds)
            .in('stage', stages);

        const stageCounts = new Map<string, number>();
        stages.forEach(s => stageCounts.set(s, 0));

        if (apps) {
            for (const app of apps) {
                stageCounts.set(app.stage, (stageCounts.get(app.stage) || 0) + 1);
            }
        }

        const stageLabels: Record<string, string> = {
            screen: 'Screen',
            submitted: 'Submitted',
            interview: 'Interview',
            offer: 'Offer',
            hired: 'Hired',
        };

        const labels = stages.map(s => stageLabels[s] || s);
        const data = stages.map(s => stageCounts.get(s) || 0);

        return {
            labels,
            datasets: [{
                label: 'Candidates',
                data,
                backgroundColor: [
                    'rgb(54, 162, 235)',   // Blue
                    'rgb(75, 192, 192)',   // Teal
                    'rgb(255, 206, 86)',   // Yellow
                    'rgb(255, 159, 64)',   // Orange
                    'rgb(75, 192, 75)',    // Green
                ],
                borderWidth: 0,
            }],
        };
    }

    /**
     * Company health radar: 5-axis performance metrics normalized to 0-100.
     * Axes: Time-to-Fill, Candidate Flow, Interview Rate, Offer Rate, Fill Rate
     */
    private async computeCompanyHealthRadar(filters: ChartFilters): Promise<ChartData> {
        const labels = ['Time-to-Fill', 'Candidate Flow', 'Interview Rate', 'Offer Rate', 'Fill Rate'];
        const emptyData = { labels, datasets: [{ label: 'Health', data: [0, 0, 0, 0, 0], borderWidth: 2 }] };

        if (!filters.company_id) {
            return emptyData;
        }

        // Get company's active jobs with created_at
        const { data: companyJobs } = await this.supabase
            .from('jobs')
            .select('id, created_at, status')
            .eq('company_id', filters.company_id);

        if (!companyJobs || companyJobs.length === 0) {
            return emptyData;
        }

        const activeJobs = companyJobs.filter(j => j.status === 'active');
        const activeJobIdSet = new Set(activeJobs.map(j => j.id));
        const allJobIds = companyJobs.map(j => j.id);

        // Get all applications for company's jobs
        const { data: apps } = await this.supabase
            .from('applications')
            .select('id, stage, job_id, created_at')
            .in('job_id', allJobIds)
            .in('stage', ['screen', 'submitted', 'interview', 'offer', 'accepted', 'hired']);

        const allApps = apps || [];
        const totalApps = allApps.length;

        // 1. Time-to-Fill: inverse of avg days active jobs have been open (lower = better)
        // Cap at 90 days, score = 100 - (avgDays / 90 * 100)
        const now = new Date();
        const avgDaysOpen = activeJobs.length > 0
            ? activeJobs.reduce((sum, j) => {
                const days = (now.getTime() - new Date(j.created_at).getTime()) / (1000 * 60 * 60 * 24);
                return sum + days;
            }, 0) / activeJobs.length
            : 0;
        const timeToFill = Math.max(0, Math.min(100, Math.round(100 - (avgDaysOpen / 90 * 100))));

        // 2. Candidate Flow: avg applications per active role (cap at 20 = 100)
        // Use Set lookup (O(1)) instead of .some() linear scan (O(N*M))
        const appsPerRole = activeJobs.length > 0
            ? allApps.filter(a => activeJobIdSet.has(a.job_id)).length / activeJobs.length
            : 0;
        const candidateFlow = Math.min(100, Math.round((appsPerRole / 20) * 100));

        // 3. Interview Rate: % of applications reaching interview stage
        const interviewApps = allApps.filter(a => ['interview', 'offer', 'accepted', 'hired'].includes(a.stage));
        const interviewRate = totalApps > 0
            ? Math.min(100, Math.round((interviewApps.length / totalApps) * 100))
            : 0;

        // 4. Offer Rate: % of interviews reaching offer stage
        const offerApps = allApps.filter(a => ['offer', 'accepted', 'hired'].includes(a.stage));
        const offerRate = interviewApps.length > 0
            ? Math.min(100, Math.round((offerApps.length / interviewApps.length) * 100))
            : 0;

        // 5. Fill Rate: % of active roles with at least one hire
        const hiredApps = allApps.filter(a => a.stage === 'hired');
        const jobsWithHires = new Set(hiredApps.map(a => a.job_id));
        const fillRate = activeJobs.length > 0
            ? Math.min(100, Math.round((jobsWithHires.size / activeJobs.length) * 100))
            : 0;

        return {
            labels,
            datasets: [{
                label: 'Company Health',
                data: [timeToFill, candidateFlow, interviewRate, offerRate, fillRate],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2,
                fill: true,
            }],
        };
    }

    /**
     * Bucket records by month using a date field, aligned to the provided labels.
     */
    private bucketByMonth(records: any[], dateField: string, labels: string[]): number[] {
        const counts = new Map<string, number>();
        labels.forEach(l => counts.set(l, 0));

        for (const record of records) {
            const date = new Date(record[dateField]);
            const monthKey = this.formatMonthLabel(date);
            if (counts.has(monthKey)) {
                counts.set(monthKey, (counts.get(monthKey) || 0) + 1);
            }
        }

        return labels.map(l => counts.get(l) || 0);
    }

    /**
     * Apply access-based filtering.
     *
     * Maps the resolved AccessContext (from shared-access-context) onto
     * the chart filter fields so downstream queries are correctly scoped.
     *
     * AccessContext shape:
     *   recruiterId: string | null
     *   companyIds: string[]        (from memberships)
     *   roles: string[]             (e.g. ['recruiter'], ['company_admin'])
     *   isPlatformAdmin: boolean
     */
    private async applyAccessFilters(context: any, filters: ChartFilters): Promise<ChartFilters> {
        const effectiveFilters = { ...filters };

        // Platform admins can see everything -- no additional filters needed
        if (context.isPlatformAdmin) {
            return effectiveFilters;
        }

        // Recruiters can only see their own data
        if (context.recruiterId && !effectiveFilters.recruiter_id) {
            effectiveFilters.recruiter_id = context.recruiterId;
        }

        // Company users can only see their company data.
        // AccessContext exposes `companyIds` (from memberships.company_id).
        if (context.companyIds?.length > 0 && !effectiveFilters.company_id) {
            effectiveFilters.company_id = context.companyIds[0];
        }

        // Fallback: resolve company from organizationIds when companyIds is empty.
        // Many company users only have organization_id on their membership, not company_id.
        if (!effectiveFilters.company_id && context.organizationIds?.length > 0) {
            const { data: companies } = await this.supabase
                .from('companies')
                .select('id')
                .in('identity_organization_id', context.organizationIds)
                .limit(1);

            if (companies && companies.length > 0) {
                effectiveFilters.company_id = companies[0].id;
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

            return dataset;
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
