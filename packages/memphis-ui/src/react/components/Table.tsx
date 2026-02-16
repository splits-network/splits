import React from 'react';

export interface TableColumn<T> {
    key: string;
    header: string;
    render?: (item: T, index: number) => React.ReactNode;
    className?: string;
}

export interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    className?: string;
}

/**
 * Memphis Table
 *
 * Uses the `.table` CSS class from table.css for all core styling:
 * dark header, alternating row colors, thick borders, uppercase headers.
 */
export function Table<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    emptyMessage = 'No data available',
    className = '',
}: TableProps<T>) {
    return (
        <div className={['overflow-x-auto', className].filter(Boolean).join(' ')}>
            <table className="table w-full">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={col.className || undefined}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-center text-base-content/60 font-bold py-8"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr
                                key={keyExtractor(item, index)}
                                className={[
                                    onRowClick ? 'row-hover cursor-pointer' : '',
                                ].filter(Boolean).join(' ')}
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={col.className || undefined}
                                    >
                                        {col.render
                                            ? col.render(item, index)
                                            : String((item as Record<string, unknown>)[col.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
