"use client";

import { useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselModalBodyProps {
    /** Body content */
    children: React.ReactNode;
    /** Padding class (default: "p-6") */
    padding?: string;
    /** Whether the body should scroll independently (default: true) */
    scrollable?: boolean;
    /** Additional className on the body div */
    className?: string;
    /** Ref forwarded to the body div for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel modal body — content area with proper padding and optional scrolling.
 *
 * CSS hook: `.modal-body`
 */
export function BaselModalBody({
    children,
    padding = "p-6",
    scrollable = true,
    className,
    containerRef: externalRef,
}: BaselModalBodyProps) {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = externalRef || internalRef;

    return (
        <div
            ref={ref}
            className={`modal-body ${padding} ${
                scrollable ? "flex-1 overflow-y-auto" : ""
            } ${className || ""}`}
        >
            {children}
        </div>
    );
}
