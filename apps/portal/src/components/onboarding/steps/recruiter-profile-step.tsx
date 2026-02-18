"use client";

/**
 * Step 3a: Recruiter Profile Form (Memphis Edition)
 * Shown when user selects "Recruiter" role
 */

import { useState, FormEvent } from "react";
import { MarkdownEditor, ButtonLoading } from "@splits-network/shared-ui";
import { Input, Button } from "@splits-network/memphis-ui";
import { useOnboarding } from "../onboarding-provider";

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

/** Accent color cycle for specialty toggle buttons */
const ACCENT_CYCLE = ["coral", "teal", "yellow", "purple"] as const;

export function RecruiterProfileStep() {
    const { state, actions } = useOnboarding();

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

    const toggleIndustry = (industry: string) => {
        setFormData((prev) => ({
            ...prev,
            industries: prev.industries.includes(industry)
                ? prev.industries.filter((i) => i !== industry)
                : [...prev.industries, industry],
        }));
    };

    const toggleSpecialty = (specialty: string) => {
        setFormData((prev) => ({
            ...prev,
            specialties: prev.specialties.includes(specialty)
                ? prev.specialties.filter((s) => s !== specialty)
                : [...prev.specialties, specialty],
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const profile = {
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
        };
        actions.setRecruiterProfile(profile);
        actions.setStep(4);
    };

    const handleBack = () => {
        actions.setStep(2);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Heading */}
            <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight text-dark">
                    Complete Your Profile
                </h2>
                <p className="text-dark/60 mt-2 text-sm">
                    Tell us a bit about yourself and your recruiting experience
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Bio */}
                <div>
                    <label className="flex items-center gap-1 text-sm font-black uppercase tracking-[0.15em] text-dark mb-2">
                        Bio / About You
                    </label>
                    <MarkdownEditor
                        className="fieldset"
                        value={formData.bio}
                        onChange={(value) => handleChange("bio", value)}
                        placeholder="Share your recruiting experience, specializations, and what makes you great at finding talent..."
                        helperText="Help companies understand your expertise"
                        height={160}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <Input
                        label="Phone Number *"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                    />

                    {/* Location */}
                    <Input
                        label="Location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        placeholder="e.g., New York, NY"
                    />
                </div>

                {/* Industries */}
                <div>
                    <label className="flex items-center gap-1 text-sm font-black uppercase tracking-[0.15em] text-dark mb-2">
                        Industries
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {INDUSTRY_OPTIONS.map((industry) => {
                            const isSelected = formData.industries.includes(industry);
                            return (
                                <button
                                    key={industry}
                                    type="button"
                                    onClick={() => toggleIndustry(industry)}
                                    className={[
                                        "px-3 py-2 text-xs font-black uppercase tracking-wider border-4 transition-all",
                                        isSelected
                                            ? "bg-coral text-cream border-coral"
                                            : "bg-transparent text-dark border-dark/15",
                                    ].join(" ")}
                                >
                                    {isSelected && (
                                        <i className="fa-solid fa-check text-[10px] mr-1"></i>
                                    )}
                                    {industry}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-dark/40 mt-1.5">
                        Select the industries you recruit in
                    </p>
                </div>

                {/* Specialties */}
                <div>
                    <label className="flex items-center gap-1 text-sm font-black uppercase tracking-[0.15em] text-dark mb-2">
                        Specialties
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {SPECIALTY_OPTIONS.map((specialty, idx) => {
                            const isSelected = formData.specialties.includes(specialty);
                            const accent = ACCENT_CYCLE[idx % ACCENT_CYCLE.length];
                            return (
                                <button
                                    key={specialty}
                                    type="button"
                                    onClick={() => toggleSpecialty(specialty)}
                                    className={[
                                        "px-3 py-2 text-xs font-black uppercase tracking-wider border-4 transition-all",
                                        isSelected
                                            ? `bg-${accent} text-cream border-${accent}`
                                            : "bg-transparent text-dark border-dark/15",
                                    ].join(" ")}
                                >
                                    {isSelected && (
                                        <i className="fa-solid fa-check text-[10px] mr-1"></i>
                                    )}
                                    {specialty}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-dark/40 mt-1.5">
                        Select your recruiting specialties
                    </p>
                </div>

                {/* Tagline and Years Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Tagline"
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => handleChange("tagline", e.target.value)}
                        placeholder="e.g., Tech Recruiting Expert"
                    />

                    <Input
                        label="Years of Experience"
                        type="number"
                        min={0}
                        value={formData.years_experience}
                        onChange={(e) => handleChange("years_experience", e.target.value)}
                        placeholder="5"
                    />
                </div>

                {/* Team Invite Code */}
                <Input
                    label="Team Invite Code (Optional)"
                    type="text"
                    value={formData.teamInviteCode}
                    onChange={(e) =>
                        handleChange("teamInviteCode", e.target.value.toUpperCase())
                    }
                    placeholder="TEAM-ABC123"
                />
                <p className="text-xs text-dark/40 -mt-3">
                    If you were invited by a team, enter the code here
                </p>

                {/* Error */}
                {state.error && (
                    <div className="border-4 border-coral bg-coral/10 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-coral"></i>
                        <span className="text-sm font-bold text-dark">{state.error}</span>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 justify-between pt-2">
                    <Button
                        color="dark"
                        variant="outline"
                        type="button"
                        onClick={handleBack}
                        disabled={state.submitting}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                        Back
                    </Button>
                    <Button
                        color="coral"
                        variant="solid"
                        type="submit"
                        disabled={state.submitting}
                    >
                        {state.submitting ? (
                            <ButtonLoading
                                loading={state.submitting}
                                text="Continue"
                                loadingText="Saving..."
                            />
                        ) : (
                            <>
                                Continue
                                <i className="fa-duotone fa-regular fa-arrow-right ml-2"></i>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
