"use client";

import type { CallStats } from "../../types";
import { formatDuration } from "../../types";

interface CallStatsBarProps {
    stats: CallStats | null;
    loading: boolean;
}

const STAT_ITEMS = [
    {
        key: "upcoming_count" as const,
        label: "Upcoming",
        icon: "fa-duotone fa-regular fa-calendar-clock",
        color: "bg-primary",
        iconColor: "text-primary-content",
    },
    {
        key: "this_week_count" as const,
        label: "This Week",
        icon: "fa-duotone fa-regular fa-calendar-week",
        color: "bg-secondary",
        iconColor: "text-secondary-content",
    },
    {
        key: "this_month_count" as const,
        label: "This Month",
        icon: "fa-duotone fa-regular fa-calendar",
        color: "bg-accent",
        iconColor: "text-accent-content",
    },
    {
        key: "avg_duration_minutes" as const,
        label: "Avg Duration",
        icon: "fa-duotone fa-regular fa-clock",
        color: "bg-info",
        iconColor: "text-info-content",
    },
    {
        key: "needs_follow_up_count" as const,
        label: "Needs Follow-up",
        icon: "fa-duotone fa-regular fa-flag",
        color: "bg-warning",
        iconColor: "text-warning-content",
    },
];

export function CallStatsBar({ stats, loading }: CallStatsBarProps) {
    return (
        <section className="bg-base-300 text-base-content py-8">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex items-center gap-3 mb-6">
                    <i className="fa-duotone fa-regular fa-video text-primary" />
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                        Calls
                    </h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {STAT_ITEMS.map((item) => (
                        <div
                            key={item.key}
                            className="flex items-center gap-3 bg-base-content/5 p-3"
                        >
                            <div
                                className={`w-10 h-10 ${item.color} flex items-center justify-center shrink-0`}
                            >
                                <i
                                    className={`${item.icon} ${item.iconColor}`}
                                />
                            </div>
                            <div className="min-w-0">
                                {loading ? (
                                    <div className="h-6 w-10 bg-base-content/10 animate-pulse" />
                                ) : (
                                    <div className="text-2xl font-black">
                                        {item.key === "avg_duration_minutes"
                                            ? formatDuration(
                                                  stats?.avg_duration_minutes ??
                                                      null,
                                              )
                                            : (stats?.[item.key] ?? 0)}
                                    </div>
                                )}
                                <div className="text-sm uppercase tracking-wider opacity-60 truncate">
                                    {item.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
