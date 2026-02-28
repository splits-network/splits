'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LABEL_MAP: Record<string, string> = {
    secure: 'Admin',
    dashboard: 'Dashboard',
    recruiters: 'Recruiters',
    assignments: 'Assignments',
    placements: 'Placements',
    applications: 'Applications',
    notifications: 'Notifications',
    users: 'Users',
    organizations: 'Organizations',
    companies: 'Companies',
    jobs: 'Jobs',
    candidates: 'Candidates',
    matches: 'Matches',
    'automation-rules': 'Automation Rules',
    'fraud-detection': 'Fraud Detection',
    'decision-log': 'Decision Log',
    'chat-moderation': 'Chat Moderation',
    'ownership-audit': 'Ownership Audit',
    reputation: 'Reputation',
    payouts: 'Payouts',
    escrow: 'Escrow Holds',
    billing: 'Billing Profiles',
    pages: 'Pages',
    navigation: 'Navigation',
    images: 'Images',
    metrics: 'Metrics',
    'activity-log': 'Activity Log',
    settings: 'Settings',
};

function toLabel(segment: string): string {
    return LABEL_MAP[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    const crumbs = segments.map((seg, i) => ({
        label: toLabel(seg),
        href: '/' + segments.slice(0, i + 1).join('/'),
        isLast: i === segments.length - 1,
    }));

    return (
        <div className="breadcrumbs text-sm py-0">
            <ul>
                {crumbs.map((crumb) =>
                    crumb.isLast ? (
                        <li key={crumb.href} className="text-base-content/60">
                            {crumb.label}
                        </li>
                    ) : (
                        <li key={crumb.href}>
                            <Link href={crumb.href} className="text-base-content/40 hover:text-base-content transition-colors">
                                {crumb.label}
                            </Link>
                        </li>
                    ),
                )}
            </ul>
        </div>
    );
}
