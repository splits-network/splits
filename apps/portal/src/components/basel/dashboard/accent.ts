/**
 * Basel dashboard accent system — DaisyUI semantic tokens only.
 * No Memphis colors (coral, teal, yellow, purple).
 */

export interface AccentClasses {
    readonly bg: string;
    readonly text: string;
    readonly border: string;
    readonly bgLight: string;
    readonly textOnBg: string;
}

export const ACCENT: readonly AccentClasses[] = [
    { bg: "bg-primary", text: "text-primary", border: "border-primary", bgLight: "bg-primary/10", textOnBg: "text-primary-content" },
    { bg: "bg-secondary", text: "text-secondary", border: "border-secondary", bgLight: "bg-secondary/10", textOnBg: "text-secondary-content" },
    { bg: "bg-accent", text: "text-accent", border: "border-accent", bgLight: "bg-accent/10", textOnBg: "text-accent-content" },
    { bg: "bg-info", text: "text-info", border: "border-info", bgLight: "bg-info/10", textOnBg: "text-info-content" },
    { bg: "bg-success", text: "text-success", border: "border-success", bgLight: "bg-success/10", textOnBg: "text-success-content" },
    { bg: "bg-warning", text: "text-warning", border: "border-warning", bgLight: "bg-warning/10", textOnBg: "text-warning-content" },
    { bg: "bg-error", text: "text-error", border: "border-error", bgLight: "bg-error/10", textOnBg: "text-error-content" },
    { bg: "bg-neutral", text: "text-neutral", border: "border-neutral", bgLight: "bg-neutral/10", textOnBg: "text-neutral-content" },
] as const;

/** Get accent class bundle by cycling index. */
export function accentAt(idx: number): AccentClasses {
    return ACCENT[idx % ACCENT.length];
}

/** Map pipeline stages to DaisyUI semantic colors. */
export function stageAccent(stage: string): AccentClasses {
    switch (stage.toLowerCase()) {
        case "screen":
        case "submitted":
            return ACCENT[3]; // info
        case "interview":
            return ACCENT[0]; // primary
        case "offer":
            return ACCENT[5]; // warning
        case "hired":
        case "placed":
            return ACCENT[4]; // success
        default:
            return ACCENT[3]; // info
    }
}
