"use client";

import { useFunnelData } from "../hooks/use-funnel-data";
import { MemphisCard, MemphisEmpty, MemphisSkeleton } from "./primitives";
import { ACCENT, accentAt } from "./accent";

interface RecruitmentFunnelProps {
    trendPeriod?: number;
    refreshKey?: number;
}

const STAGE_ACCENTS: Record<string, number> = {
    Screen: 1, // teal
    Submitted: 1, // teal
    Interview: 0, // coral
    Offer: 2, // yellow
    Hired: 3, // purple
};

const STAGE_ICONS: Record<string, string> = {
    Screen: "fa-eye",
    Submitted: "fa-paper-plane",
    Interview: "fa-comments",
    Offer: "fa-handshake",
    Hired: "fa-trophy",
};

export default function RecruitmentFunnel({
    trendPeriod = 12,
}: RecruitmentFunnelProps) {
    const { stages, loading, error } = useFunnelData(trendPeriod);

    if (loading) {
        return (
            <MemphisCard
                title="Recruitment Funnel"
                icon="fa-filter"
                accent={ACCENT[1]}
                className="h-full"
            >
                <MemphisSkeleton count={5} />
            </MemphisCard>
        );
    }

    if (error || stages.length === 0) {
        return (
            <MemphisCard
                title="Recruitment Funnel"
                icon="fa-filter"
                accent={ACCENT[1]}
                className="h-full"
            >
                <MemphisEmpty
                    icon="fa-filter"
                    title="No candidates in pipeline"
                    description="Submit your first candidate to a role and your funnel will appear here."
                />
            </MemphisCard>
        );
    }

    const maxCount = Math.max(...stages.map((s) => s.count), 1);

    return (
        <MemphisCard
            title="Recruitment Funnel"
            icon="fa-filter"
            accent={ACCENT[1]}
            className="h-full"
        >
            <div className="flex flex-col gap-5">
                {stages.map((stage, i) => {
                    const widthPercent = Math.max(
                        (stage.count / maxCount) * 100,
                    );
                    const nextStage = stages[i + 1];
                    const conversionRate =
                        nextStage && stage.count > 0
                            ? Math.round((nextStage.count / stage.count) * 100)
                            : null;
                    const accentIdx = STAGE_ACCENTS[stage.label] ?? 1;
                    const accent = accentAt(accentIdx);
                    const icon = STAGE_ICONS[stage.label] || "fa-circle";

                    return (
                        <div key={stage.label}>
                            {/* Stage bar */}
                            <div className="flex items-center gap-0">
                                <div className="w-30 shrink-0 flex items-center gap-2 justify-end">
                                    <span className="text-xs font-black uppercase tracking-wider text-dark/60">
                                        {stage.label}
                                    </span>
                                    <div
                                        className={`w-10 h-10 border-1 border-dark ${accent.bg} flex items-center justify-center shrink-0`}
                                    >
                                        <i
                                            className={`fa-duotone fa-regular ${icon} text-xs ${accent.textOnBg}`}
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 relative border-1 border-dark h-10">
                                    <div
                                        className={`h-full transition-all duration-700 ease-out flex items-center justify-between min-w-0 bg-linear-to-r ${accent.gradientFrom} to-transparent`}
                                        style={{ width: `${widthPercent}%` }}
                                    >
                                        <span
                                            className={`text-xs font-black tabular-nums ${widthPercent === 0 ? "text-dark" : accent.textOnBg} ml-2`}
                                        >
                                            {widthPercent}
                                        </span>
                                        {widthPercent > 30 && (
                                            <span
                                                className={`text-sm font-bold tabular-nums ${accent.textOnBg} opacity-60`}
                                            >
                                                {Math.round(
                                                    (stage.count / maxCount) *
                                                        100,
                                                )}
                                                %
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Conversion arrow */}
                            {conversionRate !== null && (
                                <div className="flex items-center gap-3 my-0.5">
                                    <div className="w-24 shrink-0" />
                                    <div className="flex items-center gap-1.5 ml-2">
                                        <i className="fa-solid fa-chevron-down text-[8px] text-dark/30" />
                                        <span
                                            className={`text-[10px] font-black tabular-nums ${accent.text}`}
                                        >
                                            {conversionRate}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
