"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; myCompanies: number; pending: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-building"
            kicker="Company Network"
            headline={[{ text: "Browse" }, { text: "companies,", highlight: true }, { text: "build networks." }]}
            subtitle="Discover companies, build relationships, and grow your split-fee recruiting network from a single view."
            stats={[
                { value: stats.total, label: "Marketplace", icon: "fa-building", color: "primary" },
                { value: stats.myCompanies, label: "My Companies", icon: "fa-building-user", color: "accent" },
                { value: stats.pending, label: "Pending", icon: "fa-hourglass-half", color: "secondary" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
