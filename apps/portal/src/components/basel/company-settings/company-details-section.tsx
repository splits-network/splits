"use client";

import { BaselFormField } from "@splits-network/basel-ui";
import { getSocialIcon, getSocialLabel } from "@/lib/social-link-utils";

const COMPANY_STAGES = [
    { value: "Seed", label: "Seed" },
    { value: "Series A", label: "Series A" },
    { value: "Series B", label: "Series B" },
    { value: "Series C", label: "Series C" },
    { value: "Growth", label: "Growth" },
    { value: "Public", label: "Public" },
    { value: "Bootstrapped", label: "Bootstrapped" },
    { value: "Non-Profit", label: "Non-Profit" },
];

export interface SocialLinkEntry {
    url: string;
    label: string;
}

interface CompanyDetailsSectionProps {
    stage: string;
    founded_year: string;
    tagline: string;
    socialLinks: SocialLinkEntry[];
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    onSocialLinksChange: (links: SocialLinkEntry[]) => void;
}

export function CompanyDetailsSection({
    stage,
    founded_year,
    tagline,
    socialLinks,
    onChange,
    onSocialLinksChange,
}: CompanyDetailsSectionProps) {
    const currentYear = new Date().getFullYear();

    const addLink = () => {
        onSocialLinksChange([...socialLinks, { url: "", label: "" }]);
    };

    const removeLink = (index: number) => {
        onSocialLinksChange(socialLinks.filter((_, i) => i !== index));
    };

    const updateLink = (
        index: number,
        field: "url" | "label",
        value: string,
    ) => {
        const updated = socialLinks.map((link, i) =>
            i === index ? { ...link, [field]: value } : link,
        );
        onSocialLinksChange(updated);
    };

    return (
        <>
            <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-bold tracking-tight mb-1">
                    Company Details
                </h3>
                <p className="text-sm text-base-content/50 mb-4">
                    Additional details about your company stage and founding.
                </p>
            </div>

            <BaselFormField label="Company Stage">
                <select
                    name="stage"
                    value={stage}
                    onChange={onChange}
                    className="select w-full"
                >
                    <option value="">Select stage...</option>
                    {COMPANY_STAGES.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </BaselFormField>

            <BaselFormField label="Founded Year">
                <input
                    type="number"
                    name="founded_year"
                    value={founded_year}
                    onChange={onChange}
                    placeholder="2020"
                    min={1800}
                    max={currentYear}
                    className="input input-bordered w-full"
                />
            </BaselFormField>

            <BaselFormField label="Tagline" className="md:col-span-2">
                <input
                    type="text"
                    name="tagline"
                    value={tagline}
                    onChange={onChange}
                    placeholder="Brief company tagline..."
                    maxLength={200}
                    className="input input-bordered w-full"
                />
            </BaselFormField>

            <div className="md:col-span-2 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold tracking-tight mb-1">
                            Social Links
                        </h3>
                        <p className="text-sm text-base-content/50">
                            Add links to your company social profiles. Icons are
                            detected automatically.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addLink}
                        disabled={socialLinks.length >= 20}
                        className="btn btn-ghost btn-sm"
                    >
                        <i className="fa-duotone fa-regular fa-plus text-xs" />
                        Add Link
                    </button>
                </div>

                {socialLinks.length === 0 ? (
                    <div className="border border-dashed border-base-300 p-6 text-center">
                        <p className="text-sm text-base-content/30">
                            No social links added yet.
                        </p>
                        <button
                            type="button"
                            onClick={addLink}
                            className="btn btn-ghost btn-sm mt-2"
                        >
                            <i className="fa-duotone fa-regular fa-plus text-xs" />
                            Add your first link
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {socialLinks.map((link, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 bg-base-200 border border-base-300 p-3"
                            >
                                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                    <i
                                        className={`${link.url ? getSocialIcon(link.url) : "fa-duotone fa-regular fa-link"} text-primary text-xs`}
                                    />
                                </div>
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        type="url"
                                        value={link.url}
                                        onChange={(e) =>
                                            updateLink(
                                                index,
                                                "url",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://linkedin.com/company/..."
                                        className="input input-bordered input-sm w-full"
                                    />
                                    <input
                                        type="text"
                                        value={link.label}
                                        onChange={(e) =>
                                            updateLink(
                                                index,
                                                "label",
                                                e.target.value,
                                            )
                                        }
                                        placeholder={
                                            link.url
                                                ? getSocialLabel(link.url)
                                                : "Custom label (optional)"
                                        }
                                        maxLength={100}
                                        className="input input-bordered input-sm w-full"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeLink(index)}
                                    className="btn btn-ghost btn-sm btn-square mt-0.5"
                                >
                                    <i className="fa-duotone fa-regular fa-trash text-xs text-error" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
