"use client";

import { useSignIn, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import {
    AuthInput,
    SocialLoginButton,
} from "@splits-network/memphis-ui";

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
                        setError("Two-factor authentication required. Please complete the second authentication step.");
                        break;
                    case "needs_identifier":
                        setErrorType("missing_identifier");
                        setError("Please provide your email address to continue.");
                        break;
                    case "needs_first_factor":
                        setErrorType("needs_verification");
                        setError("Additional authentication required. Please complete the verification step.");
                        break;
                    case "needs_new_password":
                        setErrorType("password_reset_required");
                        setError("Password reset required. Please update your password.");
                        break;
                    default:
                        setErrorType("unknown_status");
                        setError(`Authentication incomplete (${signInAttempt.status}). Please contact support if this continues.`);
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
                        setTimeout(() => router.push(redirectUrl || "/portal/dashboard"), 1500);
                        break;
                    case "too_many_requests":
                        setErrorType("rate_limited");
                        setError("Too many sign-in attempts. Please wait a moment and try again.");
                        break;
                    default:
                        setErrorType("clerk_error");
                        setError(clerkError.message || "Invalid email or password");
                }
            } else {
                setErrorType("generic_error");
                setError(err.message || "An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithOAuth = (provider: "oauth_google" | "oauth_github" | "oauth_microsoft") => {
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
        <div className="space-y-4">
            <div>
                <h2 className="card-title text-lg">Welcome Back</h2>
                <p className="text-base-content/50">Sign in to your account</p>
            </div>

            {error && (
                <div className="alert alert-outline alert-coral" role="alert">
                    <i className="fa-solid fa-circle-xmark" />
                    <span>{error}</span>
                </div>
            )}

            {errorType === "needs_2fa" && (
                <div className="alert alert-soft alert-purple" role="alert">
                    <i className="fa-duotone fa-regular fa-shield-check" />
                    <div>
                        <p className="font-bold">Two-factor authentication is enabled</p>
                        <p>Check your authenticator app or SMS for the verification code.</p>
                    </div>
                </div>
            )}

            {errorType === "account_not_found" && (
                <div className="alert alert-soft alert-teal" role="alert">
                    <i className="fa-duotone fa-regular fa-info-circle" />
                    <div>
                        <p className="font-bold">Don&apos;t have an account yet?</p>
                        <p>
                            <Link
                                href={redirectUrl ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-up"}
                                className="font-bold text-coral"
                            >
                                Create your Splits Network account
                            </Link>{" "}
                            to get started.
                        </p>
                    </div>
                </div>
            )}

            {errorType === "incorrect_password" && (
                <div className="alert alert-soft alert-yellow" role="alert">
                    <i className="fa-duotone fa-regular fa-key" />
                    <div>
                        <p className="font-bold">Password incorrect</p>
                        <p>
                            Double-check your password or{" "}
                            <Link href="/forgot-password" className="font-bold text-coral">reset your password</Link>
                        </p>
                    </div>
                </div>
            )}

            {errorType === "rate_limited" && (
                <div className="alert alert-soft alert-yellow" role="alert">
                    <i className="fa-duotone fa-regular fa-clock" />
                    <div>
                        <p className="font-bold">Too many attempts</p>
                        <p>For security, please wait a few minutes before trying again.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div id="clerk-captcha" />

                <AuthInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(v: string) => { setEmail(v); setError(""); }}
                    placeholder="you@company.com"
                    error={errorType === "account_not_found" ? " " : undefined}
                />

                <div>
                    <AuthInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(v: string) => { setPassword(v); setError(""); }}
                        placeholder="Enter password"
                        showPasswordToggle
                        error={errorType === "incorrect_password" ? " " : undefined}
                    />
                    <div className="flex justify-end mt-2">
                        <Link href="/forgot-password" className="btn btn-link btn-sm text-coral">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button type="submit" className="btn btn-coral btn-block" disabled={isLoading || !isLoaded}>
                    {isLoading ? (
                        <><span className="loading loading-spinner" /> Signing in...</>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            <div className="divider">or</div>

            <div className="grid grid-cols-3 gap-3">
                <SocialLoginButton label="Google" icon="fa-brands fa-google" color="coral" onClick={() => signInWithOAuth("oauth_google")} />
                <SocialLoginButton label="GitHub" icon="fa-brands fa-github" color="purple" onClick={() => signInWithOAuth("oauth_github")} />
                <SocialLoginButton label="Microsoft" icon="fa-brands fa-microsoft" color="teal" onClick={() => signInWithOAuth("oauth_microsoft")} />
            </div>

            <p className="text-center text-base-content/60">
                Don&apos;t have an account?{" "}
                <Link
                    href={redirectUrl ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-up"}
                    className="btn btn-link btn-sm text-coral"
                >
                    Sign up
                </Link>
            </p>
        </div>
    );
}
