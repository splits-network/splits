"use client";

import { useSignUp, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ensureUserInDatabase } from "@/lib/user-registration";
import {
    createAuthenticatedClient,
    createUnauthenticatedClient,
} from "@/lib/api-client";
import { getRecCodeFromCookie } from "@/hooks/use-rec-code";

export default function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { isSignedIn, getToken } = useAuth();
    const { signOut } = useClerk();
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirectUrl = searchParams.get("redirect_url");
    const isFromInvitation = redirectUrl?.includes("/accept-invitation/");
    const recCode = searchParams.get("rec_code") || getRecCodeFromCookie();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [referralCode, setReferralCode] = useState(recCode || "");
    const [referralStatus, setReferralStatus] = useState<
        "idle" | "validating" | "valid" | "invalid"
    >("idle");
    const [referralRecruiter, setReferralRecruiter] = useState<{
        id: string;
        name: string;
        profile_image_url?: string | null;
    } | null>(null);
    const [referralError, setReferralError] = useState("");

    const stepRef = useRef<HTMLDivElement>(null);

    // Validate referral code with debounce
    useEffect(() => {
        if (!referralCode || referralCode.length < 8) {
            setReferralStatus("idle");
            setReferralRecruiter(null);
            setReferralError("");
            return;
        }

        const timer = setTimeout(async () => {
            setReferralStatus("validating");
            try {
                const client = createUnauthenticatedClient();
                const response: any = await client.get(
                    `/recruiter-codes/lookup?code=${encodeURIComponent(referralCode)}`,
                );
                if (response?.data?.is_valid) {
                    setReferralStatus("valid");
                    setReferralRecruiter(response.data.recruiter);
                    setReferralError("");
                    document.cookie = `rec_code=${encodeURIComponent(referralCode)}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
                } else {
                    setReferralStatus("invalid");
                    setReferralRecruiter(null);
                    setReferralError(
                        response?.data?.error_message ||
                            "Invalid referral code",
                    );
                }
            } catch {
                setReferralStatus("invalid");
                setReferralRecruiter(null);
                setReferralError("Unable to validate referral code");
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [referralCode]);

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
                { code },
            );

            if (completeSignUp.createdSessionId) {
                await setActive({ session: completeSignUp.createdSessionId });

                setTimeout(async () => {
                    try {
                        const token = await getToken();
                        if (token) {
                            let referredByRecruiterId: string | undefined;
                            const codeToUse = referralCode || recCode;
                            if (codeToUse) {
                                try {
                                    const unauthClient =
                                        createUnauthenticatedClient();
                                    const lookupResponse: any =
                                        await unauthClient.get(
                                            `/recruiter-codes/lookup?code=${encodeURIComponent(codeToUse)}`,
                                        );
                                    if (lookupResponse?.data?.is_valid) {
                                        referredByRecruiterId =
                                            lookupResponse.data.recruiter_id;
                                    }
                                } catch (lookupError) {
                                    console.warn(
                                        "[SignUp] Failed to resolve rec_code:",
                                        lookupError,
                                    );
                                }
                            }

                            const result = await ensureUserInDatabase(token, {
                                clerk_user_id: completeSignUp.createdUserId!,
                                email: completeSignUp.emailAddress!,
                                name: `${completeSignUp.firstName || firstName} ${completeSignUp.lastName || lastName}`.trim(),
                                referred_by_recruiter_id: referredByRecruiterId,
                            });

                            if (!result.success) {
                                console.warn(
                                    "[SignUp] User creation warning:",
                                    result.error,
                                );
                            }

                            if (
                                codeToUse &&
                                result.success &&
                                !result.wasExisting
                            ) {
                                try {
                                    const authClient =
                                        createAuthenticatedClient(token);
                                    await authClient.post(
                                        "/recruiter-codes/log",
                                        { code: codeToUse },
                                    );
                                } catch (logError) {
                                    console.warn(
                                        "[SignUp] Failed to log rec_code usage:",
                                        logError,
                                    );
                                }
                            }
                        }
                    } catch (userCreationError) {
                        console.error(
                            "Failed to create user in database (webhook will handle):",
                            userCreationError,
                        );
                    }

                    router.replace(redirectUrl || "/onboarding");
                }, 500);
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

    // Already signed in state
    if (isLoaded && isSignedIn) {
        return (
            <>
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        Already signed in
                    </h1>
                </div>

                <div
                    className="bg-info/10 border-l-4 border-info p-4 mb-6"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-circle-info text-info mt-0.5" />
                        <span className="text-sm">
                            You&apos;re already signed in to your account.
                        </span>
                    </div>
                </div>

                <p className="text-sm text-base-content/50 text-center mb-6">
                    To create a new account, you&apos;ll need to sign out first.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/portal/dashboard")}
                        className="btn btn-primary w-full"
                    >
                        <i className="fa-duotone fa-regular fa-gauge-high" />
                        Go to Dashboard
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="btn btn-ghost w-full border border-base-300"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading loading-spinner loading-sm" />{" "}
                                Signing out...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-right-from-bracket" />{" "}
                                Sign Out & Create New Account
                            </>
                        )}
                    </button>
                </div>
            </>
        );
    }

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
                            We sent a verification code to{" "}
                            <strong>{email}</strong>
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
                    Create your account
                </h1>
                <p className="text-base-content/50">
                    Join the split-fee recruiting marketplace.
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
                            Complete sign-up to accept your invitation
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
                <button
                    type="button"
                    className="btn btn-ghost w-full border border-base-300 justify-start gap-3"
                    onClick={() => signUpWithOAuth("oauth_github")}
                >
                    <i className="fa-brands fa-github text-lg" />
                    <span className="text-sm font-semibold">
                        Continue with GitHub
                    </span>
                </button>
                <button
                    type="button"
                    className="btn btn-ghost w-full border border-base-300 justify-start gap-3"
                    onClick={() => signUpWithOAuth("oauth_microsoft")}
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
                        />
                    </fieldset>
                </div>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Email Address
                    </label>
                    <div className="relative">
                        <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="input input-bordered w-full pl-10"
                            required
                        />
                    </div>
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Password
                    </label>
                    <div className="relative">
                        <i className="fa-duotone fa-regular fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="input input-bordered w-full pl-10 pr-10"
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
                    <p className="text-xs text-base-content/40 mt-1.5">
                        Must be at least 8 characters
                    </p>
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Referral Code
                        <span className="text-base-content/30 font-normal normal-case tracking-normal ml-1">
                            (optional)
                        </span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. abc12345"
                        className={`input input-bordered w-full tracking-wider ${
                            referralStatus === "valid"
                                ? "input-success"
                                : referralStatus === "invalid"
                                  ? "input-error"
                                  : ""
                        }`}
                        value={referralCode}
                        onChange={(e) =>
                            setReferralCode(e.target.value.toLowerCase().trim())
                        }
                        disabled={isLoading}
                        maxLength={8}
                    />
                    {referralStatus === "validating" && (
                        <p className="text-xs text-base-content/50 mt-1.5 flex items-center gap-1">
                            <span className="loading loading-spinner loading-xs" />
                            Validating...
                        </p>
                    )}
                    {referralStatus === "valid" && referralRecruiter && (
                        <p className="text-xs text-success mt-1.5 flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-circle-check" />
                            Referred by {referralRecruiter.name}
                        </p>
                    )}
                    {referralStatus === "invalid" && (
                        <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-circle-xmark" />
                            {referralError}
                        </p>
                    )}
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
