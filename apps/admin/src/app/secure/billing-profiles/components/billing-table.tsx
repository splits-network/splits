'use client';

import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

type BillingProfile = {
    id: string;
    name: string;
    entity_type: string;
    entity_id: string;
    profile_type: string;
    status: string;
    created_at: string;
};

const STATUS_BADGE: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-ghost',
    suspended: 'badge-error',
};

const COLUMNS: Column<BillingProfile>[] = [
    {
        key: 'name',
        label: 'Profile Name',
        sortable: true,
        render: (p) => <span className="text-sm font-medium">{p.name}</span>,
    },
    {
        key: 'entity_type',
        label: 'Entity',
        render: (p) => (
            <span className="text-sm capitalize text-base-content/70">
                {p.entity_type.replace(/_/g, ' ')}
            </span>
        ),
    },
    {
        key: 'profile_type',
        label: 'Type',
        render: (p) => (
            <span className="badge badge-ghost badge-sm capitalize">
                {p.profile_type.replace(/_/g, ' ')}
            </span>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        render: (p) => (
            <span className={`badge badge-sm capitalize ${STATUS_BADGE[p.status] ?? 'badge-ghost'}`}>
                {p.status}
            </span>
        ),
    },
    {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (p) => (
            <span className="text-sm text-base-content/60">
                {new Date(p.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

export function BillingTable() {
    const { data, loading, filters, page, totalPages, setFilter, setPage, sortBy, sortOrder, handleSort } =
        useStandardList<BillingProfile>({
            endpoint: '/billing/admin/billing-profiles',
            defaultFilters: { search: '' },
            defaultLimit: 25,
        });

    return (
        <div>
            <AdminPageHeader
                title="Billing Profiles"
                subtitle="Platform billing configurations"
            />

            <div className="flex items-center gap-3 mb-4">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search profiles..."
                        className="grow"
                        value={(filters as any).search ?? ''}
                        onChange={(e) => setFilter('search' as any, e.target.value)}
                    />
                </label>
            </div>

            <div className="card bg-base-100 border border-base-200">
                <AdminDataTable
                    columns={COLUMNS}
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    emptyTitle="No billing profiles"
                    emptyDescription="No billing profiles have been created yet."
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
