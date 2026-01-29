"use client";

/**
 * Onboarding Wizard Modal
 * Main modal container that orchestrates the 4-step onboarding flow
 */

import { useEffect } from "react";
import { useOnboarding } from "./onboarding-provider";
import { RoleSelectionStep } from "./steps/role-selection-step";
import { SubscriptionPlanStep } from "./steps/subscription-plan-step";
import { RecruiterProfileStep } from "./steps/recruiter-profile-step";
import { CompanyInfoStep } from "./steps/company-info-step";
import { CompletionStep } from "./steps/completion-step";

export function OnboardingWizardModal() {
    const { state, loading, persisting } = useOnboarding();

    // Block body scroll when modal is open
    useEffect(() => {
        if (state.isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [state.isModalOpen]);

    // Show loading spinner while loading state from database
    if (loading) {
        return (
            <>
                <div className="fixed inset-0 bg-black/50 z-998" />
                <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
                    <div className="bg-base-100 rounded-box shadow p-8 max-w-md w-full">
                        <div className="flex items-center justify-center py-8">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <span className="ml-3">
                                Loading your progress...
                            </span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!state.isModalOpen) {
        return null;
    }

    // Dynamic step calculation based on role
    // Company Admins skip step 2 (Subscription Plan), reducing total steps to 3
    const isCompanyAdmin = state.selectedRole === "company_admin";
    const totalSteps = isCompanyAdmin ? 3 : 4;

    // Adjust display step for Company Admins (Internal step 3 -> Display step 2, etc.)
    let displayStep = state.currentStep;
    if (isCompanyAdmin && state.currentStep >= 3) {
        displayStep = state.currentStep - 1;
    }

    return (
        <>
            {/* Modal Backdrop - Non-dismissible, blocks all interaction */}
            <div className="fixed inset-0 bg-black/50 z-998" />

            {/* Modal Container */}
            <div className="fixed inset-0 z-999 flex items-center justify-center p-4 overflow-y-auto max-w-fit mx-auto">
                <div className="bg-base-100 rounded-box shadow w-full max-h-[90vh] overflow-y-auto p-6 relative">
                    {/* Progress Indicator */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                                Step {displayStep} of {totalSteps}
                            </span>
                            <div className="flex items-center gap-2">
                                {persisting && (
                                    <div className="flex items-center text-sm text-base-content/60">
                                        <span className="loading loading-spinner loading-xs mr-1"></span>
                                        Saving...
                                    </div>
                                )}
                                <span className="text-sm text-base-content/70">
                                    {Math.round(
                                        (displayStep / totalSteps) * 100,
                                    )}
                                    % Complete
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(displayStep / totalSteps) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="py-4">
                        {state.currentStep === 1 && <RoleSelectionStep />}
                        {state.currentStep === 2 && <SubscriptionPlanStep />}
                        {state.currentStep === 3 &&
                            state.selectedRole === "recruiter" && (
                                <RecruiterProfileStep />
                            )}
                        {state.currentStep === 3 &&
                            state.selectedRole === "company_admin" && (
                                <CompanyInfoStep />
                            )}
                        {state.currentStep === 4 && <CompletionStep />}
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 pt-4 border-t border-base-300">
                        <div className="text-xs text-center text-base-content/60 space-y-1">
                            <p className="mb-2">
                                Your progress is automatically saved and synced
                                across devices
                            </p>
                            <p>
                                Need help? Contact support at{" "}
                                <a
                                    href="mailto:help@splits.network"
                                    className="link link-primary"
                                >
                                    help@splits.network
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
