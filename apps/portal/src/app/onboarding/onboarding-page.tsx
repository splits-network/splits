"use client";

/**
 * Full-Page Onboarding Wizard (Basel Edition)
 *
 * Split-screen layout matching the SSO callback design language:
 * - Right panel (dark): branding, vertical step progress, testimonial
 * - Left panel (light): step content, navigation
 *
 * Covers the root Header/Footer via fixed positioning.
 * GSAP entrance animation on mount.
 */

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useOnboarding } from "./use-onboarding";
import { SplashLoading } from "@splits-network/shared-ui";

// Steps
import { RoleStep } from "./steps/role-step";
import { PlanStep } from "./steps/plan-step";
import { RecruiterProfileStep } from "./steps/recruiter-profile-step";
import { CompanyInfoStep } from "./steps/company-info-step";
import { ReviewStep } from "./steps/review-step";
import { SuccessStep } from "./steps/success-step";

/* ─── Step Definitions ──────────────────────────────────────────────────── */

const RECRUITER_STEPS = [
    { id: 1, label: "Who You Are", icon: "fa-duotone fa-regular fa-hand-wave" },
    { id: 2, label: "Your Plan", icon: "fa-duotone fa-regular fa-credit-card" },
    { id: 3, label: "Your Profile", icon: "fa-duotone fa-regular fa-user" },
    { id: 4, label: "Review", icon: "fa-duotone fa-regular fa-clipboard-check" },
    { id: 5, label: "Go Live", icon: "fa-duotone fa-regular fa-rocket" },
];

const COMPANY_STEPS = [
    { id: 1, label: "Who You Are", icon: "fa-duotone fa-regular fa-hand-wave" },
    { id: 3, label: "Your Company", icon: "fa-duotone fa-regular fa-building" },
    { id: 4, label: "Review", icon: "fa-duotone fa-regular fa-clipboard-check" },
    { id: 5, label: "Go Live", icon: "fa-duotone fa-regular fa-rocket" },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export function OnboardingPage() {
    const mainRef = useRef<HTMLDivElement>(null);
    const {
        state,
        actions,
        initStatus,
        initMessage,
        persisting,
        handleRetry,
        handleSignOut,
    } = useOnboarding();

    // Determine step list based on role
    const steps =
        state.selectedRole === "company_admin" ? COMPANY_STEPS : RECRUITER_STEPS;

    // Map currentStep to index in the visible step list
    const activeStepIndex = steps.findIndex((s) => s.id === state.currentStep);

    // ── GSAP entrance animation ──
    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                // Make everything visible
                mainRef.current
                    .querySelectorAll(".ob-anim")
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = "1";
                    });
                return;
            }

            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            const logo = $1(".ob-logo");
            if (logo)
                tl.fromTo(
                    logo,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.5 },
                );

            const heading = $1(".ob-heading");
            if (heading)
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.3",
                );

            const stepItems = $(".ob-step-item");
            if (stepItems.length)
                tl.fromTo(
                    stepItems,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
                    "-=0.2",
                );

            const panel = $1(".ob-panel");
            if (panel)
                tl.fromTo(
                    panel,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.3",
                );

            const testimonial = $1(".ob-testimonial");
            if (testimonial)
                tl.fromTo(
                    testimonial,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4 },
                    "-=0.1",
                );
        },
        { scope: mainRef, dependencies: [initStatus] },
    );

    // ── Loading state ──
    if (initStatus === "loading") {
        return (
            <div className="fixed inset-0 z-50 bg-neutral flex items-center justify-center">
                <SplashLoading message={initMessage} />
            </div>
        );
    }

    // ── Error state ──
    if (initStatus === "error") {
        return (
            <div className="fixed inset-0 z-50 bg-neutral flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-base-100 p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-error/10 flex items-center justify-center mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-3xl text-error" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight">
                            Unable to Load Profile
                        </h2>
                        <p className="text-base-content/50 text-sm mt-2">
                            {initMessage}
                        </p>
                        <p className="text-xs text-base-content/30 mt-2">
                            Please try again or sign out and sign back in.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                className="btn btn-primary"
                                onClick={handleRetry}
                            >
                                <i className="fa-duotone fa-regular fa-arrows-rotate" />
                                Try Again
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={handleSignOut}
                            >
                                <i className="fa-duotone fa-regular fa-right-from-bracket" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main layout ──
    return (
        <div
            ref={mainRef}
            className="fixed inset-0 z-50 flex bg-base-100"
        >
            {/* ── Content Panel (Left on desktop) ── */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Mobile step indicator */}
                <div className="lg:hidden flex items-center gap-1 p-4 border-b border-base-300 bg-base-200">
                    {steps.map((step, i) => (
                        <div
                            key={step.id}
                            className={`h-1 flex-1 transition-colors ${
                                activeStepIndex >= i
                                    ? "bg-primary"
                                    : "bg-base-300"
                            }`}
                        />
                    ))}
                    <span className="text-[10px] text-base-content/30 ml-2 whitespace-nowrap">
                        {activeStepIndex + 1}/{steps.length}
                    </span>
                </div>

                {/* Step content */}
                <div className="ob-panel ob-anim opacity-0 flex-1 flex items-start justify-center p-6 lg:p-12">
                    <div className="w-full max-w-lg">
                        {/* Persisting indicator */}
                        {persisting && (
                            <div className="flex items-center gap-2 text-xs text-base-content/30 mb-4">
                                <span className="loading loading-spinner loading-xs" />
                                Saving...
                            </div>
                        )}

                        {state.currentStep === 1 && (
                            <RoleStep
                                selectedRole={state.selectedRole}
                                actions={actions}
                            />
                        )}
                        {state.currentStep === 2 && (
                            <PlanStep state={state} actions={actions} />
                        )}
                        {state.currentStep === 3 &&
                            state.selectedRole === "recruiter" && (
                                <RecruiterProfileStep
                                    state={state}
                                    actions={actions}
                                />
                            )}
                        {state.currentStep === 3 &&
                            state.selectedRole === "company_admin" && (
                                <CompanyInfoStep
                                    state={state}
                                    actions={actions}
                                />
                            )}
                        {state.currentStep === 4 && (
                            <ReviewStep state={state} actions={actions} />
                        )}
                        {state.currentStep === 5 && (
                            <SuccessStep selectedRole={state.selectedRole} />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-base-300 text-center lg:text-left">
                    <p className="text-xs text-base-content/30">
                        Your progress is saved automatically.
                        Need help?{" "}
                        <a
                            href="mailto:help@splits.network"
                            className="text-primary hover:underline"
                        >
                            help@splits.network
                        </a>
                    </p>
                </div>
            </div>

            {/* ── Branding Panel (Right on desktop) ── */}
            <div className="hidden lg:flex lg:w-2/5 bg-neutral text-neutral-content flex-col justify-between p-12 relative">
                {/* Diagonal accent */}
                <div
                    className="absolute top-0 left-0 w-full h-full bg-primary/5"
                    style={{
                        clipPath: "polygon(0 0,100% 0,100% 100%,20% 100%)",
                    }}
                />

                {/* Top: Logo + Heading */}
                <div className="relative z-10">
                    <div className="ob-logo ob-anim opacity-0 mb-16">
                        <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center font-black text-lg">
                            S
                        </div>
                        <p className="text-sm font-semibold text-neutral-content/40 mt-3">
                            Splits Network
                        </p>
                    </div>
                    <div className="ob-heading ob-anim opacity-0">
                        <h2 className="text-3xl font-black leading-tight tracking-tight mb-4">
                            Join the network.
                            <br />
                            <span className="text-primary">Start earning.</span>
                        </h2>
                        <p className="text-sm text-neutral-content/40 leading-relaxed max-w-sm">
                            Set up your profile in minutes. We will match you
                            with companies and roles that fit your expertise.
                        </p>
                    </div>
                </div>

                {/* Middle: Step progress */}
                <div className="relative z-10 space-y-3">
                    {steps.map((step, i) => {
                        const isActive = activeStepIndex === i;
                        const isCompleted = activeStepIndex > i;

                        return (
                            <div
                                key={step.id}
                                className={`ob-step-item ob-anim opacity-0 flex items-center gap-3 px-4 py-3 transition-all ${
                                    isActive
                                        ? "bg-neutral-content/10"
                                        : isCompleted
                                          ? "opacity-60"
                                          : "opacity-30"
                                }`}
                            >
                                <div
                                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        isCompleted
                                            ? "bg-success text-success-content"
                                            : isActive
                                              ? "bg-primary text-primary-content"
                                              : "bg-neutral-content/10"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <i className="fa-solid fa-check" />
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                <span className="text-sm font-semibold">
                                    {step.label}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-primary" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom: Testimonial */}
                <div className="ob-testimonial ob-anim opacity-0 relative z-10">
                    <div className="border-l-4 border-primary pl-4">
                        <p className="text-sm text-neutral-content/60 italic mb-3">
                            &ldquo;We filled three senior engineering roles in
                            six weeks. All through splits with recruiters
                            we&apos;d never worked with before.&rdquo;
                        </p>
                        <p className="text-sm font-bold">Rachel Simmons</p>
                        <p className="text-sm text-neutral-content/40">
                            Talent Acquisition Director, Meridian Technologies
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
