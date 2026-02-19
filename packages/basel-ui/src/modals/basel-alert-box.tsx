"use client";

import { useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type BaselAlertVariant = "error" | "warning" | "info" | "success";

export interface BaselAlertBoxProps {
    /** Alert variant controlling the color scheme */
    variant: BaselAlertVariant;
    /** FontAwesome icon class (optional, defaults based on variant) */
    icon?: string;
    /** Alert title (optional, rendered in bold uppercase) */
    title?: string;
    /** Alert content — string or ReactNode for complex content */
    children: React.ReactNode;
    /** Additional className on the alert container */
    className?: string;
    /** Ref forwarded to the alert div for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const VARIANT_STYLES: Record<
    BaselAlertVariant,
    { bg: string; border: string; defaultIcon: string; text: string }
> = {
    error: {
        bg: "bg-error/10",
        border: "border-error",
        defaultIcon: "fa-circle-exclamation",
        text: "text-error",
    },
    warning: {
        bg: "bg-warning/10",
        border: "border-warning",
        defaultIcon: "fa-triangle-exclamation",
        text: "text-warning",
    },
    info: {
        bg: "bg-info/10",
        border: "border-info",
        defaultIcon: "fa-info-circle",
        text: "text-info",
    },
    success: {
        bg: "bg-success/10",
        border: "border-success",
        defaultIcon: "fa-check-circle",
        text: "text-success",
    },
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel alert box — border-l-4 alert pattern usable inside modals and anywhere else.
 * Supports error, warning, info, and success variants with automatic icon defaults.
 *
 * CSS hook: `.alert-box`
 */
export function BaselAlertBox({
    variant,
    icon,
    title,
    children,
    className,
    containerRef: externalRef,
}: BaselAlertBoxProps) {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = externalRef || internalRef;

    const styles = VARIANT_STYLES[variant];
    const resolvedIcon = icon || styles.defaultIcon;

    return (
        <div
            ref={ref}
            className={`alert-box ${styles.bg} border-l-4 ${styles.border} p-4 ${className || ""}`}
        >
            <div className="flex gap-3 items-start">
                <i
                    className={`fa-duotone fa-regular ${resolvedIcon} ${styles.text} text-lg mt-0.5 flex-shrink-0`}
                />
                <div className="flex-1">
                    {title && (
                        <p className="font-semibold text-base-content uppercase tracking-[0.2em] text-sm mb-1">
                            {title}
                        </p>
                    )}
                    <div className="text-sm text-base-content/70 leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
