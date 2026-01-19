import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { ProposalSummary, ProposalStatsFilters } from './types';

export class ProposalStatsRepository {
    constructor(private supabase: SupabaseClient) {}

    async getSummary(clerkUserId: string, filters: ProposalStatsFilters): Promise<ProposalSummary> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Query candidate_role_assignments (proposals) table from network schema
        const query = this.supabase
            .from('candidate_role_assignments')
            .select('id, state, response_due_at, proposed_by, candidate_recruiter_id, company_recruiter_id');

        // Apply role-based filtering
        if (context.recruiterId) {
            // Recruiter sees proposals where they're candidate OR company recruiter
            query.or(`candidate_recruiter_id.eq.${context.recruiterId},company_recruiter_id.eq.${context.recruiterId}`);
        } else if (context.organizationIds && context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Company users - for now, allow all (TODO: filter by company_id when CRA has it)
            // Leave query unfiltered for company users
        }
        // Platform admins see everything (no filter)

        const { data: proposals, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch proposals: ${error.message}`);
        }

        if (!proposals || proposals.length === 0) {
            return {
                actionable_count: 0,
                waiting_count: 0,
                urgent_count: 0,
                overdue_count: 0,
            };
        }

        // Compute counts
        const now = new Date();
        const urgent_threshold = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        return {
            // Actionable: proposals in 'proposed' state where current user is NOT the proposer
            actionable_count: proposals.filter(p => 
                p.state === 'proposed' && 
                p.proposed_by !== context.identityUserId &&
                (p.company_recruiter_id === context.recruiterId || p.candidate_recruiter_id === context.recruiterId)
            ).length,
            
            // Waiting: proposals in 'proposed' state where current user IS the proposer
            waiting_count: proposals.filter(p => 
                p.state === 'proposed' && 
                p.proposed_by === context.identityUserId
            ).length,
            
            // Urgent: proposals expiring within 24 hours
            urgent_count: proposals.filter(p => 
                p.state === 'proposed' && 
                p.response_due_at && 
                new Date(p.response_due_at) <= urgent_threshold && 
                new Date(p.response_due_at) > now
            ).length,
            
            // Overdue: proposals that timed out
            overdue_count: proposals.filter(p => 
                p.state === 'timed_out'
            ).length,
        };
    }
}
