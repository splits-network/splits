import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import {
    CandidateStatsMetrics,
    CompanyStatsMetrics,
    PlatformStatsMetrics,
    PlatformActivityEvent,
    TopPerformer,
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
    stale_roles: 0,
    applications_mtd: 0,
};

const DEFAULT_PLATFORM_STATS: PlatformStatsMetrics = {
    total_users: 0,
    total_recruiters: 0,
    total_companies: 0,
    total_candidates: 0,
    total_jobs: 0,
    active_recruiters: 0,
    active_companies: 0,
    active_jobs: 0,
    total_applications: 0,
    total_placements: 0,
    total_revenue: 0,
    new_signups_mtd: 0,
    placements_this_month: 0,
    pending_payouts_count: 0,
    pending_payouts_amount: 0,
    active_fraud_signals: 0,
    active_escrow_holds: 0,
    active_escrow_amount: 0,
    pending_recruiter_approvals: 0,
    total_payouts_processed_ytd: 0,
    avg_fee_percentage: 0,
    avg_placement_value: 0,
    active_subscriptions: 0,
    trialing_subscriptions: 0,
    past_due_subscriptions: 0,
    canceled_subscriptions: 0,
    recruiter_statuses: { active: 0, pending: 0, suspended: 0 },
    job_statuses: { active: 0, closed: 0, expired: 0, draft: 0 },
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
     * Calculate company stats in real-time from ATS data.
     * Used as fallback when pre-aggregated metrics aren't available.
     *
     * Strategy: fetch company jobs ONCE up front, then run independent
     * queries in parallel via Promise.all to minimize round-trips.
     *
     * Key design decisions:
     * - `placements_this_year` and `placements_this_month` always use
     *   calendar-year / calendar-month boundaries, not the caller's `range`.
     *   This ensures the stat cards show YTD numbers regardless of whether
     *   the dashboard passes range=ytd, range=30d, etc.
     * - `total_applications`, `interviews_scheduled`, `offers_extended` are
     *   scoped to the caller's range (so the main KPI strip reflects the
     *   selected time window).
     * - Application queries push `job_id IN (...)` to Supabase to avoid
     *   fetching platform-wide rows and filtering client-side.
     */
    private async calculateCompanyStatsRealtime(
        organizationIds: string[],
        range: StatsRange
    ): Promise<CompanyStatsMetrics> {
        try {
            const stats = { ...DEFAULT_COMPANY_STATS };

            // ── Step 0: Resolve organization IDs to company IDs ──
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

            // ── Step 1: Fetch ALL company jobs ONCE (reused everywhere) ──
            const { data: allCompanyJobs } = await this.supabase
                .from('jobs')
                .select('id, created_at, status')
                .in('company_id', companyIds);

            const companyJobsList = allCompanyJobs || [];
            if (companyJobsList.length === 0) {
                return stats;
            }

            const allCompanyJobIds = new Set(companyJobsList.map(j => j.id));
            const allCompanyJobIdArray = [...allCompanyJobIds];

            // Active roles (computed in-memory from already-fetched jobs)
            stats.active_roles = companyJobsList.filter(j => j.status === 'active').length;

            // ── Step 2: Prepare date boundaries ──
            const now = new Date();
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const staleCutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
            const visibleStages = ['submitted', 'screen', 'interview', 'offer', 'accepted', 'hired'];

            // Identify stale-eligible jobs for the stale_roles query
            const staleEligibleJobs = companyJobsList.filter(
                j => j.status === 'active' && new Date(j.created_at) < staleCutoff
            );
            const staleJobIds = staleEligibleJobs.map(j => j.id);

            // ── Step 3: Run independent queries in parallel ──
            const [
                applicationsResult,
                placementsResult,
                assignmentsResult,
                staleAppsResult,
                mtdAppsResult,
            ] = await Promise.all([
                // 1. Applications for company jobs in the requested date range
                this.supabase
                    .from('applications')
                    .select('id, stage, created_at, job_id')
                    .in('job_id', allCompanyJobIdArray)
                    .in('stage', visibleStages)
                    .gte('created_at', range.from.toISOString())
                    .lte('created_at', range.to.toISOString()),

                // 2. Placements YTD (always year boundaries, not caller's range)
                this.supabase
                    .from('placements')
                    .select('id, created_at, application_id')
                    .gte('created_at', yearStart.toISOString())
                    .lte('created_at', now.toISOString()),

                // 3. Active recruiters assigned to company jobs
                this.supabase
                    .from('role_assignments')
                    .select('recruiter_id, job_id')
                    .in('job_id', allCompanyJobIdArray),

                // 4. Stale roles: applications for stale-eligible jobs
                staleJobIds.length > 0
                    ? this.supabase
                        .from('applications')
                        .select('job_id')
                        .in('job_id', staleJobIds)
                        .in('stage', visibleStages)
                    : Promise.resolve({ data: [] as { job_id: string }[], error: null }),

                // 5. Applications MTD for company jobs
                this.supabase
                    .from('applications')
                    .select('id')
                    .in('job_id', allCompanyJobIdArray)
                    .in('stage', visibleStages)
                    .gte('created_at', monthStart.toISOString())
                    .lte('created_at', now.toISOString()),
            ]);

            // ── Process applications ──
            const companyApplications = applicationsResult.data || [];
            stats.total_applications = companyApplications.length;
            stats.interviews_scheduled = companyApplications.filter(a => a.stage === 'interview').length;
            stats.offers_extended = companyApplications.filter(
                a => a.stage === 'offer' || a.stage === 'accepted'
            ).length;

            // ── Process placements (filter to company via application -> job chain) ──
            const placements = placementsResult.data || [];
            if (placements.length > 0) {
                const placementAppIds = placements.map(p => p.application_id).filter(Boolean);
                if (placementAppIds.length > 0) {
                    const { data: placementApps } = await this.supabase
                        .from('applications')
                        .select('id, job_id, created_at')
                        .in('id', placementAppIds);

                    const validAppIds = new Set(
                        (placementApps || [])
                            .filter(a => allCompanyJobIds.has(a.job_id))
                            .map(a => a.id)
                    );

                    const companyPlacements = placements.filter(
                        p => validAppIds.has(p.application_id)
                    );
                    stats.placements_this_year = companyPlacements.length;
                    stats.placements_this_month = companyPlacements.filter(
                        p => new Date(p.created_at) >= monthStart
                    ).length;

                    // ── Avg time to hire (application created_at -> placement created_at) ──
                    if (companyPlacements.length > 0) {
                        const appDateMap = new Map(
                            (placementApps || []).map(a => [a.id, new Date(a.created_at)])
                        );
                        let totalDays = 0;
                        let count = 0;
                        for (const p of companyPlacements) {
                            const appDate = appDateMap.get(p.application_id);
                            if (appDate) {
                                const days = (new Date(p.created_at).getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24);
                                totalDays += Math.max(0, days);
                                count += 1;
                            }
                        }
                        stats.avg_time_to_hire_days = count > 0
                            ? Math.round(totalDays / count)
                            : 0;
                    }
                }
            }

            // ── Process active recruiters ──
            const companyAssignments = assignmentsResult.data || [];
            const activeRecruiterIds = new Set(companyAssignments.map(a => a.recruiter_id));
            stats.active_recruiters = activeRecruiterIds.size;

            // ── Process stale roles ──
            if (staleEligibleJobs.length > 0) {
                const staleApps = staleAppsResult.data || [];
                const appCountByJob = new Map<string, number>();
                for (const app of staleApps) {
                    appCountByJob.set(app.job_id, (appCountByJob.get(app.job_id) || 0) + 1);
                }
                stats.stale_roles = staleEligibleJobs.filter(
                    j => (appCountByJob.get(j.id) || 0) < 5
                ).length;
            }

            // ── Process applications MTD ──
            stats.applications_mtd = (mtdAppsResult.data || []).length;

            return stats;
        } catch (error) {
            console.error('Error calculating real-time company stats:', error);
            return DEFAULT_COMPANY_STATS;
        }
    }

    /**
     * Get platform-wide stats via real-time parallel queries.
     * Comprehensive stats for the admin dashboard command center.
     */
    async getPlatformStats(range: StatsRange): Promise<PlatformStatsMetrics> {
        try {
            const stats = { ...DEFAULT_PLATFORM_STATS };
            const now = new Date();
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const activeStages = ['submitted', 'screen', 'company_review', 'interview', 'offer', 'accepted'];

            // ── Run all independent count queries in parallel ──
            const [
                usersResult,
                candidatesResult,
                recruitersResult,
                companiesResult,
                jobsResult,
                applicationsResult,
                placementsYtdResult,
                placementsMonthResult,
                pendingPayoutsResult,
                paidPayoutsYtdResult,
                fraudResult,
                escrowResult,
                pendingRecruitersResult,
                newSignupsResult,
                subscriptionsResult,
                placementAvgsResult,
            ] = await Promise.all([
                // 1. Total users
                this.supabase.from('users').select('*', { count: 'exact', head: true }),
                // 2. Total candidates
                this.supabase.from('candidates').select('*', { count: 'exact', head: true }),
                // 3. Recruiters by status
                this.supabase.from('recruiters').select('status'),
                // 4. Companies
                this.supabase.from('companies').select('id, identity_organization_id'),
                // 5. Jobs by status
                this.supabase.from('jobs').select('status'),
                // 6. Active applications
                this.supabase.from('applications').select('*', { count: 'exact', head: true }).in('stage', activeStages),
                // 7. Placements YTD
                this.supabase.from('placements').select('id, fee_amount, platform_share, fee_percentage')
                    .in('state', ['hired', 'active', 'completed'])
                    .gte('created_at', yearStart.toISOString()),
                // 8. Placements this month
                this.supabase.from('placements').select('*', { count: 'exact', head: true })
                    .in('state', ['hired', 'active', 'completed'])
                    .gte('created_at', monthStart.toISOString()),
                // 9. Pending payouts (count + sum)
                this.supabase.from('payouts').select('payout_amount').in('status', ['pending', 'on_hold']),
                // 10. Paid payouts YTD
                this.supabase.from('payouts').select('payout_amount').eq('status', 'paid').gte('created_at', yearStart.toISOString()),
                // 11. Active fraud signals
                this.supabase.from('fraud_signals').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                // 12. Active escrow holds
                this.supabase.from('escrow_holds').select('amount').eq('status', 'active'),
                // 13. Pending recruiter approvals
                this.supabase.from('recruiters').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                // 14. New signups this month
                this.supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
                // 15. Subscriptions by status
                this.supabase.from('subscriptions').select('status'),
                // 16. Placement averages (fee_percentage, fee_amount)
                this.supabase.from('placements').select('fee_percentage, fee_amount')
                    .in('state', ['hired', 'active', 'completed']),
            ]);

            // ── Process results ──
            stats.total_users = usersResult.count || 0;
            stats.total_candidates = candidatesResult.count || 0;
            stats.total_applications = applicationsResult.count || 0;
            stats.active_fraud_signals = fraudResult.count || 0;
            stats.pending_recruiter_approvals = pendingRecruitersResult.count || 0;
            stats.new_signups_mtd = newSignupsResult.count || 0;
            stats.placements_this_month = placementsMonthResult.count || 0;

            // Recruiters by status
            const recruiters = recruitersResult.data || [];
            stats.total_recruiters = recruiters.length;
            stats.active_recruiters = recruiters.filter(r => r.status === 'active').length;
            stats.recruiter_statuses = {
                active: recruiters.filter(r => r.status === 'active').length,
                pending: recruiters.filter(r => r.status === 'pending').length,
                suspended: recruiters.filter(r => r.status === 'suspended').length,
            };

            // Companies
            const companies = companiesResult.data || [];
            stats.total_companies = companies.length;
            // Active = has an identity_organization_id linked
            stats.active_companies = companies.filter(c => c.identity_organization_id).length;

            // Jobs by status
            const jobs = jobsResult.data || [];
            stats.total_jobs = jobs.length;
            stats.active_jobs = jobs.filter(j => j.status === 'active').length;
            stats.job_statuses = {
                active: jobs.filter(j => j.status === 'active').length,
                closed: jobs.filter(j => j.status === 'closed').length,
                expired: jobs.filter(j => j.status === 'expired').length,
                draft: jobs.filter(j => j.status === 'draft').length,
            };

            // Placements YTD
            const placementsYtd = placementsYtdResult.data || [];
            stats.total_placements = placementsYtd.length;
            stats.total_revenue = placementsYtd.reduce(
                (sum, p) => sum + Number(p.platform_share || 0), 0
            );

            // Pending payouts
            const pendingPayouts = pendingPayoutsResult.data || [];
            stats.pending_payouts_count = pendingPayouts.length;
            stats.pending_payouts_amount = pendingPayouts.reduce(
                (sum, p) => sum + Number(p.payout_amount || 0), 0
            );

            // Paid payouts YTD
            const paidPayouts = paidPayoutsYtdResult.data || [];
            stats.total_payouts_processed_ytd = paidPayouts.reduce(
                (sum, p) => sum + Number(p.payout_amount || 0), 0
            );

            // Escrow holds
            const escrowHolds = escrowResult.data || [];
            stats.active_escrow_holds = escrowHolds.length;
            stats.active_escrow_amount = escrowHolds.reduce(
                (sum, e) => sum + Number(e.amount || 0), 0
            );

            // Subscriptions
            const subscriptions = subscriptionsResult.data || [];
            stats.active_subscriptions = subscriptions.filter(s => s.status === 'active').length;
            stats.trialing_subscriptions = subscriptions.filter(s => s.status === 'trialing').length;
            stats.past_due_subscriptions = subscriptions.filter(s => s.status === 'past_due').length;
            stats.canceled_subscriptions = subscriptions.filter(s => s.status === 'canceled').length;

            // Placement averages
            const allPlacements = placementAvgsResult.data || [];
            if (allPlacements.length > 0) {
                const totalFeePercent = allPlacements.reduce((sum, p) => sum + Number(p.fee_percentage || 0), 0);
                const totalFeeAmount = allPlacements.reduce((sum, p) => sum + Number(p.fee_amount || 0), 0);
                stats.avg_fee_percentage = Math.round((totalFeePercent / allPlacements.length) * 10) / 10;
                stats.avg_placement_value = Math.round(totalFeeAmount / allPlacements.length);
            }

            // ── Trends: compare current vs previous period ──
            await this.computePlatformTrends(stats, range);

            return stats;
        } catch (error) {
            console.error('Error fetching platform stats:', error);
            return DEFAULT_PLATFORM_STATS;
        }
    }

    /**
     * Compute trend percentages by comparing current period vs previous period.
     */
    private async computePlatformTrends(
        stats: PlatformStatsMetrics,
        range: StatsRange
    ): Promise<void> {
        try {
            const duration = range.to.getTime() - range.from.getTime();
            const prevFrom = new Date(range.from.getTime() - duration);
            const prevTo = new Date(range.from.getTime());
            const activeStages = ['submitted', 'screen', 'company_review', 'interview', 'offer', 'accepted'];

            const [prevJobsResult, prevRecruitersResult, prevAppsResult, prevPlacementsResult, prevRevenueResult] = await Promise.all([
                this.supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                this.supabase.from('recruiters').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                this.supabase.from('applications').select('*', { count: 'exact', head: true })
                    .in('stage', activeStages)
                    .gte('created_at', prevFrom.toISOString())
                    .lte('created_at', prevTo.toISOString()),
                this.supabase.from('placements').select('*', { count: 'exact', head: true })
                    .in('state', ['hired', 'active', 'completed'])
                    .gte('created_at', prevFrom.toISOString())
                    .lte('created_at', prevTo.toISOString()),
                this.supabase.from('placements').select('platform_share')
                    .in('state', ['hired', 'active', 'completed'])
                    .gte('created_at', prevFrom.toISOString())
                    .lte('created_at', prevTo.toISOString()),
            ]);

            const calcTrend = (current: number, previous: number): number | undefined => {
                if (previous === 0) return current > 0 ? 100 : undefined;
                return Math.round(((current - previous) / previous) * 100);
            };

            const prevRevenue = (prevRevenueResult.data || []).reduce(
                (sum, p) => sum + Number(p.platform_share || 0), 0
            );

            stats.trends = {
                active_jobs: calcTrend(stats.active_jobs, prevJobsResult.count || 0),
                active_recruiters: calcTrend(stats.active_recruiters, prevRecruitersResult.count || 0),
                total_applications: calcTrend(stats.total_applications, prevAppsResult.count || 0),
                total_placements: calcTrend(stats.total_placements, prevPlacementsResult.count || 0),
                total_revenue: calcTrend(stats.total_revenue, prevRevenue),
            };
        } catch (error) {
            console.error('Error computing platform trends:', error);
        }
    }

    /**
     * Get recent platform activity events across all entity types.
     */
    async getPlatformActivity(): Promise<PlatformActivityEvent[]> {
        try {
            const [placementsResult, recruitersResult, companiesResult, fraudResult, payoutsResult] = await Promise.all([
                this.supabase.from('placements')
                    .select('id, created_at, state')
                    .order('created_at', { ascending: false }).limit(10),
                this.supabase.from('recruiters')
                    .select('id, user_id, created_at')
                    .order('created_at', { ascending: false }).limit(10),
                this.supabase.from('companies')
                    .select('id, name, created_at')
                    .order('created_at', { ascending: false }).limit(10),
                this.supabase.from('fraud_signals')
                    .select('id, signal_type, severity, created_at')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false }).limit(10),
                this.supabase.from('payouts')
                    .select('id, payout_amount, status, created_at')
                    .eq('status', 'paid')
                    .order('created_at', { ascending: false }).limit(10),
            ]);

            const events: PlatformActivityEvent[] = [];

            // Placements
            for (const p of placementsResult.data || []) {
                events.push({
                    type: 'placement',
                    title: 'New placement confirmed',
                    description: `Placement #${p.id.slice(0, 8)} - ${p.state}`,
                    href: `/portal/admin/placements`,
                    created_at: p.created_at,
                });
            }

            // Recruiter signups
            for (const r of recruitersResult.data || []) {
                events.push({
                    type: 'recruiter_join',
                    title: 'New recruiter joined',
                    description: `Recruiter registered on the platform`,
                    href: `/portal/admin/recruiters`,
                    created_at: r.created_at,
                });
            }

            // Company registrations
            for (const c of companiesResult.data || []) {
                events.push({
                    type: 'company_join',
                    title: `${c.name || 'New company'} registered`,
                    description: 'Company joined the marketplace',
                    href: `/portal/admin/companies`,
                    created_at: c.created_at,
                });
            }

            // Fraud alerts
            for (const f of fraudResult.data || []) {
                events.push({
                    type: 'fraud_alert',
                    title: `${f.severity} severity fraud signal`,
                    description: `Signal type: ${f.signal_type}`,
                    href: `/portal/admin/fraud`,
                    created_at: f.created_at,
                });
            }

            // Payouts
            for (const p of payoutsResult.data || []) {
                events.push({
                    type: 'payout',
                    title: 'Payout processed',
                    description: `$${Number(p.payout_amount || 0).toLocaleString()} paid out`,
                    href: `/portal/admin/payouts/audit`,
                    created_at: p.created_at,
                });
            }

            // Sort by created_at descending, take top 15
            events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            return events.slice(0, 15);
        } catch (error) {
            console.error('Error fetching platform activity:', error);
            return [];
        }
    }

    /**
     * Get top performing recruiters by placement count this month.
     */
    async getTopPerformers(): Promise<TopPerformer[]> {
        try {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            // Get placements this month with recruiter info
            const { data: placements } = await this.supabase
                .from('placements')
                .select('candidate_recruiter_id')
                .in('state', ['hired', 'active', 'completed'])
                .gte('created_at', monthStart.toISOString());

            if (!placements || placements.length === 0) return [];

            // Count placements per recruiter
            const countMap = new Map<string, number>();
            for (const p of placements) {
                if (p.candidate_recruiter_id) {
                    countMap.set(
                        p.candidate_recruiter_id,
                        (countMap.get(p.candidate_recruiter_id) || 0) + 1
                    );
                }
            }

            // Sort and take top 5
            const sorted = Array.from(countMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            if (sorted.length === 0) return [];

            // Get recruiter names via user_id lookup
            const recruiterIds = sorted.map(([id]) => id);
            const { data: recruiters } = await this.supabase
                .from('recruiters')
                .select('id, user_id')
                .in('id', recruiterIds);

            const userIds = (recruiters || []).map(r => r.user_id).filter(Boolean);
            const { data: users } = userIds.length > 0
                ? await this.supabase.from('users').select('id, name, email').in('id', userIds)
                : { data: [] as { id: string; name: string; email: string }[] };

            const recruiterUserMap = new Map((recruiters || []).map(r => [r.id, r.user_id]));
            const userNameMap = new Map((users || []).map(u => [u.id, u.name || u.email || 'Unknown']));

            return sorted.map(([recruiterId, count]) => ({
                recruiter_id: recruiterId,
                recruiter_name: userNameMap.get(recruiterUserMap.get(recruiterId) || '') || 'Unknown',
                placement_count: count,
            }));
        } catch (error) {
            console.error('Error fetching top performers:', error);
            return [];
        }
    }
}
