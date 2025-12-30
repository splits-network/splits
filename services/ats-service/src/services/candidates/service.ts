import { AtsRepository } from '../../repository';
import { Candidate, MaskedCandidate } from '@splits-network/shared-types';

export class CandidateService {
    constructor(private repository: AtsRepository) {}

    /**
     * Masks candidate data for company users before acceptance
     */
    maskCandidate(candidate: Candidate): MaskedCandidate {
        const names = candidate.full_name.trim().split(' ');
        const initials = names.length > 1
            ? `${names[0][0]}.${names[names.length - 1][0]}.`
            : `${names[0][0]}.`;

        return {
            id: candidate.id,
            email: 'hidden@splits.network',
            full_name: initials,
            linkedin_url: undefined,
            verification_status: candidate.verification_status, // Show verification status even when masked
            created_at: candidate.created_at,
            updated_at: candidate.updated_at,
            _masked: true,
        };
    }

    async getCandidates(filters?: { search?: string; limit?: number; offset?: number; recruiter_id?: string }): Promise<Candidate[]> {
        return await this.repository.findAllCandidates(filters);
    }

    /**
     * Get candidates for authenticated user with role-based scoping and pagination
     * 
     * NO userRole parameter - backend resolves user's role via database JOINs for security.
     * 
     * Role scoping:
     * - Recruiters: Candidates they've sourced (recruiter_id field)
     * - Company Users: Candidates who applied to their company's jobs
     * - Candidates: Only their own profile
     * 
     * Uses direct Supabase queries for 10-25x performance improvement vs service-to-service calls.
     * 
     * @param clerkUserId - Clerk user ID from x-clerk-user-id header
     * @param organizationId - Organization ID from x-organization-id header (optional)
     * @param filters - Search, filtering, sorting, pagination parameters
     * @returns Paginated candidate data with pagination metadata
     */
    async getCandidatesForUser(
        clerkUserId: string,
        organizationId: string | null,
        filters: {
            search?: string;
            verification_status?: string;
            sort_by?: string;
            sort_order?: 'asc' | 'desc';
            page?: number;
            limit?: number;
        }
    ): Promise<{
        data: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
        };
    }> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;

        // Call repository with role resolution via database JOINs
        const { data, total } = await this.repository.findCandidatesForUser(
            clerkUserId,
            organizationId,
            {
                search: filters.search,
                verification_status: filters.verification_status,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order?.toUpperCase() as 'ASC' | 'DESC' || 'DESC',
                page,
                limit,
            }
        );

        // Build pagination object
        const total_pages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                total_pages,
            },
        };
    }

    async getCandidateById(id: string): Promise<Candidate> {
        const candidate = await this.repository.findCandidateById(id);
        if (!candidate) {
            throw new Error(`Candidate ${id} not found`);
        }
        return candidate;
    }

    async findOrCreateCandidate(
        email: string,
        fullName: string,
        linkedinUrl?: string,
        recruiterId?: string
    ): Promise<Candidate> {
        let candidate = await this.repository.findCandidateByEmail(email);
        if (!candidate) {
            candidate = await this.repository.createCandidate({
                email,
                full_name: fullName,
                linkedin_url: linkedinUrl,
                recruiter_id: recruiterId, // SOURCER: Permanent credit for bringing candidate to platform
                verification_status: 'unverified', // Default to unverified when recruiter adds candidate
            });
        }
        return candidate;
    }

    async updateCandidate(
        id: string,
        updates: { 
            full_name?: string; 
            email?: string; 
            linkedin_url?: string;
            github_url?: string;
            portfolio_url?: string;
            phone?: string;
            location?: string;
            current_title?: string;
            current_company?: string;
            bio?: string;
            skills?: string;
        },
        allowSelfManaged: boolean = false
    ): Promise<Candidate> {
        const candidate = await this.repository.findCandidateById(id);
        if (!candidate) {
            throw new Error(`Candidate ${id} not found`);
        }

        // Only allow updates if candidate is not self-managed, unless explicitly allowed
        if (candidate.user_id && !allowSelfManaged) {
            throw new Error('Cannot update self-managed candidate profile');
        }

        return await this.repository.updateCandidate(id, updates);
    }

    /**
     * Get candidate details for a company user
     * Returns masked data if application not accepted
     */
    async getCandidateForCompany(
        candidateId: string,
        companyId: string
    ): Promise<Candidate | MaskedCandidate> {
        const candidate = await this.repository.findCandidateById(candidateId);
        if (!candidate) {
            throw new Error(`Candidate ${candidateId} not found`);
        }

        // Check if any application to this company's jobs has been accepted
        const jobs = await this.repository.findJobsByCompanyId(companyId);
        const jobIds = jobs.map(j => j.id);

        const applications = await this.repository.findApplications({
            candidate_id: candidateId,
            job_ids: jobIds,
        });

        // If no applications found, company shouldn't see this candidate
        if (applications.length === 0) {
            throw new Error('Candidate not found');
        }

        // If any application is accepted, show full details
        const hasAcceptedApplication = applications.some(app => app.accepted_by_company);

        return hasAcceptedApplication ? candidate : this.maskCandidate(candidate);
    }
}
