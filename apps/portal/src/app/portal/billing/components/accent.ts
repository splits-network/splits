// ─── Memphis Accent Cycle (Tailwind classes, never hex) ─────────────────────

export const ACCENT = [
    { bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral-light", textOnBg: "text-white" },
    { bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal-light", textOnBg: "text-dark" },
    { bg: "bg-yellow", text: "text-yellow", border: "border-yellow", bgLight: "bg-yellow-light", textOnBg: "text-dark" },
    { bg: "bg-purple", text: "text-purple", border: "border-purple", bgLight: "bg-purple-light", textOnBg: "text-white" },
] as const;

export type AccentClasses = (typeof ACCENT)[number];

export type BillingTab = "subscription" | "payment" | "history" | "payouts" | "company";

export function accentAt(idx: number): AccentClasses {
    return ACCENT[idx % ACCENT.length];
}

export function subscriptionStatusAccent(status?: string): AccentClasses {
    switch (status) {
        case "active":
            return ACCENT[1]; // teal
        case "past_due":
            return ACCENT[0]; // coral
        case "trialing":
            return ACCENT[3]; // purple
        case "canceled":
            return ACCENT[2]; // yellow
        case "incomplete":
            return ACCENT[0]; // coral
        default:
            return ACCENT[1];
    }
}

export function subscriptionStatusVariant(status?: string): "teal" | "coral" | "yellow" | "purple" {
    switch (status) {
        case "active": return "teal";
        case "past_due": return "coral";
        case "trialing": return "purple";
        case "canceled": return "yellow";
        case "incomplete": return "coral";
        default: return "teal";
    }
}

export function invoiceStatusVariant(status?: string): "teal" | "coral" | "yellow" | "purple" | "dark" {
    switch (status) {
        case "paid": return "teal";
        case "open": return "yellow";
        case "void": return "dark";
        case "uncollectible": return "coral";
        case "draft": return "dark";
        default: return "dark";
    }
}
