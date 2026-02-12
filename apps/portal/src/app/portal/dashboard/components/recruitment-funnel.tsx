'use client';

import { useFunnelData } from '../hooks/use-funnel-data';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';

interface RecruitmentFunnelProps {
    trendPeriod?: number;
    refreshKey?: number;
}

const STAGE_CONFIG: Record<string, { bg: string; barText: string; text: string; bgLight: string }> = {
    Screen: { bg: 'bg-info', barText: 'text-info-content', text: 'text-info', bgLight: 'bg-info/10' },
    Submitted: { bg: 'bg-primary', barText: 'text-primary-content', text: 'text-primary', bgLight: 'bg-primary/10' },
    Interview: { bg: 'bg-accent', barText: 'text-accent-content', text: 'text-accent', bgLight: 'bg-accent/10' },
    Offer: { bg: 'bg-warning', barText: 'text-warning-content', text: 'text-warning', bgLight: 'bg-warning/10' },
    Hired: { bg: 'bg-success', barText: 'text-success-content', text: 'text-success', bgLight: 'bg-success/10' },
};

const STAGE_ICONS: Record<string, string> = {
    Screen: 'fa-eye',
    Submitted: 'fa-paper-plane',
    Interview: 'fa-comments',
    Offer: 'fa-handshake',
    Hired: 'fa-trophy',
};

export default function RecruitmentFunnel({ trendPeriod = 12, refreshKey }: RecruitmentFunnelProps) {
    const { stages, loading, error } = useFunnelData(trendPeriod);

    if (loading) {
        return (
            <ContentCard title="Recruitment funnel" icon="fa-filter" className="bg-base-200 h-full">
                <SkeletonList count={5} variant="text-block" gap="gap-4" />
            </ContentCard>
        );
    }

    if (error || stages.length === 0) {
        return (
            <ContentCard title="Recruitment funnel" icon="fa-filter" className="bg-base-200 h-full">
                <EmptyState
                    icon="fa-filter"
                    title="No candidates in pipeline"
                    description="Submit your first candidate to a role and your funnel will appear here."
                    size="sm"
                />
            </ContentCard>
        );
    }

    const maxCount = Math.max(...stages.map(s => s.count), 1);

    return (
        <ContentCard title="Recruitment funnel" icon="fa-filter" className="bg-base-200 h-full">
            <div className="space-y-1">
                {stages.map((stage, i) => {
                    const widthPercent = Math.max(12, (stage.count / maxCount) * 100);
                    const nextStage = stages[i + 1];
                    const conversionRate = nextStage && stage.count > 0
                        ? Math.round((nextStage.count / stage.count) * 100)
                        : null;
                    const config = STAGE_CONFIG[stage.label] || { bg: 'bg-base-300', barText: 'text-base-content', text: 'text-base-content/60', bgLight: 'bg-base-300/10' };
                    const icon = STAGE_ICONS[stage.label] || 'fa-circle';

                    return (
                        <div key={stage.label}>
                            {/* Stage row */}
                            <div className="flex items-center gap-3">
                                {/* Stage label with icon */}
                                <div className="w-24 shrink-0 flex items-center gap-2 justify-end">
                                    <span className="text-xs font-medium text-base-content/70">
                                        {stage.label}
                                    </span>
                                    <div className={`w-6 h-6 rounded-md ${config.bgLight} flex items-center justify-center shrink-0`}>
                                        <i className={`fa-duotone fa-regular ${icon} text-[10px] ${config.text}`}></i>
                                    </div>
                                </div>

                                {/* Bar */}
                                <div className="flex-1 relative">
                                    <div
                                        className={`h-9 rounded-lg ${config.bg} transition-all duration-700 ease-out flex items-center justify-between px-3 min-w-[3rem]`}
                                        style={{ width: `${widthPercent}%` }}
                                    >
                                        <span className={`text-xs font-bold tabular-nums ${config.barText}`}>
                                            {stage.count.toLocaleString()}
                                        </span>
                                        {widthPercent > 25 && (
                                            <span className={`text-[10px] font-medium tabular-nums ${config.barText} opacity-60`}>
                                                {Math.round((stage.count / maxCount) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Conversion arrow between stages */}
                            {conversionRate !== null && (
                                <div className="flex items-center gap-3 my-0.5">
                                    <div className="w-24 shrink-0"></div>
                                    <div className="flex items-center gap-1.5 ml-1">
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-1.5 bg-base-content/15"></div>
                                            <i className="fa-duotone fa-regular fa-chevron-down text-[8px] text-base-content/30"></i>
                                        </div>
                                        <span className={`text-[10px] font-semibold tabular-nums ${config.text}`}>
                                            {conversionRate}% conversion
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </ContentCard>
    );
}
