"use client";

import { useSignUp, useAuth, useClerk } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { createAuthenticatedClient } from "@/lib/api-client";

export default function SignUpPage() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { signUp, setActive } = useSignUp();
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [redirectUrl] = useState(() => searchParams.get("redirect_url"));
    const isFromInvitation = redirectUrl?.includes("/invitation/");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const stepRef = useRef<HTMLDivElement>(null);

    // Redirect if already signed in (matches sign-in page pattern)
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push(redirectUrl || "/onboarding");
        }
    }, [isLoaded, isSignedIn, router, redirectUrl]);

    // Shared post-signup handler: activate session, init backend, redirect
    const finalizeSignUp = useCallback(
        async (sessionId: string | null) => {
            await setActive!({ session: sessionId });

            // Best-effort backend init — webhook + onboarding page serve as fallbacks
            try {
                const token = await getToken();
                if (token) {
                    const client = createAuthenticatedClient(token);
                    await client.post("/onboarding/init", {
                        email:
                            user?.primaryEmailAddress?.emailAddress || email,
                        name:
                            user?.fullName ||
                            `${firstName} ${lastName}`.trim(),
                        image_url: user?.imageUrl,
                        source_app: "candidate",
                    });
                }
            } catch (initError) {
                console.error(
                    "Failed to init backend (webhook will handle):",
                    initError,
                );
            }

            router.push(redirectUrl || "/onboarding");
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [redirectUrl, email, firstName, lastName, router],
    );

    const handleSignOut = async () => {
        setIsLoading(true);
        await signOut();
        setIsLoading(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded || !signUp) return;

        setError("");
        setIsLoading(true);

        try {
            const result = await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            });

            if (result.status === "complete") {
                // No verification needed — activate session and redirect
                await finalizeSignUp(result.createdSessionId);
                return;
            }

            // Verification required — show code form
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
        if (!isLoaded || !signUp) return;

        setError("");
        setIsLoading(true);

        try {
            const completeSignUp =
                await signUp.attemptEmailAddressVerification({ code });

            if (completeSignUp.status === "complete") {
                await finalizeSignUp(completeSignUp.createdSessionId);
            } else {
                setError("Verification incomplete. Please try again.");
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Invalid verification code");
        } finally {
            setIsLoading(false);
        }
    };

    const signUpWithOAuth = (
        provider: "oauth_google" | "oauth_github" | "oauth_microsoft",
    ) => {
        if (!isLoaded || !signUp) return;
        signUp.authenticateWithRedirect({
            strategy: provider,
            redirectUrl: "/sso-callback",
            redirectUrlComplete: redirectUrl || "/onboarding",
        });
    };

    // Animate step transitions
    useEffect(() => {
        if (
            !stepRef.current ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
            return;
        gsap.fromTo(
            stepRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" },
        );
    }, [pendingVerification]);

    // Verification step
    if (pendingVerification) {
        return (
            <div ref={stepRef}>
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        Verify your email
                    </h1>
                </div>

                <div
                    className="bg-info/10 border-l-4 border-info p-4 mb-6"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-envelope text-info mt-0.5" />
                        <span className="text-sm">
                            We sent a 6-digit code to <strong>{email}</strong>.
                            Check your inbox &mdash; it arrives within a minute.
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error mb-4" role="alert">
                        <i className="fa-solid fa-circle-xmark" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleVerification} className="space-y-4">
                    <fieldset>
                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            placeholder="123456"
                            className="input input-bordered w-full text-center text-2xl tracking-widest"
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
                                <span className="loading loading-spinner loading-sm" />{" "}
                                Verifying...
                            </>
                        ) : (
                            "Verify Email"
                        )}
                    </button>
                </form>

                <button
                    onClick={() => setPendingVerification(false)}
                    className="btn btn-ghost btn-sm w-full mt-4"
                >
                    <i className="fa-solid fa-arrow-left" /> Back to sign up
                </button>
            </div>
        );
    }

    // Registration form
    return (
        <div ref={stepRef}>
            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    {isFromInvitation
                        ? "You've been invited"
                        : "Create your account"}
                </h1>
                <p className="text-base-content/50">
                    {isFromInvitation
                        ? "A recruiter wants to represent you. Create your account to review their proposal and get started."
                        : "Join the network where specialists compete to place you in the right role."}
                </p>
            </div>

            {isFromInvitation && (
                <div
                    className="bg-info/10 border-l-4 border-info p-4 mb-6"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-envelope-open-text text-info mt-0.5" />
                        <span className="text-sm">
                            A recruiter has submitted your profile to this
                            network. Sign up to see the role, confirm your
                            representation, and track your application.
                        </span>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-error mb-4" role="alert">
                    <i className="fa-solid fa-circle-xmark" />
                    <span>{error}</span>
                </div>
            )}

            {/* Social login */}
            <div className="space-y-3 mb-6">
                <button
                    type="button"
                    className="btn btn-ghost w-full border border-base-300 justify-start gap-3"
                    onClick={() => signUpWithOAuth("oauth_google")}
                >
                    <i className="fa-brands fa-google text-lg" />
                    <span className="text-sm font-semibold">
                        Continue with Google
                    </span>
                </button>
                {/* <button
                    type="button"
                    className="btn btn-ghost w-full border border-base-300 justify-start gap-3"
                    onClick={() => signUpWithOAuth("oauth_microsoft")}
                >
                    <i className="fa-brands fa-microsoft text-lg" />
                    <span className="text-sm font-semibold">
                        Continue with Microsoft
                    </span>
                </button> */}
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

                <div className="grid grid-cols-2 gap-4">
                    <fieldset>
                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                            First Name
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Sarah"
                            className="input input-bordered w-full"
                            required
                            disabled={isLoading}
                        />
                    </fieldset>
                    <fieldset>
                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Kim"
                            className="input input-bordered w-full"
                            required
                            disabled={isLoading}
                        />
                    </fieldset>
                </div>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Email Address
                    </label>
                    <div className="relative">
                        <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30  pointer-events-none" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="input input-bordered w-full pl-10"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Password
                    </label>
                    <div className="relative">
                        <i className="fa-duotone fa-regular fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30  pointer-events-none" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="input input-bordered w-full pl-10 pr-10"
                            required
                            disabled={isLoading}
                            minLength={8}
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
                    <p className="text-xs text-base-content/40 mt-1.5">
                        Must be at least 8 characters
                    </p>
                </fieldset>

                <button
                    type="submit"
                    className="btn btn-primary w-full mt-2"
                    disabled={isLoading || !isLoaded}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />{" "}
                            Creating account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            {/* Terms */}
            <p className="text-center text-xs text-base-content/40 mt-4">
                By signing up, you agree to our{" "}
                <Link
                    href="/terms-of-service"
                    className="text-primary hover:underline"
                >
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                    href="/privacy-policy"
                    className="text-primary hover:underline"
                >
                    Privacy Policy
                </Link>
            </p>

            {/* Switch mode */}
            <div className="text-center mt-8 text-sm text-base-content/50">
                Already have an account?{" "}
                <Link
                    href={
                        redirectUrl
                            ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
                            : "/sign-in"
                    }
                    className="text-primary font-semibold hover:underline"
                >
                    Sign in
                </Link>
            </div>
        </div>
    );
}
