'use client';

import Link from 'next/link';
import { Badge, Button } from '@splits-network/memphis-ui';
import type { AccentColor } from '@splits-network/memphis-ui';
import { PlatformStats } from '../hooks/use-platform-stats';

interface PlatformAlertsBarProps {
    stats: PlatformStats;
}

interface AlertItem {
    label: string;
    count: number;
    icon: string;
    color: AccentColor;
    href: string;
}

export default function PlatformAlertsBar({ stats }: PlatformAlertsBarProps) {
    const allAlerts: AlertItem[] = [
        { label: 'Fraud signals', count: stats.active_fraud_signals, icon: 'fa-shield-exclamation', color: 'coral', href: '/portal/admin/fraud' },
        { label: 'Pending approvals', count: stats.pending_recruiter_approvals, icon: 'fa-user-check', color: 'teal', href: '/portal/admin/recruiters?status=pending' },
        { label: 'Pending payouts', count: stats.pending_payouts_count, icon: 'fa-money-bill-transfer', color: 'yellow', href: '/portal/admin/payouts?status=pending' },
        { label: 'Active escrow', count: stats.active_escrow_holds, icon: 'fa-lock', color: 'purple', href: '/portal/admin/payouts/escrow' },
    ];
    const alerts = allAlerts.filter(a => a.count > 0);

    if (alerts.length === 0) return null;

    return (
        <div className="border-4 border-dark bg-base-100 flex items-center gap-4 p-4">
            <div className="w-10 h-10 border-4 border-dark bg-yellow flex items-center justify-center shrink-0">
                <i className="fa-duotone fa-regular fa-bell text-dark" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 flex-1">
                {alerts.map((alert, i) => (
                    <Link
                        key={alert.label}
                        href={alert.href}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <i className={`fa-duotone fa-regular ${alert.icon} text-xs text-${alert.color}`} />
                        <Badge color={alert.color} size="xs">
                            {alert.count}
                        </Badge>
                        <span className="text-xs font-bold text-dark/60">{alert.label}</span>
                        {i < alerts.length - 1 && (
                            <span className="text-dark/20 ml-1 select-none">|</span>
                        )}
                    </Link>
                ))}
            </div>
            <Link href="/portal/admin" className="shrink-0">
                <Button color="dark" size="xs">
                    Review all <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                </Button>
            </Link>
        </div>
    );
}
