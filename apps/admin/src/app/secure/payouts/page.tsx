import { Suspense } from 'react';
import Link from 'next/link';
import { AdminLoadingState } from '@/components/shared';
import { PayoutTable } from './components/payout-table';

export const metadata = { title: 'Payouts | Admin' };

const TABS = [
    { label: 'Transactions', href: '/secure/payouts' },
    { label: 'Audit', href: '/secure/payouts/audit' },
    { label: 'Escrow', href: '/secure/payouts/escrow' },
    { label: 'Schedules', href: '/secure/payouts/schedules' },
];

export default function PayoutsPage() {
    return (
        <div>
            <div className="tabs tabs-bordered mb-6">
                {TABS.map((tab) => (
                    <Link key={tab.href} href={tab.href} className="tab">
                        {tab.label}
                    </Link>
                ))}
            </div>
            <Suspense fallback={<AdminLoadingState />}>
                <PayoutTable />
            </Suspense>
        </div>
    );
}
