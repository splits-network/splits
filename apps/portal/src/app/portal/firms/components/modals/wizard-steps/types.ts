"use client";

import type { PlacementType, TeamSizeRange } from "../../../types";

/* ─── Form Data ──────────────────────────────────────────────────────────── */

/**
 * Flat form state bag shared across all 5 wizard steps.
 * Maps 1:1 to the Firm PATCH body. All optional fields default to "".
 */
export interface FirmFormData {
    // Step 1 — Basics
    name: string;
    slug: string;
    slugManuallyEdited: boolean;
    tagline: string;
    description: string;

    // Step 2 — Specialization
    industries: string[];
    specialties: string[];
    placement_types: PlacementType[];
    geo_focus: string[];

    // Step 3 — Location & Details
    headquarters_city: string;
    headquarters_state: string;
    headquarters_country: string;
    founded_year: string; // string for controlled input, coerce to number on submit
    team_size_range: TeamSizeRange | "";

    // Step 4 — Contact & Social
    website_url: string;
    linkedin_url: string;
    contact_email: string;
    contact_phone: string;

    // Step 5 — Marketplace
    marketplace_visible: boolean;
    candidate_firm: boolean;
    company_firm: boolean;
    show_member_count: boolean;
    show_placement_stats: boolean;
    show_contact_info: boolean;
}

export const EMPTY_FIRM_FORM: FirmFormData = {
    name: "",
    slug: "",
    slugManuallyEdited: false,
    tagline: "",
    description: "",
    industries: [],
    specialties: [],
    placement_types: [],
    geo_focus: [],
    headquarters_city: "",
    headquarters_state: "",
    headquarters_country: "",
    founded_year: "",
    team_size_range: "",
    website_url: "",
    linkedin_url: "",
    contact_email: "",
    contact_phone: "",
    marketplace_visible: false,
    candidate_firm: false,
    company_firm: false,
    show_member_count: true,
    show_placement_stats: true,
    show_contact_info: true,
};
