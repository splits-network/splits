import { Suspense } from 'react';
import { AdminLoadingState } from '@/components/shared';
import { OrgTable } from './components/org-table';

export const metadata = { title: 'Organizations | Admin' };

export default function OrganizationsPage() {
    return (
        <div className="p-6">
            <Suspense fallback={<AdminLoadingState />}>
                <OrgTable />
            </Suspense>
        </div>
    );
}
