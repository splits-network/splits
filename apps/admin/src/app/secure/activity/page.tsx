'use client';

import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

type ActivityEntry = {
    id: string;
    actor: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: string;
    created_at: string;
};

type Filters = { action_type?: string; entity_type?: string; search: string };

const COLUMNS: Column<ActivityEntry>[] = [
    {
        key: 'created_at',
        label: 'Timestamp',
        sortable: true,
        render: (e) => (
            <span className="text-sm text-base-content/60 whitespace-nowrap">
                {new Date(e.created_at).toLocaleString()}
            </span>
        ),
    },
    {
        key: 'actor',
        label: 'Actor',
        render: (e) => <span className="text-sm font-medium">{e.actor}</span>,
    },
    {
        key: 'action',
        label: 'Action',
        render: (e) => (
            <span className="badge badge-ghost badge-sm capitalize">
                {e.action.replace(/_/g, ' ')}
            </span>
        ),
    },
    {
        key: 'entity_type',
        label: 'Entity Type',
        render: (e) => (
            <span className="text-sm capitalize text-base-content/70">
                {e.entity_type.replace(/_/g, ' ')}
            </span>
        ),
    },
    {
        key: 'entity_id',
        label: 'Entity ID',
        render: (e) =>
            e.entity_id ? (
                <span className="font-mono text-sm text-base-content/60">{e.entity_id.slice(0, 8)}</span>
            ) : (
                <span className="text-base-content/40 text-sm">—</span>
            ),
    },
    {
        key: 'details',
        label: 'Details',
        render: (e) => <span className="text-sm text-base-content/60">{e.details ?? '—'}</span>,
    },
];

export default function ActivityPage() {
    const { data, loading, filters, page, totalPages, setFilter, setPage, sortBy, sortOrder, handleSort } =
        useStandardList<ActivityEntry, Filters>({
            endpoint: '/admin/identity/admin/activity',
            defaultFilters: { search: '' },
            defaultLimit: 50,
            defaultSortOrder: 'desc',
        });

    return (
        <div>
            <AdminPageHeader
                title="Activity Log"
                subtitle="Platform-wide activity audit trail"
            />

            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search activity..."
                        className="grow"
                        value={filters.search ?? ''}
                        onChange={(e) => setFilter('search', e.target.value)}
                    />
                </label>
                <select
                    className="select select-sm"
                    value={filters.entity_type ?? ''}
                    onChange={(e) => setFilter('entity_type', e.target.value || undefined)}
                >
                    <option value="">All Entity Types</option>
                    <option value="user">User</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="job">Job</option>
                    <option value="application">Application</option>
                    <option value="placement">Placement</option>
                    <option value="payout">Payout</option>
                </select>
            </div>

            <div className="card bg-base-100 border border-base-200">
                <AdminDataTable
                    columns={COLUMNS}
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    emptyTitle="No activity found"
                    emptyDescription="No activity log entries match your filters."
                />
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
