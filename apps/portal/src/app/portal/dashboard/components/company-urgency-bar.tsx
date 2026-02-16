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
        <div className="border-4 border-yellow bg-yellow/10 flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 border-4 border-dark bg-yellow flex items-center justify-center shrink-0">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-dark" />
                </div>
                <Link
                    href="/portal/roles?status=active&sort_by=created_at&sort_order=asc"
                    className="text-sm font-black uppercase tracking-wider text-dark hover:underline underline-offset-2"
                >
                    <span className="tabular-nums">{staleRoles}</span> role{staleRoles !== 1 ? 's' : ''} open 60+ days with low candidate flow
                </Link>
            </div>
            <Link
                href="/portal/roles"
                className="border-4 border-dark bg-dark text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shrink-0 hover:-translate-y-0.5 transition-transform"
            >
                Review roles
                <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
            </Link>
        </div>
    );
}
