/**
 * GPT Action Helpers
 *
 * Error response builders, formatters, and confirmation token store.
 * Phase 13: GPT API Endpoints
 */

import { randomUUID, createHmac, timingSafeEqual } from "crypto";
import {
    GptErrorResponse,
    ConfirmationToken,
    GptJobSearchResult,
    GptResumeDataInput,
} from "./types";

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
    extras?: { suggestion?: string; required_scope?: string },
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
    let summary = "";
    if (job.description) {
        const truncated = job.description.substring(0, 200);
        const lastSpace = truncated.lastIndexOf(" ");
        summary =
            lastSpace > 0
                ? truncated.substring(0, lastSpace) + "..."
                : truncated + "...";
    }

    // Format posted date
    const postedDate = job.created_at
        ? new Date(job.created_at).toISOString().split("T")[0]
        : "";

    return {
        id: job.id,
        title: job.title,
        company_name: job.company?.name || "Unknown Company",
        location: job.location || "",
        commute_types: job.commute_types || [],
        posted_date: postedDate,
        salary_range: salaryRange,
        job_level: job.job_level || "",
        employment_type: job.employment_type || null,
        department: job.department || null,
        open_to_relocation: job.open_to_relocation ?? null,
        summary,
        view_url: `${process.env.CANDIDATE_APP_URL || 'https://applicant.network'}/jobs/${job.id}`,
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
        draft: "Draft",
        submitted: "Submitted",
        company_review: "Under Review",
        interview: "Interviewing",
        offer: "Offer Received",
        hired: "Hired",
        rejected: "Not Selected",
        withdrawn: "Withdrawn",
        ai_review: "Under Review",
        screen: "Screening",
        recruiter_proposed: "Recruiter Proposed",
        recruiter_request: "Changes Requested",
    };

    return labelMap[stage] || stage;
}

// ============================================================================
// Confirmation Token — Stateless HMAC-Signed (works across replicas)
// ============================================================================

/**
 * Signing key for confirmation tokens.
 * Uses INTERNAL_SERVICE_KEY (available in all environments).
 */
function getSigningKey(): string {
    const key = process.env.INTERNAL_SERVICE_KEY;
    if (!key) throw new Error('INTERNAL_SERVICE_KEY is required for confirmation tokens');
    return key;
}

function hmacSign(payload: string): string {
    return createHmac('sha256', getSigningKey()).update(payload).digest('base64url');
}

function hmacVerify(payload: string, signature: string): boolean {
    const expected = createHmac('sha256', getSigningKey()).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
}

/**
 * Generate a stateless confirmation token with 15-minute expiry.
 * All data is encoded in the token itself — no server-side storage needed.
 */
export function generateConfirmationToken(
    clerkUserId: string,
    jobId: string,
    candidateId: string,
    preScreenAnswers?: ConfirmationToken['preScreenAnswers'],
    coverLetter?: string,
    resumeData?: GptResumeDataInput,
    existingApplicationId?: string,
): ConfirmationToken {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Truncate raw_text to prevent oversized tokens
    const truncatedResumeData = resumeData ? {
        ...resumeData,
        raw_text: resumeData.raw_text?.slice(0, 10_000),
    } : undefined;

    const payload = JSON.stringify({
        clerkUserId,
        jobId,
        candidateId,
        preScreenAnswers,
        coverLetter,
        resumeData: truncatedResumeData,
        existingApplicationId,
        exp: expiresAt.getTime(),
    });

    const encodedPayload = Buffer.from(payload).toString('base64url');
    const signature = hmacSign(encodedPayload);
    const tokenId = `${encodedPayload}.${signature}`;

    return {
        token: tokenId,
        clerkUserId,
        jobId,
        candidateId,
        preScreenAnswers,
        coverLetter,
        resumeData: truncatedResumeData,
        existingApplicationId,
        expiresAt,
    };
}

/**
 * Retrieve and verify a confirmation token. Returns undefined if invalid or expired.
 */
export function getConfirmationToken(
    tokenId: string,
): ConfirmationToken | undefined {
    const dotIndex = tokenId.lastIndexOf('.');
    if (dotIndex === -1) return undefined;

    const encodedPayload = tokenId.substring(0, dotIndex);
    const signature = tokenId.substring(dotIndex + 1);

    if (!hmacVerify(encodedPayload, signature)) return undefined;

    try {
        const data = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

        if (data.exp < Date.now()) return undefined;

        return {
            token: tokenId,
            clerkUserId: data.clerkUserId,
            jobId: data.jobId,
            candidateId: data.candidateId,
            preScreenAnswers: data.preScreenAnswers,
            coverLetter: data.coverLetter,
            resumeData: data.resumeData,
            existingApplicationId: data.existingApplicationId,
            expiresAt: new Date(data.exp),
        };
    } catch {
        return undefined;
    }
}

/**
 * No-op — stateless tokens don't need deletion.
 * Kept for API compatibility with existing callers.
 */
export function deleteConfirmationToken(_tokenId: string): void {
    // Stateless token — nothing to delete
}
