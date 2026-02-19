"use client";

/**
 * Step 4: Review & Launch (Basel Edition)
 * Uses BaselReviewSection for data review with "Edit" links.
 */

import { BaselReviewSection } from "@splits-network/basel-ui";
import { ButtonLoading } from "@splits-network/shared-ui";
import type { OnboardingState, OnboardingActions } from "../types";

interface ReviewStepProps {
    state: OnboardingState;
    actions: OnboardingActions;
}

export function ReviewStep({ state, actions }: ReviewStepProps) {
    const isRecruiter = state.selectedRole === "recruiter";

    const handleLaunch = () => {
        actions.submitOnboarding();
    };

    // Build review items for role section
    const roleItems = [
        {
            label: "Role",
            value: isRecruiter ? "Recruiter" : "Company Admin",
        },
    ];

    // Build recruiter profile review items
    const recruiterItems = isRecruiter
        ? [
              {
                  label: "Phone",
                  value: state.recruiterProfile?.phone,
              },
              {
                  label: "Location",
                  value: state.recruiterProfile?.location,
              },
              {
                  label: "Tagline",
                  value: state.recruiterProfile?.tagline,
              },
              {
                  label: "Experience",
                  value: state.recruiterProfile?.years_experience
                      ? `${state.recruiterProfile.years_experience} years`
                      : undefined,
              },
              {
                  label: "Industries",
                  value: state.recruiterProfile?.industries?.join(", "),
              },
              {
                  label: "Specialties",
                  value: state.recruiterProfile?.specialties?.join(", "),
              },
              {
                  label: "Team Code",
                  value: state.recruiterProfile?.teamInviteCode,
              },
          ]
        : [];

    // Build subscription review items
    const planItems = isRecruiter && state.selectedPlan
        ? [
              {
                  label: "Plan",
                  value: state.selectedPlan.name,
              },
              {
                  label: "Price",
                  value:
                      state.selectedPlan.price_monthly > 0
                          ? `$${state.selectedPlan.price_monthly}/month`
                          : "Free",
              },
              {
                  label: "Trial",
                  value: state.selectedPlan.trial_days
                      ? `${state.selectedPlan.trial_days} days free`
                      : "No trial",
              },
          ]
        : [];

    // Build company info review items
    const companyItems = !isRecruiter
        ? [
              { label: "Company", value: state.companyInfo?.name },
              { label: "Website", value: state.companyInfo?.website },
              { label: "Location", value: state.companyInfo?.headquarters_location },
              {
                  label: "Industry",
                  value: state.companyInfo?.industry?.replace(/_/g, " "),
              },
              { label: "Size", value: state.companyInfo?.size },
              {
                  label: "Billing Terms",
                  value: state.companyInfo?.billing_terms?.replace(/_/g, " "),
              },
              { label: "Billing Email", value: state.companyInfo?.billing_email },
          ]
        : [];

    const nextSteps = isRecruiter
        ? [
              "Your recruiter profile goes live instantly",
              "Free trial starts — no card charged until it ends",
              "Browse roles and submit candidates immediately",
          ]
        : [
              "Your company workspace is created instantly",
              "Post a role and recruiters start submitting",
              "Track every submission from one dashboard",
          ];

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                {isRecruiter ? "Step 4" : "Step 3"}
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                Review & Launch
            </h1>
            <p className="text-base-content/50 mb-8">
                Confirm your details and go live on the marketplace.
            </p>

            <div className="space-y-4">
                {/* Role */}
                <BaselReviewSection
                    title="Role"
                    items={roleItems}
                    onEdit={() => actions.setStep(1)}
                />

                {/* Subscription Plan (recruiter only) */}
                {planItems.length > 0 && (
                    <BaselReviewSection
                        title="Subscription"
                        items={planItems}
                        onEdit={() => actions.setStep(2)}
                    />
                )}

                {/* Recruiter Profile */}
                {recruiterItems.length > 0 && (
                    <BaselReviewSection
                        title="Your Profile"
                        items={recruiterItems}
                        onEdit={() => actions.setStep(3)}
                    />
                )}

                {/* Company Info */}
                {companyItems.length > 0 && (
                    <BaselReviewSection
                        title="Company Info"
                        items={companyItems}
                        onEdit={() => actions.setStep(3)}
                    />
                )}

                {/* Bio preview (recruiter only) */}
                {isRecruiter && state.recruiterProfile?.bio && (
                    <div className="border border-base-300 bg-base-200 p-4">
                        <h3 className="text-sm font-black uppercase tracking-wider mb-2">
                            Bio Preview
                        </h3>
                        <p className="text-sm text-base-content/60 line-clamp-3">
                            {state.recruiterProfile.bio}
                        </p>
                    </div>
                )}

                {/* What happens next */}
                <div className="border-l-4 border-primary bg-primary/5 p-5">
                    <h3 className="text-sm font-bold mb-3">
                        What happens when you launch?
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
                    onClick={() => actions.setStep(3)}
                    disabled={state.submitting}
                >
                    <i className="fa-solid fa-arrow-left text-xs" /> Back
                </button>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={handleLaunch}
                    disabled={state.submitting}
                >
                    <ButtonLoading
                        loading={state.submitting}
                        text="Launch"
                        loadingText="Launching..."
                    />
                    {!state.submitting && (
                        <i className="fa-duotone fa-regular fa-rocket text-sm" />
                    )}
                </button>
            </div>
        </div>
    );
}
