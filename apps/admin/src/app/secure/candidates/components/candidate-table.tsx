'use client';

import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

type AdminCandidate = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    resume_status: string | null;
    resume_url: string | null;
    location: string | null;
    created_at: string;
};

function ResumeStatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="text-base-content/40 text-sm">—</span>;
    const map: Record<string, string> = {
        uploaded: 'badge-success',
        pending: 'badge-warning',
        processing: 'badge-info',
        failed: 'badge-error',
        none: 'badge-ghost',
    };
    return (
        <span className={`badge badge-sm ${map[status] ?? 'badge-ghost'} capitalize`}>
            {status}
        </span>
    );
}

const COLUMNS: Column<AdminCandidate>[] = [
    {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (candidate) => (
            <div>
                <p className="font-medium text-sm">
                    {candidate.first_name} {candidate.last_name}
                </p>
                <p className="text-sm text-base-content/50">{candidate.email}</p>
            </div>
        ),
    },
    {
        key: 'phone',
        label: 'Phone',
        render: (candidate) => (
            <span className="text-sm text-base-content/70">{candidate.phone ?? '—'}</span>
        ),
    },
    {
        key: 'location',
        label: 'Location',
        render: (candidate) => (
            <span className="text-sm text-base-content/70">{candidate.location ?? '—'}</span>
        ),
    },
    {
        key: 'resume_status',
        label: 'Resume',
        render: (candidate) => <ResumeStatusBadge status={candidate.resume_status} />,
    },
    {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (candidate) => (
            <span className="text-sm text-base-content/60">
                {new Date(candidate.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

const RESUME_OPTIONS = [
    { value: '', label: 'All Resumes' },
    { value: 'uploaded', label: 'Uploaded' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'failed', label: 'Failed' },
    { value: 'none', label: 'None' },
];

export function CandidateTable() {
    const {
        data,
        loading,
        filters,
        total,
        totalPages,
        page,
        goToPage,
        setFilter,
        sortBy,
        sortOrder,
        handleSort,
    } = useStandardList<AdminCandidate>({
        endpoint: '/ats/admin/candidates',
        defaultFilters: { search: '', resume_status: '' },
        defaultLimit: 25,
    });

    return (
        <div>
            <AdminPageHeader
                title="Candidates"
                subtitle={`${total} total candidates`}
            />

            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        className="grow"
                        value={filters.search ?? ''}
                        onChange={(e) => setFilter('search', e.target.value)}
                    />
                </label>
                <select
                    className="select select-sm"
                    value={filters.resume_status ?? ''}
                    onChange={(e) => setFilter('resume_status', e.target.value)}
                >
                    {RESUME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
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
                    emptyTitle="No candidates found"
                    emptyDescription="No candidates match your search."
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
