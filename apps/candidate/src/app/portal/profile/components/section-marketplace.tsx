import { MarkdownEditor } from "@splits-network/shared-ui";
import {
    CandidateSettings,
    INDUSTRY_OPTIONS,
    SPECIALTY_OPTIONS,
} from "./types";

interface SectionMarketplaceProps {
    settings: CandidateSettings;
    onUpdate: (updates: Partial<CandidateSettings>) => void;
}

export function SectionMarketplace({
    settings,
    onUpdate,
}: SectionMarketplaceProps) {
    const toggleIndustry = (industry: string) => {
        const industries = settings.marketplace_profile?.industries || [];
        const updated = industries.includes(industry)
            ? industries.filter((i) => i !== industry)
            : [...industries, industry];
        onUpdate({
            marketplace_profile: {
                ...settings.marketplace_profile,
                industries: updated,
            },
        });
    };

    const toggleSpecialty = (specialty: string) => {
        const specialties = settings.marketplace_profile?.specialties || [];
        const updated = specialties.includes(specialty)
            ? specialties.filter((s) => s !== specialty)
            : [...specialties, specialty];
        onUpdate({
            marketplace_profile: {
                ...settings.marketplace_profile,
                specialties: updated,
            },
        });
    };

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Marketplace
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Control your visibility and how you appear to recruiters.
            </p>

            {/* Visibility */}
            <div className="mb-8 pb-8 border-b border-base-300">
                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Visibility
                    </label>
                    <select
                        className="select w-full"
                        value={settings.marketplace_visibility || "public"}
                        onChange={(e) =>
                            onUpdate({
                                marketplace_visibility: e.target.value as
                                    | "public"
                                    | "limited"
                                    | "hidden",
                            })
                        }
                    >
                        <option value="public">
                            Public - Visible to all recruiters
                        </option>
                        <option value="limited">
                            Limited - Visible to connected recruiters only
                        </option>
                        <option value="hidden">
                            Hidden - Not visible in marketplace
                        </option>
                    </select>
                </fieldset>
            </div>

            {/* Industries */}
            <div className="mb-8 pb-8 border-b border-base-300">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
                    Industries
                </h3>
                <p className="text-sm text-base-content/50 mb-3">
                    Select the industries you&apos;re interested in
                </p>
                <div className="flex flex-wrap gap-2">
                    {INDUSTRY_OPTIONS.map((industry) => (
                        <button
                            key={industry}
                            type="button"
                            className={`btn btn-sm ${
                                (
                                    settings.marketplace_profile?.industries ||
                                    []
                                ).includes(industry)
                                    ? "btn-primary"
                                    : "btn-outline"
                            }`}
                            onClick={() => toggleIndustry(industry)}
                        >
                            {industry}
                        </button>
                    ))}
                </div>
            </div>

            {/* Specialties */}
            <div className="mb-8 pb-8 border-b border-base-300">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
                    Specialties
                </h3>
                <p className="text-sm text-base-content/50 mb-3">
                    Select the roles/functions you specialize in
                </p>
                <div className="flex flex-wrap gap-2">
                    {SPECIALTY_OPTIONS.map((specialty) => (
                        <button
                            key={specialty}
                            type="button"
                            className={`btn btn-sm ${
                                (
                                    settings.marketplace_profile?.specialties ||
                                    []
                                ).includes(specialty)
                                    ? "btn-primary"
                                    : "btn-outline"
                            }`}
                            onClick={() => toggleSpecialty(specialty)}
                        >
                            {specialty}
                        </button>
                    ))}
                </div>
            </div>

            {/* Detailed Bio */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
                        Detailed Bio
                    </h3>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm font-bold">
                        +12% Profile Boost
                    </span>
                </div>
                <p className="text-sm text-base-content/50 mb-3">
                    Share your story, achievements, and what makes you unique.
                </p>
                <MarkdownEditor
                    label="Your Story"
                    showCount
                    value={settings.marketplace_profile?.bio_rich || ""}
                    onChange={(value) =>
                        onUpdate({
                            marketplace_profile: {
                                ...settings.marketplace_profile,
                                bio_rich: value,
                            },
                        })
                    }
                    placeholder={`Tell recruiters about yourself...\n\nExample:\n- **8+ years** of software engineering experience\n- Led teams of 5-10 developers\n- Expert in React, TypeScript, Node.js`}
                    helperText="Supports Markdown formatting. Appears prominently on your marketplace profile."
                    height={240}
                />
            </div>
        </div>
    );
}
