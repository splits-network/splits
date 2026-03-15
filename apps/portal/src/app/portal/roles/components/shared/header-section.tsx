"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; active: number; newJobs: number; totalApps: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-briefcase"
            kicker="Open Roles"
            headline={[{ text: "Every role," }, { text: "one", highlight: true }, { text: "view." }]}
            subtitle="Search, filter, and track every position across your network. See who is working each role and where candidates stand."
            stats={[
                { value: stats.total, label: "Roles", icon: "fa-briefcase", color: "primary" },
                { value: stats.active, label: "Active", icon: "fa-bolt", color: "accent" },
                { value: stats.newJobs, label: "New", icon: "fa-sparkles", color: "secondary" },
                { value: stats.totalApps, label: "Candidates", icon: "fa-user-group", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
