"use client";

import { useSignIn, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isSignedIn } = useAuth();
    const { signOut } = useClerk();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [errorType, setErrorType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check for invitation parameters
    const invitationId = searchParams.get("invitation_id");

    const handleSignOut = async () => {
        setIsLoading(true);
        await signOut();
        setIsLoading(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError("");
        setErrorType(null);
        setIsLoading(true);

        try {
            const signInAttempt = await signIn.create({
                identifier: email,
                password,
            });

            if (signInAttempt.status === "complete") {
                await setActive({ session: signInAttempt.createdSessionId });

                // If user signed in via invitation, redirect to acceptance page
                if (invitationId) {
                    router.push(`/accept-invitation/${invitationId}`);
                } else {
                    router.push("/portal/dashboard");
                }
            } else {
                // Handle incomplete sign-in with specific error types
                switch (signInAttempt.status) {
                    case "needs_second_factor":
                        setErrorType("needs_2fa");
                        setError(
                            "Two-factor authentication required. Please complete the second authentication step.",
                        );
                        break;
                    case "needs_identifier":
                        setErrorType("missing_identifier");
                        setError(
                            "Please provide your email address to continue.",
                        );
                        break;
                    case "needs_first_factor":
                        setErrorType("needs_verification");
                        setError(
                            "Additional authentication required. Please complete the verification step.",
                        );
                        break;
                    case "needs_new_password":
                        setErrorType("password_reset_required");
                        setError(
                            "Password reset required. Please update your password.",
                        );
                        break;
                    default:
                        setErrorType("unknown_status");
                        setError(
                            `Authentication incomplete (${signInAttempt.status}). Please contact support if this continues.`,
                        );
                }
            }
        } catch (err: any) {
            // Provide specific feedback based on error type
            if (err.errors && err.errors.length > 0) {
                const error = err.errors[0];
                const errorCode = error.code;
                const errorMessage = error.message;

                switch (errorCode) {
                    case "form_identifier_not_found":
                        setErrorType("account_not_found");
                        setError("No account found with this email address.");
                        break;
                    case "form_password_incorrect":
                        setErrorType("incorrect_password");
                        setError("Incorrect password. Please try again.");
                        break;
                    case "session_exists":
                        setErrorType("already_signed_in");
                        setError("You are already signed in. Redirecting...");
                        setTimeout(() => {
                            router.push(
                                invitationId
                                    ? `/accept-invitation/${invitationId}`
                                    : "/portal/dashboard",
                            );
                        }, 1500);
                        break;
                    case "too_many_requests":
                        setErrorType("rate_limited");
                        setError(
                            "Too many sign-in attempts. Please wait a moment and try again.",
                        );
                        break;
                    case "identifier_already_signed_in":
                        setErrorType("already_signed_in");
                        setError(
                            "Already signed in with this account. Redirecting...",
                        );
                        setTimeout(() => {
                            router.push(
                                invitationId
                                    ? `/accept-invitation/${invitationId}`
                                    : "/portal/dashboard",
                            );
                        }, 1500);
                        break;
                    default:
                        setErrorType("clerk_error");
                        // Use the original error message from Clerk for other cases
                        setError(errorMessage || "Invalid email or password");
                }
            } else {
                setErrorType("generic_error");
                setError(
                    err.message ||
                        "An unexpected error occurred. Please try again.",
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithOAuth = (
        provider: "oauth_google" | "oauth_github" | "oauth_microsoft",
    ) => {
        if (!isLoaded) return;

        // Build redirect URL with invitation params if present
        const redirectUrl = "/sso-callback";
        const redirectUrlComplete = invitationId
            ? `/accept-invitation/${invitationId}`
            : "/portal/dashboard";

        signIn.authenticateWithRedirect({
            strategy: provider,
            redirectUrl,
            redirectUrlComplete,
        });
    };

    // Show message if user is already signed in
    if (isLoaded && isSignedIn) {
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
                            Already Signed In
                        </h2>

                        <div className="alert alert-info mb-4">
                            <i className="fa-duotone fa-regular fa-circle-info"></i>
                            <span>
                                You're already signed in to your account.
                            </span>
                        </div>

                        <p className="text-center mb-4">
                            You can continue to your dashboard or sign out if
                            you'd like to use a different account.
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
                                        Sign Out
                                    </>
                                )}
                            </button>
                        </div>
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
                        Sign In to Splits Network
                    </h2>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Enhanced contextual help based on error type */}
                    {errorType === "needs_2fa" && (
                        <div className="alert alert-info mb-4">
                            <i className="fa-duotone fa-regular fa-shield-check"></i>
                            <div className="text-sm">
                                <p className="font-semibold">
                                    Two-factor authentication is enabled
                                </p>
                                <p>
                                    Check your authenticator app or SMS for the
                                    verification code. Contact support if you
                                    need help accessing your account.
                                </p>
                            </div>
                        </div>
                    )}

                    {errorType === "account_not_found" && (
                        <div className="alert alert-info mb-4">
                            <i className="fa-duotone fa-regular fa-info-circle"></i>
                            <div className="text-sm">
                                <p className="font-semibold">
                                    Don't have an account yet?
                                </p>
                                <p>
                                    <Link
                                        href={
                                            invitationId
                                                ? `/sign-up?invitation_id=${invitationId}`
                                                : "/sign-up"
                                        }
                                        className="link link-primary"
                                    >
                                        Create your Splits Network account
                                    </Link>{" "}
                                    to get started.
                                </p>
                            </div>
                        </div>
                    )}

                    {errorType === "incorrect_password" && (
                        <div className="alert alert-warning mb-4">
                            <i className="fa-duotone fa-regular fa-key"></i>
                            <div className="text-sm">
                                <p className="font-semibold">
                                    Password incorrect
                                </p>
                                <p>
                                    Double-check your password or{" "}
                                    <Link
                                        href="/forgot-password"
                                        className="link link-primary"
                                    >
                                        reset your password
                                    </Link>{" "}
                                    if you've forgotten it.
                                </p>
                            </div>
                        </div>
                    )}

                    {errorType === "rate_limited" && (
                        <div className="alert alert-warning mb-4">
                            <i className="fa-duotone fa-regular fa-clock"></i>
                            <div className="text-sm">
                                <p className="font-semibold">
                                    Too many attempts
                                </p>
                                <p>
                                    For security, please wait a few minutes
                                    before trying again. This helps protect your
                                    account from unauthorized access.
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div id="clerk-captcha"></div>
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
                            />
                            <p className="fieldset-label">
                                <Link
                                    href="/forgot-password"
                                    className="link link-hover"
                                >
                                    Forgot password?
                                </Link>
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
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <div className="space-y-2">
                        <button
                            onClick={() => signInWithOAuth("oauth_google")}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-google"></i>
                            Continue with Google
                        </button>
                        <button
                            onClick={() => signInWithOAuth("oauth_github")}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-github"></i>
                            Continue with GitHub
                        </button>
                        <button
                            onClick={() => signInWithOAuth("oauth_microsoft")}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-microsoft"></i>
                            Continue with Microsoft
                        </button>
                    </div>

                    <p className="text-center text-sm mt-4">
                        Don't have an account?{" "}
                        <Link href="/sign-up" className="link link-primary">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
