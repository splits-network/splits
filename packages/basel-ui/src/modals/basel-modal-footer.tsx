"use client";

import { useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselModalFooterProps {
    /** Footer content (typically action buttons) */
    children: React.ReactNode;
    /** Alignment of footer actions (default: "end") */
    align?: "start" | "center" | "end" | "between";
    /** Whether to show border-top separator (default: true) */
    border?: boolean;
    /** Additional className on the footer div */
    className?: string;
    /** Ref forwarded to the footer div for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

const ALIGN_MAP: Record<string, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
};

/**
 * Basel modal footer — action bar with border-top and flex layout.
 *
 * CSS hook: `.modal-footer`
 */
export function BaselModalFooter({
    children,
    align = "end",
    border = true,
    className,
    containerRef: externalRef,
}: BaselModalFooterProps) {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = externalRef || internalRef;

    return (
        <div
            ref={ref}
            className={`modal-footer px-6 py-4 flex items-center gap-3 ${ALIGN_MAP[align]} ${
                border ? "border-t border-base-300" : ""
            } ${className || ""}`}
        >
            {children}
        </div>
    );
}
