"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; pending: number; accepted: number; declined: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-paper-plane"
            kicker="Candidate Invitations"
            headline={[{ text: "Track every" }, { text: "invitation,", highlight: true }, { text: "transparently." }]}
            subtitle="Manage your candidate representation invitations. Consent-based recruiting, built on trust."
            stats={[
                { value: stats.total, label: "Total", icon: "fa-paper-plane", color: "primary" },
                { value: stats.pending, label: "Pending", icon: "fa-hourglass-half", color: "accent" },
                { value: stats.accepted, label: "Representing", icon: "fa-circle-check", color: "secondary" },
                { value: stats.declined, label: "Declined", icon: "fa-xmark", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
