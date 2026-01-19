'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useUserProfile } from '@/contexts';
import { getActivityIcon, getAlertClass, getHealthScore } from '@/lib/utils';
import { StatCard, StatCardGrid, ContentCard, EmptyState } from '@/components/ui/cards';
import { TrendBadge } from '@/components/ui';

interface PlatformStats {
    total_active_roles: number;
    total_applications: number;
    total_active_recruiters: number;
    total_companies: number;
    placements_this_month: number;
    placements_this_year: number;
    total_platform_revenue_ytd: number;
    pending_payouts: number;
    pending_approvals: number;
    fraud_alerts: number;
    trends?: {
        roles?: number;
        recruiters?: number;
        placements?: number;
    };
}

interface MarketplaceHealth {
    recruiter_satisfaction: number;
    company_satisfaction: number;
    avg_time_to_first_candidate_days: number;
    avg_time_to_placement_days: number;
    fill_rate_percentage: number;
}

interface RecentActivity {
    id: string;
    type: 'placement_created' | 'company_joined' | 'recruiter_joined' | 'role_created' | 'payout_processed' | 'alert';
    message: string;
    timestamp: string;
    link?: string;
    severity?: 'info' | 'warning' | 'error';
}

interface Alert {
    id: string;
    type: 'payout_approval' | 'fraud_signal' | 'automation_review' | 'system';
    message: string;
    count?: number;
    link: string;
    severity: 'info' | 'warning' | 'error';
}

export default function AdminDashboard() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [health, setHealth] = useState<MarketplaceHealth | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);

            // Load platform stats from V2 analytics endpoint
            const statsResponse: any = await api.get('/stats', {
                params: {
                    scope: 'platform',
                }
            });
            // Extract metrics from the nested response structure
            const platformStats =
                statsResponse?.data?.metrics ||
                statsResponse?.data ||
                statsResponse ||
                null;
            setStats(platformStats);

            // Load marketplace health from V2 analytics endpoint
            const healthResponse: any = await api.get('/marketplace-metrics', {
                params: {
                    limit: 1,
                    sort_by: 'date',
                    sort_order: 'desc'
                }
            });
            // Extract latest health metrics
            const healthData = healthResponse?.data?.data?.[0] || healthResponse?.data?.[0] || null;
            if (healthData) {
                // Map analytics metrics to dashboard health format
                setHealth({
                    recruiter_satisfaction: 0, // TODO: Add to analytics
                    company_satisfaction: 0, // TODO: Add to analytics
                    avg_time_to_first_candidate_days: 0, // TODO: Add to analytics
                    avg_time_to_placement_days: healthData.avg_time_to_hire_days || 0,
                    fill_rate_percentage: healthData.hire_rate * 100 || 0,
                });
            }

            // Load recent activity
            const activityResponse = await api.get<{ data: RecentActivity[] }>('/admin/portal/dashboard/activity');
            setRecentActivity(activityResponse.data || []);

            // Load alerts
            const alertsResponse = await api.get<{ data: Alert[] }>('/admin/portal/dashboard/alerts');
            setAlerts(alertsResponse.data || []);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Welcome skeleton */}
                <div className="h-28 rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20 skeleton"></div>
                {/* Stats skeleton */}
                <StatCardGrid>
                    {[1, 2, 3, 4].map((i) => (
                        <StatCard key={i} title="" value={0} icon="fa-spinner" loading />
                    ))}
                </StatCardGrid>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section - Enhanced gradient card */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-secondary text-primary-content shadow-elevation-3">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4"></div>
                </div>

                <div className="relative p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">Platform Administration</h2>
                            <p className="text-lg opacity-90 mt-1">
                                Monitor marketplace health and manage platform operations.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/portal/admin/metrics" className="btn btn-sm bg-white/20 border-0 hover:bg-white/30 text-white">
                                <i className="fa-duotone fa-regular fa-chart-bar"></i>
                                View Metrics
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts Section - Enhanced styling */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div key={alert.id} className={`alert ${getAlertClass(alert.severity)} shadow-sm rounded-xl`}>
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                ${alert.severity === 'error' ? 'bg-error/20' :
                                    alert.severity === 'warning' ? 'bg-warning/20' : 'bg-info/20'}
                            `}>
                                <i className={`fa-duotone fa-regular fa-bell ${alert.severity === 'error' ? 'text-error' :
                                    alert.severity === 'warning' ? 'text-warning' : 'text-info'
                                    }`}></i>
                            </div>
                            <div className="flex-1">
                                <span className="font-semibold">{alert.message}</span>
                                {alert.count && <span className="ml-2 badge badge-sm badge-ghost">{alert.count}</span>}
                            </div>
                            <Link href={alert.link} className="btn btn-sm">
                                Review
                                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Key Platform Stats - Using new StatCard component */}
            <StatCardGrid>
                <StatCard
                    title="Active Roles"
                    value={stats?.total_active_roles || 0}
                    description="Platform-wide"
                    icon="fa-briefcase"
                    color="primary"
                    trend={stats?.trends?.roles}
                    href="/portal/admin/roles"
                />
                <StatCard
                    title="Active Recruiters"
                    value={stats?.total_active_recruiters || 0}
                    description={`${stats?.total_companies || 0} companies`}
                    icon="fa-network-wired"
                    color="secondary"
                    trend={stats?.trends?.recruiters}
                    href="/portal/admin/users?role=recruiter"
                />
                <StatCard
                    title="Applications"
                    value={stats?.total_applications || 0}
                    description="In pipeline"
                    icon="fa-users"
                    color="accent"
                    href="/portal/admin/applications"
                />
                <StatCard
                    title="Placements YTD"
                    value={stats?.placements_this_year || 0}
                    description="This year"
                    icon="fa-trophy"
                    color="success"
                    trend={stats?.trends?.placements}
                    href="/portal/admin/placements"
                />
            </StatCardGrid>

            {/* Revenue & Payouts - Enhanced cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ContentCard
                    title="Platform Revenue YTD"
                    icon="fa-chart-line"
                    headerActions={
                        <Link href="/portal/admin/revenue" className="btn btn-sm btn-ghost text-success">
                            View Report
                            <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                        </Link>
                    }
                >
                    <div className="flex items-baseline gap-3 mt-2">
                        <div className="text-4xl font-bold text-success">
                            ${((stats?.total_platform_revenue_ytd || 0) / 1000000).toFixed(2)}M
                        </div>
                        {stats?.trends?.placements && stats.trends.placements > 0 && (
                            <TrendBadge value={stats.trends.placements} />
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-200">
                        <div className="flex-1">
                            <div className="text-sm text-base-content/60">This Month</div>
                            <div className="text-xl font-semibold">{stats?.placements_this_month || 0} placements</div>
                        </div>
                    </div>
                </ContentCard>

                <ContentCard
                    title="Pending Payouts"
                    icon="fa-money-bill-transfer"
                    headerActions={
                        <Link href="/admin/payouts" className="btn btn-sm btn-ghost text-primary">
                            Review
                            <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                        </Link>
                    }
                >
                    <div className="flex items-baseline gap-3 mt-2">
                        <div className="text-4xl font-bold text-primary">
                            ${((stats?.pending_payouts || 0) / 1000).toFixed(1)}k
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-200">
                        <div className="flex items-center gap-2 text-sm">
                            {(stats?.pending_approvals || 0) > 0 && (
                                <span className="badge badge-warning badge-sm gap-1">
                                    <i className="fa-duotone fa-regular fa-clock text-xs"></i>
                                    {stats?.pending_approvals || 0} awaiting approval
                                </span>
                            )}
                            {(stats?.fraud_alerts || 0) > 0 && (
                                <span className="badge badge-error badge-sm gap-1">
                                    <i className="fa-duotone fa-regular fa-shield-halved text-xs"></i>
                                    {stats?.fraud_alerts || 0} alerts
                                </span>
                            )}
                        </div>
                    </div>
                </ContentCard>
            </div>

            {/* Marketplace Health - Enhanced card */}
            <ContentCard
                title="Marketplace Health"
                icon="fa-heart-pulse"
                headerActions={
                    <Link href="/admin/metrics" className="btn btn-sm btn-ghost">
                        View Detailed Metrics
                        <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                    </Link>
                }
            >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-4">
                    <div className="text-center">
                        <div className="radial-progress text-primary mx-auto" style={{ "--value": health?.recruiter_satisfaction || 0, "--size": "5rem" } as any}>
                            <span className="text-lg font-bold">{health?.recruiter_satisfaction || 0}%</span>
                        </div>
                        <p className="text-sm font-medium mt-3">Recruiter Satisfaction</p>
                    </div>
                    <div className="text-center">
                        <div className="radial-progress text-secondary mx-auto" style={{ "--value": health?.company_satisfaction || 0, "--size": "5rem" } as any}>
                            <span className="text-lg font-bold">{health?.company_satisfaction || 0}%</span>
                        </div>
                        <p className="text-sm font-medium mt-3">Company Satisfaction</p>
                    </div>
                    <div className="text-center">
                        <div className={`text-4xl font-bold ${getHealthScore({ response_time: health?.avg_time_to_first_candidate_days || 0 }).color}`}>
                            {health?.avg_time_to_first_candidate_days || 0}
                        </div>
                        <p className="text-sm font-medium mt-3">Days to First Candidate</p>
                    </div>
                    <div className="text-center">
                        <div className={`text-4xl font-bold ${getHealthScore({ response_time: health?.avg_time_to_placement_days || 0 }).color}`}>
                            {health?.avg_time_to_placement_days || 0}
                        </div>
                        <p className="text-sm font-medium mt-3">Avg Time to Placement</p>
                    </div>
                    <div className="text-center">
                        <div className="radial-progress text-success mx-auto" style={{ "--value": health?.fill_rate_percentage || 0, "--size": "5rem" } as any}>
                            <span className="text-lg font-bold">{health?.fill_rate_percentage || 0}%</span>
                        </div>
                        <p className="text-sm font-medium mt-3">Fill Rate</p>
                    </div>
                </div>
            </ContentCard>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Platform Activity */}
                <div className="lg:col-span-2">
                    <ContentCard
                        title="Recent Platform Activity"
                        icon="fa-clock-rotate-left"
                        headerActions={
                            recentActivity.length > 10 && (
                                <Link href="/admin/activity" className="btn btn-sm btn-ghost">
                                    View all
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                                </Link>
                            )
                        }
                    >
                        {recentActivity.length === 0 ? (
                            <EmptyState
                                icon="fa-inbox"
                                title="No recent activity"
                                description="Platform activity will appear here"
                            />
                        ) : (
                            <div className="space-y-1 -mx-2">
                                {recentActivity.slice(0, 10).map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-base-200/70 transition-all cursor-pointer"
                                    >
                                        <div className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                            ${activity.type === 'placement_created' ? 'bg-success/10 text-success' :
                                                activity.type === 'payout_processed' ? 'bg-primary/10 text-primary' :
                                                    activity.type === 'company_joined' ? 'bg-secondary/10 text-secondary' :
                                                        activity.type === 'alert' ? 'bg-error/10 text-error' :
                                                            'bg-info/10 text-info'}
                                        `}>
                                            <i className={`fa-duotone fa-regular ${getActivityIcon(activity.type)}`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium">{activity.message}</p>
                                            <p className="text-sm text-base-content/60 mt-0.5">{activity.timestamp}</p>
                                        </div>
                                        {activity.link && (
                                            <Link href={activity.link} className="btn btn-ghost btn-sm btn-square">
                                                <i className="fa-duotone fa-regular fa-chevron-right text-base-content/40"></i>
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ContentCard>
                </div>

                {/* Admin Tools Sidebar */}
                <div className="space-y-6">
                    {/* Phase 3 Tools - Enhanced styling */}
                    <ContentCard title="Phase 3 Tools" icon="fa-bolt">
                        <div className="flex flex-col gap-2">
                            <Link href="/admin/payouts" className="btn btn-primary w-full justify-start gap-3">
                                <i className="fa-duotone fa-regular fa-money-bill-transfer w-4"></i>
                                Payout Management
                            </Link>
                            <Link href="/admin/automation" className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200">
                                <i className="fa-duotone fa-regular fa-robot w-4"></i>
                                Automation Controls
                            </Link>
                            <Link href="/admin/fraud" className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200">
                                <i className="fa-duotone fa-regular fa-shield-halved w-4"></i>
                                Fraud Detection
                            </Link>
                            <Link href="/admin/decision-log" className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200">
                                <i className="fa-duotone fa-regular fa-clipboard-list w-4"></i>
                                Decision Log
                            </Link>
                        </div>
                    </ContentCard>

                    {/* Core Admin Tools - Enhanced styling */}
                    <ContentCard title="Platform Management" icon="fa-cog">
                        <div className="flex flex-col gap-2">
                            <Link href="/portal/admin/users" className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200">
                                <i className="fa-duotone fa-regular fa-users w-4"></i>
                                Users
                            </Link>
                            <Link href="/portal/admin/companies" className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200">
                                <i className="fa-duotone fa-regular fa-building w-4"></i>
                                Companies
                            </Link>
                            <Link href="/portal/admin/roles" className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200">
                                <i className="fa-duotone fa-regular fa-briefcase w-4"></i>
                                All Roles
                            </Link>
                            <Link href="/portal/admin/metrics" className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200">
                                <i className="fa-duotone fa-regular fa-chart-bar w-4"></i>
                                Metrics
                            </Link>
                        </div>
                    </ContentCard>
                </div>
            </div>
        </div>
    );
}
