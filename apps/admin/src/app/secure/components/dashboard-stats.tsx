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
                    {sparkData && (
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

// Sample sparkline data for visual interest
const SAMPLE_UP = [12, 15, 11, 18, 14, 20, 22, 19, 25, 28];
const SAMPLE_DOWN = [30, 28, 25, 22, 20, 18, 15, 14, 12, 10];
const SAMPLE_FLAT = [10, 12, 11, 13, 12, 14, 13, 15, 14, 16];

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatTile
                icon="fa-users"
                label="Total Users"
                value={stats.totalUsers}
                trend={8}
                sparkData={SAMPLE_UP}
                colorClass="text-primary"
                loading={loading}
            />
            <StatTile
                icon="fa-briefcase"
                label="Total Jobs"
                value={stats.totalJobs}
                trend={12}
                sparkData={SAMPLE_UP}
                colorClass="text-secondary"
                loading={loading}
            />
            <StatTile
                icon="fa-file-user"
                label="Applications"
                value={stats.totalApplications}
                trend={5}
                sparkData={SAMPLE_FLAT}
                colorClass="text-accent"
                loading={loading}
            />
            <StatTile
                icon="fa-user-clock"
                label="Pending Recruiters"
                value={stats.pendingRecruiters}
                trend={-3}
                sparkData={SAMPLE_DOWN}
                colorClass="text-warning"
                loading={loading}
            />
            <StatTile
                icon="fa-shield-exclamation"
                label="Fraud Flags"
                value={stats.activeFraud}
                trend={-8}
                sparkData={SAMPLE_DOWN}
                colorClass="text-error"
                loading={loading}
            />
            <StatTile
                icon="fa-vault"
                label="Active Escrow"
                value={stats.activeEscrow}
                trend={15}
                sparkData={SAMPLE_UP}
                colorClass="text-info"
                loading={loading}
            />
            <StatTile
                icon="fa-money-bill-transfer"
                label="Pending Payouts"
                value={stats.pendingPayouts}
                trend={2}
                sparkData={SAMPLE_FLAT}
                colorClass="text-success"
                loading={loading}
            />
            <StatTile
                icon="fa-bell-ring"
                label="Active Notifications"
                value={stats.activeNotifications}
                trend={0}
                sparkData={SAMPLE_FLAT}
                colorClass="text-primary"
                loading={loading}
            />
        </div>
    );
}
