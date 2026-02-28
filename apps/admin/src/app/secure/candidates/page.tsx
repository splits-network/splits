import { Suspense } from 'react';
import { AdminLoadingState } from '@/components/shared';
import { CandidateTable } from './components/candidate-table';

export const metadata = { title: 'Candidates | Admin' };

export default function CandidatesPage() {
    return (
        <div className="p-6">
            <Suspense fallback={<AdminLoadingState />}>
                <CandidateTable />
            </Suspense>
        </div>
    );
}
