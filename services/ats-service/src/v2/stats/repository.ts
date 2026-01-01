import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '../shared/access';
import { CandidateStatsMetrics, RecruiterStatsMetrics } from './types';

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

const ACTIVE_ROLE_STATUSES = ['active', 'open'];
const PIPELINE_STAGES = ['recruiter_proposed', 'ai_review', 'screen', 'submitted', 'interview'];

export class StatsRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
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

        const [
            activeRolesResult,
            pipelineResult,
            offersPendingResult,
            placementsResult,
        ] = await Promise.all([
            this.supabase
                .schema('ats')
                .from('jobs')
                .select('id', { count: 'exact', head: true })
                .eq('recruiter_id', recruiterId)
                .in('status', ACTIVE_ROLE_STATUSES),
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
}
