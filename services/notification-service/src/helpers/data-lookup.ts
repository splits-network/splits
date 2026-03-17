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
    candidate_recruiter_id: string | null;
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
    bio?: string;
    name?: string;
    email?: string;
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

// Note: CandidateRoleAssignment interface removed - data now tracked via applications with stage workflow

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
     * Get recruiters with active (non-rejected, non-withdrawn) candidates on a job.
     * Returns contacts for notification delivery.
     */
    async getActiveRecruitersForJob(jobId: string): Promise<Array<{ email: string; name: string; user_id: string | null }>> {
        const { data: applications, error } = await this.supabase
            .from('applications')
            .select('candidate_recruiter_id')
            .eq('job_id', jobId)
            .not('candidate_recruiter_id', 'is', null)
            .not('status', 'in', '(rejected,withdrawn)')
            .limit(100);

        if (error || !applications || applications.length === 0) return [];

        const recruiterIds = [...new Set(applications.map((a: any) => a.candidate_recruiter_id).filter(Boolean))];
        if (recruiterIds.length === 0) return [];

        const { data: recruiters } = await this.supabase
            .from('recruiters')
            .select('id, user_id')
            .in('id', recruiterIds);

        if (!recruiters || recruiters.length === 0) return [];

        const userIds = recruiters.map((r: any) => r.user_id).filter(Boolean);
        if (userIds.length === 0) return [];

        const { data: users } = await this.supabase
            .from('users')
            .select('id, first_name, last_name, email')
            .in('id', userIds);

        if (!users) return [];

        return users.map((u: any) => ({
            email: u.email,
            name: [u.first_name, u.last_name].filter(Boolean).join(' '),
            user_id: u.id,
        }));
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
     * Get recruiter with bio by ID (for email templates)
     */
    async getRecruiterWithBio(recruiterId: string): Promise<RecruiterData | null> {
        const { data, error } = await this.supabase
            .from('recruiters')
            .select(`
                id,
                user_id,
                status,
                bio,
                users(name, email)
            `)
            .eq('id', recruiterId)
            .single();

        if (error) {
            this.logger.error({ error, recruiterId }, 'Failed to fetch recruiter with bio');
            return null;
        }

        // Flatten the response structure
        // users is an array from the join, so we need to access the first element
        const userInfo = Array.isArray(data.users) ? data.users[0] : data.users;
        return {
            ...data,
            name: userInfo?.name,
            email: userInfo?.email,
        };
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
        if (application.candidate_recruiter_id) {
            recruiter = await this.getRecruiter(application.candidate_recruiter_id);
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
     * Check if this is the first job for a company (milestone detection)
     */
    async isFirstJobForCompany(companyId: string, excludeJobId: string): Promise<boolean> {
        const { count, error } = await this.supabase
            .from('jobs')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .neq('id', excludeJobId);

        if (error) {
            this.logger.error({ error, companyId }, 'Failed to check first job for company');
            return false; // Fail safe — don't send milestone if query fails
        }

        return (count ?? 0) === 0;
    }

    /**
     * Check if this is the first placement for a recruiter (milestone detection)
     */
    async isFirstPlacementForRecruiter(recruiterId: string, excludePlacementId: string): Promise<boolean> {
        const { count, error } = await this.supabase
            .from('placement_collaborators')
            .select('id', { count: 'exact', head: true })
            .eq('recruiter_id', recruiterId)
            .neq('placement_id', excludePlacementId);

        if (error) {
            this.logger.error({ error, recruiterId }, 'Failed to check first placement for recruiter');
            return false;
        }

        return (count ?? 0) === 0;
    }

    /**
     * Check if a milestone notification was already sent (deduplication)
     * Uses event_type + recipient_email to find prior milestone sends
     */
    async wasMilestoneSent(eventType: string, recipientEmail: string): Promise<boolean> {
        const { count, error } = await this.supabase
            .from('notification_log')
            .select('id', { count: 'exact', head: true })
            .eq('event_type', eventType)
            .eq('recipient_email', recipientEmail)
            .eq('status', 'sent');

        if (error) {
            this.logger.error({ error, eventType, recipientEmail }, 'Failed to check milestone dedup');
            return true; // Fail safe — assume already sent if query fails
        }

        return (count ?? 0) > 0;
    }

    /**
     * Check if a user is a candidate (has a candidates table entry)
     */
    async isCandidate(userId: string): Promise<boolean> {
        const { data } = await this.supabase
            .from('candidates')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        return !!data;
    }

    /**
     * Get firm by ID
     */
    async getFirm(firmId: string): Promise<{ id: string; name: string } | null> {
        const { data, error } = await this.supabase
            .from('firms')
            .select('id, name')
            .eq('id', firmId)
            .single();

        if (error) {
            this.logger.error({ error, firmId }, 'Failed to fetch firm');
            return null;
        }

        return data;
    }

    /**
     * Get firm invitation by ID
     */
    async getFirmInvitation(invitationId: string): Promise<{
        id: string;
        firm_id: string;
        email: string;
        role: string;
        token: string;
        expires_at: string;
        invited_by: string;
    } | null> {
        const { data, error } = await this.supabase
            .from('firm_invitations')
            .select('id, firm_id, email, role, token, expires_at, invited_by')
            .eq('id', invitationId)
            .single();

        if (error) {
            this.logger.error({ error, invitationId }, 'Failed to fetch firm invitation');
            return null;
        }

        return data;
    }

    /**
     * Get document by ID
     */
    async getDocument(documentId: string): Promise<{
        id: string;
        entity_type: string;
        entity_id: string;
        document_type: string | null;
        file_name: string | null;
        uploaded_by: string | null;
        created_at: string;
    } | null> {
        const { data, error } = await this.supabase
            .from('documents')
            .select('id, entity_type, entity_id, document_type, file_name, uploaded_by, created_at')
            .eq('id', documentId)
            .single();

        if (error) {
            this.logger.error({ error, documentId }, 'Failed to fetch document');
            return null;
        }

        return data;
    }
}

