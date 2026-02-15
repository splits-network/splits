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
 * Dark header, alternating row colors, thick borders.
 * Flat design, no shadows, sharp corners.
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
        <div className={['overflow-x-auto border-4 border-dark', className].filter(Boolean).join(' ')}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-dark text-white">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={[
                                    'px-4 py-3 text-left font-bold text-xs uppercase tracking-wider',
                                    col.className || '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
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
                                className="px-4 py-8 text-center text-dark/60 font-bold"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr
                                key={keyExtractor(item, index)}
                                className={[
                                    index % 2 === 1 ? 'bg-cream' : 'bg-white',
                                    'border-b-2 border-base-300',
                                    onRowClick
                                        ? 'cursor-pointer hover:bg-coral-light transition-colors'
                                        : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={['px-4 py-3', col.className || '']
                                            .filter(Boolean)
                                            .join(' ')}
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
