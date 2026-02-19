"use client";

import { type BaselSemanticColor, semanticBorder } from "../utils/colors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselSidebarCardProps {
    /** Section title displayed as uppercase header */
    title: string;
    /** DaisyUI semantic color for the top border accent (default: "primary") */
    accentColor?: BaselSemanticColor;
    /** Card content */
    children: React.ReactNode;
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel sidebar card — `bg-base-200 border-t-4` container with an uppercase
 * `font-black` section title. Used in detail sidebars, settings panels,
 * and info cards.
 */
export function BaselSidebarCard({
    title,
    accentColor = "primary",
    children,
    className,
    containerRef,
}: BaselSidebarCardProps) {
    return (
        <div
            ref={containerRef}
            className={`bg-base-200 border-t-4 ${semanticBorder[accentColor]} p-6 ${className || ""}`}
        >
            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                {title}
            </h3>
            {children}
        </div>
    );
}
