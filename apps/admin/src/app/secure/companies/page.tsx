import { Suspense } from 'react';
import { AdminLoadingState } from '@/components/shared';
import { CompanyTable } from './components/company-table';

export const metadata = { title: 'Companies | Admin' };

export default function CompaniesPage() {
    return (
        <div className="p-6">
            <Suspense fallback={<AdminLoadingState />}>
                <CompanyTable />
            </Suspense>
        </div>
    );
}
