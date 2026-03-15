"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; active: number; totalMembers: number; totalRevenue: number };
}

function formatRevenue(amount: number): string {
    const value = amount || 0;
    if (value >= 1000) return `$${Math.round(value / 1000)}k`;
    return `$${value}`;
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-users"
            kicker="Firm Hub"
            headline={[{ text: "Every firm," }, { text: "one", highlight: true }, { text: "view." }]}
            subtitle="Organize recruiters, track placements, and manage split-fee distributions across your firms."
            stats={[
                { value: stats.total, label: "Firms", icon: "fa-users", color: "primary" },
                { value: stats.active, label: "Active", icon: "fa-bolt", color: "accent" },
                { value: stats.totalMembers, label: "Members", icon: "fa-user-group", color: "secondary" },
                { value: formatRevenue(stats.totalRevenue), label: "Revenue", icon: "fa-dollar-sign", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
