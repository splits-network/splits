"use client";

import { Suspense, useRef } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    createAuthenticatedClient,
    createUnauthenticatedClient,
} from "@/lib/api-client";
import { getRecCodeFromCookie } from "@/hooks/use-rec-code";
import { useScrollReveal } from "@splits-network/basel-ui";

type SSOStatus = "authenticating" | "creating_user" | "redirecting" | "error";

const STEPS = [
    {
        key: "authenticating",
        label: "Verify",
        icon: "fa-duotone fa-regular fa-shield-check",
    },
    {
        key: "creating_user",
        label: "Setup",
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
        value: "2,000+",
        label: "Recruiters in the network",
        icon: "fa-duotone fa-regular fa-users",
    },
    {
        value: "450+",
        label: "Hiring companies",
        icon: "fa-duotone fa-regular fa-buildings",
    },
    {
        value: "98%",
        label: "Placement completion rate",
        icon: "fa-duotone fa-regular fa-chart-line",
    },
];

function getStepIndex(status: SSOStatus): number {
    switch (status) {
        case "authenticating":
            return 0;
        case "creating_user":
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

        const currentUser = user;

        async function ensureUserAndRedirect() {
            try {
                const token = await getToken();
                if (!token) {
                    throw new Error("Failed to get authentication token");
                }

                setStatus("creating_user");

                const recCode = getRecCodeFromCookie();
                let referredByRecruiterId: string | undefined;
                if (recCode) {
                    try {
                        const unauthClient = createUnauthenticatedClient();
                        const lookupResponse: any = await unauthClient.get(
                            `/recruiter-codes/lookup?code=${encodeURIComponent(recCode)}`,
                        );
                        if (lookupResponse?.data?.is_valid) {
                            referredByRecruiterId =
                                lookupResponse.data.recruiter_id;
                        }
                    } catch (lookupError) {
                        console.warn(
                            "[SSOCallback] Failed to resolve rec_code:",
                            lookupError,
                        );
                    }
                }

                const authClient = createAuthenticatedClient(token);
                const initResponse = await authClient.post<{
                    data: {
                        user: any;
                        was_existing: { user: boolean };
                    };
                }>("/onboarding/init", {
                    email: currentUser.primaryEmailAddress?.emailAddress || "",
                    name: currentUser.fullName || currentUser.firstName || "",
                    image_url: currentUser.imageUrl,
                    referred_by_recruiter_id: referredByRecruiterId,
                    source_app: "portal",
                });

                const userData = initResponse?.data?.user ?? null;
                const wasExisting =
                    initResponse?.data?.was_existing?.user ?? true;

                if (recCode && !wasExisting) {
                    try {
                        await authClient.post("/recruiter-codes/log", {
                            code: recCode,
                        });
                    } catch (logError) {
                        console.warn(
                            "[SSOCallback] Failed to log rec_code usage:",
                            logError,
                        );
                    }
                }

                setStatus("redirecting");

                const invitationId = searchParams.get("invitation_id");

                if (invitationId) {
                    router.replace(
                        `/portal/accept-invitation?invitation_id=${invitationId}`,
                    );
                } else if (userData?.onboarding_status !== "completed") {
                    // New or incomplete user → full-page onboarding wizard
                    router.replace("/onboarding");
                } else {
                    router.replace("/portal/dashboard");
                }
            } catch (error: any) {
                console.error("[SSOCallback] Error:", error);
                setErrorMessage(
                    error?.message || "An error occurred during sign in",
                );
                setStatus("error");

                setTimeout(() => {
                    router.replace("/portal/dashboard");
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

    useScrollReveal(mainRef);

    const getStatusContent = () => {
        switch (status) {
            case "authenticating":
                return {
                    title: "Verifying credentials",
                    message:
                        "Confirming your identity with the authentication provider.",
                    showSpinner: true,
                };
            case "creating_user":
                return {
                    title: "Setting up your account",
                    message:
                        "Creating your profile and configuring access permissions.",
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
                    <div className="scroll-reveal scale-in mb-10">
                        <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center font-black text-lg">
                            S
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="scroll-reveal fade-up mb-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                            Signing In
                        </p>
                        <h1 className="text-3xl font-black tracking-tight mb-2">
                            {content.title}
                        </h1>
                        <p className="text-base-content/50">
                            {content.message}
                        </p>
                    </div>

                    {/* Status Card */}
                    <div className="scroll-reveal fade-up">
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
                                    Redirecting automatically in a few seconds.
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
                                className="scroll-reveal fade-up flex items-center gap-2 flex-1"
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
                <div className="relative ">
                    <h2 className="text-3xl font-black leading-tight tracking-tight mb-4">
                        The network that makes
                        <br />
                        <span className="text-primary">split-fee work.</span>
                    </h2>
                    <p className="text-sm text-neutral-content/40 leading-relaxed max-w-sm">
                        Recruiters and companies operating on shared
                        infrastructure. One role posted once reaches every
                        qualified recruiter in the network.
                    </p>
                </div>

                <div className="relative  space-y-4">
                    {STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="scroll-reveal fade-up flex items-center gap-4 p-4 bg-neutral-content/5"
                        >
                            <div className="w-10 h-10 bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <i className={`${stat.icon} text-primary`} />
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

                <div className="scroll-reveal fade-up relative ">
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
                            S
                        </div>
                    </div>
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                            Signing In
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
                <div className="relative  text-center">
                    <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center font-black text-2xl mx-auto mb-4">
                        S
                    </div>
                    <p className="text-sm text-neutral-content/40">
                        Splits Network
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
