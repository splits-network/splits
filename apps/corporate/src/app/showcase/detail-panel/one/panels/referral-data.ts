/* ─── Mock Data: Referral Code Panel ─────────────────────────────────── */

import type { PanelStat } from "./panel-header";

/**
 * Maps to RecruiterCode type from portal/referral-codes/types.ts
 * plus enriched display fields from helpers and table-row.
 */

export const data = {
    /* ── Identity ────────────────────────────────────────────────────── */
    id: "rc_01J8K2M4N5P6Q7R8S9T0",
    code: "APEX-2026-VIP",
    label: "Spring Recruiting Campaign",
    status: "active" as "active" | "inactive",
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-03-01T14:22:00Z",

    /* ── Creator ─────────────────────────────────────────────────────── */
    creatorName: "Sarah Mitchell",
    creatorInitials: "SM",

    /* ── Stats ────────────────────────────────────────────────────────── */
    stats: [
        { label: "Signups", value: "28", icon: "fa-duotone fa-regular fa-user-plus" },
        { label: "Active", value: "Active", icon: "fa-duotone fa-regular fa-circle-check" },
        { label: "Created", value: "Jan 15", icon: "fa-duotone fa-regular fa-calendar" },
    ] as PanelStat[],

    /* ── Usage ────────────────────────────────────────────────────────── */
    usageCount: 28,
    shareLink: "https://splits.network?rec_code=APEX-2026-VIP",

    /* ── Detailed usage stats (enriched for showcase) ────────────────── */
    usageStats: {
        totalClicks: 82,
        uniqueVisitors: 64,
        signups: 28,
        conversions: 12,
    },

    /* ── Settings ─────────────────────────────────────────────────────── */
    settings: {
        expiryDate: "Jun 30, 2026",
        maxUses: 100,
        usesRemaining: 72,
        commission: "15%",
    },

    /* ── Recent signups (showcase enrichment) ────────────────────────── */
    recentSignups: [
        { name: "Jordan Davis", date: "Mar 1, 2026", status: "converted" },
        { name: "Priya Patel", date: "Feb 28, 2026", status: "signed-up" },
        { name: "Marcus Chen", date: "Feb 25, 2026", status: "converted" },
        { name: "Aisha Johnson", date: "Feb 22, 2026", status: "signed-up" },
        { name: "Tomás García", date: "Feb 19, 2026", status: "converted" },
    ],
};
