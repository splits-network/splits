'use client';

import { useState } from 'react';
import { ACCENT, accentAt } from './accent';

type UserType = 'recruiter' | 'company_admin' | 'hiring_manager' | 'candidate' | 'anonymous';

export interface ActivitySnapshot {
    total_online: number;
    by_app: { portal: number; candidate: number; corporate: number };
    by_role?: Record<UserType, number>;
    authenticated: number;
    anonymous: number;
    timeline: { minute: string; count: number }[];
    timeline_by_app?: Record<string, { minute: string; count: number }[]>;
    timeline_by_role?: Record<string, { minute: string; count: number }[]>;
    timestamp: string;
}

interface OnlineActivityChartProps {
    snapshot: ActivitySnapshot | null;
    loading?: boolean;
}

const ROLE_LABELS: Record<UserType, string> = {
    recruiter: 'Recruiter',
    company_admin: 'Co. Admin',
    hiring_manager: 'Hiring Mgr',
    candidate: 'Candidate',
    anonymous: 'Anonymous',
};

const TIMELINE_ACCENTS = {
    portal: 0,
    candidate: 1,
    corporate: 2,
    recruiter: 0,
    company_admin: 2,
    hiring_manager: 3,
    candidate_role: 1,
    anonymous: 3,
} as const;

function TimelineBarChart({
    timeline,
    timelineByApp,
    timelineByRole,
    activeTab,
}: {
    timeline: { minute: string; count: number }[];
    timelineByApp?: Record<string, { minute: string; count: number }[]>;
    timelineByRole?: Record<string, { minute: string; count: number }[]>;
    activeTab: 'role' | 'app';
}) {
    const maxCount = Math.max(...timeline.map((d) => d.count), 1);

    return (
        <div className="h-48">
            <div className="flex items-end gap-px h-40 overflow-hidden">
                {timeline.map((point, i) => {
                    const heightPct = (point.count / maxCount) * 100;
                    const accent = accentAt(i % 4);
                    return (
                        <div
                            key={i}
                            className="flex-1 min-w-0 relative group"
                            title={`${point.minute}: ${point.count}`}
                        >
                            <div
                                className={`w-full ${accent.bg}/60 border-t-4 border-dark/10 transition-all duration-300`}
                                style={{ height: `${Math.max(heightPct, 2)}%` }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-[8px] font-bold text-dark/30">
                    {timeline[0]?.minute?.slice(11, 16) ?? ''}
                </span>
                <span className="text-[8px] font-bold text-dark/30">
                    {timeline[timeline.length - 1]?.minute?.slice(11, 16) ?? ''}
                </span>
            </div>
        </div>
    );
}

export default function OnlineActivityChart({ snapshot, loading }: OnlineActivityChartProps) {
    const [activeTab, setActiveTab] = useState<'role' | 'app'>('role');

    if (loading && !snapshot) {
        return (
            <div className="border-4 border-dark bg-base-100">
                <div className="border-b-4 border-dark p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-4 border-dark bg-dark/5 animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-dark/10 animate-pulse" />
                            <div className="h-3 w-32 bg-dark/5 animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="p-4 h-48 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-dark/20 border-t-coral animate-spin" />
                </div>
            </div>
        );
    }

    const total = snapshot?.total_online ?? 0;
    const byApp = snapshot?.by_app ?? { portal: 0, candidate: 0, corporate: 0 };
    const byRole = snapshot?.by_role ?? { recruiter: 0, company_admin: 0, hiring_manager: 0, candidate: 0, anonymous: 0 };
    const authenticated = snapshot?.authenticated ?? 0;
    const anon = snapshot?.anonymous ?? 0;

    const appBadges = [
        { label: 'Portal', value: byApp.portal, accentIdx: 0 },
        { label: 'Candidate', value: byApp.candidate, accentIdx: 1 },
        { label: 'Corporate', value: byApp.corporate, accentIdx: 2 },
    ];

    return (
        <div className="border-4 border-dark bg-base-100">
            {/* Header */}
            <div className="border-b-4 border-dark p-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border-4 border-dark bg-coral flex items-center justify-center shrink-0">
                        <i className="fa-duotone fa-regular fa-signal-stream text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black tabular-nums text-dark">{total}</span>
                            <span className="text-xs font-bold text-dark/40">online now</span>
                            <span className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-teal">
                                <span className="w-2 h-2 bg-teal animate-pulse" />
                                Live
                            </span>
                        </div>
                        {/* Per-app badges */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            {appBadges.map((badge) => {
                                const accent = accentAt(badge.accentIdx);
                                return (
                                    <span key={badge.label} className="flex items-center gap-1 text-[10px] font-bold text-dark/50">
                                        <span className={`w-2 h-2 ${accent.bg}`} />
                                        {badge.label} {badge.value}
                                    </span>
                                );
                            })}
                            <span className="text-dark/20">|</span>
                            <span className="text-[10px] font-bold text-dark/40">{authenticated} auth</span>
                            <span className="text-[10px] font-bold text-dark/40">{anon} anon</span>
                        </div>
                        {/* Per-role badges */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            {(Object.keys(ROLE_LABELS) as UserType[]).map((role) => (
                                <span key={role} className="text-[10px] font-bold text-dark/40">
                                    {ROLE_LABELS[role]} {byRole[role] ?? 0}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-4">
                {/* Tab switcher */}
                <div className="flex gap-1 border-4 border-dark inline-flex mb-3">
                    <button
                        onClick={() => setActiveTab('role')}
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                            activeTab === 'role' ? 'bg-dark text-white' : 'bg-transparent text-dark/60 hover:bg-dark/10'
                        }`}
                    >
                        By Role
                    </button>
                    <button
                        onClick={() => setActiveTab('app')}
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                            activeTab === 'app' ? 'bg-dark text-white' : 'bg-transparent text-dark/60 hover:bg-dark/10'
                        }`}
                    >
                        By App
                    </button>
                </div>

                {snapshot?.timeline?.length ? (
                    <TimelineBarChart
                        timeline={snapshot.timeline}
                        timelineByApp={activeTab === 'app' ? snapshot.timeline_by_app : undefined}
                        timelineByRole={activeTab === 'role' ? snapshot.timeline_by_role : undefined}
                        activeTab={activeTab}
                    />
                ) : (
                    <div className="h-48 flex items-center justify-center text-dark/30">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-signal-stream text-xl mb-1" />
                            <p className="text-[10px] font-black uppercase tracking-wider">Waiting for data...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
