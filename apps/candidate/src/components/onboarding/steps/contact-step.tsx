'use client';

/**
 * Contact Step - Step 2 of Candidate Onboarding
 * Contact info, professional background, and online presence (all optional)
 */

import { useOnboarding } from '../onboarding-provider';

export function ContactStep() {
    const { state, updateProfileData } = useOnboarding();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-info/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-address-card text-3xl text-info"></i>
                </div>
                <h2 className="text-xl font-bold mb-2">
                    Your Profile
                </h2>
                <p className="text-base-content/70 text-sm">
                    Help recruiters learn more about you. All fields are optional.
                </p>
            </div>

            {/* Form Fields */}
            <div className="mx-auto space-y-4">
                {/* Contact Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-phone text-primary"></i>
                        Contact
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Phone</legend>
                            <input 
                                type="tel"
                                className="input w-full"
                                value={state.profileData.phone || ''}
                                onChange={(e) => updateProfileData({ phone: e.target.value })}
                                placeholder="+1 (555) 123-4567"
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Location</legend>
                            <input 
                                type="text"
                                className="input w-full"
                                value={state.profileData.location || ''}
                                onChange={(e) => updateProfileData({ location: e.target.value })}
                                placeholder="City, State"
                            />
                        </fieldset>
                    </div>
                </div>

                {/* Professional Section */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-briefcase text-primary"></i>
                        Professional Background
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Current Title</legend>
                            <input 
                                type="text"
                                className="input w-full"
                                value={state.profileData.current_title || ''}
                                onChange={(e) => updateProfileData({ current_title: e.target.value })}
                                placeholder="Software Engineer"
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Current Company</legend>
                            <input 
                                type="text"
                                className="input w-full"
                                value={state.profileData.current_company || ''}
                                onChange={(e) => updateProfileData({ current_company: e.target.value })}
                                placeholder="Acme Inc."
                            />
                        </fieldset>
                    </div>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Short Bio</legend>
                        <textarea 
                            className="textarea w-full h-20"
                            value={state.profileData.bio || ''}
                            onChange={(e) => updateProfileData({ bio: e.target.value })}
                            placeholder="A brief summary of your experience and what you're looking for..."
                            maxLength={500}
                        />
                        <p className="fieldset-label">
                            {(state.profileData.bio?.length || 0)}/500 characters
                        </p>
                    </fieldset>
                </div>

                {/* Online Presence Section */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-globe text-primary"></i>
                        Online Presence
                    </h3>
                    
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            <i className="fa-brands fa-linkedin text-[#0077B5] mr-1"></i>
                            LinkedIn
                        </legend>
                        <input 
                            type="url"
                            className="input w-full"
                            value={state.profileData.linkedin_url || ''}
                            onChange={(e) => updateProfileData({ linkedin_url: e.target.value })}
                            placeholder="https://linkedin.com/in/yourprofile"
                        />
                    </fieldset>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                <i className="fa-brands fa-github mr-1"></i>
                                GitHub
                            </legend>
                            <input 
                                type="url"
                                className="input w-full"
                                value={state.profileData.github_url || ''}
                                onChange={(e) => updateProfileData({ github_url: e.target.value })}
                                placeholder="https://github.com/username"
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                <i className="fa-duotone fa-regular fa-link mr-1"></i>
                                Portfolio
                            </legend>
                            <input 
                                type="url"
                                className="input w-full"
                                value={state.profileData.portfolio_url || ''}
                                onChange={(e) => updateProfileData({ portfolio_url: e.target.value })}
                                placeholder="https://yoursite.com"
                            />
                        </fieldset>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div className="bg-base-200 rounded-lg p-4 mx-auto">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-shield-check text-success text-xl mt-0.5"></i>
                    <div>
                        <h4 className="font-medium text-sm">Your privacy matters</h4>
                        <p className="text-xs text-base-content/70 mt-1">
                            Your information is only shared with recruiters you choose to work with.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
