"use client";

import { ChartLoadingState } from "@splits-network/shared-ui";

export interface PipelineFunnelChartProps {
    stages: { label: string; count: number; color?: string }[];
    loading?: boolean;
    height?: number;
}

const STAGE_COLORS: Record<string, string> = {
    Screen: "bg-info",
    Submitted: "bg-primary",
    Interview: "bg-accent",
    Offer: "bg-warning",
    Hired: "bg-success",
};

/**
 * Horizontal cascade pipeline — replaces the ECharts funnel.
 * Shows proportional bars per stage with conversion rates between them.
 */
export function PipelineFunnelChart({
    stages,
    loading = false,
    height = 200,
}: PipelineFunnelChartProps) {
    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!stages.length) {
        return <ChartLoadingState height={height} message="No pipeline data" />;
    }

    const maxCount = Math.max(...stages.map((s) => s.count), 1);

    return (
        <div className="flex flex-col justify-center gap-1" style={{ minHeight: height }}>
            {stages.map((stage, i) => {
                const pct = (stage.count / maxCount) * 100;
                const colorClass =
                    STAGE_COLORS[stage.label] || "bg-base-content/20";
                const conversionRate =
                    i > 0 && stages[i - 1].count > 0
                        ? Math.round(
                              (stage.count / stages[i - 1].count) * 100,
                          )
                        : null;

                return (
                    <div key={stage.label}>
                        {/* Conversion arrow between stages */}
                        {conversionRate !== null && (
                            <div className="flex items-center gap-1.5 pl-14 py-0.5">
                                <i className="fa-solid fa-arrow-down text-[8px] text-base-content/30" />
                                <span className="text-[11px] tabular-nums text-base-content/40 font-medium">
                                    {conversionRate}%
                                </span>
                            </div>
                        )}
                        {/* Stage bar */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-base-content/60 w-12 text-right shrink-0 truncate">
                                {stage.label}
                            </span>
                            <div className="flex-1 h-6 bg-base-300/50 rounded overflow-hidden relative">
                                <div
                                    className={`h-full ${colorClass} rounded transition-all duration-500 ease-out`}
                                    style={{
                                        width: `${Math.max(pct, 2)}%`,
                                    }}
                                />
                                <span className="absolute inset-y-0 left-2 flex items-center text-sm font-semibold tabular-nums text-base-content/80">
                                    {stage.count.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
