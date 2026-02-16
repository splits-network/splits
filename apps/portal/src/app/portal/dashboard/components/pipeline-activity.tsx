'use client';

import Link from 'next/link';
import { usePipelineActivity, PipelineApplication } from '../hooks/use-pipeline-activity';
import { MemphisCard, MemphisEmpty, MemphisSkeleton, MemphisBtn } from './primitives';
import { ACCENT, stageAccent } from './accent';

function getDaysInStage(updatedAt: string): number {
    return Math.floor(
        (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
}

function getDaysStyle(days: number): { icon: string; className: string } {
    if (days > 14) return { icon: 'fa-triangle-exclamation', className: 'text-coral font-black' };
    if (days > 7) return { icon: 'fa-clock', className: 'text-yellow font-bold' };
    return { icon: '', className: 'text-dark/50' };
}

const STAGE_LABELS: Record<string, string> = {
    screen: 'Screen',
    draft: 'Draft',
    submitted: 'Submitted',
    company_review: 'Review',
    interview: 'Interview',
    offer: 'Offer',
    hired: 'Hired',
};

export default function PipelineActivity() {
    const { applications, loading, error, refresh } = usePipelineActivity();

    const headerRight = (
        <MemphisBtn href="/portal/applications" accent={ACCENT[1]} variant="ghost" size="sm">
            View All <i className="fa-duotone fa-regular fa-arrow-right" />
        </MemphisBtn>
    );

    if (loading) {
        return (
            <MemphisCard title="Pipeline Activity" icon="fa-inbox" accent={ACCENT[0]} headerRight={headerRight}>
                <MemphisSkeleton count={6} />
            </MemphisCard>
        );
    }

    if (applications.length === 0) {
        return (
            <MemphisCard title="Pipeline Activity" icon="fa-inbox" accent={ACCENT[0]} headerRight={headerRight}>
                <MemphisEmpty
                    icon="fa-inbox"
                    title="No pipeline activity"
                    description="Submit candidates to your active roles to start building your pipeline."
                />
            </MemphisCard>
        );
    }

    return (
        <MemphisCard title="Pipeline Activity" icon="fa-inbox" accent={ACCENT[0]} headerRight={headerRight}>
            <div className="overflow-x-auto -mx-5">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-4 border-dark">
                            <th className="text-left px-5 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Candidate
                            </th>
                            <th className="text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Role
                            </th>
                            <th className="text-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Stage
                            </th>
                            <th className="text-center px-5 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Days
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app: PipelineApplication) => {
                            const days = getDaysInStage(app.updated_at);
                            const daysStyle = getDaysStyle(days);
                            const accent = stageAccent(app.stage);

                            return (
                                <tr key={app.id} className="border-b border-dark/10 hover:bg-dark/5 transition-colors">
                                    <td className="px-5 py-3">
                                        <Link
                                            href={`/portal/applications/${app.id}`}
                                            className="text-sm font-bold text-dark line-clamp-1 hover:text-coral transition-colors"
                                        >
                                            {app.candidate_name || 'Unknown'}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="text-xs text-dark/50 line-clamp-1">
                                            {app.job_title || '\u2014'}
                                        </span>
                                    </td>
                                    <td className="text-center px-3 py-3">
                                        <span className={`inline-block px-2 py-0.5 border-4 border-dark text-[10px] font-black uppercase tracking-wider ${accent.bg} ${accent.textOnBg}`}>
                                            {STAGE_LABELS[app.stage] || app.stage}
                                        </span>
                                    </td>
                                    <td className="text-center px-5 py-3">
                                        <span className={`text-sm tabular-nums ${daysStyle.className}`}>
                                            {daysStyle.icon && (
                                                <i className={`fa-duotone fa-regular ${daysStyle.icon} text-[10px] mr-1`} />
                                            )}
                                            {days}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </MemphisCard>
    );
}