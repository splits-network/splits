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
    const [isLoading, setIsLoading] = useState(false);

    // Get redirect parameter (from invitation or other flow) and store in state
    // so it persists through the entire sign-in flow even if URL changes
    const [redirectUrl] = useState(() => searchParams.get("redirect_url"));

    // DEBUG: Log environment and configuration on component mount
    useEffect(() => {
        console.log("🚀 [SIGN_IN_DEBUG] Component mounted");
        console.log("🔧 [SIGN_IN_DEBUG] Environment variables:", {
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
                process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(
                    0,
                    20,
                ) + "...",
            NEXT_PUBLIC_CLERK_SIGN_IN_URL:
                process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
            NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
                process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
            NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
                process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
        });
        console.log("🌐 [SIGN_IN_DEBUG] Current URL:", window.location.href);
        console.log(
            "📍 [SIGN_IN_DEBUG] Redirect URL from params:",
            redirectUrl,
        );
        console.log("📊 [SIGN_IN_DEBUG] Clerk isLoaded:", isLoaded);
        console.log("🔍 [SIGN_IN_DEBUG] signIn object:", signIn);
    }, [isLoaded, redirectUrl, signIn]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log("📝 [SIGN_IN_DEBUG] Form submission started");

        if (!isLoaded) {
            console.error("❌ [SIGN_IN_DEBUG] Clerk not loaded yet");
            return;
        }

        console.log("📧 [SIGN_IN_DEBUG] Email:", email);
        console.log("🔒 [SIGN_IN_DEBUG] Password length:", password.length);
        console.log(
            "🎯 [SIGN_IN_DEBUG] Will redirect to:",
            redirectUrl || "/portal/dashboard",
        );

        setError("");
        setIsLoading(true);

        try {
            console.log("🔄 [SIGN_IN_DEBUG] Creating sign-in attempt...");
            const signInAttempt = await signIn.create({
                identifier: email,
                password,
            });

            console.log("✅ [SIGN_IN_DEBUG] Sign-in attempt created:", {
                status: signInAttempt.status,
                createdSessionId: signInAttempt.createdSessionId,
                identifier: signInAttempt.identifier,
            });

            if (signInAttempt.status === "complete") {
                console.log(
                    "🎉 [SIGN_IN_DEBUG] Sign-in complete! Setting active session...",
                );
                console.log(
                    "🗝️ [SIGN_IN_DEBUG] Session ID:",
                    signInAttempt.createdSessionId,
                );

                await setActive({ session: signInAttempt.createdSessionId });
                console.log("✅ [SIGN_IN_DEBUG] Session set as active");

                const finalRedirectUrl = redirectUrl || "/portal/dashboard";
                console.log(
                    "🚀 [SIGN_IN_DEBUG] Redirecting to:",
                    finalRedirectUrl,
                );
                router.push(finalRedirectUrl);
            } else {
                console.error("❌ [SIGN_IN_DEBUG] Sign-in incomplete:", {
                    status: signInAttempt.status,
                    missingFields: signInAttempt.missingFields,
                    unverifiedFields: signInAttempt.unverifiedFields,
                    nextStep: signInAttempt.nextStep,
                });
                setError("Sign in incomplete. Please try again.");
            }
        } catch (err: any) {
            console.error("💥 [SIGN_IN_DEBUG] Sign-in error:", {
                error: err,
                message: err.message,
                errors: err.errors,
                clerkError: err.clerkError,
            });
            setError(err.errors?.[0]?.message || "Invalid email or password");
        } finally {
            setIsLoading(false);
            console.log("🏁 [SIGN_IN_DEBUG] Sign-in process finished");
        }
    };

    const signInWithOAuth = (
        provider: "oauth_google" | "oauth_github" | "oauth_microsoft",
    ) => {
        console.log(
            "🔗 [SIGN_IN_DEBUG] OAuth sign-in started with provider:",
            provider,
        );

        if (!isLoaded) {
            console.error("❌ [SIGN_IN_DEBUG] Clerk not loaded for OAuth");
            return;
        }

        const redirectUrlComplete = redirectUrl || "/portal/dashboard";
        console.log(
            "🎯 [SIGN_IN_DEBUG] OAuth will redirect to:",
            redirectUrlComplete,
        );

        console.log("🔄 [SIGN_IN_DEBUG] Authenticating with redirect...");
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
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
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
