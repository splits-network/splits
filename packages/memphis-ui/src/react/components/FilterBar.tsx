import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface FilterOption {
    /** Unique key */
    key: string;
    /** Display label */
    label: string;
    /** Accent color when active */
    color?: AccentColor | 'dark';
}

export interface FilterBarProps {
    /** Label before the filter buttons (e.g. "Type:") */
    label?: string;
    /** Available filter options */
    options: FilterOption[];
    /** Currently active filter key */
    activeKey: string;
    /** Called when a filter is selected */
    onChange: (key: string) => void;
    /** Additional className */
    className?: string;
}

/**
 * FilterBar - Memphis-styled horizontal filter button group
 *
 * Uses `.filter` CSS class with `.btn` radio inputs for pill-like filter buttons.
 * Active filter fills with its accent color.
 */
export function FilterBar({
    label,
    options,
    activeKey,
    onChange,
    className = '',
}: FilterBarProps) {
    return (
        <div className={['flex flex-wrap items-center gap-3', className].filter(Boolean).join(' ')}>
            {label && (
                <span className="text-xs font-black uppercase tracking-wider opacity-40">
                    {label}
                </span>
            )}
            <div className="filter">
                {options.map((option) => {
                    const colorKey = option.color || 'dark';
                    const btnColor = `btn-${colorKey}`;

                    return (
                        <input
                            key={option.key}
                            type="radio"
                            name="filter-bar"
                            className={`btn btn-sm ${btnColor}`}
                            aria-label={option.label}
                            checked={option.key === activeKey}
                            onChange={() => onChange(option.key)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
