import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '../shared/access';
import { CandidateStatsMetrics, CompanyStatsMetrics, RecruiterStatsMetrics } from './types';

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

const ACTIVE_ROLE_STATUSES = ['active', 'open'];
const PIPELINE_STAGES = ['recruiter_proposed', 'recruiter_request', 'ai_review', 'screen', 'submitted', 'interview'];

export class StatsRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async getAccessContext(clerkUserId: string) {
        return resolveAccessContext(this.supabase, clerkUserId);
    }

    async getRecruiterStats(recruiterId: string): Promise<RecruiterStatsMetrics> {
        if (!recruiterId) {
            return DEFAULT_RECRUITER_STATS;
        }

        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // First, get job IDs assigned to this recruiter via role_assignments (in network schema)
        // Jobs don't have recruiter_id - recruiters are assigned to jobs via role_assignments
        const assignedJobsResult = await this.supabase
            .schema('network')
            .from('role_assignments')
            .select('job_id')
            .eq('recruiter_id', recruiterId)
            .eq('status', 'active');

        const assignedJobIds = (assignedJobsResult.data || []).map((a: any) => a.job_id);

        const [
            activeRolesResult,
            pipelineResult,
            offersPendingResult,
            placementsResult,
        ] = await Promise.all([
            // Count active jobs from assigned job IDs
            assignedJobIds.length > 0
                ? this.supabase
                    .schema('ats')
                    .from('jobs')
                    .select('id', { count: 'exact', head: true })
                    .in('id', assignedJobIds)
                    .in('status', ACTIVE_ROLE_STATUSES)
                : Promise.resolve({ count: 0, error: null }),
            // applications.recruiter_id exists in ats schema
            this.supabase
                .schema('ats')
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('recruiter_id', recruiterId)
                .in('stage', PIPELINE_STAGES),
            this.supabase
                .schema('ats')
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('recruiter_id', recruiterId)
                .eq('stage', 'offer')
                .or('accepted_by_company.eq.false,accepted_by_company.is.null'),
            // placements.recruiter_id exists in ats schema
            this.supabase
                .schema('ats')
                .from('placements')
                .select('id, hired_at, recruiter_share, state, guarantee_expires_at')
                .eq('recruiter_id', recruiterId),
        ]);

        if (activeRolesResult.error) throw activeRolesResult.error;
        if (pipelineResult.error) throw pipelineResult.error;
        if (offersPendingResult.error) throw offersPendingResult.error;
        if (placementsResult.error) throw placementsResult.error;

        const placementsData = placementsResult.data || [];

        const placementsThisMonth = placementsData.filter((placement) => {
            const hiredAt = placement.hired_at ? new Date(placement.hired_at) : null;
            return hiredAt && hiredAt >= startOfMonth;
        }).length;

        const placementsThisYear = placementsData.filter((placement) => {
            const hiredAt = placement.hired_at ? new Date(placement.hired_at) : null;
            return hiredAt && hiredAt >= startOfYear;
        }).length;

        const totalEarningsYTD = placementsData.reduce((sum, placement) => {
            const hiredAt = placement.hired_at ? new Date(placement.hired_at) : null;
            if (hiredAt && hiredAt >= startOfYear) {
                return sum + (placement.recruiter_share || 0);
            }
            return sum;
        }, 0);

        const pendingPayouts = placementsData.reduce((sum, placement) => {
            if (placement.state === 'active') {
                return sum + (placement.recruiter_share || 0);
            }
            if (placement.guarantee_expires_at) {
                const guaranteeDate = new Date(placement.guarantee_expires_at);
                if (guaranteeDate > now) {
                    return sum + (placement.recruiter_share || 0);
                }
            }
            return sum;
        }, 0);

        return {
            active_roles: activeRolesResult.count || 0,
            candidates_in_process: pipelineResult.count || 0,
            offers_pending: offersPendingResult.count || 0,
            placements_this_month: placementsThisMonth,
            placements_this_year: placementsThisYear,
            total_earnings_ytd: totalEarningsYTD,
            pending_payouts: pendingPayouts,
        };
    }

    async getCandidateStats(candidateId: string): Promise<CandidateStatsMetrics> {
        if (!candidateId) {
            return DEFAULT_CANDIDATE_STATS;
        }

        const [totalApplicationsResult, activeApplicationsResult, interviewsResult, offersResult] =
            await Promise.all([
                // Total applications
                this.supabase
                    .schema('ats')
                    .from('applications')
                    .select('id', { count: 'exact', head: true })
                    .eq('candidate_id', candidateId),
                // Active applications (in process stages)
                this.supabase
                    .schema('ats')
                    .from('applications')
                    .select('id', { count: 'exact', head: true })
                    .eq('candidate_id', candidateId)
                    .in('stage', PIPELINE_STAGES),
                // Interviews scheduled
                this.supabase
                    .schema('ats')
                    .from('applications')
                    .select('id', { count: 'exact', head: true })
                    .eq('candidate_id', candidateId)
                    .eq('stage', 'interview'),
                // Offers received
                this.supabase
                    .schema('ats')
                    .from('applications')
                    .select('id', { count: 'exact', head: true })
                    .eq('candidate_id', candidateId)
                    .eq('stage', 'offer'),
            ]);

        if (totalApplicationsResult.error) throw totalApplicationsResult.error;
        if (activeApplicationsResult.error) throw activeApplicationsResult.error;
        if (interviewsResult.error) throw interviewsResult.error;
        if (offersResult.error) throw offersResult.error;

        return {
            total_applications: totalApplicationsResult.count || 0,
            active_applications: activeApplicationsResult.count || 0,
            interviews_scheduled: interviewsResult.count || 0,
            offers_received: offersResult.count || 0,
        };
    }

    async getCompanyStats(companyIds: string[]): Promise<CompanyStatsMetrics> {
        if (!companyIds || companyIds.length === 0) {
            return DEFAULT_COMPANY_STATS;
        }

        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            activeRolesResult,
            totalApplicationsResult,
            interviewsScheduledResult,
            offersExtendedResult,
            placementsResult,
        ] = await Promise.all([
            // Active roles
            this.supabase
                .schema('ats')
                .from('jobs')
                .select('id', { count: 'exact', head: true })
                .in('company_id', companyIds)
                .in('status', ACTIVE_ROLE_STATUSES),
            // Total applications
            this.supabase
                .schema('ats')
                .from('applications')
                .select('id, job:jobs!inner(company_id)', { count: 'exact', head: true })
                .in('job.company_id', companyIds),
            // Interviews scheduled
            this.supabase
                .schema('ats')
                .from('applications')
                .select('id, job:jobs!inner(company_id)', { count: 'exact', head: true })
                .in('job.company_id', companyIds)
                .eq('stage', 'interview'),
            // Offers extended
            this.supabase
                .schema('ats')
                .from('applications')
                .select('id, job:jobs!inner(company_id)', { count: 'exact', head: true })
                .in('job.company_id', companyIds)
                .eq('stage', 'offer'),
            // Placements for time-to-hire and counts
            this.supabase
                .schema('ats')
                .from('placements')
                .select('id, hired_at, application:applications!inner(job:jobs!inner(company_id))')
                .in('application.job.company_id', companyIds),
        ]);
        try {
            if (activeRolesResult.error) throw activeRolesResult.error;
            if (totalApplicationsResult.error) throw totalApplicationsResult.error;
            if (interviewsScheduledResult.error) throw interviewsScheduledResult.error;
            if (offersExtendedResult.error) throw offersExtendedResult.error;
            if (placementsResult.error) throw placementsResult.error;
        } catch (e) {
            console.error('Error fetching company stats:', e);
            return DEFAULT_COMPANY_STATS;
        }

        const placementsData = placementsResult.data || [];

        const placementsThisMonth = placementsData.filter((placement) => {
            const hiredAt = placement.hired_at ? new Date(placement.hired_at) : null;
            return hiredAt && hiredAt >= startOfMonth;
        }).length;

        const placementsThisYear = placementsData.filter((placement) => {
            const hiredAt = placement.hired_at ? new Date(placement.hired_at) : null;
            return hiredAt && hiredAt >= startOfYear;
        }).length;

        // Calculate average time to hire (simplified - using days from year start)
        // In a real implementation, we'd calculate from job post date to hire date per placement
        const avgTimeToHireDays = placementsData.length > 0
            ? Math.round((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) / Math.max(placementsData.length, 1))
            : 0;

        // Count active recruiters from role_assignments (not jobs.recruiter_id which doesn't exist)
        // First get job IDs for these companies
        const companyJobsResult = await this.supabase
            .schema('ats')
            .from('jobs')
            .select('id')
            .in('company_id', companyIds)
            .in('status', ACTIVE_ROLE_STATUSES);

        const companyJobIds = (companyJobsResult.data || []).map((j: any) => j.id);

        // Then get distinct recruiters assigned to these jobs
        let activeRecruitersCount = 0;
        if (companyJobIds.length > 0) {
            const activeRecruitersResult = await this.supabase
                .schema('network')
                .from('role_assignments')
                .select('recruiter_id')
                .in('job_id', companyJobIds)
                .eq('status', 'active');

            const uniqueRecruiterIds = new Set(
                (activeRecruitersResult.data || [])
                    .map((assignment: any) => assignment.recruiter_id)
                    .filter((id: string | null) => id !== null)
            );
            activeRecruitersCount = uniqueRecruiterIds.size;
        }

        return {
            active_roles: activeRolesResult.count || 0,
            total_applications: totalApplicationsResult.count || 0,
            interviews_scheduled: interviewsScheduledResult.count || 0,
            offers_extended: offersExtendedResult.count || 0,
            placements_this_month: placementsThisMonth,
            placements_this_year: placementsThisYear,
            avg_time_to_hire_days: avgTimeToHireDays,
            active_recruiters: activeRecruitersCount,
        };
    }
}
