"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { AuthInput } from "@splits-network/memphis-ui";

export default function ForgotPasswordPage() {
    const { isLoaded, signIn } = useSignIn();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [successfulCreation, setSuccessfulCreation] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [complete, setComplete] = useState(false);

    const stepRef = useRef<HTMLDivElement>(null);

    const handleSendCode = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;
        setError("");
        setIsLoading(true);
        try {
            await signIn.create({ strategy: "reset_password_email_code", identifier: email });
            setSuccessfulCreation(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Failed to send reset code");
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
            const result = await signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code, password });
            if (result.status === "complete") {
                setComplete(true);
                setTimeout(() => router.push("/sign-in"), 2000);
            } else {
                setError("Password reset incomplete. Please try again.");
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    // Animate step transitions
    useEffect(() => {
        if (!stepRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(
            stepRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
        );
    }, [successfulCreation, complete]);

    if (complete) {
        return (
            <div ref={stepRef} className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4 border-teal bg-teal">
                    <i className="fa-duotone fa-regular fa-check text-2xl text-dark" />
                </div>
                <h2 className="card-title text-xl justify-center mb-2">Password Reset Successful</h2>
                <p className="text-base-content/50 mb-4">Your password has been updated. Redirecting to sign in...</p>
                <span className="loading loading-spinner loading-lg text-coral" />
            </div>
        );
    }

    if (successfulCreation) {
        return (
            <div ref={stepRef} className="space-y-4">
                <h2 className="card-title text-lg">Reset Your Password</h2>

                <div className="alert alert-soft alert-purple" role="alert">
                    <i className="fa-duotone fa-regular fa-envelope" />
                    <span>We sent a reset code to {email}</span>
                </div>

                {error && (
                    <div className="alert alert-outline alert-coral" role="alert">
                        <i className="fa-solid fa-circle-xmark" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Reset Code</legend>
                        <input
                            type="text"
                            placeholder="123456"
                            className="input w-full text-center text-2xl tracking-widest"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            disabled={isLoading}
                            maxLength={6}
                        />
                    </fieldset>

                    <AuthInput
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(v: string) => setPassword(v)}
                        placeholder="Enter new password"
                        showPasswordToggle
                    />
                    <p className="label text-base-content/50 -mt-2">Must be at least 8 characters</p>

                    <button type="submit" className="btn btn-yellow btn-block" disabled={isLoading || !isLoaded}>
                        {isLoading ? (
                            <><span className="loading loading-spinner" /> Resetting password...</>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>

                <button onClick={() => setSuccessfulCreation(false)} className="btn btn-ghost btn-sm btn-block">
                    <i className="fa-solid fa-arrow-left" /> Back
                </button>
            </div>
        );
    }

    return (
        <div ref={stepRef} className="space-y-4">
            <div>
                <h2 className="card-title text-lg">Reset Password</h2>
                <p className="text-base-content/50">Enter your email and we&apos;ll send you a reset code.</p>
            </div>

            {error && (
                <div className="alert alert-outline alert-coral" role="alert">
                    <i className="fa-solid fa-circle-xmark" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-4">
                <AuthInput
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(v: string) => setEmail(v)}
                    placeholder="you@company.com"
                />

                <button type="submit" className="btn btn-yellow btn-block" disabled={isLoading || !isLoaded}>
                    {isLoading ? (
                        <><span className="loading loading-spinner" /> Sending code...</>
                    ) : (
                        "Send Reset Code"
                    )}
                </button>
            </form>

            <div className="divider">or</div>

            <Link href="/sign-in" className="btn btn-ghost btn-sm btn-block">
                <i className="fa-solid fa-arrow-left" /> Back to Sign In
            </Link>
        </div>
    );
}
