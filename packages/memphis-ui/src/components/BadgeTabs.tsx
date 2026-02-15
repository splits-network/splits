import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface BadgeTab {
    /** Unique key */
    key: string;
    /** Display label */
    label: string;
    /** Count to display in the badge (0 hides the badge) */
    count?: number;
    /** Accent color for the count badge */
    color?: AccentColor;
}

export interface BadgeTabsProps {
    /** Tab definitions */
    tabs: BadgeTab[];
    /** Currently active tab key */
    activeKey: string;
    /** Called when a tab is selected */
    onChange: (key: string) => void;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
};

/**
 * BadgeTabs - Memphis-styled tabs with count badges
 *
 * Active tab inverts to dark background. Each tab can display a colored
 * count badge. Extracted from tabs-six showcase.
 */
export function BadgeTabs({
    tabs,
    activeKey,
    onChange,
    className = '',
}: BadgeTabsProps) {
    return (
        <div
            className={['flex gap-0 bg-white', className].filter(Boolean).join(' ')}
            style={{ border: `4px solid ${COLORS.dark}` }}
        >
            {tabs.map((tab, i) => {
                const isActive = tab.key === activeKey;
                const hex = tab.color ? ACCENT_HEX[tab.color] : ACCENT_HEX.coral;

                return (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
                        className="flex-1 px-4 py-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                        style={{
                            background: isActive ? COLORS.dark : 'transparent',
                            color: isActive ? '#fff' : COLORS.dark,
                            borderRight: i < tabs.length - 1 ? `2px solid ${COLORS.dark}30` : 'none',
                        }}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span
                                className="px-2 py-0.5 text-[10px] font-black"
                                style={{
                                    background: hex,
                                    color: COLORS.dark,
                                    border: `2px solid ${COLORS.dark}`,
                                }}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
