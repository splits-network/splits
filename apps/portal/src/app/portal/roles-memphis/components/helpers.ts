import { formatSalary, formatRelativeTime } from "@/lib/utils";
import type { Job } from "../../roles/types";

export function salaryDisplay(job: Job): string | null {
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

export function formatStatus(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function isNew(job: Job): boolean {
    if (!job.created_at) return false;
    const d = typeof job.created_at === "string" ? new Date(job.created_at) : job.created_at;
    return (Date.now() - d.getTime()) / 86400000 <= 7;
}

export function postedAgo(job: Job): string {
    if (!job.created_at) return "";
    return formatRelativeTime(job.created_at);
}

export function companyName(job: Job): string {
    return job.company?.name || "Company";
}

export function companyInitials(name: string): string {
    const words = name.split(" ");
    return words.length > 1
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : (words[0]?.[0] || "").toUpperCase();
}
