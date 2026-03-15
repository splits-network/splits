"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; pending: number; accepted: number; expired: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-building-user"
            kicker="Company Invitations"
            headline={[{ text: "Invite" }, { text: "companies,", highlight: true }, { text: "grow." }]}
            subtitle="Expand your network by inviting companies to join Splits Network. Track and manage all your invitations."
            stats={[
                { value: stats.total, label: "Total", icon: "fa-building-user", color: "primary" },
                { value: stats.pending, label: "Pending", icon: "fa-hourglass-half", color: "accent" },
                { value: stats.accepted, label: "Accepted", icon: "fa-circle-check", color: "secondary" },
                { value: stats.expired, label: "Expired", icon: "fa-clock-rotate-left", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
