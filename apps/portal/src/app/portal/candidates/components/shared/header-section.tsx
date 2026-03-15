"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; mine: number; verified: number; pending: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-users"
            kicker="Candidates"
            headline={[{ text: "Every" }, { text: "candidate,", highlight: true }, { text: "visible." }]}
            subtitle="Your full candidate pipeline in one place. Track verification status, manage relationships, and submit talent to open roles."
            stats={[
                { value: stats.total, label: "Total Candidates", icon: "fa-users", color: "primary" },
                { value: stats.mine, label: "My Pipeline", icon: "fa-user-check", color: "accent" },
                { value: stats.verified, label: "Verified", icon: "fa-circle-check", color: "secondary" },
                { value: stats.pending, label: "Pending Review", icon: "fa-clock", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
