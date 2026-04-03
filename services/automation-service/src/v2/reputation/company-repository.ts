/**
 * Company Reputation Repository
 *
 * Queries the database to gather metrics for company reputation calculation
 * and manages company_reputation records.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanyReputationMetrics, CompanyReputation } from './company-types.js';

export class CompanyReputationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Gather all metrics needed for company reputation calculation.
     */
    async gatherMetrics(companyId: string): Promise<CompanyReputationMetrics> {
        const [
            applicationsReceived,
            hires,
            placementCounts,
            expiredCount,
            avgReviewTime,
            avgFeedbackTime,
        ] = await Promise.all([
            this.countApplicationsReceived(companyId),
            this.countHires(companyId),
            this.getPlacementCounts(companyId),
            this.countExpiredInCompanyStages(companyId),
            this.calculateAvgReviewTime(companyId),
            this.calculateAvgFeedbackTime(companyId),
        ]);

        return {
            total_applications_received: applicationsReceived,
            total_hires: hires,
            ...placementCounts,
            total_expired_in_company_stages: expiredCount,
            avg_review_time_hours: avgReviewTime,
            avg_feedback_time_hours: avgFeedbackTime,
        };
    }

    /**
     * Count applications received for company's jobs that reached submission.
     */
    private async countApplicationsReceived(companyId: string): Promise<number> {
        // Get job IDs for this company
        const jobIds = await this.getCompanyJobIds(companyId);
        if (jobIds.length === 0) return 0;

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
            .in('job_id', jobIds)
            .in('stage', submittedStages);

        if (error) throw error;
        return count || 0;
    }

    /**
     * Count applications where the candidate was hired for company's jobs.
     */
    private async countHires(companyId: string): Promise<number> {
        const jobIds = await this.getCompanyJobIds(companyId);
        if (jobIds.length === 0) return 0;

        const { count, error } = await this.supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobIds)
            .eq('stage', 'hired');

        if (error) throw error;
        return count || 0;
    }

    /**
     * Get placement counts for a company via jobs.
     */
    private async getPlacementCounts(
        companyId: string
    ): Promise<{
        total_placements: number;
        completed_placements: number;
        failed_placements: number;
    }> {
        const jobIds = await this.getCompanyJobIds(companyId);
        if (jobIds.length === 0) {
            return { total_placements: 0, completed_placements: 0, failed_placements: 0 };
        }

        const { data: placements, error } = await this.supabase
            .from('placements')
            .select('id, state')
            .in('job_id', jobIds);

        if (error) throw error;

        const total = placements?.length || 0;
        const completed = placements?.filter((p) => p.state === 'completed').length || 0;
        const failed = placements?.filter((p) => p.state === 'failed').length || 0;

        return { total_placements: total, completed_placements: completed, failed_placements: failed };
    }

    /**
     * Count applications that expired while in company-owned stages.
     */
    private async countExpiredInCompanyStages(companyId: string): Promise<number> {
        const jobIds = await this.getCompanyJobIds(companyId);
        if (jobIds.length === 0) return 0;

        const companyStages = ['submitted', 'company_review', 'company_feedback'];

        const { count, error } = await this.supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobIds)
            .not('expired_at', 'is', null)
            .in('stage', companyStages);

        if (error) throw error;
        return count || 0;
    }

    /**
     * Calculate average time from 'submitted' to 'company_review' for company's jobs.
     * Uses application_audit_log to measure stage transition time.
     */
    private async calculateAvgReviewTime(companyId: string): Promise<number | null> {
        const jobIds = await this.getCompanyJobIds(companyId);
        if (jobIds.length === 0) return null;

        // Get applications for this company's jobs
        const { data: applications, error: appError } = await this.supabase
            .from('applications')
            .select('id')
            .in('job_id', jobIds);

        if (appError) throw appError;
        if (!applications || applications.length === 0) return null;

        const applicationIds = applications.map((a) => a.id);

        // Get stage change audit log entries for these applications
        const { data: auditLogs, error: auditError } = await this.supabase
            .from('application_audit_log')
            .select('application_id, old_value, new_value, created_at')
            .in('application_id', applicationIds)
            .eq('action', 'stage_changed')
            .order('created_at', { ascending: true });

        if (auditError) throw auditError;
        if (!auditLogs || auditLogs.length === 0) return null;

        return this.calculateAvgTransitionTime(
            auditLogs,
            'submitted',
            'company_review'
        );
    }

    /**
     * Calculate average time from 'company_review' to next action for company's jobs.
     */
    private async calculateAvgFeedbackTime(companyId: string): Promise<number | null> {
        const jobIds = await this.getCompanyJobIds(companyId);
        if (jobIds.length === 0) return null;

        const { data: applications, error: appError } = await this.supabase
            .from('applications')
            .select('id')
            .in('job_id', jobIds);

        if (appError) throw appError;
        if (!applications || applications.length === 0) return null;

        const applicationIds = applications.map((a) => a.id);

        const { data: auditLogs, error: auditError } = await this.supabase
            .from('application_audit_log')
            .select('application_id, old_value, new_value, created_at')
            .in('application_id', applicationIds)
            .eq('action', 'stage_changed')
            .order('created_at', { ascending: true });

        if (auditError) throw auditError;
        if (!auditLogs || auditLogs.length === 0) return null;

        return this.calculateAvgTransitionTime(
            auditLogs,
            'company_review',
            null // any next stage
        );
    }

    /**
     * Calculate average transition time between two stages from audit log entries.
     * If toStage is null, measures time from fromStage to any next stage change.
     */
    private calculateAvgTransitionTime(
        auditLogs: Array<{
            application_id: string;
            old_value: any;
            new_value: any;
            created_at: string;
        }>,
        fromStage: string,
        toStage: string | null
    ): number | null {
        // Group by application_id
        const byApplication = new Map<string, typeof auditLogs>();
        for (const log of auditLogs) {
            const existing = byApplication.get(log.application_id) || [];
            existing.push(log);
            byApplication.set(log.application_id, existing);
        }

        const transitionTimes: number[] = [];

        for (const [, logs] of byApplication) {
            for (let i = 0; i < logs.length; i++) {
                const log = logs[i];
                const newStage = log.new_value?.stage;

                if (newStage === fromStage) {
                    // Find the next stage change for this application
                    for (let j = i + 1; j < logs.length; j++) {
                        const nextLog = logs[j];
                        const nextOldStage = nextLog.old_value?.stage;

                        if (nextOldStage === fromStage) {
                            if (toStage === null || nextLog.new_value?.stage === toStage) {
                                const fromTime = new Date(log.created_at).getTime();
                                const toTime = new Date(nextLog.created_at).getTime();
                                const diffHours = (toTime - fromTime) / (1000 * 60 * 60);
                                transitionTimes.push(diffHours);
                            }
                            break;
                        }
                    }
                }
            }
        }

        if (transitionTimes.length === 0) return null;

        const avg = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;
        return Math.round(avg * 100) / 100;
    }

    /**
     * Get the current reputation record for a company.
     */
    async getReputation(companyId: string): Promise<CompanyReputation | null> {
        const { data, error } = await this.supabase
            .from('company_reputation')
            .select('*')
            .eq('company_id', companyId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data as CompanyReputation;
    }

    /**
     * Upsert a company reputation record.
     */
    async upsertReputation(
        companyId: string,
        metrics: CompanyReputationMetrics,
        finalScore: number
    ): Promise<CompanyReputation> {
        const now = new Date().toISOString();

        const hireRate =
            metrics.total_applications_received > 0
                ? (metrics.total_hires / metrics.total_applications_received) * 100
                : null;

        const completionRate =
            metrics.total_placements > 0
                ? (metrics.completed_placements / metrics.total_placements) * 100
                : null;

        const expirationRate =
            metrics.total_applications_received > 0
                ? (metrics.total_expired_in_company_stages / metrics.total_applications_received) * 100
                : null;

        const { data, error } = await this.supabase
            .from('company_reputation')
            .upsert(
                {
                    company_id: companyId,
                    total_applications_received: metrics.total_applications_received,
                    total_hires: metrics.total_hires,
                    total_placements: metrics.total_placements,
                    completed_placements: metrics.completed_placements,
                    failed_placements: metrics.failed_placements,
                    hire_rate: hireRate,
                    completion_rate: completionRate,
                    avg_review_time_hours: metrics.avg_review_time_hours,
                    avg_feedback_time_hours: metrics.avg_feedback_time_hours,
                    total_expired_in_company_stages: metrics.total_expired_in_company_stages,
                    expiration_rate: expirationRate,
                    reputation_score: finalScore,
                    last_calculated_at: now,
                    updated_at: now,
                },
                { onConflict: 'company_id' }
            )
            .select()
            .single();

        if (error) throw error;
        return data as CompanyReputation;
    }

    /**
     * Get all company IDs for batch recalculation.
     */
    async getAllCompanyIds(): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('companies')
            .select('id');

        if (error) throw error;
        return (data || []).map((c) => c.id);
    }

    /**
     * Get company_id for a given job_id.
     */
    async getCompanyIdForJob(jobId: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('jobs')
            .select('company_id')
            .eq('id', jobId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data?.company_id || null;
    }

    /**
     * Get company_id for a given placement_id (via jobs).
     */
    async getCompanyIdForPlacement(placementId: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('placements')
            .select('job_id')
            .eq('id', placementId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        if (!data?.job_id) return null;
        return this.getCompanyIdForJob(data.job_id);
    }

    /**
     * Get all job IDs for a company (used internally by multiple queries).
     */
    private async getCompanyJobIds(companyId: string): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('jobs')
            .select('id')
            .eq('company_id', companyId);

        if (error) throw error;
        return (data || []).map((j) => j.id);
    }
}
