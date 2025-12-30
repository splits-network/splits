import { AtsRepository } from '../../repository';
import { Job } from '@splits-network/shared-types';

export class JobService {
    constructor(private repository: AtsRepository) {}

    async getJobs(filters?: { 
        status?: string; 
        search?: string; 
        location?: string;
        employment_type?: string;
        limit?: number; 
        offset?: number;
    }): Promise<{ jobs: Job[], total: number }> {
        // Use database functions for efficient search and count
        const [jobs, total] = await Promise.all([
            this.repository.findJobs(filters),
            this.repository.countJobs(filters)
        ]);

        // Jobs already include company data from the database function
        return { jobs, total };
    }

    /**
     * NEW: Get jobs for a specific user with role-based scoping
     * Part of API Role-Based Scoping Migration (Phase 3 - Jobs)
     * 
     * Backend determines data scope via database JOINs - NO userRole parameter.
     * 
     * Returns:
     * - Recruiters: All active jobs (marketplace)
     * - Company users: Jobs from their organization only
     * - Candidates: All active jobs
     * 
     * @see docs/migration/MIGRATION-PROGRESS.md
     */
    async getJobsForUser(
        clerkUserId: string,
        organizationId: string | null,
        filters: {
            search?: string;
            status?: string;
            location?: string;
            employment_type?: string;
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
        const { data, total } = await this.repository.findJobsForUser(
            clerkUserId,
            organizationId,
            {
                search: filters.search,
                status: filters.status,
                location: filters.location,
                employment_type: filters.employment_type,
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

    async getJobById(id: string): Promise<Job> {
        const job = await this.repository.findJobById(id);
        if (!job) {
            throw new Error(`Job ${id} not found`);
        }

        // Enrich with company data
        const company = await this.repository.findCompanyById(job.company_id);
        
        // Enrich with requirements
        const requirements = await this.repository.findJobRequirements(id);
        
        // Enrich with pre-screen questions
        const pre_screen_questions = await this.repository.findJobPreScreenQuestions(id);
        
        return { 
            ...job, 
            company: company ?? undefined,
            requirements,
            pre_screen_questions
        };
    }

    async getJobsByCompanyId(companyId: string): Promise<Job[]> {
        return await this.repository.findJobsByCompanyId(companyId);
    }

    async getJobsByIds(ids: string[]): Promise<Job[]> {
        return await this.repository.findJobsByIds(ids);
    }

    async createJob(
        companyId: string,
        title: string,
        feePercentage: number,
        options: {
            department?: string;
            location?: string;
            salary_min?: number;
            salary_max?: number;
            description?: string;
            recruiter_description?: string;
            candidate_description?: string;
            employment_type?: 'full_time' | 'contract' | 'temporary';
            open_to_relocation?: boolean;
            show_salary_range?: boolean;
            splits_fee_percentage?: number;
            job_owner_id?: string;
            status?: 'active' | 'paused' | 'filled' | 'closed';
            requirements?: Array<{ type: 'mandatory' | 'preferred'; description: string }>;
            pre_screen_questions?: Array<{ question: string; question_type: string; options?: string[]; is_required: boolean }>;
        } = {}
    ): Promise<Job> {
        const job = await this.repository.createJob({
            company_id: companyId,
            title,
            fee_percentage: feePercentage,
            department: options.department,
            location: options.location,
            salary_min: options.salary_min,
            salary_max: options.salary_max,
            description: options.description,
            recruiter_description: options.recruiter_description,
            candidate_description: options.candidate_description,
            employment_type: options.employment_type,
            open_to_relocation: options.open_to_relocation ?? false,
            show_salary_range: options.show_salary_range ?? true,
            splits_fee_percentage: options.splits_fee_percentage ?? 50,
            job_owner_id: options.job_owner_id,
            status: options.status || 'active',
        });

        // Create requirements if provided
        if (options.requirements && options.requirements.length > 0) {
            await Promise.all(
                options.requirements.map((req, idx) =>
                    this.repository.createJobRequirement({
                        job_id: job.id,
                        requirement_type: req.type,
                        description: req.description,
                        sort_order: idx,
                    })
                )
            );
        }

        // Create pre-screen questions if provided
        if (options.pre_screen_questions && options.pre_screen_questions.length > 0) {
            await Promise.all(
                options.pre_screen_questions.map((q, idx) =>
                    this.repository.createJobPreScreenQuestion({
                        job_id: job.id,
                        question: q.question,
                        question_type: q.question_type,
                        options: q.options,
                        is_required: q.is_required,
                        sort_order: idx,
                    })
                )
            );
        }

        // Return enriched job
        return await this.getJobById(job.id);
    }

    async updateJob(id: string, updates: Partial<Job> & { requirements?: any[]; pre_screen_questions?: any[] }): Promise<Job> {
        // Extract requirements and pre_screen_questions from updates
        const { requirements, pre_screen_questions, ...jobUpdates } = updates as any;
        
        // Update job fields
        const job = await this.repository.updateJob(id, jobUpdates);
        
        // Update requirements if provided
        if (requirements !== undefined) {
            // Delete existing requirements
            await this.repository.deleteJobRequirements(id);
            
            // Create new requirements
            if (requirements.length > 0) {
                await Promise.all(
                    requirements.map((req: any, idx: number) =>
                        this.repository.createJobRequirement({
                            job_id: id,
                            requirement_type: req.type,
                            description: req.description,
                            sort_order: idx,
                        })
                    )
                );
            }
        }
        
        // Update pre-screen questions if provided
        if (pre_screen_questions !== undefined) {
            // Delete existing questions
            await this.repository.deleteJobPreScreenQuestions(id);
            
            // Create new questions
            if (pre_screen_questions.length > 0) {
                await Promise.all(
                    pre_screen_questions.map((q: any, idx: number) =>
                        this.repository.createJobPreScreenQuestion({
                            job_id: id,
                            question: q.question,
                            question_type: q.question_type,
                            options: q.options,
                            is_required: q.is_required,
                            sort_order: idx,
                        })
                    )
                );
            }
        }
        
        // Return enriched job with all data
        return await this.getJobById(id);
    }
}
