"use client";

import Link from "next/link";
import { PeriodSelector } from "@/components/basel/dashboard/shared/period-selector";

interface RecruiterHeaderProps {
    name: string;
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
    canCreateRole: boolean;
    onCreateRole: () => void;
}

export function RecruiterHeader({
    name,
    trendPeriod,
    onTrendPeriodChange,
    canCreateRole,
    onCreateRole,
}: RecruiterHeaderProps) {
    return (
        <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="section-heading">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                        YOUR PIPELINE
                    </p>
                    <h1 className="text-2xl font-black tracking-tight text-base-content">
                        {name} Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <PeriodSelector
                        value={trendPeriod}
                        onChange={onTrendPeriodChange}
                    />
                    {canCreateRole && (
                        <button
                            onClick={onCreateRole}
                            className="btn btn-primary btn-sm"
                        >
                            <i className="fa-duotone fa-regular fa-plus" />{" "}
                            Create Role
                        </button>
                    )}
                    <Link href="/portal/roles" className="btn btn-ghost btn-sm">
                        <i className="fa-duotone fa-regular fa-briefcase" />{" "}
                        Browse Roles
                    </Link>
                    <Link
                        href="/portal/candidates"
                        className="btn btn-ghost btn-sm"
                    >
                        <i className="fa-duotone fa-regular fa-users" /> My
                        Candidates
                    </Link>
                </div>
            </div>
        </section>
    );
}
