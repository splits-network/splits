'use client';

import type { ReactNode } from 'react';
import { AdminEmptyState } from './admin-empty-state';

export type Column<T> = {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (item: T) => ReactNode;
};

type AdminDataTableProps<T extends { id: string | number }> = {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    onSort?: (field: string) => void;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    selectable?: boolean;
    selected?: Set<string | number>;
    onSelect?: (id: string | number, checked: boolean) => void;
    onSelectAll?: (checked: boolean) => void;
    actions?: (item: T) => ReactNode;
    onRowClick?: (item: T) => void;
    emptyTitle?: string;
    emptyDescription?: string;
};

function SkeletonRows({ cols, count = 5 }: { cols: number; count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <tr key={i}>
                    {Array.from({ length: cols }).map((__, j) => (
                        <td key={j}>
                            <div className="skeleton h-3 rounded w-3/4" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export function AdminDataTable<T extends { id: string | number }>({
    columns,
    data,
    loading = false,
    onSort,
    sortField,
    sortDir,
    selectable = false,
    selected,
    onSelect,
    onSelectAll,
    actions,
    onRowClick,
    emptyTitle = 'No results',
    emptyDescription,
}: AdminDataTableProps<T>) {
    const allSelected = data.length > 0 && data.every((item) => selected?.has(item.id));
    const someSelected = data.some((item) => selected?.has(item.id));
    const totalCols = columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0);

    return (
        <div className="overflow-x-auto">
            <table className="table table-sm w-full">
                <thead>
                    <tr className="bg-base-200 text-base-content/60">
                        {selectable && (
                            <th className="w-10">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={allSelected}
                                    ref={(el) => {
                                        if (el) el.indeterminate = someSelected && !allSelected;
                                    }}
                                    onChange={(e) => onSelectAll?.(e.target.checked)}
                                />
                            </th>
                        )}
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={col.width ? { width: col.width } : undefined}
                                className={col.sortable ? 'cursor-pointer select-none hover:text-base-content' : ''}
                                onClick={col.sortable ? () => onSort?.(col.key) : undefined}
                            >
                                <span className="flex items-center gap-1">
                                    {col.label}
                                    {col.sortable && (
                                        <i
                                            className={[
                                                'fa-duotone fa-regular text-xs',
                                                sortField === col.key
                                                    ? sortDir === 'asc'
                                                        ? 'fa-arrow-up text-primary'
                                                        : 'fa-arrow-down text-primary'
                                                    : 'fa-arrows-up-down text-base-content/30',
                                            ].join(' ')}
                                        />
                                    )}
                                </span>
                            </th>
                        ))}
                        {actions && <th className="w-16 text-right">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <SkeletonRows cols={totalCols} />
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={totalCols} className="py-0">
                                <AdminEmptyState
                                    icon="fa-inbox"
                                    title={emptyTitle}
                                    description={emptyDescription}
                                />
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={item.id}
                                className={[
                                    'hover:bg-base-200 transition-colors',
                                    onRowClick ? 'cursor-pointer' : '',
                                    selected?.has(item.id) ? 'bg-primary/5' : '',
                                ].join(' ')}
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                            >
                                {selectable && (
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                            checked={selected?.has(item.id) ?? false}
                                            onChange={(e) => onSelect?.(item.id, e.target.checked)}
                                        />
                                    </td>
                                )}
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        {col.render
                                            ? col.render(item)
                                            : String((item as Record<string, unknown>)[col.key] ?? '')}
                                    </td>
                                ))}
                                {actions && (
                                    <td
                                        className="text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {actions(item)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
