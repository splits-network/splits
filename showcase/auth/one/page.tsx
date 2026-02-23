"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* --- Page ----------------------------------------------------------------- */

export default function AuthOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                return;
            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(
                $1(".auth-logo"),
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.5 },
            )
                .fromTo(
                    $1(".auth-heading"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.3",
                )
                .fromTo(
                    $1(".auth-form"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.2",
                )
                .fromTo(
                    $(".auth-social"),
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
                    "-=0.2",
                )
                .fromTo(
                    $(".auth-stat"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
                    "-=0.2",
                );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen flex">
            {/* Left Panel - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-base-100">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="auth-logo opacity-0 mb-10">
                        <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center font-black text-lg">
                            S
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="auth-heading opacity-0 mb-8">
                        {mode === "login" && (
                            <>
                                <h1 className="text-3xl font-black tracking-tight mb-2">
                                    Welcome back
                                </h1>
                                <p className="text-base-content/50">
                                    Sign in to your Splits Network account.
                                </p>
                            </>
                        )}
                        {mode === "signup" && (
                            <>
                                <h1 className="text-3xl font-black tracking-tight mb-2">
                                    Create your account
                                </h1>
                                <p className="text-base-content/50">
                                    Join the split-fee recruiting marketplace.
                                </p>
                            </>
                        )}
                        {mode === "forgot" && (
                            <>
                                <h1 className="text-3xl font-black tracking-tight mb-2">
                                    Reset your password
                                </h1>
                                <p className="text-base-content/50">
                                    Enter your email and we will send a reset
                                    link.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Form */}
                    <div className="auth-form opacity-0">
                        {/* Social login */}
                        {mode !== "forgot" && (
                            <div className="space-y-3 mb-6">
                                <button className="auth-social opacity-0 btn btn-ghost w-full border border-base-300 justify-start gap-3">
                                    <i className="fa-brands fa-google text-lg" />
                                    <span className="text-sm font-semibold">
                                        Continue with Google
                                    </span>
                                </button>
                                <button className="auth-social opacity-0 btn btn-ghost w-full border border-base-300 justify-start gap-3">
                                    <i className="fa-brands fa-linkedin-in text-lg" />
                                    <span className="text-sm font-semibold">
                                        Continue with LinkedIn
                                    </span>
                                </button>
                            </div>
                        )}

                        {mode !== "forgot" && (
                            <div className="flex items-center gap-3 my-6">
                                <div className="flex-1 h-px bg-base-300" />
                                <span className="text-xs text-base-content/30 uppercase tracking-widest">
                                    or
                                </span>
                                <div className="flex-1 h-px bg-base-300" />
                            </div>
                        )}

                        <div className="space-y-4">
                            {mode === "signup" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
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
                                            placeholder="Kim"
                                            className="input input-bordered w-full"
                                        />
                                    </fieldset>
                                </div>
                            )}

                            <fieldset>
                                <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        className="input input-bordered w-full pl-10"
                                    />
                                </div>
                            </fieldset>

                            {mode !== "forgot" && (
                                <fieldset>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
                                            Password
                                        </label>
                                        {mode === "login" && (
                                            <button
                                                onClick={() =>
                                                    setMode("forgot")
                                                }
                                                className="text-xs text-primary font-semibold hover:underline"
                                            >
                                                Forgot?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <i className="fa-duotone fa-regular fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter your password"
                                            className="input input-bordered w-full pl-10 pr-10"
                                        />
                                        <button
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60"
                                        >
                                            <i
                                                className={`fa-duotone fa-regular fa-eye${showPassword ? "-slash" : ""}`}
                                            />
                                        </button>
                                    </div>
                                    {mode === "signup" && (
                                        <div className="flex gap-1 mt-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-1 flex-1 bg-base-300"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </fieldset>
                            )}

                            {mode === "signup" && (
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-sm mt-0.5"
                                        checked={agreeTerms}
                                        onChange={() =>
                                            setAgreeTerms(!agreeTerms)
                                        }
                                    />
                                    <span className="text-xs text-base-content/50 leading-relaxed">
                                        I agree to the{" "}
                                        <button className="text-primary font-semibold">
                                            Terms of Service
                                        </button>{" "}
                                        and{" "}
                                        <button className="text-primary font-semibold">
                                            Privacy Policy
                                        </button>
                                    </span>
                                </label>
                            )}

                            <button className="btn btn-primary w-full mt-2">
                                {mode === "login" && "Sign In"}
                                {mode === "signup" && "Create Account"}
                                {mode === "forgot" && "Send Reset Link"}
                            </button>
                        </div>

                        {/* Switch mode */}
                        <div className="text-center mt-8 text-sm text-base-content/50">
                            {mode === "login" && (
                                <>
                                    Do not have an account?{" "}
                                    <button
                                        onClick={() => setMode("signup")}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        Sign up
                                    </button>
                                </>
                            )}
                            {mode === "signup" && (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        onClick={() => setMode("login")}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                            {mode === "forgot" && (
                                <>
                                    Remember your password?{" "}
                                    <button
                                        onClick={() => setMode("login")}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Branding */}
            <div className="hidden lg:flex lg:w-2/5 bg-neutral text-neutral-content flex-col justify-between p-12 relative">
                <div
                    className="absolute top-0 left-0 w-full h-full bg-primary/5"
                    style={{
                        clipPath: "polygon(0 0,100% 0,100% 100%,20% 100%)",
                    }}
                />
                <div className="relative z-10">
                    <h2 className="text-3xl font-black leading-tight tracking-tight mb-4">
                        The marketplace for
                        <br />
                        <span className="text-primary">
                            split-fee recruiting.
                        </span>
                    </h2>
                    <p className="text-sm text-neutral-content/40 leading-relaxed max-w-sm">
                        Connect with companies, submit candidates, and earn
                        split fees on every successful placement.
                    </p>
                </div>

                <div className="relative z-10 space-y-4">
                    {[
                        {
                            value: "2,400+",
                            label: "Open Roles",
                            icon: "fa-duotone fa-regular fa-briefcase",
                        },
                        {
                            value: "$8.2M",
                            label: "Paid to Recruiters",
                            icon: "fa-duotone fa-regular fa-dollar-sign",
                        },
                        {
                            value: "94%",
                            label: "Recruiter Satisfaction",
                            icon: "fa-duotone fa-regular fa-star",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="auth-stat opacity-0 flex items-center gap-4 p-4 bg-neutral-content/5"
                        >
                            <div className="w-10 h-10 bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <i className={`${stat.icon} text-primary`} />
                            </div>
                            <div>
                                <div className="text-lg font-black">
                                    {stat.value}
                                </div>
                                <div className="text-[10px] uppercase tracking-widest text-neutral-content/40">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative z-10">
                    <div className="border-l-4 border-coral pl-4">
                        <p className="text-sm text-neutral-content/60 italic mb-3">
                            &ldquo;Splits Network transformed my independent
                            recruiting practice. I earned more in my first
                            quarter than I did all of last year.&rdquo;
                        </p>
                        <p className="text-xs font-bold">Sarah Kim</p>
                        <p className="text-[10px] text-neutral-content/40">
                            Senior Technical Recruiter
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
