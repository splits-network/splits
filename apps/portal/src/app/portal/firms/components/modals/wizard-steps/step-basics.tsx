"use client";

import { BaselFormField } from "@splits-network/basel-ui";
import type { FirmFormData } from "./types";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function toSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface StepBasicsProps {
    form: FirmFormData;
    onChange: (updates: Partial<FirmFormData>) => void;
    isEditMode: boolean;
    errors: Record<string, string>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Step 1 — Basics: Firm Name, Slug, Tagline, Description.
 * Single-column layout. Slug auto-derives from name until manually edited.
 */
export function StepBasics({ form, onChange, isEditMode, errors }: StepBasicsProps) {
    return (
        <div className="space-y-5">
            {/* Firm Name */}
            <BaselFormField label="Firm Name" required error={errors.name}>
                <input
                    type="text"
                    className={`input w-full bg-base-200 border-base-300 ${errors.name ? "border-error" : ""}`}
                    value={form.name}
                    onChange={(e) => {
                        const name = e.target.value;
                        const updates: Partial<FirmFormData> = { name };
                        if (!isEditMode && !form.slugManuallyEdited) {
                            updates.slug = toSlug(name);
                        }
                        onChange(updates);
                    }}
                    placeholder="e.g. Apex Recruiting Partners"
                />
            </BaselFormField>

            {/* URL Slug */}
            <BaselFormField
                label="URL Slug"
                hint="Public profile URL. Lowercase letters, numbers, and hyphens only."
                error={errors.slug}
            >
                <div className="flex items-center gap-0">
                    <span className="flex items-center h-10 px-3 bg-base-300 border border-base-300 border-r-0 text-sm text-base-content/40 shrink-0 whitespace-nowrap">
                        /firms/
                    </span>
                    <input
                        type="text"
                        className={`input w-full bg-base-200 border-base-300 ${errors.slug ? "border-error" : ""}`}
                        value={form.slug}
                        onChange={(e) =>
                            onChange({
                                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                                slugManuallyEdited: true,
                            })
                        }
                        placeholder="apex-recruiting-partners"
                    />
                </div>
            </BaselFormField>

            {/* Tagline — custom label with character counter */}
            <fieldset>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                        Tagline
                    </label>
                    <span
                        className={`text-xs font-semibold tabular-nums ${
                            form.tagline.length >= 140
                                ? "text-warning"
                                : "text-base-content/30"
                        }`}
                    >
                        {form.tagline.length}/160
                    </span>
                </div>
                <input
                    type="text"
                    className="input w-full bg-base-200 border-base-300"
                    value={form.tagline}
                    onChange={(e) => onChange({ tagline: e.target.value.slice(0, 160) })}
                    placeholder="e.g. Specialized fintech recruiting in NYC and London"
                    maxLength={160}
                />
                <p className="text-sm text-base-content/40 mt-1">
                    One-liner shown on cards and in search results.
                </p>
            </fieldset>

            {/* Description */}
            <BaselFormField
                label="Description"
                hint="Full profile description shown to potential split partners."
            >
                <textarea
                    className="textarea w-full bg-base-200 border-base-300 min-h-[120px]"
                    value={form.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Tell potential split partners about your firm, your approach, and what makes you great to work with..."
                    rows={5}
                />
            </BaselFormField>
        </div>
    );
}
