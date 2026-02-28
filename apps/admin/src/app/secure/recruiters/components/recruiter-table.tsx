'use client';

import { AdminDataTable, type Column } from '@/components/shared';
import { RecruiterActions } from './recruiter-actions';

type Recruiter = {
    id: string;
    clerk_user_id: string;
    status: 'pending' | 'active' | 'suspended';
    headline?: string;
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
    const columns: Column<Recruiter>[] = [
        {
            key: 'clerk_user_id',
            label: 'Recruiter ID',
            sortable: true,
            render: (item) => (
                <span className="font-mono text-sm text-base-content/70">
                    {item.clerk_user_id.slice(0, 12)}...
                </span>
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
            key: 'headline',
            label: 'Headline',
            render: (item) => (
                <span className="text-sm">
                    {item.headline
                        ? item.headline.length > 60
                            ? `${item.headline.slice(0, 60)}...`
                            : item.headline
                        : <span className="text-base-content/40 italic">No headline</span>}
                </span>
            ),
        },
        {
            key: 'bio',
            label: 'Bio',
            render: (item) => (
                <span className="text-sm text-base-content/70">
                    {item.bio
                        ? item.bio.length > 80
                            ? `${item.bio.slice(0, 80)}...`
                            : item.bio
                        : <span className="italic">—</span>}
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
