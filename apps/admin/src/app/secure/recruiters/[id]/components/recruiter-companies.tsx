'use client';

import { AdminDataTable, type Column } from '@/components/shared';

type CompanyRelation = {
    id: string;
    status: string;
    relationship_type: string;
    company: { id: string; name: string; logo_url: string | null } | null;
    created_at: string;
};

const STATUS_BADGE: Record<string, string> = {
    active: 'badge-success',
    pending: 'badge-warning',
    declined: 'badge-error',
    terminated: 'badge-ghost',
};

const COLUMNS: Column<CompanyRelation>[] = [
    {
        key: 'company',
        label: 'Company',
        render: (item) => (
            <div className="flex items-center gap-2">
                {item.company?.logo_url && (
                    <img src={item.company.logo_url} alt="" className="w-6 h-6 rounded object-cover" />
                )}
                <span className="font-medium text-sm">{item.company?.name ?? '—'}</span>
            </div>
        ),
    },
    {
        key: 'relationship_type',
        label: 'Type',
        render: (item) => (
            <span className="badge badge-ghost badge-sm capitalize">{item.relationship_type}</span>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        render: (item) => (
            <span className={`badge badge-sm capitalize ${STATUS_BADGE[item.status] ?? 'badge-ghost'}`}>
                {item.status}
            </span>
        ),
    },
    {
        key: 'created_at',
        label: 'Since',
        render: (item) => (
            <span className="text-sm text-base-content/60">
                {new Date(item.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

type Props = {
    companies: CompanyRelation[];
};

export function RecruiterCompanies({ companies }: Props) {
    return (
        <div className="card bg-base-100 border border-base-200">
            <AdminDataTable
                columns={COLUMNS}
                data={companies}
                loading={false}
                emptyTitle="No companies"
                emptyDescription="This recruiter has no company relationships."
            />
        </div>
    );
}
