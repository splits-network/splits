"use client";

import { useMarketplaceSettings } from "./marketplace-context";
import { BaselSectionHeading } from "@splits-network/basel-ui";

const INDUSTRY_OPTIONS = [
    "Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Retail",
    "Education",
    "Consulting",
    "Professional Services",
    "Real Estate",
    "Recruitment",
    "Hospitality",
    "Construction",
    "Energy",
    "Telecommunications",
    "Media & Entertainment",
    "Transportation",
    "Other",
];

const SPECIALTY_OPTIONS = [
    "Executive",
    "Engineering",
    "Product Management",
    "Design",
    "Data Science",
    "Marketing",
    "Sales",
    "Operations",
    "Finance",
    "Legal",
    "Human Resources",
    "Customer Success",
    "Administrative",
];

export function SpecializationsSection() {
    const { settings, toggleIndustry, toggleSpecialty, loading } =
        useMarketplaceSettings();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Specializations
            </h2>
            <p className="text-base text-base-content/50 mb-8">
                Define your areas of expertise to match with the right
                opportunities.
            </p>

            {/* Industries */}
            <div className="mb-10">
                <BaselSectionHeading
                    kicker="Focus Areas"
                    title="Industries"
                    subtitle="Select the industries you specialize in"
                    className="mb-6"
                />
                <div className="flex flex-wrap gap-2">
                    {INDUSTRY_OPTIONS.map((industry) => {
                        const isSelected =
                            settings.industries.includes(industry);
                        return (
                            <button
                                key={industry}
                                type="button"
                                onClick={() => toggleIndustry(industry)}
                                className={`btn btn-sm ${
                                    isSelected
                                        ? "btn-primary"
                                        : "btn-ghost border border-base-300"
                                }`}
                            >
                                {industry}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Specialties */}
            <div className="pt-8 border-t border-base-300">
                <BaselSectionHeading
                    kicker="Expertise"
                    kickerColor="secondary"
                    title="Specialties"
                    subtitle="Select the roles and functions you specialize in"
                    className="mb-6"
                />
                <div className="flex flex-wrap gap-2">
                    {SPECIALTY_OPTIONS.map((specialty) => {
                        const isSelected =
                            settings.specialties.includes(specialty);
                        return (
                            <button
                                key={specialty}
                                type="button"
                                onClick={() => toggleSpecialty(specialty)}
                                className={`btn btn-sm ${
                                    isSelected
                                        ? "btn-secondary"
                                        : "btn-ghost border border-base-300"
                                }`}
                            >
                                {specialty}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
