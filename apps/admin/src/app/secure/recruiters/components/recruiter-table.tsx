'use client';

import { useRouter } from 'next/navigation';
import { AdminDataTable, type Column } from '@/components/shared';
import { RecruiterActions } from './recruiter-actions';

type Recruiter = {
    id: string;
    user_id: string;
    user?: { name: string; email: string } | null;
    status: 'pending' | 'active' | 'suspended';
    tagline?: string;
    bio?: string;
    created_at: string;
};

type RecruiterTableProps = {
    data: Recruiter[];
    loading: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort: (field: string) => void;
    onRefresh: () => void;
};

const STATUS_BADGE: Record<string, string> = {
    active: 'badge-success',
    pending: 'badge-warning',
    suspended: 'badge-error',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function RecruiterTable({
    data,
    loading,
    sortField,
    sortDir,
    onSort,
    onRefresh,
}: RecruiterTableProps) {
    const router = useRouter();
    const columns: Column<Recruiter>[] = [
        {
            key: 'user',
            label: 'Recruiter',
            render: (item) => (
                <div>
                    <div className="font-medium text-sm">
                        {item.user?.name || <span className="text-base-content/40 italic">No name</span>}
                    </div>
                    <div className="text-sm text-base-content/50">
                        {item.user?.email || '—'}
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (item) => (
                <span className={`badge badge-sm ${STATUS_BADGE[item.status] ?? 'badge-ghost'}`}>
                    {item.status}
                </span>
            ),
        },
        {
            key: 'tagline',
            label: 'Tagline',
            render: (item) => (
                <span className="text-sm">
                    {item.tagline
                        ? item.tagline.length > 60
                            ? `${item.tagline.slice(0, 60)}...`
                            : item.tagline
                        : <span className="text-base-content/40 italic">No tagline</span>}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Joined',
            sortable: true,
            render: (item) => (
                <span className="text-sm text-base-content/60">{formatDate(item.created_at)}</span>
            ),
        },
    ];

    return (
        <AdminDataTable
            columns={columns}
            data={data}
            loading={loading}
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            onRowClick={(item) => router.push(`/secure/recruiters/${item.id}`)}
            emptyTitle="No recruiters found"
            emptyDescription="No recruiters match the current filters."
            actions={(item) => (
                <RecruiterActions
                    recruiterId={item.id}
                    currentStatus={item.status}
                    onSuccess={onRefresh}
                />
            )}
        />
    );
}
