import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
 * Memphis compliant pagination with square buttons, accent-colored active state,
 * and optional item count display.
 * Extracted from tables-six showcase.
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
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];

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
                <span
                    className="text-xs font-bold"
                    style={{ color: '#1A1A2E', opacity: 0.5 }}
                >
                    Showing {(page - 1) * perPage + 1}-
                    {Math.min(page * perPage, totalItems)} of {totalItems}
                </span>
            )}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center border-2 disabled:opacity-30"
                    style={{ borderColor: '#1A1A2E', color: '#1A1A2E' }}
                >
                    <i className="fa-solid fa-chevron-left text-xs" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onChange(i + 1)}
                        className="w-8 h-8 flex items-center justify-center border-2 text-xs font-black"
                        style={{
                            borderColor: page === i + 1 ? hex : '#1A1A2E',
                            backgroundColor: page === i + 1 ? hex : 'transparent',
                            color: page === i + 1 ? textHex : '#1A1A2E',
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={() => onChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center border-2 disabled:opacity-30"
                    style={{ borderColor: '#1A1A2E', color: '#1A1A2E' }}
                >
                    <i className="fa-solid fa-chevron-right text-xs" />
                </button>
            </div>
        </div>
    );
}
