"use client";

/**
 * Step 1: Welcome (Basel Edition)
 * Name confirmation and overview of what the onboarding covers.
 */

import { useUser } from "@clerk/nextjs";
import { BaselFormField } from "@splits-network/basel-ui";
import type {
    CandidateOnboardingState,
    CandidateOnboardingActions,
} from "../types";

interface WelcomeStepProps {
    state: CandidateOnboardingState;
    actions: CandidateOnboardingActions;
}

export function WelcomeStep({ state, actions }: WelcomeStepProps) {
    const { user } = useUser();

    const displayName =
        state.profileData.full_name || user?.fullName || user?.firstName || "";

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        actions.updateProfileData({ full_name: e.target.value });
    };

    const handleNext = async () => {
        // Auto-set name from Clerk if blank
        if (!state.profileData.full_name && displayName) {
            actions.updateProfileData({ full_name: displayName });
        }
        await actions.setStep(2);
    };

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Step 1
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                Welcome to Applicant Network
            </h1>
            <p className="text-base-content/50 mb-8">
                Let&apos;s get your profile set up so recruiters can find and
                represent you for the right opportunities.
            </p>

            {/* Name Input */}
            <div className="mb-6">
                <BaselFormField label="Your Name">
                    <input
                        type="text"
                        className="input w-full"
                        value={displayName}
                        onChange={handleNameChange}
                        placeholder="Enter your full name"
                    />
                </BaselFormField>
                <p className="text-xs text-base-content/40 mt-1">
                    This is how recruiters will see your name
                </p>
            </div>

            {/* What we'll cover */}
            <div className="border-l-4 border-primary bg-primary/5 p-5 mb-6">
                <h3 className="text-sm font-bold mb-3">
                    What we&apos;ll cover:
                </h3>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-base-content/60">
                        <i className="fa-duotone fa-regular fa-user text-primary w-5 text-center" />
                        Your profile &amp; professional background
                    </li>
                    <li className="flex items-center gap-2 text-sm text-base-content/60">
                        <i className="fa-duotone fa-regular fa-file-lines text-info w-5 text-center" />
                        Resume upload (optional)
                    </li>
                    <li className="flex items-center gap-2 text-sm text-base-content/60">
                        <i className="fa-duotone fa-regular fa-sliders text-accent w-5 text-center" />
                        Job preferences &amp; availability
                    </li>
                </ul>
                <p className="text-xs text-base-content/40 mt-3">
                    All fields are optional. You can always update them later.
                </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-end pt-6 border-t border-base-300">
                <button className="btn btn-primary" onClick={handleNext}>
                    Get Started
                    <i className="fa-solid fa-arrow-right text-xs" />
                </button>
            </div>
        </div>
    );
}
