"use client";

import Link from "next/link";
import type { RecruiterStats } from "@/app/portal/dashboard/hooks/use-recruiter-stats";

interface RecruiterAlertsProps {
    stats: RecruiterStats;
    statsLoading: boolean;
}

interface AlertItem {
    label: string;
    count: number;
    icon: string;
    color: string;
    href: string;
}

export function RecruiterAlerts({ stats, statsLoading }: RecruiterAlertsProps) {
    if (statsLoading) return null;

    const alerts: AlertItem[] = [];

    if (stats.stale_candidates > 0) {
        alerts.push({
            label: "candidates need attention",
            count: stats.stale_candidates,
            icon: "fa-duotone fa-regular fa-clock",
            color: "error",
            href: "/portal/applications?filter=stale",
        });
    }

    if (stats.pending_reviews > 0) {
        alerts.push({
            label: "awaiting your review",
            count: stats.pending_reviews,
            icon: "fa-duotone fa-regular fa-clipboard-check",
            color: "warning",
            href: "/portal/applications?filter=pending_review",
        });
    }

    if (stats.offers_pending > 0) {
        alerts.push({
            label: "offers pending response",
            count: stats.offers_pending,
            icon: "fa-duotone fa-regular fa-handshake",
            color: "info",
            href: "/portal/applications?filter=offer",
        });
    }

    if (alerts.length === 0) return null;

    return (
        <section className="px-4 lg:px-6 -mt-1">
            <div className="flex flex-wrap gap-3">
                {alerts.map((alert) => (
                    <Link
                        key={alert.label}
                        href={alert.href}
                        className={`flex items-center gap-2 px-3 py-2 bg-${alert.color}/10 text-${alert.color} text-sm font-medium hover:bg-${alert.color}/20 transition-colors`}
                    >
                        <i className={alert.icon} />
                        <span className="font-bold tabular-nums">
                            {alert.count}
                        </span>
                        <span>{alert.label}</span>
                        <i className="fa-duotone fa-regular fa-arrow-right text-xs opacity-60" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
