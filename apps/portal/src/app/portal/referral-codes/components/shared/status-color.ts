/**
 * Basel status color system for referral codes.
 * Uses DaisyUI semantic badge classes only.
 */

import type { RecruiterCode } from "../../types";

/** Code status -> DaisyUI badge class for BaselBadge / PanelHeader */
export function statusBadgeClass(code: RecruiterCode): string {
    if (code.status === "active") return "badge-success";
    return "badge-ghost";
}

/** Code status -> BaselBadge semantic color */
export function statusColorName(code: RecruiterCode): "success" | "neutral" {
    if (code.status === "active") return "success";
    return "neutral";
}

/** Code status -> border color class (left accent on cards) */
export function statusBorder(code: RecruiterCode): string {
    if (code.status === "active") return "border-l-success";
    return "border-l-base-content/30";
}
