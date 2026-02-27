import { getMatchScoreLabel } from "@splits-network/shared-types";

interface MatchScoreBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
}

export function MatchScoreBadge({ score, size = "sm" }: MatchScoreBadgeProps) {
    const label = getMatchScoreLabel(score);

    if (!label) {
        return <span className="badge badge-ghost badge-sm">Below Threshold</span>;
    }

    const sizeClass = size === "lg" ? "badge-lg" : size === "md" ? "badge-md" : "badge-sm";

    return (
        <span className={`badge ${label.badgeClass} ${sizeClass} gap-1`}>
            <i className={`fa-duotone fa-regular ${label.icon}`}></i>
            {label.label}
        </span>
    );
}
