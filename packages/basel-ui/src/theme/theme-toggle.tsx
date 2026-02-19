"use client";

import { useTheme } from "./theme-provider";

export interface ThemeToggleProps {
    /** Additional className on the button */
    className?: string;
    /** Button size variant (default: "sm") */
    size?: "xs" | "sm" | "md";
}

/**
 * Basel theme toggle button — switches between splits-light and splits-dark.
 *
 * Uses FontAwesome sun/moon icons to match the project icon system.
 * Designed to sit in the header actions slot.
 */
export function ThemeToggle({ className, size = "sm" }: ThemeToggleProps) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`btn btn-ghost btn-${size} btn-square ${className || ""}`}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <i
                className={`fa-duotone fa-regular ${isDark ? "fa-sun-bright" : "fa-moon"} text-base-content/60`}
            />
        </button>
    );
}
