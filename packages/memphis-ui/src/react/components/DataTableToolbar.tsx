import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface DataTableToolbarProps {
    /** Search value */
    search: string;
    /** Search change handler */
    onSearchChange: (value: string) => void;
    /** Search placeholder */
    searchPlaceholder?: string;
    /** Additional filter/action buttons */
    children?: React.ReactNode;
    /** Accent color for export button */
    exportAccent?: AccentColor;
    /** Export handler */
    onExport?: () => void;
    /** Custom class name */
    className?: string;
}

/**
 * DataTableToolbar - Table toolbar with search and actions
 *
 * Memphis compliant toolbar with bordered search input and action buttons.
 * Extracted from tables-six showcase.
 */
export function DataTableToolbar({
    search,
    onSearchChange,
    searchPlaceholder = 'Search...',
    children,
    exportAccent = 'teal',
    onExport,
    className = '',
}: DataTableToolbarProps) {
    return (
        <div
            className={[
                'p-4 border-b-3 border-cream flex flex-wrap items-center gap-3',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {/* Search */}
            <div
                className="flex border-interactive flex-1 min-w-[200px] max-w-sm"
            >
                <div
                    className="flex items-center px-3 bg-cream"
                >
                    <i
                        className="fa-duotone fa-regular fa-magnifying-glass text-xs text-dark"
                    />
                </div>
                <input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="flex-1 px-3 py-2 text-sm font-semibold outline-none text-dark"
                />
            </div>

            {children}

            {onExport && (
                <button
                    onClick={onExport}
                    className={[
                        'px-3 py-2 border-3 text-sm font-bold uppercase',
                        `accent-${exportAccent}`,
                        'border-accent',
                        'text-accent',
                    ].join(' ')}
                >
                    <i className="fa-duotone fa-regular fa-download text-xs mr-1" />
                    Export
                </button>
            )}
        </div>
    );
}
