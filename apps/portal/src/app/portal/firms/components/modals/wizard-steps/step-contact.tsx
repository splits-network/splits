"use client";

import { BaselFormField } from "@splits-network/basel-ui";
import type { FirmFormData } from "./types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface StepContactProps {
    form: FirmFormData;
    onChange: (updates: Partial<FirmFormData>) => void;
    errors: Record<string, string>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Step 4 — Contact & Social: Website, LinkedIn, Email, Phone.
 *
 * Layout: single column throughout.
 * Website and LinkedIn are grouped visually as "online presence" with a subtle
 * divider before Email and Phone as "direct contact".
 * All fields are optional — no required markers — but Email is validated for
 * format if provided.
 */
export function StepContact({ form, onChange, errors }: StepContactProps) {
    return (
        <div className="space-y-5">
            {/* Section: Online Presence */}
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/30">
                Online Presence
            </p>

            <BaselFormField
                label="Website"
                hint="Include https:// — e.g. https://apexrecruiting.com"
                error={errors.website_url}
            >
                <div className="flex items-center gap-0">
                    <span className="flex items-center h-10 px-3 bg-base-300 border border-base-300 border-r-0 text-sm text-base-content/40 shrink-0">
                        <i className="fa-duotone fa-regular fa-globe" />
                    </span>
                    <input
                        type="url"
                        className={`input w-full bg-base-200 border-base-300 ${errors.website_url ? "border-error" : ""}`}
                        value={form.website_url}
                        onChange={(e) => onChange({ website_url: e.target.value })}
                        placeholder="https://yourfirm.com"
                    />
                </div>
            </BaselFormField>

            <BaselFormField
                label="LinkedIn"
                hint="Your firm's LinkedIn company page URL."
                error={errors.linkedin_url}
            >
                <div className="flex items-center gap-0">
                    <span className="flex items-center h-10 px-3 bg-base-300 border border-base-300 border-r-0 text-sm text-base-content/40 shrink-0">
                        <i className="fa-brands fa-linkedin" />
                    </span>
                    <input
                        type="url"
                        className={`input w-full bg-base-200 border-base-300 ${errors.linkedin_url ? "border-error" : ""}`}
                        value={form.linkedin_url}
                        onChange={(e) => onChange({ linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/company/your-firm"
                    />
                </div>
            </BaselFormField>

            <div className="border-t border-base-300" />

            {/* Section: Direct Contact */}
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/30">
                Direct Contact
            </p>

            <BaselFormField
                label="Contact Email"
                hint="Shown to other recruiters when contact info is visible."
                error={errors.contact_email}
            >
                <div className="flex items-center gap-0">
                    <span className="flex items-center h-10 px-3 bg-base-300 border border-base-300 border-r-0 text-sm text-base-content/40 shrink-0">
                        <i className="fa-duotone fa-regular fa-envelope" />
                    </span>
                    <input
                        type="email"
                        className={`input w-full bg-base-200 border-base-300 ${errors.contact_email ? "border-error" : ""}`}
                        value={form.contact_email}
                        onChange={(e) => onChange({ contact_email: e.target.value })}
                        placeholder="hello@yourfirm.com"
                    />
                </div>
            </BaselFormField>

            <BaselFormField
                label="Phone"
                hint="Optional. Include country code for international numbers."
                error={errors.contact_phone}
            >
                <div className="flex items-center gap-0">
                    <span className="flex items-center h-10 px-3 bg-base-300 border border-base-300 border-r-0 text-sm text-base-content/40 shrink-0">
                        <i className="fa-duotone fa-regular fa-phone" />
                    </span>
                    <input
                        type="tel"
                        className={`input w-full bg-base-200 border-base-300 ${errors.contact_phone ? "border-error" : ""}`}
                        value={form.contact_phone}
                        onChange={(e) => onChange({ contact_phone: e.target.value })}
                        placeholder="+1 (212) 555-0100"
                    />
                </div>
            </BaselFormField>
        </div>
    );
}
