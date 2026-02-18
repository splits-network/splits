import type { AccentColor } from "@splits-network/memphis-ui";
import { getAccentColor } from "@splits-network/memphis-ui";

// ─── Memphis Accent Cycle (Tailwind classes, never hex) ─────────────────────
// Extends memphis-ui AccentColor with Tailwind class strings for direct use

export interface AccentClasses {
    name: AccentColor;
    bg: string;
    text: string;
    border: string;
    bgLight: string;
    textOnBg: string;
}

const ACCENT_MAP: Record<AccentColor, AccentClasses> = {
    coral: { name: "coral", bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral-light", textOnBg: "text-white" },
    teal: { name: "teal", bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal-light", textOnBg: "text-dark" },
    yellow: { name: "yellow", bg: "bg-yellow", text: "text-yellow", border: "border-yellow", bgLight: "bg-yellow-light", textOnBg: "text-dark" },
    purple: { name: "purple", bg: "bg-purple", text: "text-purple", border: "border-purple", bgLight: "bg-purple-light", textOnBg: "text-white" },
};

export const ACCENT = [
    ACCENT_MAP.coral,
    ACCENT_MAP.teal,
    ACCENT_MAP.yellow,
    ACCENT_MAP.purple,
] as const;

export type ViewMode = "table" | "grid" | "split";

export function accentAt(idx: number): AccentClasses {
    return ACCENT_MAP[getAccentColor(idx)];
}

export function statusAccent(status?: string): AccentClasses {
    switch (status) {
        case "active":
            return ACCENT_MAP.teal;
        case "inactive":
            return ACCENT_MAP.coral;
        case "pending":
            return ACCENT_MAP.yellow;
        default:
            return ACCENT_MAP.teal;
    }
}

export function statusVariant(status?: string): AccentColor {
    switch (status) {
        case "active": return "teal";
        case "inactive": return "coral";
        case "pending": return "yellow";
        default: return "teal";
    }
}
