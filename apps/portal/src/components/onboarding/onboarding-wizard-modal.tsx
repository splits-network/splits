"use client";

/**
 * Onboarding Wizard Modal (Memphis Edition)
 * Full-screen Memphis onboarding experience with geometric shapes,
 * StepProgress indicator, and dark background
 */

import { useEffect } from "react";
import { useOnboarding } from "./onboarding-provider";
import { StepProgress, GeometricDecoration, Badge } from "@splits-network/memphis-ui";
import type { Step } from "@splits-network/memphis-ui";
import { RoleSelectionStep } from "./steps/role-selection-step";
import { SubscriptionPlanStep } from "./steps/subscription-plan-step";
import { RecruiterProfileStep } from "./steps/recruiter-profile-step";
import { CompanyInfoStep } from "./steps/company-info-step";
import { CompletionStep } from "./steps/completion-step";

/** Step definitions for recruiter flow (4 steps) */
const RECRUITER_STEPS: Step[] = [
    { label: "Who You Are", icon: "fa-duotone fa-regular fa-hand-wave", accent: "coral" },
    { label: "Your Plan", icon: "fa-duotone fa-regular fa-credit-card", accent: "teal" },
    { label: "Your Profile", icon: "fa-duotone fa-regular fa-user", accent: "yellow" },
    { label: "Go Live", icon: "fa-duotone fa-regular fa-rocket", accent: "purple" },
];

/** Step definitions for company admin flow (3 steps, skip plan) */
const COMPANY_STEPS: Step[] = [
    { label: "Who You Are", icon: "fa-duotone fa-regular fa-hand-wave", accent: "coral" },
    { label: "Your Company", icon: "fa-duotone fa-regular fa-building", accent: "teal" },
    { label: "Go Live", icon: "fa-duotone fa-regular fa-rocket", accent: "yellow" },
];

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
                <div className="fixed inset-0 bg-dark z-998" />
                <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
                    <div className="bg-cream border-4 border-dark p-8 max-w-md w-full">
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className="w-12 h-12 border-4 border-teal border-t-transparent animate-spin" />
                            <span className="text-sm font-black uppercase tracking-[0.15em] text-dark">
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
    const isCompanyAdmin = state.selectedRole === "company_admin";
    const steps = isCompanyAdmin ? COMPANY_STEPS : RECRUITER_STEPS;

    // Map internal currentStep to StepProgress 0-based index
    let stepIndex: number;
    if (isCompanyAdmin) {
        // Company admin: step 1 -> index 0, step 3 -> index 1, step 4 -> index 2
        if (state.currentStep <= 1) stepIndex = 0;
        else if (state.currentStep <= 3) stepIndex = 1;
        else stepIndex = 2;
    } else {
        // Recruiter: step 1 -> index 0, step 2 -> index 1, step 3 -> index 2, step 4 -> index 3
        stepIndex = state.currentStep - 1;
    }

    const isCompleted = state.status === "completed";

    return (
        <>
            {/* Full-screen dark backdrop */}
            <div className="fixed inset-0 bg-dark z-998" />

            {/* Floating Memphis geometric shapes */}
            <div className="fixed inset-0 z-998 pointer-events-none overflow-hidden">
                <GeometricDecoration
                    shape="circle"
                    color="coral"
                    size={80}
                    className="absolute top-[8%] left-[5%] opacity-15"
                />
                <GeometricDecoration
                    shape="square"
                    color="teal"
                    size={60}
                    className="absolute top-[55%] right-[7%] opacity-15"
                />
                <GeometricDecoration
                    shape="triangle"
                    color="yellow"
                    size={50}
                    className="absolute bottom-[12%] left-[10%] opacity-15"
                />
                <GeometricDecoration
                    shape="cross"
                    color="purple"
                    size={55}
                    className="absolute top-[22%] right-[15%] opacity-15"
                />
                <GeometricDecoration
                    shape="zigzag"
                    color="coral"
                    size={80}
                    className="absolute bottom-[25%] right-[30%] opacity-15"
                />
                <GeometricDecoration
                    shape="circle"
                    color="teal"
                    size={40}
                    className="absolute top-[70%] left-[25%] opacity-15"
                />
                <GeometricDecoration
                    shape="square"
                    color="yellow"
                    size={35}
                    className="absolute top-[15%] left-[40%] opacity-15"
                />
                <GeometricDecoration
                    shape="cross"
                    color="coral"
                    size={45}
                    className="absolute bottom-[8%] right-[12%] opacity-15"
                />
            </div>

            {/* Modal Container */}
            <div className="fixed inset-0 z-999 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-cream border-4 border-dark w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
                    {/* StepProgress Header */}
                    <div className="p-6 border-b-4 border-dark">
                        <StepProgress
                            steps={steps}
                            currentStep={stepIndex}
                            completed={isCompleted}
                        />
                    </div>

                    {/* Saving Indicator */}
                    {persisting && (
                        <div className="absolute top-2 right-2 z-10">
                            <Badge color="teal" size="sm">
                                <i className="fa-duotone fa-regular fa-spinner-third fa-spin mr-1"></i>
                                Saving
                            </Badge>
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="p-8">
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

                    {/* Help Text Footer */}
                    <div className="p-4 border-t-4 border-dark">
                        <div className="text-sm text-center text-dark/60 space-y-1">
                            <p className="mb-2 font-bold uppercase tracking-[0.15em]">
                                Your progress is saved automatically. Close the tab, switch devices, come back whenever.
                            </p>
                            <p>
                                Need help?{" "}
                                <a
                                    href="mailto:help@splits.network"
                                    className="text-teal font-bold underline"
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
