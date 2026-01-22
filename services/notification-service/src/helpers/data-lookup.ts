/**
 * Data Lookup Helper for Notification Service
 * 
 * Queries the shared Supabase database directly instead of making HTTP calls
 * to other services. This is more efficient and reliable.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';

export interface ApplicationData {
    id: string;
    job_id: string;
    candidate_id: string;
    recruiter_id: string | null;
    stage: string;
    notes: string | null;
    recruiter_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface JobData {
    id: string;
    title: string;
    description: string | null;
    recruiter_description: string | null;
    company_id: string;
    location: string | null;
    company?: {
        id: string;
        name: string;
        identity_organization_id: string | null;
    };
}

export interface CandidateData {
    id: string;
    full_name: string;
    email: string | null;
    user_id: string | null;
    location: string | null;
}

export interface RecruiterData {
    id: string;
    user_id: string;
    status: string;
}

export interface AIReviewData {
    id: string;
    application_id: string;
    fit_score: number;
    recommendation: string;
    overall_summary: string | null;
    strengths: string[] | null;
    concerns: string[] | null;
    matched_skills: string[] | null;
    missing_skills: string[] | null;
}

export interface UserData {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    clerk_user_id: string | null;
}

export interface PlacementData {
    id: string;
    application_id: string;
    job_id: string;
    candidate_id: string;
    recruiter_id: string;
    company_id: string;
    status: string;
    start_date: string | null;
    placement_fee: number | null;
    split_percentage: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface PlacementCollaboratorData {
    id: string;
    placement_id: string;
    recruiter_id: string;
    role: string;
    split_percentage: number | null;
    status: string;
    recruiter?: RecruiterData;
}

export interface OrganizationData {
    id: string;
    name: string;
    slug: string | null;
    logo_url: string | null;
}

export interface InvitationData {
    id: string;
    organization_id: string;
    email: string;
    role: string;
    status: string;
    invited_by: string | null;
    expires_at: string | null;
    created_at: string;
}

export interface CandidateRoleAssignmentData {
    id: string;
    job_id: string;
    candidate_id: string;
    candidate_recruiter_id: string | null;
    company_recruiter_id: string | null;
    state: string;
    current_gate: string | null;
    gate_sequence: any;
    gate_history: any;
    created_at: string;
    updated_at: string;
}

export class DataLookupHelper {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger
    ) { }

    /**
     * Get application by ID with optional related data
     */
    async getApplication(applicationId: string): Promise<ApplicationData | null> {
        const { data, error } = await this.supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (error) {
            this.logger.error({ error, applicationId }, 'Failed to fetch application');
            return null;
        }

        return data;
    }

    /**
     * Get job by ID with company data
     */
    async getJob(jobId: string): Promise<JobData | null> {
        const { data, error } = await this.supabase
            .from('jobs')
            .select(`
                *,
                company:companies(id, name, identity_organization_id)
            `)
            .eq('id', jobId)
            .single();

        if (error) {
            this.logger.error({ error, jobId }, 'Failed to fetch job');
            return null;
        }

        return data;
    }

    /**
     * Get candidate by ID
     */
    async getCandidate(candidateId: string): Promise<CandidateData | null> {
        const { data, error } = await this.supabase
            .from('candidates')
            .select('*')
            .eq('id', candidateId)
            .single();

        if (error) {
            this.logger.error({ error, candidateId }, 'Failed to fetch candidate');
            return null;
        }

        return data;
    }

    /**
     * Get recruiter by ID
     */
    async getRecruiter(recruiterId: string): Promise<RecruiterData | null> {
        const { data, error } = await this.supabase
            .from('recruiters')
            .select('*')
            .eq('id', recruiterId)
            .single();

        if (error) {
            this.logger.error({ error, recruiterId }, 'Failed to fetch recruiter');
            return null;
        }

        return data;
    }

    /**
     * Get AI review by application ID (most recent)
     */
    async getAIReview(applicationId: string): Promise<AIReviewData | null> {
        const { data, error } = await this.supabase
            .from('ai_reviews')
            .select('*')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            // Not found is ok - may not have an AI review yet
            if (error.code === 'PGRST116') {
                return null;
            }
            this.logger.error({ error, applicationId }, 'Failed to fetch AI review');
            return null;
        }

        return data;
    }

    /**
     * Get company by ID
     */
    async getCompany(companyId: string): Promise<{ id: string; name: string; identity_organization_id: string | null } | null> {
        const { data, error } = await this.supabase
            .from('companies')
            .select('id, name, identity_organization_id')
            .eq('id', companyId)
            .single();

        if (error) {
            this.logger.error({ error, companyId }, 'Failed to fetch company');
            return null;
        }

        return data;
    }

    /**
     * Get full application context (application + job + candidate + recruiter)
     * This is the most common query pattern for notifications
     */
    async getApplicationContext(applicationId: string): Promise<{
        application: ApplicationData;
        job: JobData;
        candidate: CandidateData;
        recruiter: RecruiterData | null;
    } | null> {
        const application = await this.getApplication(applicationId);
        if (!application) {
            this.logger.warn({ applicationId }, 'Application not found for context');
            return null;
        }

        const [job, candidate] = await Promise.all([
            this.getJob(application.job_id),
            this.getCandidate(application.candidate_id),
        ]);

        if (!job || !candidate) {
            this.logger.warn({ applicationId, hasJob: !!job, hasCandidate: !!candidate }, 'Missing job or candidate for context');
            return null;
        }

        let recruiter: RecruiterData | null = null;
        if (application.recruiter_id) {
            recruiter = await this.getRecruiter(application.recruiter_id);
        }

        return { application, job, candidate, recruiter };
    }

    /**
     * Get user by ID
     */
    async getUser(userId: string): Promise<UserData | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            this.logger.error({ error, userId }, 'Failed to fetch user');
            return null;
        }

        return data;
    }

    /**
     * Get user by clerk_user_id
     */
    async getUserByClerkId(clerkUserId: string): Promise<UserData | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            this.logger.error({ error, clerkUserId }, 'Failed to fetch user by clerk ID');
            return null;
        }

        return data;
    }

    /**
     * Get placement by ID
     */
    async getPlacement(placementId: string): Promise<PlacementData | null> {
        const { data, error } = await this.supabase
            .from('placements')
            .select('*')
            .eq('id', placementId)
            .single();

        if (error) {
            this.logger.error({ error, placementId }, 'Failed to fetch placement');
            return null;
        }

        return data;
    }

    /**
     * Get placement collaborators
     */
    async getPlacementCollaborators(placementId: string): Promise<PlacementCollaboratorData[]> {
        const { data, error } = await this.supabase
            .from('placement_collaborators')
            .select('*')
            .eq('placement_id', placementId);

        if (error) {
            this.logger.error({ error, placementId }, 'Failed to fetch placement collaborators');
            return [];
        }

        return data || [];
    }

    /**
     * Get organization by ID
     */
    async getOrganization(organizationId: string): Promise<OrganizationData | null> {
        const { data, error } = await this.supabase
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .single();

        if (error) {
            this.logger.error({ error, organizationId }, 'Failed to fetch organization');
            return null;
        }

        return data;
    }

    /**
     * Get invitation by ID
     */
    async getInvitation(invitationId: string): Promise<InvitationData | null> {
        const { data, error } = await this.supabase
            .from('invitations')
            .select('*')
            .eq('id', invitationId)
            .single();

        if (error) {
            this.logger.error({ error, invitationId }, 'Failed to fetch invitation');
            return null;
        }

        return data;
    }

    /**
     * Get recruiter-candidate relationship by ID
     */
    async getRecruiterCandidate(recruiterCandidateId: string): Promise<{
        id: string;
        recruiter_id: string;
        candidate_id: string;
        status: string;
    } | null> {
        const { data, error } = await this.supabase
            .from('recruiter_candidates')
            .select('*')
            .eq('id', recruiterCandidateId)
            .single();

        if (error) {
            this.logger.error({ error, recruiterCandidateId }, 'Failed to fetch recruiter-candidate');
            return null;
        }

        return data;
    }

    /**
     * Get proposal/candidate role assignment by ID
     */
    async getProposal(proposalId: string): Promise<{
        id: string;
        candidate_id: string;
        job_id: string;
        recruiter_id: string;
        status: string;
        notes: string | null;
    } | null> {
        // Note: candidate_role_assignments table was dropped during application flow consolidation
        // Proposal data is now tracked via applications table
        const { data, error } = await this.supabase
            .from('applications')
            .select('*')
            .eq('id', proposalId)
            .single();

        if (error) {
            this.logger.error({ error, proposalId }, 'Failed to fetch proposal');
            return null;
        }

        return data;
    }

    /**
     * Get candidate role assignment (CRA) by ID
     * Used for gate notification workflows
     * Note: candidate_role_assignments table was dropped during application flow consolidation
     */
    async getCandidateRoleAssignment(craId: string): Promise<CandidateRoleAssignmentData | null> {
        // Note: candidate_role_assignments table was dropped - CRA data now tracked via applications
        const { data, error } = await this.supabase
            .from('applications')
            .select('*')
            .eq('id', craId)
            .single();

        if (error) {
            this.logger.error({ error, craId }, 'Failed to fetch candidate role assignment');
            return null;
        }

        return data;
    }
}

