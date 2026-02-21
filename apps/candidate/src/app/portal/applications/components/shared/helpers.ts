import type { Application } from "../../types";
import { formatStage } from "../../types";

export { formatStage };

export function companyName(app: Application): string {
    return app.job?.company?.name || app.company?.name || "Unknown Company";
}

export function companyInitials(name: string): string {
    return name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function recruiterName(app: Application): string {
    return (
        app.recruiter?.user?.name ||
        app.recruiter?.name ||
        "No recruiter"
    );
}

export function appliedAgo(app: Application): string {
    const ms = Date.now() - new Date(app.created_at).getTime();
    const days = Math.floor(ms / 86_400_000);
    if (days === 0) return "Today";
    if (days === 1) return "1d ago";
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

export function salaryDisplay(app: Application): string | null {
    const job = app.job;
    if (!job?.salary_min && !job?.salary_max) return null;
    const currency =
        job?.salary_currency && job.salary_currency !== "USD"
            ? `${job.salary_currency} `
            : "$";
    if (job?.salary_min && job?.salary_max) {
        return `${currency}${(job.salary_min / 1000).toFixed(0)}k – ${currency}${(job.salary_max / 1000).toFixed(0)}k`;
    }
    if (job?.salary_min) return `${currency}${(job.salary_min / 1000).toFixed(0)}k+`;
    if (job?.salary_max) return `Up to ${currency}${(job.salary_max / 1000).toFixed(0)}k`;
    return null;
}

export function hasAiReview(app: Application): boolean {
    return !!app.ai_review?.id;
}