"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; active: number; signups: number; inactive: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-link"
            kicker="Grow Your Network"
            headline={[{ text: "Your unique" }, { text: "growth", highlight: true }, { text: "engine." }]}
            subtitle="Share your referral code with candidates and companies. When they sign up through your code, they're attributed to you — building your sourcing record and expanding your reach in the marketplace."
            stats={[
                { value: stats.total, label: "Total Codes", icon: "fa-link", color: "primary" },
                { value: stats.active, label: "Active", icon: "fa-bolt", color: "accent" },
                { value: stats.signups, label: "Signups", icon: "fa-user-plus", color: "secondary" },
                { value: stats.inactive, label: "Inactive", icon: "fa-circle-pause", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
