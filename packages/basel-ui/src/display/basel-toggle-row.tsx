"use client";

import { type BaselInteractiveColor, semanticToggle } from "../utils/colors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselToggleRowProps {
    /** Toggle label */
    label: string;
    /** Description text below the label */
    description?: string;
    /** Whether the toggle is checked */
    checked: boolean;
    /** Called when the toggle changes */
    onChange: (checked: boolean) => void;
    /** DaisyUI semantic color for the toggle (default: "primary") */
    color?: BaselInteractiveColor;
    /** Whether the toggle is disabled */
    disabled?: boolean;
    /** Additional className on the container */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel toggle row — label + description + toggle switch. Used in settings,
 * notification preferences, and accessibility options.
 */
export function BaselToggleRow({
    label,
    description,
    checked,
    onChange,
    color = "primary",
    disabled,
    className,
}: BaselToggleRowProps) {
    return (
        <div
            className={`flex items-center justify-between py-5 border-b border-base-300 ${className || ""}`}
        >
            <div>
                <p className="font-semibold text-sm">{label}</p>
                {description && (
                    <p className="text-xs text-base-content/40">
                        {description}
                    </p>
                )}
            </div>
            <input
                type="checkbox"
                className={`toggle ${semanticToggle[color]}`}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
        </div>
    );
}
