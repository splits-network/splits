'use client';

import { ReactNode, useCallback } from 'react';

// ===== TYPES =====

export interface TableColumn<T = unknown> {
    /** Unique key for the column */
    key: string;
    /** Header label */
    label: string;
    /** Whether this column is sortable */
    sortable?: boolean;
    /** Column width class (e.g., 'w-40', 'w-1/4') */
    width?: string;
    /** Text alignment */
    align?: 'left' | 'center' | 'right';
    /** Hide on mobile */
    hideOnMobile?: boolean;
    /** Custom header render */
    headerRender?: () => ReactNode;
}

export interface DataTableProps<T = unknown> {
    /** Table columns configuration */
    columns: TableColumn<T>[];
    /** Children (tbody content - use with DataTableRow or ExpandableTableRow) */
    children: ReactNode;
    /** Current sort column key */
    sortBy?: string;
    /** Current sort direction */
    sortOrder?: 'asc' | 'desc';
    /** Callback when sort changes */
    onSort?: (key: string) => void;
    /** Whether to show expand toggle column */
    showExpandColumn?: boolean;
    /** Whether to show selection checkbox column */
    showSelectColumn?: boolean;
    /** Select all checkbox state */
    selectAll?: boolean;
    /** Callback for select all */
    onSelectAll?: (selected: boolean) => void;
    /** Whether data is loading */
    loading?: boolean;
    /** Empty state content */
    emptyState?: ReactNode;
    /** Whether there's any data */
    isEmpty?: boolean;
    /** Additional table classes */
    className?: string;
    /** Whether to wrap in card */
    card?: boolean;
    /** Table size variant */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Whether rows are zebra striped */
    zebra?: boolean;
    /** Pin headers when scrolling */
    pinHeaders?: boolean;
}

// ===== HELPER FUNCTIONS =====

function getSortIcon(columnKey: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): string {
    if (sortBy !== columnKey) return 'fa-sort';
    return sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
}

function getAlignClass(align?: 'left' | 'center' | 'right'): string {
    switch (align) {
        case 'center': return 'text-center';
        case 'right': return 'text-right';
        default: return 'text-left';
    }
}

// ===== COMPONENT =====

export function DataTable<T = unknown>({
    columns,
    children,
    sortBy,
    sortOrder,
    onSort,
    showExpandColumn = false,
    showSelectColumn = false,
    selectAll = false,
    onSelectAll,
    loading = false,
    emptyState,
    isEmpty = false,
    className = '',
    card = true,
    size = 'md',
    zebra = false,
    pinHeaders = false,
}: DataTableProps<T>) {
    const handleSort = useCallback((key: string) => {
        if (onSort) {
            onSort(key);
        }
    }, [onSort]);

    const handleSelectAll = useCallback(() => {
        if (onSelectAll) {
            onSelectAll(!selectAll);
        }
    }, [onSelectAll, selectAll]);

    // Build table classes
    const tableClasses = [
        'table',
        size === 'xs' && 'table-xs',
        size === 'sm' && 'table-sm',
        size === 'lg' && 'table-lg',
        zebra && 'table-zebra',
        pinHeaders && 'table-pin-rows',
        className,
    ].filter(Boolean).join(' ');

    const tableContent = (
        <div className="overflow-x-auto bg-base-200">
            <table className={tableClasses}>
                <thead>
                    <tr className="bg-base-200">
                        {/* Selection checkbox column */}
                        {showSelectColumn && (
                            <th className="w-10">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    aria-label="Select all rows"
                                />
                            </th>
                        )}

                        {/* Expand toggle column */}
                        {showExpandColumn && (
                            <th className="w-10">
                                <span className="sr-only">Expand</span>
                            </th>
                        )}

                        {/* Data columns */}
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`
                                    ${column.sortable ? 'cursor-pointer hover:bg-base-200 select-none' : ''}
                                    ${column.width || ''}
                                    ${getAlignClass(column.align)}
                                    ${column.hideOnMobile ? 'hidden md:table-cell' : ''}
                                `}
                                onClick={column.sortable ? () => handleSort(column.key) : undefined}
                            >
                                {column.headerRender ? (
                                    column.headerRender()
                                ) : (
                                    <span className="inline-flex items-center gap-1">
                                        {column.label}
                                        {column.sortable && (
                                            <i className={`fa-duotone fa-regular ${getSortIcon(column.key, sortBy, sortOrder)} ml-1 text-xs opacity-50`}></i>
                                        )}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading && isEmpty ? (
                        <tr>
                            <td
                                colSpan={columns.length + (showSelectColumn ? 1 : 0) + (showExpandColumn ? 1 : 0)}
                                className="text-center py-12"
                            >
                                <span className="loading loading-spinner loading-md"></span>
                                <p className="text-base-content/60 mt-2">Loading...</p>
                            </td>
                        </tr>
                    ) : isEmpty ? (
                        <tr>
                            <td
                                colSpan={columns.length + (showSelectColumn ? 1 : 0) + (showExpandColumn ? 1 : 0)}
                                className="text-center py-12"
                            >
                                {emptyState || (
                                    <div className="text-base-content/50">
                                        <i className="fa-duotone fa-regular fa-inbox text-3xl mb-2"></i>
                                        <p>No data available</p>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ) : (
                        children
                    )}
                </tbody>
            </table>
        </div>
    );

    if (card) {
        return (
            <div className="card bg-base-100 shadow overflow-hidden">
                {tableContent}
            </div>
        );
    }

    return tableContent;
}

// ===== SIMPLE TABLE ROW =====

export interface DataTableRowProps {
    /** Row content (td elements) */
    children: ReactNode;
    /** Click handler */
    onClick?: () => void;
    /** Whether row is selected */
    selected?: boolean;
    /** Whether row is highlighted */
    highlighted?: boolean;
    /** Additional row classes */
    className?: string;
}

export function DataTableRow({
    children,
    onClick,
    selected = false,
    highlighted = false,
    className = '',
}: DataTableRowProps) {
    return (
        <tr
            className={`
                hover:bg-base-200/50 transition-colors
                ${onClick ? 'cursor-pointer' : ''}
                ${selected ? 'bg-primary/5' : ''}
                ${highlighted ? 'bg-warning/5' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

// ===== TABLE CELL HELPERS =====

export interface DataTableCellProps {
    /** Cell content */
    children: ReactNode;
    /** Text alignment */
    align?: 'left' | 'center' | 'right';
    /** Additional classes */
    className?: string;
    /** Stop click propagation (for action buttons) */
    stopPropagation?: boolean;
}

export function DataTableCell({
    children,
    align,
    className = '',
    stopPropagation = false,
}: DataTableCellProps) {
    return (
        <td
            className={`${getAlignClass(align)} ${className}`}
            onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
        >
            {children}
        </td>
    );
}

// ===== EMPTY VALUE PLACEHOLDER =====

export function EmptyValue({ text = '—' }: { text?: string }) {
    return <span className="text-base-content/30">{text}</span>;
}
