'use client';

/**
 * Step 3a: Recruiter Profile Form
 * Shown when user selects "Recruiter" role
 */

import { useState, FormEvent } from 'react';
import { useOnboarding } from '../onboarding-provider';

export function RecruiterProfileStep() {
    const { state, actions } = useOnboarding();

    const [formData, setFormData] = useState({
        bio: state.recruiterProfile?.bio || '',
        phone: state.recruiterProfile?.phone || '',
        industries: state.recruiterProfile?.industries?.join(', ') || '',
        specialties: state.recruiterProfile?.specialties?.join(', ') || '',
        location: state.recruiterProfile?.location || '',
        tagline: state.recruiterProfile?.tagline || '',
        years_experience: state.recruiterProfile?.years_experience?.toString() || '',
        teamInviteCode: state.recruiterProfile?.teamInviteCode || '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Convert comma-separated lists to arrays
        const profile = {
            bio: formData.bio,
            phone: formData.phone,
            industries: formData.industries ? formData.industries.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            specialties: formData.specialties ? formData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            location: formData.location,
            tagline: formData.tagline,
            years_experience: formData.years_experience ? parseInt(formData.years_experience) : undefined,
            teamInviteCode: formData.teamInviteCode,
        };
        actions.setRecruiterProfile(profile);
        actions.setStep(4);
    };

    const handleBack = () => {
        actions.setStep(2);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Complete Your Recruiter Profile</h2>
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
                        onChange={(e) => handleChange('bio', e.target.value)}
                        placeholder="Share your recruiting experience, specializations, and what makes you great at finding talent..."
                        required
                    />
                    <p className="fieldset-label">Help companies understand your expertise</p>
                </fieldset>

                {/* Phone */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Phone Number *</legend>
                    <input
                        type="tel"
                        className="input w-full"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                    />
                </fieldset>

                {/* Industries */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Industries</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.industries}
                        onChange={(e) => handleChange('industries', e.target.value)}
                        placeholder="e.g., Technology, Healthcare, Finance"
                    />
                    <p className="fieldset-label">Comma-separated list of industries you recruit in</p>
                </fieldset>

                {/* Specialties */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Specialties</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.specialties}
                        onChange={(e) => handleChange('specialties', e.target.value)}
                        placeholder="e.g., Software Engineering, Data Science, Product Management"
                    />
                    <p className="fieldset-label">Comma-separated list of roles/specializations you focus on</p>
                </fieldset>

                {/* Location */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Location</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="e.g., New York, NY"
                    />
                    <p className="fieldset-label">Your primary work location</p>
                </fieldset>

                {/* Tagline and Years Experience - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Tagline</legend>
                        <input
                            type="text"
                            className="input"
                            value={formData.tagline}
                            onChange={(e) => handleChange('tagline', e.target.value)}
                            placeholder="e.g., Tech Recruiting Expert"
                        />
                        <p className="fieldset-label">Brief headline about your expertise</p>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Years of Experience</legend>
                        <input
                            type="number"
                            className="input"
                            min="0"
                            value={formData.years_experience}
                            onChange={(e) => handleChange('years_experience', e.target.value)}
                            placeholder="5"
                        />
                        <p className="fieldset-label">Years in recruiting</p>
                    </fieldset>
                </div>

                {/* Team Invite Code (Optional) */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Team Invite Code (Optional)</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.teamInviteCode}
                        onChange={(e) => handleChange('teamInviteCode', e.target.value.toUpperCase())}
                        placeholder="TEAM-ABC123"
                    />
                    <p className="fieldset-label">If you were invited by a team, enter the code here</p>
                </fieldset>

                {state.error && (
                    <div className="alert alert-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
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
                        <i className="fa-solid fa-arrow-left"></i>
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
                                <i className="fa-solid fa-arrow-right"></i>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
