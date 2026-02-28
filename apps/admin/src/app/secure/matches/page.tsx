'use client';

import { AdminPageHeader } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';
import { MatchTable, type MatchRow } from './components/match-table';

export default function MatchesPage() {
    const { data, loading, sortBy, sortOrder, handleSort } = useStandardList<MatchRow>({
        endpoint: '/admin/matching/admin/matches',
        defaultSortBy: 'score',
        defaultSortOrder: 'desc',
        syncToUrl: true,
    });

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Matches"
                subtitle="AI-generated candidate-job match scores and status"
            />

            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-0">
                    <MatchTable
                        data={data}
                        loading={loading}
                        sortField={sortBy}
                        sortDir={sortOrder}
                        onSort={handleSort}
                    />
                </div>
            </div>
        </div>
    );
}
