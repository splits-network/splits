import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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

/**
 * PillTabs - Memphis-styled pill tab navigation
 *
 * Uses `.tabs` + `.tabs-box` container with `.tab` + `.tab-active` items
 * from tab.css. Active pill fills with accent color via CSS variable override.
 */
export function PillTabs({
    items,
    activeIndex,
    onChange,
    accent = 'coral',
    className = '',
}: PillTabsProps) {
    return (
        <div
            role="tablist"
            className={[`accent-${accent}`, 'tabs tabs-box', className].filter(Boolean).join(' ')}
        >
            {items.map((item, i) => {
                const isActive = i === activeIndex;

                return (
                    <button
                        key={item}
                        role="tab"
                        onClick={() => onChange(i)}
                        className={['tab', isActive ? 'tab-active' : ''].filter(Boolean).join(' ')}
                        style={
                            isActive
                                ? { '--tab-bg': 'var(--accent)' } as React.CSSProperties
                                : undefined
                        }
                    >
                        {item}
                    </button>
                );
            })}
        </div>
    );
}
