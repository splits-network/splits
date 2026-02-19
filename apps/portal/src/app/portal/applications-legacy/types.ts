import type {
    Application as BaseApplication,
    Candidate,
    Job,
    Company,
    AIReview,
} from "@splits-network/shared-types";
import { getApplicationStageBadge } from "@/lib/utils/badge-styles";

// Extend BaseApplication to include enriched fields from API
export interface Application extends BaseApplication {
    candidate?: Candidate;
    job?: Job & { company?: Company };
    recruiter?: {
        id: string;
        name?: string;
        email?: string;
        user?: { name?: string; email?: string };
        bio?: string;
        status?: string;
    };
    ai_review?: AIReview;
    documents?: any[];
    timeline?: any[];
    pre_screen_answers?: any[];
    audit_log?: any[];
}

export interface ApplicationFilters {
    stage?: string;
    ai_score_filter?: string;
    scope?: "all" | "mine";
}

export interface ApplicationStatusDisplay {
    label: string;
    badgeClass: string;
    icon: string;
}

export function getDisplayStatus(
    application: Application,
): ApplicationStatusDisplay {
    const badge = getApplicationStageBadge(application.stage);

    const iconMap: Record<string, string> = {
        draft: "fa-pen",
        ai_review: "fa-robot",
        ai_reviewed: "fa-robot",
        recruiter_request: "fa-user-tie",
        recruiter_proposed: "fa-user-tie",
        recruiter_review: "fa-user-check",
        screen: "fa-filter",
        submitted: "fa-paper-plane",
        company_review: "fa-building",
        company_feedback: "fa-comment",
        interview: "fa-calendar",
        offer: "fa-handshake",
        hired: "fa-circle-check",
        rejected: "fa-circle-xmark",
        withdrawn: "fa-arrow-left",
        expired: "fa-clock",
    };

    return {
        label: badge.label,
        badgeClass: badge.className,
        icon: iconMap[application.stage || ""] || "fa-circle-question",
    };
}

export function formatApplicationDate(
    dateString: string | Date | null | undefined,
): string {
    if (!dateString) return "N/A";
    const date =
        dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
