"use client";

import { useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type BaselModalHeaderVariant = "standard" | "destructive";

export interface BaselModalHeaderProps {
    /** Modal title text */
    title: string;
    /** Subtitle text below the title */
    subtitle?: string;
    /** FontAwesome icon class (e.g. "fa-briefcase") */
    icon?: string;
    /** DaisyUI semantic color for the icon container background (default: "primary") */
    iconColor?:
        | "primary"
        | "secondary"
        | "accent"
        | "neutral"
        | "info"
        | "success"
        | "warning"
        | "error";
    /** Header variant: "standard" uses bg-neutral, "destructive" uses bg-error/10 (default: "standard") */
    variant?: BaselModalHeaderVariant;
    /** Called when the close button is clicked */
    onClose?: () => void;
    /** Whether the close button should be disabled */
    closeDisabled?: boolean;
    /** Additional content rendered after the title block (e.g. wizard progress bar) */
    children?: React.ReactNode;
    /** Additional className on the header container */
    className?: string;
    /** Ref forwarded to the header div for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const ICON_BG_MAP: Record<string, string> = {
    primary: "bg-primary text-primary-content",
    secondary: "bg-secondary text-secondary-content",
    accent: "bg-accent text-accent-content",
    neutral: "bg-neutral text-neutral-content",
    info: "bg-info text-info-content",
    success: "bg-success text-success-content",
    warning: "bg-warning text-warning-content",
    error: "bg-error text-error-content",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel modal header — colored header with icon container, title, subtitle,
 * and close button. Supports "standard" (bg-neutral) and "destructive"
 * (bg-error/10) variants.
 *
 * CSS hook: `.modal-header`
 */
export function BaselModalHeader({
    title,
    subtitle,
    icon,
    iconColor = "primary",
    variant = "standard",
    onClose,
    closeDisabled,
    children,
    className,
    containerRef: externalRef,
}: BaselModalHeaderProps) {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = externalRef || internalRef;

    const isDestructive = variant === "destructive";
    const bgClass = isDestructive
        ? "bg-error/10"
        : "bg-neutral text-neutral-content";
    const titleClass = isDestructive ? "text-error" : "text-neutral-content";
    const subtitleClass = isDestructive
        ? "text-error/70"
        : "text-neutral-content/60";
    const closeBtnClass = isDestructive
        ? "text-error/60 hover:text-error"
        : "text-neutral-content/60 hover:text-neutral-content";

    return (
        <div
            ref={ref}
            className={`modal-header ${bgClass} px-6 py-5 ${className || ""}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div
                            className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${ICON_BG_MAP[iconColor]}`}
                        >
                            <i className={`fa-duotone fa-regular ${icon}`} />
                        </div>
                    )}
                    <div>
                        <h3 className={`text-lg font-black ${titleClass}`}>
                            {title}
                        </h3>
                        {subtitle && (
                            <p
                                className={`text-xs uppercase tracking-wider ${subtitleClass}`}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`btn btn-ghost btn-sm btn-square ${closeBtnClass}`}
                        disabled={closeDisabled}
                        aria-label="Close modal"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}
