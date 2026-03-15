"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; pending: number; active: number; declined: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-handshake"
            kicker="Network Connections"
            headline={[{ text: "Your" }, { text: "connections,", highlight: true }, { text: "managed." }]}
            subtitle="Review partnership requests, manage active connections, and track recruiter relationships across your network."
            stats={[
                { value: stats.total, label: "Total", icon: "fa-handshake", color: "primary" },
                { value: stats.pending, label: "Pending", icon: "fa-hourglass-half", color: "accent" },
                { value: stats.active, label: "Active", icon: "fa-circle-check", color: "secondary" },
                { value: stats.declined, label: "Declined", icon: "fa-xmark", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
