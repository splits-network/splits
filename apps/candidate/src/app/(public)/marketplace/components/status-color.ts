/**
 * DaisyUI semantic color mappings for marketplace recruiter status/reputation.
 * Basel design system — no Memphis named colors.
 */

export function reputationColor(score?: number): string {
    if (!score) return "bg-base-content/15 text-base-content/50";
    if (score >= 4.5) return "bg-success/15 text-success";
    if (score >= 3.5) return "bg-info/15 text-info";
    if (score >= 2.5) return "bg-warning/15 text-warning";
    return "bg-base-content/15 text-base-content/50";
}

export function experienceColor(years?: number): string {
    if (!years) return "bg-base-content/15 text-base-content/50";
    if (years >= 10) return "bg-success/15 text-success";
    if (years >= 5) return "bg-info/15 text-info";
    if (years >= 2) return "bg-warning/15 text-warning";
    return "bg-base-content/15 text-base-content/50";
}

export function placementColor(count?: number): string {
    if (!count) return "bg-base-content/15 text-base-content/50";
    if (count >= 50) return "bg-success/15 text-success";
    if (count >= 20) return "bg-info/15 text-info";
    if (count >= 5) return "bg-warning/15 text-warning";
    return "bg-base-content/15 text-base-content/50";
}

export function getInitials(name?: string): string {
    if (!name) return "?";
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function formatScore(score?: number): string {
    if (!score) return "N/A";
    return score.toFixed(1);
}