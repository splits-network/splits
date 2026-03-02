'use client';

import { AdminDataTable, type Column } from '@/components/shared';
import { FirmApprovalActions } from './firm-approval-actions';

type Firm = {
    id: string;
    name: string;
    slug: string | null;
    status: 'active' | 'suspended';
    marketplace_visible: boolean;
    marketplace_approved_at: string | null;
    owner_user_id: string;
    owner?: { name: string; email: string } | null;
    created_at: string;
};

type FirmTableProps = {
    data: Firm[];
    loading: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort: (field: string) => void;
    onRefresh: () => void;
};

function getMarketplaceBadge(firm: Firm): { label: string; className: string } {
    if (firm.marketplace_approved_at) {
        return { label: 'Approved', className: 'badge-success' };
    }
    if (firm.marketplace_visible) {
        return { label: 'Pending', className: 'badge-warning' };
    }
    return { label: 'Not Listed', className: 'badge-ghost' };
}

const STATUS_BADGE: Record<string, string> = {
    active: 'badge-success',
    suspended: 'badge-error',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function FirmTable({
    data,
    loading,
    sortField,
    sortDir,
    onSort,
    onRefresh,
}: FirmTableProps) {
    const columns: Column<Firm>[] = [
        {
            key: 'name',
            label: 'Firm',
            sortable: true,
            render: (item) => (
                <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-sm text-base-content/50">
                        {item.owner?.email || '—'}
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
            key: 'marketplace',
            label: 'Marketplace',
            render: (item) => {
                const badge = getMarketplaceBadge(item);
                return (
                    <span className={`badge badge-sm ${badge.className}`}>
                        {badge.label}
                    </span>
                );
            },
        },
        {
            key: 'slug',
            label: 'Slug',
            render: (item) => (
                <span className="text-sm text-base-content/60">
                    {item.slug || <span className="italic text-base-content/30">none</span>}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
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
            emptyTitle="No firms found"
            emptyDescription="No firms match the current filters."
            actions={(item) => (
                <FirmApprovalActions
                    firmId={item.id}
                    marketplaceVisible={item.marketplace_visible}
                    marketplaceApprovedAt={item.marketplace_approved_at}
                    onSuccess={onRefresh}
                />
            )}
        />
    );
}
