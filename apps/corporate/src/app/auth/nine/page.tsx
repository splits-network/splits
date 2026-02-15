"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// -- Component ----------------------------------------------------------------

export default function AuthNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeForm, setActiveForm] = useState<"login" | "signup" | "forgot">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [password, setPassword] = useState("");

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo($1(".auth-nine-card"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
        },
        { scope: containerRef, dependencies: [activeForm] },
    );

    const getPasswordStrength = (pw: string): { label: string; width: string; color: string } => {
        if (pw.length === 0) return { label: "", width: "0%", color: "bg-[#233876]/10" };
        if (pw.length < 6) return { label: "Weak", width: "25%", color: "bg-red-400" };
        if (pw.length < 10) return { label: "Fair", width: "50%", color: "bg-amber-400" };
        if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return { label: "Strong", width: "100%", color: "bg-emerald-500" };
        return { label: "Good", width: "75%", color: "bg-[#233876]" };
    };

    const strength = getPasswordStrength(password);
    const inputCls = "w-full px-4 py-3 border-2 border-[#233876]/10 bg-white text-sm text-[#0f1b3d] focus:border-[#233876]/30 focus:outline-none transition-colors placeholder-[#0f1b3d]/25";

    return (
        <div ref={containerRef} className="min-h-screen bg-white flex items-center justify-center py-12 px-6 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/8 pointer-events-none" />
            <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">v9.0</div>
            <div className="absolute bottom-8 left-8 font-mono text-[10px] text-[#233876]/15 tracking-wider">EMPLOYMENT NETWORKS</div>

            {/* Corner marks */}
            <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-[#233876]/15" />
            <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-[#233876]/15" />
            <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-[#233876]/15" />
            <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-[#233876]/15" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 border-2 border-[#233876]/15 flex items-center justify-center mx-auto mb-4 bg-[#233876]">
                        <i className="fa-duotone fa-regular fa-network-wired text-xl text-white" />
                    </div>
                    <div className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase">Employment Networks</div>
                </div>

                {/* Tab Selector */}
                <div className="flex gap-px bg-[#233876]/10 mb-6">
                    {(["login", "signup", "forgot"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveForm(tab); setPassword(""); }}
                            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
                                activeForm === tab
                                    ? "bg-[#233876] text-white"
                                    : "bg-white text-[#0f1b3d]/35 hover:text-[#0f1b3d]/55"
                            }`}
                        >
                            {tab === "login" ? "Sign In" : tab === "signup" ? "Sign Up" : "Reset"}
                        </button>
                    ))}
                </div>

                {/* Auth Card */}
                <div className="auth-nine-card opacity-0 border-2 border-[#233876]/10 bg-white relative">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                    <div className="p-8">
                        {/* ========== LOGIN ========== */}
                        {activeForm === "login" && (
                            <>
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6">
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">REF: AUTH-LOGIN-09</div>
                                    <h2 className="text-2xl font-bold text-[#0f1b3d]">Welcome Back</h2>
                                    <p className="text-xs text-[#0f1b3d]/35 mt-1">Sign in to access your dashboard.</p>
                                </div>

                                <div className="space-y-4">
                                    <fieldset>
                                        <label className="block text-xs font-medium text-[#0f1b3d]/40 uppercase tracking-wider mb-2">Email</label>
                                        <div className="relative">
                                            <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233876]/25 text-xs" />
                                            <input type="email" placeholder="you@company.com" className={`${inputCls} pl-10`} />
                                        </div>
                                    </fieldset>

                                    <fieldset>
                                        <label className="block text-xs font-medium text-[#0f1b3d]/40 uppercase tracking-wider mb-2">Password</label>
                                        <div className="relative">
                                            <i className="fa-regular fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233876]/25 text-xs" />
                                            <input type={showPassword ? "text" : "password"} placeholder="Your password" className={`${inputCls} pl-10 pr-10`} />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#233876]/25 hover:text-[#233876]/50 transition-colors"
                                            >
                                                <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`} />
                                            </button>
                                        </div>
                                    </fieldset>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <div
                                                onClick={() => setRememberMe(!rememberMe)}
                                                className={`w-4 h-4 border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                                    rememberMe ? "border-[#233876] bg-[#233876]" : "border-[#233876]/15"
                                                }`}
                                            >
                                                {rememberMe && <i className="fa-regular fa-check text-[8px] text-white" />}
                                            </div>
                                            <span className="text-xs text-[#0f1b3d]/40">Remember me</span>
                                        </label>
                                        <button onClick={() => setActiveForm("forgot")} className="text-xs text-[#233876]/50 hover:text-[#233876] transition-colors">
                                            Forgot password?
                                        </button>
                                    </div>

                                    <button className="w-full px-5 py-3 border-2 border-[#233876] bg-[#233876] text-sm text-white font-medium hover:bg-[#1a2a5c] transition-colors">
                                        Sign In
                                        <i className="fa-regular fa-arrow-right text-xs ml-2" />
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-dashed border-[#233876]/10" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-4 font-mono text-[10px] text-[#233876]/25 tracking-wider uppercase">or continue with</span>
                                    </div>
                                </div>

                                {/* Social Auth */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#233876]/10 text-sm text-[#0f1b3d]/50 hover:border-[#233876]/25 transition-colors">
                                        <i className="fa-brands fa-google text-sm" />
                                        <span className="text-xs font-medium">Google</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#233876]/10 text-sm text-[#0f1b3d]/50 hover:border-[#233876]/25 transition-colors">
                                        <i className="fa-brands fa-linkedin text-sm" />
                                        <span className="text-xs font-medium">LinkedIn</span>
                                    </button>
                                </div>

                                <div className="text-center mt-6">
                                    <span className="text-xs text-[#0f1b3d]/30">
                                        New to the network?{" "}
                                        <button onClick={() => setActiveForm("signup")} className="text-[#233876] font-medium hover:text-[#1a2a5c] transition-colors">
                                            Create an account
                                        </button>
                                    </span>
                                </div>
                            </>
                        )}

                        {/* ========== SIGNUP ========== */}
                        {activeForm === "signup" && (
                            <>
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6">
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">REF: AUTH-SIGNUP-09</div>
                                    <h2 className="text-2xl font-bold text-[#0f1b3d]">Create Account</h2>
                                    <p className="text-xs text-[#0f1b3d]/35 mt-1">Join the recruiting network. Free to start.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <fieldset>
                                            <label className="block text-xs font-medium text-[#0f1b3d]/40 uppercase tracking-wider mb-2">First Name</label>
                                            <input type="text" placeholder="First" className={inputCls} />
                                        </fieldset>
                                        <fieldset>
                                            <label className="block text-xs font-medium text-[#0f1b3d]/40 uppercase tracking-wider mb-2">Last Name</label>
                                            <input type="text" placeholder="Last" className={inputCls} />
                                        </fieldset>
                                    </div>

                                    <fieldset>
                                        <label className="block text-xs font-medium text-[#0f1b3d]/40 uppercase tracking-wider mb-2">Email</label>
                                        <div className="relative">
                                            <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233876]/25 text-xs" />
                                            <input type="email" placeholder="you@company.com" className={`${inputCls} pl-10`} />
                                        </div>
                                    </fieldset>

                                    <fieldset>
                                        <label className="block text-xs font-medium text-[#0f1b3d]/40 uppercase tracking-wider mb-2">Password</label>
                                        <div className="relative">
                                            <i className="fa-regular fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233876]/25 text-xs" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`${inputCls} pl-10 pr-10`}
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#233876]/25 hover:text-[#233876]/50 transition-colors"
                                            >
                                                <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`} />
                                            </button>
                                        </div>

                                        {/* Password Strength */}
                                        {password.length > 0 && (
                                            <div className="mt-2">
                                                <div className="w-full h-1.5 bg-[#233876]/10">
                                                    <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                                                </div>
                                                <div className="flex justify-between mt-1">
                                                    <span className="font-mono text-[9px] text-[#0f1b3d]/25">Password strength</span>
                                                    <span className={`font-mono text-[9px] ${
                                                        strength.label === "Weak" ? "text-red-400" :
                                                        strength.label === "Fair" ? "text-amber-500" :
                                                        strength.label === "Good" ? "text-[#233876]" :
                                                        "text-emerald-600"
                                                    }`}>{strength.label}</span>
                                                </div>
                                            </div>
                                        )}
                                    </fieldset>

                                    <fieldset>
                                        <label className="block text-xs font-medium text-[#0f1b3d]/40 uppercase tracking-wider mb-2">I am a...</label>
                                        <div className="grid grid-cols-3 gap-px bg-[#233876]/10">
                                            {["Recruiter", "Company", "Candidate"].map((role) => (
                                                <button key={role} className="bg-white px-3 py-2.5 text-xs text-[#0f1b3d]/40 font-medium hover:bg-[#233876]/[0.03] transition-colors focus:bg-[#233876] focus:text-white">
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </fieldset>

                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <div
                                            onClick={() => setAgreeTerms(!agreeTerms)}
                                            className={`w-4 h-4 border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 mt-0.5 ${
                                                agreeTerms ? "border-[#233876] bg-[#233876]" : "border-[#233876]/15"
                                            }`}
                                        >
                                            {agreeTerms && <i className="fa-regular fa-check text-[8px] text-white" />}
                                        </div>
                                        <span className="text-xs text-[#0f1b3d]/35 leading-relaxed">
                                            I agree to the <button className="text-[#233876] hover:text-[#1a2a5c]">Terms of Service</button> and <button className="text-[#233876] hover:text-[#1a2a5c]">Privacy Policy</button>
                                        </span>
                                    </label>

                                    <button className="w-full px-5 py-3 border-2 border-[#233876] bg-[#233876] text-sm text-white font-medium hover:bg-[#1a2a5c] transition-colors">
                                        Create Account
                                        <i className="fa-regular fa-arrow-right text-xs ml-2" />
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-dashed border-[#233876]/10" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-4 font-mono text-[10px] text-[#233876]/25 tracking-wider uppercase">or sign up with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#233876]/10 text-sm text-[#0f1b3d]/50 hover:border-[#233876]/25 transition-colors">
                                        <i className="fa-brands fa-google text-sm" />
                                        <span className="text-xs font-medium">Google</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#233876]/10 text-sm text-[#0f1b3d]/50 hover:border-[#233876]/25 transition-colors">
                                        <i className="fa-brands fa-linkedin text-sm" />
                                        <span className="text-xs font-medium">LinkedIn</span>
                                    </button>
                                </div>

                                <div className="text-center mt-6">
                                    <span className="text-xs text-[#0f1b3d]/30">
                                        Already have an account?{" "}
                                        <button onClick={() => setActiveForm("login")} className="text-[#233876] font-medium hover:text-[#1a2a5c] transition-colors">
                                            Sign in
                                        </button>
                                    </span>
                                </div>
                            </>
                        )}

                        {/* ========== FORGOT PASSWORD ========== */}
                        {activeForm === "forgot" && (
                            <>
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6">
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">REF: AUTH-RESET-09</div>
                                    <h2 className="text-2xl font-bold text-[#0f1b3d]">Reset Password</h2>
                                    <p className="text-xs text-[#0f1b3d]/35 mt-1">Enter your email to receive a reset link.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 border-2 border-[#233876]/8 bg-[#f7f8fa]">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 border border-[#233876]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <i className="fa-duotone fa-regular fa-shield-check text-[#233876] text-sm" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-[#0f1b3d] mb-0.5">Secure Reset</div>
                                                <div className="text-[10px] text-[#0f1b3d]/35 leading-relaxed">
                                                    We will send a password reset link to your registered email address. The link expires in 30 minutes.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <fieldset>
                                        <label className="block text-xs font-medium text-[#0f1b3d]/40 uppercase tracking-wider mb-2">Email Address</label>
                                        <div className="relative">
                                            <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233876]/25 text-xs" />
                                            <input type="email" placeholder="you@company.com" className={`${inputCls} pl-10`} />
                                        </div>
                                    </fieldset>

                                    <button className="w-full px-5 py-3 border-2 border-[#233876] bg-[#233876] text-sm text-white font-medium hover:bg-[#1a2a5c] transition-colors">
                                        Send Reset Link
                                        <i className="fa-regular fa-paper-plane text-xs ml-2" />
                                    </button>

                                    {/* Success State Preview */}
                                    <div className="p-4 border-2 border-emerald-200 bg-emerald-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 border border-emerald-300 flex items-center justify-center bg-emerald-500 flex-shrink-0">
                                                <i className="fa-regular fa-check text-white text-xs" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-emerald-700">Email Sent</div>
                                                <div className="text-[10px] text-emerald-600/60">Check your inbox for the password reset link.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mt-6">
                                    <button onClick={() => setActiveForm("login")} className="text-xs text-[#233876]/50 hover:text-[#233876] transition-colors">
                                        <i className="fa-regular fa-arrow-left text-[10px] mr-2" />
                                        Back to sign in
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Security footer */}
                    <div className="px-8 py-3 border-t-2 border-[#233876]/6 bg-[#f7f8fa]/50 flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <i className="fa-regular fa-lock text-[9px] text-[#233876]/25" />
                            <span className="font-mono text-[9px] text-[#233876]/25 tracking-wider">256-BIT SSL</span>
                        </div>
                        <div className="w-px h-3 bg-[#233876]/10" />
                        <div className="flex items-center gap-1.5">
                            <i className="fa-regular fa-shield-check text-[9px] text-[#233876]/25" />
                            <span className="font-mono text-[9px] text-[#233876]/25 tracking-wider">SOC2 COMPLIANT</span>
                        </div>
                        <div className="w-px h-3 bg-[#233876]/10" />
                        <div className="flex items-center gap-1.5">
                            <i className="fa-regular fa-server text-[9px] text-[#233876]/25" />
                            <span className="font-mono text-[9px] text-[#233876]/25 tracking-wider">GDPR READY</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
