/**
 * GPT Action Types
 *
 * Request/response types for GPT-facing action endpoints.
 * Phase 13: GPT API Endpoints
 */

// ============================================================================
// Job Search Types
// ============================================================================

export interface GptJobSearchParams {
    keywords?: string;
    location?: string;
    commute_type?: string;
    job_level?: string;
    page?: number;
}

export interface GptJobSearchResult {
    id: string;
    title: string;
    company_name: string;
    location: string;
    commute_types: string[];
    posted_date: string; // YYYY-MM-DD
    salary_range: string | null; // "$80k-$120k" or null
    job_level: string;
    summary: string; // 1-2 sentences, ~200 chars
    view_url: string; // Deep link to job detail page on applicant.network
}

export interface GptJobSearchResponse {
    jobs: GptJobSearchResult[];
    pagination: {
        page: number;
        total_pages: number;
        total_results: number;
    };
}

// ============================================================================
// Job Details Types
// ============================================================================

export interface GptJobDetail extends GptJobSearchResult {
    description: string;
    responsibilities: string[];
    requirements: {
        text: string;
        type: 'mandatory' | 'preferred';
    }[];
    pre_screen_questions: {
        id: string;
        question: string;
        type: string;
        is_required: boolean;
    }[];
    company: {
        name: string;
        industry: string;
        location: string;
        website: string | null;
        description: string | null;
    };
}

// ============================================================================
// Application Status Types
// ============================================================================

export interface GptApplicationStatus {
    id: string;
    job_title: string;
    company_name: string;
    status_label: string; // Human-readable
    applied_date: string; // YYYY-MM-DD
    last_updated: string; // YYYY-MM-DD
}

export interface GptApplicationListParams {
    include_inactive?: boolean;
    page?: number;
}

// ============================================================================
// Application Submission Types
// ============================================================================

export interface GptSubmitApplicationRequest {
    job_id: string;
    confirmed?: boolean;
    confirmation_token?: string;
    pre_screen_answers?: {
        question_id: string;
        answer: string;
    }[];
    cover_letter?: string;
}

export interface GptConfirmationSummary {
    confirmation_token: string;
    expires_at: string; // ISO timestamp
    job_title: string;
    company_name: string;
    requirements_summary: string[];
    pre_screen_answers_provided: {
        question: string;
        answer: string;
    }[];
    missing_required_questions: {
        id: string;
        question: string;
    }[];
    warnings: string[];
}

// ============================================================================
// Resume Analysis Types
// ============================================================================

export interface GptResumeAnalysisRequest {
    job_id: string;
    resume_text?: string;
}

export interface GptResumeAnalysisResponse {
    fit_score: number; // 0-100
    strengths: string[];
    gaps: string[];
    recommendation: string;
    overall_summary: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface GptErrorResponse {
    error: {
        code: string;
        message: string;
        suggestion?: string;
        required_scope?: string;
    };
}

// Error code constants
export const ERROR_CODES = {
    NOT_FOUND: 'NOT_FOUND',
    INVALID_REQUEST: 'INVALID_REQUEST',
    DUPLICATE_APPLICATION: 'DUPLICATE_APPLICATION',
    CONFIRMATION_REQUIRED: 'CONFIRMATION_REQUIRED',
    MISSING_PRE_SCREEN_ANSWERS: 'MISSING_PRE_SCREEN_ANSWERS',
    RESUME_NOT_FOUND: 'RESUME_NOT_FOUND',
    CONFIRMATION_EXPIRED: 'CONFIRMATION_EXPIRED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_REVOKED: 'TOKEN_REVOKED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    INSUFFICIENT_SCOPE: 'INSUFFICIENT_SCOPE',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ============================================================================
// Confirmation Token Type
// ============================================================================

export interface ConfirmationToken {
    token: string;
    clerkUserId: string;
    jobId: string;
    candidateId: string;
    preScreenAnswers?: {
        question_id: string;
        answer: string;
    }[];
    coverLetter?: string;
    expiresAt: Date;
}
