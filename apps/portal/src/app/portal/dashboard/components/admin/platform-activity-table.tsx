'use client';

import Link from 'next/link';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';
import { PlatformActivityEvent } from '../../hooks/use-platform-activity';

interface PlatformActivityTableProps {
    events: PlatformActivityEvent[];
    loading: boolean;
}

const EVENT_CONFIG: Record<string, { icon: string; colorClasses: string }> = {
    placement: { icon: 'fa-trophy', colorClasses: 'bg-success/10 text-success' },
    recruiter_join: { icon: 'fa-user-plus', colorClasses: 'bg-secondary/10 text-secondary' },
    company_join: { icon: 'fa-building', colorClasses: 'bg-primary/10 text-primary' },
    fraud_alert: { icon: 'fa-shield-exclamation', colorClasses: 'bg-error/10 text-error' },
    application: { icon: 'fa-paper-plane', colorClasses: 'bg-info/10 text-info' },
    payout: { icon: 'fa-money-bill-transfer', colorClasses: 'bg-warning/10 text-warning' },
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

export default function PlatformActivityTable({ events, loading }: PlatformActivityTableProps) {
    if (loading) {
        return (
            <ContentCard title="Recent platform activity" icon="fa-clock-rotate-left" className="bg-base-200">
                <SkeletonList count={8} variant="text-block" gap="gap-3" />
            </ContentCard>
        );
    }

    if (events.length === 0) {
        return (
            <ContentCard title="Recent platform activity" icon="fa-clock-rotate-left" className="bg-base-200">
                <EmptyState
                    icon="fa-clock-rotate-left"
                    title="No recent activity"
                    description="Platform events will appear here as recruiters, companies, and candidates interact with the marketplace."
                    size="sm"
                />
            </ContentCard>
        );
    }

    return (
        <ContentCard
            title="Recent platform activity"
            icon="fa-clock-rotate-left"
            className="bg-base-200"
            headerActions={
                <Link href="/portal/admin/activity" className="btn btn-sm btn-ghost text-xs">
                    View all
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                </Link>
            }
        >
            <div className="space-y-1 -mx-2">
                {events.map((event, i) => {
                    const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.application;
                    return (
                        <Link
                            key={`${event.type}-${i}`}
                            href={event.href}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-300/50 transition-all group"
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm ${config.colorClasses}`}>
                                <i className={`fa-duotone fa-regular ${config.icon}`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                    {event.title}
                                </p>
                                <p className="text-xs text-base-content/60 line-clamp-1 mt-0.5">
                                    {event.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-base-content/40 tabular-nums">
                                    {timeAgo(event.created_at)}
                                </span>
                                <i className="fa-duotone fa-regular fa-chevron-right text-[10px] text-base-content/30 group-hover:text-primary transition-colors"></i>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </ContentCard>
    );
}
