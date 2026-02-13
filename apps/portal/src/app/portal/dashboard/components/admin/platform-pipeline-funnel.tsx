'use client';

import { ContentCard, EmptyState } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';
import { PipelineStage } from '../../hooks/use-platform-pipeline';

interface PlatformPipelineFunnelProps {
    stages: PipelineStage[];
    loading: boolean;
    refreshKey?: number;
}

const STAGE_CONFIG: Record<string, { bg: string; barText: string; text: string; icon: string }> = {
    submitted: { bg: 'bg-primary', barText: 'text-primary-content', text: 'text-primary', icon: 'fa-paper-plane' },
    screen: { bg: 'bg-info', barText: 'text-info-content', text: 'text-info', icon: 'fa-eye' },
    interview: { bg: 'bg-accent', barText: 'text-accent-content', text: 'text-accent', icon: 'fa-comments' },
    offer: { bg: 'bg-warning', barText: 'text-warning-content', text: 'text-warning', icon: 'fa-handshake' },
    hired: { bg: 'bg-success', barText: 'text-success-content', text: 'text-success', icon: 'fa-trophy' },
};

export default function PlatformPipelineFunnel({ stages, loading, refreshKey }: PlatformPipelineFunnelProps) {
    if (loading) {
        return (
            <ContentCard title="Platform pipeline" icon="fa-filter" className="bg-base-200 h-full">
                <SkeletonList count={5} variant="text-block" gap="gap-4" />
            </ContentCard>
        );
    }

    const maxCount = Math.max(...stages.map(s => s.count), 1);
    const totalApplied = stages[0]?.count || 1;

    if (stages.every(s => s.count === 0)) {
        return (
            <ContentCard title="Platform pipeline" icon="fa-filter" className="bg-base-200 h-full">
                <EmptyState
                    icon="fa-filter"
                    title="No applications in pipeline"
                    description="Applications will appear here once recruiters begin submitting candidates."
                    size="sm"
                />
            </ContentCard>
        );
    }

    return (
        <ContentCard title="Platform pipeline" icon="fa-filter" className="bg-base-200 h-full">
            <div className="space-y-1">
                {stages.map((stage, i) => {
                    const config = STAGE_CONFIG[stage.key] || STAGE_CONFIG.submitted;
                    const widthPercent = Math.max(12, (stage.count / maxCount) * 100);
                    const conversionPercent = i > 0 && stages[i - 1].count > 0
                        ? Math.round((stage.count / stages[i - 1].count) * 100)
                        : null;

                    return (
                        <div key={stage.key}>
                            {/* Conversion arrow */}
                            {conversionPercent !== null && (
                                <div className="flex items-center gap-2 py-1 pl-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-px h-2 ${config.bg} opacity-30`}></div>
                                        <i className={`fa-solid fa-chevron-down text-[8px] ${config.text} opacity-50`}></i>
                                    </div>
                                    <span className={`text-[10px] font-medium ${config.text} opacity-60 tabular-nums`}>
                                        {conversionPercent}% conversion
                                    </span>
                                </div>
                            )}

                            {/* Stage row */}
                            <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.bg}/10`}>
                                    <i className={`fa-duotone fa-regular ${config.icon} text-xs ${config.text}`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-medium ${config.text}`}>{stage.label}</span>
                                        <span className="text-xs text-base-content/50 tabular-nums">
                                            {Math.round((stage.count / totalApplied) * 100)}%
                                        </span>
                                    </div>
                                    <div className="h-9 rounded-lg bg-base-300/50 overflow-hidden">
                                        <div
                                            className={`h-full rounded-lg ${config.bg} transition-all duration-700 ease-out flex items-center px-3 justify-between`}
                                            style={{ width: `${widthPercent}%` }}
                                        >
                                            <span className={`text-xs font-bold tabular-nums ${config.barText}`}>
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
        </ContentCard>
    );
}
