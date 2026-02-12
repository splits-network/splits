'use client';

import Link from 'next/link';
import { usePipelineActivity, PipelineApplication } from '../hooks/use-pipeline-activity';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { getApplicationStageBadge } from '@/lib/utils/badge-styles';
import { SkeletonList } from '@splits-network/shared-ui';

const STAGE_COLORS: Record<string, string> = {
    screen: 'badge-warning',
    draft: 'badge-ghost',
    submitted: 'badge-info',
    company_review: 'badge-info',
    interview: 'badge-accent',
    offer: 'badge-success',
    hired: 'badge-primary',
};

function getDaysInStage(updatedAt: string): number {
    return Math.floor(
        (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
}

/** Returns a contextual icon for how long a candidate has been in stage */
function getDaysIndicator(days: number): { icon: string; className: string } {
    if (days > 14) return { icon: 'fa-triangle-exclamation', className: 'text-warning font-bold' };
    if (days > 7) return { icon: 'fa-clock', className: 'text-base-content/70 font-medium' };
    return { icon: '', className: 'text-base-content/50' };
}

interface PipelineActivityProps {
    onRefresh?: () => void;
}

export default function PipelineActivity({ onRefresh }: PipelineActivityProps) {
    const { applications, loading, error, refresh } = usePipelineActivity();

    const handleRefresh = () => {
        refresh();
        onRefresh?.();
    };

    const headerActions = (
        <Link href="/portal/applications" className="btn btn-sm btn-ghost text-xs">
            View all <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
        </Link>
    );

    if (loading) {
        return (
            <ContentCard
                title="Pipeline Activity"
                icon="fa-inbox"
                className="bg-base-200"
                headerActions={headerActions}
            >
                <SkeletonList count={6} variant="text-block" gap="gap-3" />
            </ContentCard>
        );
    }

    return (
        <ContentCard
            title="Pipeline Activity"
            icon="fa-inbox"
            className="bg-base-200"
            headerActions={headerActions}
        >
            {applications.length === 0 ? (
                <EmptyState
                    icon="fa-inbox"
                    title="No pipeline activity yet"
                    description="Submit candidates to your active roles to start building your pipeline"
                    size="sm"
                />
            ) : (
                <div className="overflow-x-auto -mx-4 sm:-mx-6">
                    <table className="table table-sm">
                        <thead>
                            <tr className="border-b border-base-300/50">
                                <th className="bg-transparent text-[11px] font-semibold uppercase tracking-wider text-base-content/40">Candidate</th>
                                <th className="bg-transparent text-[11px] font-semibold uppercase tracking-wider text-base-content/40">Role</th>
                                <th className="bg-transparent text-center text-[11px] font-semibold uppercase tracking-wider text-base-content/40">Stage</th>
                                <th className="bg-transparent text-center text-[11px] font-semibold uppercase tracking-wider text-base-content/40">Days</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app: PipelineApplication) => {
                                const days = getDaysInStage(app.updated_at);
                                const stageBadge = getApplicationStageBadge(app.stage);
                                const daysStyle = getDaysIndicator(days);
                                return (
                                    <tr
                                        key={app.id}
                                        className="hover:bg-base-300/30 transition-colors"
                                    >
                                        <td>
                                            <Link
                                                href={`/portal/applications/${app.id}`}
                                                className="font-semibold text-sm hover:text-primary transition-colors"
                                            >
                                                {app.candidate_name || 'Unknown'}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className="text-sm text-base-content/60 line-clamp-1">
                                                {app.job_title || '\u2014'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge badge-sm ${STAGE_COLORS[app.stage] || 'badge-ghost'}`}>
                                                {stageBadge.label}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`text-sm tabular-nums ${daysStyle.className}`}>
                                                {daysStyle.icon && (
                                                    <i className={`fa-duotone fa-regular ${daysStyle.icon} text-[10px] mr-1`}></i>
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
            )}
        </ContentCard>
    );
}
