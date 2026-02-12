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
    pipeline_value: 0,
    submissions_mtd: 0,
    stale_candidates: 0,
    pending_reviews: 0,
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
     * Get recruiter stats - falls back to real-time calculation
     * from source tables when pre-aggregated metrics are empty.
     */
    async getRecruiterStats(
        recruiterId: string,
        range: StatsRange
    ): Promise<RecruiterStatsMetrics> {
        if (!recruiterId) {
            return DEFAULT_RECRUITER_STATS;
        }

        try {
            // Pre-aggregated metrics_daily table may be empty;
            // go straight to real-time calculation (same pattern as company stats).
            return await this.calculateRecruiterStatsRealtime(recruiterId, range);
        } catch (error) {
            console.error('Error fetching recruiter stats:', error);
            return DEFAULT_RECRUITER_STATS;
        }
    }

    /**
     * Calculate recruiter stats in real-time from source tables.
     * Queries role_assignments, applications, placements, placement_splits, and payouts.
     */
    private async calculateRecruiterStatsRealtime(
        recruiterId: string,
        range: StatsRange
    ): Promise<RecruiterStatsMetrics> {
        try {
            const stats = { ...DEFAULT_RECRUITER_STATS };

            // 1. Active roles: jobs assigned to this recruiter that are active
            const { data: assignments } = await this.supabase
                .from('role_assignments')
                .select('job_id')
                .eq('recruiter_id', recruiterId);

            if (assignments && assignments.length > 0) {
                const jobIds = assignments.map(a => a.job_id);
                const { count: activeCount } = await this.supabase
                    .from('jobs')
                    .select('*', { count: 'exact', head: true })
                    .in('id', jobIds)
                    .eq('status', 'active');
                stats.active_roles = activeCount || 0;
            }

            // 2. Pipeline: applications where this recruiter is the candidate recruiter
            const activeStages = ['submitted', 'company_review', 'interview', 'offer', 'screen'];
            const { data: pipelineApps } = await this.supabase
                .from('applications')
                .select('id, stage')
                .eq('candidate_recruiter_id', recruiterId)
                .in('stage', activeStages);

            if (pipelineApps) {
                stats.candidates_in_process = pipelineApps.length;
                stats.offers_pending = pipelineApps.filter(a => a.stage === 'offer').length;
            }

            // 3. Placements where this recruiter is involved (any role)
            const { data: placements } = await this.supabase
                .from('placements')
                .select('id, created_at, placement_fee, state')
                .or(
                    `candidate_recruiter_id.eq.${recruiterId},` +
                    `company_recruiter_id.eq.${recruiterId},` +
                    `job_owner_recruiter_id.eq.${recruiterId},` +
                    `candidate_sourcer_recruiter_id.eq.${recruiterId},` +
                    `company_sourcer_recruiter_id.eq.${recruiterId}`
                )
                .in('state', ['hired', 'active', 'completed']);

            if (placements && placements.length > 0) {
                const now = new Date();
                const yearStart = new Date(now.getFullYear(), 0, 1);
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

                const ytdPlacements = placements.filter(
                    p => new Date(p.created_at) >= yearStart
                );
                stats.placements_this_year = ytdPlacements.length;
                stats.placements_this_month = ytdPlacements.filter(
                    p => new Date(p.created_at) >= monthStart
                ).length;
            }

            // 4. Earnings from placement_splits
            const { data: splits } = await this.supabase
                .from('placement_splits')
                .select('split_amount, placement_id')
                .eq('recruiter_id', recruiterId);

            if (splits && splits.length > 0) {
                // Get YTD placements to filter splits
                const now = new Date();
                const yearStart = new Date(now.getFullYear(), 0, 1);
                const ytdPlacementIds = (placements || [])
                    .filter(p => new Date(p.created_at) >= yearStart)
                    .map(p => p.id);
                const ytdSplitIds = new Set(ytdPlacementIds);

                stats.total_earnings_ytd = splits
                    .filter(s => ytdSplitIds.has(s.placement_id))
                    .reduce((sum, s) => sum + Number(s.split_amount || 0), 0);
            }

            // 5. Pending payouts
            const { data: payouts } = await this.supabase
                .from('payouts')
                .select('payout_amount, status')
                .eq('recruiter_id', recruiterId)
                .in('status', ['pending', 'on_hold']);

            if (payouts) {
                stats.pending_payouts = payouts.reduce(
                    (sum, p) => sum + Number(p.payout_amount || 0), 0
                );
            }

            // 6. Pipeline value: estimated fees from late-stage candidates
            const lateStages = ['interview', 'offer'];
            const { data: lateStageApps } = await this.supabase
                .from('applications')
                .select('job_id')
                .eq('candidate_recruiter_id', recruiterId)
                .in('stage', lateStages);

            if (lateStageApps && lateStageApps.length > 0) {
                const lateJobIds = [...new Set(lateStageApps.map(a => a.job_id))];
                const { data: lateJobs } = await this.supabase
                    .from('jobs')
                    .select('id, fee_percentage, salary_min')
                    .in('id', lateJobIds);

                if (lateJobs) {
                    // Count apps per job for weighting
                    const appCountByJob = new Map<string, number>();
                    for (const app of lateStageApps) {
                        appCountByJob.set(app.job_id, (appCountByJob.get(app.job_id) || 0) + 1);
                    }
                    stats.pipeline_value = lateJobs.reduce((sum, job) => {
                        const fee = Number(job.fee_percentage || 0) / 100;
                        const salary = Number(job.salary_min || 0);
                        const count = appCountByJob.get(job.id) || 1;
                        return sum + (fee * salary * count);
                    }, 0);
                }
            }

            // 7. Submissions this month (MTD)
            const now2 = new Date();
            const monthStart = new Date(now2.getFullYear(), now2.getMonth(), 1);
            const { count: mtdCount } = await this.supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_recruiter_id', recruiterId)
                .gte('created_at', monthStart.toISOString());

            stats.submissions_mtd = mtdCount || 0;

            // 8. Stale candidates: active pipeline apps not updated in 14+ days
            const staleCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
            const { count: staleCount } = await this.supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_recruiter_id', recruiterId)
                .in('stage', activeStages)
                .lt('updated_at', staleCutoff.toISOString());

            stats.stale_candidates = staleCount || 0;

            // 9. Pending reviews: proposals/submissions needing recruiter action
            const { count: pendingCount } = await this.supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_recruiter_id', recruiterId)
                .in('stage', ['company_review']);

            stats.pending_reviews = pendingCount || 0;

            return stats;
        } catch (error) {
            console.error('Error calculating real-time recruiter stats:', error);
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
