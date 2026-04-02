/**
 * AI Review Repository - V2
 * Handles database operations for AI reviews
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AIReviewFilters } from './types.js';

/**
 * Transform flat database structure to nested API structure
 * Database stores: skills_match_percentage, matched_skills, missing_skills, candidate_years, required_years, meets_experience_requirement
 * API expects: skills_match: { match_percentage, matched_skills, missing_skills }, experience_analysis: { candidate_years, required_years, meets_requirement }
 */
function transformAIReviewFromDB(dbRow: any): any {
    if (!dbRow) return null;
    
    const {
        skills_match_percentage,
        matched_skills,
        missing_skills,
        candidate_years,
        required_years,
        meets_experience_requirement,
        ...rest
    } = dbRow;
    
    return {
        ...rest,
        skills_match: {
            match_percentage: skills_match_percentage ?? 0,
            matched_skills: matched_skills ?? [],
            missing_skills: missing_skills ?? [],
        },
        experience_analysis: {
            candidate_years: candidate_years ? Number(candidate_years) : 0,
            required_years: required_years ?? 0,
            meets_requirement: meets_experience_requirement ?? false,
        },
    };
}

export class AIReviewRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async create(data: {
        application_id: string;
        fit_score: number;
        recommendation: string;
        overall_summary: string;
        confidence_level: number;
        strengths: string[];
        concerns: string[];
        matched_skills: string[];
        missing_skills: string[];
        skills_match_percentage: number;
        matched_requirements: string[];
        missing_requirements: string[];
        required_years?: number;
        candidate_years?: number;
        meets_experience_requirement?: boolean;
        location_compatibility: string;
        model_version: string;
        processing_time_ms: number;
    }): Promise<any> {
        const { data: review, error } = await this.supabase
            
            .from('ai_reviews')
            .insert({
                ...data,
                analyzed_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return review;
    }

    async upsert(data: {
        application_id: string;
        fit_score: number;
        recommendation: string;
        overall_summary: string;
        confidence_level: number;
        strengths: string[];
        concerns: string[];
        matched_skills: string[];
        missing_skills: string[];
        skills_match_percentage: number;
        matched_requirements: string[];
        missing_requirements: string[];
        required_years?: number;
        candidate_years?: number;
        meets_experience_requirement?: boolean;
        location_compatibility: string;
        model_version: string;
        processing_time_ms: number;
    }): Promise<any> {
        const { data: review, error } = await this.supabase
            
            .from('ai_reviews')
            .upsert({
                ...data,
                analyzed_at: new Date().toISOString(),
            }, {
                onConflict: 'application_id'
            })
            .select()
            .single();

        if (error) throw error;
        return review;
    }

    async findById(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            
            .from('ai_reviews')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return transformAIReviewFromDB(data);
    }

    async findByApplicationId(applicationId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            
            .from('ai_reviews')
            .select('*')
            .eq('application_id', applicationId)
            .order('analyzed_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return transformAIReviewFromDB(data);
    }

    async findReviews(filters: AIReviewFilters): Promise<{ data: any[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        let query = this.supabase.from('ai_reviews').select('*', { count: 'exact' });

        if (filters.application_id) {
            query = query.eq('application_id', filters.application_id);
        }
        if (filters.fit_score_min !== undefined) {
            query = query.gte('fit_score', filters.fit_score_min);
        }
        if (filters.fit_score_max !== undefined) {
            query = query.lte('fit_score', filters.fit_score_max);
        }
        if (filters.recommendation) {
            query = query.eq('recommendation', filters.recommendation);
        }

        query = query.order('analyzed_at', { ascending: false }).range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: (data || []).map(transformAIReviewFromDB),
            total: count || 0,
        };
    }

    async getJobSkills(jobId: string): Promise<{ name: string; is_required: boolean }[]> {
        const { data, error } = await this.supabase
            .from('job_skills')
            .select('is_required, skill:skills(name)')
            .eq('job_id', jobId);

        if (error) throw error;
        return (data || []).map((row: any) => ({
            name: row.skill?.name || '',
            is_required: row.is_required,
        })).filter((s: any) => s.name);
    }

    /**
     * Fetch application with related data for AI review enrichment.
     * Replaces the old HTTP call to ATS service.
     */
    async getApplicationForEnrichment(applicationId: string): Promise<any | null> {
        const { data: application, error } = await this.supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .maybeSingle();

        if (error) throw error;
        if (!application) return null;

        // Fetch related data in parallel
        const [jobResult, candidateResult, documentsResult, preScreenResult, jobRequirementsResult] = await Promise.all([
            application.job_id
                ? this.supabase.from('jobs').select('*').eq('id', application.job_id).maybeSingle()
                : { data: null, error: null },
            application.candidate_id
                ? this.supabase.from('candidates').select('*').eq('id', application.candidate_id).maybeSingle()
                : { data: null, error: null },
            this.supabase.from('documents').select('*').eq('entity_id', applicationId),
            this.supabase.from('pre_screen_answers').select('*').eq('application_id', applicationId),
            application.job_id
                ? this.supabase.from('job_requirements').select('*').eq('job_id', application.job_id)
                : { data: null, error: null },
        ]);

        return {
            ...application,
            job: jobResult.data || null,
            candidate: candidateResult.data || null,
            documents: documentsResult.data || [],
            pre_screen_answers: preScreenResult.data || [],
            job_requirements: jobRequirementsResult.data || [],
        };
    }

    /**
     * Fetch smart resume data for a candidate (visible entries only).
     * Returns null if the candidate has no smart resume profile.
     */
    async getSmartResumeData(candidateId: string): Promise<any | null> {
        const { data: profile } = await this.supabase
            .from('smart_resume_profiles')
            .select('*')
            .eq('candidate_id', candidateId)
            .is('deleted_at', null)
            .maybeSingle();

        if (!profile) return null;

        const visibleQuery = (table: string) =>
            this.supabase
                .from(table)
                .select('*')
                .eq('profile_id', profile.id)
                .eq('visible_to_matching', true)
                .is('deleted_at', null)
                .order('sort_order', { ascending: true });

        const [experiences, projects, tasks, education, certifications, skills, publications] = await Promise.all([
            visibleQuery('smart_resume_experiences'),
            visibleQuery('smart_resume_projects'),
            visibleQuery('smart_resume_tasks'),
            visibleQuery('smart_resume_education'),
            visibleQuery('smart_resume_certifications'),
            visibleQuery('smart_resume_skills'),
            visibleQuery('smart_resume_publications'),
        ]);

        return {
            profile,
            experiences: experiences.data || [],
            projects: projects.data || [],
            tasks: tasks.data || [],
            education: education.data || [],
            certifications: certifications.data || [],
            skills: skills.data || [],
            publications: publications.data || [],
        };
    }

    async getStatsByJobId(jobId: string): Promise<any> {
        // Get all AI reviews for applications on this job
        const { data: reviews, error } = await this.supabase
            
            .from('ai_reviews')
            .select('*, applications!inner(job_id)')
            .eq('applications.job_id', jobId);

        if (error) throw error;
        if (!reviews || reviews.length === 0) {
            return {
                total_applications: 0,
                ai_reviewed_count: 0,
                average_fit_score: 0,
                recommendation_breakdown: {
                    strong_fit: 0,
                    good_fit: 0,
                    fair_fit: 0,
                    poor_fit: 0,
                },
                most_matched_skills: [],
                most_missing_skills: [],
            };
        }

        // Calculate stats
        const avgFitScore = reviews.reduce((sum, r) => sum + r.fit_score, 0) / reviews.length;

        const recommendationBreakdown = reviews.reduce(
            (acc, r) => {
                acc[r.recommendation] = (acc[r.recommendation] || 0) + 1;
                return acc;
            },
            { strong_fit: 0, good_fit: 0, fair_fit: 0, poor_fit: 0 } as Record<string, number>
        );

        // Count skill frequencies
        const matchedSkillCounts: Record<string, number> = {};
        const missingSkillCounts: Record<string, number> = {};

        reviews.forEach((r) => {
            r.matched_skills?.forEach((skill: string) => {
                matchedSkillCounts[skill] = (matchedSkillCounts[skill] || 0) + 1;
            });
            r.missing_skills?.forEach((skill: string) => {
                missingSkillCounts[skill] = (missingSkillCounts[skill] || 0) + 1;
            });
        });

        const mostMatchedSkills = Object.entries(matchedSkillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([skill]) => skill);

        const mostMissingSkills = Object.entries(missingSkillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([skill]) => skill);

        return {
            total_applications: reviews.length,
            ai_reviewed_count: reviews.length,
            average_fit_score: Math.round(avgFitScore),
            recommendation_breakdown: recommendationBreakdown,
            most_matched_skills: mostMatchedSkills,
            most_missing_skills: mostMissingSkills,
        };
    }
}
