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

export function statusAccent(status?: string | null): AccentClasses {
    switch (status) {
        case "verified":
            return ACCENT[1]; // teal
        case "pending":
            return ACCENT[2]; // yellow
        case "unverified":
            return ACCENT[3]; // purple
        case "rejected":
            return ACCENT[0]; // coral
        default:
            return ACCENT[1];
    }
}

export function statusVariant(status?: string | null): "teal" | "coral" | "yellow" | "purple" {
    switch (status) {
        case "verified": return "teal";
        case "pending": return "yellow";
        case "unverified": return "purple";
        case "rejected": return "coral";
        default: return "teal";
    }
}
