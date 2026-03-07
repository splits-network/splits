"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isSignedIn } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [successfulCreation, setSuccessfulCreation] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [complete, setComplete] = useState(false);

    const stepRef = useRef<HTMLDivElement>(null);

    // Redirect already-signed-in users — active session causes 422 on signIn.create()
    useEffect(() => {
        if (isSignedIn) router.push("/portal/dashboard");
    }, [isSignedIn, router]);

    const handleSendCode = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;
        setError("");
        setIsLoading(true);
        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: email,
            });
            setSuccessfulCreation(true);
        } catch (err: any) {
            setError(
                err.errors?.[0]?.longMessage ||
                    err.errors?.[0]?.message ||
                    "Failed to send reset code",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;
        setError("");
        setIsLoading(true);
        try {
            const result = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code,
                password,
            });

            if (result.status === "needs_second_factor") {
                setError(
                    "Two-factor authentication is required. Please contact support.",
                );
            } else if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                setComplete(true);
                setTimeout(() => router.push("/portal/dashboard"), 2000);
            } else {
                setError("Password reset incomplete. Please try again.");
            }
        } catch (err: any) {
            setError(
                err.errors?.[0]?.longMessage ||
                    err.errors?.[0]?.message ||
                    "Failed to reset password",
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Animate step transitions with CSS
    useEffect(() => {
        if (!stepRef.current) return;
        const el = stepRef.current;
        el.style.opacity = "0";
        el.style.transform = "translateX(20px)";
        requestAnimationFrame(() => {
            el.style.transition = "opacity 0.3s cubic-bezier(0.33,1,0.68,1), transform 0.3s cubic-bezier(0.33,1,0.68,1)";
            el.style.opacity = "1";
            el.style.transform = "translateX(0)";
        });
    }, [successfulCreation, complete]);

    // Success state
    if (complete) {
        return (
            <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-success/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-circle-check text-success text-3xl" />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    Password updated
                </h1>
                <p className="text-base-content/50 mb-6">
                    Your new password is active. Taking you to your dashboard
                    now.
                </p>
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    // Reset code entry + new password step
    if (successfulCreation) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        Check your inbox
                    </h1>
                </div>

                <div
                    className="bg-info/10 border-l-4 border-info p-4 mb-6"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-envelope text-info mt-0.5" />
                        <span className="text-sm">
                            We sent a reset code to <strong>{email}</strong>. It
                            expires in 10 minutes.
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error mb-4" role="alert">
                        <i className="fa-solid fa-circle-xmark" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                    <fieldset>
                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                            Reset Code
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
                        />
                    </fieldset>

                    <fieldset>
                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                            New Password
                        </label>
                        <label className="input input-bordered w-full">
                            <i className="fa-duotone fa-regular fa-lock opacity-50" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="grow"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-base-content/30 hover:text-base-content/60"
                            >
                                <i
                                    className={`fa-duotone fa-regular fa-eye${showPassword ? "-slash" : ""}`}
                                />
                            </button>
                        </label>
                        <p className="text-xs text-base-content/40 mt-1.5">
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
                                <span className="loading loading-spinner loading-sm" />{" "}
                                Resetting password...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>

                <button
                    onClick={() => setSuccessfulCreation(false)}
                    className="btn btn-ghost btn-sm w-full mt-4"
                >
                    <i className="fa-solid fa-arrow-left" /> Back
                </button>
            </div>
        );
    }

    // Initial email entry step
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    Reset your password
                </h1>
                <p className="text-base-content/50">
                    Enter your email and we&apos;ll send a reset code.
                </p>
            </div>

            {error && (
                <div className="alert alert-error mb-4" role="alert">
                    <i className="fa-solid fa-circle-xmark" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-4">
                <div id="clerk-captcha" />
                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Email Address
                    </label>
                    <label className="input input-bordered w-full">
                        <i className="fa-duotone fa-regular fa-envelope opacity-50" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="grow"
                            required
                        />
                    </label>
                </fieldset>

                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isLoading || !isLoaded}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />{" "}
                            Sending code...
                        </>
                    ) : (
                        "Send Reset Code"
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-base-300" />
                <span className="text-xs text-base-content/30 uppercase tracking-widest">
                    or
                </span>
                <div className="flex-1 h-px bg-base-300" />
            </div>

            <div className="text-center text-sm text-base-content/50">
                Remember your password?{" "}
                <Link
                    href="/sign-in"
                    className="text-primary font-semibold hover:underline"
                >
                    Sign in
                </Link>
            </div>
        </div>
    );
}
