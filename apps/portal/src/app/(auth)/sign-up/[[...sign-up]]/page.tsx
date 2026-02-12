"use client";

import { useSignUp, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { ensureUserInDatabase } from "@/lib/user-registration";
import { createAuthenticatedClient, createUnauthenticatedClient } from "@/lib/api-client";
import { getRecCodeFromCookie } from "@/hooks/use-rec-code";

export default function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { isSignedIn, getToken } = useAuth();
    const { signOut } = useClerk();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Get redirect URL from search params (Clerk preserves this through verification)
    const redirectUrl = searchParams.get("redirect_url");
    const isFromInvitation = redirectUrl?.includes("/accept-invitation/");

    // Get rec_code from URL params or cookie (set by middleware)
    const recCode = searchParams.get("rec_code") || getRecCodeFromCookie();

    const handleSignOut = async () => {
        setIsLoading(true);
        await signOut();
        setIsLoading(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError("");
        setIsLoading(true);

        try {
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            });

            // Send email verification code
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            setPendingVerification(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerification = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError("");
        setIsLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification(
                {
                    code,
                },
            );

            // Try to complete sign up regardless of status if we have a session
            if (completeSignUp.createdSessionId) {
                await setActive({ session: completeSignUp.createdSessionId });

                // Wait a moment for session to be fully established
                setTimeout(async () => {
                    try {
                        // Get auth token for API calls
                        const token = await getToken();
                        if (!token) {
                            console.warn(
                                "No auth token available, proceeding with redirect",
                            );
                        } else {
                            // Resolve rec_code to recruiter_id if present
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
                                    console.warn("[SignUp] Failed to resolve rec_code:", lookupError);
                                }
                            }

                            // Ensure user exists in database using the same logic as SSO callback
                            const result = await ensureUserInDatabase(token, {
                                clerk_user_id: completeSignUp.createdUserId!,
                                email: completeSignUp.emailAddress!,
                                name: `${completeSignUp.firstName || firstName} ${completeSignUp.lastName || lastName}`.trim(),
                                referred_by_recruiter_id: referredByRecruiterId,
                            });

                            if (!result.success) {
                                // Log the error but don't block - onboarding will catch this
                                console.warn(
                                    "[SignUp] User creation warning:",
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
                                    console.warn("[SignUp] Failed to log rec_code usage:", logError);
                                }
                            }
                        }
                    } catch (userCreationError) {
                        // Log error but don't block the flow - webhook will catch this later
                        console.error(
                            "Failed to create user in database (webhook will handle):",
                            userCreationError,
                        );
                    }

                    // Redirect using replace to prevent back navigation to verification
                    router.replace(redirectUrl || "/portal/dashboard");
                }, 500); // 500ms delay to ensure session is stable
            } else {
                setError(
                    `Sign up incomplete. Status: ${completeSignUp.status}. Please check the console for details.`,
                );
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.errors?.[0]?.message || "Invalid verification code");
        } finally {
            setIsLoading(false);
        }
    };

    const signUpWithOAuth = (
        provider: "oauth_google" | "oauth_github" | "oauth_microsoft",
    ) => {
        if (!isLoaded) return;

        signUp.authenticateWithRedirect({
            strategy: provider,
            redirectUrl: "/sso-callback",
            redirectUrlComplete: redirectUrl || "/portal/dashboard",
        });
    };

    // Show message if user is already signed in
    if (isLoaded && isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
                <div className="card w-full max-w-md bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-bold justify-center mb-6">
                            Already Signed In
                        </h2>

                        <div className="alert alert-info mb-4">
                            <i className="fa-duotone fa-regular fa-circle-info"></i>
                            <span>
                                You're already signed in to your account.
                            </span>
                        </div>

                        <p className="text-center mb-4">
                            To create a new account, you'll need to sign out
                            first.
                        </p>

                        <div className="space-y-2">
                            <button
                                onClick={() => router.push("/portal/dashboard")}
                                className="btn btn-primary w-full"
                            >
                                <i className="fa-duotone fa-regular fa-home"></i>
                                Go to Dashboard
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="btn btn-outline w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Signing out...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-right-from-bracket"></i>
                                        Sign Out & Create New Account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (pendingVerification) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
                <div className="card w-full max-w-md bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-bold justify-center mb-6 flex flex-col">
                            <Link href="/" className="mb-6">
                                <img
                                    src="/logo.svg"
                                    alt="Applicant Network"
                                    className="h-12"
                                />
                            </Link>
                            Verify Your Email
                        </h2>

                        <div className="alert alert-info mb-4">
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            <span>We sent a verification code to {email}</span>
                        </div>

                        {error && (
                            <div className="alert alert-error mb-4">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerification}>
                            <fieldset className="fieldset mb-4">
                                <legend className="fieldset-legend">
                                    Verification Code
                                </legend>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    className="input w-full text-center text-2xl tracking-widest"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                />
                            </fieldset>

                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={isLoading || !isLoaded}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Email"
                                )}
                            </button>
                        </form>

                        <button
                            onClick={() => setPendingVerification(false)}
                            className="btn btn-ghost btn-sm w-full mt-2"
                        >
                            Back to sign up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold justify-center mb-6 flex flex-col">
                        <Link href="/" className="mb-6">
                            <img
                                src="/logo.svg"
                                alt="Applicant Network"
                                className="h-12"
                            />
                        </Link>
                        Create Your Splits Account
                    </h2>

                    {isFromInvitation && (
                        <div className="alert alert-info mb-4">
                            <i className="fa-duotone fa-regular fa-envelope-open-text"></i>
                            <span>
                                Complete sign-up to accept your invitation
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Clerk CAPTCHA widget container - required for bot protection */}
                        <div id="clerk-captcha"></div>

                        <div className="grid grid-cols-2 gap-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    First Name
                                </legend>
                                <input
                                    type="text"
                                    placeholder="John"
                                    className="input w-full"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    required
                                    disabled={isLoading}
                                />
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Last Name
                                </legend>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    className="input w-full"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    required
                                    disabled={isLoading}
                                />
                            </fieldset>
                        </div>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Email</legend>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="input w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Password
                            </legend>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={8}
                            />
                            <p className="fieldset-label">
                                Must be at least 8 characters
                            </p>
                        </fieldset>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading || !isLoaded}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <div className="space-y-2">
                        <button
                            onClick={() => signUpWithOAuth("oauth_google")}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-google"></i>
                            Continue with Google
                        </button>
                        <button
                            onClick={() => signUpWithOAuth("oauth_github")}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-github"></i>
                            Continue with GitHub
                        </button>
                        <button
                            onClick={() => signUpWithOAuth("oauth_microsoft")}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-microsoft"></i>
                            Continue with Microsoft
                        </button>
                    </div>

                    <p className="text-center text-sm mt-4">
                        Already have an account?{" "}
                        <Link
                            href={
                                redirectUrl
                                    ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
                                    : "/sign-in"
                            }
                            className="link link-primary"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
