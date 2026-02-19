import type { RecruiterCompanyRelationship } from "../../types";

export function formatStatus(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function isNew(invitation: RecruiterCompanyRelationship): boolean {
    if (!invitation.created_at) return false;
    const d = new Date(invitation.created_at);
    return (Date.now() - d.getTime()) / 86400000 <= 7;
}

export function postedAgo(invitation: RecruiterCompanyRelationship): string {
    if (!invitation.created_at) return "";
    const d = new Date(invitation.created_at);
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
}
