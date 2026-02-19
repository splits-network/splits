import type { Placement } from "../../types";

export function isNew(placement: Placement): boolean {
    if (!placement.hired_at) return false;
    const hiredDate = new Date(placement.hired_at);
    const daysSince = (Date.now() - hiredDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
}

export function candidateName(placement: Placement): string {
    return placement.candidate?.full_name || "Unknown Candidate";
}

export function candidateInitials(placement: Placement): string {
    const name = candidateName(placement);
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function jobTitle(placement: Placement): string {
    return placement.job?.title || "Unknown Job";
}

export function companyName(placement: Placement): string {
    return placement.job?.company?.name || "N/A";
}

export function formatDate(date: string | null | undefined): string {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function timeAgo(date: string | null | undefined): string {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
    if (amount >= 1000) {
        return `$${Math.round(amount / 1000)}K`;
    }
    return `$${amount}`;
}

export function formatStatus(state?: string): string {
    if (!state) return "Unknown";
    return state.charAt(0).toUpperCase() + state.slice(1).replace(/_/g, " ");
}
