/**
 * AI Review Types - V2
 */

export interface AIReviewFilters {
    application_id?: string;
    job_id?: string;
    fit_score_min?: number;
    fit_score_max?: number;
    recommendation?: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
    page?: number;
    limit?: number;
}

export interface AIReviewInput {
    application_id: string;
    candidate_id: string;
    job_id: string;
    resume_text?: string;
    documents_count?: number; // Number of documents attached (for prompt context)
    job_description: string;
    job_title: string;
    required_skills: string[];
    preferred_skills?: string[];
    required_years?: number;
    candidate_location?: string;
    job_location?: string;
    auto_transition?: boolean;
    job_requirements?: Array<{
        requirement_text: string;
        is_required: boolean;
        category?: string;
    }>;
    pre_screen_answers?: Array<{
        question_text: string;
        answer_text: string;
    }>;
}

export interface AIReviewResult {
    fit_score: number; // 0-100
    recommendation: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
    overall_summary: string;
    confidence_level: number; // 0-100
    strengths: string[];
    concerns: string[];
    matched_skills: string[];
    missing_skills: string[];
    skills_match_percentage: number;
    required_years?: number;
    candidate_years?: number;
    meets_experience_requirement?: boolean;
    location_compatibility: 'perfect' | 'good' | 'challenging' | 'mismatch';
}
