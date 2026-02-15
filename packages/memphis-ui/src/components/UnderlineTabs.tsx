import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface UnderlineTabsProps {
    /** Tab labels */
    items: string[];
    /** Index of the active tab */
    activeIndex: number;
    /** Called when a tab is selected */
    onChange: (index: number) => void;
    /** Accent color for the active underline */
    accent?: AccentColor;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
};

/**
 * UnderlineTabs - Memphis-styled underline tab navigation
 *
 * Minimal tabs with a 4px bottom border. Active tab gets a colored underline.
 * Extracted from tabs-six showcase.
 */
export function UnderlineTabs({
    items,
    activeIndex,
    onChange,
    accent = 'coral',
    className = '',
}: UnderlineTabsProps) {
    const hex = ACCENT_HEX[accent];

    return (
        <div
            className={['flex gap-0', className].filter(Boolean).join(' ')}
            style={{ borderBottom: `4px solid ${COLORS.dark}` }}
        >
            {items.map((item, i) => (
                <button
                    key={item}
                    onClick={() => onChange(i)}
                    className="px-6 py-3 font-black text-sm uppercase tracking-wider transition-colors"
                    style={{
                        color: activeIndex === i ? hex : COLORS.dark,
                        borderBottom: activeIndex === i ? `4px solid ${hex}` : '4px solid transparent',
                        marginBottom: '-4px',
                    }}
                >
                    {item}
                </button>
            ))}
        </div>
    );
}
