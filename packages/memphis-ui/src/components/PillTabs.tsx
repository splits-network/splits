import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface PillTabsProps {
    /** Tab labels */
    items: string[];
    /** Index of the active tab */
    activeIndex: number;
    /** Called when a tab is selected */
    onChange: (index: number) => void;
    /** Accent color for the active pill */
    accent?: AccentColor;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
};

/**
 * PillTabs - Memphis-styled pill tab navigation
 *
 * Rectangular buttons (no border-radius) with 3px border.
 * Active pill fills with accent color. Extracted from tabs-six showcase.
 */
export function PillTabs({
    items,
    activeIndex,
    onChange,
    accent = 'coral',
    className = '',
}: PillTabsProps) {
    const hex = ACCENT_HEX[accent];

    return (
        <div className={['flex flex-wrap gap-3', className].filter(Boolean).join(' ')}>
            {items.map((item, i) => (
                <button
                    key={item}
                    onClick={() => onChange(i)}
                    className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-all hover:opacity-80"
                    style={{
                        background: activeIndex === i ? hex : '#fff',
                        color: COLORS.dark,
                        border: `3px solid ${COLORS.dark}`,
                    }}
                >
                    {item}
                </button>
            ))}
        </div>
    );
}
