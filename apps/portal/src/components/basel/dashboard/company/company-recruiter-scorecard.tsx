"use client";

import { BaselChartCard } from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { RecruiterScore } from "@/app/portal/dashboard/hooks/use-recruiter-scorecard";

interface CompanyRecruiterScorecardProps {
    recruiters: RecruiterScore[];
    loading: boolean;
}

export function CompanyRecruiterScorecard({
    recruiters,
    loading,
}: CompanyRecruiterScorecardProps) {
    return (
        <BaselChartCard
            title="Recruiter Performance"
            subtitle="Submission quality and placement rate by recruiter"
            accentColor="primary"
            compact
        >
            {loading ? (
                <ChartLoadingState height={240} />
            ) : recruiters.length === 0 ? (
                <p className="text-sm text-base-content/40 py-8 text-center">
                    No recruiter activity yet. Performance data appears after
                    recruiters begin submitting candidates.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                        <thead>
                            <tr>
                                <th className="text-sm font-black uppercase tracking-wider text-base-content/50">
                                    Recruiter
                                </th>
                                <th className="text-sm font-black uppercase tracking-wider text-base-content/50 text-right">
                                    Submitted
                                </th>
                                <th className="text-sm font-black uppercase tracking-wider text-base-content/50 text-right hidden sm:table-cell">
                                    Interviews
                                </th>
                                <th className="text-sm font-black uppercase tracking-wider text-base-content/50 text-right">
                                    Placed
                                </th>
                                <th className="text-sm font-black uppercase tracking-wider text-base-content/50 text-right">
                                    Rate
                                </th>
                                <th className="text-sm font-black uppercase tracking-wider text-base-content/50 text-right hidden md:table-cell">
                                    Avg Days
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recruiters.slice(0, 8).map((r) => (
                                <tr key={r.id} className="hover">
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                                                {r.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold truncate max-w-[140px]">
                                                {r.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-sm tabular-nums text-right">
                                        {r.submissions}
                                    </td>
                                    <td className="text-sm tabular-nums text-right hidden sm:table-cell">
                                        {r.interviews}
                                    </td>
                                    <td className="text-sm font-semibold tabular-nums text-right">
                                        {r.placements}
                                    </td>
                                    <td className="text-right">
                                        <ConversionBadge
                                            rate={r.conversionRate}
                                        />
                                    </td>
                                    <td className="text-sm tabular-nums text-right hidden md:table-cell">
                                        {r.avgDaysToPlace > 0
                                            ? `${r.avgDaysToPlace}d`
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </BaselChartCard>
    );
}

function ConversionBadge({ rate }: { rate: number }) {
    let color: string;
    if (rate >= 20) color = "badge-success";
    else if (rate >= 10) color = "badge-warning";
    else color = "badge-error";

    return (
        <span className={`badge badge-sm ${color} tabular-nums`}>
            {rate}%
        </span>
    );
}
