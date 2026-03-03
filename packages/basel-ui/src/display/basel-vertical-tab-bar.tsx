"use client";

import type { BaselTab } from "./basel-tab-bar";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselVerticalTabBarProps {
    /** Array of tab definitions */
    tabs: BaselTab[];
    /** Currently active tab value */
    active: string;
    /** Called when a tab is clicked */
    onChange: (value: string) => void;
    /** Additional className on the nav container */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel vertical tab bar — sidebar navigation with `border-l-4 border-primary`
 * active indicator. Matches the tabs/one showcase (Pattern 04 — Vertical Sidebar Tabs).
 */
export function BaselVerticalTabBar({
    tabs,
    active,
    onChange,
    className,
}: BaselVerticalTabBarProps) {
    return (
        <nav className={`flex flex-col ${className || ""}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap border-l-4 text-left ${
                        active === tab.value
                            ? "bg-base-100 text-primary border-primary"
                            : "text-base-content/50 hover:text-base-content hover:bg-base-100/50 border-transparent"
                    }`}
                >
                    {tab.icon && (
                        <i className={`${tab.icon} text-sm w-4 text-center`} />
                    )}
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                        <span className="ml-auto text-sm uppercase tracking-[0.2em] font-bold px-1.5 py-0.5 bg-primary/15 text-primary">
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </nav>
    );
}
