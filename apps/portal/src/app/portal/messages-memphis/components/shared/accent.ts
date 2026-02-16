export const ACCENT = [
    { bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral-light", textOnBg: "text-white" },
    { bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal-light", textOnBg: "text-dark" },
    { bg: "bg-yellow", text: "text-yellow", border: "border-yellow", bgLight: "bg-yellow-light", textOnBg: "text-dark" },
    { bg: "bg-purple", text: "text-purple", border: "border-purple", bgLight: "bg-purple-light", textOnBg: "text-white" },
] as const;

export type AccentClasses = (typeof ACCENT)[number];

export function accentAt(idx: number): AccentClasses {
    return ACCENT[idx % ACCENT.length];
}

