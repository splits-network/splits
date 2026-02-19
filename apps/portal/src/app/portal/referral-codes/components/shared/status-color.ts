/**
 * Basel status color system for referral codes.
 * Uses DaisyUI semantic tokens only.
 */

import type { RecruiterCode } from "../../types";

/** Code status -> DaisyUI semantic badge/text classes */
export function statusColor(code: RecruiterCode): string {
    if (code.status === "active") return "bg-success/15 text-success";
    return "bg-base-content/15 text-base-content/50";
}

/** Code status -> border color class */
export function statusBorder(code: RecruiterCode): string {
    if (code.status === "active") return "border-l-success";
    return "border-l-base-content/30";
}
