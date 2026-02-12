'use client';

import Link from 'next/link';
import { RecruiterStats } from '../hooks/use-recruiter-stats';

interface UrgencyBarProps {
    stats: RecruiterStats;
}

export default function UrgencyBar({ stats }: UrgencyBarProps) {
    const stale = stats.stale_candidates || 0;
    const pending = stats.pending_reviews || 0;

    if (stale === 0 && pending === 0) return null;

    return (
        <div className="alert alert-warning shadow-md border border-warning/20">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning-content"></i>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {stale > 0 && (
                        <Link
                            href="/portal/applications?stale=true"
                            className="font-semibold hover:underline underline-offset-2"
                        >
                            <span className="tabular-nums">{stale}</span> candidate{stale !== 1 ? 's' : ''} need follow-up (14+ days idle)
                        </Link>
                    )}
                    {stale > 0 && pending > 0 && (
                        <span className="text-warning-content/30 select-none">|</span>
                    )}
                    {pending > 0 && (
                        <Link
                            href="/portal/applications?stage=company_review"
                            className="font-semibold hover:underline underline-offset-2"
                        >
                            <span className="tabular-nums">{pending}</span> application{pending !== 1 ? 's' : ''} awaiting company review
                        </Link>
                    )}
                </div>
            </div>
            <Link
                href="/portal/applications"
                className="btn btn-sm btn-outline border-warning-content/30 hover:bg-warning-content/10 hover:border-warning-content/50 text-warning-content shrink-0"
            >
                Review now
                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
            </Link>
        </div>
    );
}
