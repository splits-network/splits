import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

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
    const exportHex = ACCENT_HEX[exportAccent];

    return (
        <div
            className={[
                'p-4 border-b-3 flex flex-wrap items-center gap-3',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ borderColor: '#F5F0EB' }}
        >
            {/* Search */}
            <div
                className="flex border-3 flex-1 min-w-[200px] max-w-sm"
                style={{ borderColor: '#1A1A2E' }}
            >
                <div
                    className="flex items-center px-3"
                    style={{ backgroundColor: '#F5F0EB' }}
                >
                    <i
                        className="fa-duotone fa-regular fa-magnifying-glass text-xs"
                        style={{ color: '#1A1A2E' }}
                    />
                </div>
                <input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="flex-1 px-3 py-2 text-xs font-semibold outline-none"
                    style={{ color: '#1A1A2E' }}
                />
            </div>

            {children}

            {onExport && (
                <button
                    onClick={onExport}
                    className="px-3 py-2 border-3 text-xs font-bold uppercase"
                    style={{ borderColor: exportHex, color: exportHex }}
                >
                    <i className="fa-duotone fa-regular fa-download text-xs mr-1" />
                    Export
                </button>
            )}
        </div>
    );
}
