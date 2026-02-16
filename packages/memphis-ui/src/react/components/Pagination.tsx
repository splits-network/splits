import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface PaginationProps {
    /** Current page (1-based) */
    page: number;
    /** Total number of pages */
    totalPages: number;
    /** Change handler */
    onChange: (page: number) => void;
    /** Total number of items */
    totalItems?: number;
    /** Items per page */
    perPage?: number;
    /** Accent color for active page */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * Pagination - Page navigation with numbered buttons
 *
 * Uses `.join` + `.join-item` for button group, `.btn` + `.btn-square` + `.btn-sm`
 * for individual buttons, and `.btn-{accent}` for the active page.
 */
export function Pagination({
    page,
    totalPages,
    onChange,
    totalItems,
    perPage,
    accent = 'coral',
    className = '',
}: PaginationProps) {
    const btnAccent = `btn-${accent}`;

    return (
        <div
            className={[
                'flex items-center justify-between',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {totalItems !== undefined && perPage !== undefined && (
                <span className="text-xs font-bold opacity-50">
                    Showing {(page - 1) * perPage + 1}-
                    {Math.min(page * perPage, totalItems)} of {totalItems}
                </span>
            )}
            <div className="join">
                <button
                    onClick={() => onChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn btn-sm btn-square btn-outline btn-dark join-item"
                >
                    <i className="fa-solid fa-chevron-left text-xs" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onChange(i + 1)}
                        className={[
                            'btn btn-sm btn-square join-item font-black',
                            page === i + 1 ? btnAccent : 'btn-outline btn-dark',
                        ].join(' ')}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={() => onChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="btn btn-sm btn-square btn-outline btn-dark join-item"
                >
                    <i className="fa-solid fa-chevron-right text-xs" />
                </button>
            </div>
        </div>
    );
}
