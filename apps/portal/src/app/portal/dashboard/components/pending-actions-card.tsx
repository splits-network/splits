'use client';

import Link from 'next/link';
import { MemphisCard } from './primitives';
import { ACCENT } from './accent';
import { PlatformStats } from '../hooks/use-platform-stats';

interface PendingActionsCardProps {
    stats: PlatformStats;
    loading: boolean;
}

interface ActionItem {
    label: string;
    count: number;
    icon: string;
    accentIdx: number;
    href: string;
}

export default function PendingActionsCard({ stats, loading }: PendingActionsCardProps) {
    const actions: ActionItem[] = [
        { label: 'Recruiter approvals', count: stats.pending_recruiter_approvals, icon: 'fa-user-check', accentIdx: 2, href: '/portal/admin/recruiters?status=pending' },
        { label: 'Fraud reviews', count: stats.active_fraud_signals, icon: 'fa-shield-exclamation', accentIdx: 0, href: '/portal/admin/fraud' },
        { label: 'Payout processing', count: stats.pending_payouts_count, icon: 'fa-money-bill-transfer', accentIdx: 1, href: '/portal/admin/payouts?status=pending' },
        { label: 'Escrow releases', count: stats.active_escrow_holds, icon: 'fa-lock', accentIdx: 3, href: '/portal/admin/payouts/escrow' },
    ];

    return (
        <MemphisCard title="Pending Actions" icon="fa-list-check" accent={ACCENT[0]}>
            <div className="space-y-1">
                {actions.map((action) => {
                    const accent = ACCENT[action.accentIdx];
                    return (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="flex items-center gap-3 p-2 border-b border-dark/10 last:border-0 hover:bg-dark/5 transition-colors group"
                        >
                            <div className={`w-8 h-8 border-4 border-dark ${accent.bg}/20 flex items-center justify-center shrink-0`}>
                                <i className={`fa-duotone fa-regular ${action.icon} text-xs ${accent.text}`} />
                            </div>
                            <span className="flex-1 text-xs font-bold uppercase tracking-wider text-dark/60 group-hover:text-dark transition-colors">
                                {action.label}
                            </span>
                            {action.count > 0 ? (
                                <span className={`px-2 py-0.5 border-4 border-dark text-[10px] font-black tabular-nums ${accent.bg} ${accent.textOnBg}`}>
                                    {action.count}
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-dark/20 uppercase">None</span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
