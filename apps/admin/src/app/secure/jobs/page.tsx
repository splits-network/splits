import { Suspense } from 'react';
import { AdminLoadingState } from '@/components/shared';
import { JobTable } from './components/job-table';

export const metadata = { title: 'Jobs | Admin' };

export default function JobsPage() {
    return (
        <div className="p-6">
            <Suspense fallback={<AdminLoadingState />}>
                <JobTable />
            </Suspense>
        </div>
    );
}
