/**
 * GPT Action Helpers
 *
 * Error response builders, formatters, and confirmation token store.
 * Phase 13: GPT API Endpoints
 */

import { randomUUID } from 'crypto';
import { GptErrorResponse, ConfirmationToken, GptJobSearchResult } from './types';

// ============================================================================
// Error Response Builder
// ============================================================================

/**
 * Build a consistent GPT error response
 * Returns { error: { code, message, suggestion?, required_scope? } }
 */
export function gptError(
    code: string,
    message: string,
    extras?: { suggestion?: string; required_scope?: string }
): GptErrorResponse {
    return {
        error: {
            code,
            message,
            ...extras,
        },
    };
}

// ============================================================================
// GPT-Formatted Job Mapper
// ============================================================================

/**
 * Map raw Supabase job row (with company join) to GPT-friendly format
 */
export function formatJobForGpt(job: any): GptJobSearchResult {
    // Format salary range
    let salaryRange: string | null = null;
    if (job.salary_min && job.salary_max) {
        const minK = Math.round(job.salary_min / 1000);
        const maxK = Math.round(job.salary_max / 1000);
        salaryRange = `$${minK}k-$${maxK}k`;
    } else if (job.salary_min) {
        const minK = Math.round(job.salary_min / 1000);
        salaryRange = `$${minK}k+`;
    } else if (job.salary_max) {
        const maxK = Math.round(job.salary_max / 1000);
        salaryRange = `Up to $${maxK}k`;
    }

    // Generate summary (first ~200 chars of description)
    let summary = '';
    if (job.description) {
        const truncated = job.description.substring(0, 200);
        const lastSpace = truncated.lastIndexOf(' ');
        summary = lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }

    // Format posted date
    const postedDate = job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : '';

    return {
        id: job.id,
        title: job.title,
        company_name: job.company?.name || 'Unknown Company',
        location: job.location || '',
        commute_types: job.commute_types || [],
        posted_date: postedDate,
        salary_range: salaryRange,
        job_level: job.job_level || '',
        summary,
    };
}

// ============================================================================
// Application Status Label Mapper
// ============================================================================

/**
 * Map internal stage names to human-readable labels
 */
export function formatStageLabel(stage: string): string {
    const labelMap: Record<string, string> = {
        draft: 'Draft',
        submitted: 'Submitted',
        company_review: 'Under Review',
        interview: 'Interviewing',
        offer: 'Offer Received',
        hired: 'Hired',
        rejected: 'Not Selected',
        withdrawn: 'Withdrawn',
        ai_review: 'Under Review',
        screen: 'Screening',
        recruiter_proposed: 'Recruiter Proposed',
        recruiter_request: 'Changes Requested',
    };

    return labelMap[stage] || stage;
}

// ============================================================================
// Confirmation Token Store (In-Memory)
// ============================================================================

const confirmationTokens = new Map<string, ConfirmationToken>();

/**
 * Generate a new confirmation token with 15-minute expiry
 */
export function generateConfirmationToken(
    clerkUserId: string,
    jobId: string,
    candidateId: string,
    preScreenAnswers?: { question_id: string; answer: string }[],
    coverLetter?: string
): ConfirmationToken {
    const tokenId = `gpt_confirm_${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const token: ConfirmationToken = {
        token: tokenId,
        clerkUserId,
        jobId,
        candidateId,
        preScreenAnswers,
        coverLetter,
        expiresAt,
    };

    confirmationTokens.set(tokenId, token);
    return token;
}

/**
 * Store a confirmation token
 */
export function storeConfirmationToken(token: ConfirmationToken): void {
    confirmationTokens.set(token.token, token);
}

/**
 * Retrieve a confirmation token, checks expiry, deletes if expired
 */
export function getConfirmationToken(tokenId: string): ConfirmationToken | undefined {
    const token = confirmationTokens.get(tokenId);
    if (!token) {
        return undefined;
    }

    // Check expiry
    if (token.expiresAt < new Date()) {
        confirmationTokens.delete(tokenId);
        return undefined;
    }

    return token;
}

/**
 * Delete a confirmation token
 */
export function deleteConfirmationToken(tokenId: string): void {
    confirmationTokens.delete(tokenId);
}
