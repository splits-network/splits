/**
 * Reputation Repository
 *
 * Queries the database to gather metrics for reputation calculation
 * and manages recruiter_reputation records.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ReputationMetrics, RecruiterReputation } from './types';

export class ReputationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Gather all metrics needed for reputation calculation for a single recruiter.
     */
    async gatherMetrics(recruiterId: string): Promise<ReputationMetrics> {
        // Run all queries in parallel for efficiency
        const [
            submissionsResult,
            hiresResult,
            placementsResult,
            collaborationsResult,
            responseTimeResult,
        ] = await Promise.all([
            this.countSubmissions(recruiterId),
            this.countHires(recruiterId),
            this.getPlacementCounts(recruiterId),
            this.countCollaborations(recruiterId),
            this.calculateAvgResponseTime(recruiterId),
        ]);

        return {
            total_submissions: submissionsResult,
            total_hires: hiresResult,
            ...placementsResult,
            total_collaborations: collaborationsResult,
            avg_response_time_hours: responseTimeResult,
        };
    }

    /**
     * Count applications where the recruiter submitted a candidate.
     * Applications in 'submitted' stage or beyond (i.e., progressed past pre-submission stages).
     */
    private async countSubmissions(recruiterId: string): Promise<number> {
        // Stages that are considered "submitted" or beyond
        const submittedStages = [
            'submitted',
            'company_review',
            'company_feedback',
            'interview',
            'offer',
            'hired',
        ];

        const { count, error } = await this.supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_recruiter_id', recruiterId)
            .in('stage', submittedStages);

        if (error) throw error;
        return count || 0;
    }

    /**
     * Count applications where the candidate was hired.
     */
    private async countHires(recruiterId: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_recruiter_id', recruiterId)
            .eq('stage', 'hired');

        if (error) throw error;
        return count || 0;
    }

    /**
     * Get placement counts by state for a recruiter.
     * Counts placements where the recruiter appears in placement_splits.
     */
    private async getPlacementCounts(
        recruiterId: string
    ): Promise<{
        total_placements: number;
        completed_placements: number;
        failed_placements: number;
    }> {
        // Get all placement IDs where this recruiter has a split
        const { data: splits, error: splitsError } = await this.supabase
            .from('placement_splits')
            .select('placement_id')
            .eq('recruiter_id', recruiterId);

        if (splitsError) throw splitsError;

        if (!splits || splits.length === 0) {
            return {
                total_placements: 0,
                completed_placements: 0,
                failed_placements: 0,
            };
        }

        const placementIds = splits.map((s) => s.placement_id);

        // Get placements and count by state
        const { data: placements, error: placementsError } = await this.supabase
            .from('placements')
            .select('id, state')
            .in('id', placementIds);

        if (placementsError) throw placementsError;

        const total = placements?.length || 0;
        const completed =
            placements?.filter((p) => p.state === 'completed').length || 0;
        const failed =
            placements?.filter((p) => p.state === 'failed').length || 0;

        return {
            total_placements: total,
            completed_placements: completed,
            failed_placements: failed,
        };
    }

    /**
     * Count placements where this recruiter collaborated with others.
     * A collaboration is a placement where multiple recruiters have splits.
     */
    private async countCollaborations(recruiterId: string): Promise<number> {
        // Get placement IDs where this recruiter has a split
        const { data: mySplits, error: mySplitsError } = await this.supabase
            .from('placement_splits')
            .select('placement_id')
            .eq('recruiter_id', recruiterId);

        if (mySplitsError) throw mySplitsError;

        if (!mySplits || mySplits.length === 0) {
            return 0;
        }

        const myPlacementIds = mySplits.map((s) => s.placement_id);

        // Count placements that have more than one recruiter split
        let collaborationCount = 0;

        for (const placementId of myPlacementIds) {
            const { count, error } = await this.supabase
                .from('placement_splits')
                .select('*', { count: 'exact', head: true })
                .eq('placement_id', placementId);

            if (error) throw error;
            if (count && count > 1) {
                collaborationCount++;
            }
        }

        return collaborationCount;
    }

    /**
     * Calculate average response time between info_request and info_response
     * for this recruiter's applications.
     */
    private async calculateAvgResponseTime(
        recruiterId: string
    ): Promise<number | null> {
        // Get applications for this recruiter
        const { data: applications, error: appError } = await this.supabase
            .from('applications')
            .select('id')
            .eq('candidate_recruiter_id', recruiterId);

        if (appError) throw appError;

        if (!applications || applications.length === 0) {
            return null;
        }

        const applicationIds = applications.map((a) => a.id);

        // Get all feedback entries for these applications
        const { data: feedback, error: feedbackError } = await this.supabase
            .from('application_notes')
            .select('id, application_id, note_type, in_response_to_id, created_at')
            .in('application_id', applicationIds)
            .in('note_type', ['info_request', 'info_response'])
            .order('created_at', { ascending: true });

        if (feedbackError) throw feedbackError;

        if (!feedback || feedback.length === 0) {
            return null;
        }

        // Build a map of info_request IDs to their created_at timestamps
        const requestTimes = new Map<string, Date>();
        for (const f of feedback) {
            if (f.note_type === 'info_request') {
                requestTimes.set(f.id, new Date(f.created_at));
            }
        }

        // Calculate response times
        const responseTimes: number[] = [];
        for (const f of feedback) {
            if (f.note_type === 'info_response' && f.in_response_to_id) {
                const requestTime = requestTimes.get(f.in_response_to_id);
                if (requestTime) {
                    const responseTime = new Date(f.created_at);
                    const diffHours =
                        (responseTime.getTime() - requestTime.getTime()) /
                        (1000 * 60 * 60);
                    responseTimes.push(diffHours);
                }
            }
        }

        if (responseTimes.length === 0) {
            return null;
        }

        const avgHours =
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        return Math.round(avgHours * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Get the current reputation record for a recruiter.
     */
    async getReputation(recruiterId: string): Promise<RecruiterReputation | null> {
        const { data, error } = await this.supabase
            .from('recruiter_reputation')
            .select('*')
            .eq('recruiter_id', recruiterId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw error;
        }

        return data as RecruiterReputation;
    }

    /**
     * Upsert a reputation record (create or update).
     */
    async upsertReputation(
        recruiterId: string,
        metrics: ReputationMetrics,
        finalScore: number
    ): Promise<RecruiterReputation> {
        const now = new Date().toISOString();

        // Calculate derived rates
        const hireRate =
            metrics.total_submissions > 0
                ? (metrics.total_hires / metrics.total_submissions) * 100
                : null;

        const completionRate =
            metrics.total_placements > 0
                ? (metrics.completed_placements / metrics.total_placements) * 100
                : null;

        const collaborationRate =
            metrics.total_placements > 0
                ? (metrics.total_collaborations / metrics.total_placements) * 100
                : null;

        const { data, error } = await this.supabase
            .from('recruiter_reputation')
            .upsert(
                {
                    recruiter_id: recruiterId,
                    total_submissions: metrics.total_submissions,
                    total_hires: metrics.total_hires,
                    hire_rate: hireRate,
                    total_placements: metrics.total_placements,
                    completed_placements: metrics.completed_placements,
                    failed_placements: metrics.failed_placements,
                    completion_rate: completionRate,
                    total_collaborations: metrics.total_collaborations,
                    collaboration_rate: collaborationRate,
                    avg_response_time_hours: metrics.avg_response_time_hours,
                    reputation_score: finalScore,
                    last_calculated_at: now,
                    updated_at: now,
                },
                { onConflict: 'recruiter_id' }
            )
            .select()
            .single();

        if (error) throw error;
        return data as RecruiterReputation;
    }

    /**
     * Get all recruiter IDs for batch recalculation.
     */
    async getAllRecruiterIds(): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('recruiters')
            .select('id');

        if (error) throw error;
        return (data || []).map((r) => r.id);
    }

    /**
     * Get recruiter's user_id for notifications.
     */
    async getRecruiterUserId(recruiterId: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('recruiters')
            .select('user_id')
            .eq('id', recruiterId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data?.user_id || null;
    }

    /**
     * Get all recruiter IDs involved in a placement.
     */
    async getRecruitersForPlacement(placementId: string): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('placement_splits')
            .select('recruiter_id')
            .eq('placement_id', placementId);

        if (error) throw error;
        return (data || []).map((s) => s.recruiter_id);
    }
}
