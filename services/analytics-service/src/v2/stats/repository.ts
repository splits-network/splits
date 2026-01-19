import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import {
    CandidateStatsMetrics,
    CompanyStatsMetrics,
    PlatformStatsMetrics,
    RecruiterStatsMetrics,
    StatsRange,
} from './types';

const DEFAULT_CANDIDATE_STATS: CandidateStatsMetrics = {
    total_applications: 0,
    active_applications: 0,
    interviews_scheduled: 0,
    offers_received: 0,
};

const DEFAULT_RECRUITER_STATS: RecruiterStatsMetrics = {
    active_roles: 0,
    candidates_in_process: 0,
    offers_pending: 0,
    placements_this_month: 0,
    placements_this_year: 0,
    total_earnings_ytd: 0,
    pending_payouts: 0,
};

const DEFAULT_COMPANY_STATS: CompanyStatsMetrics = {
    active_roles: 0,
    total_applications: 0,
    interviews_scheduled: 0,
    offers_extended: 0,
    placements_this_month: 0,
    placements_this_year: 0,
    avg_time_to_hire_days: 0,
    active_recruiters: 0,
};

const DEFAULT_PLATFORM_STATS: PlatformStatsMetrics = {
    total_users: 0,
    active_recruiters: 0,
    active_companies: 0,
    active_jobs: 0,
    total_applications: 0,
    total_placements: 0,
    total_revenue: 0,
};

export class StatsRepository {
    constructor(private supabase: SupabaseClient) { }

    async getAccessContext(clerkUserId: string) {
        return resolveAccessContext(this.supabase, clerkUserId);
    }

    /**
     * Get recruiter stats from pre-aggregated metrics tables
     */
    async getRecruiterStats(
        recruiterId: string,
        range: StatsRange
    ): Promise<RecruiterStatsMetrics> {
        if (!recruiterId) {
            return DEFAULT_RECRUITER_STATS;
        }

        try {
            // Query daily metrics for recruiter within date range
            const { data: metrics, error } = await this.supabase
                .schema('analytics')
                .from('metrics_daily')
                .select('metric_type, value')
                .eq('dimension_recruiter_id', recruiterId)
                .gte('time_value', range.from.toISOString().split('T')[0])
                .lte('time_value', range.to.toISOString().split('T')[0]);

            if (error) throw error;

            // Aggregate metrics by type
            const stats = { ...DEFAULT_RECRUITER_STATS };

            if (metrics && metrics.length > 0) {
                // Sum values for each metric type
                const metricSums: Record<string, number> = {};

                for (const row of metrics) {
                    if (!metricSums[row.metric_type]) {
                        metricSums[row.metric_type] = 0;
                    }
                    metricSums[row.metric_type] += Number(row.value);
                }

                // Map metric types to stats fields
                stats.active_roles = metricSums['recruiter_active_roles'] || 0;
                stats.candidates_in_process = metricSums['recruiter_candidates_in_process'] || 0;
                stats.offers_pending = metricSums['recruiter_offers_pending'] || 0;
                stats.placements_this_month = metricSums['recruiter_placements_month'] || 0;
                stats.placements_this_year = metricSums['recruiter_placements_year'] || 0;
                stats.total_earnings_ytd = metricSums['recruiter_earnings_ytd'] || 0;
                stats.pending_payouts = metricSums['recruiter_pending_payouts'] || 0;
            }

            return stats;
        } catch (error) {
            console.error('Error fetching recruiter stats:', error);
            return DEFAULT_RECRUITER_STATS;
        }
    }

    /**
     * Get candidate stats from pre-aggregated metrics tables
     */
    async getCandidateStats(
        candidateId: string,
        range: StatsRange
    ): Promise<CandidateStatsMetrics> {
        if (!candidateId) {
            return DEFAULT_CANDIDATE_STATS;
        }

        try {
            // Get candidate's user_id from ats schema
            const { data: candidate } = await this.supabase
                .from('candidates')
                .select('user_id')
                .eq('id', candidateId)
                .single();

            if (!candidate) {
                return DEFAULT_CANDIDATE_STATS;
            }

            // Query daily metrics for candidate within date range
            const { data: metrics, error } = await this.supabase
                .schema('analytics')
                .from('metrics_daily')
                .select('metric_type, value')
                .eq('dimension_user_id', candidate.user_id)
                .gte('time_value', range.from.toISOString().split('T')[0])
                .lte('time_value', range.to.toISOString().split('T')[0]);

            if (error) throw error;

            // Aggregate metrics by type
            const stats = { ...DEFAULT_CANDIDATE_STATS };

            if (metrics && metrics.length > 0) {
                // Sum values for each metric type
                const metricSums: Record<string, number> = {};

                for (const row of metrics) {
                    if (!metricSums[row.metric_type]) {
                        metricSums[row.metric_type] = 0;
                    }
                    metricSums[row.metric_type] += Number(row.value);
                }

                // Map metric types to stats fields
                stats.total_applications = metricSums['candidate_total_applications'] || 0;
                stats.active_applications = metricSums['candidate_active_applications'] || 0;
                stats.interviews_scheduled = metricSums['candidate_interviews_scheduled'] || 0;
                stats.offers_received = metricSums['candidate_offers_received'] || 0;
            }

            return stats;
        } catch (error) {
            console.error('Error fetching candidate stats:', error);
            return DEFAULT_CANDIDATE_STATS;
        }
    }

    /**
     * Get company stats from pre-aggregated metrics tables
     * Falls back to real-time calculation if metrics are empty
     */
    async getCompanyStats(
        organizationIds: string[],
        range: StatsRange
    ): Promise<CompanyStatsMetrics> {
        if (!organizationIds || organizationIds.length === 0) {
            return DEFAULT_COMPANY_STATS;
        }

        try {
            // NOTE: metrics_daily table doesn't exist yet or is empty
            // Skip pre-aggregated query and go straight to real-time calculation
            
            // Fallback: Calculate real-time stats from public schema tables
            return await this.calculateCompanyStatsRealtime(organizationIds, range);
        } catch (error) {
            console.error('Error fetching company stats:', error);
            return DEFAULT_COMPANY_STATS;
        }
    }
    
    /**
     * Calculate company stats in real-time from ATS data
     * Used as fallback when pre-aggregated metrics aren't available
     */
    private async calculateCompanyStatsRealtime(
        organizationIds: string[],
        range: StatsRange
    ): Promise<CompanyStatsMetrics> {
        try {
            const stats = { ...DEFAULT_COMPANY_STATS };
            
            // First, get company IDs from organization IDs
            const { data: companies, error: companiesError } = await this.supabase
                .from('companies')
                .select('id')
                .in('identity_organization_id', organizationIds);
            
            if (companiesError) {
                console.error('[CompanyStats] Error fetching companies:', companiesError);
                return stats;
            }
            
            const companyIds = companies?.map(c => c.id) || [];
            
            if (companyIds.length === 0) {
                console.log('[CompanyStats] No companies found for organizations');
                return stats;
            }

            // Active roles
            const { count: activeRolesCount } = await this.supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .in('company_id', companyIds)
                .eq('status', 'active');
            stats.active_roles = activeRolesCount || 0;

            // Total applications (in visible stages)
            const { data: applications } = await this.supabase
                .from('applications')
                .select('id, stage, created_at, job_id')
                .in('stage', ['submitted', 'screen', 'interview', 'offer', 'accepted', 'hired'])
                .gte('created_at', range.from.toISOString())
                .lte('created_at', range.to.toISOString());

            if (applications && applications.length > 0) {
                
                // Filter to company jobs
                const { data: companyJobs } = await this.supabase
                    .from('jobs')
                    .select('id')
                    .in('company_id', companyIds);
                
                const companyJobIds = new Set(companyJobs?.map(j => j.id) || []);
                
                const companyApplications = applications.filter(app => companyJobIds.has(app.job_id));

                stats.total_applications = companyApplications.length;
                stats.interviews_scheduled = companyApplications.filter(a => a.stage === 'interview').length;
                stats.offers_extended = companyApplications.filter(a => a.stage === 'offer' || a.stage === 'accepted').length;
            }

            // Placements
            const { data: placements } = await this.supabase
                .from('placements')
                .select('id, created_at, application_id')
                .gte('created_at', range.from.toISOString())
                .lte('created_at', range.to.toISOString());

            if (placements && placements.length > 0) {
                
                // Filter to company placements
                const { data: companyJobs } = await this.supabase
                    .from('jobs')
                    .select('id')
                    .in('company_id', companyIds);
                
                const companyJobIds = new Set(companyJobs?.map(j => j.id) || []);
                
                const { data: placementApplications } = await this.supabase
                    .from('applications')
                    .select('id, job_id')
                    .in('id', placements.map(p => p.application_id));
                
                const companyPlacements = placements.filter(p => {
                    const app = placementApplications?.find(a => a.id === p.application_id);
                    return app && companyJobIds.has(app.job_id);
                });

                stats.placements_this_year = companyPlacements.length;

                // This month
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                stats.placements_this_month = companyPlacements.filter(
                    p => new Date(p.created_at) >= monthStart
                ).length;
                
            }

            // Active recruiters (unique recruiters with assignments)
            const { data: assignments } = await this.supabase
                .from('role_assignments')
                .select('recruiter_id, job_id');

            if (assignments && assignments.length > 0) {
                const { data: companyJobs } = await this.supabase
                    .from('jobs')
                    .select('id')
                    .in('company_id', companyIds);
                
                const companyJobIds = new Set(companyJobs?.map(j => j.id) || []);
                const activeRecruiterIds = new Set(
                    assignments
                        .filter(a => companyJobIds.has(a.job_id))
                        .map(a => a.recruiter_id)
                );
                stats.active_recruiters = activeRecruiterIds.size;
            }

            // Average time to hire - skip for now (requires complex calculation)
            stats.avg_time_to_hire_days = 0;

            return stats;
        } catch (error) {
            console.error('Error calculating real-time company stats:', error);
            return DEFAULT_COMPANY_STATS;
        }
    }

    /**
     * Get platform-wide stats from marketplace health table
     */
    async getPlatformStats(range: StatsRange): Promise<PlatformStatsMetrics> {
        try {
            // Query marketplace health daily table for date range (public schema)
            const { data: healthMetrics, error } = await this.supabase
                .from('marketplace_metrics_daily')
                .select('*')
                .gte('metric_date', range.from.toISOString().split('T')[0])
                .lte('metric_date', range.to.toISOString().split('T')[0])
                .order('metric_date', { ascending: false });

            if (error) throw error;

            if (!healthMetrics || healthMetrics.length === 0) {
                return DEFAULT_PLATFORM_STATS;
            }

            // Get latest metrics (most recent date)
            const latest = healthMetrics[0];

            return {
                total_users: 0, // This requires identity schema access
                active_recruiters: latest.active_recruiters || 0,
                active_companies: latest.active_companies || 0,
                active_jobs: latest.active_jobs || 0,
                total_applications: latest.total_applications || 0,
                total_placements: latest.total_placements || 0,
                total_revenue: Number(latest.total_fees_generated || 0),
            };
        } catch (error) {
            console.error('Error fetching platform stats:', error);
            return DEFAULT_PLATFORM_STATS;
        }
    }
}
