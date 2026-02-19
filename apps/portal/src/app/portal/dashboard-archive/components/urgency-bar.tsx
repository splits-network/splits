'use client';

import Link from 'next/link';
import { AlertBanner, Button } from '@splits-network/memphis-ui';
import { RecruiterStats } from '../hooks/use-recruiter-stats';

interface UrgencyBarProps {
    stats: RecruiterStats;
}

export default function UrgencyBar({ stats }: UrgencyBarProps) {
    const stale = stats.stale_candidates || 0;
    const pending = stats.pending_reviews || 0;

    if (stale === 0 && pending === 0) return null;

    return (
        <AlertBanner type="warning" color="yellow" soft>
            <div className="flex items-center justify-between gap-4 w-full">
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
                <Link href="/portal/applications" className="shrink-0">
                    <Button color="dark" size="xs">
                        Review now
                        <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                    </Button>
                </Link>
            </div>
        </AlertBanner>
    );
}
