'use client';

import Link from 'next/link';
import { MemphisCard, MemphisEmpty, MemphisSkeleton, MemphisBtn } from './primitives';
import { ACCENT } from './accent';
import { PlatformActivityEvent } from '../hooks/use-platform-activity';

interface PlatformActivityTableProps {
    events: PlatformActivityEvent[];
    loading: boolean;
}

const EVENT_CONFIG: Record<string, { icon: string; accentIdx: number }> = {
    placement: { icon: 'fa-trophy', accentIdx: 3 },
    recruiter_join: { icon: 'fa-user-plus', accentIdx: 1 },
    company_join: { icon: 'fa-building', accentIdx: 0 },
    fraud_alert: { icon: 'fa-shield-exclamation', accentIdx: 0 },
    application: { icon: 'fa-paper-plane', accentIdx: 1 },
    payout: { icon: 'fa-money-bill-transfer', accentIdx: 2 },
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
}

export default function PlatformActivityTable({ events, loading }: PlatformActivityTableProps) {
    const headerRight = (
        <MemphisBtn href="/portal/admin/activity" accent={ACCENT[3]} variant="ghost" size="sm">
            View All <i className="fa-duotone fa-regular fa-arrow-right" />
        </MemphisBtn>
    );

    if (loading) {
        return (
            <MemphisCard title="Platform Activity" icon="fa-clock-rotate-left" accent={ACCENT[3]} headerRight={headerRight}>
                <MemphisSkeleton count={8} />
            </MemphisCard>
        );
    }

    if (events.length === 0) {
        return (
            <MemphisCard title="Platform Activity" icon="fa-clock-rotate-left" accent={ACCENT[3]} headerRight={headerRight}>
                <MemphisEmpty
                    icon="fa-clock-rotate-left"
                    title="No recent activity"
                    description="Platform events will appear here as users interact with the marketplace."
                />
            </MemphisCard>
        );
    }

    return (
        <MemphisCard title="Platform Activity" icon="fa-clock-rotate-left" accent={ACCENT[3]} headerRight={headerRight}>
            <div className="space-y-1 max-h-[26rem] overflow-y-auto">
                {events.map((event, i) => {
                    const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.application;
                    const accent = ACCENT[config.accentIdx];

                    return (
                        <Link
                            key={`${event.type}-${i}`}
                            href={event.href}
                            className="flex items-center gap-3 p-2 border-b border-dark/10 last:border-0 hover:bg-dark/5 transition-colors group"
                        >
                            <div className={`w-8 h-8 border-4 border-dark ${accent.bg} flex items-center justify-center shrink-0`}>
                                <i className={`fa-duotone fa-regular ${config.icon} text-[10px] ${accent.textOnBg}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-dark line-clamp-1 group-hover:text-coral transition-colors">
                                    {event.title}
                                </p>
                                <p className="text-[10px] text-dark/40 line-clamp-1 mt-0.5">
                                    {event.description}
                                </p>
                            </div>
                            <span className="text-[10px] font-bold tabular-nums text-dark/30 shrink-0">
                                {timeAgo(event.created_at)}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
