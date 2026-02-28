'use client';

import React from 'react';
import Link from 'next/link';
import type { AdminStats } from '@/hooks/use-admin-stats';

interface ActionItem {
    icon: string;
    label: string;
    count: number;
    href: string;
    urgency: 'error' | 'warning' | 'info';
}

interface DashboardActionsProps {
    stats: AdminStats;
    loading: boolean;
}

export function DashboardActions({ stats, loading }: DashboardActionsProps) {
    const actions: ActionItem[] = [
        {
            icon: 'fa-user-clock',
            label: 'Recruiter Approvals',
            count: stats.pendingRecruiters,
            href: '/secure/recruiters?status=pending',
            urgency: 'warning',
        },
        {
            icon: 'fa-shield-exclamation',
            label: 'Fraud Reports',
            count: stats.activeFraud,
            href: '/secure/fraud',
            urgency: 'error',
        },
        {
            icon: 'fa-money-bill-transfer',
            label: 'Pending Payouts',
            count: stats.pendingPayouts,
            href: '/secure/billing?tab=payouts',
            urgency: 'warning',
        },
        {
            icon: 'fa-file-slash',
            label: 'Applications',
            count: stats.applications.total,
            href: '/secure/applications',
            urgency: 'info',
        },
    ];

    const urgencyColors = {
        error: 'text-error bg-error/10',
        warning: 'text-warning bg-warning/10',
        info: 'text-info bg-info/10',
    };

    const hasActions = actions.some((a) => a.count > 0);

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
            <div className="card-body p-4 gap-3">
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning" />
                    <h3 className="font-semibold text-sm">Action Items</h3>
                </div>

                {loading ? (
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-10 w-full" />
                        ))}
                    </div>
                ) : !hasActions ? (
                    <div className="flex items-center gap-2 text-sm text-base-content/50 py-4">
                        <i className="fa-duotone fa-regular fa-circle-check text-success" />
                        <span>No pending actions</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {actions
                            .filter((a) => a.count > 0)
                            .map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-md ${urgencyColors[action.urgency]}`}>
                                            <i className={`fa-duotone fa-regular ${action.icon} text-sm`} />
                                        </div>
                                        <span className="text-sm font-medium">{action.label}</span>
                                    </div>
                                    <div className={`badge badge-sm font-bold ${
                                        action.urgency === 'error' ? 'badge-error' :
                                        action.urgency === 'warning' ? 'badge-warning' : 'badge-info'
                                    }`}>
                                        {action.count}
                                    </div>
                                </Link>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
