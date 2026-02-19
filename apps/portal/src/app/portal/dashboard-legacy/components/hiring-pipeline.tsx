'use client';

import { useHiringPipeline } from '../hooks/use-hiring-pipeline';
import { MemphisCard, MemphisEmpty, MemphisSkeleton } from './primitives';
import { ACCENT, accentAt } from './accent';

interface HiringPipelineProps {
    trendPeriod?: number;
    refreshKey?: number;
}

const STAGE_ACCENTS: Record<string, number> = {
    Screen: 1,
    Submitted: 1,
    Interview: 0,
    Offer: 2,
    Hired: 3,
};

const STAGE_ICONS: Record<string, string> = {
    Screen: 'fa-eye',
    Submitted: 'fa-paper-plane',
    Interview: 'fa-comments',
    Offer: 'fa-handshake',
    Hired: 'fa-trophy',
};

export default function HiringPipeline({ trendPeriod = 12 }: HiringPipelineProps) {
    const { stages, loading, error } = useHiringPipeline(trendPeriod);

    if (loading) {
        return (
            <MemphisCard title="Hiring Pipeline" icon="fa-filter" accent={ACCENT[1]} className="h-full">
                <MemphisSkeleton count={5} />
            </MemphisCard>
        );
    }

    if (error || stages.length === 0) {
        return (
            <MemphisCard title="Hiring Pipeline" icon="fa-filter" accent={ACCENT[1]} className="h-full">
                <MemphisEmpty
                    icon="fa-filter"
                    title="No candidates in pipeline"
                    description="Post a role and recruiters will start submitting candidates."
                />
            </MemphisCard>
        );
    }

    const maxCount = Math.max(...stages.map(s => s.count), 1);

    return (
        <MemphisCard title="Hiring Pipeline" icon="fa-filter" accent={ACCENT[1]} className="h-full">
            <div className="space-y-1">
                {stages.map((stage, i) => {
                    const widthPercent = Math.max(15, (stage.count / maxCount) * 100);
                    const nextStage = stages[i + 1];
                    const conversionRate = nextStage && stage.count > 0
                        ? Math.round((nextStage.count / stage.count) * 100)
                        : null;
                    const accentIdx = STAGE_ACCENTS[stage.label] ?? 1;
                    const accent = accentAt(accentIdx);
                    const icon = STAGE_ICONS[stage.label] || 'fa-circle';

                    return (
                        <div key={stage.label}>
                            <div className="flex items-center gap-3">
                                <div className="w-24 shrink-0 flex items-center gap-2 justify-end">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-dark/60">
                                        {stage.label}
                                    </span>
                                    <div className={`w-6 h-6 border-4 border-dark ${accent.bg} flex items-center justify-center shrink-0`}>
                                        <i className={`fa-duotone fa-regular ${icon} text-[8px] ${accent.textOnBg}`} />
                                    </div>
                                </div>

                                <div className="flex-1 relative">
                                    <div
                                        className={`h-9 ${accent.bg} transition-all duration-700 ease-out flex items-center justify-between px-3 min-w-[3rem] border-4 border-dark`}
                                        style={{ width: `${widthPercent}%` }}
                                    >
                                        <span className={`text-xs font-black tabular-nums ${accent.textOnBg}`}>
                                            {stage.count.toLocaleString()}
                                        </span>
                                        {widthPercent > 30 && (
                                            <span className={`text-[10px] font-bold tabular-nums ${accent.textOnBg} opacity-60`}>
                                                {Math.round((stage.count / maxCount) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {conversionRate !== null && (
                                <div className="flex items-center gap-3 my-0.5">
                                    <div className="w-24 shrink-0" />
                                    <div className="flex items-center gap-1.5 ml-2">
                                        <i className="fa-solid fa-chevron-down text-[8px] text-dark/30" />
                                        <span className={`text-[10px] font-black tabular-nums ${accent.text}`}>
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
