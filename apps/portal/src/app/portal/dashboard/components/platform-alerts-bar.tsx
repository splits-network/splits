'use client';

import Link from 'next/link';
import { PlatformStats } from '../hooks/use-platform-stats';
import { ACCENT } from './accent';

interface PlatformAlertsBarProps {
    stats: PlatformStats;
}

interface AlertItem {
    label: string;
    count: number;
    icon: string;
    accentIdx: number;
    href: string;
}

export default function PlatformAlertsBar({ stats }: PlatformAlertsBarProps) {
    const allAlerts: AlertItem[] = [
        { label: 'Fraud signals', count: stats.active_fraud_signals, icon: 'fa-shield-exclamation', accentIdx: 0, href: '/portal/admin/fraud' },
        { label: 'Pending approvals', count: stats.pending_recruiter_approvals, icon: 'fa-user-check', accentIdx: 1, href: '/portal/admin/recruiters?status=pending' },
        { label: 'Pending payouts', count: stats.pending_payouts_count, icon: 'fa-money-bill-transfer', accentIdx: 2, href: '/portal/admin/payouts?status=pending' },
        { label: 'Active escrow', count: stats.active_escrow_holds, icon: 'fa-lock', accentIdx: 3, href: '/portal/admin/payouts/escrow' },
    ];
    const alerts = allAlerts.filter(a => a.count > 0);

    if (alerts.length === 0) return null;

    return (
        <div className="border-4 border-dark bg-base-100 flex items-center gap-4 p-4">
            <div className="w-10 h-10 border-4 border-dark bg-yellow flex items-center justify-center shrink-0">
                <i className="fa-duotone fa-regular fa-bell text-dark" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 flex-1">
                {alerts.map((alert, i) => {
                    const accent = ACCENT[alert.accentIdx];
                    return (
                        <Link
                            key={alert.label}
                            href={alert.href}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <i className={`fa-duotone fa-regular ${alert.icon} text-xs ${accent.text}`} />
                            <span className={`px-2 py-0.5 border-4 border-dark text-[10px] font-black tabular-nums ${accent.bg} ${accent.textOnBg}`}>
                                {alert.count}
                            </span>
                            <span className="text-xs font-bold text-dark/60">{alert.label}</span>
                            {i < alerts.length - 1 && (
                                <span className="text-dark/20 ml-1 select-none">|</span>
                            )}
                        </Link>
                    );
                })}
            </div>
            <Link
                href="/portal/admin"
                className="border-4 border-dark bg-dark text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shrink-0 hover:-translate-y-0.5 transition-transform"
            >
                Review all <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
            </Link>
        </div>
    );
}
