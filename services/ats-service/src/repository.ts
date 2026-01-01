import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    Company,
    Job,
    Candidate,
    Application,
    Placement,
    CandidateSourcer,
    CandidateOutreach,
    PlacementCollaborator,
    ApplicationAuditLog,
} from '@splits-network/shared-types';

export class AtsRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Health check
    async healthCheck(): Promise<void> {
        // Simple query to verify database connectivity
        const { error } = await this.supabase
            .schema('ats')
            .from('jobs')
            .select('id')
            .limit(1);

        if (error) {
            throw new Error(`Database health check failed: ${error.message}`);
        }
    }

    // Company methods
    async findAllCompanies(): Promise<Company[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async findCompanyById(id: string): Promise<Company | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findCompanyByOrgId(orgId: string): Promise<Company | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .select('*')
            .eq('identity_organization_id', orgId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .insert(company)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Find companies for a user with role-based scoping
     * NO service-to-service calls - resolves role via database JOINs
     * 
     * Role resolution:
     * - Platform Admin: All companies
     * - Company User (admin/hiring_manager): Only their company (via organization_id)
     * - Recruiter: All companies (marketplace model)
     * 
     * @param clerkUserId - The Clerk user ID from x-clerk-user-id header
     * @param organizationId - The organization ID from x-organization-id header (nullable)
     * @param filters - Search, sort, and pagination filters
     * @returns { data: Company[], total: number }
     */
    async findCompaniesForUser(
        clerkUserId: string,
        organizationId: string | null,
        filters: {
            search?: string;
            sort_by?: string;
            sort_order?: 'ASC' | 'DESC';
            page?: number;
            limit?: number;
        } = {}
    ): Promise<{ data: any[]; total: number }> {
        // Extract pagination parameters
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Step 1: Check user roles in parallel (3 subqueries)
        // - Is user a recruiter? (network.recruiters)
        // - Is user a company member? (identity.memberships)
        // - Is user a platform admin? (identity.memberships with platform_admin role)

        const recruiterSubquery = this.supabase
            .schema('network')
            .from('recruiters')
            .select('id, status')
            .eq('clerk_user_id', clerkUserId)
            .eq('status', 'active')
            .maybeSingle();

        let membershipSubquery = null;
        if (organizationId) {
            membershipSubquery = this.supabase
                .schema('identity')
                .from('memberships')
                .select('organization_id, role')
                .eq('clerk_user_id', clerkUserId)
                .eq('organization_id', organizationId)
                .maybeSingle();
        }

        const adminSubquery = this.supabase
            .schema('identity')
            .from('memberships')
            .select('role')
            .eq('clerk_user_id', clerkUserId)
            .eq('role', 'platform_admin')
            .maybeSingle();

        // Execute all role checks in parallel
        const [recruiterResult, membershipResult, adminResult] = await Promise.all([
            recruiterSubquery,
            membershipSubquery || Promise.resolve({ data: null, error: null }),
            adminSubquery,
        ]);

        // Step 2: Build base query with company data
        let query = this.supabase
            .schema('ats')
            .from('companies')
            .select('*');

        // Step 3: Apply role-based filtering
        if (adminResult.data) {
            // Platform Admin: See all companies (no filter)
        } else if (membershipResult.data) {
            // Company User: Only see their company
            query = query.eq('identity_organization_id', membershipResult.data.organization_id);
        } else if (recruiterResult.data) {
            // Recruiter: See all companies (marketplace model)
            // No filter needed - recruiters can work with any company
        } else {
            // No valid role found - return empty results
            return { data: [], total: 0 };
        }

        // Step 4: Apply search filter (by company name)
        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }

        // Step 5: Create separate count query with same filters
        let countQuery = this.supabase
            .schema('ats')
            .from('companies')
            .select('*', { count: 'exact', head: true });

        // Apply same role-based filtering to count query
        if (adminResult.data) {
            // Platform Admin: All companies
        } else if (membershipResult.data) {
            // Company User: Only their company
            countQuery = countQuery.eq('identity_organization_id', membershipResult.data.organization_id);
        } else if (recruiterResult.data) {
            // Recruiter: All companies
        }

        // Apply same search filter to count query
        if (filters.search) {
            countQuery = countQuery.ilike('name', `%${filters.search}%`);
        }

        // Step 6: Apply sorting
        const sortBy = filters.sort_by || 'name';
        const sortOrder = filters.sort_order || 'ASC';
        query = query.order(sortBy, { ascending: sortOrder === 'ASC' });

        // Step 7: Apply pagination
        query = query.range(offset, offset + limit - 1);

        // Step 8: Execute both queries in parallel
        const [{ data, error }, { count, error: countError }] = await Promise.all([
            query,
            countQuery,
        ]);

        if (error) {
            throw error;
        }
        if (countError) {
            throw countError;
        }

        return {
            data: data || [],
            total: count || 0,
        };
    }

    // Job methods
    async findJobs(filters?: { 
        status?: string; 
        search?: string; 
        location?: string;
        employment_type?: string;
        limit?: number; 
        offset?: number;
    }): Promise<Job[]> {
        // Use database function for efficient search including company name
        const searchTerms = filters?.search 
            ? filters.search.trim().split(/\s+/).filter(term => term.length > 0)
            : null;

        const { data, error } = await this.supabase
            .schema('ats')
            .rpc('search_jobs_with_company', {
                search_terms: searchTerms,
                filter_status: filters?.status || null,
                filter_location: filters?.location || null,
                filter_employment_type: filters?.employment_type || null,
                result_limit: filters?.limit || 50,
                result_offset: filters?.offset || 0,
            });

        if (error) throw error;
        
        // Transform database results to Job format with company data
        return (data || []).map((row: any) => ({
            id: row.id,
            company_id: row.company_id,
            title: row.title,
            department: row.department,
            location: row.location,
            salary_min: row.salary_min,
            salary_max: row.salary_max,
            fee_percentage: row.fee_percentage,
            recruiter_description: row.recruiter_description,
            candidate_description: row.candidate_description,
            employment_type: row.employment_type,
            open_to_relocation: row.open_to_relocation,
            show_salary_range: row.show_salary_range,
            splits_fee_percentage: row.splits_fee_percentage,
            job_owner_id: row.job_owner_id,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            company: {
                id: row.company_id,
                name: row.company_name,
                industry: row.company_industry,
                headquarters_location: row.company_headquarters_location,
                logo_url: row.company_logo_url,
                identity_organization_id: row.company_identity_organization_id,
                created_at: row.company_created_at,
                updated_at: row.company_updated_at,
            },
        }));
    }

    async countJobs(filters?: { 
        status?: string; 
        search?: string; 
        location?: string;
        employment_type?: string;
    }): Promise<number> {
        // Use database function for efficient counting
        const searchTerms = filters?.search 
            ? filters.search.trim().split(/\s+/).filter(term => term.length > 0)
            : null;

        const { data, error } = await this.supabase
            .schema('ats')
            .rpc('count_jobs_with_company', {
                search_terms: searchTerms,
                filter_status: filters?.status || null,
                filter_location: filters?.location || null,
                filter_employment_type: filters?.employment_type || null,
            });

        if (error) throw error;
        return data || 0;
    }

    /**
     * NEW: Find jobs for a specific user with role-based scoping via database JOINs
     * Part of API Role-Based Scoping Migration (Phase 3 - Jobs)
     * 
     * Role resolution via parallel database queries:
     * - Recruiter: network.recruiters (clerk_user_id, status='active')
     * - Company User: identity.memberships (organization_id, role IN company_admin/hiring_manager/platform_admin)
     * - Candidate: ats.candidates (user_id) - sees all active jobs
     * 
     * Backend determines data scope - NO userRole parameter needed.
     * 
     * @see docs/migration/MIGRATION-PROGRESS.md
     * @see docs/migration/DATABASE-JOIN-PATTERN.md
     */
    async findJobsForUser(
        clerkUserId: string,
        organizationId: string | null,
        filters: {
            search?: string;
            status?: string;
            location?: string;
            employment_type?: string;
            sort_by?: string;
            sort_order?: 'ASC' | 'DESC';
            page: number;
            limit: number;
        }
    ): Promise<{ data: any[]; total: number }> {
        const offset = (filters.page - 1) * filters.limit;

        // Build the main query with JOIN for company data
        let query = this.supabase
            .schema('ats')
            .from('jobs')
            .select(`
                *,
                company:companies(id, name, industry, headquarters_location, logo_url, identity_organization_id)
            `, { count: 'exact' });

        // Parallel role resolution: Check which role(s) this user has
        // Only ONE of these should match per user
        
        // Option 1: User is recruiter (check network.recruiters)
        const recruiterSubquery = this.supabase
            .schema('network')
            .from('recruiters')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .eq('status', 'active')
            .single();

        // Option 2: User is company admin/hiring manager (check identity.memberships)
        let membershipSubquery = null;
        if (organizationId) {
            membershipSubquery = this.supabase
                .schema('identity')
                .from('memberships')
                .select('organization_id')
                .eq('user_id', clerkUserId)
                .eq('organization_id', organizationId)
                .in('role', ['company_admin', 'hiring_manager', 'platform_admin'])
                .single();
        }

        // Option 3: User is candidate (check ats.candidates)
        const candidateSubquery = this.supabase
            .schema('ats')
            .from('candidates')
            .select('id')
            .eq('user_id', clerkUserId)
            .single();

        // Execute all role checks in parallel
        const [recruiterResult, membershipResult, candidateResult] = await Promise.all([
            recruiterSubquery,
            membershipSubquery || Promise.resolve({ data: null, error: null }),
            candidateSubquery,
        ]);

        // Apply role-based filtering
        if (recruiterResult.data && !recruiterResult.error) {
            // Recruiter: See all active jobs in marketplace
            query = query.eq('status', 'active');
        } else if (membershipResult.data && !membershipResult.error) {
            // Company user: See jobs from their organization only
            const orgId = membershipResult.data.organization_id;
            query = query.eq('company.identity_organization_id', orgId);
        } else if (candidateResult.data && !candidateResult.error) {
            // Candidate: See all active jobs
            query = query.eq('status', 'active');
        } else {
            // No role found - return empty results
            return { data: [], total: 0 };
        }

        // Apply additional filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }

        if (filters.employment_type) {
            query = query.eq('employment_type', filters.employment_type);
        }

        // Search filter (job title, company name)
        if (filters.search) {
            const searchTerm = `%${filters.search.toLowerCase()}%`;
            query = query.or(
                `title.ilike.${searchTerm},company.name.ilike.${searchTerm}`
            );
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = (filters.sort_order || 'DESC') === 'ASC' ? { ascending: true } : { ascending: false };
        query = query.order(sortBy, sortOrder);

        // Apply pagination
        query = query.range(offset, offset + filters.limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0
        };
    }

    async findJobById(id: string): Promise<Job | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findJobsByCompanyId(companyId: string): Promise<Job[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('jobs')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async findJobsByIds(ids: string[]): Promise<Job[]> {
        if (ids.length === 0) return [];

        const { data, error } = await this.supabase
            .schema('ats')
            .from('jobs')
            .select('*')
            .in('id', ids);

        if (error) throw error;
        return data || [];
    }

    async createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('jobs')
            .insert(job)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('jobs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Job Requirements methods
    async findJobRequirements(jobId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_requirements')
            .select('*')
            .eq('job_id', jobId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async createJobRequirement(requirement: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_requirements')
            .insert(requirement)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteJobRequirements(jobId: string): Promise<void> {
        const { error } = await this.supabase
            .schema('ats')
            .from('job_requirements')
            .delete()
            .eq('job_id', jobId);

        if (error) throw error;
    }

    // Job Pre-Screen Questions methods
    async findJobPreScreenQuestions(jobId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_questions')
            .select('*')
            .eq('job_id', jobId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        
        // Map database column 'question' to frontend expected 'question_text'
        return (data || []).map(q => ({
            ...q,
            question_text: q.question
        }));
    }

    async createJobPreScreenQuestion(question: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_questions')
            .insert(question)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteJobPreScreenQuestions(jobId: string): Promise<void> {
        const { error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_questions')
            .delete()
            .eq('job_id', jobId);

        if (error) throw error;
    }

    // Candidate methods
    async findAllCandidates(filters?: { search?: string; limit?: number; offset?: number; recruiter_id?: string }): Promise<Candidate[]> {
        let query = this.supabase
            .schema('ats')
            .from('candidates')
            .select('*');

        if (filters?.recruiter_id) {
            // Filter to candidates SOURCED by this recruiter (permanent visibility only, NOT editing rights)
            // Note: This shows candidates the recruiter brought to the platform
            // Active relationships (in network.recruiter_candidates) are required for editing/representing
            query = query.eq('recruiter_id', filters.recruiter_id);
        }

        if (filters?.search) {
            query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        query = query.order('created_at', { ascending: false });

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    }

    /**
     * Find candidates for authenticated user with role-based scoping
     * 
     * Role scoping logic:
     * - Recruiters: Candidates they've sourced (recruiter_id) OR have active relationships with
     * - Company Users: Candidates who applied to their company's jobs
     * - Candidates: Only their own profile
     * 
     * Uses direct Supabase queries with role-based JOINs for performance (10-25x faster).
     * 
     * Role resolution via parallel database queries:
     * - network.recruiters (if record exists with clerk_user_id + status='active', user is recruiter)
     * - identity.memberships (if record exists with matching organization + role, user is company user)
     * - ats.candidates (if record exists with user_id, user is candidate)
     * 
     * @param clerkUserId - Clerk user ID from x-clerk-user-id header
     * @param organizationId - Organization ID for additional context (optional)
     * @param filters - Filtering, search, sorting, pagination parameters
     */
    async findCandidatesForUser(
        clerkUserId: string,
        organizationId: string | null,
        filters: {
            search?: string;
            verification_status?: string;
            sort_by?: string;
            sort_order?: 'ASC' | 'DESC';
            page: number;
            limit: number;
        }
    ): Promise<{ data: any[]; total: number }> {
        const offset = (filters.page - 1) * filters.limit;

        // Build the main query
        let query = this.supabase
            .schema('ats')
            .from('candidates')
            .select('*', { count: 'exact' });

        // Role resolution: Check what role this user has via parallel database queries
        // Option 1: User is recruiter (check network.recruiters)
        const recruiterSubquery = this.supabase
            .schema('network')
            .from('recruiters')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .eq('status', 'active')
            .single();

        // Option 2: User is company admin/hiring manager (check identity.memberships)
        let membershipSubquery = null;
        if (organizationId) {
            membershipSubquery = this.supabase
                .schema('identity')
                .from('memberships')
                .select('organization_id')
                .eq('user_id', clerkUserId)
                .eq('organization_id', organizationId)
                .in('role', ['company_admin', 'hiring_manager', 'platform_admin'])
                .single();
        }

        // Option 3: User is candidate (check ats.candidates via identity.users)
        // First resolve clerk_user_id to internal user_id
        const userSubquery = this.supabase
            .schema('identity')
            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .single();

        // Execute user lookup first to get internal ID
        const userResult = await userSubquery;
        let candidateSubquery = null;
        if (userResult.data && !userResult.error) {
            candidateSubquery = this.supabase
                .schema('ats')
                .from('candidates')
                .select('id')
                .eq('user_id', userResult.data.id)
                .single();
        }

        // Execute role checks in parallel
        const [recruiterResult, membershipResult, candidateResult] = await Promise.all([
            recruiterSubquery,
            membershipSubquery || Promise.resolve({ data: null, error: null }),
            candidateSubquery || Promise.resolve({ data: null, error: null }),
        ]);

        // Apply role-based filters
        let isRecruiter = false;
        let isCompanyUser = false;
        let isCandidate = false;

        if (recruiterResult.data && !recruiterResult.error) {
            // User is recruiter - see candidates they've sourced
            // Note: Active relationships filtering would require additional query to network.recruiter_candidates
            // For now, showing all candidates they sourced (permanent visibility)
            isRecruiter = true;
            query = query.eq('recruiter_id', recruiterResult.data.id);
        } else if (membershipResult.data && !membershipResult.error) {
            // User is company admin/hiring manager - see candidates who applied to their jobs
            // Need to JOIN through applications and jobs tables
            isCompanyUser = true;
            
            // Get candidate IDs from applications to company's jobs
            const { data: applicationData, error: appError } = await this.supabase
                .schema('ats')
                .from('applications')
                .select(`
                    candidate_id,
                    job:jobs!inner(company_id)
                `)
                .eq('job.company_id', membershipResult.data.organization_id);

            if (appError) throw appError;

            if (applicationData && applicationData.length > 0) {
                const candidateIds = [...new Set(applicationData.map((app: any) => app.candidate_id))];
                query = query.in('id', candidateIds);
            } else {
                // No applications to company jobs - return empty
                return { data: [], total: 0 };
            }
        } else if (candidateResult.data && !candidateResult.error) {
            // User is candidate - see only their own profile
            isCandidate = true;
            query = query.eq('id', candidateResult.data.id);
        } else {
            // No role found - return empty results
            return { data: [], total: 0 };
        }

        // Apply additional filters
        if (filters.verification_status) {
            query = query.eq('verification_status', filters.verification_status);
        }

        // Search filter (name, email)
        if (filters.search) {
            const searchTerm = `%${filters.search.toLowerCase()}%`;
            query = query.or(
                `full_name.ilike.${searchTerm},email.ilike.${searchTerm}`
            );
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = (filters.sort_order || 'DESC') === 'ASC' ? { ascending: true } : { ascending: false };
        query = query.order(sortBy, sortOrder);

        // Apply pagination
        query = query.range(offset, offset + filters.limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0
        };
    }

    async findCandidateById(id: string): Promise<Candidate | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findCandidateByEmail(email: string): Promise<Candidate | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findCandidateByClerkUserId(clerkUserId: string): Promise<Candidate | null> {
        // First, find the internal user ID from clerk_user_id
        const { data: userData, error: userError } = await this.supabase
            .schema('identity')
            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (userError) {
            if (userError.code === 'PGRST116') return null;
            throw userError;
        }

        if (!userData) {
            return null;
        }

        // Then find the candidate by user_id
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .select('*')
            .eq('user_id', userData.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        
        return data;
    }

    async findUserByClerkUserId(clerkUserId: string): Promise<{ id: string; email: string; name: string } | null> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('users')
            .select('id, email, name')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
        const { data, error} = await this.supabase
            .schema('ats')
            .from('candidates')
            .insert(candidate)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCandidate(id: string, updates: { 
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
    }): Promise<Candidate> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Link candidate to user account and verify them
     * Called when candidate accepts invitation and creates account
     */
    async linkCandidateToUser(candidateId: string, userId: string): Promise<Candidate> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .update({
                user_id: userId,
                verification_status: 'verified',
                verified_at: new Date().toISOString(),
                verified_by_user_id: userId,
            })
            .eq('id', candidateId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Application methods
    async findApplications(filters?: {
        recruiter_id?: string;
        job_id?: string;
        job_ids?: string[];
        candidate_id?: string;
        stage?: string
    }): Promise<Application[]> {
        let query = this.supabase
            .schema('ats')
            .from('applications')
            .select('*');

        if (filters?.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters?.job_id) {
            query = query.eq('job_id', filters.job_id);
        }
        if (filters?.job_ids && filters.job_ids.length > 0) {
            query = query.in('job_id', filters.job_ids);
        }
        if (filters?.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }
        if (filters?.stage) {
            query = query.eq('stage', filters.stage);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    }

    // Server-side paginated applications with enriched data using database function (fast!)
    async findApplicationsPaginated(params: {
        page?: number;
        limit?: number;
        search?: string;
        stage?: string;
        recruiter_id?: string;
        job_id?: string;
        job_ids?: string[];
        candidate_id?: string;
        company_id?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    }): Promise<{
        data: Array<Application & {
            candidate: { id: string; full_name: string; email: string; linkedin_url?: string; _masked?: boolean };
            job: { id: string; title: string; company_id: string };
            company: { id: string; name: string };
            recruiter?: { id: string; name: string; email: string };
        }>;
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    }> {
        const page = params.page || 1;
        const limit = params.limit || 25;
        const offset = (page - 1) * limit;
        const sortBy = params.sort_by || 'created_at';
        const sortOrder = params.sort_order || 'desc';

        // Split search terms for multi-word matching (e.g., "toot developer" -> ["toot", "developer"])
        const searchTerms = params.search 
            ? params.search.trim().split(/\s+/).filter(term => term.length > 0)
            : null;

        // Use database function for maximum performance with full-text search
        const { data, error } = await this.supabase
            .schema('ats')
            .rpc('search_applications_paginated', {
                search_terms: searchTerms,
                filter_recruiter_id: params.recruiter_id || null,
                filter_job_id: params.job_id || null,
                filter_candidate_id: params.candidate_id || null,
                filter_stage: params.stage || null,
                filter_company_id: params.company_id || null,
                sort_column: sortBy,
                sort_direction: sortOrder,
                result_limit: limit,
                result_offset: offset,
            });

        if (error) throw error;

        // Get total from first row (window function COUNT(*) OVER())
        const total = data && data.length > 0 ? data[0].total_count : 0;

        // Debug: Log what's coming from the database
        if (data && data.length > 0) {
            console.log('[ATS Repository Debug] First row from DB:', {
                job_company_id: data[0].job_company_id,
                company_name: data[0].company_name,
                candidate_name: data[0].candidate_name,
                job_title: data[0].job_title,
            });
        }

        // Map database results to expected nested structure
        const enrichedData = (data || []).map((row: any) => ({
            id: row.id,
            job_id: row.job_id,
            candidate_id: row.candidate_id,
            recruiter_id: row.recruiter_id,
            stage: row.stage,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
            accepted_by_company: row.accepted_by_company,
            accepted_at: row.accepted_at,
            recruiter_notes: row.recruiter_notes,
            application_source: row.application_source,
            candidate: {
                id: row.candidate_id,
                full_name: row.candidate_name,
                email: row.candidate_email,
                linkedin_url: row.candidate_linkedin,
            },
            job: {
                id: row.job_id,
                title: row.job_title,
                company_id: row.job_company_id,
            },
            company: row.job_company_id ? {
                id: row.job_company_id,
                name: row.company_name,
            } : null,
        }));

        // Debug: Log what we're returning
        if (enrichedData.length > 0) {
            console.log('[ATS Repository Debug] First enriched result:', {
                id: enrichedData[0].id,
                job: enrichedData[0].job,
                company: enrichedData[0].company,
            });
        }

        const totalPages = Math.ceil(total / limit);

        return {
            data: enrichedData,
            total,
            page,
            limit,
            total_pages: totalPages,
        };
    }

    /**
     * NEW: Find applications for a user using direct Supabase queries with role-based JOINs
     * Part of API Role-Based Scoping Migration (Phase 2 - Applications)
     * 
     * This method replaces service-to-service calls with database JOINs for 10-25x better performance.
     * Role resolution happens via database queries:
     *   - Recruiter: JOIN to network.recruiters
     *   - Company Admin/Hiring Manager: JOIN to identity.memberships
     *   - Candidate: JOIN to ats.candidates
     * 
     * Pattern: Two-query approach (data + count) for maximum performance
     */
    async findApplicationsForUser(
        clerkUserId: string,
        organizationId: string | null,
        filters: {
            search?: string;
            stage?: string;
            job_id?: string;
            candidate_id?: string;
            company_id?: string;
            sort_by?: string;
            sort_order?: 'ASC' | 'DESC';
            page: number;
            limit: number;
        }
    ): Promise<{ data: any[]; total: number }> {
        const offset = (filters.page - 1) * filters.limit;

        // Build the main query with JOINs for enriched data and role resolution
        let query = this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                job:jobs(id, title, company_id, status, location),
                candidate:candidates(id, full_name, email, linkedin_url),
                company:companies!applications_job_id_fkey(id, name)
            `, { count: 'exact' });

        // Role-based filtering via LEFT JOINs
        // We use LEFT JOINs so we can check which role matches
        // Only ONE of these should match per user

        // Option 1: User is a recruiter (check network.recruiters)
        const recruiterSubquery = this.supabase
            .schema('network')
            .from('recruiters')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .eq('status', 'active')
            .single();

        // Option 2: User is company admin/hiring manager (check identity.memberships)
        let membershipSubquery = null;
        if (organizationId) {
            membershipSubquery = this.supabase
                .schema('identity')
                .from('memberships')
                .select('organization_id')
                .eq('user_id', clerkUserId)
                .eq('organization_id', organizationId)
                .in('role', ['company_admin', 'hiring_manager', 'platform_admin'])
                .single();
        }

        // Option 3: User is a candidate (check ats.candidates)
        const candidateSubquery = this.supabase
            .schema('ats')
            .from('candidates')
            .select('id')
            .eq('user_id', clerkUserId)
            .single();

        // Execute role checks in parallel
        const [recruiterResult, membershipResult, candidateResult] = await Promise.all([
            recruiterSubquery,
            membershipSubquery,
            candidateSubquery,
        ]);

        // Apply role-based filters with priority (check recruiter FIRST)
        // NOTE: If user has multiple roles (e.g., recruiter + company_admin),
        // we prioritize recruiter role to show only their own applications
        let isRecruiter = false;
        let isCompanyUser = false;
        let isCandidate = false;

        if (recruiterResult.data) {
            // User is a recruiter - filter by their recruiter_id
            // NOTE: Check recruiter FIRST before company roles, even if they have both
            isRecruiter = true;
            query = query.eq('recruiter_id', recruiterResult.data.id);
        } else if (membershipResult?.data) {
            // User is company admin/hiring manager - filter by company
            // Only apply this if NOT a recruiter
            isCompanyUser = true;
            // Get company_id from the jobs table via JOIN
            query = query.eq('job.company_id', membershipResult.data.organization_id);
        } else if (candidateResult.data) {
            // User is a candidate - filter by their candidate_id
            // Only apply this if NOT a recruiter or company user
            isCandidate = true;
            query = query.eq('candidate_id', candidateResult.data.id);
        } else {
            // If user has no matching role, return empty results
            return { data: [], total: 0 };
        }

        // Apply additional filters
        if (filters.stage) {
            query = query.eq('stage', filters.stage);
        }

        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
        }

        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }

        if (filters.company_id) {
            query = query.eq('job.company_id', filters.company_id);
        }

        // Search filter (candidate name, job title)
        if (filters.search) {
            const searchTerm = `%${filters.search.toLowerCase()}%`;
            query = query.or(
                `candidate.full_name.ilike.${searchTerm},job.title.ilike.${searchTerm}`
            );
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = (filters.sort_order || 'DESC') === 'ASC' ? { ascending: true } : { ascending: false };
        query = query.order(sortBy, sortOrder);

        // Apply pagination
        query = query.range(offset, offset + filters.limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0
        };
    }

    async findApplicationById(id: string): Promise<Application | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findApplicationsByJobId(jobId: string): Promise<Application[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async findApplicationsByCandidateId(candidateId: string): Promise<Application[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select('*')
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Find applications with enriched job data for a candidate
     * Eliminates N+1 query problem by using JOIN
     */
    async findApplicationsWithJobsByCandidateId(candidateId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                job:jobs(*)
            `)
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async findApplicationsByRecruiterId(recruiterId: string): Promise<Application[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select('*')
            .eq('recruiter_id', recruiterId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async createApplication(application: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .insert(application)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Placement methods
    async findAllPlacements(filters?: {
        recruiter_id?: string;
        company_id?: string;
        date_from?: string;
        date_to?: string;
    }): Promise<Placement[]> {
        let query = this.supabase
            .schema('ats')
            .from('placements')
            .select('*');

        if (filters?.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters?.company_id) {
            query = query.eq('company_id', filters.company_id);
        }
        if (filters?.date_from) {
            query = query.gte('hired_at', filters.date_from);
        }
        if (filters?.date_to) {
            query = query.lte('hired_at', filters.date_to);
        }

        query = query.order('hired_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    }

    async findPlacementById(id: string): Promise<Placement | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placements')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findPlacementsByRecruiterId(recruiterId: string): Promise<Placement[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placements')
            .select('*')
            .eq('recruiter_id', recruiterId)
            .order('hired_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async findPlacementsByCompanyId(companyId: string): Promise<Placement[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placements')
            .select('*')
            .eq('company_id', companyId)
            .order('hired_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async createPlacement(placement: Omit<Placement, 'id' | 'created_at' | 'updated_at'>): Promise<Placement> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placements')
            .insert(placement)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updatePlacement(id: string, updates: Partial<Placement>): Promise<Placement> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placements')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ========================================================================
    // Phase 2: Candidate Sourcing & Ownership
    // ========================================================================

    async findCandidateSourcer(candidateId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidate_sourcers')
            .select('*')
            .eq('candidate_id', candidateId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createCandidateSourcer(sourcer: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidate_sourcers')
            .insert(sourcer)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findAllCandidateSourcers(): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidate_sourcers')
            .select('*')
            .order('sourced_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async findCandidateOutreach(filters: {
        candidate_id?: string;
        recruiter_user_id?: string;
        job_id?: string;
    }): Promise<any[]> {
        let query = this.supabase
            .schema('ats')
            .from('candidate_outreach')
            .select('*');

        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }
        if (filters.recruiter_user_id) {
            query = query.eq('recruiter_user_id', filters.recruiter_user_id);
        }
        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
        }

        query = query.order('sent_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async createCandidateOutreach(outreach: any): Promise<any> {
        const { data, error} = await this.supabase
            .schema('ats')
            .from('candidate_outreach')
            .insert(outreach)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCandidateOutreach(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidate_outreach')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ========================================================================
    // Phase 2: Placement Collaborators
    // ========================================================================

    async findPlacementCollaborators(placementId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placement_collaborators')
            .select('*')
            .eq('placement_id', placementId);

        if (error) throw error;
        return data || [];
    }

    async createPlacementCollaborator(collaborator: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placement_collaborators')
            .insert(collaborator)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findCollaborationsByRecruiter(recruiterUserId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placement_collaborators')
            .select('*')
            .eq('recruiter_user_id', recruiterUserId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // Recruiter relationship methods (cross-schema query to network schema)
    async findActiveRecruiterForCandidate(candidateId: string): Promise<{ recruiter_id: string; recruiter_user_id: string } | null> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .select('recruiter_id, recruiters!inner(id, user_id)')
            .eq('candidate_id', candidateId)
            .eq('status', 'active')
            .eq('consent_given', true)
            .gte('relationship_end_date', new Date().toISOString())
            .order('relationship_start_date', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned - no active recruiter relationship
                return null;
            }
            throw error;
        }

        if (!data) return null;

        return {
            recruiter_id: data.recruiter_id,
            recruiter_user_id: (data.recruiters as any).user_id
        };
    }

    // Stats methods
    async getAtsStats(): Promise<{
        totalJobs: number;
        activeJobs: number;
        totalApplications: number;
        totalPlacements: number
    }> {
        // Use Promise.all to fetch all counts in parallel
        const [jobsData, applicationsData, placementsData] = await Promise.all([
            this.supabase.schema('ats').from('jobs').select('status'),
            this.supabase.schema('ats').from('applications').select('id', { count: 'exact', head: true }),
            this.supabase.schema('ats').from('placements').select('id', { count: 'exact', head: true }),
        ]);

        if (jobsData.error) throw jobsData.error;
        if (applicationsData.error) throw applicationsData.error;
        if (placementsData.error) throw placementsData.error;

        const totalJobs = jobsData.data?.length || 0;
        const activeJobs = jobsData.data?.filter(j => j.status === 'active').length || 0;
        const totalApplications = applicationsData.count || 0;
        const totalPlacements = placementsData.count || 0;

        return {
            totalJobs,
            activeJobs,
            totalApplications,
            totalPlacements,
        };
    }

    // Audit log methods
    async createAuditLog(log: Omit<ApplicationAuditLog, 'id' | 'created_at'>): Promise<ApplicationAuditLog> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('application_audit_log')
            .insert({
                application_id: log.application_id,
                action: log.action,
                performed_by_user_id: log.performed_by_user_id,
                performed_by_role: log.performed_by_role,
                company_id: log.company_id,
                old_value: log.old_value,
                new_value: log.new_value,
                metadata: log.metadata,
                ip_address: log.ip_address,
                user_agent: log.user_agent,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getAuditLogsForApplication(applicationId: string): Promise<ApplicationAuditLog[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('application_audit_log')
            .select('*')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async getAuditLogsForCompany(companyId: string, limit?: number): Promise<ApplicationAuditLog[]> {
        let query = this.supabase
            .schema('ats')
            .from('application_audit_log')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    }

    // Document linking methods (uses existing documents table with entity pattern)
    async linkDocumentToApplication(
        documentId: string,
        applicationId: string,
        isPrimary: boolean
    ): Promise<void> {
        // Get the original document to copy storage details
        const { data: originalDoc, error: fetchError } = await this.supabase
            .schema('documents')
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .single();

        if (fetchError || !originalDoc) {
            throw new Error(`Document ${documentId} not found`);
        }

        // Create new document record linked to application (same storage_path, new entity)
        const { error: insertError } = await this.supabase
            .schema('documents')
            .from('documents')
            .insert({
                entity_type: 'application',
                entity_id: applicationId,
                document_type: originalDoc.document_type,
                filename: originalDoc.filename,
                storage_path: originalDoc.storage_path,
                bucket_name: originalDoc.bucket_name,
                content_type: originalDoc.content_type,
                file_size: originalDoc.file_size,
                uploaded_by_user_id: originalDoc.uploaded_by_user_id,
                processing_status: originalDoc.processing_status,
                metadata: { 
                    ...originalDoc.metadata, 
                    is_primary: isPrimary,
                    original_document_id: documentId 
                },
            });

        if (insertError) throw insertError;
    }

    async getDocumentsForApplication(applicationId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('documents')
            .from('documents')
            .select('*')
            .eq('entity_type', 'application')
            .eq('entity_id', applicationId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Map database column names to frontend expected names
        return (data || []).map(doc => ({
            ...doc,
            file_name: doc.filename,
            file_size: doc.file_size,
            file_url: doc.storage_path, // Can be used to generate download URL
            uploaded_at: doc.created_at,
            is_primary: doc.metadata?.is_primary || false
        }));
    }

    // Document update method
    async updateDocument(documentId: string, updates: {
        entity_id?: string;
        entity_type?: string;
        metadata?: any;
    }): Promise<any> {
        const { data, error } = await this.supabase
            .schema('documents')
            .from('documents')
            .update(updates)
            .eq('id', documentId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Pre-screen answer methods
    async savePreScreenAnswer(answer: {
        application_id: string;
        question_id: string;
        answer: any;
    }): Promise<any> {
        return this.createPreScreenAnswer(answer);
    }

    async createPreScreenAnswer(answer: {
        application_id: string;
        question_id: string;
        answer: any;
    }): Promise<any> {
        // Use UPSERT to handle resubmissions - update answer if it exists
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_answers')
            .upsert(answer, {
                onConflict: 'application_id,question_id',
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getPreScreenAnswersForApplication(applicationId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_answers')
            .select(`
                *,
                question:job_pre_screen_questions(*)
            `)
            .eq('application_id', applicationId);

        if (error) throw error;
        return data || [];
    }

    async getPreScreenQuestionsForJob(jobId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_questions')
            .select('*')
            .eq('job_id', jobId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        
        // Map database column 'question' to frontend expected 'question_text'
        return (data || []).map(q => ({
            ...q,
            question_text: q.question
        }));
    }

    // AI Review methods
    async createAIReview(review: {
        application_id: string;
        fit_score: number;
        recommendation: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
        overall_summary: string;
        confidence_level: number;
        strengths: string[];
        concerns: string[];
        matched_skills: string[];
        missing_skills: string[];
        skills_match_percentage: number;
        required_years?: number;
        candidate_years?: number;
        meets_experience_requirement?: boolean;
        location_compatibility: 'perfect' | 'good' | 'challenging' | 'mismatch';
        model_version: string;
        processing_time_ms: number;
        analyzed_at: Date;
    }): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('ai_reviews')
            .insert({
                ...review,
                analyzed_at: review.analyzed_at.toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findAIReviewByApplicationId(applicationId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('ai_reviews')
            .select('*')
            .eq('application_id', applicationId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findAIReviewById(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('ai_reviews')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data ?? null;
    }

    async getAIReviewStatsByJobId(jobId: string): Promise<{
        total_applications: number;
        ai_reviewed_count: number;
        average_fit_score: number;
        recommendation_breakdown: {
            strong_fit: number;
            good_fit: number;
            fair_fit: number;
            poor_fit: number;
        };
        most_matched_skills: string[];
        most_missing_skills: string[];
    }> {
        // Get all applications for this job with their AI reviews
        const { data: applications, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                id,
                ai_reviewed,
                ai_reviews (
                    fit_score,
                    recommendation,
                    matched_skills,
                    missing_skills
                )
            `)
            .eq('job_id', jobId);

        if (error) throw error;

        const total = applications?.length || 0;
        const reviewed = applications?.filter(a => a.ai_reviewed) || [];
        const reviews = reviewed.map(a => a.ai_reviews).filter(Boolean).flat();

        // Calculate average fit score
        const avgFitScore = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.fit_score, 0) / reviews.length
            : 0;

        // Count recommendations
        const recommendations = {
            strong_fit: reviews.filter(r => r.recommendation === 'strong_fit').length,
            good_fit: reviews.filter(r => r.recommendation === 'good_fit').length,
            fair_fit: reviews.filter(r => r.recommendation === 'fair_fit').length,
            poor_fit: reviews.filter(r => r.recommendation === 'poor_fit').length,
        };

        // Count skill frequencies
        const skillCounts = new Map<string, number>();
        reviews.forEach(r => {
            r.matched_skills?.forEach((skill: string) => {
                skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
            });
        });

        const missingSkillCounts = new Map<string, number>();
        reviews.forEach(r => {
            r.missing_skills?.forEach((skill: string) => {
                missingSkillCounts.set(skill, (missingSkillCounts.get(skill) || 0) + 1);
            });
        });

        // Get top 5 matched and missing skills
        const topMatched = Array.from(skillCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill]) => skill);

        const topMissing = Array.from(missingSkillCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill]) => skill);

        return {
            total_applications: total,
            ai_reviewed_count: reviewed.length,
            average_fit_score: Math.round(avgFitScore * 10) / 10,
            recommendation_breakdown: recommendations,
            most_matched_skills: topMatched,
            most_missing_skills: topMissing,
        };
    }

    // ============================================================================
    // UNIFIED PROPOSAL METHODS
    // ============================================================================
    // These methods use direct Supabase queries with JOINs for role-based filtering.
    // Performance: 10-50ms (single query with JOINs vs 200-500ms with HTTP calls).
    // No SQL functions needed - Supabase query builder handles JOINs natively.
    // @see docs/migration/DATABASE-JOIN-PATTERN.md

    /**
     * Get proposals for user using direct Supabase query with JOINs
     * 
     * Query JOINs to role tables to determine user's role:
     * - network.recruiters (if record exists, user is recruiter)
     * - identity.memberships (if record exists, user is company_admin/hiring_manager/platform_admin)
     * - ats.candidates (if record exists, user is candidate)
     * 
     * WHERE clause uses OR conditions to return proposals user can see based on role.
     * Single query returns enriched data (no N+1 queries).
     * 
     * @param clerkUserId - Clerk user ID from x-clerk-user-id header
     * @param organizationId - Organization ID for additional context (optional)
     * @param filters - Filtering, search, sorting, pagination parameters
     */
    async findProposalsForUser(
        clerkUserId: string,
        organizationId: string | null,
        filters: {
            // Filtering
            type?: string;
            state?: string;
            job_id?: string;
            company_id?: string;
            created_after?: string;
            created_before?: string;
            urgent_only?: boolean;
            
            // Search
            search?: string;
            
            // Sorting
            sort_by?: string;
            sort_order?: 'ASC' | 'DESC';
            
            // Pagination
            page: number;
            limit: number;
        }
    ): Promise<{ data: any[]; total: number }> {
        const offset = (filters.page - 1) * filters.limit;

        // Build the main query with JOINs for enriched data and role resolution
        let query = this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                job:jobs(id, title, company_id, status, location, type, salary_min, salary_max),
                candidate:candidates(id, full_name, email, linkedin_url),
                company:companies(id, name),
                stage:application_stages(id, name, type, sort_order)
            `, { count: 'exact' });

        // JOIN to identity.users to get internal user ID from Clerk ID
        // Then LEFT JOIN to role tables to determine what user can see
        // Note: Supabase doesn't support raw JOINs in .select(), so we'll filter in WHERE
        // We need to first resolve the user's role context, then filter

        // Step 1: Get user's role context (what IDs they can filter by)
        const { data: userContext } = await this.supabase
            .schema('identity')
            .from('users')
            .select(`
                id,
                recruiter:network.recruiters!user_id(id, status),
                memberships:identity.memberships!user_id(organization_id, role),
                candidate:ats.candidates!user_id(id)
            `)
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (!userContext) {
            // User not found - return empty
            return { data: [], total: 0 };
        }

        // Supabase type generation struggles with cross-schema joins; coerce to any for flexibility
        const userContextData = userContext as any;

        // Step 2: Build WHERE clause based on role
        const isRecruiter = userContextData.recruiter && userContextData.recruiter.status === 'active';
        const memberships = userContextData.memberships || [];
        const isPlatformAdmin = memberships.some((m: any) => m.role === 'platform_admin');
        const companyMemberships = memberships.filter((m: any) => 
            m.role === 'company_admin' || m.role === 'hiring_manager'
        );
        const isCandidate = !!userContextData.candidate;

        // Build OR conditions for role-based filtering
        const roleFilters: string[] = [];

        if (isRecruiter) {
            roleFilters.push(`recruiter_id.eq.${userContextData.recruiter.id}`);
        }

        if (companyMemberships.length > 0) {
            const orgIds = companyMemberships.map((m: any) => m.organization_id);
            // Need to join to companies to filter by organization
            // For now, filter by company_id directly (assumes company.identity_organization_id matches)
            roleFilters.push(`company_id.in.(${orgIds.join(',')})`);
        }

        if (isCandidate) {
            roleFilters.push(`candidate_id.eq.${userContextData.candidate.id}`);
        }

        if (isPlatformAdmin) {
            // Platform admin sees all (or filtered by organizationId if provided)
            if (organizationId) {
                roleFilters.push(`company.identity_organization_id.eq.${organizationId}`);
            }
            // If no organizationId, don't add filter (see all)
        }

        if (roleFilters.length === 0) {
            // User has no role - return empty
            return { data: [], total: 0 };
        }

        // Apply role-based filtering (OR conditions)
        query = query.or(roleFilters.join(','));

        // Step 3: Apply additional filters
        if (filters.type) {
            query = query.eq('type', filters.type);
        }

        if (filters.state) {
            // Map state to status for backwards compatibility
            query = query.eq('status', filters.state);
        }

        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
        }

        if (filters.company_id) {
            query = query.eq('company_id', filters.company_id);
        }

        if (filters.created_after) {
            query = query.gte('created_at', filters.created_after);
        }

        if (filters.created_before) {
            query = query.lte('created_at', filters.created_before);
        }

        if (filters.urgent_only) {
            query = query.eq('is_urgent', true);
        }

        // Step 4: Apply search (if provided)
        if (filters.search) {
            // Search across job title, candidate name, company name
            query = query.or(`job.title.ilike.%${filters.search}%,candidate.full_name.ilike.%${filters.search}%,company.name.ilike.%${filters.search}%`);
        }

        // Step 5: Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = (filters.sort_order || 'DESC') === 'ASC' ? { ascending: true } : { ascending: false };
        query = query.order(sortBy, sortOrder);

        // Step 6: Apply pagination
        query = query.range(offset, offset + filters.limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0
        };
    }

    /**
     * Get single proposal by ID with permission check
     * 
     * Verifies user has permission to view this proposal based on their role
     * (recruiter, company user, candidate, admin).
     * 
     * @param proposalId - Application ID (proposals are enriched applications)
     * @param clerkUserId - Clerk user ID from x-clerk-user-id header
     * @param organizationId - Organization ID for additional context (optional)
     */
    async findProposalById(
        proposalId: string,
        clerkUserId: string,
        organizationId: string | null
    ): Promise<any | null> {
        // Use findProposalsForUser with id filter to leverage same permission logic
        const result = await this.findProposalsForUser(clerkUserId, organizationId, {
            page: 1,
            limit: 1
        });

        // Add id filter
        const query = this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                job:jobs(id, title, company_id, status, location, type, salary_min, salary_max),
                candidate:candidates(id, full_name, email, linkedin_url),
                company:companies(id, name),
                stage:application_stages(id, name, type, sort_order)
            `)
            .eq('id', proposalId)
            .single();

        const { data, error } = await query;

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        // Verify user has permission (reuse role check logic)
        const hasPermission = await this.checkProposalPermission(proposalId, clerkUserId);
        if (!hasPermission) {
            return null;
        }

        return data;
    }

    /**
     * Helper: Check if user has permission to view a specific proposal
     */
    private async checkProposalPermission(
        proposalId: string,
        clerkUserId: string
    ): Promise<boolean> {
        const { data: userContextRaw } = await this.supabase
            .schema('identity')
            .from('users')
            .select(`
                id,
                recruiter:network.recruiters!user_id(id, status),
                memberships:identity.memberships!user_id(organization_id, role),
                candidate:ats.candidates!user_id(id)
            `)
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (!userContextRaw) return false;

        const userContext = userContextRaw as any;

        const { data: proposal } = await this.supabase
            .schema('ats')
            .from('applications')
            .select('recruiter_id, candidate_id, company_id, job:jobs(company_id)')
            .eq('id', proposalId)
            .single();

        if (!proposal) return false;

        // Check recruiter permission
        if (userContext.recruiter && proposal.recruiter_id === userContext.recruiter.id) {
            return true;
        }

        // Check candidate permission
        if (userContext.candidate && proposal.candidate_id === userContext.candidate.id) {
            return true;
        }

        // Check company permission
        const memberships = userContext.memberships || [];
        const companyMemberships = memberships.filter((m: any) => 
            m.role === 'company_admin' || m.role === 'hiring_manager'
        );
        
        for (const membership of companyMemberships) {
            // Check if company's identity_organization_id matches membership
            const { data: company } = await this.supabase
                .schema('ats')
                .from('companies')
                .select('identity_organization_id')
                .eq('id', proposal.company_id)
                .single();
            
            if (company && company.identity_organization_id === membership.organization_id) {
                return true;
            }
        }

        // Check platform admin permission
        if (memberships.some((m: any) => m.role === 'platform_admin')) {
            return true;
        }

        return false;
    }

    /**
     * Get actionable proposals for user (proposals requiring user's action)
     * 
     * Filters to proposals where user can take action (accept, reject, submit, etc.).
     * 
     * @param clerkUserId - Clerk user ID from x-clerk-user-id header
     * @param organizationId - Organization ID for additional context (optional)
     */
    async findActionableProposals(
        clerkUserId: string,
        organizationId: string | null
    ): Promise<any[]> {
        // Get all proposals for user, then filter to actionable ones
        const { data: proposals } = await this.findProposalsForUser(clerkUserId, organizationId, {
            page: 1,
            limit: 1000 // Get all for now, optimize later with status filters
        });

        // Filter to actionable statuses
        // Actionable means: pending_recruiter_review, pending_candidate_review, pending_company_review
        const actionableStatuses = [
            'pending_recruiter_review',
            'pending_candidate_review',
            'pending_company_review'
        ];

        return proposals.filter(p => actionableStatuses.includes(p.status));
    }

    /**
     * Get pending proposals for user (proposals awaiting others' actions)
     * 
     * Filters to proposals where user initiated action and awaiting response.
     * 
     * @param clerkUserId - Clerk user ID from x-clerk-user-id header
     * @param organizationId - Organization ID for additional context (optional)
     */
    async findPendingProposals(
        clerkUserId: string,
        organizationId: string | null
    ): Promise<any[]> {
        // Get all proposals for user, then filter to pending ones
        const { data: proposals } = await this.findProposalsForUser(clerkUserId, organizationId, {
            page: 1,
            limit: 1000 // Get all for now, optimize later with status filters
        });

        // Filter to pending statuses (where user is waiting on others)
        // This would require tracking who initiated each stage - for now, exclude actionable
        const actionableStatuses = [
            'pending_recruiter_review',
            'pending_candidate_review',
            'pending_company_review'
        ];

        return proposals.filter(p => 
            p.status.includes('pending') && !actionableStatuses.includes(p.status)
        );
    }
}

