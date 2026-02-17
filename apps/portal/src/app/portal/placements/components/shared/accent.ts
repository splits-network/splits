// ─── Memphis Accent Cycle (Tailwind classes, never hex) ─────────────────────

import { AnyMemphisColor } from "@splits-network/memphis-ui";

export const ACCENT = [
    { bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral-light", textOnBg: "text-white" },
    { bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal-light", textOnBg: "text-dark" },
    { bg: "bg-yellow", text: "text-yellow", border: "border-yellow", bgLight: "bg-yellow-light", textOnBg: "text-dark" },
    { bg: "bg-purple", text: "text-purple", border: "border-purple", bgLight: "bg-purple-light", textOnBg: "text-white" },
] as const;

export type AccentClasses = (typeof ACCENT)[number];

export type ViewMode = "table" | "grid" | "split";

export function accentAt(idx: number): AccentClasses {
    return ACCENT[idx % ACCENT.length];
}

export function statusAccent(status?: string): AccentClasses {
    switch (status?.toLowerCase()) {
        case "hired":
            return ACCENT[1]; // teal
        case "active":
            return ACCENT[1]; // teal
        case "completed":
            return ACCENT[3]; // purple
        case "pending_payout":
            return ACCENT[2]; // yellow
        case "failed":
            return ACCENT[0]; // coral
        default:
            return ACCENT[1];
    }
}

export function statusVariant(status?: string): AnyMemphisColor {
    switch (status) {
        case "hired": return "teal";
        case "active": return "teal";
        case "completed": return "purple";
        case "pending_payout": return "yellow";
        case "failed": return "coral";
        default: return "teal";
    }
}
