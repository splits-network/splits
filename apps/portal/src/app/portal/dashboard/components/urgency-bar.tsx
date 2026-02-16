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
        <div className="border-4 border-yellow bg-yellow/10 flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 border-4 border-dark bg-yellow flex items-center justify-center shrink-0">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-dark" />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {stale > 0 && (
                        <Link
                            href="/portal/applications?stale=true"
                            className="text-sm font-black uppercase tracking-wider text-dark hover:underline underline-offset-2"
                        >
                            <span className="tabular-nums">{stale}</span> candidate{stale !== 1 ? 's' : ''} need follow-up
                        </Link>
                    )}
                    {stale > 0 && pending > 0 && (
                        <span className="text-dark/30 select-none">|</span>
                    )}
                    {pending > 0 && (
                        <Link
                            href="/portal/applications?stage=company_review"
                            className="text-sm font-black uppercase tracking-wider text-dark hover:underline underline-offset-2"
                        >
                            <span className="tabular-nums">{pending}</span> awaiting review
                        </Link>
                    )}
                </div>
            </div>
            <Link
                href="/portal/applications"
                className="border-4 border-dark bg-dark text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shrink-0 hover:-translate-y-0.5 transition-transform"
            >
                Review now
                <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
            </Link>
        </div>
    );
}
