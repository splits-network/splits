import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

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

const COLORS = {
    dark: '#1A1A2E',
};

/**
 * VerticalTabs - Memphis-styled vertical tab navigation
 *
 * Left sidebar with tab buttons, right panel for content.
 * Active tab fills with accent color. Extracted from tabs-six showcase.
 */
export function VerticalTabs({
    tabs,
    activeKey,
    onChange,
    accent = 'teal',
    sidebarWidth = 'w-48',
    className = '',
}: VerticalTabsProps) {
    const hex = ACCENT_HEX[accent];
    const activeTab = tabs.find((t) => t.key === activeKey);

    return (
        <div
            className={[
                'flex gap-0 bg-white',
                className,
            ].filter(Boolean).join(' ')}
            style={{ border: `4px solid ${COLORS.dark}` }}
        >
            <div className={`${sidebarWidth} shrink-0`} style={{ borderRight: `4px solid ${COLORS.dark}` }}>
                {tabs.map((tab, i) => (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
                        className="w-full px-5 py-4 text-left font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-colors"
                        style={{
                            background: activeKey === tab.key ? hex : 'transparent',
                            color: COLORS.dark,
                            borderBottom: i < tabs.length - 1 ? `2px solid ${COLORS.dark}20` : 'none',
                        }}
                    >
                        {tab.icon && <i className={`fa-duotone fa-solid ${tab.icon}`} />}
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 p-6">
                {activeTab?.content ?? (
                    <p className="font-bold text-sm" style={{ color: COLORS.dark }}>
                        {activeTab?.label}
                    </p>
                )}
            </div>
        </div>
    );
}
