'use client';

import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

type AdminCompany = {
    id: string;
    name: string;
    industry: string | null;
    location: string | null;
    city: string | null;
    state: string | null;
    job_count: number | null;
    placement_count: number | null;
    status: string | null;
    created_at: string;
};

const COLUMNS: Column<AdminCompany>[] = [
    {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (company) => (
            <span className="font-medium text-sm">{company.name}</span>
        ),
    },
    {
        key: 'industry',
        label: 'Industry',
        render: (company) => (
            <span className="text-sm text-base-content/70">{company.industry ?? '—'}</span>
        ),
    },
    {
        key: 'location',
        label: 'Location',
        render: (company) => {
            const loc = [company.city, company.state].filter(Boolean).join(', ') || company.location;
            return <span className="text-sm text-base-content/70">{loc ?? '—'}</span>;
        },
    },
    {
        key: 'job_count',
        label: 'Jobs',
        sortable: true,
        render: (company) => <span className="text-sm">{company.job_count ?? 0}</span>,
    },
    {
        key: 'placement_count',
        label: 'Placements',
        sortable: true,
        render: (company) => <span className="text-sm">{company.placement_count ?? 0}</span>,
    },
    {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (company) => (
            <span className="text-sm text-base-content/60">
                {new Date(company.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

export function CompanyTable() {
    const { data, loading, filters, total, totalPages, page, goToPage, setFilter, sortBy, sortOrder, handleSort } =
        useStandardList<AdminCompany>({
            endpoint: '/admin/network/admin/recruiter-companies',
            defaultFilters: { search: '' },
            defaultLimit: 25,
        });

    return (
        <div>
            <AdminPageHeader title="Companies" subtitle={`${total} total companies`} />

            <div className="flex items-center gap-3 mb-4">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        className="grow"
                        value={filters.search ?? ''}
                        onChange={(e) => setFilter('search', e.target.value)}
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
                    emptyTitle="No companies found"
                    emptyDescription="No companies match your search."
                />
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
                                onClick={() => goToPage(p)}
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
