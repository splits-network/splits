import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface VerticalTab {
    /** Unique key */
    key: string;
    /** Display label */
    label: string;
    /** FontAwesome icon class */
    icon?: string;
    /** Tab panel content */
    content?: React.ReactNode;
}

export interface VerticalTabsProps {
    /** Tab definitions */
    tabs: VerticalTab[];
    /** Currently active tab key */
    activeKey: string;
    /** Called when a tab is selected */
    onChange: (key: string) => void;
    /** Accent color for active tab background */
    accent?: AccentColor;
    /** Width of the tab sidebar (Tailwind class, e.g. "w-48") */
    sidebarWidth?: string;
    /** Additional className */
    className?: string;
}

/**
 * VerticalTabs - Memphis-styled vertical tab navigation
 *
 * Uses `.tabs` container with flex-col direction on the sidebar,
 * `.tab` + `.tab-active` items from tab.css. Active tab background
 * set via `--tab-bg` CSS variable with accent color.
 * Content panel displays alongside the tab sidebar.
 */
export function VerticalTabs({
    tabs,
    activeKey,
    onChange,
    accent = 'teal',
    sidebarWidth = 'w-48',
    className = '',
}: VerticalTabsProps) {
    const activeTab = tabs.find((t) => t.key === activeKey);

    return (
        <div
            className={[
                `accent-${accent} flex bg-base-100 border-container`,
                className,
            ].filter(Boolean).join(' ')}
        >
            <div
                role="tablist"
                className={`tabs flex-col ${sidebarWidth} shrink-0 border-r-container`}
            >
                {tabs.map((tab) => {
                    const isActive = activeKey === tab.key;

                    return (
                        <button
                            key={tab.key}
                            role="tab"
                            onClick={() => onChange(tab.key)}
                            className={[
                                'tab w-full justify-start gap-2',
                                isActive ? 'tab-active bg-accent' : '',
                            ].filter(Boolean).join(' ')}
                            style={
                                isActive
                                    ? { '--tab-bg': 'var(--accent)' } as React.CSSProperties
                                    : undefined
                            }
                        >
                            {tab.icon && <i className={`fa-duotone fa-solid ${tab.icon}`} />}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <div className="flex-1 p-6">
                {activeTab?.content ?? (
                    <p className="font-bold text-sm text-base-content">
                        {activeTab?.label}
                    </p>
                )}
            </div>
        </div>
    );
}
