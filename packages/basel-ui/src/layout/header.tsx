"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BaselHeaderProps {
    /** Logo element — always visible on all screen sizes */
    logo: React.ReactNode;
    /** Desktop navigation items — hidden on mobile, shown in a flex row */
    nav?: React.ReactNode;
    /** Right-side action items — consumer controls responsive visibility via classes */
    actions?: React.ReactNode;
    /** Mobile drawer content — rendered below header when hamburger is toggled */
    mobileMenu?: React.ReactNode;
    /** Show top primary accent line (default: true) */
    accentLine?: boolean;
    /** Positioning mode (default: "fixed") */
    position?: "fixed" | "sticky";
    /** Always show frosted glass backdrop, not just on scroll (default: false) */
    frosted?: boolean;
    /** Additional className on the outer wrapper */
    className?: string;
    /** Ref forwarded to the outermost container div (for GSAP, ResizeObserver, etc.) */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Basel Design System — Header Shell
 *
 * Provides the editorial header structure: accent line, frosted-glass scroll
 * effect, responsive container, and mobile hamburger drawer.
 *
 * Content is injected via composition slots — logo, nav, actions, mobileMenu.
 * Each app provides its own navigation data, dropdowns, auth logic, etc.
 *
 * CSS class hooks for GSAP targeting:
 *   .header-bar — the <header> element (for entrance animations)
 */
export function BaselHeader({
    logo,
    nav,
    actions,
    mobileMenu,
    accentLine = true,
    position = "fixed",
    frosted = false,
    className,
    containerRef: externalRef,
}: BaselHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = externalRef || internalRef;

    // ── Frosted glass on scroll ──────────────────────────────────────────
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ── Close mobile menu on outside click ───────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [ref]);

    // ── Resolve background classes ───────────────────────────────────────
    const defaultBg = frosted
        ? "bg-base-100 backdrop-blur-md"
        : "bg-base-100";
    const scrolledBg =
        "bg-base-100 backdrop-blur-md shadow-sm border-b border-base-300";

    return (
        <div
            ref={ref}
            className={`${position} top-0 left-0 right-0 z-50 ${className || ""}`}
        >
            <header
                className={`header-bar transition-all duration-300 ${
                    scrolled ? scrolledBg : defaultBg
                }`}
            >
                {accentLine && <div className="h-1 bg-primary w-full" />}

                <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="flex items-center justify-between h-14 lg:h-16 xl:h-18">
                        {/* ── Left: Logo + Nav ──────────────────────── */}
                        <div className="flex items-center gap-10">
                            {logo}
                            {nav && (
                                <nav className="hidden lg:flex items-center gap-1">
                                    {nav}
                                </nav>
                            )}
                        </div>

                        {/* ── Right: Actions + Mobile toggle ────────── */}
                        <div className="flex items-center gap-2">
                            {actions}
                            {mobileMenu && (
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="btn btn-ghost btn-sm btn-square lg:hidden"
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${menuOpen ? "fa-xmark" : "fa-bars"} text-lg`}
                                    />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Mobile Drawer ─────────────────────────────────── */}
                {menuOpen && mobileMenu && (
                    <div className="lg:hidden bg-base-100 border-t border-base-300 shadow-lg">
                        <div className="container mx-auto px-4 sm:px-6 py-4">
                            {mobileMenu}
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
