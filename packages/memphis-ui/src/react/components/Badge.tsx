import React from "react";
import type { AnyMemphisColor, MemphisSize } from "../utils/types";

export type BadgeSize = MemphisSize;
export type BadgeVariant = "solid" | "outline" | "soft" | "dot" | "dash" | "ghost" | "borderless";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    color?: AnyMemphisColor;
    variant?: BadgeVariant;
    size?: BadgeSize;
    /** @deprecated Use variant="outline" instead */
    outline?: boolean;
    className?: string;
}

const COLOR_CLASSES: Record<string, string> = {
    // Memphis core
    coral: "badge-coral",
    teal: "badge-teal",
    yellow: "badge-yellow",
    purple: "badge-purple",
    dark: "badge-dark",
    cream: "badge-cream",
    // Semantic
    primary: "badge-primary",
    secondary: "badge-secondary",
    accent: "badge-accent",
    neutral: "badge-neutral",
    info: "badge-info",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
    xs: "badge-xs",
    sm: "badge-sm",
    md: "badge-md",
    lg: "badge-lg",
    xl: "badge-xl",
    "2xl": "badge-2xl",
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
    solid: "",
    outline: "badge-outline",
    soft: "badge-soft",
    dot: "badge-dot",
    dash: "badge-dash",
    ghost: "badge-ghost",
    borderless: "badge-borderless",
};

/**
 * Memphis Badge
 *
 * Uses the plugin's `.badge` base (interactive tier border,
 * sharp corners, bold typography, uppercase).
 *
 * Color: `badge-coral`, `badge-teal`, `badge-yellow`, `badge-purple`, `badge-dark`, `badge-cream`
 * Size: `badge-xs`, `badge-sm`, `badge-md`, `badge-lg`, `badge-xl`, `badge-2xl`
 * Variant: solid (default), `badge-outline`, `badge-soft`, `badge-dot`, `badge-dash`, `badge-ghost`, `badge-borderless`
 */
export function Badge({
    children,
    color = "coral",
    variant: badgeVariant,
    size,
    outline = false,
    className = "",
    ...rest
}: BadgeProps) {
    // Support deprecated outline prop
    const resolvedVariant = badgeVariant ?? (outline ? "outline" : "solid");

    return (
        <span
            className={[
                "badge",
                COLOR_CLASSES[color],
                size ? SIZE_CLASSES[size] : "",
                VARIANT_CLASSES[resolvedVariant] || "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            {...rest}
        >
            {children}
        </span>
    );
}
