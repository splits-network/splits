"use client";

/**
 * Step 4: Completion Step (Memphis Edition)
 * Two modes:
 *   A) Post-submission celebration with quick-start action grid
 *   B) Pre-submission review with enhanced summary and "what happens next"
 */

import { useOnboarding } from "../onboarding-provider";
import { Button } from "@splits-network/memphis-ui";
import { ButtonLoading } from "@splits-network/shared-ui";

/** Quick-start action card */
interface QuickAction {
    icon: string;
    label: string;
    borderColor: string;
}

const RECRUITER_ACTIONS: QuickAction[] = [
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass",
        label: "Browse Open Roles",
        borderColor: "border-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-user-plus",
        label: "Add a Candidate",
        borderColor: "border-teal",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        label: "Find Split Partners",
        borderColor: "border-purple",
    },
];

const COMPANY_ACTIONS: QuickAction[] = [
    {
        icon: "fa-duotone fa-regular fa-plus",
        label: "Post Your First Role",
        borderColor: "border-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        label: "Browse Recruiters",
        borderColor: "border-teal",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        label: "View Your Dashboard",
        borderColor: "border-purple",
    },
];

export function CompletionStep() {
    const { state, actions } = useOnboarding();
    const isCompleted = state.status === "completed";
    const isRecruiter = state.selectedRole === "recruiter";
    const quickActions = isRecruiter ? RECRUITER_ACTIONS : COMPANY_ACTIONS;

    const handleComplete = async () => {
        await actions.submitOnboarding();
    };

    const handleBack = () => {
        actions.setStep(3);
    };

    // ── A) Success / Celebration View ──
    if (isCompleted) {
        return (
            <div className="space-y-8 max-w-2xl mx-auto text-center py-4">
                {/* Party Horn Icon */}
                <div className="w-24 h-24 mx-auto flex items-center justify-center border-4 border-coral bg-coral">
                    <i className="fa-duotone fa-regular fa-party-horn text-4xl text-cream"></i>
                </div>

                {/* Success Headline */}
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-dark mb-3">
                        You&apos;re{" "}
                        <span className="text-teal">Live.</span>
                        <br />
                        The Marketplace Is Waiting.
                    </h2>
                    <p className="text-dark/60 text-sm max-w-md mx-auto">
                        {isRecruiter
                            ? "Your profile is active and your subscription is running. Browse roles, submit candidates, and start earning."
                            : "Your company workspace is ready. Post your first role and watch recruiters compete to fill it."}
                    </p>
                </div>

                {/* Quick-Start Action Grid */}
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50 mb-4">
                        Quick Start
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {quickActions.map((action) => (
                            <div
                                key={action.label}
                                className={[
                                    "p-5 border-4 text-center transition-all duration-150",
                                    "hover:-translate-y-1 cursor-pointer",
                                    action.borderColor,
                                ].join(" ")}
                            >
                                <div
                                    className={[
                                        "w-12 h-12 mx-auto mb-3 flex items-center justify-center",
                                        action.borderColor === "border-coral"
                                            ? "bg-coral"
                                            : action.borderColor ===
                                                "border-teal"
                                              ? "bg-teal"
                                              : "bg-purple",
                                    ].join(" ")}
                                >
                                    <i
                                        className={`${action.icon} text-lg text-cream`}
                                    ></i>
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.15em] text-dark">
                                    {action.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Go to Dashboard CTA */}
                <div>
                    <Button
                        color="coral"
                        variant="solid"
                        type="button"
                        onClick={() => actions.closeModal()}
                    >
                        <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // ── B) Review / Pre-Submission View ──
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Heading */}
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4 border-teal bg-teal">
                    <i className="fa-duotone fa-regular fa-clipboard-check text-2xl text-cream"></i>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-dark">
                    Review &amp; Launch
                </h2>
                <p className="text-dark/60 mt-2 text-sm">
                    Everything looks good? Hit launch and you&apos;re in.
                </p>
            </div>

            {/* Summary Card */}
            <div className="border-4 border-dark p-6 space-y-4">
                {/* Role Summary */}
                <div className="flex items-center gap-4 pb-4 border-b-4 border-dark/10">
                    <div
                        className={[
                            "w-14 h-14 flex items-center justify-center border-4",
                            isRecruiter
                                ? "bg-coral border-coral"
                                : "bg-teal border-teal",
                        ].join(" ")}
                    >
                        <i
                            className={[
                                "fa-duotone fa-regular text-xl text-cream",
                                isRecruiter ? "fa-user-tie" : "fa-building",
                            ].join(" ")}
                        ></i>
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                            Role
                        </p>
                        <p className="font-black text-lg text-dark">
                            {isRecruiter ? "Recruiter" : "Company Admin"}
                        </p>
                    </div>
                </div>

                {/* Recruiter Profile Summary */}
                {isRecruiter && state.recruiterProfile && (
                    <div className="space-y-3">
                        {state.recruiterProfile.phone && (
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Phone
                                </p>
                                <p className="font-semibold text-dark">
                                    {state.recruiterProfile.phone}
                                </p>
                            </div>
                        )}
                        {state.recruiterProfile.industries &&
                            state.recruiterProfile.industries.length > 0 && (
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                        Industries
                                    </p>
                                    <p className="font-semibold text-dark">
                                        {state.recruiterProfile.industries.join(
                                            ", ",
                                        )}
                                    </p>
                                </div>
                            )}
                        {state.recruiterProfile.specialties &&
                            state.recruiterProfile.specialties.length > 0 && (
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                        Specialties
                                    </p>
                                    <p className="font-semibold text-dark">
                                        {state.recruiterProfile.specialties.join(
                                            ", ",
                                        )}
                                    </p>
                                </div>
                            )}
                        {state.recruiterProfile.teamInviteCode && (
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Team Invite Code
                                </p>
                                <p className="font-semibold text-dark">
                                    {state.recruiterProfile.teamInviteCode}
                                </p>
                            </div>
                        )}
                        {state.recruiterProfile.bio && (
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Bio
                                </p>
                                <p className="font-semibold text-dark line-clamp-3">
                                    {state.recruiterProfile.bio}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Subscription Plan Summary */}
                {isRecruiter && state.selectedPlan && (
                    <div className="pt-4 border-t-4 border-dark/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal border-4 border-teal flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-credit-card text-cream"></i>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Subscription Plan
                                </p>
                                <p className="font-black text-dark">
                                    {state.selectedPlan.name}
                                </p>
                            </div>
                            {state.selectedPlan.price_monthly > 0 ? (
                                <div className="text-right">
                                    <p className="font-black text-dark">
                                        ${state.selectedPlan.price_monthly}/mo
                                    </p>
                                    <p className="text-xs font-bold text-teal">
                                        {state.selectedPlan.trial_days || 14}
                                        -day free trial
                                    </p>
                                </div>
                            ) : (
                                <span className="px-3 py-1 bg-teal text-cream text-xs font-black uppercase tracking-[0.15em]">
                                    Free
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Company Info Summary */}
                {!isRecruiter && state.companyInfo && (
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                Company Name
                            </p>
                            <p className="font-black text-lg text-dark">
                                {state.companyInfo.name}
                            </p>
                        </div>
                        {state.companyInfo.website && (
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Website
                                </p>
                                <p className="font-semibold text-dark">
                                    {state.companyInfo.website}
                                </p>
                            </div>
                        )}
                        {state.companyInfo.headquarters_location && (
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Location
                                </p>
                                <p className="font-semibold text-dark">
                                    {state.companyInfo.headquarters_location}
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Industry
                                </p>
                                <p className="font-semibold text-dark capitalize">
                                    {state.companyInfo.industry?.replace(
                                        "_",
                                        " ",
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Size
                                </p>
                                <p className="font-semibold text-dark">
                                    {state.companyInfo.size} employees
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Billing Terms
                                </p>
                                <p className="font-semibold text-dark capitalize">
                                    {state.companyInfo.billing_terms?.replace(
                                        "_",
                                        " ",
                                    ) || "net 30"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-dark/50">
                                    Billing Email
                                </p>
                                <p className="font-semibold text-dark text-ellipsis overflow-hidden">
                                    {state.companyInfo.billing_email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* What happens next — enhanced */}
            <div className="border-4 border-teal bg-teal/10 p-5">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-teal">
                        <i className="fa-duotone fa-regular fa-rocket text-sm text-cream"></i>
                    </div>
                    <div>
                        <p className="font-black uppercase tracking-[0.15em] text-sm text-dark">
                            What happens when you launch?
                        </p>
                        {isRecruiter ? (
                            <ul className="mt-2 space-y-1.5">
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-check text-sm text-teal"></i>
                                    <span className="text-sm text-dark/60">
                                        Your recruiter profile goes live instantly
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-check text-sm text-teal"></i>
                                    <span className="text-sm text-dark/60">
                                        Free trial starts — no card charged until it ends
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-check text-sm text-teal"></i>
                                    <span className="text-sm text-dark/60">
                                        Browse roles and submit candidates immediately
                                    </span>
                                </li>
                            </ul>
                        ) : (
                            <ul className="mt-2 space-y-1.5">
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-check text-sm text-teal"></i>
                                    <span className="text-sm text-dark/60">
                                        Your company workspace is created instantly
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-check text-sm text-teal"></i>
                                    <span className="text-sm text-dark/60">
                                        Post a role and recruiters start submitting
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-check text-sm text-teal"></i>
                                    <span className="text-sm text-dark/60">
                                        Track every submission from one dashboard
                                    </span>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Error */}
            {state.error && (
                <div className="border-4 border-coral bg-coral/10 p-4 flex items-center gap-3">
                    <i className="fa-duotone fa-regular fa-circle-exclamation text-coral"></i>
                    <span className="text-sm font-bold text-dark">
                        {state.error}
                    </span>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 justify-between">
                <Button
                    color="dark"
                    variant="outline"
                    type="button"
                    onClick={handleBack}
                    disabled={state.submitting}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                    Back
                </Button>
                <Button
                    color="coral"
                    variant="solid"
                    type="button"
                    onClick={handleComplete}
                    disabled={state.submitting}
                >
                    <ButtonLoading
                        loading={state.submitting}
                        text="Launch"
                        loadingText="Launching..."
                        icon="fa-duotone fa-regular fa-rocket"
                    />
                </Button>
            </div>
        </div>
    );
}
