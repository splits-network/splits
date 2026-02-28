'use client';

import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

type AdminOrg = {
    id: string;
    name: string;
    slug: string;
    type: string | null;
    member_count: number | null;
    owner_id: string | null;
    owner_name: string | null;
    status: string;
    created_at: string;
};

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: 'badge-success',
        inactive: 'badge-ghost',
        suspended: 'badge-error',
    };
    return (
        <span className={`badge badge-sm ${map[status] ?? 'badge-ghost'} capitalize`}>{status}</span>
    );
}

const COLUMNS: Column<AdminOrg>[] = [
    {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (org) => (
            <div>
                <p className="font-medium text-sm">{org.name}</p>
                <p className="text-sm text-base-content/50">{org.slug}</p>
            </div>
        ),
    },
    {
        key: 'type',
        label: 'Type',
        render: (org) =>
            org.type ? (
                <span className="badge badge-ghost badge-sm capitalize">{org.type.replace(/_/g, ' ')}</span>
            ) : (
                <span className="text-base-content/40 text-sm">—</span>
            ),
    },
    {
        key: 'member_count',
        label: 'Members',
        sortable: true,
        render: (org) => <span className="text-sm">{org.member_count ?? 0}</span>,
    },
    {
        key: 'owner_name',
        label: 'Owner',
        render: (org) => <span className="text-sm text-base-content/70">{org.owner_name ?? '—'}</span>,
    },
    {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (org) => (
            <span className="text-sm text-base-content/60">
                {new Date(org.created_at).toLocaleDateString()}
            </span>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        render: (org) => <StatusBadge status={org.status} />,
    },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
];

export function OrgTable() {
    const { data, loading, filters, total, totalPages, page, goToPage, setFilter, sortBy, sortOrder, handleSort } =
        useStandardList<AdminOrg>({
            endpoint: '/admin/identity/admin/organizations',
            defaultFilters: { search: '', status: '' },
            defaultLimit: 25,
        });

    return (
        <div>
            <AdminPageHeader title="Organizations" subtitle={`${total} total organizations`} />

            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search organizations..."
                        className="grow"
                        value={filters.search ?? ''}
                        onChange={(e) => setFilter('search', e.target.value)}
                    />
                </label>
                <select className="select select-sm" value={filters.status ?? ''} onChange={(e) => setFilter('status', e.target.value)}>
                    {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
                    emptyTitle="No organizations found"
                    emptyDescription="No organizations match your search."
                />
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button key={p} className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`} onClick={() => goToPage(p)}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
