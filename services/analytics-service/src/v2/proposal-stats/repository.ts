import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { ProposalSummary, ProposalStatsFilters } from './types';

export class ProposalStatsRepository {
    constructor(private supabase: SupabaseClient) {}

    async getSummary(clerkUserId: string, filters: ProposalStatsFilters): Promise<ProposalSummary> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Query applications table for proposals (stage = 'recruiter_proposed')
        const query = this.supabase
            .from('applications')
            .select('id, stage, candidate_recruiter_id, created_at, updated_at');

        // Apply role-based filtering
        if (context.recruiterId) {
            // Recruiter sees applications where they're the candidate recruiter
            query.eq('candidate_recruiter_id', context.recruiterId);
        } else if (context.organizationIds && context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Company users - get applications for jobs from their companies
            // Need to join with jobs table to filter by company
            const { data: jobIds } = await this.supabase
                .from('jobs')
                .select('id')
                .in('company_id', context.organizationIds);
            
            if (jobIds && jobIds.length > 0) {
                query.in('job_id', jobIds.map(j => j.id));
            } else {
                // No jobs for this company, return empty result
                query.eq('id', 'no-match');
            }
        }
        // Platform admins see everything (no filter)
        
        // Filter to only proposal-stage applications
        query.eq('stage', 'recruiter_proposed');

        const { data: applications, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch applications: ${error.message}`);
        }

        if (!applications || applications.length === 0) {
            return {
                actionable_count: 0,
                waiting_count: 0,
                urgent_count: 0,
                overdue_count: 0,
            };
        }

        // Compute counts based on applications in 'recruiter_proposed' stage
        const now = new Date();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        return {
            // Actionable: recent applications in 'recruiter_proposed' stage
            actionable_count: applications.filter(a => 
                a.stage === 'recruiter_proposed' && 
                new Date(a.updated_at) > threeDaysAgo
            ).length,
            
            // Waiting: applications that have been in 'recruiter_proposed' stage for a while
            waiting_count: applications.filter(a => 
                a.stage === 'recruiter_proposed' && 
                new Date(a.updated_at) <= threeDaysAgo
            ).length,
            
            // Urgent: applications that have been pending for more than 3 days
            urgent_count: applications.filter(a => 
                a.stage === 'recruiter_proposed' && 
                new Date(a.updated_at) <= threeDaysAgo
            ).length,
            
            // Overdue: applications that have been pending for more than 7 days
            overdue_count: applications.filter(a => 
                a.stage === 'recruiter_proposed' && 
                new Date(a.updated_at) <= sevenDaysAgo
            ).length,
        };
    }
}
