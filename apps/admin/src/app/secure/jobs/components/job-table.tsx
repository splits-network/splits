'use client';

import { useRouter } from 'next/navigation';
import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

type AdminJob = {
    id: string;
    title: string;
    status: string;
    commute_type: string | null;
    job_level: string | null;
    company: { id: string; name: string; logo_url: string | null } | null;
    created_at: string;
};

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: 'badge-success',
        draft: 'badge-ghost',
        closed: 'badge-neutral',
        paused: 'badge-warning',
    };
    return (
        <span className={`badge badge-sm ${map[status] ?? 'badge-ghost'} capitalize`}>{status}</span>
    );
}

function TypeBadge({ value }: { value: string | null }) {
    if (!value) return <span className="text-base-content/40 text-sm">—</span>;
    return (
        <span className="badge badge-ghost badge-sm capitalize">{value.replace(/_/g, ' ')}</span>
    );
}

const COLUMNS: Column<AdminJob>[] = [
    {
        key: 'title',
        label: 'Job Title',
        sortable: true,
        render: (job) => (
            <div>
                <p className="font-medium text-sm">{job.title}</p>
                {job.company && <p className="text-sm text-base-content/50">{job.company.name}</p>}
            </div>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        render: (job) => <StatusBadge status={job.status} />,
    },
    {
        key: 'commute_type',
        label: 'Commute',
        render: (job) => <TypeBadge value={job.commute_type} />,
    },
    {
        key: 'job_level',
        label: 'Level',
        render: (job) => <TypeBadge value={job.job_level} />,
    },
    {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (job) => (
            <span className="text-sm text-base-content/60">
                {new Date(job.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'paused', label: 'Paused' },
    { value: 'closed', label: 'Closed' },
];

const COMMUTE_OPTIONS = [
    { value: '', label: 'All Commute' },
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
];

const LEVEL_OPTIONS = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry' },
    { value: 'mid', label: 'Mid' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'director', label: 'Director' },
    { value: 'executive', label: 'Executive' },
];

export function JobTable() {
    const router = useRouter();
    const { data, loading, filters, total, totalPages, page, goToPage, setFilter, sortBy, sortOrder, handleSort } =
        useStandardList<AdminJob>({
            endpoint: '/ats/admin/jobs',
            defaultFilters: { search: '', status: '', commute_type: '', job_level: '' },
            defaultLimit: 25,
        });

    return (
        <div>
            <AdminPageHeader title="Jobs" subtitle={`${total} total jobs`} />

            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="grow"
                        value={filters.search ?? ''}
                        onChange={(e) => setFilter('search', e.target.value)}
                    />
                </label>
                <select className="select select-sm" value={filters.status ?? ''} onChange={(e) => setFilter('status', e.target.value)}>
                    {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select className="select select-sm" value={filters.commute_type ?? ''} onChange={(e) => setFilter('commute_type', e.target.value)}>
                    {COMMUTE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select className="select select-sm" value={filters.job_level ?? ''} onChange={(e) => setFilter('job_level', e.target.value)}>
                    {LEVEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
                    onRowClick={(job) => router.push(`/secure/jobs/${job.id}`)}
                    emptyTitle="No jobs found"
                    emptyDescription="No jobs match your filters."
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
