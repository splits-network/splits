"use client";

import { Suspense } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureUserAndCandidateInDatabase } from "@/lib/user-registration";

type SSOStatus =
    | "authenticating"
    | "creating_user"
    | "creating_candidate"
    | "redirecting"
    | "error";

/**
 * Inner component that uses useSearchParams - must be wrapped in Suspense
 */
function SSOCallbackInner() {
    const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
    const { user, isLoaded: userLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [status, setStatus] = useState<SSOStatus>("authenticating");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Track if we've already attempted user creation to prevent double execution
    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        // Wait for Clerk to fully load
        if (!authLoaded || !userLoaded) return;

        // Wait until user is signed in
        if (!isSignedIn || !user) return;

        // Prevent double execution
        if (hasAttemptedRef.current) return;
        hasAttemptedRef.current = true;

        async function ensureUserAndRedirect() {
            try {
                // Get token for API calls
                const token = await getToken();
                if (!token) {
                    throw new Error("Failed to get authentication token");
                }

                // Update status to creating user
                setStatus("creating_user");

                if (!user) {
                    throw new Error("User data is unavailable");
                }

                // Ensure user and candidate exist in database
                const result = await ensureUserAndCandidateInDatabase(token, {
                    clerk_user_id: user.id,
                    email: user.primaryEmailAddress?.emailAddress || "",
                    name: user.fullName || user.firstName || "",
                    image_url: user.imageUrl,
                });

                if (result.user && !result.candidate) {
                    // User exists but candidate doesn't - show creating candidate status
                    setStatus("creating_candidate");
                }

                if (!result.success) {
                    // Log the error but don't block - onboarding will catch this
                    console.warn(
                        "[SSOCallback] User/Candidate creation warning:",
                        result.error,
                    );
                }

                // Update status to redirecting
                setStatus("redirecting");

                // Determine redirect destination
                const redirectUrl = searchParams.get("redirect_url");
                const invitationId = searchParams.get("invitation_id");

                if (invitationId) {
                    // Redirect to invitation acceptance page
                    router.replace(
                        `/portal/accept-invitation?invitation_id=${invitationId}`,
                    );
                } else if (redirectUrl) {
                    // Redirect to specified URL (validate it's internal)
                    const isInternalUrl = redirectUrl.startsWith("/");
                    router.replace(
                        isInternalUrl ? redirectUrl : "/portal/dashboard",
                    );
                } else {
                    // Default redirect to dashboard
                    router.replace("/portal/dashboard");
                }
            } catch (error: any) {
                console.error("[SSOCallback] Error:", error);
                setErrorMessage(
                    error?.message || "An error occurred during sign in",
                );
                setStatus("error");

                // Even on error, redirect after a delay - onboarding provider will handle it
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
        getToken,
        router,
        searchParams,
    ]);

    // Render UI based on status
    const getStatusContent = () => {
        switch (status) {
            case "authenticating":
                return {
                    title: "Completing sign in...",
                    message: "Verifying your credentials.",
                    showSpinner: true,
                };
            case "creating_user":
                return {
                    title: "Setting up your account...",
                    message: "Just a moment while we prepare your profile.",
                    showSpinner: true,
                };
            case "creating_candidate":
                return {
                    title: "Creating your candidate profile...",
                    message: "Almost there!",
                    showSpinner: true,
                };
            case "redirecting":
                return {
                    title: "Welcome!",
                    message: "Redirecting you to your dashboard...",
                    showSpinner: true,
                };
            case "error":
                return {
                    title: "Something went wrong",
                    message:
                        errorMessage ||
                        "We encountered an issue. Redirecting anyway...",
                    showSpinner: false,
                };
            default:
                return {
                    title: "Please wait...",
                    message: "Processing your request.",
                    showSpinner: true,
                };
        }
    };

    const content = getStatusContent();

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body items-center text-center">
                    {content.showSpinner ? (
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-3xl text-error"></i>
                        </div>
                    )}
                    <h2 className="card-title mt-4">{content.title}</h2>
                    <p className="text-sm text-base-content/70">
                        {content.message}
                    </p>
                    {status === "error" && (
                        <p className="text-xs text-base-content/50 mt-2">
                            Redirecting in a few seconds...
                        </p>
                    )}
                </div>
            </div>
            <AuthenticateWithRedirectCallback />
        </div>
    );
}

/**
 * Loading fallback for Suspense boundary
 */
function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body items-center text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <h2 className="card-title mt-4">Completing sign in...</h2>
                    <p className="text-sm text-base-content/70">
                        Verifying your credentials.
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * SSO Callback Page
 *
 * Handles OAuth/SSO callback from Clerk and ensures user/candidate records
 * are created in our database before redirecting.
 *
 * Wrapped in Suspense for useSearchParams compatibility with Next.js 16.
 */
export default function SSOCallbackPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SSOCallbackInner />
        </Suspense>
    );
}
