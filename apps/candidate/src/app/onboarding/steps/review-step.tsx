"use client";

/**
 * Step 5: Review & Complete (Basel Edition)
 * Uses BaselReviewSection for data review with "Edit" links.
 */

import { BaselReviewSection } from "@splits-network/basel-ui";
import { ButtonLoading } from "@splits-network/shared-ui";
import { JOB_TYPE_OPTIONS, AVAILABILITY_OPTIONS } from "../types";
import type {
    CandidateOnboardingState,
    CandidateOnboardingActions,
} from "../types";

interface ReviewStepProps {
    state: CandidateOnboardingState;
    actions: CandidateOnboardingActions;
}

function formatJobType(value?: string): string | undefined {
    if (!value) return undefined;
    return JOB_TYPE_OPTIONS.find((o) => o.value === value)?.label;
}

function formatAvailability(value?: string): string | undefined {
    if (!value) return undefined;
    return AVAILABILITY_OPTIONS.find((o) => o.value === value)?.label;
}

function formatSalary(min?: number, max?: number): string | undefined {
    if (min === undefined && max === undefined) return undefined;
    const minStr = min ? `$${(min / 1000).toFixed(0)}K` : "No minimum";
    const maxStr =
        max === 999999999
            ? "No limit"
            : max
              ? `$${(max / 1000).toFixed(0)}K`
              : "No maximum";
    return `${minStr} — ${maxStr}`;
}

export function ReviewStep({ state, actions }: ReviewStepProps) {
    const { profileData } = state;

    const handleComplete = () => {
        actions.submitOnboarding();
    };

    // Personal Info section
    const personalItems = [
        { label: "Name", value: profileData.full_name },
        { label: "Phone", value: profileData.phone },
        { label: "Location", value: profileData.location },
        { label: "Title", value: profileData.current_title },
        { label: "Company", value: profileData.current_company },
    ];

    // Online Presence section
    const onlineItems = [
        { label: "LinkedIn", value: profileData.linkedin_url },
        { label: "GitHub", value: profileData.github_url },
        { label: "Portfolio", value: profileData.portfolio_url },
    ];

    // Resume section
    const resumeItems = [
        {
            label: "Resume",
            value: profileData.resumeUploaded
                ? profileData.resumeFile?.name || "Uploaded"
                : "Not uploaded",
        },
    ];

    // Preferences section
    const preferenceItems = [
        {
            label: "Job Type",
            value: formatJobType(profileData.desired_job_type),
        },
        {
            label: "Availability",
            value: formatAvailability(profileData.availability),
        },
        {
            label: "Remote",
            value: profileData.open_to_remote ? "Yes" : "No",
        },
        {
            label: "Relocation",
            value: profileData.open_to_relocation ? "Yes" : "No",
        },
        {
            label: "Salary Range",
            value: formatSalary(
                profileData.desired_salary_min,
                profileData.desired_salary_max,
            ),
        },
    ];

    const nextSteps = [
        "Your profile becomes visible to the recruiter network",
        "Recruiters can match you with open roles",
        "You'll receive notifications when there's a match",
    ];

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Step 5
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                Review &amp; Complete
            </h1>
            <p className="text-base-content/50 mb-8">
                Confirm your details and complete your profile setup.
            </p>

            <div className="space-y-4">
                <BaselReviewSection
                    title="Personal Info"
                    items={personalItems}
                    onEdit={() => actions.setStep(2)}
                />

                <BaselReviewSection
                    title="Online Presence"
                    items={onlineItems}
                    onEdit={() => actions.setStep(2)}
                />

                <BaselReviewSection
                    title="Resume"
                    items={resumeItems}
                    onEdit={() => actions.setStep(3)}
                />

                <BaselReviewSection
                    title="Job Preferences"
                    items={preferenceItems}
                    onEdit={() => actions.setStep(4)}
                />

                {/* Bio preview */}
                {profileData.bio && (
                    <div className="border border-base-300 bg-base-200 p-4">
                        <h3 className="text-sm font-black uppercase tracking-wider mb-2">
                            Bio Preview
                        </h3>
                        <p className="text-sm text-base-content/60 line-clamp-3">
                            {profileData.bio}
                        </p>
                    </div>
                )}

                {/* What happens next */}
                <div className="border-l-4 border-primary bg-primary/5 p-5">
                    <h3 className="text-sm font-bold mb-3">
                        What happens when you complete?
                    </h3>
                    <ul className="space-y-2">
                        {nextSteps.map((step) => (
                            <li
                                key={step}
                                className="flex items-center gap-2 text-sm text-base-content/60"
                            >
                                <i className="fa-solid fa-check text-success text-xs" />
                                {step}
                            </li>
                        ))}
                    </ul>
                </div>

                {state.error && (
                    <div className="border-l-4 border-error bg-error/5 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                        <span className="text-sm font-semibold">
                            {state.error}
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-base-300">
                <button
                    className="btn btn-ghost"
                    onClick={() => actions.setStep(4)}
                    disabled={state.submitting}
                >
                    <i className="fa-solid fa-arrow-left text-xs" /> Back
                </button>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={handleComplete}
                    disabled={state.submitting}
                >
                    <ButtonLoading
                        loading={state.submitting}
                        text="Complete Setup"
                        loadingText="Completing..."
                    />
                    {!state.submitting && (
                        <i className="fa-duotone fa-regular fa-rocket text-sm" />
                    )}
                </button>
            </div>
        </div>
    );
}
