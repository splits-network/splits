"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselFieldErrorProps {
    /** Error message to display. Returns null when falsy. */
    error?: string | null;
    /** Additional className */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel field error — inline error message with exclamation icon.
 * Returns null when no error is provided.
 */
export function BaselFieldError({ error, className }: BaselFieldErrorProps) {
    if (!error) return null;

    return (
        <p
            className={`text-error text-xs mt-1 flex items-center gap-1 ${className || ""}`}
        >
            <i className="fa-duotone fa-regular fa-circle-exclamation text-[10px]" />
            {error}
        </p>
    );
}
