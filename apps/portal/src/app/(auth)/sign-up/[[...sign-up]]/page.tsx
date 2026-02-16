"use client";

import { useSignUp, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
    AuthInput,
    SocialLoginButton,
} from "@splits-network/memphis-ui";
import { ensureUserInDatabase } from "@/lib/user-registration";
import { createAuthenticatedClient, createUnauthenticatedClient } from "@/lib/api-client";
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
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [referralCode, setReferralCode] = useState(recCode || "");
    const [referralStatus, setReferralStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
    const [referralRecruiter, setReferralRecruiter] = useState<{ id: string; name: string; profile_image_url?: string | null } | null>(null);
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
                    setReferralError(response?.data?.error_message || "Invalid referral code");
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

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
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
            const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

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
                                    const unauthClient = createUnauthenticatedClient();
                                    const lookupResponse: any = await unauthClient.get(
                                        `/recruiter-codes/lookup?code=${encodeURIComponent(codeToUse)}`,
                                    );
                                    if (lookupResponse?.data?.is_valid) {
                                        referredByRecruiterId = lookupResponse.data.recruiter_id;
                                    }
                                } catch (lookupError) {
                                    console.warn("[SignUp] Failed to resolve rec_code:", lookupError);
                                }
                            }

                            const result = await ensureUserInDatabase(token, {
                                clerk_user_id: completeSignUp.createdUserId!,
                                email: completeSignUp.emailAddress!,
                                name: `${completeSignUp.firstName || firstName} ${completeSignUp.lastName || lastName}`.trim(),
                                referred_by_recruiter_id: referredByRecruiterId,
                            });

                            if (!result.success) {
                                console.warn("[SignUp] User creation warning:", result.error);
                            }

                            if (codeToUse && result.success && !result.wasExisting) {
                                try {
                                    const authClient = createAuthenticatedClient(token);
                                    await authClient.post("/recruiter-codes/log", { code: codeToUse });
                                } catch (logError) {
                                    console.warn("[SignUp] Failed to log rec_code usage:", logError);
                                }
                            }
                        }
                    } catch (userCreationError) {
                        console.error("Failed to create user in database (webhook will handle):", userCreationError);
                    }

                    router.replace(redirectUrl || "/portal/dashboard");
                }, 500);
            } else {
                setError(`Sign up incomplete. Status: ${completeSignUp.status}. Please check the console for details.`);
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.errors?.[0]?.message || "Invalid verification code");
        } finally {
            setIsLoading(false);
        }
    };

    const signUpWithOAuth = (provider: "oauth_google" | "oauth_github" | "oauth_microsoft") => {
        if (!isLoaded) return;
        signUp.authenticateWithRedirect({
            strategy: provider,
            redirectUrl: "/sso-callback",
            redirectUrlComplete: redirectUrl || "/portal/dashboard",
        });
    };

    // Animate step transitions
    useEffect(() => {
        if (!stepRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(
            stepRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
        );
    }, [pendingVerification]);

    // Already signed in state
    if (isLoaded && isSignedIn) {
        return (
            <div className="space-y-4">
                <h2 className="card-title text-lg justify-center">Already Signed In</h2>

                <div className="alert alert-soft alert-teal" role="alert">
                    <i className="fa-duotone fa-regular fa-circle-info" />
                    <span>You&apos;re already signed in to your account.</span>
                </div>

                <p className="text-center text-base-content/60">
                    To create a new account, you&apos;ll need to sign out first.
                </p>

                <button onClick={() => router.push("/portal/dashboard")} className="btn btn-coral btn-block">
                    <i className="fa-duotone fa-regular fa-home" />
                    Go to Dashboard
                </button>
                <button onClick={handleSignOut} className="btn btn-outline btn-block" disabled={isLoading}>
                    {isLoading ? (
                        <><span className="loading loading-spinner" /> Signing out...</>
                    ) : (
                        <><i className="fa-duotone fa-regular fa-right-from-bracket" /> Sign Out & Create New Account</>
                    )}
                </button>
            </div>
        );
    }

    // Verification step
    if (pendingVerification) {
        return (
            <div ref={stepRef} className="space-y-4">
                <h2 className="card-title text-lg">Verify Your Email</h2>

                <div className="alert alert-soft alert-purple" role="alert">
                    <i className="fa-duotone fa-regular fa-envelope" />
                    <span>We sent a verification code to {email}</span>
                </div>

                {error && (
                    <div className="alert alert-outline alert-coral" role="alert">
                        <i className="fa-solid fa-circle-xmark" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleVerification} className="space-y-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Verification Code</legend>
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

                    <button type="submit" className="btn btn-teal btn-block" disabled={isLoading || !isLoaded}>
                        {isLoading ? (
                            <><span className="loading loading-spinner" /> Verifying...</>
                        ) : (
                            "Verify Email"
                        )}
                    </button>
                </form>

                <button onClick={() => setPendingVerification(false)} className="btn btn-ghost btn-sm btn-block">
                    <i className="fa-solid fa-arrow-left" /> Back to sign up
                </button>
            </div>
        );
    }

    // Registration form
    return (
        <div ref={stepRef} className="space-y-4">
            <div>
                <h2 className="card-title text-lg">Create Your Account</h2>
                <p className="text-base-content/50">Join the Splits Network marketplace</p>
            </div>

            {isFromInvitation && (
                <div className="alert alert-soft alert-teal" role="alert">
                    <i className="fa-duotone fa-regular fa-envelope-open-text" />
                    <span>Complete sign-up to accept your invitation</span>
                </div>
            )}

            {error && (
                <div className="alert alert-outline alert-coral" role="alert">
                    <i className="fa-solid fa-circle-xmark" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div id="clerk-captcha" />

                <div className="grid grid-cols-2 gap-4">
                    <AuthInput
                        label="First Name"
                        type="text"
                        value={firstName}
                        onChange={(v: string) => setFirstName(v)}
                        placeholder="John"
                    />
                    <AuthInput
                        label="Last Name"
                        type="text"
                        value={lastName}
                        onChange={(v: string) => setLastName(v)}
                        placeholder="Doe"
                    />
                </div>

                <AuthInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(v: string) => setEmail(v)}
                    placeholder="you@company.com"
                />

                <div>
                    <AuthInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(v: string) => setPassword(v)}
                        placeholder="Enter password"
                        showPasswordToggle
                    />
                    <p className="label text-base-content/50 -mt-1">Must be at least 8 characters</p>
                </div>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                        Referral Code
                        <span className="text-base-content/50 font-normal ml-1">(optional)</span>
                    </legend>
                    <input
                        type="text"
                        placeholder="e.g. abc12345"
                        className={`input w-full tracking-wider ${
                            referralStatus === "valid" ? "input-success" : referralStatus === "invalid" ? "input-error" : ""
                        }`}
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toLowerCase().trim())}
                        disabled={isLoading}
                        maxLength={8}
                    />
                    {referralStatus === "validating" && (
                        <p className="label flex items-center gap-1">
                            <span className="loading loading-spinner loading-xs" />
                            Validating...
                        </p>
                    )}
                    {referralStatus === "valid" && referralRecruiter && (
                        <p className="label text-success flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-circle-check" />
                            Referred by {referralRecruiter.name}
                        </p>
                    )}
                    {referralStatus === "invalid" && (
                        <p className="label text-error flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-circle-xmark" />
                            {referralError}
                        </p>
                    )}
                </fieldset>

                <button type="submit" className="btn btn-coral btn-block" disabled={isLoading || !isLoaded}>
                    {isLoading ? (
                        <><span className="loading loading-spinner" /> Creating account...</>
                    ) : (
                        "Sign Up"
                    )}
                </button>
            </form>

            <div className="divider">or</div>

            <div className="grid grid-cols-3 gap-3">
                <SocialLoginButton label="Google" icon="fa-brands fa-google" color="coral" onClick={() => signUpWithOAuth("oauth_google")} />
                <SocialLoginButton label="GitHub" icon="fa-brands fa-github" color="purple" onClick={() => signUpWithOAuth("oauth_github")} />
                <SocialLoginButton label="Microsoft" icon="fa-brands fa-microsoft" color="teal" onClick={() => signUpWithOAuth("oauth_microsoft")} />
            </div>

            <p className="text-center text-base-content/60">
                Already have an account?{" "}
                <Link
                    href={redirectUrl ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-in"}
                    className="btn btn-link btn-sm text-coral"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
