"use client";

import { BaselFieldError } from "./basel-field-error";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselFormFieldProps {
    /** Field label text */
    label: string;
    /** Whether the field is required (shows red asterisk) */
    required?: boolean;
    /** Hint text displayed below the input */
    hint?: string;
    /** Error message — renders BaselFieldError when truthy */
    error?: string | null;
    /** The form control (input, select, textarea, etc.) */
    children: React.ReactNode;
    /** Additional className on the fieldset wrapper */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel form field — fieldset wrapper with Basel-styled uppercase label,
 * optional required marker, hint text, and automatic error display.
 */
export function BaselFormField({
    label,
    required,
    hint,
    error,
    children,
    className,
}: BaselFormFieldProps) {
    return (
        <fieldset className={className}>
            <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">
                {label}
                {required && <span className="text-error"> *</span>}
            </label>
            {children}
            <BaselFieldError error={error} />
            {hint && !error && (
                <p className="text-sm text-base-content/40 mt-1">{hint}</p>
            )}
        </fieldset>
    );
}
