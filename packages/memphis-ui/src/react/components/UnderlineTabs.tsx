import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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

/**
 * UnderlineTabs - Memphis-styled underline tab navigation
 *
 * Uses `.tabs` + `.tabs-border` container with `.tab` + `.tab-active` items
 * from tab.css. The `.tabs-border` variant renders a bottom border via
 * `:before` pseudo-element using `currentColor`, so setting the text color
 * on the active tab controls the underline color.
 */
export function UnderlineTabs({
    items,
    activeIndex,
    onChange,
    accent = 'coral',
    className = '',
}: UnderlineTabsProps) {
    return (
        <div
            role="tablist"
            className={[`accent-${accent} tabs tabs-border`, className].filter(Boolean).join(' ')}
        >
            {items.map((item, i) => {
                const isActive = i === activeIndex;

                return (
                    <button
                        key={item}
                        role="tab"
                        onClick={() => onChange(i)}
                        className={[
                            'tab',
                            isActive ? 'tab-active text-accent' : '',
                        ].filter(Boolean).join(' ')}
                    >
                        {item}
                    </button>
                );
            })}
        </div>
    );
}
