'use client';

import { AdminDataTable, type Column } from '@/components/shared';

export type AutomationRule = {
    id: string;
    name: string;
    description: string;
    trigger: string;
    action: string;
    is_active: boolean;
    last_run_at: string | null;
    run_count: number;
};

type RuleTableProps = {
    data: AutomationRule[];
    loading?: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (field: string) => void;
    onToggle?: (rule: AutomationRule) => void;
};

export function RuleTable({ data, loading, sortField, sortDir, onSort, onToggle }: RuleTableProps) {
    const columns: Column<AutomationRule>[] = [
        {
            key: 'name',
            label: 'Rule',
            sortable: true,
            render: (item) => (
                <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-sm text-base-content/50">{item.description}</p>
                </div>
            ),
        },
        {
            key: 'trigger',
            label: 'Trigger',
            render: (item) => (
                <span className="badge badge-outline badge-sm">{item.trigger}</span>
            ),
        },
        {
            key: 'action',
            label: 'Action',
            render: (item) => (
                <span className="badge badge-outline badge-sm badge-secondary">{item.action}</span>
            ),
        },
        {
            key: 'run_count',
            label: 'Runs',
            sortable: true,
            render: (item) => (
                <span className="text-sm font-semibold">{item.run_count.toLocaleString()}</span>
            ),
        },
        {
            key: 'last_run_at',
            label: 'Last Run',
            render: (item) => (
                <span className="text-sm text-base-content/60">
                    {item.last_run_at ? new Date(item.last_run_at).toLocaleDateString() : 'Never'}
                </span>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (item) => (
                <input
                    type="checkbox"
                    className="toggle toggle-success toggle-sm"
                    checked={item.is_active}
                    onChange={() => onToggle?.(item)}
                    onClick={(e) => e.stopPropagation()}
                />
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
            emptyTitle="No automation rules"
            emptyDescription="Automation rules will appear once configured."
        />
    );
}
