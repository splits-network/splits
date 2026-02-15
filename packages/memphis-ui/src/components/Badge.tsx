import React from "react";
import type { AccentColor } from "../utils/accent-cycle";

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeStyle = "solid" | "outline" | "soft" | "dot";

export interface BadgeProps {
    children: React.ReactNode;
    variant?: AccentColor | "dark" | "cream";
    style?: BadgeStyle;
    size?: BadgeSize;
    /** @deprecated Use style="outline" instead */
    outline?: boolean;
    className?: string;
}

const COLOR_CLASS: Record<string, string> = {
    coral: "badge-coral",
    teal: "badge-teal",
    yellow: "badge-yellow",
    purple: "badge-purple",
    dark: "badge-dark",
    cream: "badge-cream",
};

const SIZE_CLASS: Record<BadgeSize, string> = {
    sm: "badge-sm",
    md: "badge-md",
    lg: "badge-lg",
};

const STYLE_CLASS: Record<BadgeStyle, string> = {
    solid: "",
    outline: "badge-outline",
    soft: "badge-soft",
    dot: "badge-dot",
};

/**
 * Memphis Badge
 *
 * Uses the plugin's `.badge` base (interactive tier border 3px,
 * sharp corners, bold typography, uppercase).
 *
 * Color: `badge-coral`, `badge-teal`, `badge-yellow`, `badge-purple`, `badge-dark`, `badge-cream`
 * Size: `badge-sm`, `badge-md`, `badge-lg`
 * Style: solid (default), `badge-outline`, `badge-soft`, `badge-dot`
 */
export function Badge({
    children,
    variant = "coral",
    style: badgeStyle,
    size,
    outline = false,
    className = "",
}: BadgeProps) {
    // Support deprecated outline prop
    const resolvedStyle = badgeStyle ?? (outline ? "outline" : "solid");

    return (
        <span
            className={[
                "badge",
                COLOR_CLASS[variant] || "badge-coral",
                size ? SIZE_CLASS[size] : "",
                STYLE_CLASS[resolvedStyle] || "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {children}
        </span>
    );
}
