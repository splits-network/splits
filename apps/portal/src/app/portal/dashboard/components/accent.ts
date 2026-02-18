// ─── Memphis Accent Cycle (uses package utilities) ──────────────────────────
import {
    ACCENT_COLORS,
    getAccentColor,
    type AccentColor,
} from '@splits-network/memphis-ui';

/**
 * Per-index accent class bundles — maps AccentColor names to Tailwind classes.
 * Consumer code references ACCENT[i].bg, .text, .border etc.
 */
export interface AccentClasses {
    readonly bg: string;
    readonly text: string;
    readonly border: string;
    readonly bgLight: string;
    readonly textOnBg: string;
    readonly gradientFrom: string;
    readonly gradientTo: string;
}

const COLOR_MAP: Record<AccentColor, AccentClasses> = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral/10", textOnBg: "text-coral-content", gradientFrom: "from-coral", gradientTo: "to-coral/10" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal/10", textOnBg: "text-teal-content", gradientFrom: "from-teal", gradientTo: "to-teal/10" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow", bgLight: "bg-yellow/10", textOnBg: "text-yellow-content", gradientFrom: "from-yellow", gradientTo: "to-yellow/10" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple", bgLight: "bg-purple/10", textOnBg: "text-purple-content", gradientFrom: "from-purple", gradientTo: "to-purple/10" },
};

/** Ordered accent array — indexes match ACCENT_COLORS from the package. */
export const ACCENT: readonly AccentClasses[] = ACCENT_COLORS.map(c => COLOR_MAP[c]);

/** Get accent class bundle by cycling index. */
export function accentAt(idx: number): AccentClasses {
    return COLOR_MAP[getAccentColor(idx)];
}

/** Map AccentColor name to class bundle. */
export function accentFor(color: AccentColor): AccentClasses {
    return COLOR_MAP[color];
}

/** Map pipeline stages to Memphis accent colors. */
export function stageAccent(stage: string): AccentClasses {
    switch (stage.toLowerCase()) {
        case "screen":
        case "submitted":
            return ACCENT[1]; // teal
        case "interview":
            return ACCENT[0]; // coral
        case "offer":
            return ACCENT[2]; // yellow
        case "hired":
        case "placed":
            return ACCENT[3]; // purple
        default:
            return ACCENT[1]; // teal
    }
}
