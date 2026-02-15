import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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

const COLORS = {
    dark: '#1A1A2E',
    white: '#FFFFFF',
};

/**
 * FilterBar - Memphis-styled horizontal filter button group
 *
 * Displays a row of pill-like filter buttons with accent colors.
 * Active filter fills with its accent color. Extracted from notifications-six showcase.
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
                <span
                    className="text-xs font-black uppercase tracking-wider"
                    style={{ color: COLORS.dark, opacity: 0.4 }}
                >
                    {label}
                </span>
            )}
            <div className="flex flex-wrap gap-1">
                {options.map((option) => {
                    const isActive = option.key === activeKey;
                    const colorKey = option.color || 'dark';
                    const hex = colorKey === 'dark' ? COLORS.dark : ACCENT_HEX[colorKey as AccentColor];
                    const textColor = colorKey === 'dark'
                        ? COLORS.white
                        : (colorKey === 'yellow' ? COLORS.dark : COLORS.white);

                    return (
                        <button
                            key={option.key}
                            onClick={() => onChange(option.key)}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 transition-all"
                            style={{
                                borderColor: isActive ? hex : 'rgba(26,26,46,0.1)',
                                backgroundColor: isActive ? hex : 'transparent',
                                color: isActive ? textColor : 'rgba(26,26,46,0.5)',
                            }}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
