"use client";

import { BaselFormField, BaselChipGroup, WizardHelpZone } from "@splits-network/basel-ui";
import type { PlacementType } from "../../../types";
import type { FirmFormData } from "./types";
import { TagInput } from "./tag-input";
import {
    INDUSTRY_OPTIONS,
    SPECIALTY_OPTIONS,
    PLACEMENT_TYPE_OPTIONS,
} from "./constants";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface StepSpecializationProps {
    form: FirmFormData;
    onChange: (updates: Partial<FirmFormData>) => void;
    errors: Record<string, string>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Step 2 — Specialization: Industries, Specialties, Placement Types, Geo Focus.
 *
 * Layout: single column, each field separated by a subtle rule.
 * Industries + Specialties use BaselChipGroup (preset options, multi-select).
 * Placement Types use BaselChipGroup with the typed enum values.
 * Geo Focus uses TagInput (free-form, no preset list).
 */
export function StepSpecialization({ form, onChange, errors }: StepSpecializationProps) {
    const placementTypeLabels = PLACEMENT_TYPE_OPTIONS.map((o) => o.label);
    const selectedPlacementLabels = form.placement_types.map(
        (v) => PLACEMENT_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v,
    );

    const handlePlacementChange = (selectedLabels: string[]) => {
        const values = selectedLabels
            .map((label) => PLACEMENT_TYPE_OPTIONS.find((o) => o.label === label)?.value)
            .filter(Boolean) as PlacementType[];
        onChange({ placement_types: values });
    };

    return (
        <div className="space-y-7">
            {/* Industries */}
            <WizardHelpZone
                title="Industries"
                description="Select the industry verticals your firm recruits in. This helps potential split partners find you when they need coverage in a specific sector."
                icon="fa-duotone fa-regular fa-industry"
                tips={[
                    "Select all industries where you have active clients or placements",
                    "Being specific helps you match with the right partners — avoid selecting everything",
                    "You can update these anytime as your firm grows into new verticals",
                ]}
            >
                <div>
                    <BaselFormField
                        label="Industries"
                        hint="Which verticals does your firm recruit in?"
                        error={errors.industries}
                    >
                        <BaselChipGroup
                            options={INDUSTRY_OPTIONS}
                            selected={form.industries}
                            onChange={(industries) => onChange({ industries })}
                            color="primary"
                        />
                    </BaselFormField>
                </div>
            </WizardHelpZone>

            <div className="border-t border-base-300" />

            {/* Specialties */}
            <WizardHelpZone
                title="Specialties"
                description="Define the functional areas and role types your team specializes in. Partners use this to gauge whether your expertise complements theirs."
                icon="fa-duotone fa-regular fa-bullseye"
                tips={[
                    "Focus on your strongest areas — quality over quantity",
                    "Complementary specialties make the best split partnerships",
                    "Think about what roles your team fills most often",
                ]}
            >
                <div>
                    <BaselFormField
                        label="Specialties"
                        hint="Which functions or roles do you specialize in?"
                        error={errors.specialties}
                    >
                        <BaselChipGroup
                            options={SPECIALTY_OPTIONS}
                            selected={form.specialties}
                            onChange={(specialties) => onChange({ specialties })}
                            color="secondary"
                        />
                    </BaselFormField>
                </div>
            </WizardHelpZone>

            <div className="border-t border-base-300" />

            {/* Placement Types */}
            <WizardHelpZone
                title="Placement Types"
                description="Indicate the types of engagements your firm handles. This ensures you're matched with partners who work the same way."
                icon="fa-duotone fa-regular fa-handshake"
                tips={[
                    "Most split deals happen around direct hire — make sure to select it if applicable",
                    "Contract and temp placements often have different fee structures",
                    "Selecting multiple types broadens your partnership opportunities",
                ]}
            >
                <div>
                    <BaselFormField
                        label="Placement Types"
                        hint="What types of placements does your firm make?"
                        error={errors.placement_types}
                    >
                        <BaselChipGroup
                            options={placementTypeLabels}
                            selected={selectedPlacementLabels}
                            onChange={handlePlacementChange}
                            color="accent"
                        />
                    </BaselFormField>
                </div>
            </WizardHelpZone>

            <div className="border-t border-base-300" />

            {/* Geo Focus — free-form tag input */}
            <WizardHelpZone
                title="Geographic Focus"
                description="Define the regions where your firm actively places candidates. This is free-form so you can be as broad or specific as needed."
                icon="fa-duotone fa-regular fa-map-location-dot"
                tips={[
                    "Use region names like 'Northeast US', 'EMEA', or 'APAC' for broad coverage",
                    "Add 'Remote' if you place remote candidates regardless of location",
                    "Be specific to attract partners who need coverage in your exact markets",
                ]}
            >
                <div>
                    <BaselFormField
                        label="Geographic Focus"
                        hint='Add the regions where you actively place candidates. Press Enter or comma after each tag — e.g. "Southeast US", "EMEA", "Remote".'
                        error={errors.geo_focus}
                    >
                        <TagInput
                            tags={form.geo_focus}
                            onChange={(geo_focus) => onChange({ geo_focus })}
                            placeholder='e.g. Northeast US, EMEA, APAC, Remote...'
                        />
                    </BaselFormField>
                </div>
            </WizardHelpZone>
        </div>
    );
}
