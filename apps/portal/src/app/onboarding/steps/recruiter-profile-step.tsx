"use client";

/**
 * Step 3a: Recruiter Profile Form (Basel Edition)
 * Uses BaselFormField + BaselChipGroup for multi-select fields.
 */

import { useState, FormEvent } from "react";
import { MarkdownEditor, ButtonLoading } from "@splits-network/shared-ui";
import { BaselFormField, BaselChipGroup } from "@splits-network/basel-ui";
import type { OnboardingState, OnboardingActions } from "../types";

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

interface RecruiterProfileStepProps {
    state: OnboardingState;
    actions: OnboardingActions;
}

export function RecruiterProfileStep({
    state,
    actions,
}: RecruiterProfileStepProps) {
    const [formData, setFormData] = useState({
        bio: state.recruiterProfile?.bio || "",
        phone: state.recruiterProfile?.phone || "",
        industries: state.recruiterProfile?.industries || ([] as string[]),
        specialties: state.recruiterProfile?.specialties || ([] as string[]),
        location: state.recruiterProfile?.location || "",
        tagline: state.recruiterProfile?.tagline || "",
        years_experience:
            state.recruiterProfile?.years_experience?.toString() || "",
        teamInviteCode: state.recruiterProfile?.teamInviteCode || "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        actions.setRecruiterProfile({
            bio: formData.bio,
            phone: formData.phone,
            industries: formData.industries,
            specialties: formData.specialties,
            location: formData.location,
            tagline: formData.tagline,
            years_experience: formData.years_experience
                ? parseInt(formData.years_experience)
                : undefined,
            teamInviteCode: formData.teamInviteCode,
        });
        actions.setStep(4);
    };

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Step 3
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                Build your profile
            </h1>
            <p className="text-base-content/50 mb-8">
                This information helps companies find and trust you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Bio */}
                <BaselFormField label="Bio / About You">
                    <MarkdownEditor
                        className="fieldset"
                        value={formData.bio}
                        onChange={(value) => handleChange("bio", value)}
                        placeholder="Share your recruiting experience, specializations, and what makes you great at finding talent..."
                        helperText="Help companies understand your expertise"
                        height={160}
                    />
                </BaselFormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BaselFormField label="Phone Number" required>
                        <input
                            type="tel"
                            className="input input-bordered w-full"
                            value={formData.phone}
                            onChange={(e) =>
                                handleChange("phone", e.target.value)
                            }
                            placeholder="+1 (555) 123-4567"
                            required
                        />
                    </BaselFormField>

                    <BaselFormField label="Location">
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={formData.location}
                            onChange={(e) =>
                                handleChange("location", e.target.value)
                            }
                            placeholder="e.g., New York, NY"
                        />
                    </BaselFormField>
                </div>

                {/* Industries */}
                <BaselFormField
                    label="Industries"
                    hint="Select the industries you recruit in"
                >
                    <BaselChipGroup
                        options={INDUSTRY_OPTIONS}
                        selected={formData.industries}
                        onChange={(selected) =>
                            setFormData((prev) => ({
                                ...prev,
                                industries: selected,
                            }))
                        }
                        color="primary"
                    />
                </BaselFormField>

                {/* Specialties */}
                <BaselFormField
                    label="Specialties"
                    hint="Select your recruiting specialties"
                >
                    <BaselChipGroup
                        options={SPECIALTY_OPTIONS}
                        selected={formData.specialties}
                        onChange={(selected) =>
                            setFormData((prev) => ({
                                ...prev,
                                specialties: selected,
                            }))
                        }
                        color="secondary"
                    />
                </BaselFormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BaselFormField label="Tagline">
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={formData.tagline}
                            onChange={(e) =>
                                handleChange("tagline", e.target.value)
                            }
                            placeholder="e.g., Tech Recruiting Expert"
                        />
                    </BaselFormField>

                    <BaselFormField label="Years of Experience">
                        <input
                            type="number"
                            className="input input-bordered w-full"
                            min={0}
                            value={formData.years_experience}
                            onChange={(e) =>
                                handleChange("years_experience", e.target.value)
                            }
                            placeholder="5"
                        />
                    </BaselFormField>
                </div>

                <BaselFormField
                    label="Team Invite Code"
                    hint="If you were invited by a team, enter the code here"
                >
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.teamInviteCode}
                        onChange={(e) =>
                            handleChange(
                                "teamInviteCode",
                                e.target.value.toUpperCase(),
                            )
                        }
                        placeholder="TEAM-ABC123"
                    />
                </BaselFormField>

                {state.error && (
                    <div className="border-l-4 border-error bg-error/5 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                        <span className="text-sm font-semibold">
                            {state.error}
                        </span>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-base-300">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => actions.setStep(2)}
                        disabled={state.submitting}
                    >
                        <i className="fa-solid fa-arrow-left text-xs" /> Back
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={state.submitting}
                    >
                        <ButtonLoading
                            loading={state.submitting}
                            text="Continue"
                            loadingText="Saving..."
                        />
                        {!state.submitting && (
                            <i className="fa-solid fa-arrow-right text-xs" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
