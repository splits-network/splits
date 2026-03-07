"use client";

import { BaselFormField } from "@splits-network/basel-ui";

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

interface CompanyDetailsSectionProps {
    stage: string;
    founded_year: string;
    tagline: string;
    linkedin_url: string;
    twitter_url: string;
    glassdoor_url: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function CompanyDetailsSection({
    stage,
    founded_year,
    tagline,
    linkedin_url,
    twitter_url,
    glassdoor_url,
    onChange,
}: CompanyDetailsSectionProps) {
    const currentYear = new Date().getFullYear();

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
                <h3 className="text-lg font-bold tracking-tight mb-1">
                    Social Links
                </h3>
                <p className="text-sm text-base-content/50 mb-4">
                    Add links to your company social profiles.
                </p>
            </div>

            <BaselFormField label="LinkedIn">
                <input
                    type="url"
                    name="linkedin_url"
                    value={linkedin_url}
                    onChange={onChange}
                    placeholder="https://linkedin.com/company/..."
                    className="input input-bordered w-full"
                />
            </BaselFormField>

            <BaselFormField label="Twitter / X">
                <input
                    type="url"
                    name="twitter_url"
                    value={twitter_url}
                    onChange={onChange}
                    placeholder="https://x.com/..."
                    className="input input-bordered w-full"
                />
            </BaselFormField>

            <BaselFormField label="Glassdoor">
                <input
                    type="url"
                    name="glassdoor_url"
                    value={glassdoor_url}
                    onChange={onChange}
                    placeholder="https://glassdoor.com/..."
                    className="input input-bordered w-full"
                />
            </BaselFormField>
        </>
    );
}
