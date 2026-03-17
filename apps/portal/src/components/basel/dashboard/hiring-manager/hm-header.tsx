"use client";

import { PeriodSelector } from "@/components/basel/dashboard/shared/period-selector";

interface HmHeaderProps {
    userName: string;
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
}

export function HmHeader({
    userName,
    trendPeriod,
    onTrendPeriodChange,
}: HmHeaderProps) {
    return (
        <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="section-heading">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                        HIRING MANAGER
                    </p>
                    <h1 className="text-2xl font-black tracking-tight text-base-content">
                        {userName}&apos;s Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <PeriodSelector
                        value={trendPeriod}
                        onChange={onTrendPeriodChange}
                    />
                </div>
            </div>
        </section>
    );
}
