import { Suspense } from 'react';
import Link from 'next/link';
import { AdminLoadingState } from '@/components/shared';
import { EscrowTable } from './components/escrow-table';

export const metadata = { title: 'Escrow | Admin' };

const TABS = [
    { label: 'Transactions', href: '/secure/payouts' },
    { label: 'Audit', href: '/secure/payouts/audit' },
    { label: 'Escrow', href: '/secure/payouts/escrow' },
    { label: 'Schedules', href: '/secure/payouts/schedules' },
];

export default function EscrowPage() {
    return (
        <div>
            <div className="tabs tabs-bordered mb-6">
                {TABS.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`tab ${tab.href === '/secure/payouts/escrow' ? 'tab-active' : ''}`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
            <Suspense fallback={<AdminLoadingState />}>
                <EscrowTable />
            </Suspense>
        </div>
    );
}
