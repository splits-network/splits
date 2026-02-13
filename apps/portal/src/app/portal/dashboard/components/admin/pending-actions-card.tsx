'use client';

import Link from 'next/link';
import { ContentCard } from '@/components/ui/cards';
import { PlatformStats } from '../../hooks/use-platform-stats';

interface PendingActionsCardProps {
    stats: PlatformStats;
    loading: boolean;
}

interface ActionItem {
    label: string;
    count: number;
    icon: string;
    color: string;
    href: string;
}

export default function PendingActionsCard({ stats, loading }: PendingActionsCardProps) {
    const actions: ActionItem[] = [
        {
            label: 'Recruiter approvals',
            count: stats.pending_recruiter_approvals,
            icon: 'fa-user-check',
            color: 'warning',
            href: '/portal/admin/recruiters?status=pending',
        },
        {
            label: 'Fraud reviews',
            count: stats.active_fraud_signals,
            icon: 'fa-shield-exclamation',
            color: 'error',
            href: '/portal/admin/fraud',
        },
        {
            label: 'Payout processing',
            count: stats.pending_payouts_count,
            icon: 'fa-money-bill-transfer',
            color: 'success',
            href: '/portal/admin/payouts?status=pending',
        },
        {
            label: 'Escrow releases',
            count: stats.active_escrow_holds,
            icon: 'fa-lock',
            color: 'info',
            href: '/portal/admin/payouts/escrow',
        },
    ];

    return (
        <ContentCard title="Pending actions" icon="fa-list-check" className="bg-base-200">
            <div className="space-y-0.5 -mx-2">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-300/50 transition-all group"
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-${action.color}/10`}>
                            <i className={`fa-duotone fa-regular ${action.icon} text-sm text-${action.color}`}></i>
                        </div>
                        <span className="flex-1 text-sm font-medium text-base-content/70 group-hover:text-base-content transition-colors">
                            {action.label}
                        </span>
                        {action.count > 0 ? (
                            <span className={`badge badge-sm badge-${action.color} tabular-nums`}>
                                {action.count}
                            </span>
                        ) : (
                            <span className="text-xs text-base-content/30">None</span>
                        )}
                    </Link>
                ))}
            </div>
        </ContentCard>
    );
}
