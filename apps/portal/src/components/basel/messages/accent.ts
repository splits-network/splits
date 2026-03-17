/**
 * Basel accent system — DaisyUI semantic tokens only.
 * Replaces Memphis named colors (coral, teal, yellow, purple) with
 * DaisyUI semantic classes (primary, secondary, accent, neutral).
 */

export const ACCENT = [
    { bg: "bg-primary", text: "text-primary", border: "border-primary", bgLight: "bg-primary/10", textOnBg: "text-primary-content" },
    { bg: "bg-secondary", text: "text-secondary", border: "border-secondary", bgLight: "bg-secondary/10", textOnBg: "text-secondary-content" },
    { bg: "bg-accent", text: "text-accent", border: "border-accent", bgLight: "bg-accent/10", textOnBg: "text-accent-content" },
    { bg: "bg-neutral", text: "text-neutral", border: "border-neutral", bgLight: "bg-neutral/10", textOnBg: "text-neutral-content" },
] as const;

export type AccentClasses = (typeof ACCENT)[number];

export function accentAt(idx: number): AccentClasses {
    return ACCENT[idx % ACCENT.length];
}
