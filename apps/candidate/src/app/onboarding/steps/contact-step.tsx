"use client";

/**
 * Step 2: Contact & Professional Info (Basel Edition)
 * Phone, location, professional background, and online presence.
 */

import { BaselFormField } from "@splits-network/basel-ui";
import { MarkdownEditor } from "@splits-network/shared-ui";
import type {
    CandidateOnboardingState,
    CandidateOnboardingActions,
} from "../types";

interface ContactStepProps {
    state: CandidateOnboardingState;
    actions: CandidateOnboardingActions;
}

export function ContactStep({ state, actions }: ContactStepProps) {
    const { profileData, submitting } = state;

    const update = (data: Partial<typeof profileData>) => {
        actions.updateProfileData(data);
    };

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Step 2
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                Your Profile
            </h1>
            <p className="text-base-content/50 mb-8">
                Help recruiters learn more about you. All fields are optional.
            </p>

            <div className="space-y-6">
                {/* Contact Section */}
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/70 flex items-center gap-2 mb-4">
                        <i className="fa-duotone fa-regular fa-phone text-primary" />
                        Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <BaselFormField label="Phone">
                            <input
                                type="tel"
                                className="input w-full"
                                value={profileData.phone || ""}
                                onChange={(e) =>
                                    update({ phone: e.target.value })
                                }
                                placeholder="+1 (555) 123-4567"
                            />
                        </BaselFormField>
                        <BaselFormField label="Location">
                            <input
                                type="text"
                                className="input w-full"
                                value={profileData.location || ""}
                                onChange={(e) =>
                                    update({ location: e.target.value })
                                }
                                placeholder="City, State"
                            />
                        </BaselFormField>
                    </div>
                </div>

                {/* Professional Section */}
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/70 flex items-center gap-2 mb-4">
                        <i className="fa-duotone fa-regular fa-briefcase text-primary" />
                        Professional Background
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <BaselFormField label="Current Title">
                            <input
                                type="text"
                                className="input w-full"
                                value={profileData.current_title || ""}
                                onChange={(e) =>
                                    update({ current_title: e.target.value })
                                }
                                placeholder="Software Engineer"
                            />
                        </BaselFormField>
                        <BaselFormField label="Current Company">
                            <input
                                type="text"
                                className="input w-full"
                                value={profileData.current_company || ""}
                                onChange={(e) =>
                                    update({ current_company: e.target.value })
                                }
                                placeholder="Acme Inc."
                            />
                        </BaselFormField>
                    </div>
                    <MarkdownEditor
                        className="fieldset"
                        label="Short Bio"
                        value={profileData.bio || ""}
                        onChange={(value) => update({ bio: value })}
                        placeholder="A brief summary of your experience and what you're looking for..."
                        maxLength={500}
                        showCount
                        height={160}
                    />
                </div>

                {/* Online Presence Section */}
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/70 flex items-center gap-2 mb-4">
                        <i className="fa-duotone fa-regular fa-globe text-primary" />
                        Online Presence
                    </h3>
                    <div className="space-y-4">
                        <BaselFormField label="LinkedIn">
                            <input
                                type="url"
                                className="input w-full"
                                value={profileData.linkedin_url || ""}
                                onChange={(e) =>
                                    update({ linkedin_url: e.target.value })
                                }
                                placeholder="https://linkedin.com/in/yourprofile"
                            />
                        </BaselFormField>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <BaselFormField label="GitHub">
                                <input
                                    type="url"
                                    className="input w-full"
                                    value={profileData.github_url || ""}
                                    onChange={(e) =>
                                        update({ github_url: e.target.value })
                                    }
                                    placeholder="https://github.com/username"
                                />
                            </BaselFormField>
                            <BaselFormField label="Portfolio">
                                <input
                                    type="url"
                                    className="input w-full"
                                    value={profileData.portfolio_url || ""}
                                    onChange={(e) =>
                                        update({
                                            portfolio_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://yoursite.com"
                                />
                            </BaselFormField>
                        </div>
                    </div>
                </div>

                {/* Privacy note */}
                <div className="border-l-4 border-info bg-info/5 p-5">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-shield-check text-info text-lg mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold">
                                Your privacy matters
                            </h4>
                            <p className="text-xs text-base-content/50 mt-1">
                                Your information is only shared with recruiters
                                you choose to work with.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-base-300">
                <button
                    className="btn btn-ghost"
                    onClick={() => actions.setStep(1)}
                    disabled={submitting}
                >
                    <i className="fa-solid fa-arrow-left text-xs" /> Back
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => actions.setStep(3)}
                    disabled={submitting}
                >
                    Continue
                    <i className="fa-solid fa-arrow-right text-xs" />
                </button>
            </div>
        </div>
    );
}
