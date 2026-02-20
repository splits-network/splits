"use client";

/**
 * Step 4: Job Preferences (Basel Edition)
 * Job type, availability, remote/relocation toggles, salary range.
 */

import { BaselFormField } from "@splits-network/basel-ui";
import {
    JOB_TYPE_OPTIONS,
    SALARY_RANGES,
    AVAILABILITY_OPTIONS,
} from "../types";
import type {
    CandidateOnboardingState,
    CandidateOnboardingActions,
} from "../types";

interface PreferencesStepProps {
    state: CandidateOnboardingState;
    actions: CandidateOnboardingActions;
}

export function PreferencesStep({ state, actions }: PreferencesStepProps) {
    const { profileData, submitting } = state;

    const update = (data: Partial<typeof profileData>) => {
        actions.updateProfileData(data);
    };

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Step 4
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                Job Preferences
            </h1>
            <p className="text-base-content/50 mb-8">
                Help us match you with the right opportunities. All fields are
                optional.
            </p>

            <div className="space-y-6">
                {/* Job Type */}
                <BaselFormField label="What type of work are you looking for?">
                    <select
                        className="select w-full"
                        value={profileData.desired_job_type || ""}
                        onChange={(e) =>
                            update({
                                desired_job_type: e.target.value || undefined,
                            })
                        }
                    >
                        <option value="">Select job type...</option>
                        {JOB_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </BaselFormField>

                {/* Availability */}
                <BaselFormField label="When can you start?">
                    <select
                        className="select w-full"
                        value={profileData.availability || ""}
                        onChange={(e) =>
                            update({
                                availability: e.target.value || undefined,
                            })
                        }
                    >
                        <option value="">Select availability...</option>
                        {AVAILABILITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </BaselFormField>

                {/* Work Flexibility */}
                <BaselFormField label="Work Flexibility">
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border border-base-300 cursor-pointer hover:border-primary/50 transition-colors">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={profileData.open_to_remote || false}
                                onChange={() =>
                                    update({
                                        open_to_remote:
                                            !profileData.open_to_remote,
                                    })
                                }
                            />
                            <div>
                                <span className="font-semibold text-sm">
                                    Open to remote work
                                </span>
                                <p className="text-xs text-base-content/50">
                                    Include remote opportunities in your matches
                                </p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-base-300 cursor-pointer hover:border-primary/50 transition-colors">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={
                                    profileData.open_to_relocation || false
                                }
                                onChange={() =>
                                    update({
                                        open_to_relocation:
                                            !profileData.open_to_relocation,
                                    })
                                }
                            />
                            <div>
                                <span className="font-semibold text-sm">
                                    Open to relocation
                                </span>
                                <p className="text-xs text-base-content/50">
                                    Willing to move for the right opportunity
                                </p>
                            </div>
                        </label>
                    </div>
                </BaselFormField>

                {/* Salary Range */}
                <BaselFormField
                    label="Desired Salary Range (USD)"
                    hint="Helps filter opportunities based on compensation"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-base-content/50 mb-1 block">
                                Minimum
                            </label>
                            <select
                                className="select w-full"
                                value={profileData.desired_salary_min ?? ""}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    update({
                                        desired_salary_min: v
                                            ? parseInt(v, 10)
                                            : undefined,
                                    });
                                }}
                            >
                                <option value="">No minimum</option>
                                {SALARY_RANGES.slice(0, -1).map((range) => (
                                    <option key={range.min} value={range.min}>
                                        ${(range.min / 1000).toFixed(0)}K
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-base-content/50 mb-1 block">
                                Maximum
                            </label>
                            <select
                                className="select w-full"
                                value={
                                    profileData.desired_salary_max === 999999999
                                        ? "unlimited"
                                        : (profileData.desired_salary_max ?? "")
                                }
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === "") {
                                        update({
                                            desired_salary_max: undefined,
                                        });
                                    } else {
                                        update({
                                            desired_salary_max:
                                                v === "unlimited"
                                                    ? 999999999
                                                    : parseInt(v, 10),
                                        });
                                    }
                                }}
                            >
                                <option value="">No maximum</option>
                                {SALARY_RANGES.map((range) => (
                                    <option
                                        key={range.max ?? "unlimited"}
                                        value={range.max ?? "unlimited"}
                                    >
                                        {range.max
                                            ? `$${(range.max / 1000).toFixed(0)}K`
                                            : "No limit"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </BaselFormField>
            </div>

            {/* Almost done note */}
            <div className="border-l-4 border-success bg-success/5 p-5 mt-6">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-party-horn text-success text-lg mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-success">
                            Almost done!
                        </h4>
                        <p className="text-xs text-base-content/50 mt-1">
                            One more step &mdash; review your details before
                            completing setup.
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-base-300">
                <button
                    className="btn btn-ghost"
                    onClick={() => actions.setStep(3)}
                    disabled={submitting}
                >
                    <i className="fa-solid fa-arrow-left text-xs" /> Back
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => actions.setStep(5)}
                    disabled={submitting}
                >
                    Review
                    <i className="fa-solid fa-arrow-right text-xs" />
                </button>
            </div>
        </div>
    );
}
