"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";
import { formatCurrencyShort } from "./helpers";

interface HeaderSectionProps {
    stats: { total: number; totalEarnings: number; thisYearEarnings: number; avgCommission: number };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-handshake"
            kicker="Placements"
            headline={[{ text: "Track every" }, { text: "placement.", highlight: true }]}
            subtitle="Monitor filled roles, guarantee periods, and split-fee commissions across your recruiting network."
            stats={[
                { value: stats.total, label: "Placements", icon: "fa-handshake", color: "primary" },
                { value: formatCurrencyShort(stats.totalEarnings), label: "Total Earnings", icon: "fa-dollar-sign", color: "accent" },
                { value: formatCurrencyShort(stats.thisYearEarnings), label: `${new Date().getFullYear()} Earnings`, icon: "fa-calendar-check", color: "secondary" },
                { value: formatCurrencyShort(stats.avgCommission), label: "Avg. Commission", icon: "fa-chart-line", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
