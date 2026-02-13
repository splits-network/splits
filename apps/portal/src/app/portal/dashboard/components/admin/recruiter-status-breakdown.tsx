'use client';

import { ContentCard } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';
import { PlatformStats } from '../../hooks/use-platform-stats';

interface RecruiterStatusBreakdownProps {
    stats: PlatformStats;
    loading: boolean;
}

export default function RecruiterStatusBreakdown({ stats, loading }: RecruiterStatusBreakdownProps) {
    if (loading) {
        return (
            <ContentCard title="User breakdown" icon="fa-users" className="bg-base-200">
                <SkeletonList count={6} variant="text-block" gap="gap-3" />
            </ContentCard>
        );
    }

    const { recruiter_statuses } = stats;
    const totalRecruiters = recruiter_statuses.active + recruiter_statuses.pending + recruiter_statuses.suspended;

    const recruiterSegments = [
        { label: 'Active', count: recruiter_statuses.active, color: 'bg-success' },
        { label: 'Pending', count: recruiter_statuses.pending, color: 'bg-warning' },
        { label: 'Suspended', count: recruiter_statuses.suspended, color: 'bg-error' },
    ];

    const userRoles = [
        { label: 'Total users', count: stats.total_users, icon: 'fa-users', color: 'text-primary' },
        { label: 'Recruiters', count: stats.total_recruiters, icon: 'fa-user-tie', color: 'text-secondary' },
        { label: 'Companies', count: stats.total_companies, icon: 'fa-building', color: 'text-accent' },
        { label: 'Candidates', count: stats.total_candidates, icon: 'fa-id-card', color: 'text-info' },
    ];

    return (
        <ContentCard title="User breakdown" icon="fa-users" className="bg-base-200 h-full">
            {/* Recruiter status stacked bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-base-content/70">Recruiter status</span>
                    <span className="text-xs text-base-content/50 tabular-nums">{totalRecruiters} total</span>
                </div>
                {totalRecruiters > 0 ? (
                    <div className="h-4 rounded-full overflow-hidden flex bg-base-300/50">
                        {recruiterSegments.map(seg => {
                            const pct = (seg.count / totalRecruiters) * 100;
                            if (pct === 0) return null;
                            return (
                                <div
                                    key={seg.label}
                                    className={`${seg.color} transition-all duration-500`}
                                    style={{ width: `${pct}%` }}
                                    title={`${seg.label}: ${seg.count} (${Math.round(pct)}%)`}
                                ></div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-4 rounded-full bg-base-300/50"></div>
                )}
                <div className="flex items-center gap-4 mt-2">
                    {recruiterSegments.map(seg => (
                        <div key={seg.label} className="flex items-center gap-1.5 text-xs">
                            <div className={`w-2 h-2 rounded-full ${seg.color}`}></div>
                            <span className="text-base-content/60">{seg.label}</span>
                            <span className="font-semibold tabular-nums">{seg.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Role counts */}
            <div className="border-t border-base-300/50 pt-4">
                <div className="space-y-2">
                    {userRoles.map(role => (
                        <div key={role.label} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-base-300/50 flex items-center justify-center shrink-0">
                                <i className={`fa-duotone fa-regular ${role.icon} text-xs ${role.color}`}></i>
                            </div>
                            <span className="flex-1 text-sm text-base-content/70">{role.label}</span>
                            <span className="text-sm font-bold tabular-nums">{role.count.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </ContentCard>
    );
}
