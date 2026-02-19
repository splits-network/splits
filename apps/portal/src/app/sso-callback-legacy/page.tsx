"use client";

import { Suspense } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureUserInDatabase } from "@/lib/user-registration";
import { createAuthenticatedClient, createUnauthenticatedClient } from "@/lib/api-client";
import { getRecCodeFromCookie } from "@/hooks/use-rec-code";

type SSOStatus = "authenticating" | "creating_user" | "redirecting" | "error";

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

        // Capture user in local const so TypeScript retains narrowing in async closure
        const currentUser = user;

        async function ensureUserAndRedirect() {
            try {
                // Get token for API calls
                const token = await getToken();
                if (!token) {
                    throw new Error("Failed to get authentication token");
                }

                // Update status to creating user
                setStatus("creating_user");

                // Resolve rec_code from cookie (set by middleware when user first visited with ?rec_code=xxx)
                const recCode = getRecCodeFromCookie();
                let referredByRecruiterId: string | undefined;
                if (recCode) {
                    try {
                        const unauthClient = createUnauthenticatedClient();
                        const lookupResponse: any = await unauthClient.get(
                            `/recruiter-codes/lookup?code=${encodeURIComponent(recCode)}`
                        );
                        if (lookupResponse?.data?.is_valid) {
                            referredByRecruiterId = lookupResponse.data.recruiter_id;
                        }
                    } catch (lookupError) {
                        console.warn("[SSOCallback] Failed to resolve rec_code:", lookupError);
                    }
                }

                // Ensure user exists in database
                const result = await ensureUserInDatabase(token, {
                    clerk_user_id: currentUser.id,
                    email: currentUser.primaryEmailAddress?.emailAddress || "",
                    name: currentUser.fullName || currentUser.firstName || "",
                    image_url: currentUser.imageUrl,
                    referred_by_recruiter_id: referredByRecruiterId,
                });

                if (!result.success) {
                    // Log the error but don't block - onboarding will catch this
                    console.warn(
                        "[SSOCallback] User creation warning:",
                        result.error,
                    );
                }

                // Log rec_code usage after successful registration
                if (recCode && result.success && !result.wasExisting) {
                    try {
                        const authClient = createAuthenticatedClient(token);
                        await authClient.post("/recruiter-codes/log", {
                            code: recCode,
                        });
                    } catch (logError) {
                        console.warn("[SSOCallback] Failed to log rec_code usage:", logError);
                    }
                }

                // Update status to redirecting
                setStatus("redirecting");

                // Determine redirect destination
                const invitationId = searchParams.get("invitation_id");

                if (invitationId) {
                    // Redirect to invitation acceptance page
                    router.replace(
                        `/portal/accept-invitation?invitation_id=${invitationId}`,
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
        router,
        searchParams,
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    message: "Just a moment while we prepare your workspace.",
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
 * Handles OAuth/SSO callback from Clerk and ensures user records
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
