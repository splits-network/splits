"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselTab {
    /** Tab label */
    label: string;
    /** Tab value (used for matching `active`) */
    value: string;
    /** Optional count badge */
    count?: number;
    /** Optional FontAwesome icon class */
    icon?: string;
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
 * Basel tab bar — DaisyUI `tabs tabs-bordered` with scroll arrows,
 * hidden scrollbar, and optional icon + count badge per tab.
 *
 * Matches the tabs/one showcase (Pattern 01 — Scrollable Detail Tabs).
 * Scroll arrows auto-show via ResizeObserver + scroll listener.
 */
export function BaselTabBar({
    tabs,
    active,
    onChange,
    className,
    containerRef,
}: BaselTabBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(
            el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
        );
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollButtons();
        el.addEventListener("scroll", updateScrollButtons);
        const observer = new ResizeObserver(updateScrollButtons);
        observer.observe(el);
        return () => {
            el.removeEventListener("scroll", updateScrollButtons);
            observer.disconnect();
        };
    }, [updateScrollButtons]);

    const scrollTabs = useCallback((direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({
            left: direction === "left" ? -160 : 160,
            behavior: "smooth",
        });
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative shrink-0 ${className || ""}`}
        >
            {canScrollLeft && (
                <button
                    onClick={() => scrollTabs("left")}
                    className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-1.5 bg-gradient-to-r from-base-100 via-base-100 to-transparent"
                    aria-label="Scroll tabs left"
                >
                    <i className="fa-duotone fa-regular fa-chevron-left text-sm text-base-content" />
                </button>
            )}
            <div
                ref={scrollRef}
                className="overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
                data-basel-tab-scroll
            >
                <style>{`[data-basel-tab-scroll]::-webkit-scrollbar { display: none; }`}</style>
                <div role="tablist" className="tabs tabs-bordered min-w-max">
                    {tabs.map((tab) => (
                        <a
                            key={tab.value}
                            role="tab"
                            className={`tab ${active === tab.value ? "tab-active" : ""}`}
                            onClick={() => onChange(tab.value)}
                        >
                            {tab.icon && (
                                <i className={`${tab.icon} mr-2`} />
                            )}
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-1.5 text-sm uppercase tracking-[0.2em] font-bold px-1.5 py-0.5 bg-primary/15 text-primary">
                                    {tab.count}
                                </span>
                            )}
                        </a>
                    ))}
                </div>
            </div>
            {canScrollRight && (
                <button
                    onClick={() => scrollTabs("right")}
                    className="absolute right-0 top-0 bottom-0 z-10 flex items-center px-1.5 bg-gradient-to-l from-base-100 via-base-100 to-transparent"
                    aria-label="Scroll tabs right"
                >
                    <i className="fa-duotone fa-regular fa-chevron-right text-sm text-base-content" />
                </button>
            )}
        </div>
    );
}
