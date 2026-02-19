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
        case "active":
            return ACCENT[1]; // teal
        case "filled":
            return ACCENT[0]; // coral
        case "paused":
            return ACCENT[2]; // yellow
        case "closed":
            return ACCENT[3]; // purple
        default:
            return ACCENT[1];
    }
}

export function statusVariant(status?: string): "teal" | "coral" | "yellow" | "purple" {
    switch (status) {
        case "active": return "teal";
        case "filled": return "coral";
        case "paused": return "yellow";
        case "closed": return "purple";
        default: return "teal";
    }
}
