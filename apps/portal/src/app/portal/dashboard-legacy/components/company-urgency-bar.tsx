'use client';

import Link from 'next/link';
import { AlertBanner, Button } from '@splits-network/memphis-ui';
import { CompanyStats } from '../hooks/use-company-stats';

interface CompanyUrgencyBarProps {
    stats: CompanyStats;
}

export default function CompanyUrgencyBar({ stats }: CompanyUrgencyBarProps) {
    const staleRoles = stats.stale_roles || 0;

    if (staleRoles === 0) return null;

    return (
        <AlertBanner type="warning" color="yellow" soft>
            <div className="flex items-center justify-between gap-4 w-full">
                <Link
                    href="/portal/roles?status=active&sort_by=created_at&sort_order=asc"
                    className="text-sm font-black uppercase tracking-wider text-dark hover:underline underline-offset-2"
                >
                    <span className="tabular-nums">{staleRoles}</span> role{staleRoles !== 1 ? 's' : ''} open 60+ days with low candidate flow
                </Link>
                <Link href="/portal/roles" className="shrink-0">
                    <Button color="dark" size="xs">
                        Review roles
                        <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                    </Button>
                </Link>
            </div>
        </AlertBanner>
    );
}
