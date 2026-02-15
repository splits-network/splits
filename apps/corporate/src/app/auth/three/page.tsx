"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out" };

type AuthView = "login" | "signup" | "forgot";

function PasswordStrength({ password }: { password: string }) {
    const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 : 3;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "bg-error", "bg-warning", "bg-primary", "bg-success"];

    if (strength === 0) return null;
    return (
        <div className="mt-2">
            <div className="flex gap-[2px] mb-1">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-[2px] flex-1 ${i <= strength ? colors[strength] : "bg-base-300"}`} />
                ))}
            </div>
            <span className={`text-[9px] uppercase tracking-[0.15em] font-bold ${strength <= 1 ? "text-error" : strength === 2 ? "text-warning" : strength === 3 ? "text-primary" : "text-success"}`}>
                {labels[strength]}
            </span>
        </div>
    );
}

export default function AuthThreePage() {
    const [view, setView] = useState<AuthView>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loginError, setLoginError] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const animateView = (newView: AuthView) => {
        if (!formRef.current || newView === view) return;
        gsap.to(formRef.current, {
            opacity: 0, y: 15, duration: D.fast, ease: E.precise,
            onComplete: () => {
                setView(newView);
                setLoginError(false);
                setForgotSent(false);
                setPassword("");
                gsap.fromTo(formRef.current, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: D.normal, ease: E.precise });
            },
        });
    };

    useGSAP(() => {
        if (!containerRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $1 = (sel: string) => containerRef.current!.querySelector(sel);
        const tl = gsap.timeline({ defaults: { ease: E.precise } });
        tl.fromTo($1(".auth-logo"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: D.normal });
        tl.fromTo($1(".auth-form"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: D.normal }, "-=0.2");
    }, { scope: containerRef });

    const inputClass = "w-full px-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral placeholder:text-base-content/25 transition-colors";

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen flex">
            {/* Left panel - branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-neutral text-neutral-content flex-col justify-between p-12">
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-neutral-content flex items-center justify-center">
                            <span className="text-neutral text-sm font-black">SN</span>
                        </div>
                        <span className="text-sm font-black tracking-tight">SPLITS NETWORK</span>
                    </div>
                    <div className="text-[8rem] font-black tracking-tighter text-neutral-content/5 select-none leading-none mb-6">03</div>
                    <h2 className="text-4xl font-black tracking-tight leading-[0.95] mb-4">
                        The recruiting<br />marketplace built<br />for transparency.
                    </h2>
                    <p className="text-sm text-neutral-content/40 leading-relaxed max-w-sm">
                        Join 12,000+ recruiters and 8,400+ companies already using split-fee partnerships to place talent faster.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-[2px] bg-neutral-content/5">
                    {[
                        { value: "12K+", label: "Recruiters" },
                        { value: "94%", label: "Success Rate" },
                        { value: "$2.1B", label: "Placements" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-neutral py-4 px-3 text-center">
                            <div className="text-lg font-black tracking-tighter">{stat.value}</div>
                            <div className="text-[7px] uppercase tracking-[0.2em] text-neutral-content/30 mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel - form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="auth-logo opacity-0 lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 bg-neutral flex items-center justify-center">
                            <span className="text-neutral-content text-[10px] font-black">SN</span>
                        </div>
                        <span className="text-xs font-black tracking-tight">SPLITS NETWORK</span>
                    </div>

                    {/* Tabs */}
                    <div className="auth-logo opacity-0 flex gap-0 mb-8 border-b border-neutral/10">
                        {(["login", "signup", "forgot"] as const).map((tab) => (
                            <button key={tab} onClick={() => animateView(tab)} className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${view === tab ? "text-base-content border-b-2 border-neutral -mb-[1px]" : "text-base-content/25 hover:text-base-content"}`}>
                                {tab === "forgot" ? "Reset" : tab}
                            </button>
                        ))}
                    </div>

                    <div ref={formRef} className="auth-form opacity-0">
                        {/* ── LOGIN ──────────────────────────────── */}
                        {view === "login" && (
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Welcome Back</h2>
                                <p className="text-sm text-base-content/40 mb-6">Sign in to your account</p>

                                {loginError && (
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-error/5 border border-error/20 mb-4">
                                        <i className="fa-duotone fa-regular fa-circle-xmark text-error text-xs" />
                                        <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-error">Invalid email or password</span>
                                    </div>
                                )}

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Email</label>
                                        <input type="email" placeholder="you@company.com" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Password</label>
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} placeholder="Enter password" className={inputClass} />
                                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/25 hover:text-base-content transition-colors">
                                                <i className={`fa-duotone fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <button onClick={() => setRemember(!remember)} className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border flex items-center justify-center ${remember ? "border-neutral bg-neutral" : "border-neutral/20"}`}>
                                            {remember && <i className="fa-duotone fa-regular fa-check text-neutral-content text-[7px]" />}
                                        </div>
                                        <span className="text-[10px] text-base-content/40 font-medium">Remember me</span>
                                    </button>
                                    <button onClick={() => animateView("forgot")} className="text-[10px] uppercase tracking-[0.15em] font-bold text-base-content/30 hover:text-base-content transition-colors">
                                        Forgot password?
                                    </button>
                                </div>

                                <button onClick={() => setLoginError(true)} className="w-full py-3 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors mb-4">
                                    Sign In
                                </button>

                                <div className="relative my-6">
                                    <div className="h-[1px] bg-neutral/10" />
                                    <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 px-3 text-[9px] uppercase tracking-[0.2em] text-base-content/20 font-bold">or</span>
                                </div>

                                <div className="space-y-[2px]">
                                    {[
                                        { icon: "fa-brands fa-google", label: "Continue with Google" },
                                        { icon: "fa-brands fa-linkedin-in", label: "Continue with LinkedIn" },
                                    ].map((social) => (
                                        <button key={social.label} className="w-full py-3 bg-base-200 text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 hover:text-base-content transition-colors flex items-center justify-center gap-3">
                                            <i className={`${social.icon} text-sm`} />
                                            {social.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── SIGNUP ─────────────────────────────── */}
                        {view === "signup" && (
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Create Account</h2>
                                <p className="text-sm text-base-content/40 mb-6">Join the recruiting marketplace</p>

                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">First Name</label>
                                            <input type="text" placeholder="Jane" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Last Name</label>
                                            <input type="text" placeholder="Doe" className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Work Email</label>
                                        <input type="email" placeholder="you@company.com" className={`${inputClass} border-success/40`} />
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <i className="fa-duotone fa-regular fa-circle-check text-success text-[9px]" />
                                            <span className="text-[9px] text-success font-bold">Email available</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Password</label>
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/25 hover:text-base-content transition-colors">
                                                <i className={`fa-duotone fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`} />
                                            </button>
                                        </div>
                                        <PasswordStrength password={password} />
                                    </div>
                                </div>

                                <button onClick={() => setAcceptTerms(!acceptTerms)} className="flex items-start gap-2 mb-6">
                                    <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 mt-0.5 ${acceptTerms ? "border-neutral bg-neutral" : "border-neutral/20"}`}>
                                        {acceptTerms && <i className="fa-duotone fa-regular fa-check text-neutral-content text-[7px]" />}
                                    </div>
                                    <span className="text-[10px] text-base-content/40 text-left">
                                        I agree to the <span className="text-base-content/60 font-bold">Terms of Service</span> and <span className="text-base-content/60 font-bold">Privacy Policy</span>
                                    </span>
                                </button>

                                <button className="w-full py-3 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors mb-4">
                                    Create Account
                                </button>

                                <div className="relative my-6">
                                    <div className="h-[1px] bg-neutral/10" />
                                    <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 px-3 text-[9px] uppercase tracking-[0.2em] text-base-content/20 font-bold">or</span>
                                </div>

                                <div className="space-y-[2px]">
                                    {[
                                        { icon: "fa-brands fa-google", label: "Sign up with Google" },
                                        { icon: "fa-brands fa-linkedin-in", label: "Sign up with LinkedIn" },
                                    ].map((social) => (
                                        <button key={social.label} className="w-full py-3 bg-base-200 text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 hover:text-base-content transition-colors flex items-center justify-center gap-3">
                                            <i className={`${social.icon} text-sm`} />
                                            {social.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── FORGOT PASSWORD ────────────────────── */}
                        {view === "forgot" && (
                            <div>
                                {forgotSent ? (
                                    <div className="text-center py-8">
                                        <div className="w-14 h-14 bg-success/10 flex items-center justify-center mx-auto mb-4">
                                            <i className="fa-duotone fa-regular fa-envelope-circle-check text-success text-xl" />
                                        </div>
                                        <h2 className="text-2xl font-black tracking-tight mb-2">Check Your Email</h2>
                                        <p className="text-sm text-base-content/40 leading-relaxed mb-6">
                                            We sent a password reset link to your email address. The link expires in 24 hours.
                                        </p>
                                        <button onClick={() => animateView("login")} className="px-5 py-2.5 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.25em] font-black hover:bg-primary hover:text-primary-content transition-colors">
                                            Back to Sign In
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-black tracking-tight mb-1">Reset Password</h2>
                                        <p className="text-sm text-base-content/40 mb-6">Enter your email and we will send a reset link.</p>
                                        <div className="mb-6">
                                            <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Email Address</label>
                                            <input type="email" placeholder="you@company.com" className={inputClass} />
                                        </div>
                                        <button onClick={() => setForgotSent(true)} className="w-full py-3 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors mb-4">
                                            Send Reset Link
                                        </button>
                                        <button onClick={() => animateView("login")} className="w-full text-center text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/25 hover:text-base-content transition-colors py-2">
                                            Back to Sign In
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
