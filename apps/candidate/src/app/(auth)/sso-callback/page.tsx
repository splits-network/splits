"use client";

import { Suspense, useRef } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type SSOStatus =
    | "authenticating"
    | "setting_up"
    | "redirecting"
    | "error";

const STEPS = [
    {
        key: "authenticating",
        label: "Verify",
        icon: "fa-duotone fa-regular fa-shield-check",
    },
    {
        key: "setting_up",
        label: "Account",
        icon: "fa-duotone fa-regular fa-user-plus",
    },
    {
        key: "redirecting",
        label: "Enter",
        icon: "fa-duotone fa-regular fa-arrow-right-to-bracket",
    },
] as const;

const STATS = [
    {
        value: "3,200+",
        label: "Active roles",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        value: "12 days",
        label: "Average time to first interview",
        icon: "fa-duotone fa-regular fa-calendar-check",
    },
    {
        value: "100%",
        label: "Visibility into your pipeline",
        icon: "fa-duotone fa-regular fa-eye",
    },
];

function getStepIndex(status: SSOStatus): number {
    switch (status) {
        case "authenticating":
            return 0;
        case "setting_up":
            return 1;
        case "redirecting":
            return 2;
        case "error":
            return -1;
        default:
            return 0;
    }
}

function SSOCallbackInner() {
    const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
    const { user, isLoaded: userLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mainRef = useRef<HTMLDivElement>(null);

    const [status, setStatus] = useState<SSOStatus>("authenticating");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        if (!authLoaded || !userLoaded) return;
        if (!isSignedIn || !user) return;
        if (hasAttemptedRef.current) return;
        hasAttemptedRef.current = true;

        async function ensureUserAndRedirect() {
            try {
                const token = await getToken();
                if (!token) {
                    throw new Error("Failed to get authentication token");
                }

                if (!user) {
                    throw new Error("User data is unavailable");
                }

                setStatus("setting_up");

                const client = createAuthenticatedClient(token);
                await client.post("/onboarding/init", {
                    email: user.primaryEmailAddress?.emailAddress || "",
                    name: user.fullName || user.firstName || "",
                    image_url: user.imageUrl,
                    source_app: "candidate",
                });

                setStatus("redirecting");

                const redirectUrl = searchParams.get("redirect_url");
                const invitationId = searchParams.get("invitation_id");

                if (invitationId) {
                    const invitationRedirectUrl = `/portal/accept-invitation?invitation_id=${invitationId}`;
                    router.replace(invitationRedirectUrl);
                } else if (redirectUrl) {
                    const isInternalUrl = redirectUrl.startsWith("/");
                    if (isInternalUrl) {
                        // Chain redirect_url through onboarding so new users
                        // return to the intended page after completing onboarding
                        router.replace(
                            `/onboarding?redirect_url=${encodeURIComponent(redirectUrl)}`,
                        );
                    } else {
                        router.replace("/onboarding");
                    }
                } else {
                    router.replace("/onboarding");
                }
            } catch (error: any) {
                console.error("[SSO_CALLBACK] Error:", error);
                setErrorMessage(
                    error?.message || "An error occurred during sign in",
                );
                setStatus("error");

                setTimeout(() => {
                    router.replace("/onboarding");
                }, 3000);
            }
        }

        ensureUserAndRedirect();
    }, [
        authLoaded,
        userLoaded,
        isSignedIn,
        user,
        router,
        searchParams,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ]);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                return;

            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            const logo = $1(".sso-logo");
            if (logo)
                tl.fromTo(
                    logo,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.5 },
                );

            const heading = $1(".sso-heading");
            if (heading)
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.3",
                );

            const statusCard = $1(".sso-status");
            if (statusCard)
                tl.fromTo(
                    statusCard,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.2",
                );

            const steps = $(".sso-step");
            if (steps.length)
                tl.fromTo(
                    steps,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
                    "-=0.2",
                );

            const stats = $(".sso-stat");
            if (stats.length)
                tl.fromTo(
                    stats,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
                    "-=0.2",
                );

            const testimonial = $1(".sso-testimonial");
            if (testimonial)
                tl.fromTo(
                    testimonial,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4 },
                    "-=0.1",
                );
        },
        { scope: mainRef },
    );

    const getStatusContent = () => {
        switch (status) {
            case "authenticating":
                return {
                    title: "Verifying credentials",
                    message:
                        "Confirming your identity. This only takes a moment.",
                    showSpinner: true,
                };
            case "setting_up":
                return {
                    title: "Setting up your account",
                    message:
                        "Creating your account and candidate profile.",
                    showSpinner: true,
                };
            case "redirecting":
                return {
                    title: "You're in",
                    message: "Redirecting to your dashboard now.",
                    showSpinner: true,
                };
            case "error":
                return {
                    title: "Authentication failed",
                    message:
                        errorMessage ||
                        "Something went wrong during sign-in. Redirecting you to try again.",
                    showSpinner: false,
                };
            default:
                return {
                    title: "Verifying credentials",
                    message:
                        "Confirming your identity with the authentication provider.",
                    showSpinner: true,
                };
        }
    };

    const content = getStatusContent();
    const currentStepIndex = getStepIndex(status);

    return (
        <div ref={mainRef} className="min-h-screen flex">
            {/* Left Panel — Status Display */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-base-100">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="sso-logo opacity-0 mb-10">
                        <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center font-black text-lg">
                            A
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="sso-heading opacity-0 mb-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                            Applicant Network
                        </p>
                        <h1 className="text-3xl font-black tracking-tight mb-2">
                            {content.title}
                        </h1>
                        <p className="text-base-content/50">
                            {content.message}
                        </p>
                    </div>

                    {/* Status Card */}
                    <div className="sso-status opacity-0">
                        {status === "error" ? (
                            <div className="border-l-4 border-error bg-error/5 p-6">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-circle-exclamation text-xl text-error" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base-content">
                                            {content.title}
                                        </p>
                                        <p className="text-sm text-base-content/60">
                                            {content.message}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-base-content/40 mt-3">
                                    Redirecting automatically in a few
                                    seconds.
                                </p>
                            </div>
                        ) : (
                            <div className="border-l-4 border-primary bg-base-200 p-6">
                                <div className="flex items-center gap-4">
                                    <span className="loading loading-spinner loading-lg text-primary flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-base-content">
                                            {content.title}
                                        </p>
                                        <p className="text-sm text-base-content/60">
                                            {content.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step Progress */}
                    <div className="flex items-center gap-2 mt-8">
                        {STEPS.map((step, i) => (
                            <div
                                key={step.key}
                                className="sso-step opacity-0 flex items-center gap-2 flex-1"
                            >
                                <div
                                    className={`w-8 h-8 flex items-center justify-center text-sm flex-shrink-0 transition-colors ${
                                        status === "error"
                                            ? "bg-base-300 text-base-content/30"
                                            : i < currentStepIndex
                                              ? "bg-success text-success-content"
                                              : i === currentStepIndex
                                                ? "bg-primary text-primary-content"
                                                : "bg-base-300 text-base-content/30"
                                    }`}
                                >
                                    {status !== "error" &&
                                    i < currentStepIndex ? (
                                        <i className="fa-solid fa-check text-sm" />
                                    ) : (
                                        <i className={`${step.icon} text-sm`} />
                                    )}
                                </div>
                                <span
                                    className={`text-sm font-semibold hidden sm:inline ${
                                        status === "error"
                                            ? "text-base-content/30"
                                            : i <= currentStepIndex
                                              ? "text-base-content"
                                              : "text-base-content/30"
                                    }`}
                                >
                                    {step.label}
                                </span>
                                {i < STEPS.length - 1 && (
                                    <div
                                        className={`flex-1 h-px mx-1 ${
                                            status !== "error" &&
                                            i < currentStepIndex
                                                ? "bg-success"
                                                : "bg-base-300"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Branding */}
            <div className="hidden lg:flex lg:w-2/5 bg-neutral text-neutral-content flex-col justify-between p-12 relative">
                <div
                    className="absolute top-0 left-0 w-full h-full bg-primary/5"
                    style={{
                        clipPath: "polygon(0 0,100% 0,100% 100%,20% 100%)",
                    }}
                />
                <div className="relative z-10">
                    <h2 className="text-3xl font-black leading-tight tracking-tight mb-4">
                        Your career, represented
                        <br />
                        <span className="text-primary">by specialists.</span>
                    </h2>
                    <p className="text-sm text-neutral-content/40 leading-relaxed max-w-sm">
                        Multiple recruiters compete to place you in the right
                        role. You stay informed at every stage, and your
                        profile works for you across the entire network.
                    </p>
                </div>

                <div className="relative z-10 space-y-4">
                    {STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="sso-stat opacity-0 flex items-center gap-4 p-4 bg-neutral-content/5"
                        >
                            <div className="w-10 h-10 bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <i
                                    className={`${stat.icon} text-primary`}
                                />
                            </div>
                            <div>
                                <div className="text-lg font-black">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-neutral-content/40">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="sso-testimonial opacity-0 relative z-10">
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

            {/* Hidden Clerk callback handler */}
            <AuthenticateWithRedirectCallback />
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-base-100">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center font-black text-lg">
                            A
                        </div>
                    </div>
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                            Applicant Network
                        </p>
                        <h1 className="text-3xl font-black tracking-tight mb-2">
                            Verifying credentials
                        </h1>
                        <p className="text-base-content/50">
                            Confirming your identity with the authentication
                            provider.
                        </p>
                    </div>
                    <div className="border-l-4 border-primary bg-base-200 p-6">
                        <div className="flex items-center gap-4">
                            <span className="loading loading-spinner loading-lg text-primary flex-shrink-0" />
                            <div>
                                <p className="font-bold text-base-content">
                                    Verifying credentials
                                </p>
                                <p className="text-sm text-base-content/60">
                                    Confirming your identity with the
                                    authentication provider.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex lg:w-2/5 bg-neutral text-neutral-content flex-col justify-center items-center p-12 relative">
                <div
                    className="absolute top-0 left-0 w-full h-full bg-primary/5"
                    style={{
                        clipPath: "polygon(0 0,100% 0,100% 100%,20% 100%)",
                    }}
                />
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center font-black text-2xl mx-auto mb-4">
                        A
                    </div>
                    <p className="text-sm text-neutral-content/40">
                        Applicant Network
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SSOCallbackPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SSOCallbackInner />
        </Suspense>
    );
}
