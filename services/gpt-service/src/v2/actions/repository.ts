/**
 * GPT Action Repository
 *
 * Data access layer for GPT action endpoints.
 * Phase 13: GPT API Endpoints
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class GptActionRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' },
        });
    }

    /**
     * Search jobs with filters
     * Returns active jobs only, paginated to 5 results
     */
    async searchJobs(
        keywords?: string,
        location?: string,
        commuteType?: string,
        jobLevel?: string,
        page: number = 1
    ): Promise<RepositoryListResponse<any>> {
        const limit = 5; // Hardcoded per spec
        const offset = (page - 1) * limit;

        // Build query with company join
        let query = this.supabase
            .from('jobs')
            .select(
                `
                *,
                company:companies!inner(id, name, industry, headquarters_location, logo_url)
            `,
                { count: 'exact' }
            )
            .eq('status', 'active')
            .is('deleted_at', null);

        // Apply filters
        if (keywords) {
            // Use full-text search on search_vector
            // Convert to tsquery format
            const tsquery = keywords.split(/\s+/).filter(Boolean).join(' & ');
            query = query.textSearch('search_vector', tsquery, {
                type: 'websearch',
                config: 'english',
            });
        } else if (location) {
            // Only apply location filter when keywords is NOT provided
            // (textSearch and ilike can conflict)
            query = query.ilike('location', `%${location}%`);
        }

        if (commuteType) {
            query = query.overlaps('commute_types', [commuteType]);
        }

        if (jobLevel) {
            query = query.eq('job_level', jobLevel);
        }

        // Order and paginate
        query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return {
            data: data || [],
            total: count || 0,
        };
    }

    /**
     * Get detailed job information
     * Returns null if not found or not active
     */
    async getJobDetail(jobId: string): Promise<any | null> {
        // Query job with expanded company join
        const { data: job, error } = await this.supabase
            .from('jobs')
            .select(
                `
                *,
                company:companies(id, name, industry, headquarters_location, logo_url, description, website)
            `
            )
            .eq('id', jobId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) {
            // PGRST116 = not found
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        if (!job) {
            return null;
        }

        // Fetch requirements
        const { data: requirements, error: reqError } = await this.supabase
            .from('job_requirements')
            .select('*')
            .eq('job_id', jobId)
            .order('requirement_type')
            .order('created_at');

        if (reqError) {
            throw reqError;
        }

        // Fetch pre-screen questions
        const { data: preScreenQuestions, error: psError } = await this.supabase
            .from('job_pre_screen_questions')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at');

        if (psError) {
            throw psError;
        }

        return {
            ...job,
            requirements: requirements || [],
            pre_screen_questions: preScreenQuestions || [],
        };
    }

    /**
     * Get applications for a candidate
     * Defaults to active stages only unless includeInactive is true
     */
    async getApplicationsForCandidate(
        candidateId: string,
        includeInactive: boolean = false,
        page: number = 1
    ): Promise<RepositoryListResponse<any>> {
        const limit = 10;
        const offset = (page - 1) * limit;

        // Build query with job + company join
        let query = this.supabase
            .from('applications')
            .select(
                `
                *,
                job:jobs(id, title, company:companies(id, name))
            `,
                { count: 'exact' }
            )
            .eq('candidate_id', candidateId);

        // Filter to active stages only if not includeInactive
        if (!includeInactive) {
            const activeStages = [
                'draft',
                'submitted',
                'company_review',
                'interview',
                'offer',
                'ai_review',
                'screen',
                'recruiter_proposed',
                'recruiter_request',
            ];
            query = query.in('stage', activeStages);
        }

        query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return {
            data: data || [],
            total: count || 0,
        };
    }

    /**
     * Check if candidate has already applied to this job
     * Returns existing application or null
     */
    async checkDuplicateApplication(candidateId: string, jobId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('applications')
            .select('*')
            .eq('candidate_id', candidateId)
            .eq('job_id', jobId)
            .not('stage', 'in', '(withdrawn,rejected)')
            .maybeSingle();

        if (error) {
            // PGRST116 = not found, which is fine
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data;
    }

    /**
     * Create a new application
     */
    async createApplication(
        candidateId: string,
        jobId: string,
        coverLetter?: string
    ): Promise<any> {
        const { data, error } = await this.supabase
            .from('applications')
            .insert({
                candidate_id: candidateId,
                job_id: jobId,
                cover_letter: coverLetter,
                stage: 'submitted',
                submitted_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Save pre-screen answers for an application
     */
    async savePreScreenAnswers(
        applicationId: string,
        answers: { question_id: string; answer: string }[]
    ): Promise<void> {
        // Upsert each answer
        for (const answer of answers) {
            const { error } = await this.supabase
                .from('job_pre_screen_answers')
                .upsert(
                    {
                        application_id: applicationId,
                        question_id: answer.question_id,
                        answer: answer.answer,
                    },
                    {
                        onConflict: 'application_id,question_id',
                    }
                );

            if (error) {
                throw error;
            }
        }
    }

    /**
     * Get pre-screen questions for a job
     */
    async getPreScreenQuestions(jobId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('job_pre_screen_questions')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at');

        if (error) {
            throw error;
        }

        return data || [];
    }

    /**
     * Get candidate's most recent resume
     * Returns document with extracted text in metadata.extracted_text
     */
    async getCandidateResume(candidateId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('documents')
            .select('*')
            .eq('entity_type', 'candidate')
            .eq('entity_id', candidateId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            // PGRST116 = not found
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data;
    }

    /**
     * Resolve candidate ID from Clerk user ID
     * Uses resolveAccessContext from shared-access-context
     */
    async resolveCandidateId(clerkUserId: string): Promise<string | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        if (!context.candidateId) {
            return null;
        }

        return context.candidateId;
    }
}
