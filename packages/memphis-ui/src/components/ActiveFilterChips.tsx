import React from 'react';
import { getAccentColor, ACCENT_HEX } from '../utils/accent-cycle';

export interface ActiveFilter {
    /** Unique key for this filter */
    key: string;
    /** Display value */
    value: string;
}

export interface ActiveFilterChipsProps {
    /** Active filters to display */
    filters: ActiveFilter[];
    /** Remove a specific filter */
    onRemove: (key: string, value: string) => void;
    /** Clear all filters */
    onClearAll: () => void;
    /** Custom class name */
    className?: string;
}

/**
 * ActiveFilterChips - Active filter tag display with remove buttons
 *
 * Memphis compliant row of removable filter chips with cycling accent colors.
 * Extracted from search-six showcase.
 */
export function ActiveFilterChips({
    filters,
    onRemove,
    onClearAll,
    className = '',
}: ActiveFilterChipsProps) {
    if (filters.length === 0) return null;

    return (
        <div
            className={['flex flex-wrap items-center gap-2', className]
                .filter(Boolean)
                .join(' ')}
        >
            <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#1A1A2E', opacity: 0.4 }}
            >
                Active:
            </span>
            {filters.map((f, i) => {
                const accent = getAccentColor(i);
                const hex = ACCENT_HEX[accent];
                return (
                    <button
                        key={`${f.key}-${f.value}`}
                        onClick={() => onRemove(f.key, f.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border-2 text-xs font-bold uppercase tracking-wider transition-all group"
                        style={{ borderColor: hex, color: '#1A1A2E' }}
                    >
                        {f.value}
                        <i
                            className="fa-solid fa-xmark text-[10px] transition-colors"
                            style={{ color: hex }}
                        />
                    </button>
                );
            })}
            <button
                onClick={onClearAll}
                className="text-xs font-bold uppercase tracking-wider ml-2"
                style={{ color: ACCENT_HEX.coral }}
            >
                Clear All
            </button>
        </div>
    );
}
