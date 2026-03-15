"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; active: number; avgPlacements: number; topRated: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-users"
            kicker="Recruiter Network"
            headline={[{ text: "Find your next" }, { text: "recruiting", highlight: true }, { text: "partner." }]}
            subtitle="Discover and connect with top recruiters in the marketplace. Search by specialty, industry, and track record."
            stats={[
                { value: stats.total, label: "Recruiters", icon: "fa-users", color: "primary" },
                { value: stats.active, label: "Active", icon: "fa-circle-check", color: "accent" },
                { value: stats.avgPlacements, label: "Avg. Placements", icon: "fa-chart-bar", color: "secondary" },
                { value: stats.topRated, label: "Top Rated", icon: "fa-star", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
