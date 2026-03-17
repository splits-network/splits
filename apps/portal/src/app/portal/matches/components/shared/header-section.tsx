"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; newThisWeek: number; excellentCount: number; avgScore: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-bullseye"
            kicker="Matches"
            headline={[{ text: "Your matched" }, { text: "candidates.", highlight: true }]}
            subtitle="Scored candidate recommendations for your active roles."
            stats={[
                { value: stats.total, label: "Total Matches", icon: "fa-bullseye", color: "primary" },
                { value: stats.newThisWeek, label: "New This Week", icon: "fa-sparkles", color: "accent" },
                { value: stats.excellentCount, label: "Excellent", icon: "fa-stars", color: "success" },
                { value: stats.avgScore, label: "Avg Score", icon: "fa-chart-bar", color: "secondary" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
