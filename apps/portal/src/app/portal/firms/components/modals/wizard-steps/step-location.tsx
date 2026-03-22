"use client";

import { BaselFormField, WizardHelpZone } from "@splits-network/basel-ui";
import type { TeamSizeRange } from "../../../types";
import type { FirmFormData } from "./types";
import { TEAM_SIZE_OPTIONS } from "./constants";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface StepLocationProps {
    form: FirmFormData;
    onChange: (updates: Partial<FirmFormData>) => void;
    errors: Record<string, string>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Step 3 — Location & Details: City, State, Country, Founded Year, Team Size.
 *
 * Layout:
 * - Row 1: City + State (2-column grid) — most common edits, paired logically
 * - Row 2: Country (full width) — its own row for international clarity
 * - Divider
 * - Row 3: Founded Year + Team Size (2-column grid) — firm profile metadata
 */
export function StepLocation({ form, onChange, errors }: StepLocationProps) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="space-y-5">
            <WizardHelpZone
                title="Headquarters Location"
                description="Where your firm is based. This appears on your profile and helps partners find firms in their region or time zone."
                icon="fa-duotone fa-regular fa-location-dot"
                tips={[
                    "Use your primary office location, even if your team is distributed",
                    "Partners often filter by location to find nearby firms for local market coverage",
                    "For fully remote firms, use the city where your firm is legally registered",
                ]}
                className="space-y-5"
            >
                {/* City + State — side by side */}
                <div className="grid grid-cols-2 gap-4">
                    <BaselFormField label="City" error={errors.headquarters_city}>
                        <input
                            type="text"
                            className={`input w-full bg-base-200 border-base-300 ${errors.headquarters_city ? "border-error" : ""}`}
                            value={form.headquarters_city}
                            onChange={(e) => onChange({ headquarters_city: e.target.value })}
                            placeholder="New York"
                        />
                    </BaselFormField>

                    <BaselFormField label="State / Province" error={errors.headquarters_state}>
                        <input
                            type="text"
                            className={`input w-full bg-base-200 border-base-300 ${errors.headquarters_state ? "border-error" : ""}`}
                            value={form.headquarters_state}
                            onChange={(e) => onChange({ headquarters_state: e.target.value })}
                            placeholder="NY"
                        />
                    </BaselFormField>
                </div>

                {/* Country — full width */}
                <BaselFormField label="Country" error={errors.headquarters_country}>
                    <input
                        type="text"
                        className={`input w-full bg-base-200 border-base-300 ${errors.headquarters_country ? "border-error" : ""}`}
                        value={form.headquarters_country}
                        onChange={(e) => onChange({ headquarters_country: e.target.value })}
                        placeholder="United States"
                    />
                </BaselFormField>
            </WizardHelpZone>

            <div className="border-t border-base-300" />

            <WizardHelpZone
                title="Firm Details"
                description="Basic details about your firm's history and size. These help potential partners understand your experience and capacity."
                icon="fa-duotone fa-regular fa-chart-simple"
                tips={[
                    "Established firms often attract more split proposals — don't skip the founding year",
                    "Team size helps partners gauge your capacity for handling split placements",
                    "These details build trust and credibility on your marketplace profile",
                ]}
            >
                {/* Founded Year + Team Size — side by side */}
                <div className="grid grid-cols-2 gap-4">
                    <BaselFormField
                        label="Founded Year"
                        hint={`Between 1900 and ${currentYear}`}
                        error={errors.founded_year}
                    >
                        <input
                            type="number"
                            className={`input w-full bg-base-200 border-base-300 ${errors.founded_year ? "border-error" : ""}`}
                            value={form.founded_year}
                            onChange={(e) => onChange({ founded_year: e.target.value })}
                            placeholder={String(currentYear)}
                            min={1900}
                            max={currentYear}
                        />
                    </BaselFormField>

                    <BaselFormField
                        label="Team Size"
                        hint="Total headcount including all members."
                        error={errors.team_size_range}
                    >
                        <select
                            className={`select w-full bg-base-200 border-base-300 ${errors.team_size_range ? "border-error" : ""}`}
                            value={form.team_size_range}
                            onChange={(e) =>
                                onChange({ team_size_range: e.target.value as TeamSizeRange | "" })
                            }
                        >
                            <option value="">Select size</option>
                            {TEAM_SIZE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </BaselFormField>
                </div>
            </WizardHelpZone>
        </div>
    );
}
