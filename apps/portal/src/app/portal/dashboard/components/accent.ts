// ─── Memphis Accent Cycle (Tailwind classes, never hex) ─────────────────────

export const ACCENT = [
    { bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral/10", textOnBg: "text-white" },
    { bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal/10", textOnBg: "text-dark" },
    { bg: "bg-yellow", text: "text-yellow", border: "border-yellow", bgLight: "bg-yellow/10", textOnBg: "text-dark" },
    { bg: "bg-purple", text: "text-purple", border: "border-purple", bgLight: "bg-purple/10", textOnBg: "text-white" },
] as const;

export type AccentClasses = (typeof ACCENT)[number];

export function accentAt(idx: number): AccentClasses {
    return ACCENT[idx % ACCENT.length];
}

/** Map pipeline stages to Memphis accent colors */
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