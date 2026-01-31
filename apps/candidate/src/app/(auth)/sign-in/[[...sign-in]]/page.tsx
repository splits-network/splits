"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";

export default function SignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [errorType, setErrorType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get redirect parameter (from invitation or other flow) and store in state
    // so it persists through the entire sign-in flow even if URL changes
    const [redirectUrl] = useState(() => searchParams.get("redirect_url"));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!isLoaded) return;
        setErrorType(null);
        setIsLoading(true);

        try {
            const signInAttempt = await signIn.create({
                identifier: email,
                password,
            });

            if (signInAttempt.status === "complete") {
                await setActive({ session: signInAttempt.createdSessionId });
                const finalRedirectUrl = redirectUrl || "/portal/dashboard";
                router.push(finalRedirectUrl);
            } else {
                // Provide specific feedback based on status
                switch (signInAttempt.status) {
                    case "needs_second_factor":
                        setErrorType("two_factor");
                        setError(
                            "This account has two-factor authentication enabled. Please complete the second factor verification. If you need to disable 2FA, please sign in from a different browser where you have access to your second factor method.",
                        );
                        break;
                    case "needs_identifier":
                        setErrorType("missing_identifier");
                        setError(
                            "Please provide your email address to continue.",
                        );
                        break;
                    case "needs_factor":
                        setErrorType("needs_verification");
                        setError(
                            "Additional authentication required. Please complete the verification step.",
                        );
                        break;
                    case "missing_requirements":
                        setErrorType("account_incomplete");
                        setError(
                            "Account setup is incomplete. Please contact support for assistance.",
                        );
                        break;
                    case "abandoned":
                        setErrorType("session_expired");
                        setError(
                            "Sign-in session expired. Please refresh the page and try again.",
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
                            router.push(redirectUrl || "/portal/dashboard");
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
                            router.push(redirectUrl || "/portal/dashboard");
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

        const redirectUrlComplete = redirectUrl || "/portal/dashboard";

        signIn.authenticateWithRedirect({
            strategy: provider,
            redirectUrl: "/sso-callback",
            redirectUrlComplete: redirectUrlComplete,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body">
                    <div className="text-center mb-6">
                        <i className="fa-duotone fa-regular fa-briefcase text-4xl text-primary mb-2"></i>
                        <h2 className="card-title text-2xl font-bold justify-center">
                            Welcome Back
                        </h2>
                        <p className="text-sm text-base-content/70">
                            Sign in to continue your job search
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4">
                            <div className="alert alert-error">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>

                            {/* Contextual help based on error type */}
                            {errorType === "two_factor" && (
                                <div className="alert alert-info mt-2">
                                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                                    <div className="text-sm">
                                        <p className="font-semibold">
                                            Need help with 2FA?
                                        </p>
                                        <p>
                                            You can try signing in using one of
                                            the social options below, or contact
                                            support if you need to disable
                                            two-factor authentication.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {errorType === "account_not_found" && (
                                <div className="alert alert-info mt-2">
                                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                                    <div className="text-sm">
                                        <p className="font-semibold">
                                            Don't have an account yet?
                                        </p>
                                        <p>
                                            <Link
                                                href={
                                                    redirectUrl
                                                        ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
                                                        : "/sign-up"
                                                }
                                                className="link link-primary"
                                            >
                                                Create a free account
                                            </Link>{" "}
                                            to get started with your job search.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {errorType === "incorrect_password" && (
                                <div className="alert alert-info mt-2">
                                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                                    <div className="text-sm">
                                        <p>
                                            <Link
                                                href="/forgot-password"
                                                className="link link-primary"
                                            >
                                                Forgot your password?
                                            </Link>{" "}
                                            Reset it to regain access to your
                                            account.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {errorType === "rate_limited" && (
                                <div className="alert alert-warning mt-2">
                                    <i className="fa-duotone fa-regular fa-clock"></i>
                                    <div className="text-sm">
                                        <p>
                                            Please wait 60 seconds before trying
                                            again, or use one of the social
                                            sign-in options below.
                                        </p>
                                    </div>
                                </div>
                            )}
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
                        <Link
                            href={
                                redirectUrl
                                    ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
                                    : "/sign-up"
                            }
                            className="link link-primary"
                        >
                            Create free account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
