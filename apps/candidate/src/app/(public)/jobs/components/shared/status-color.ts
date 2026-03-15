/**
 * Basel status color system -- DaisyUI semantic tokens only.
 * Use statusSemanticColor() with BaselBadge for all status display.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

export type ViewMode = "table" | "grid" | "split";

/** Status -> BaselBadge semantic color name */
export function statusSemanticColor(status?: string): BaselSemanticColor {
    switch (status) {
        case "active":
            return "success";
        case "paused":
            return "warning";
        case "filled":
            return "info";
        default:
            return "neutral";
    }
}
