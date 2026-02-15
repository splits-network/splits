"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

const C = { coral: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

type AuthTab = "login" | "signup" | "forgot";

const SOCIALS = [
    { label: "Google", icon: "fa-brands fa-google", color: C.coral },
    { label: "LinkedIn", icon: "fa-brands fa-linkedin-in", color: C.teal },
];

function passwordStrength(pw: string): { level: number; label: string; color: string } {
    if (!pw) return { level: 0, label: "", color: C.dark };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: C.coral };
    if (score <= 2) return { level: 2, label: "Fair", color: C.yellow };
    if (score <= 3) return { level: 3, label: "Good", color: C.teal };
    return { level: 4, label: "Strong", color: C.teal };
}

export default function AuthSixPage() {
    const [tab, setTab] = useState<AuthTab>("login");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loginError, setLoginError] = useState("");

    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirm, setSignupConfirm] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
    const [signupSuccess, setSignupSuccess] = useState(false);

    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSent, setForgotSent] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const strength = passwordStrength(signupPassword);

    const handleLogin = () => {
        if (!loginEmail || !loginPassword) { setLoginError("Please fill in all fields"); return; }
        setLoginError("Invalid email or password. Please try again.");
    };

    const handleSignup = () => {
        const errors: Record<string, string> = {};
        if (!signupName.trim()) errors.name = "Name is required";
        if (!signupEmail.trim()) errors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) errors.email = "Invalid email";
        if (!signupPassword) errors.password = "Password is required";
        else if (signupPassword.length < 8) errors.password = "Must be 8+ characters";
        if (signupPassword !== signupConfirm) errors.confirm = "Passwords don't match";
        if (!agreeTerms) errors.terms = "You must agree to the terms";
        setSignupErrors(errors);
        if (Object.keys(errors).length === 0) setSignupSuccess(true);
    };

    const handleForgot = () => {
        if (forgotEmail.trim()) setForgotSent(true);
    };

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const shapes = pageRef.current.querySelectorAll(".memphis-shape");
        gsap.fromTo(shapes, { opacity: 0, scale: 0, rotation: -180 }, { opacity: 0.15, scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)", stagger: { each: 0.05, from: "random" }, delay: 0.3 });
        shapes.forEach((s, i) => {
            gsap.to(s, { y: `+=${6 + (i % 3) * 4}`, rotation: `+=${(i % 2 === 0 ? 1 : -1) * 5}`, duration: 3 + i * 0.3, ease: "sine.inOut", repeat: -1, yoyo: true });
        });
        gsap.fromTo(cardRef.current, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)", delay: 0.2 });
    }, []);

    useEffect(() => {
        if (!cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(cardRef.current.querySelector(".auth-content"), { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
    }, [tab]);

    return (
        <div ref={pageRef} className="min-h-screen relative overflow-hidden flex items-center" style={{ backgroundColor: C.dark }}>
            {/* Memphis Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="memphis-shape absolute top-[8%] left-[5%] w-20 h-20 rounded-full border-[4px]" style={{ borderColor: C.coral }} />
                <div className="memphis-shape absolute top-[55%] right-[7%] w-16 h-16 rounded-full" style={{ backgroundColor: C.teal }} />
                <div className="memphis-shape absolute bottom-[12%] left-[10%] w-12 h-12 rotate-45" style={{ backgroundColor: C.yellow }} />
                <div className="memphis-shape absolute top-[22%] right-[15%] w-14 h-14 rotate-12" style={{ backgroundColor: C.purple }} />
                <div className="memphis-shape absolute bottom-[25%] right-[30%] w-10 h-10 rounded-full border-3" style={{ borderColor: C.coral }} />
                <div className="memphis-shape absolute top-[70%] left-[25%]" style={{ width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderBottom: `31px solid ${C.teal}` }} />
                <svg className="memphis-shape absolute bottom-[10%] right-[40%]" width="80" height="25" viewBox="0 0 80 25">
                    <polyline points="0,20 10,5 20,20 30,5 40,20 50,5 60,20 70,5 80,20" fill="none" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12 max-w-md">
                <div ref={cardRef} className="border-4" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                    {/* Color bar */}
                    <div className="flex h-1.5">
                        <div className="flex-1" style={{ backgroundColor: C.coral }} />
                        <div className="flex-1" style={{ backgroundColor: C.teal }} />
                        <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                        <div className="flex-1" style={{ backgroundColor: C.purple }} />
                    </div>

                    {/* Logo */}
                    <div className="p-6 pb-0 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: C.coral }}>
                                <i className="fa-duotone fa-regular fa-network-wired text-sm" style={{ color: C.white }}></i>
                            </div>
                            <span className="text-sm font-black uppercase tracking-wider" style={{ color: C.dark }}>Splits <span style={{ color: C.coral }}>Network</span></span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 pt-4 flex border-b-3" style={{ borderColor: C.cream }}>
                        {([
                            { key: "login" as AuthTab, label: "Login", color: C.coral },
                            { key: "signup" as AuthTab, label: "Sign Up", color: C.teal },
                            { key: "forgot" as AuthTab, label: "Forgot", color: C.yellow },
                        ]).map((t) => (
                            <button key={t.key} onClick={() => { setTab(t.key); setLoginError(""); setSignupErrors({}); setSignupSuccess(false); setForgotSent(false); }}
                                className="flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-3 -mb-[3px] transition-colors"
                                style={{ borderColor: tab === t.key ? t.color : "transparent", color: tab === t.key ? C.dark : "rgba(26,26,46,0.4)" }}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="auth-content p-6">
                        {/* LOGIN */}
                        {tab === "login" && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-black uppercase tracking-wider mb-1" style={{ color: C.dark }}>Welcome Back</h2>
                                <p className="text-xs mb-4" style={{ color: C.dark, opacity: 0.5 }}>Sign in to your account</p>

                                {loginError && (
                                    <div className="p-3 border-3 flex items-center gap-2" style={{ borderColor: C.coral }}>
                                        <i className="fa-solid fa-circle-xmark text-sm" style={{ color: C.coral }}></i>
                                        <span className="text-xs font-bold" style={{ color: C.coral }}>{loginError}</span>
                                    </div>
                                )}

                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Email</label>
                                    <input value={loginEmail} onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }}
                                        placeholder="you@company.com" type="email"
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none"
                                        style={{ borderColor: loginError ? C.coral : C.dark, backgroundColor: C.cream, color: C.dark }} />
                                </fieldset>

                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Password</label>
                                    <div className="relative">
                                        <input value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                                            placeholder="Enter password" type={showPassword ? "text" : "password"}
                                            className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none pr-12"
                                            style={{ borderColor: loginError ? C.coral : C.dark, backgroundColor: C.cream, color: C.dark }} />
                                        <button onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.dark, opacity: 0.4 }}>
                                            <i className={`fa-duotone fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
                                        </button>
                                    </div>
                                </fieldset>

                                <div className="flex items-center justify-between">
                                    <button onClick={() => setRemember(!remember)} className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 flex items-center justify-center"
                                            style={{ borderColor: remember ? C.teal : "rgba(26,26,46,0.2)", backgroundColor: remember ? C.teal : "transparent" }}>
                                            {remember && <i className="fa-solid fa-check text-[8px]" style={{ color: C.dark }}></i>}
                                        </div>
                                        <span className="text-xs font-semibold" style={{ color: C.dark }}>Remember me</span>
                                    </button>
                                    <button onClick={() => setTab("forgot")} className="text-xs font-bold uppercase" style={{ color: C.coral }}>Forgot Password?</button>
                                </div>

                                <button onClick={handleLogin}
                                    className="w-full py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                    Sign In
                                </button>

                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 h-0.5" style={{ backgroundColor: C.cream }} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.3 }}>or</span>
                                    <div className="flex-1 h-0.5" style={{ backgroundColor: C.cream }} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {SOCIALS.map((s) => (
                                        <button key={s.label} className="py-3 border-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                                            style={{ borderColor: s.color, color: s.color }}>
                                            <i className={`${s.icon} text-sm`}></i>{s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SIGNUP */}
                        {tab === "signup" && (
                            <div className="space-y-4">
                                {signupSuccess ? (
                                    <div className="py-8 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4" style={{ borderColor: C.teal, backgroundColor: C.teal }}>
                                            <i className="fa-duotone fa-regular fa-check text-2xl" style={{ color: C.white }}></i>
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-wide mb-2" style={{ color: C.dark }}>Account Created!</h3>
                                        <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>Check your email for a verification link.</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-black uppercase tracking-wider mb-1" style={{ color: C.dark }}>Create Account</h2>
                                        <p className="text-xs mb-4" style={{ color: C.dark, opacity: 0.5 }}>Join the recruiting revolution</p>

                                        <fieldset>
                                            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Full Name</label>
                                            <input value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Marcus Thompson"
                                                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none"
                                                style={{ borderColor: signupErrors.name ? C.coral : C.dark, backgroundColor: C.cream, color: C.dark }} />
                                            {signupErrors.name && <p className="text-xs font-bold mt-1" style={{ color: C.coral }}>{signupErrors.name}</p>}
                                        </fieldset>

                                        <fieldset>
                                            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Email</label>
                                            <input value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="marcus@company.com" type="email"
                                                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none"
                                                style={{ borderColor: signupErrors.email ? C.coral : C.dark, backgroundColor: C.cream, color: C.dark }} />
                                            {signupErrors.email && <p className="text-xs font-bold mt-1" style={{ color: C.coral }}>{signupErrors.email}</p>}
                                        </fieldset>

                                        <fieldset>
                                            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Password</label>
                                            <input value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Create a strong password"
                                                type={showPassword ? "text" : "password"}
                                                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none"
                                                style={{ borderColor: signupErrors.password ? C.coral : C.dark, backgroundColor: C.cream, color: C.dark }} />
                                            {signupErrors.password && <p className="text-xs font-bold mt-1" style={{ color: C.coral }}>{signupErrors.password}</p>}
                                            {signupPassword && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex-1 flex gap-1">
                                                        {[1, 2, 3, 4].map((l) => (
                                                            <div key={l} className="flex-1 h-1.5" style={{ backgroundColor: l <= strength.level ? strength.color : "rgba(26,26,46,0.1)" }} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase" style={{ color: strength.color }}>{strength.label}</span>
                                                </div>
                                            )}
                                        </fieldset>

                                        <fieldset>
                                            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Confirm Password</label>
                                            <input value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} placeholder="Confirm your password" type="password"
                                                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none"
                                                style={{ borderColor: signupErrors.confirm ? C.coral : C.dark, backgroundColor: C.cream, color: C.dark }} />
                                            {signupErrors.confirm && <p className="text-xs font-bold mt-1" style={{ color: C.coral }}>{signupErrors.confirm}</p>}
                                        </fieldset>

                                        <button onClick={() => setAgreeTerms(!agreeTerms)} className="flex items-center gap-2 w-full text-left">
                                            <div className="w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center"
                                                style={{ borderColor: signupErrors.terms ? C.coral : (agreeTerms ? C.teal : "rgba(26,26,46,0.2)"), backgroundColor: agreeTerms ? C.teal : "transparent" }}>
                                                {agreeTerms && <i className="fa-solid fa-check text-[8px]" style={{ color: C.dark }}></i>}
                                            </div>
                                            <span className="text-xs font-semibold" style={{ color: C.dark }}>
                                                I agree to the <span style={{ color: C.coral }}>Terms of Service</span> and <span style={{ color: C.coral }}>Privacy Policy</span>
                                            </span>
                                        </button>
                                        {signupErrors.terms && <p className="text-xs font-bold" style={{ color: C.coral }}>{signupErrors.terms}</p>}

                                        <button onClick={handleSignup}
                                            className="w-full py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                            style={{ borderColor: C.teal, backgroundColor: C.teal, color: C.dark }}>
                                            Create Account
                                        </button>

                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-0.5" style={{ backgroundColor: C.cream }} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.3 }}>or</span>
                                            <div className="flex-1 h-0.5" style={{ backgroundColor: C.cream }} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {SOCIALS.map((s) => (
                                                <button key={s.label} className="py-3 border-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                                                    style={{ borderColor: s.color, color: s.color }}>
                                                    <i className={`${s.icon} text-sm`}></i>{s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* FORGOT PASSWORD */}
                        {tab === "forgot" && (
                            <div className="space-y-4">
                                {forgotSent ? (
                                    <div className="py-8 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4" style={{ borderColor: C.yellow, backgroundColor: C.yellow }}>
                                            <i className="fa-duotone fa-regular fa-envelope-circle-check text-2xl" style={{ color: C.dark }}></i>
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-wide mb-2" style={{ color: C.dark }}>Email Sent!</h3>
                                        <p className="text-xs mb-4" style={{ color: C.dark, opacity: 0.5 }}>Check your inbox for a password reset link.</p>
                                        <button onClick={() => setTab("login")} className="px-5 py-2 text-xs font-black uppercase border-3" style={{ borderColor: C.dark, color: C.dark }}>
                                            Back to Login
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-black uppercase tracking-wider mb-1" style={{ color: C.dark }}>Reset Password</h2>
                                        <p className="text-xs mb-4" style={{ color: C.dark, opacity: 0.5 }}>
                                            Enter your email and we&apos;ll send you a reset link.
                                        </p>

                                        <fieldset>
                                            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Email Address</label>
                                            <input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                                                placeholder="you@company.com" type="email"
                                                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none"
                                                style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }} />
                                        </fieldset>

                                        <button onClick={handleForgot}
                                            className="w-full py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                            style={{ borderColor: C.yellow, backgroundColor: C.yellow, color: C.dark }}>
                                            Send Reset Link
                                        </button>

                                        <button onClick={() => setTab("login")} className="w-full text-center text-xs font-bold uppercase" style={{ color: C.dark, opacity: 0.4 }}>
                                            <i className="fa-solid fa-arrow-left mr-1 text-[10px]"></i>Back to Login
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
