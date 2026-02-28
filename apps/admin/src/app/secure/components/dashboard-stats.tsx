'use client';

import React from 'react';
import { Sparkline } from '@splits-network/shared-charts';
import type { AdminStats } from '@/hooks/use-admin-stats';

interface StatTileProps {
    icon: string;
    label: string;
    value: string | number;
    trend?: number; // percentage change, positive = up
    sparkData?: number[];
    colorClass?: string;
    loading?: boolean;
}

function StatTile({ icon, label, value, trend, sparkData, colorClass = 'text-primary', loading }: StatTileProps) {
    const trendPositive = trend !== undefined && trend >= 0;
    const trendColor = trendPositive ? 'text-success' : 'text-error';
    const trendIcon = trendPositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <i className={`fa-duotone fa-regular ${icon} ${colorClass} text-lg`} />
                        <span className="text-sm text-base-content/60 font-medium">{label}</span>
                    </div>
                    {sparkData && sparkData.length > 0 && (
                        <Sparkline data={sparkData} width={64} height={20} type="line" />
                    )}
                </div>
                <div className="flex items-end justify-between gap-2">
                    {loading ? (
                        <div className="skeleton h-7 w-20" />
                    ) : (
                        <span className="text-2xl font-black tracking-tight">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </span>
                    )}
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                            <i className={`fa-duotone fa-regular ${trendIcon}`} />
                            <span>{Math.abs(trend)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface DashboardStatsProps {
    stats: AdminStats;
    loading: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatTile
                icon="fa-users"
                label="Total Users"
                value={stats.users.total}
                trend={stats.users.trend}
                sparkData={stats.users.sparkline}
                colorClass="text-primary"
                loading={loading}
            />
            <StatTile
                icon="fa-briefcase"
                label="Total Jobs"
                value={stats.jobs.total}
                trend={stats.jobs.trend}
                sparkData={stats.jobs.sparkline}
                colorClass="text-secondary"
                loading={loading}
            />
            <StatTile
                icon="fa-file-user"
                label="Applications"
                value={stats.applications.total}
                trend={stats.applications.trend}
                sparkData={stats.applications.sparkline}
                colorClass="text-accent"
                loading={loading}
            />
            <StatTile
                icon="fa-user-tie"
                label="Recruiters"
                value={stats.recruiters.total}
                trend={stats.recruiters.trend}
                sparkData={stats.recruiters.sparkline}
                colorClass="text-secondary"
                loading={loading}
            />
            <StatTile
                icon="fa-user-clock"
                label="Pending Recruiters"
                value={stats.pendingRecruiters}
                colorClass="text-warning"
                loading={loading}
            />
            <StatTile
                icon="fa-shield-exclamation"
                label="Fraud Flags"
                value={stats.activeFraud}
                colorClass="text-error"
                loading={loading}
            />
            <StatTile
                icon="fa-vault"
                label="Active Escrow"
                value={stats.activeEscrow}
                colorClass="text-info"
                loading={loading}
            />
            <StatTile
                icon="fa-money-bill-transfer"
                label="Pending Payouts"
                value={stats.pendingPayouts}
                colorClass="text-success"
                loading={loading}
            />
        </div>
    );
}
