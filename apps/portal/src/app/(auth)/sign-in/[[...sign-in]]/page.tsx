"use client";

import { useSignIn, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";

export default function SignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isSignedIn } = useAuth();
    const { signOut } = useClerk();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [errorType, setErrorType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const redirectUrl = searchParams.get("redirect_url");
    const isFromInvitation = redirectUrl?.includes("/accept-invitation/");

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
                router.push(redirectUrl || "/portal/dashboard");
            } else {
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
            if (err.errors && err.errors.length > 0) {
                const clerkError = err.errors[0];
                switch (clerkError.code) {
                    case "form_identifier_not_found":
                        setErrorType("account_not_found");
                        setError("No account found with this email address.");
                        break;
                    case "form_password_incorrect":
                        setErrorType("incorrect_password");
                        setError("Incorrect password. Please try again.");
                        break;
                    case "session_exists":
                    case "identifier_already_signed_in":
                        setErrorType("already_signed_in");
                        setError("You are already signed in. Redirecting...");
                        setTimeout(
                            () =>
                                router.push(redirectUrl || "/portal/dashboard"),
                            1500,
                        );
                        break;
                    case "too_many_requests":
                        setErrorType("rate_limited");
                        setError(
                            "Too many sign-in attempts. Please wait a moment and try again.",
                        );
                        break;
                    default:
                        setErrorType("clerk_error");
                        setError(
                            clerkError.message || "Invalid email or password",
                        );
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
        signIn.authenticateWithRedirect({
            strategy: provider,
            redirectUrl: "/sso-callback",
            redirectUrlComplete: redirectUrl || "/portal/dashboard",
        });
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push(redirectUrl || "/portal/dashboard");
        }
    }, [isLoaded, isSignedIn, router, redirectUrl]);

    return (
        <>
            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    Welcome back
                </h1>
                <p className="text-base-content/50">
                    Sign in to your Splits Network account.
                </p>
            </div>

            {/* Error alerts */}
            {error && (
                <div className="alert alert-error mb-4" role="alert">
                    <i className="fa-solid fa-circle-xmark" />
                    <span>{error}</span>
                </div>
            )}

            {errorType === "needs_2fa" && (
                <div
                    className="bg-info/10 border-l-4 border-info p-4 mb-4"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-shield-check text-info mt-0.5" />
                        <div>
                            <p className="text-sm font-bold">
                                Two-factor authentication is enabled
                            </p>
                            <p className="text-sm text-base-content/60">
                                Check your authenticator app or SMS for the
                                verification code.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {errorType === "account_not_found" && (
                <div
                    className="bg-info/10 border-l-4 border-info p-4 mb-4"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-info-circle text-info mt-0.5" />
                        <div>
                            <p className="text-sm font-bold">
                                Don&apos;t have an account yet?
                            </p>
                            <p className="text-sm text-base-content/60">
                                <Link
                                    href={
                                        redirectUrl
                                            ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
                                            : "/sign-up"
                                    }
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Create your Splits Network account
                                </Link>{" "}
                                to get started.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {errorType === "incorrect_password" && (
                <div
                    className="bg-warning/10 border-l-4 border-warning p-4 mb-4"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-key text-warning mt-0.5" />
                        <div>
                            <p className="text-sm font-bold">
                                Password incorrect
                            </p>
                            <p className="text-sm text-base-content/60">
                                Double-check your password or{" "}
                                <Link
                                    href="/forgot-password"
                                    className="text-primary font-semibold hover:underline"
                                >
                                    reset your password
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {errorType === "rate_limited" && (
                <div
                    className="bg-warning/10 border-l-4 border-warning p-4 mb-4"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-clock text-warning mt-0.5" />
                        <div>
                            <p className="text-sm font-bold">
                                Too many attempts
                            </p>
                            <p className="text-sm text-base-content/60">
                                For security, please wait a few minutes before
                                trying again.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Social login buttons */}
            <div className="space-y-3 mb-6">
                <button
                    type="button"
                    className="btn btn-ghost w-full border border-base-300 justify-start gap-3"
                    onClick={() => signInWithOAuth("oauth_google")}
                >
                    <i className="fa-brands fa-google text-lg" />
                    <span className="text-sm font-semibold">
                        Continue with Google
                    </span>
                </button>
                {/* <button
                    type="button"
                    className="btn btn-ghost w-full border border-base-300 justify-start gap-3"
                    onClick={() => signInWithOAuth("oauth_github")}
                >
                    <i className="fa-brands fa-github text-lg" />
                    <span className="text-sm font-semibold">
                        Continue with GitHub
                    </span>
                </button> */}
                <button
                    type="button"
                    className="btn btn-ghost w-full border border-base-300 justify-start gap-3"
                    onClick={() => signInWithOAuth("oauth_microsoft")}
                >
                    <i className="fa-brands fa-microsoft text-lg" />
                    <span className="text-sm font-semibold">
                        Continue with Microsoft
                    </span>
                </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-base-300" />
                <span className="text-xs text-base-content/30 uppercase tracking-widest">
                    or
                </span>
                <div className="flex-1 h-px bg-base-300" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div id="clerk-captcha" />

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Email Address
                    </label>
                    <div className="relative">
                        <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 z-10 pointer-events-none" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            placeholder="you@company.com"
                            className={`input input-bordered w-full pl-10 ${errorType === "account_not_found" ? "input-error" : ""}`}
                            required
                        />
                    </div>
                </fieldset>

                <fieldset>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs text-primary font-semibold hover:underline"
                        >
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative">
                        <i className="fa-duotone fa-regular fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 z-10 pointer-events-none" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            placeholder="Enter your password"
                            className={`input input-bordered w-full pl-10 pr-10 ${errorType === "incorrect_password" ? "input-error" : ""}`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60"
                        >
                            <i
                                className={`fa-duotone fa-regular fa-eye${showPassword ? "-slash" : ""}`}
                            />
                        </button>
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className="btn btn-primary w-full mt-2"
                    disabled={isLoading || !isLoaded}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />{" "}
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            {/* Switch mode */}
            <div className="text-center mt-8 text-sm text-base-content/50">
                Don&apos;t have an account?{" "}
                <Link
                    href={
                        redirectUrl
                            ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
                            : "/sign-up"
                    }
                    className="text-primary font-semibold hover:underline"
                >
                    Sign up
                </Link>
            </div>
        </>
    );
}
