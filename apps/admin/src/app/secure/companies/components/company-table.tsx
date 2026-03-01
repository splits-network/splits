'use client';

import { AdminDataTable, type Column } from '@/components/shared';

type AdminCompany = {
    id: string;
    company: {
        id: string;
        name: string;
        logo_url: string | null;
    } | null;
    recruiter: {
        id: string;
        user: {
            name: string | null;
            email: string | null;
        } | null;
    } | null;
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
        key: 'company',
        label: 'Company',
        sortable: true,
        render: (row) => (
            <div className="flex items-center gap-2">
                {row.company?.logo_url && (
                    <img
                        src={row.company.logo_url}
                        alt=""
                        className="w-6 h-6 rounded object-cover"
                    />
                )}
                <span className="font-medium text-sm">{row.company?.name ?? '—'}</span>
            </div>
        ),
    },
    {
        key: 'recruiter',
        label: 'Recruiter',
        render: (row) => (
            <span className="text-sm text-base-content/70">
                {row.recruiter?.user?.name ?? row.recruiter?.user?.email ?? '—'}
            </span>
        ),
    },
    {
        key: 'industry',
        label: 'Industry',
        render: (row) => (
            <span className="text-sm text-base-content/70">{row.industry ?? '—'}</span>
        ),
    },
    {
        key: 'location',
        label: 'Location',
        render: (row) => {
            const loc = [row.city, row.state].filter(Boolean).join(', ') || row.location;
            return <span className="text-sm text-base-content/70">{loc ?? '—'}</span>;
        },
    },
    {
        key: 'job_count',
        label: 'Jobs',
        sortable: true,
        render: (row) => <span className="text-sm">{row.job_count ?? 0}</span>,
    },
    {
        key: 'placement_count',
        label: 'Placements',
        sortable: true,
        render: (row) => <span className="text-sm">{row.placement_count ?? 0}</span>,
    },
    {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (row) => (
            <span className="text-sm text-base-content/60">
                {new Date(row.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

type CompanyTableProps = {
    data: AdminCompany[];
    loading: boolean;
    sortField: string;
    sortDir: 'asc' | 'desc';
    onSort: (field: string) => void;
};

export function CompanyTable({ data, loading, sortField, sortDir, onSort }: CompanyTableProps) {
    return (
        <AdminDataTable
            columns={COLUMNS}
            data={data}
            loading={loading}
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            emptyTitle="No companies found"
            emptyDescription="No companies match your search."
        />
    );
}
