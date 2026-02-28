'use client';

import { AdminPageHeader } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';
import { ReputationTable, type ReputationRecord } from './components/reputation-table';

const TIER_OPTIONS = ['all', 'platinum', 'gold', 'silver', 'bronze', 'new'] as const;

export default function ReputationPage() {
    const { items, loading, sortBy, sortOrder, handleSort, filters, setFilter } =
        useStandardList<ReputationRecord, { tier: string; entity_type: string }>({
            endpoint: '/trust/admin/reputation',
            defaultSortBy: 'score',
            defaultSortOrder: 'desc',
            defaultFilters: { tier: 'all', entity_type: 'all' },
            syncToUrl: true,
        });

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Reputation"
                subtitle="Entity reputation scores and tier standings"
            />

            <div className="flex gap-3 mb-4">
                <select
                    className="select select-sm select-bordered"
                    value={filters.tier}
                    onChange={(e) => setFilter('tier', e.target.value)}
                >
                    {TIER_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                            {t === 'all'
                                ? 'All Tiers'
                                : t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                    ))}
                </select>
                <select
                    className="select select-sm select-bordered"
                    value={filters.entity_type}
                    onChange={(e) => setFilter('entity_type', e.target.value)}
                >
                    <option value="all">All Entity Types</option>
                    <option value="recruiter">Recruiters</option>
                    <option value="company">Companies</option>
                    <option value="candidate">Candidates</option>
                </select>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-0">
                    <ReputationTable
                        data={items}
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
