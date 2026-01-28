"use client";

/**
 * Step 3a: Recruiter Profile Form
 * Shown when user selects "Recruiter" role
 */

import { useState, FormEvent } from "react";
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

export function RecruiterProfileStep() {
    const { state, actions } = useOnboarding();

    const [formData, setFormData] = useState({
        bio: state.recruiterProfile?.bio || "",
        phone: state.recruiterProfile?.phone || "",
        industries: state.recruiterProfile?.industries || [],
        specialties: state.recruiterProfile?.specialties || [],
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
        // Use arrays directly instead of parsing comma-separated strings
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
        <div className="space-y-6 max-w-3xl w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-bold">
                    Complete Your Recruiter Profile
                </h2>
                <p className="text-base-content/70 mt-2">
                    Tell us a bit about yourself and your recruiting experience
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Bio */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Bio / About You</legend>
                    <textarea
                        className="textarea h-24 w-full"
                        value={formData.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        placeholder="Share your recruiting experience, specializations, and what makes you great at finding talent..."
                        required
                    />
                    <p className="fieldset-label">
                        Help companies understand your expertise
                    </p>
                </fieldset>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Phone Number *
                        </legend>
                        <input
                            type="tel"
                            className="input w-full"
                            value={formData.phone}
                            onChange={(e) =>
                                handleChange("phone", e.target.value)
                            }
                            placeholder="+1 (555) 123-4567"
                            required
                        />
                    </fieldset>

                    {/* Location */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Location</legend>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.location}
                            onChange={(e) =>
                                handleChange("location", e.target.value)
                            }
                            placeholder="e.g., New York, NY"
                        />
                        <p className="fieldset-label">
                            Your primary work location
                        </p>
                    </fieldset>
                </div>

                {/* Industries */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Industries</legend>
                    <div className="flex flex-wrap gap-2">
                        {INDUSTRY_OPTIONS.map((industry) => (
                            <button
                                key={industry}
                                type="button"
                                onClick={() => toggleIndustry(industry)}
                                className={`btn btn-sm ${
                                    formData.industries.includes(industry)
                                        ? "btn-primary"
                                        : "btn-outline"
                                }`}
                            >
                                {industry}
                            </button>
                        ))}
                    </div>
                    <p className="fieldset-label">
                        Select the industries you recruit in
                    </p>
                </fieldset>

                {/* Specialties */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Specialties</legend>
                    <div className="flex flex-wrap gap-2">
                        {SPECIALTY_OPTIONS.map((specialty) => (
                            <button
                                key={specialty}
                                type="button"
                                onClick={() => toggleSpecialty(specialty)}
                                className={`btn btn-sm ${
                                    formData.specialties.includes(specialty)
                                        ? "btn-primary"
                                        : "btn-outline"
                                }`}
                            >
                                {specialty}
                            </button>
                        ))}
                    </div>
                    <p className="fieldset-label">
                        Select your recruiting specialties
                    </p>
                </fieldset>

                {/* Tagline and Years Experience - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Tagline</legend>
                        <input
                            type="text"
                            className="input"
                            value={formData.tagline}
                            onChange={(e) =>
                                handleChange("tagline", e.target.value)
                            }
                            placeholder="e.g., Tech Recruiting Expert"
                        />
                        <p className="fieldset-label">
                            Brief headline about your expertise
                        </p>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Years of Experience
                        </legend>
                        <input
                            type="number"
                            className="input"
                            min="0"
                            value={formData.years_experience}
                            onChange={(e) =>
                                handleChange("years_experience", e.target.value)
                            }
                            placeholder="5"
                        />
                        <p className="fieldset-label">Years in recruiting</p>
                    </fieldset>
                </div>

                {/* Team Invite Code (Optional) */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                        Team Invite Code (Optional)
                    </legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.teamInviteCode}
                        onChange={(e) =>
                            handleChange(
                                "teamInviteCode",
                                e.target.value.toUpperCase(),
                            )
                        }
                        placeholder="TEAM-ABC123"
                    />
                    <p className="fieldset-label">
                        If you were invited by a team, enter the code here
                    </p>
                </fieldset>

                {state.error && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="btn"
                        disabled={state.submitting}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left"></i>
                        Back
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={state.submitting}
                    >
                        {state.submitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue
                                <i className="fa-duotone fa-regular fa-arrow-right"></i>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
