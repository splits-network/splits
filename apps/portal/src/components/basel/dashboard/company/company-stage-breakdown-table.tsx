"use client";

import { BaselChartCard } from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { HiringStage } from "@/app/portal/dashboard/hooks/use-hiring-pipeline";

interface CompanyStageBreakdownTableProps {
    stages: HiringStage[];
    loading: boolean;
}

/**
 * GA-style ranked numeric table — pipeline stages with candidate count.
 * Designed to sit beside the funnel chart as a chart+table pair.
 */
export function CompanyStageBreakdownTable({
    stages,
    loading,
}: CompanyStageBreakdownTableProps) {
    const total = stages.reduce((sum, s) => sum + s.count, 0);

    return (
        <BaselChartCard
            title="Pipeline by Stage"
            subtitle={`${total.toLocaleString()} total candidates`}
            accentColor="primary"
            compact
        >
            {loading ? (
                <ChartLoadingState height={200} />
            ) : stages.length === 0 ? (
                <p className="text-sm text-base-content/40 py-6 text-center">
                    No pipeline data.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-xs w-full">
                        <thead>
                            <tr>
                                <th className="text-xs font-black uppercase tracking-wider text-base-content/50">
                                    Stage
                                </th>
                                <th className="text-xs font-black uppercase tracking-wider text-base-content/50 text-right">
                                    Candidates
                                </th>
                                <th className="text-xs font-black uppercase tracking-wider text-base-content/50 text-right">
                                    % of Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stages.map((stage) => {
                                const pct =
                                    total > 0
                                        ? ((stage.count / total) * 100).toFixed(
                                              1,
                                          )
                                        : "0";
                                return (
                                    <tr key={stage.label}>
                                        <td className="text-sm font-semibold">
                                            {stage.label}
                                        </td>
                                        <td className="text-sm tabular-nums text-right font-semibold">
                                            {stage.count.toLocaleString()}
                                        </td>
                                        <td className="text-sm tabular-nums text-right text-base-content/60">
                                            {pct}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </BaselChartCard>
    );
}
