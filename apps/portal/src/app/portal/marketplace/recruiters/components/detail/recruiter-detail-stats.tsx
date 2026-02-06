"use client";

import { RecruiterDetailProps } from "./types";

interface StatCardProps {
    title: string;
    value: string | number | undefined;
    icon: string;
    colorClass: string;
    suffix?: string;
}

function StatCard({ title, value, icon, colorClass, suffix = "" }: StatCardProps) {
    const displayValue = value !== undefined && value !== null ? `${value}${suffix}` : "—";

    return (
        <div className="card bg-base-200 shadow-sm border border-base-300">
            <div className="card-body p-4">
                <div className="flex items-center gap-2 text-base-content/60 mb-1">
                    <i className={`fa-duotone fa-regular ${icon} text-sm`}></i>
                    <h4 className="text-xs font-medium uppercase tracking-wide">
                        {title}
                    </h4>
                </div>
                <div className={`text-2xl font-bold font-mono ${colorClass}`}>
                    {displayValue}
                </div>
            </div>
        </div>
    );
}

export default function RecruiterDetailStats({
    recruiter,
}: RecruiterDetailProps) {
    return (
        <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <i className="fa-duotone fa-regular fa-chart-simple text-primary"></i>
                Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    title="Placements"
                    value={recruiter.total_placements}
                    icon="fa-handshake"
                    colorClass="text-primary"
                />
                <StatCard
                    title="Success Rate"
                    value={
                        recruiter.success_rate !== undefined
                            ? Math.round(recruiter.success_rate)
                            : undefined
                    }
                    icon="fa-bullseye"
                    colorClass="text-success"
                    suffix="%"
                />
                <StatCard
                    title="Reputation"
                    value={recruiter.reputation_score}
                    icon="fa-star"
                    colorClass="text-warning"
                />
                <StatCard
                    title="Avg. Time to Hire"
                    value={recruiter.average_time_to_hire}
                    icon="fa-clock"
                    colorClass="text-info"
                    suffix="d"
                />
            </div>
        </section>
    );
}
