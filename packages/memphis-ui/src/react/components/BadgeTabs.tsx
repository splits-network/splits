import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
 * Uses `.tabs` container with `.tab` + `.tab-active` items from tab.css.
 * Count badges use the `.badge` + `.badge-xs` + `.badge-{color}` classes
 * from badge.css. Active tab uses neutral background via CSS variables.
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
            role="tablist"
            className={['tabs border-lg bg-base-100', className].filter(Boolean).join(' ')}
        >
            {tabs.map((tab, i) => {
                const isActive = tab.key === activeKey;
                const badgeColor = tab.color || 'coral';

                return (
                    <button
                        key={tab.key}
                        role="tab"
                        onClick={() => onChange(tab.key)}
                        className={[
                            'tab',
                            stretch ? 'flex-1' : '',
                            isActive ? 'tab-active bg-dark' : 'bg-transparent',
                            i < tabs.length - 1 ? 'border-r-2 border-r-dark/[0.19]' : '',
                        ].filter(Boolean).join(' ')}
                        style={{
                            color: isActive ? (activeTextColor || '#fff') : 'var(--color-dark)',
                        }}
                    >
                        {tab.icon && <i className={tab.icon} />}
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`badge badge-xs badge-${badgeColor}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
