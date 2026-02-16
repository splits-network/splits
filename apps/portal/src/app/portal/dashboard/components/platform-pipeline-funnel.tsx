'use client';

import { MemphisCard, MemphisEmpty, MemphisSkeleton } from './primitives';
import { ACCENT, accentAt } from './accent';
import { PipelineStage } from '../hooks/use-platform-pipeline';

interface PlatformPipelineFunnelProps {
    stages: PipelineStage[];
    loading: boolean;
}

const STAGE_CONFIG: Record<string, { accentIdx: number; icon: string }> = {
    submitted: { accentIdx: 1, icon: 'fa-paper-plane' },
    screen: { accentIdx: 1, icon: 'fa-eye' },
    interview: { accentIdx: 0, icon: 'fa-comments' },
    offer: { accentIdx: 2, icon: 'fa-handshake' },
    hired: { accentIdx: 3, icon: 'fa-trophy' },
};

export default function PlatformPipelineFunnel({ stages, loading }: PlatformPipelineFunnelProps) {
    if (loading) {
        return (
            <MemphisCard title="Platform Pipeline" icon="fa-filter" accent={ACCENT[1]} className="h-full">
                <MemphisSkeleton count={5} />
            </MemphisCard>
        );
    }

    if (stages.every(s => s.count === 0)) {
        return (
            <MemphisCard title="Platform Pipeline" icon="fa-filter" accent={ACCENT[1]} className="h-full">
                <MemphisEmpty
                    icon="fa-filter"
                    title="No applications in pipeline"
                    description="Applications will appear here once recruiters begin submitting candidates."
                />
            </MemphisCard>
        );
    }

    const maxCount = Math.max(...stages.map(s => s.count), 1);
    const totalApplied = stages[0]?.count || 1;

    return (
        <MemphisCard title="Platform Pipeline" icon="fa-filter" accent={ACCENT[1]} className="h-full">
            <div className="space-y-1">
                {stages.map((stage, i) => {
                    const config = STAGE_CONFIG[stage.key] || { accentIdx: 1, icon: 'fa-circle' };
                    const accent = accentAt(config.accentIdx);
                    const widthPercent = Math.max(15, (stage.count / maxCount) * 100);
                    const conversionPercent = i > 0 && stages[i - 1].count > 0
                        ? Math.round((stage.count / stages[i - 1].count) * 100)
                        : null;

                    return (
                        <div key={stage.key}>
                            {/* Conversion arrow */}
                            {conversionPercent !== null && (
                                <div className="flex items-center gap-2 py-1 pl-10">
                                    <i className="fa-solid fa-chevron-down text-[8px] text-dark/30" />
                                    <span className={`text-[10px] font-black tabular-nums ${accent.text} opacity-60`}>
                                        {conversionPercent}% conversion
                                    </span>
                                </div>
                            )}

                            {/* Stage row */}
                            <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 border-4 border-dark ${accent.bg}/20 flex items-center justify-center shrink-0`}>
                                    <i className={`fa-duotone fa-regular ${config.icon} text-[10px] ${accent.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${accent.text}`}>
                                            {stage.label}
                                        </span>
                                        <span className="text-[10px] font-bold tabular-nums text-dark/40">
                                            {Math.round((stage.count / totalApplied) * 100)}%
                                        </span>
                                    </div>
                                    <div className="h-9 border-4 border-dark overflow-hidden bg-dark/5">
                                        <div
                                            className={`h-full ${accent.bg} transition-all duration-700 ease-out flex items-center px-3`}
                                            style={{ width: `${widthPercent}%` }}
                                        >
                                            <span className={`text-xs font-black tabular-nums ${accent.textOnBg}`}>
                                                {stage.count.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
