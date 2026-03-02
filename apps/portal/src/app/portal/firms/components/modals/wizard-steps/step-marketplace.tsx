"use client";

import { BaselToggleRow } from "@splits-network/basel-ui";
import type { FirmFormData } from "./types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface StepMarketplaceProps {
    form: FirmFormData;
    onChange: (updates: Partial<FirmFormData>) => void;
    errors: Record<string, string>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Step 5 — Marketplace: 6 toggles grouped into two visual sections.
 *
 * Layout:
 * - Section A: "Marketplace Presence" — 3 visibility/participation toggles
 *   (marketplace_visible, seeking_split_partners, accepts_candidate_submissions)
 * - Section B: "Profile Visibility" — 3 display-control toggles
 *   (show_member_count, show_placement_stats, show_contact_info)
 *
 * UX: The marketplace_visible toggle is the master switch. When off, the other
 * participation toggles are still editable (they persist their values for when
 * visibility is turned on) but a dim note explains the profile won't appear.
 */
export function StepMarketplace({ form, onChange, errors }: StepMarketplaceProps) {
    return (
        <div className="space-y-2">
            {/* Section A: Marketplace Presence */}
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/30 pb-1">
                Marketplace Presence
            </p>

            <BaselToggleRow
                label="List firm on marketplace"
                description="Your firm profile becomes discoverable to other recruiters and companies."
                checked={form.marketplace_visible}
                onChange={(v) => onChange({ marketplace_visible: v })}
                color="primary"
            />

            {!form.marketplace_visible && (
                <p className="text-sm text-base-content/40 flex items-start gap-2 py-1 px-1">
                    <i className="fa-duotone fa-regular fa-eye-slash mt-0.5 shrink-0" />
                    Your firm is currently unlisted. Turn on listing above to appear in the marketplace.
                </p>
            )}

            <BaselToggleRow
                label="Seeking split partners"
                description="Signal to the network that you're open to incoming split proposals."
                checked={form.seeking_split_partners}
                onChange={(v) => onChange({ seeking_split_partners: v })}
                color="secondary"
            />

            <BaselToggleRow
                label="Accept candidate submissions"
                description="Allow other recruiters to submit candidates against your open jobs."
                checked={form.accepts_candidate_submissions}
                onChange={(v) => onChange({ accepts_candidate_submissions: v })}
                color="secondary"
            />

            <div className="border-t border-base-300 mt-4 mb-2" />

            {/* Section B: Profile Visibility */}
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/30 pb-1">
                Profile Visibility
            </p>

            <BaselToggleRow
                label="Show member count"
                description="Display the number of active members on your public profile."
                checked={form.show_member_count}
                onChange={(v) => onChange({ show_member_count: v })}
                color="primary"
            />

            <BaselToggleRow
                label="Show placement stats"
                description="Display total placements and revenue metrics on your profile."
                checked={form.show_placement_stats}
                onChange={(v) => onChange({ show_placement_stats: v })}
                color="primary"
            />

            <BaselToggleRow
                label="Show contact info"
                description="Display your email and phone to other logged-in recruiters."
                checked={form.show_contact_info}
                onChange={(v) => onChange({ show_contact_info: v })}
                color="primary"
            />

        </div>
    );
}
