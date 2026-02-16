'use client';

import Link from 'next/link';
import { PlatformStats } from '../../hooks/use-platform-stats';

interface PlatformAlertsBarProps {
    stats: PlatformStats;
}

interface AlertItem {
    label: string;
    count: number;
    icon: string;
    color: 'error' | 'info' | 'warning';
    href: string;
}

export default function PlatformAlertsBar({ stats }: PlatformAlertsBarProps) {
    const allAlerts: AlertItem[] = [
        {
            label: 'Fraud signals',
            count: stats.active_fraud_signals,
            icon: 'fa-shield-exclamation',
            color: 'error' as const,
            href: '/portal/admin/fraud',
        },
        {
            label: 'Pending approvals',
            count: stats.pending_recruiter_approvals,
            icon: 'fa-user-check',
            color: 'info' as const,
            href: '/portal/admin/recruiters?status=pending',
        },
        {
            label: 'Pending payouts',
            count: stats.pending_payouts_count,
            icon: 'fa-money-bill-transfer',
            color: 'warning' as const,
            href: '/portal/admin/payouts?status=pending',
        },
        {
            label: 'Active escrow',
            count: stats.active_escrow_holds,
            icon: 'fa-lock',
            color: 'warning' as const,
            href: '/portal/admin/payouts/escrow',
        },
    ];
    const alerts = allAlerts.filter(a => a.count > 0);

    if (alerts.length === 0) return null;

    return (
        <div className="alert shadow-md border border-base-300/50 bg-base-200">
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                <i className="fa-duotone fa-regular fa-bell text-warning text-sm"></i>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm flex-1">
                {alerts.map((alert, i) => (
                    <Link
                        key={alert.label}
                        href={alert.href}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                    >
                        <i className={`fa-duotone fa-regular ${alert.icon} text-${alert.color} text-xs`}></i>
                        <span className={`badge badge-${alert.color} badge-sm tabular-nums`}>
                            {alert.count}
                        </span>
                        <span className="text-base-content/70">{alert.label}</span>
                        {i < alerts.length - 1 && (
                            <span className="text-base-content/20 ml-2 select-none">|</span>
                        )}
                    </Link>
                ))}
            </div>
            <Link href="/portal/admin" className="btn btn-sm btn-outline shrink-0">
                Review all
                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
            </Link>
        </div>
    );
}
