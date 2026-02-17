import React from "react";
import type { AnyMemphisColor, MemphisSize } from "../utils/types";

export type ButtonVariant = "solid" | "outline" | "ghost" | "soft" | "dash" | "link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    color?: AnyMemphisColor;
    variant?: ButtonVariant;
    size?: MemphisSize;
    children: React.ReactNode;
}

const SIZE_CLASSES: Record<string, string> = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
    xl: "btn-xl",
    "2xl": "btn-2xl",
};

const COLOR_CLASSES: Record<string, string> = {
    // Memphis core
    coral: "btn-coral",
    teal: "btn-teal",
    yellow: "btn-yellow",
    purple: "btn-purple",
    dark: "btn-dark",
    // Semantic
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    neutral: "btn-neutral",
    info: "btn-info",
    success: "btn-success",
    warning: "btn-warning",
    error: "btn-error",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    solid: "",
    outline: "btn-outline",
    ghost: "btn-ghost",
    soft: "btn-soft",
    dash: "btn-dash",
    link: "btn-link",
};

/**
 * Memphis Button
 *
 * Uses the plugin's `.btn` base (border, radius, weight, uppercase,
 * tracking, cursor, transition) plus `.btn-{color}` for palette and
 * `.btn-{size}` for padding/font-size.
 *
 * Flat design, sharp corners, thick border, bold colors.
 * No shadows, no gradients, no border-radius.
 */
export function Button({
    color = "coral",
    variant = "solid",
    size = "md",
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={[
                "btn",
                SIZE_CLASSES[size],
                COLOR_CLASSES[color],
                VARIANT_CLASSES[variant],
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
