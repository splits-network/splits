"use client";

import { useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type AuthMode = "login" | "signup" | "forgot";

interface FieldError {
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    terms?: string;
}

/* ─── Password Strength ─────────────────────────────────────────────────────── */

function getPasswordStrength(pw: string): { label: string; percent: number; color: string } {
    if (!pw) return { label: "", percent: 0, color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak", percent: 20, color: "bg-error" };
    if (score === 2) return { label: "Fair", percent: 40, color: "bg-warning" };
    if (score === 3) return { label: "Good", percent: 60, color: "bg-info" };
    if (score === 4) return { label: "Strong", percent: 80, color: "bg-success" };
    return { label: "Excellent", percent: 100, color: "bg-success" };
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function AuthPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [remember, setRemember] = useState(false);
    const [terms, setTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FieldError>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);

    useGSAP(() => {
        gsap.from("[data-auth-hero]", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" });
        gsap.from("[data-auth-form]", { y: 30, opacity: 0, duration: 0.7, delay: 0.2, ease: "power2.out" });
        gsap.from("[data-auth-side]", { x: 30, opacity: 0, duration: 0.7, delay: 0.4, ease: "power2.out" });
    }, { scope: containerRef });

    const validate = useCallback((): boolean => {
        const errs: FieldError = {};
        if (!email) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address";

        if (mode !== "forgot") {
            if (!password) errs.password = "Password is required";
            else if (mode === "signup" && password.length < 8) errs.password = "Password must be at least 8 characters";
        }

        if (mode === "signup") {
            if (!fullName) errs.fullName = "Full name is required";
            if (password && confirmPassword && password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
            if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
            if (!terms) errs.terms = "You must accept the terms";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [email, password, confirmPassword, fullName, terms, mode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            if (mode === "forgot") setForgotSent(true);
            else setSubmitted(true);
        }, 1500);
    };

    const switchMode = (m: AuthMode) => {
        setMode(m);
        setErrors({});
        setSubmitted(false);
        setForgotSent(false);
    };

    const strength = getPasswordStrength(password);

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100 overflow-hidden">
            {/* Hero */}
            <section className="bg-neutral text-neutral-content py-16 md:py-20">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <p data-auth-hero className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4">Authentication</p>
                    <h1 data-auth-hero className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-4">Sign In<br />& Register</h1>
                    <p data-auth-hero className="text-lg text-neutral-content/60 max-w-lg">Authentication flows with form validation, password strength indicators, social login, and responsive layout.</p>
                </div>
            </section>

            {/* Auth Section */}
            <section className="py-12 md:py-20">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                        {/* Form Column */}
                        <div data-auth-form className="flex-1 max-w-md">
                            {/* Mode Tabs */}
                            <div className="flex gap-0 border-b border-base-300 mb-8">
                                {([["login", "Sign In"], ["signup", "Create Account"], ["forgot", "Reset"]] as [AuthMode, string][]).map(([key, label]) => (
                                    <button key={key} onClick={() => switchMode(key)} className={`px-5 py-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-all ${mode === key ? "border-b-base-content text-base-content" : "border-b-transparent text-base-content/40 hover:text-base-content/60"}`}>{label}</button>
                                ))}
                            </div>

                            {/* Success States */}
                            {submitted && (
                                <div className="border border-success/30 bg-success/5 p-6 mb-6">
                                    <div className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-circle-check text-success mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-base-content mb-1">{mode === "login" ? "Signed in successfully" : "Account created"}</p>
                                            <p className="text-xs text-base-content/50">{mode === "login" ? "Redirecting to your dashboard..." : "Check your email for a verification link."}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {forgotSent && (
                                <div className="border border-info/30 bg-info/5 p-6 mb-6">
                                    <div className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-envelope text-info mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-base-content mb-1">Reset link sent</p>
                                            <p className="text-xs text-base-content/50">If an account exists for {email}, you will receive a password reset email shortly.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            {!submitted && !forgotSent && (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Full Name (signup only) */}
                                    {mode === "signup" && (
                                        <fieldset>
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 font-medium mb-1.5 block">Full Name</label>
                                            <div className="relative">
                                                <i className="fa-duotone fa-regular fa-user absolute left-3 top-1/2 -translate-y-1/2 text-base-content/25 text-sm" />
                                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alexandra Whitfield" className={`input input-bordered w-full bg-base-200 pl-10 ${errors.fullName ? "border-error" : "focus:border-secondary"}`} />
                                            </div>
                                            {errors.fullName && <p className="text-[11px] text-error mt-1">{errors.fullName}</p>}
                                        </fieldset>
                                    )}

                                    {/* Email */}
                                    <fieldset>
                                        <label className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 font-medium mb-1.5 block">Email Address</label>
                                        <div className="relative">
                                            <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-base-content/25 text-sm" />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={`input input-bordered w-full bg-base-200 pl-10 ${errors.email ? "border-error" : "focus:border-secondary"}`} />
                                        </div>
                                        {errors.email && <p className="text-[11px] text-error mt-1">{errors.email}</p>}
                                    </fieldset>

                                    {/* Password (not forgot) */}
                                    {mode !== "forgot" && (
                                        <fieldset>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 font-medium">Password</label>
                                                {mode === "login" && <button type="button" onClick={() => switchMode("forgot")} className="text-[10px] text-secondary hover:underline">Forgot?</button>}
                                            </div>
                                            <div className="relative">
                                                <i className="fa-duotone fa-regular fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-base-content/25 text-sm" />
                                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className={`input input-bordered w-full bg-base-200 pl-10 pr-10 ${errors.password ? "border-error" : "focus:border-secondary"}`} />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/25 hover:text-base-content/50 transition-colors">
                                                    <i className={`fa-duotone fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-[11px] text-error mt-1">{errors.password}</p>}

                                            {/* Password Strength (signup) */}
                                            {mode === "signup" && password && (
                                                <div className="mt-2.5">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] uppercase tracking-wider text-base-content/30 font-medium">Strength</span>
                                                        <span className={`text-[10px] uppercase tracking-wider font-medium ${strength.color.replace("bg-", "text-")}`}>{strength.label}</span>
                                                    </div>
                                                    <div className="h-1 bg-base-300 w-full">
                                                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                                                    </div>
                                                    <ul className="mt-2 space-y-0.5">
                                                        {[
                                                            { test: password.length >= 8, text: "At least 8 characters" },
                                                            { test: /[A-Z]/.test(password), text: "One uppercase letter" },
                                                            { test: /[0-9]/.test(password), text: "One number" },
                                                            { test: /[^A-Za-z0-9]/.test(password), text: "One special character" },
                                                        ].map((rule) => (
                                                            <li key={rule.text} className="flex items-center gap-1.5">
                                                                <i className={`fa-regular ${rule.test ? "fa-check text-success" : "fa-xmark text-base-content/20"} text-[10px]`} />
                                                                <span className={`text-[10px] ${rule.test ? "text-base-content/50" : "text-base-content/25"}`}>{rule.text}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </fieldset>
                                    )}

                                    {/* Confirm Password (signup) */}
                                    {mode === "signup" && (
                                        <fieldset>
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 font-medium mb-1.5 block">Confirm Password</label>
                                            <div className="relative">
                                                <i className="fa-duotone fa-regular fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-base-content/25 text-sm" />
                                                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className={`input input-bordered w-full bg-base-200 pl-10 ${errors.confirmPassword ? "border-error" : "focus:border-secondary"}`} />
                                            </div>
                                            {errors.confirmPassword && <p className="text-[11px] text-error mt-1">{errors.confirmPassword}</p>}
                                        </fieldset>
                                    )}

                                    {/* Remember Me (login) */}
                                    {mode === "login" && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="checkbox checkbox-secondary checkbox-xs" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                            <span className="text-xs text-base-content/50">Remember me for 30 days</span>
                                        </label>
                                    )}

                                    {/* Terms (signup) */}
                                    {mode === "signup" && (
                                        <fieldset>
                                            <label className="flex items-start gap-2 cursor-pointer">
                                                <input type="checkbox" className="checkbox checkbox-secondary checkbox-xs mt-0.5" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                                                <span className="text-xs text-base-content/50">I agree to the <a href="#" className="text-secondary hover:underline">Terms of Service</a> and <a href="#" className="text-secondary hover:underline">Privacy Policy</a></span>
                                            </label>
                                            {errors.terms && <p className="text-[11px] text-error mt-1">{errors.terms}</p>}
                                        </fieldset>
                                    )}

                                    {/* Submit */}
                                    <button type="submit" disabled={submitting} className="btn btn-block bg-base-content text-base-100 hover:opacity-90 font-semibold uppercase text-xs tracking-wider">
                                        {submitting ? (
                                            <span className="flex items-center gap-2"><span className="loading loading-spinner loading-xs" />{mode === "login" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Sending link..."}</span>
                                        ) : (
                                            mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Divider */}
                            {!submitted && !forgotSent && mode !== "forgot" && (
                                <>
                                    <div className="flex items-center gap-4 my-6">
                                        <div className="h-px bg-base-300 flex-1" />
                                        <span className="text-[10px] uppercase tracking-wider text-base-content/30 font-medium">Or continue with</span>
                                        <div className="h-px bg-base-300 flex-1" />
                                    </div>

                                    {/* Social Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="btn btn-ghost border border-base-300 text-xs font-medium">
                                            <i className="fa-brands fa-google text-sm mr-2" />Google
                                        </button>
                                        <button className="btn btn-ghost border border-base-300 text-xs font-medium">
                                            <i className="fa-brands fa-linkedin text-sm mr-2" />LinkedIn
                                        </button>
                                    </div>

                                    {/* Switch Mode */}
                                    <p className="text-center text-xs text-base-content/40 mt-6">
                                        {mode === "login" ? (
                                            <>Don&apos;t have an account? <button onClick={() => switchMode("signup")} className="text-secondary hover:underline font-medium">Create one</button></>
                                        ) : (
                                            <>Already have an account? <button onClick={() => switchMode("login")} className="text-secondary hover:underline font-medium">Sign in</button></>
                                        )}
                                    </p>
                                </>
                            )}

                            {mode === "forgot" && !forgotSent && (
                                <p className="text-center text-xs text-base-content/40 mt-6">
                                    Remember your password? <button onClick={() => switchMode("login")} className="text-secondary hover:underline font-medium">Sign in</button>
                                </p>
                            )}
                        </div>

                        {/* Side Panel */}
                        <aside data-auth-side className="flex-1 max-w-sm lg:border-l lg:border-base-300 lg:pl-12">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-5">Why Splits Network</h3>
                                    <div className="space-y-5">
                                        {[
                                            { icon: "fa-duotone fa-regular fa-shield-check", title: "Enterprise Security", desc: "SOC 2 Type II certified. Your data is encrypted at rest and in transit." },
                                            { icon: "fa-duotone fa-regular fa-bolt", title: "Instant Access", desc: "Start sourcing and placing candidates within minutes of signing up." },
                                            { icon: "fa-duotone fa-regular fa-handshake", title: "Split-Fee Network", desc: "Access thousands of verified recruiters for collaborative placements." },
                                            { icon: "fa-duotone fa-regular fa-chart-mixed", title: "Advanced Analytics", desc: "Track pipeline, placements, and revenue with real-time dashboards." },
                                        ].map((item) => (
                                            <div key={item.title} className="flex gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center bg-base-200/60 shrink-0">
                                                    <i className={`${item.icon} text-secondary text-sm`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-base-content mb-0.5">{item.title}</p>
                                                    <p className="text-xs text-base-content/45 leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-base-300" />

                                <blockquote className="border-l-4 border-secondary pl-4">
                                    <p className="text-sm italic text-base-content/60 leading-relaxed mb-2">&ldquo;We onboarded our entire team in under 10 minutes. The SSO integration was seamless.&rdquo;</p>
                                    <cite className="text-[10px] text-base-content/35 not-italic uppercase tracking-wider">Diana Foster, VP Talent Acquisition</cite>
                                </blockquote>

                                <div className="h-px bg-base-300" />

                                <div className="flex items-center gap-6">
                                    {[
                                        { value: "2,500+", label: "Recruiters" },
                                        { value: "50K+", label: "Placements" },
                                        { value: "99.9%", label: "Uptime" },
                                    ].map((stat) => (
                                        <div key={stat.label} className="text-center">
                                            <p className="text-lg font-bold text-base-content">{stat.value}</p>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-medium">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Colophon */}
            <section className="bg-base-200 border-t border-base-300 py-12">
                <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">Splits Network &middot; Authentication &middot; Magazine Editorial</p>
                </div>
            </section>
        </div>
    );
}
