"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselTab {
    /** Tab label */
    label: string;
    /** Tab value (used for matching `active`) */
    value: string;
    /** Optional count badge */
    count?: number;
}

export interface BaselTabBarProps {
    /** Array of tab definitions */
    tabs: BaselTab[];
    /** Currently active tab value */
    active: string;
    /** Called when a tab is clicked */
    onChange: (value: string) => void;
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel tab bar — underline-style tabs with optional square count badges.
 * The active tab has a `border-b-2 border-primary` indicator. Count badges
 * are square (no border-radius) per Basel design rules.
 *
 * Used in notifications, detail pages, and dashboard sections.
 */
export function BaselTabBar({
    tabs,
    active,
    onChange,
    className,
    containerRef,
}: BaselTabBarProps) {
    return (
        <div
            ref={containerRef}
            className={`flex gap-0 overflow-x-auto ${className || ""}`}
        >
            {tabs.map((tab) => {
                const isActive = tab.value === active;
                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => onChange(tab.value)}
                        className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                            isActive
                                ? "border-primary text-primary"
                                : "border-transparent text-base-content/40 hover:text-base-content/60"
                        }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={`text-[10px] px-1.5 py-0.5 font-bold ${
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "bg-base-300 text-base-content/30"
                                }`}
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
