"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: { total: number; submitted: number; interview: number; offer: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-file-lines"
            kicker="Pipeline"
            headline={[{ text: "Every" }, { text: "candidate.", highlight: true }, { text: "One view." }]}
            subtitle="Track each application from submission through offer. AI scoring, stage progression, and recruiter activity — visible at every step."
            stats={[
                { value: stats.total, label: "Total", icon: "fa-file-lines", color: "primary" },
                { value: stats.submitted, label: "Submitted", icon: "fa-paper-plane", color: "accent" },
                { value: stats.interview, label: "Interview", icon: "fa-comments", color: "secondary" },
                { value: stats.offer, label: "Offers", icon: "fa-handshake", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
