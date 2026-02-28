'use client';

import { AdminPageHeader } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';
import { DecisionTable, type DecisionLogEntry } from './components/decision-table';

const DECISION_TYPES = ['all', 'match_scoring', 'fraud_check', 'recruiter_approval', 'payment_hold'] as const;

export default function DecisionLogPage() {
    const { data, loading, sortBy, sortOrder, handleSort, filters, setFilter } =
        useStandardList<DecisionLogEntry, { decision_type: string }>({
            endpoint: '/admin/decisions/admin/log',
            defaultSortBy: 'decided_at',
            defaultSortOrder: 'desc',
            defaultFilters: { decision_type: 'all' },
            syncToUrl: true,
        });

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Decision Log"
                subtitle="Audit trail of automated platform decisions"
            />

            <div className="flex gap-3 mb-4">
                <select
                    className="select select-sm select-bordered"
                    value={filters.decision_type}
                    onChange={(e) => setFilter('decision_type', e.target.value)}
                >
                    {DECISION_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {type === 'all'
                                ? 'All Decision Types'
                                : type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                    ))}
                </select>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-0">
                    <DecisionTable
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
