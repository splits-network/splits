/**
 * Shared Basel color utilities.
 *
 * All DaisyUI semantic color → Tailwind class mappings live here.
 * Components import from this file instead of defining their own maps,
 * ensuring every class string is statically present for Tailwind's
 * tree-shaking / JIT scanner to detect.
 */

/* ─── Semantic Color Type ────────────────────────────────────────────────── */

/** DaisyUI semantic colors supported by Basel components. */
export type BaselSemanticColor =
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "neutral";

/** Subset excluding neutral — for components that only use interactive colors. */
export type BaselInteractiveColor =
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "error"
    | "warning"
    | "info";

/* ─── Text ───────────────────────────────────────────────────────────────── */

export const semanticText: Record<BaselSemanticColor, string> = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    success: "text-success",
    error: "text-error",
    warning: "text-warning",
    info: "text-info",
    neutral: "text-neutral",
};

/* ─── Background ─────────────────────────────────────────────────────────── */

export const semanticBg: Record<BaselSemanticColor, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    success: "bg-success",
    error: "bg-error",
    warning: "bg-warning",
    info: "bg-info",
    neutral: "bg-neutral",
};

/** Background at 10% opacity — for icon containers and tinted areas. */
export const semanticBg10: Record<BaselSemanticColor, string> = {
    primary: "bg-primary/10",
    secondary: "bg-secondary/10",
    accent: "bg-accent/10",
    success: "bg-success/10",
    error: "bg-error/10",
    warning: "bg-warning/10",
    info: "bg-info/10",
    neutral: "bg-neutral/10",
};

/** Background at 5% opacity — for subtle card tinting. */
export const semanticBg5: Record<BaselSemanticColor, string> = {
    primary: "bg-primary/5",
    secondary: "bg-secondary/5",
    accent: "bg-accent/5",
    success: "bg-success/5",
    error: "bg-error/5",
    warning: "bg-warning/5",
    info: "bg-info/5",
    neutral: "bg-neutral/5",
};

/* ─── Border ─────────────────────────────────────────────────────────────── */

export const semanticBorder: Record<BaselSemanticColor, string> = {
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent",
    success: "border-success",
    error: "border-error",
    warning: "border-warning",
    info: "border-info",
    neutral: "border-neutral",
};

/* ─── Status Pill (bg/10 + text) ─────────────────────────────────────────── */

/** Combined bg + text for status pills / badges. */
export const semanticPill: Record<BaselSemanticColor, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    error: "bg-error/10 text-error",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    neutral: "bg-base-300 text-base-content/50",
};

/* ─── DaisyUI Component Modifiers ────────────────────────────────────────── */

export const semanticBtn: Record<BaselInteractiveColor, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    success: "btn-success",
    error: "btn-error",
    warning: "btn-warning",
    info: "btn-info",
};

export const semanticToggle: Record<BaselInteractiveColor, string> = {
    primary: "toggle-primary",
    secondary: "toggle-secondary",
    accent: "toggle-accent",
    success: "toggle-success",
    error: "toggle-error",
    warning: "toggle-warning",
    info: "toggle-info",
};

export const semanticRadio: Record<BaselInteractiveColor, string> = {
    primary: "radio-primary",
    secondary: "radio-secondary",
    accent: "radio-accent",
    success: "radio-success",
    error: "radio-error",
    warning: "radio-warning",
    info: "radio-info",
};

export const semanticCheckbox: Record<BaselInteractiveColor, string> = {
    primary: "checkbox-primary",
    secondary: "checkbox-secondary",
    accent: "checkbox-accent",
    success: "checkbox-success",
    error: "checkbox-error",
    warning: "checkbox-warning",
    info: "checkbox-info",
};

/** Solid bg + content text — for chip/tag selections. */
export const semanticChip: Record<BaselInteractiveColor, string> = {
    primary: "bg-primary text-primary-content",
    secondary: "bg-secondary text-secondary-content",
    accent: "bg-accent text-accent-content",
    success: "bg-success text-success-content",
    error: "bg-error text-error-content",
    warning: "bg-warning text-warning-content",
    info: "bg-info text-info-content",
};
