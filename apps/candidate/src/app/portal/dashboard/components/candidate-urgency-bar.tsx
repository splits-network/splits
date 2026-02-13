'use client';

import Link from 'next/link';
import { useUrgencyItems, type UrgencyItem } from '../hooks/use-urgency-items';
import type { Application, ActiveRecruiter } from '../hooks/use-candidate-dashboard-data';

interface CandidateUrgencyBarProps {
    applications: Application[];
    activeRecruiters: ActiveRecruiter[];
    unreadMessages: number;
    unreadNotifications: number;
    profileCompletion: number;
    hasResume: boolean;
}

const LEVEL_CLASSES: Record<UrgencyItem['level'], { alert: string; icon: string; btn: string }> = {
    error: {
        alert: 'alert-error shadow-md border border-error/20',
        icon: 'bg-error/20 text-error-content',
        btn: 'btn-outline border-error-content/30 hover:bg-error-content/10 hover:border-error-content/50 text-error-content',
    },
    warning: {
        alert: 'alert-warning shadow-md border border-warning/20',
        icon: 'bg-warning/20 text-warning-content',
        btn: 'btn-outline border-warning-content/30 hover:bg-warning-content/10 hover:border-warning-content/50 text-warning-content',
    },
    info: {
        alert: 'alert-info shadow-md border border-info/20',
        icon: 'bg-info/20 text-info-content',
        btn: 'btn-outline border-info-content/30 hover:bg-info-content/10 hover:border-info-content/50 text-info-content',
    },
};

export default function CandidateUrgencyBar({
    applications,
    activeRecruiters,
    unreadMessages,
    unreadNotifications,
    profileCompletion,
    hasResume,
}: CandidateUrgencyBarProps) {
    const items = useUrgencyItems({
        applications,
        activeRecruiters,
        unreadMessages,
        unreadNotifications,
        profileCompletion,
        hasResume,
    });

    if (items.length === 0) return null;

    // Use the highest priority item's level for the alert style
    const topLevel = items[0].level;
    const classes = LEVEL_CLASSES[topLevel];

    return (
        <div className={`alert ${classes.alert}`}>
            <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${classes.icon} flex items-center justify-center shrink-0`}>
                    <i className={`fa-duotone fa-regular fa-triangle-exclamation`}></i>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {items.map((item, idx) => (
                        <span key={item.id}>
                            {idx > 0 && (
                                <span className="text-current/30 select-none mr-4">|</span>
                            )}
                            <Link
                                href={item.href}
                                className="font-semibold hover:underline underline-offset-2"
                            >
                                {item.message}
                            </Link>
                        </span>
                    ))}
                </div>
            </div>
            <Link
                href={items[0].href}
                className={`btn btn-sm ${classes.btn} shrink-0`}
            >
                Review now
                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
            </Link>
        </div>
    );
}
