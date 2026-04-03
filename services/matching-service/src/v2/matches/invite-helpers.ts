/**
 * Invite Helpers
 * Permission checks and recruiter lookup for the invite-to-apply feature.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContext } from '../shared/access.js';
import { EnrichedCandidateRoleMatch } from './types.js';

export interface CandidateRecruiter {
    recruiter_id: string;
    recruiter_user_id: string;
}

/**
 * Look up the active representing recruiter for a candidate.
 * Returns null if candidate is unrepresented.
 */
export async function findCandidateRecruiter(
    supabase: SupabaseClient,
    candidateId: string,
): Promise<CandidateRecruiter | null> {
    const { data } = await supabase
        .from('recruiter_candidates')
        .select('recruiter_id, recruiters!inner(user_id)')
        .eq('candidate_id', candidateId)
        .eq('status', 'active')
        .eq('consent_given', true)
        .limit(1)
        .maybeSingle();

    if (!data) return null;

    return {
        recruiter_id: data.recruiter_id,
        recruiter_user_id: (data as any).recruiters?.user_id,
    };
}

/**
 * Verify that the user has permission to invite a candidate for this match.
 * Allowed: company user whose companyIds include the job's company, recruiter who owns the job, or admin.
 */
export async function verifyInvitePermission(
    supabase: SupabaseClient,
    access: AccessContext,
    match: EnrichedCandidateRoleMatch,
): Promise<void> {
    if (access.isPlatformAdmin) return;

    // Company user: job's company must be in their companyIds
    if (access.companyIds.length > 0) {
        const { data: job } = await supabase
            .from('jobs')
            .select('company_id')
            .eq('id', match.job_id)
            .single();

        if (job && access.companyIds.includes(job.company_id)) return;
    }

    // Also check via organizationIds (company user without direct companyIds)
    if (access.organizationIds.length > 0) {
        const { data: job } = await supabase
            .from('jobs')
            .select('companies!inner(identity_organization_id)')
            .eq('id', match.job_id)
            .single();

        const orgId = (job as any)?.companies?.identity_organization_id;
        if (orgId && access.organizationIds.includes(orgId)) return;
    }

    // Recruiter: must own the job
    if (access.recruiterId) {
        const { data: job } = await supabase
            .from('jobs')
            .select('job_owner_recruiter_id')
            .eq('id', match.job_id)
            .single();

        if (job && job.job_owner_recruiter_id === access.recruiterId) return;
    }

    throw new Error('Not authorized to invite candidates for this role');
}
