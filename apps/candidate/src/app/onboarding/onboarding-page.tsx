"use client";

/**
 * Full-Page Onboarding Wizard (Basel Edition — Candidate)
 *
 * Split-screen layout matching the SSO callback design language:
 * - Left panel (light): step content, navigation
 * - Right panel (dark): branding, vertical step progress, testimonial
 *
 * Covers the root Header/Footer via fixed positioning.
 * GSAP entrance animation on mount.
 */

import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useOnboarding } from "./use-onboarding";
import { SplashLoading } from "@splits-network/shared-ui";

// Steps
import { WelcomeStep } from "./steps/welcome-step";
import { ContactStep } from "./steps/contact-step";
import { ResumeStep } from "./steps/resume-step";
import { PreferencesStep } from "./steps/preferences-step";
import { ReviewStep } from "./steps/review-step";
import { SuccessStep } from "./steps/success-step";

/* ─── Step Definitions ──────────────────────────────────────────────────── */

const CANDIDATE_STEPS = [
    { id: 1, label: "Welcome", icon: "fa-duotone fa-regular fa-hand-wave" },
    { id: 2, label: "Your Profile", icon: "fa-duotone fa-regular fa-user" },
    { id: 3, label: "Resume", icon: "fa-duotone fa-regular fa-file-lines" },
    { id: 4, label: "Preferences", icon: "fa-duotone fa-regular fa-sliders" },
    {
        id: 5,
        label: "Review",
        icon: "fa-duotone fa-regular fa-clipboard-check",
    },
    { id: 6, label: "All Set", icon: "fa-duotone fa-regular fa-rocket" },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export function OnboardingPage() {
    const mainRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect_url");

    const {
        state,
        actions,
        initStatus,
        initMessage,
        persisting,
        handleRetry,
        handleSignOut,
    } = useOnboarding({ redirectUrl: redirectUrl || undefined });

    // Map currentStep to index in the step list
    const activeStepIndex = CANDIDATE_STEPS.findIndex(
        (s) => s.id === state.currentStep,
    );

    // ── GSAP entrance animation ──
    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
    if (initStatus === "loading" || initStatus === "creating_account") {
        return (
            <div className="fixed inset-0 z-50 bg-neutral flex items-center justify-center">
                <SplashLoading
                    message={
                        initStatus === "creating_account"
                            ? "Setting up your account..."
                            : initMessage
                    }
                />
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
        <div ref={mainRef} className="fixed inset-0 z-50 flex bg-base-100">
            {/* ── Content Panel (Left on desktop) ── */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Mobile step indicator */}
                <div className="lg:hidden flex items-center gap-1 p-4 border-b border-base-300 bg-base-200">
                    {CANDIDATE_STEPS.map((step, i) => (
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
                        {activeStepIndex + 1}/{CANDIDATE_STEPS.length}
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

                        {/* Skip button (steps 1-4 only) */}
                        {state.currentStep <= 4 && (
                            <div className="flex justify-end mb-4">
                                <button
                                    className="btn btn-ghost btn-sm text-base-content/40"
                                    onClick={() => actions.skipOnboarding()}
                                    disabled={state.submitting}
                                >
                                    Skip for now
                                    <i className="fa-solid fa-forward text-xs" />
                                </button>
                            </div>
                        )}

                        {state.currentStep === 1 && (
                            <WelcomeStep state={state} actions={actions} />
                        )}
                        {state.currentStep === 2 && (
                            <ContactStep state={state} actions={actions} />
                        )}
                        {state.currentStep === 3 && (
                            <ResumeStep state={state} actions={actions} />
                        )}
                        {state.currentStep === 4 && (
                            <PreferencesStep state={state} actions={actions} />
                        )}
                        {state.currentStep === 5 && (
                            <ReviewStep state={state} actions={actions} />
                        )}
                        {state.currentStep === 6 && (
                            <SuccessStep redirectUrl={redirectUrl || undefined} />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-base-300 text-center lg:text-left">
                    <p className="text-xs text-base-content/30">
                        Your progress is saved automatically. Need help?{" "}
                        <a
                            href="mailto:help@applicant.network"
                            className="text-primary hover:underline"
                        >
                            help@applicant.network
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
                            A
                        </div>
                        <p className="text-sm font-semibold text-neutral-content/40 mt-3">
                            Applicant Network
                        </p>
                    </div>
                    <div className="ob-heading ob-anim opacity-0">
                        <h2 className="text-3xl font-black leading-tight tracking-tight mb-4">
                            Your career, represented
                            <br />
                            <span className="text-primary">
                                by specialists.
                            </span>
                        </h2>
                        <p className="text-sm text-neutral-content/40 leading-relaxed max-w-sm">
                            Multiple recruiters compete to place you in the
                            right role. You stay informed at every stage, and
                            your profile works for you across the entire network.
                        </p>
                    </div>
                </div>

                {/* Middle: Step progress */}
                <div className="relative z-10 space-y-3">
                    {CANDIDATE_STEPS.map((step, i) => {
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
                            &ldquo;I had three recruiters presenting me to
                            different companies within a week. I knew exactly
                            where I stood with each one the entire
                            time.&rdquo;
                        </p>
                        <p className="text-sm font-bold">David Chen</p>
                        <p className="text-sm text-neutral-content/40">
                            Senior Product Manager
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
