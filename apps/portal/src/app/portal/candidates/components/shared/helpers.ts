import { formatRelativeTime } from "@/lib/utils";
import type { Candidate } from "../../types";

export function salaryDisplay(candidate: Candidate): string | null {
    if (!candidate.desired_salary_min && !candidate.desired_salary_max) return null;
    const min = candidate.desired_salary_min
        ? `$${candidate.desired_salary_min.toLocaleString()}`
        : "";
    const max = candidate.desired_salary_max
        ? `$${candidate.desired_salary_max.toLocaleString()}`
        : "";
    if (min && max) return `${min} - ${max}`;
    return min || max;
}

export function isNew(candidate: Candidate): boolean {
    if (!candidate.created_at) return false;
    const d = new Date(candidate.created_at);
    return (Date.now() - d.getTime()) / 86400000 <= 7;
}

export function addedAgo(candidate: Candidate): string {
    if (!candidate.created_at) return "";
    return formatRelativeTime(candidate.created_at);
}

export function candidateName(candidate: Candidate): string {
    return candidate.full_name || "Name not provided";
}

export function candidateInitials(name: string): string {
    const words = name.split(" ");
    return words.length > 1
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : (words[0]?.[0] || "?").toUpperCase();
}

export function candidateTitle(candidate: Candidate): string | undefined {
    return candidate.current_title || undefined;
}

export function candidateCompany(candidate: Candidate): string | undefined {
    return candidate.current_company || undefined;
}

export function skillsList(candidate: Candidate): string[] {
    const legacySkills = candidate.skills
        ? candidate.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
    const specialties = candidate.marketplace_profile?.skills_expertise || [];
    return Array.from(new Set([...legacySkills, ...specialties]));
}
