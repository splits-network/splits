"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";
import type { CallStats } from "../../types";
import { formatDuration } from "../../types";

interface HeaderSectionProps {
    stats: CallStats | null;
    loading: boolean;
}

export function HeaderSection({ stats, loading }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-video"
            kicker="Calls"
            headline={[
                { text: "Every" },
                { text: "conversation,", highlight: true },
                { text: "tracked." },
            ]}
            subtitle="Log calls, track follow-ups, and keep a complete record of every conversation across your recruiting network."
            stats={[
                { value: loading ? "—" : (stats?.upcoming_count ?? 0), label: "Upcoming", icon: "fa-calendar-clock", color: "primary" },
                { value: loading ? "—" : (stats?.this_week_count ?? 0), label: "This Week", icon: "fa-calendar-week", color: "accent" },
                { value: loading ? "—" : formatDuration(stats?.avg_duration_minutes ?? null), label: "Avg Duration", icon: "fa-clock", color: "secondary" },
                { value: loading ? "—" : (stats?.needs_follow_up_count ?? 0), label: "Follow-ups", icon: "fa-flag", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
