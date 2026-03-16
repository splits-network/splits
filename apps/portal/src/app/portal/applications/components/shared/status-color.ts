/* ─── Basel Status Colors (DaisyUI semantic tokens ONLY) ─────────────────── */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

/**
 * Maps AI fit score to BaselSemanticColor for use with BaselBadge.
 */
export function getAIScoreBadgeColor(score: number | null): BaselSemanticColor {
    if (score == null) return "neutral";
    if (score >= 90) return "success";
    if (score >= 70) return "primary";
    if (score >= 50) return "warning";
    return "error";
}
