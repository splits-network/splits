import { Suspense } from 'react';
import { AdminLoadingState } from '@/components/shared';
import { BillingTable } from './components/billing-table';

export const metadata = { title: 'Billing Profiles | Admin' };

export default function BillingProfilesPage() {
    return (
        <div className="p-6">
            <Suspense fallback={<AdminLoadingState />}>
                <BillingTable />
            </Suspense>
        </div>
    );
}
