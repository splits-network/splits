'use client';

import { AdminPageHeader } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';
import { FraudTable, type FraudSignal } from './components/fraud-table';

const SEVERITY_OPTIONS = ['all', 'critical', 'high', 'medium', 'low'] as const;

export default function FraudPage() {
    const { data, loading, sortBy, sortOrder, handleSort, filters, setFilter } =
        useStandardList<FraudSignal, { severity: string; resolved: string }>({
            endpoint: '/admin/fraud/admin/signals',
            defaultSortBy: 'detected_at',
            defaultSortOrder: 'desc',
            defaultFilters: { severity: 'all', resolved: 'false' },
            syncToUrl: true,
        });

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Fraud Detection"
                subtitle="Platform fraud signals and risk indicators"
            />

            <div className="flex gap-3 mb-4">
                <select
                    className="select select-sm select-bordered"
                    value={filters.severity}
                    onChange={(e) => setFilter('severity', e.target.value)}
                >
                    {SEVERITY_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s === 'all' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                    ))}
                </select>
                <select
                    className="select select-sm select-bordered"
                    value={filters.resolved}
                    onChange={(e) => setFilter('resolved', e.target.value)}
                >
                    <option value="false">Active Only</option>
                    <option value="true">Resolved Only</option>
                    <option value="all">All Signals</option>
                </select>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-0">
                    <FraudTable
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
