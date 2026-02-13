'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartLoadingState } from '@splits-network/shared-ui';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

type UserType = 'recruiter' | 'company_admin' | 'hiring_manager' | 'candidate' | 'anonymous';
type TimelinePoint = { minute: string; count: number };

export interface ActivitySnapshot {
    total_online: number;
    by_app: { portal: number; candidate: number; corporate: number };
    by_role?: Record<UserType, number>;
    authenticated: number;
    anonymous: number;
    timeline: TimelinePoint[];
    timeline_by_app?: Record<string, TimelinePoint[]>;
    timeline_by_role?: Record<string, TimelinePoint[]>;
    timestamp: string;
}

interface OnlineActivityChartProps {
    snapshot: ActivitySnapshot | null;
    loading?: boolean;
}

type TabKey = 'app' | 'role';

const ROLE_LABELS: Record<UserType, string> = {
    recruiter: 'Recruiter',
    company_admin: 'Company Admin',
    hiring_manager: 'Hiring Mgr',
    candidate: 'Candidate',
    anonymous: 'Anonymous',
};

function useThemeColors() {
    const colorsRef = useRef({
        primary: 'oklch(0.65 0.24 260)',
        secondary: 'oklch(0.65 0.19 155)',
        accent: 'oklch(0.65 0.19 35)',
        info: 'oklch(0.70 0.14 225)',
        warning: 'oklch(0.75 0.18 85)',
        baseContent: 'oklch(0.40 0.01 260)',
    });

    useEffect(() => {
        const update = () => {
            const style = getComputedStyle(document.documentElement);
            colorsRef.current = {
                primary: style.getPropertyValue('--color-primary').trim() || colorsRef.current.primary,
                secondary: style.getPropertyValue('--color-secondary').trim() || colorsRef.current.secondary,
                accent: style.getPropertyValue('--color-accent').trim() || colorsRef.current.accent,
                info: style.getPropertyValue('--color-info').trim() || colorsRef.current.info,
                warning: style.getPropertyValue('--color-warning').trim() || colorsRef.current.warning,
                baseContent: style.getPropertyValue('--color-base-content').trim() || colorsRef.current.baseContent,
            };
        };
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    return colorsRef;
}

function makeDataset(label: string, data: number[], color: string, dashed = false) {
    return {
        label,
        data,
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: dashed ? [4, 3] : [],
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
    };
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 } as const,
    plugins: {
        legend: {
            display: true,
            position: 'top' as const,
            labels: { boxWidth: 12, padding: 10, font: { size: 11 } },
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
            callbacks: {
                title: (items: any[]) => items[0]?.label ? `${items[0].label} UTC` : '',
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 10, font: { size: 10 } },
        },
        y: {
            beginAtZero: true,
            ticks: { precision: 0, font: { size: 10 } },
            grid: { color: 'oklch(0.5 0 0 / 0.08)' },
        },
    },
};

export default function OnlineActivityChart({ snapshot, loading }: OnlineActivityChartProps) {
    const colors = useThemeColors();
    const [activeTab, setActiveTab] = useState<TabKey>('role');

    const labels = useMemo(
        () => snapshot?.timeline?.map((t) => t.minute) ?? [],
        [snapshot],
    );

    const appChartData = useMemo(() => {
        if (!labels.length) return { labels: [], datasets: [] };
        const byApp = snapshot?.timeline_by_app;
        const c = colors.current;
        return {
            labels,
            datasets: [
                makeDataset('Portal', byApp?.portal?.map((t) => t.count) ?? [], c.primary),
                makeDataset('Candidate', byApp?.candidate?.map((t) => t.count) ?? [], c.secondary),
                makeDataset('Corporate', byApp?.corporate?.map((t) => t.count) ?? [], c.accent),
            ],
        };
    }, [snapshot, labels, colors]);

    const roleChartData = useMemo(() => {
        if (!labels.length) return { labels: [], datasets: [] };
        const byRole = snapshot?.timeline_by_role;
        const c = colors.current;
        return {
            labels,
            datasets: [
                makeDataset('Recruiter', byRole?.recruiter?.map((t) => t.count) ?? [], c.primary),
                makeDataset('Company Admin', byRole?.company_admin?.map((t) => t.count) ?? [], c.secondary),
                makeDataset('Hiring Mgr', byRole?.hiring_manager?.map((t) => t.count) ?? [], c.accent),
                makeDataset('Candidate', byRole?.candidate?.map((t) => t.count) ?? [], c.info),
                makeDataset('Anonymous', byRole?.anonymous?.map((t) => t.count) ?? [], c.baseContent, true),
            ],
        };
    }, [snapshot, labels, colors]);

    if (loading && !snapshot) {
        return (
            <div className="card bg-base-200 overflow-hidden">
                <div className="m-1.5 shadow-lg rounded-xl bg-base-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="skeleton h-10 w-10 rounded-lg"></div>
                        <div>
                            <div className="skeleton h-4 w-24 mb-1"></div>
                            <div className="skeleton h-3 w-32"></div>
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-4 pt-2">
                    <ChartLoadingState height={200} />
                </div>
            </div>
        );
    }

    const total = snapshot?.total_online ?? 0;
    const byApp = snapshot?.by_app ?? { portal: 0, candidate: 0, corporate: 0 };
    const byRole = snapshot?.by_role ?? { recruiter: 0, company_admin: 0, hiring_manager: 0, candidate: 0, anonymous: 0 };
    const authenticated = snapshot?.authenticated ?? 0;
    const anon = snapshot?.anonymous ?? 0;

    return (
        <div className="card bg-base-200 overflow-hidden">
            {/* Header stat card */}
            <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                <div className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <i className="fa-duotone fa-regular fa-signal-stream text-primary"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold tabular-nums">{total}</span>
                            <span className="text-sm text-base-content/60">online now</span>
                            <span className="ml-auto inline-flex items-center gap-1 text-xs text-success">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                                Live
                            </span>
                        </div>
                        {/* Per-app badges */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-base-content/50">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                Portal {byApp.portal}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                                Candidate {byApp.candidate}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-accent"></span>
                                Corporate {byApp.corporate}
                            </span>
                            <span className="text-base-content/30">|</span>
                            <span>{authenticated} auth</span>
                            <span>{anon} anon</span>
                        </div>
                        {/* Per-role badges */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-base-content/50">
                            {(Object.keys(ROLE_LABELS) as UserType[]).map((role) => (
                                <span key={role}>
                                    {ROLE_LABELS[role]} {byRole[role] ?? 0}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs + Chart area */}
            <div className="px-4 pb-4 pt-2">
                {/* Tab switcher */}
                <div className="flex gap-1 mb-3" role="tablist">
                    <button
                        role="tab"
                        className={`btn btn-xs ${activeTab === 'role' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('role')}
                    >
                        By Role
                    </button>
                    <button
                        role="tab"
                        className={`btn btn-xs ${activeTab === 'app' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('app')}
                    >
                        By App
                    </button>
                </div>

                {labels.length ? (
                    <div style={{ height: 200 }}>
                        <Line
                            data={activeTab === 'role' ? roleChartData : appChartData}
                            options={chartOptions}
                        />
                    </div>
                ) : (
                    <div style={{ height: 200 }} className="flex items-center justify-center text-base-content/40">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-signal-stream fa-2x mb-1 opacity-20"></i>
                            <p className="text-xs">Waiting for activity data...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
