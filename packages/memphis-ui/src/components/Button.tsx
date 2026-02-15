import React from "react";
import type { AccentColor } from "../utils/accent-cycle";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: AccentColor | "dark";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

const SIZE_CLASSES: Record<string, string> = {
    sm: "memphis-btn-sm",
    md: "memphis-btn-md",
    lg: "memphis-btn-lg",
};

/**
 * Memphis Button
 *
 * Uses the plugin's `.memphis-btn` base (border, radius, weight, uppercase,
 * tracking, cursor, transition) plus `.btn-{color}` for palette and
 * `.memphis-btn-{size}` for padding/font-size.
 *
 * Flat design, sharp corners, thick border, bold colors.
 * No shadows, no gradients, no border-radius.
 */
export function Button({
    variant = "coral",
    size = "md",
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={[
                "memphis-btn",
                SIZE_CLASSES[size],
                `btn-${variant}`,
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
