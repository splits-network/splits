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

    // DEBUG: Log environment and initial state on mount
    useEffect(() => {
        console.log('🚀 [SSO_CALLBACK_DEBUG] Component mounted');
        console.log('🔧 [SSO_CALLBACK_DEBUG] Environment variables:', {
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
            NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
            NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
            NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
        });
        console.log('🌐 [SSO_CALLBACK_DEBUG] Current URL:', window.location.href);
        console.log('🔗 [SSO_CALLBACK_DEBUG] Referrer:', document.referrer);
    }, []);

    useEffect(() => {
        // DEBUG: Log all state changes
        console.log('📱 [SSO_CALLBACK_DEBUG] Effect triggered:', {
            authLoaded,
            userLoaded,
            isSignedIn,
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            hasAttempted: hasAttemptedRef.current,
            currentUrl: window.location.href,
            searchParamsEntries: Object.fromEntries(searchParams.entries()),
        });

        // Wait for Clerk to fully load
        if (!authLoaded || !userLoaded) {
            console.log('⏳ [SSO_CALLBACK_DEBUG] Waiting for Clerk to load');
            return;
        }

        // Wait until user is signed in
        if (!isSignedIn || !user) {
            console.log('🚫 [SSO_CALLBACK_DEBUG] User not signed in yet');
            return;
        }

        // Prevent double execution
        if (hasAttemptedRef.current) {
            console.log('🔄 [SSO_CALLBACK_DEBUG] Already attempted user creation, skipping');
            return;
        }
        hasAttemptedRef.current = true;

        console.log('🚀 [SSO_CALLBACK_DEBUG] Starting user creation and redirect process');

        async function ensureUserAndRedirect() {
            try {
                console.log('🎯 [SSO_CALLBACK_DEBUG] Getting auth token...');
                // Get token for API calls
                const token = await getToken();
                if (!token) {
                    throw new Error("Failed to get authentication token");
                }
                console.log('✅ [SSO_CALLBACK_DEBUG] Got auth token:', token.substring(0, 20) + '...');

                // Update status to creating user
                console.log('👤 [SSO_CALLBACK_DEBUG] Setting status to creating_user');
                setStatus("creating_user");

                if (!user) {
                    throw new Error("User data is unavailable");
                }

                console.log('📊 [SSO_CALLBACK_DEBUG] User data:', {
                    id: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    name: user.fullName || user.firstName,
                    imageUrl: user.imageUrl,
                    createdAt: user.createdAt,
                });

                // Ensure user and candidate exist in database
                console.log('🔄 [SSO_CALLBACK_DEBUG] Creating user and candidate in database...');
                const result = await ensureUserAndCandidateInDatabase(token, {
                    clerk_user_id: user.id,
                    email: user.primaryEmailAddress?.emailAddress || "",
                    name: user.fullName || user.firstName || "",
                    image_url: user.imageUrl,
                });

                console.log('📋 [SSO_CALLBACK_DEBUG] Database creation result:', {
                    success: result.success,
                    hasUser: !!result.user,
                    hasCandidate: !!result.candidate,
                    error: result.error,
                });

                if (result.user && !result.candidate) {
                    // User exists but candidate doesn't - show creating candidate status
                    console.log('🎭 [SSO_CALLBACK_DEBUG] Setting status to creating_candidate');
                    setStatus("creating_candidate");
                }

                if (!result.success) {
                    // Log the error but don't block - onboarding will catch this
                    console.warn(
                        "[SSO_CALLBACK_DEBUG] User/Candidate creation warning:",
                        result.error,
                    );
                }

                // Update status to redirecting
                console.log('🚀 [SSO_CALLBACK_DEBUG] Setting status to redirecting');
                setStatus("redirecting");

                // Determine redirect destination
                const redirectUrl = searchParams.get("redirect_url");
                const invitationId = searchParams.get("invitation_id");

                console.log('🎯 [SSO_CALLBACK_DEBUG] Redirect parameters:', {
                    redirectUrl,
                    invitationId,
                });

                if (invitationId) {
                    // Redirect to invitation acceptance page
                    const invitationRedirectUrl = `/portal/accept-invitation?invitation_id=${invitationId}`;
                    console.log('💌 [SSO_CALLBACK_DEBUG] Redirecting to invitation acceptance:', invitationRedirectUrl);
                    router.replace(invitationRedirectUrl);
                } else if (redirectUrl) {
                    // Redirect to specified URL (validate it's internal)
                    const isInternalUrl = redirectUrl.startsWith("/");
                    const finalRedirectUrl = isInternalUrl ? redirectUrl : "/portal/dashboard";
                    console.log('🔗 [SSO_CALLBACK_DEBUG] Redirecting to specified URL:', {
                        originalUrl: redirectUrl,
                        isInternal: isInternalUrl,
                        finalUrl: finalRedirectUrl,
                    });
                    router.replace(finalRedirectUrl);
                } else {
                    // Default redirect to dashboard
                    console.log('🏠 [SSO_CALLBACK_DEBUG] Redirecting to default dashboard');
                    router.replace("/portal/dashboard");
                }
            } catch (error: any) {
                console.error("💥 [SSO_CALLBACK_DEBUG] Error occurred:", {
                    error: error,
                    message: error?.message,
                    stack: error?.stack,
                    name: error?.name,
                });
                setErrorMessage(
                    error?.message || "An error occurred during sign in",
                );
                setStatus("error");

                // Even on error, redirect after a delay - onboarding provider will handle it
                console.log('⏰ [SSO_CALLBACK_DEBUG] Scheduling redirect after error (3s delay)');
                setTimeout(() => {
                    console.log('🏠 [SSO_CALLBACK_DEBUG] Redirecting to dashboard after error');
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
