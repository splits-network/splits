'use client';

import Link from 'next/link';
import { CompanyStats } from '../hooks/use-company-stats';

interface CompanyUrgencyBarProps {
    stats: CompanyStats;
}

export default function CompanyUrgencyBar({ stats }: CompanyUrgencyBarProps) {
    const staleRoles = stats.stale_roles || 0;

    if (staleRoles === 0) return null;

    return (
        <div className="alert alert-warning shadow-md border border-warning/20">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning-content"></i>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <Link
                        href="/portal/roles?status=active&sort_by=created_at&sort_order=asc"
                        className="font-semibold hover:underline underline-offset-2"
                    >
                        <span className="tabular-nums">{staleRoles}</span> role{staleRoles !== 1 ? 's' : ''} open 60+ days with low candidate flow
                    </Link>
                </div>
            </div>
            <Link
                href="/portal/roles"
                className="btn btn-sm btn-outline border-warning-content/30 hover:bg-warning-content/10 hover:border-warning-content/50 text-warning-content shrink-0"
            >
                Review roles
                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
            </Link>
        </div>
    );
}
