"use client";

import { BaselFormField, BaselChipGroup } from "@splits-network/basel-ui";
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

            <div className="border-t border-base-300" />

            {/* Specialties */}
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

            <div className="border-t border-base-300" />

            {/* Placement Types */}
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

            <div className="border-t border-base-300" />

            {/* Geo Focus — free-form tag input */}
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
        </div>
    );
}
