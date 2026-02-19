'use client';

import { useMemo } from 'react';
import { EmptyState } from '@splits-network/memphis-ui';
import { ACCENT, stageAccent, type AccentClasses } from './accent';
import { MemphisCard, MemphisSkeleton } from './primitives';

interface Application {
    id: string;
    stage: string;
    job?: {
        status?: string;
    };
}

interface CandidatePipelineProps {
    applications: Application[];
    loading?: boolean;
}

// Map every ATS stage to a candidate-facing pipeline bucket.
// The candidate sees a simplified view of their journey.
const STAGE_MAPPING: Record<string, string> = {
    // Early stages — app is being prepared/reviewed before company sees it
    draft: 'In Review',
    ai_review: 'In Review',
    ai_reviewed: 'In Review',
    recruiter_request: 'In Review',
    recruiter_proposed: 'In Review',
    recruiter_review: 'In Review',
    // Submitted to company
    submitted: 'Submitted',
    company_review: 'Submitted',
    company_feedback: 'Submitted',
    // Screening
    screen: 'Screen',
    // Interview rounds
    interview: 'Interview',
    final_interview: 'Interview',
    // Offer
    offer: 'Offer',
    // Hired (shown as final stage, not filtered out here)
    hired: 'Hired',
};

// Ordered stages for the funnel display
const PIPELINE_STAGES = ['In Review', 'Submitted', 'Screen', 'Interview', 'Offer', 'Hired'] as const;

const STAGE_ICONS: Record<string, string> = {
    'In Review': 'fa-magnifying-glass',
    Submitted: 'fa-paper-plane',
    Screen: 'fa-eye',
    Interview: 'fa-comments',
    Offer: 'fa-handshake',
    Hired: 'fa-trophy',
};

export default function CandidatePipeline({ applications, loading }: CandidatePipelineProps) {
    const stages = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const stage of PIPELINE_STAGES) {
            counts[stage] = 0;
        }

        applications.forEach(app => {
            // Skip terminal applications (except hired, which is a pipeline stage)
            if (app.stage === 'rejected' || app.stage === 'withdrawn' || app.stage === 'expired') return;
            // Skip applications for closed/filled jobs
            if (app.job?.status === 'closed' || app.job?.status === 'filled') return;

            const mapped = STAGE_MAPPING[app.stage];
            if (mapped && counts[mapped] !== undefined) {
                counts[mapped]++;
            }
        });

        return PIPELINE_STAGES.map(label => ({ label, count: counts[label] }));
    }, [applications]);

    if (loading) {
        return (
            <MemphisCard title="Application Pipeline" icon="fa-filter" accent={ACCENT[1]} className="h-full">
                <MemphisSkeleton count={6} />
            </MemphisCard>
        );
    }

    const totalActive = stages.reduce((sum, s) => sum + s.count, 0);

    if (totalActive === 0) {
        return (
            <MemphisCard title="Application Pipeline" icon="fa-filter" accent={ACCENT[1]} className="h-full">
                <EmptyState
                    icon="fa-duotone fa-regular fa-filter"
                    title="No active applications"
                    description="Apply to jobs to see your application pipeline here."
                    color="teal"
                    className="border-0"
                />
            </MemphisCard>
        );
    }

    const maxCount = Math.max(...stages.map(s => s.count), 1);

    return (
        <MemphisCard title="Application Pipeline" icon="fa-filter" accent={ACCENT[1]} className="h-full">
            <div className="space-y-1">
                {stages.map((stage, i) => {
                    const widthPercent = Math.max(12, (stage.count / maxCount) * 100);
                    const nextStage = stages[i + 1];
                    const conversionRate = nextStage && stage.count > 0
                        ? Math.round((nextStage.count / stage.count) * 100)
                        : null;
                    const accent = stageAccent(stage.label);
                    const icon = STAGE_ICONS[stage.label] || 'fa-circle';

                    return (
                        <div key={stage.label}>
                            <div className="flex items-center gap-3">
                                <div className="w-24 shrink-0 flex items-center gap-2 justify-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-dark/50">
                                        {stage.label}
                                    </span>
                                    <div className={`w-6 h-6 border-4 border-dark ${accent.bg} flex items-center justify-center shrink-0`}>
                                        <i className={`fa-duotone fa-regular ${icon} text-[10px] ${accent.textOnBg}`}></i>
                                    </div>
                                </div>

                                <div className="flex-1 relative">
                                    <div
                                        className={`h-9 ${accent.bg} transition-all duration-700 ease-out flex items-center justify-between px-3 min-w-[3rem]`}
                                        style={{ width: `${widthPercent}%` }}
                                    >
                                        <span className={`text-xs font-black tabular-nums ${accent.textOnBg}`}>
                                            {stage.count.toLocaleString()}
                                        </span>
                                        {widthPercent > 25 && (
                                            <span className={`text-[10px] font-bold tabular-nums ${accent.textOnBg} opacity-60`}>
                                                {Math.round((stage.count / maxCount) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {conversionRate !== null && (
                                <div className="flex items-center gap-3 my-0.5">
                                    <div className="w-24 shrink-0"></div>
                                    <div className="flex items-center gap-1.5 ml-1">
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-1.5 bg-dark/15"></div>
                                            <i className="fa-duotone fa-regular fa-chevron-down text-[8px] text-dark/30"></i>
                                        </div>
                                        <span className={`text-[10px] font-bold tabular-nums ${accent.text}`}>
                                            {conversionRate}% conversion
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
