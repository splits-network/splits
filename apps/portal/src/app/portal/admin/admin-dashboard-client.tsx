'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnalyticsChart } from '@/components/charts/analytics-chart';
import { useAdminStats } from './hooks/use-admin-stats';

export default function AdminDashboardClient() {
    const { stats, loading, error, refresh } = useAdminStats();
    const [chartPeriod, setChartPeriod] = useState(6);

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>{error}</span>
                <button onClick={refresh} className="btn btn-sm btn-ghost">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-base-content/70 mt-1">
                    Platform administration and insights
                </p>
            </div>

            {/* Platform Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatTile
                    label="Users"
                    value={loading ? '...' : stats?.totals.users ?? 0}
                    icon="fa-users"
                    color="primary"
                    href="/portal/admin/users"
                />
                <StatTile
                    label="Recruiters"
                    value={loading ? '...' : stats?.totals.recruiters.total ?? 0}
                    subValue={`${stats?.totals.recruiters.active ?? 0} active`}
                    icon="fa-user-tie"
                    color="secondary"
                    href="/portal/admin/recruiters"
                />
                <StatTile
                    label="Companies"
                    value={loading ? '...' : stats?.totals.companies.total ?? 0}
                    subValue={`${stats?.totals.companies.active ?? 0} active`}
                    icon="fa-building"
                    color="accent"
                    href="/portal/admin/companies"
                />
                <StatTile
                    label="Jobs"
                    value={loading ? '...' : stats?.totals.jobs.total ?? 0}
                    subValue={`${stats?.totals.jobs.active ?? 0} active`}
                    icon="fa-briefcase"
                    color="info"
                    href="/portal/admin/jobs"
                />
                <StatTile
                    label="Candidates"
                    value={loading ? '...' : stats?.totals.candidates ?? 0}
                    icon="fa-id-card"
                    color="warning"
                    href="/portal/admin/candidates"
                />
                <StatTile
                    label="Applications"
                    value={loading ? '...' : stats?.totals.applications.total ?? 0}
                    icon="fa-file-lines"
                    color="neutral"
                    href="/portal/admin/applications"
                />
                <StatTile
                    label="Placements"
                    value={loading ? '...' : stats?.totals.placements.total ?? 0}
                    subValue={`${stats?.totals.placements.completed ?? 0} completed`}
                    icon="fa-handshake"
                    color="success"
                    href="/portal/admin/placements"
                />
            </div>

            {/* Actionable Items */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-bell text-warning"></i>
                        Action Required
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        <ActionableItem
                            label="Pending Approvals"
                            count={loading ? 0 : stats?.pendingActions.recruiterApprovals ?? 0}
                            icon="fa-user-check"
                            color="warning"
                            href="/portal/admin/recruiters?status=pending"
                        />
                        <ActionableItem
                            label="Fraud Signals"
                            count={loading ? 0 : stats?.pendingActions.fraudSignals ?? 0}
                            icon="fa-shield-exclamation"
                            color="error"
                            href="/portal/admin/fraud"
                        />
                        <ActionableItem
                            label="Pending Payouts"
                            count={loading ? 0 : stats?.pendingActions.pendingPayouts ?? 0}
                            icon="fa-money-bill-transfer"
                            color="success"
                            href="/portal/admin/payouts?status=pending"
                        />
                        <ActionableItem
                            label="Active Escrow"
                            count={loading ? 0 : stats?.pendingActions.activeEscrow ?? 0}
                            icon="fa-lock"
                            color="info"
                            href="/portal/admin/payouts/escrow"
                        />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <AnalyticsChart
                            type="application-trends"
                            title="Application Trends"
                            chartComponent="line"
                            height={250}
                            showPeriodSelector
                            trendPeriod={chartPeriod}
                            onTrendPeriodChange={setChartPeriod}
                        />
                    </div>
                </div>
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <AnalyticsChart
                            type="placement-trends"
                            title="Placement Trends"
                            chartComponent="line"
                            height={250}
                            showPeriodSelector
                            trendPeriod={chartPeriod}
                            onTrendPeriodChange={setChartPeriod}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <QuickAction
                        title="Manage Recruiters"
                        description="Approve and manage recruiter accounts"
                        icon="fa-user-check"
                        href="/portal/admin/recruiters"
                        color="primary"
                    />
                    <QuickAction
                        title="Role Assignments"
                        description="Assign recruiters to open roles"
                        icon="fa-link"
                        href="/portal/admin/assignments"
                        color="secondary"
                    />
                    <QuickAction
                        title="Placement Audit"
                        description="Review all placements"
                        icon="fa-clipboard-check"
                        href="/portal/admin/placements"
                        color="success"
                    />
                    <QuickAction
                        title="Process Payouts"
                        description="Manage recruiter compensation"
                        icon="fa-money-bill-transfer"
                        href="/portal/admin/payouts"
                        color="success"
                    />
                    <QuickAction
                        title="Ownership Audit"
                        description="Review candidate ownership"
                        icon="fa-shield-halved"
                        href="/portal/admin/ownership"
                        color="accent"
                    />
                    <QuickAction
                        title="Reputation"
                        description="Monitor recruiter scores"
                        icon="fa-star"
                        href="/portal/admin/reputation"
                        color="warning"
                    />
                    <QuickAction
                        title="Fraud Detection"
                        description="Review suspicious activity"
                        icon="fa-shield-exclamation"
                        href="/portal/admin/fraud"
                        color="error"
                    />
                    <QuickAction
                        title="Automation"
                        description="Manage automation rules"
                        icon="fa-robot"
                        href="/portal/admin/automation"
                        color="info"
                    />
                </div>
            </div>

            {/* Intelligence Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Intelligence & Analytics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickAction
                        title="AI Matches"
                        description="Review AI match suggestions"
                        icon="fa-wand-magic-sparkles"
                        href="/portal/admin/ai-matches"
                        color="secondary"
                    />
                    <QuickAction
                        title="Decision Log"
                        description="AI and human decisions"
                        icon="fa-clipboard-list"
                        href="/portal/admin/decision-log"
                        color="accent"
                    />
                    <QuickAction
                        title="Marketplace Health"
                        description="Platform metrics"
                        icon="fa-chart-line"
                        href="/portal/admin/metrics"
                        color="primary"
                    />
                    <QuickAction
                        title="Activity Log"
                        description="Admin action history"
                        icon="fa-clock-rotate-left"
                        href="/portal/admin/activity"
                        color="neutral"
                    />
                </div>
            </div>

            {/* Billing Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Billing & Finance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickAction
                        title="Billing Profiles"
                        description="Company billing terms"
                        icon="fa-file-invoice-dollar"
                        href="/portal/admin/billing-profiles"
                        color="primary"
                    />
                    <QuickAction
                        title="Escrow Holds"
                        description="Manage held funds"
                        icon="fa-lock"
                        href="/portal/admin/payouts/escrow"
                        color="warning"
                    />
                    <QuickAction
                        title="Payout Audit"
                        description="Review payout history"
                        icon="fa-receipt"
                        href="/portal/admin/payouts/audit"
                        color="info"
                    />
                    <QuickAction
                        title="Settings"
                        description="Platform configuration"
                        icon="fa-gear"
                        href="/portal/admin/settings"
                        color="neutral"
                    />
                </div>
            </div>
        </div>
    );
}

// Stat Tile Component
function StatTile({
    label,
    value,
    subValue,
    icon,
    color,
    href,
}: {
    label: string;
    value: string | number;
    subValue?: string;
    icon: string;
    color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
    href?: string;
}) {
    const content = (
        <div className={`stat bg-base-100 shadow rounded-lg p-4 ${href ? 'hover:bg-base-200 transition-colors cursor-pointer' : ''}`}>
            <div className="stat-figure text-base-content/30">
                <i className={`fa-duotone fa-regular ${icon} text-2xl`}></i>
            </div>
            <div className="stat-title text-xs">{label}</div>
            <div className={`stat-value text-xl text-${color}`}>{value}</div>
            {subValue && <div className="stat-desc text-xs">{subValue}</div>}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }
    return content;
}

// Actionable Item Component
function ActionableItem({
    label,
    count,
    icon,
    color,
    href,
}: {
    label: string;
    count: number;
    icon: string;
    color: 'warning' | 'error' | 'success' | 'info';
    href: string;
}) {
    const colorClasses = {
        warning: 'bg-warning/10 text-warning border-warning/20',
        error: 'bg-error/10 text-error border-error/20',
        success: 'bg-success/10 text-success border-success/20',
        info: 'bg-info/10 text-info border-info/20',
    };

    if (count === 0) {
        return (
            <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg border border-base-300">
                <i className={`fa-duotone fa-regular ${icon} text-lg text-base-content/30`}></i>
                <div>
                    <div className="text-sm font-medium text-base-content/50">{label}</div>
                    <div className="text-xs text-base-content/30">None pending</div>
                </div>
            </div>
        );
    }

    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses[color]} hover:opacity-80 transition-opacity cursor-pointer`}>
                <i className={`fa-duotone fa-regular ${icon} text-lg`}></i>
                <div>
                    <div className="text-sm font-bold">{count}</div>
                    <div className="text-xs opacity-80">{label}</div>
                </div>
            </div>
        </Link>
    );
}

// Quick Action Component
function QuickAction({
    title,
    description,
    icon,
    href,
    color,
}: {
    title: string;
    description: string;
    icon: string;
    href: string;
    color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
}) {
    return (
        <Link href={href}>
            <div className="card bg-base-100 shadow hover:shadow-md transition-shadow h-full">
                <div className="card-body p-4">
                    <div className={`text-${color} mb-2`}>
                        <i className={`fa-duotone fa-regular ${icon} text-2xl`}></i>
                    </div>
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <p className="text-xs text-base-content/60">{description}</p>
                </div>
            </div>
        </Link>
    );
}
