import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface BadgeTab {
    /** Unique key */
    key: string;
    /** Display label */
    label: string;
    /** FontAwesome icon class (e.g. "fa-duotone fa-regular fa-grid-2") */
    icon?: string;
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
    /** Whether tabs stretch to fill container (default true) */
    stretch?: boolean;
    /** Active tab text color — defaults to white */
    activeTextColor?: string;
    /** Additional className */
    className?: string;
}

/**
 * BadgeTabs - Memphis-styled tabs with count badges
 *
 * Outer container uses the container tier (4px) via `.border-memphis`.
 * Inner count badges use the detail tier (2px) via `.border-memphis-detail`.
 * Active tab inverts to dark background. Each tab can display a colored
 * count badge. Extracted from tabs-six showcase.
 */
export function BadgeTabs({
    tabs,
    activeKey,
    onChange,
    stretch = true,
    activeTextColor,
    className = '',
}: BadgeTabsProps) {
    return (
        <div
            className={['flex gap-0 bg-white border-memphis', className].filter(Boolean).join(' ')}
        >
            {tabs.map((tab, i) => {
                const isActive = tab.key === activeKey;
                const hex = tab.color ? ACCENT_HEX[tab.color] : ACCENT_HEX.coral;

                return (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
                        className={`${stretch ? 'flex-1' : ''} px-4 py-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer`}
                        style={{
                            background: isActive ? 'var(--color-dark)' : 'transparent',
                            color: isActive ? (activeTextColor || '#fff') : 'var(--color-dark)',
                            borderRight: i < tabs.length - 1 ? '2px solid rgba(26, 26, 46, 0.19)' : 'none',
                        }}
                    >
                        {tab.icon && <i className={tab.icon} />}
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span
                                className="px-2 py-0.5 text-[10px] font-black border-memphis-detail"
                                style={{
                                    background: hex,
                                    color: 'var(--color-dark)',
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
