import { formatSalary, formatRelativeTime } from "@/lib/utils";
import type { Job } from "../../types";

export function salaryDisplay(job: Job): string | null {
    if (job.show_salary_range === false) return null;
    if (!job.salary_min && !job.salary_max) return null;
    return formatSalary(job.salary_min ?? 0, job.salary_max ?? 0);
}

export function formatEmploymentType(type?: string | null): string {
    if (!type) return "Not specified";
    return type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

export function formatStatusLabel(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function isNew(job: Job): boolean {
    if (!job.created_at) return false;
    const d =
        typeof job.created_at === "string"
            ? new Date(job.created_at)
            : job.created_at;
    return (Date.now() - d.getTime()) / 86400000 <= 7;
}

export function postedAgo(job: Job): string {
    if (!job.created_at) return "";
    return formatRelativeTime(job.created_at);
}

export function companyName(job: Job): string {
    return job.company?.name || "3rd Party Firm";
}

export function companyInitials(name: string): string {
    const words = name.split(" ");
    return words.length > 1
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : (words[0]?.[0] || "").toUpperCase();
}

export function truncateDescription(
    job: Job,
    maxLength: number = 120,
): string {
    const desc = job.candidate_description || job.description;
    if (!desc) return "";
    const stripped = desc.replace(/[#*_`~>\-]/g, "").trim();
    return stripped.length > maxLength
        ? stripped.substring(0, maxLength) + "..."
        : stripped;
}

/** Match score → semantic color (mirrors portal's getAIScoreBadgeColor) */
export function matchScoreColor(score: number | null | undefined): string {
    if (score == null) return "neutral";
    if (score >= 90) return "success";
    if (score >= 70) return "primary";
    if (score >= 50) return "warning";
    return "error";
}

/** Match score text color class */
const SCORE_TEXT_COLORS: Record<string, string> = {
    success: "text-success",
    primary: "text-primary",
    warning: "text-warning",
    error: "text-error",
    neutral: "text-base-content/20",
};

export function matchScoreTextColor(score: number | null | undefined): string {
    return SCORE_TEXT_COLORS[matchScoreColor(score)] || "text-base-content/20";
}

export function requiredSkillNames(job: Job): string[] {
    return (job.skills || [])
        .filter((js) => js.is_required && js.skill)
        .map((js) => js.skill!.name);
}

export function preferredSkillNames(job: Job): string[] {
    return (job.skills || [])
        .filter((js) => !js.is_required && js.skill)
        .map((js) => js.skill!.name);
}
