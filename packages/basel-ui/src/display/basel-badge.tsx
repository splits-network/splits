"use client";

import type { BaselSemanticColor } from "../utils/colors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type BaselBadgeVariant = "solid" | "soft" | "outline" | "ghost";
export type BaselBadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BaselBadgeProps {
    /** Text content */
    children: React.ReactNode;
    /** Semantic color (default: "neutral") */
    color?: BaselSemanticColor;
    /** Visual variant (default: "solid") */
    variant?: BaselBadgeVariant;
    /** Size (default: "sm") */
    size?: BaselBadgeSize;
    /** Optional FontAwesome icon class (e.g. "fa-briefcase") */
    icon?: string;
    /** Additional className */
    className?: string;
}

/* ─── DaisyUI class maps ─────────────────────────────────────────────────── */

const colorClass: Record<BaselSemanticColor, string> = {
    primary: "badge-primary",
    secondary: "badge-secondary",
    accent: "badge-accent",
    success: "badge-success",
    error: "badge-error",
    warning: "badge-warning",
    info: "badge-info",
    neutral: "badge-primary",
};

const variantClass: Record<BaselBadgeVariant, string> = {
    solid: "",
    soft: "badge-soft",
    outline: "badge-outline",
    ghost: "badge-ghost",
};

const sizeClass: Record<BaselBadgeSize, string> = {
    xs: "badge-xs",
    sm: "badge-sm",
    md: "badge-md",
    lg: "badge-lg",
    xl: "badge-xl",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel badge — DaisyUI `badge` with Basel editorial styling.
 *
 * Sharp corners, uppercase tracking, font-bold. Supports icons,
 * semantic colors, and all DaisyUI badge sizes/variants.
 */
export function BaselBadge({
    children,
    color = "neutral",
    variant = "solid",
    size = "sm",
    icon,
    className,
}: BaselBadgeProps) {
    return (
        <span
            className={[
                "badge uppercase tracking-wider font-bold",
                colorClass[color],
                variantClass[variant],
                sizeClass[size],
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {icon && <i className={`fa-duotone fa-regular ${icon}`} />}
            {children}
        </span>
    );
}
