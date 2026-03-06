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
    /** Mobile menu content — rendered in a dropdown panel when hamburger is toggled */
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
 * Uses DaisyUI `navbar` for layout structure.
 * Mobile menu uses DaisyUI `dropdown` for auto click-outside handling.
 * Content is injected via composition slots — logo, nav, actions, mobileMenu.
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
    const [scrolled, setScrolled] = useState(false);
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = externalRef || internalRef;

    // ── Frosted glass on scroll ──────────────────────────────────────────
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ── Resolve background classes ───────────────────────────────────────
    const defaultBg = frosted ? "bg-base-100 backdrop-blur-md" : "bg-base-100";
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

                <div className="navbar px-4 min-h-0 h-14 lg:h-16 xl:h-18 flex justify-between">
                    {/* ── Left: Logo + Nav ──────────────────────── */}
                    <div className="navbar-start flex items-center">
                        {logo}
                        {nav && (
                            <nav className="hidden lg:flex items-center gap-1">
                                {nav}
                            </nav>
                        )}
                    </div>

                    {/* ── Right: Actions + Mobile toggle ────────── */}
                    <div className="navbar-end gap-2 flex items-center">
                        {actions}
                        {mobileMenu && (
                            <div className="dropdown dropdown-end lg:hidden">
                                <div
                                    tabIndex={0}
                                    role="button"
                                    className="btn btn-ghost btn-sm btn-square"
                                >
                                    <i className="fa-duotone fa-regular fa-bars text-lg" />
                                </div>
                                <div
                                    tabIndex={0}
                                    className="dropdown-content bg-base-100 border border-base-300 shadow-lg w-screen max-w-sm p-4 mt-2"
                                >
                                    {mobileMenu}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}
