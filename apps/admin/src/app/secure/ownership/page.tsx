'use client';

import { AdminPageHeader } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';
import { OwnershipTable, type OwnershipRecord } from './components/ownership-table';

const STATUS_OPTIONS = ['all', 'verified', 'pending', 'disputed', 'failed'] as const;

export default function OwnershipPage() {
    const { items, loading, sortBy, sortOrder, handleSort, filters, setFilter } =
        useStandardList<OwnershipRecord, { verification_status: string }>({
            endpoint: '/admin/trust/admin/ownership',
            defaultSortBy: 'created_at',
            defaultSortOrder: 'desc',
            defaultFilters: { verification_status: 'all' },
            syncToUrl: true,
        });

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Ownership Audit"
                subtitle="Entity ownership verification and audit records"
            />

            <div className="flex gap-3 mb-4">
                <select
                    className="select select-sm select-bordered"
                    value={filters.verification_status}
                    onChange={(e) => setFilter('verification_status', e.target.value)}
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s === 'all'
                                ? 'All Statuses'
                                : s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-0">
                    <OwnershipTable
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
