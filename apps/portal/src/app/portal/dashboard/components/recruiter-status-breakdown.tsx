'use client';

import { MemphisCard, MemphisSkeleton } from './primitives';
import { ACCENT, accentAt } from './accent';
import { PlatformStats } from '../hooks/use-platform-stats';

interface RecruiterStatusBreakdownProps {
    stats: PlatformStats;
    loading: boolean;
}

export default function RecruiterStatusBreakdown({ stats, loading }: RecruiterStatusBreakdownProps) {
    if (loading) {
        return (
            <MemphisCard title="User Breakdown" icon="fa-users" accent={ACCENT[1]} className="h-full">
                <MemphisSkeleton count={6} />
            </MemphisCard>
        );
    }

    const { recruiter_statuses } = stats;
    const totalRecruiters = recruiter_statuses.active + recruiter_statuses.pending + recruiter_statuses.suspended;

    const recruiterSegments = [
        { label: 'Active', count: recruiter_statuses.active, accentIdx: 1 },
        { label: 'Pending', count: recruiter_statuses.pending, accentIdx: 2 },
        { label: 'Suspended', count: recruiter_statuses.suspended, accentIdx: 0 },
    ];

    const userRoles = [
        { label: 'Total users', count: stats.total_users, icon: 'fa-users', accentIdx: 0 },
        { label: 'Recruiters', count: stats.total_recruiters, icon: 'fa-user-tie', accentIdx: 1 },
        { label: 'Companies', count: stats.total_companies, icon: 'fa-building', accentIdx: 3 },
        { label: 'Candidates', count: stats.total_candidates, icon: 'fa-id-card', accentIdx: 2 },
    ];

    return (
        <MemphisCard title="User Breakdown" icon="fa-users" accent={ACCENT[1]} className="h-full">
            {/* Recruiter status stacked bar */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                        Recruiter Status
                    </span>
                    <span className="text-[10px] font-bold tabular-nums text-dark/40">
                        {totalRecruiters} total
                    </span>
                </div>
                {totalRecruiters > 0 ? (
                    <div className="h-5 border-4 border-dark flex overflow-hidden">
                        {recruiterSegments.map((seg) => {
                            const pct = (seg.count / totalRecruiters) * 100;
                            if (pct === 0) return null;
                            const accent = accentAt(seg.accentIdx);
                            return (
                                <div
                                    key={seg.label}
                                    className={`${accent.bg} transition-all duration-500`}
                                    style={{ width: `${pct}%` }}
                                    title={`${seg.label}: ${seg.count} (${Math.round(pct)}%)`}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-5 border-4 border-dark bg-dark/5" />
                )}
                <div className="flex items-center gap-4 mt-2">
                    {recruiterSegments.map((seg) => {
                        const accent = accentAt(seg.accentIdx);
                        return (
                            <div key={seg.label} className="flex items-center gap-1.5 text-[10px]">
                                <div className={`w-3 h-3 border-4 border-dark ${accent.bg}`} />
                                <span className="font-bold text-dark/60">{seg.label}</span>
                                <span className="font-black tabular-nums text-dark">{seg.count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Role counts */}
            <div className="border-t-4 border-dark pt-4 space-y-2">
                {userRoles.map((role) => {
                    const accent = accentAt(role.accentIdx);
                    return (
                        <div key={role.label} className="flex items-center gap-3">
                            <div className={`w-7 h-7 border-4 border-dark ${accent.bg}/20 flex items-center justify-center shrink-0`}>
                                <i className={`fa-duotone fa-regular ${role.icon} text-[10px] ${accent.text}`} />
                            </div>
                            <span className="flex-1 text-xs font-bold text-dark/60">{role.label}</span>
                            <span className="text-sm font-black tabular-nums text-dark">{role.count.toLocaleString()}</span>
                        </div>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
