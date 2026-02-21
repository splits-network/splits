import type { Application } from "../../types";

export function candidateName(application: Application): string {
    return application.candidate?.full_name || "Unnamed Candidate";
}

export function candidateInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() ?? "")
        .join("") || "?";
}

export function roleTitle(application: Application): string {
    return application.job?.title || "Untitled Role";
}

export function companyName(application: Application): string {
    return application.job?.company?.name || "Company Pending";
}

export function aiScore(application: Application): number | null {
    if (application.ai_review?.fit_score == null) return null;
    return Math.round(application.ai_review.fit_score);
}

export function submittedDateLabel(application: Application): string {
    if (!application.created_at) return "";
    return new Date(application.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

export function addedAgo(application: Application): string {
    if (!application.created_at) return "Recently";

    const created = new Date(application.created_at).getTime();
    const diffMs = Date.now() - created;
    const dayMs = 1000 * 60 * 60 * 24;
    const days = Math.max(0, Math.floor(diffMs / dayMs));

    if (days === 0) return "Today";
    if (days === 1) return "1d ago";
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months === 1) return "1mo ago";
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(months / 12);
    return `${years}y ago`;
}

export function isNew(application: Application): boolean {
    if (!application.created_at) return false;
    const created = new Date(application.created_at).getTime();
    const diffMs = Date.now() - created;
    return diffMs < 1000 * 60 * 60 * 24 * 7;
}

export function candidateHeadline(application: Application): string | null {
    const title = application.candidate?.current_title;
    const company = application.candidate?.current_company;
    if (title && company) return `${title} at ${company}`;
    if (title) return title;
    if (company) return `at ${company}`;
    return null;
}

export function jobLocation(application: Application): string | null {
    return application.job?.location || null;
}

export function jobSalaryRange(application: Application): string | null {
    const min = application.job?.salary_min;
    const max = application.job?.salary_max;
    if (min == null && max == null) return null;

    const fmt = (n: number) => {
        if (n >= 1000) return `$${Math.round(n / 1000)}K`;
        return `$${n}`;
    };

    if (min != null && max != null) return `${fmt(min)} - ${fmt(max)}`;
    if (min != null) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
}

export function jobEmploymentType(application: Application): string | null {
    const t = application.job?.employment_type;
    if (!t) return null;
    return t
        .replace(/_/g, "-")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function recruiterName(application: Application): string | null {
    return (
        application.recruiter?.name ||
        application.recruiter?.user?.name ||
        null
    );
}

export function companyInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
}
