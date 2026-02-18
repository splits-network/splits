// ─── Memphis Accent Cycle (Tailwind classes, never hex) ─────────────────────

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
    switch (status) {
        case "pending":
            return ACCENT[2]; // yellow
        case "accepted":
            return ACCENT[1]; // teal
        case "expired":
            return ACCENT[3]; // purple
        case "revoked":
            return ACCENT[0]; // coral
        default:
            return ACCENT[2];
    }
}

export function statusVariant(status?: string): "teal" | "coral" | "yellow" | "purple" {
    switch (status) {
        case "pending": return "yellow";
        case "accepted": return "teal";
        case "expired": return "purple";
        case "revoked": return "coral";
        default: return "yellow";
    }
}
