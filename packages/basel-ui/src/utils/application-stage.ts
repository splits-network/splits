/**
 * Unified application stage display utility.
 *
 * Single source of truth for mapping application stages to labels, icons,
 * and semantic colors.  Used by both portal and candidate apps.
 */

import type { BaselSemanticColor } from './colors';

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface StageDisplay {
    label: string;
    icon: string;
    color: BaselSemanticColor;
}

export interface StageDisplayOptions {
    /** When true the label becomes "Offer Accepted" instead of "Offer". */
    acceptedByCandidate?: boolean;
    /** ISO timestamp — when set, appends "(Expired)" to the label. */
    expiredAt?: string | null;
}

/* ─── Core Mapping ──────────────────────────────────────────────────────── */

export function getStageDisplay(
    stage: string | null | undefined,
    options?: StageDisplayOptions,
): StageDisplay {
    const base = baseStageDisplay(stage);

    // Offer + candidate accepted → distinct display
    if (stage === 'offer' && options?.acceptedByCandidate) {
        return {
            label: 'Offer Accepted',
            icon: 'fa-check-double',
            color: 'success',
        };
    }

    // Expired overlay
    if (options?.expiredAt) {
        return {
            label: `${base.label} (Expired)`,
            icon: 'fa-clock',
            color: 'neutral',
        };
    }

    return base;
}

/* ─── Private ───────────────────────────────────────────────────────────── */

function baseStageDisplay(stage: string | null | undefined): StageDisplay {
    switch (stage) {
        case 'draft':
            return { label: 'Draft', icon: 'fa-pen', color: 'neutral' };
        case 'ai_review':
            return { label: 'AI Review', icon: 'fa-robot', color: 'info' };
        case 'ai_reviewed':
            return { label: 'AI Reviewed', icon: 'fa-robot', color: 'success' };
        case 'gpt_review':
            return { label: 'GPT Review', icon: 'fa-robot', color: 'info' };
        case 'ai_failed':
            return { label: 'Review Failed', icon: 'fa-triangle-exclamation', color: 'error' };
        case 'recruiter_request':
            return { label: 'Requested', icon: 'fa-user-tie', color: 'warning' };
        case 'recruiter_proposed':
            return { label: 'Proposed', icon: 'fa-user-tie', color: 'secondary' };
        case 'recruiter_review':
            return { label: 'Recruiter Review', icon: 'fa-user-check', color: 'secondary' };
        case 'screen':
            return { label: 'Screening', icon: 'fa-filter', color: 'info' };
        case 'submitted':
            return { label: 'Submitted', icon: 'fa-paper-plane', color: 'primary' };
        case 'company_review':
            return { label: 'Under Review', icon: 'fa-building', color: 'accent' };
        case 'company_feedback':
            return { label: 'Feedback', icon: 'fa-comment', color: 'accent' };
        case 'interview':
            return { label: 'Interview', icon: 'fa-calendar', color: 'success' };
        case 'offer':
            return { label: 'Offer', icon: 'fa-handshake', color: 'success' };
        case 'hired':
            return { label: 'Hired', icon: 'fa-circle-check', color: 'success' };
        case 'rejected':
            return { label: 'Rejected', icon: 'fa-circle-xmark', color: 'error' };
        case 'withdrawn':
            return { label: 'Withdrawn', icon: 'fa-arrow-left', color: 'neutral' };
        case 'expired':
            return { label: 'Expired', icon: 'fa-clock', color: 'neutral' };
        default:
            return { label: stage || 'Unknown', icon: 'fa-circle-question', color: 'neutral' };
    }
}
