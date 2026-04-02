'use client';

import { useStandardList } from '@/hooks/use-standard-list';
import { AdminDataTable, type Column } from '@/components/shared';
import type { AiUsageLog } from '@splits-network/shared-types';

const OPERATION_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'Fit Review', value: 'fit_review' },
    { label: 'Resume Extraction', value: 'resume_extraction' },
    { label: 'Call Summarization', value: 'call_summarization' },
    { label: 'Resume Generation', value: 'resume_generation' },
    { label: 'Resume Parsing', value: 'resume_parsing' },
    { label: 'Embedding', value: 'embedding' },
    { label: 'Match Scoring', value: 'matching_scoring' },
];

const PROVIDER_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
];

type Filters = {
    operation: string;
    provider: string;
};

const columns: Column<AiUsageLog>[] = [
    {
        key: 'created_at',
        label: 'Time',
        sortable: true,
        render: (row) => (
            <span className="text-xs">{new Date(row.created_at).toLocaleString()}</span>
        ),
    },
    {
        key: 'operation',
        label: 'Operation',
        render: (row) => (
            <span className="text-xs font-medium">{row.operation.replace(/_/g, ' ')}</span>
        ),
    },
    {
        key: 'provider',
        label: 'Provider',
        render: (row) => (
            <span className={`badge badge-sm ${row.provider === 'openai' ? 'badge-info' : 'badge-warning'}`}>
                {row.provider}
            </span>
        ),
    },
    {
        key: 'model',
        label: 'Model',
        render: (row) => <span className="font-mono text-xs">{row.model}</span>,
    },
    {
        key: 'total_tokens',
        label: 'Tokens',
        sortable: true,
        render: (row) => (
            <span className="text-xs">
                {row.input_tokens.toLocaleString()} / {row.output_tokens.toLocaleString()}
            </span>
        ),
    },
    {
        key: 'estimated_cost',
        label: 'Cost',
        sortable: true,
        render: (row) => (
            <span className="text-xs font-mono">
                {row.estimated_cost != null ? `$${row.estimated_cost.toFixed(6)}` : '-'}
            </span>
        ),
    },
    {
        key: 'duration_ms',
        label: 'Duration',
        sortable: true,
        render: (row) => (
            <span className="text-xs">{row.duration_ms != null ? `${row.duration_ms}ms` : '-'}</span>
        ),
    },
    {
        key: 'success',
        label: 'Status',
        render: (row) => (
            row.success
                ? <span className="badge badge-success badge-sm">OK</span>
                : <span className="badge badge-error badge-sm">{row.error_code ?? 'Error'}</span>
        ),
    },
];

export function UsageLogTable() {
    const {
        data,
        total,
        totalPages,
        loading,
        filters,
        setFilter,
        sortBy,
        sortOrder,
        handleSort,
        page,
        goToPage,
    } = useStandardList<AiUsageLog, Filters>({
        endpoint: '/ai/admin/ai/usage/logs',
        defaultFilters: { operation: '', provider: '' },
        defaultLimit: 25,
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <select
                    className="select select-bordered select-sm"
                    value={filters.operation}
                    onChange={(e) => setFilter('operation', e.target.value)}
                >
                    {OPERATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select
                    className="select select-bordered select-sm"
                    value={filters.provider}
                    onChange={(e) => setFilter('provider', e.target.value)}
                >
                    {PROVIDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <span className="text-sm text-base-content/60">{total} records</span>
            </div>

            <div className="card bg-base-100 shadow-sm">
                <AdminDataTable
                    data={data}
                    columns={columns}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                />

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-base-200">
                        <span className="text-sm text-base-content/60">
                            Page {page} of {totalPages}
                        </span>
                        <div className="join">
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-left" />
                            </button>
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page >= totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
