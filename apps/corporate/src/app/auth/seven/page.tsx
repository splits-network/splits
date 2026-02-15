"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Page ────────────────────────────────────────────────────────────────────

type AuthView = "login" | "signup" | "forgot";

export default function AuthSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeView, setActiveView] = useState<AuthView>("login");
    const [showPassword, setShowPassword] = useState(false);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-auth-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-auth-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-auth-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    <div className="bp-auth-ref flex justify-between items-center mb-6 opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-AUTH07-2026</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            AUTHENTICATION
                        </div>
                    </div>

                    <h1 className="bp-auth-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                        Auth <span className="text-[#3b5ccc]">Forms</span>
                    </h1>
                    <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mb-10">// IDENTITY VERIFICATION INTERFACES</p>

                    {/* ═══ View Switcher ═══ */}
                    <div className="flex justify-center gap-2 mb-10">
                        {(["login", "signup", "forgot"] as AuthView[]).map((view) => (
                            <button
                                key={view}
                                onClick={() => setActiveView(view)}
                                className={`px-4 py-2 font-mono text-[10px] tracking-widest border transition-colors ${
                                    activeView === view
                                        ? "border-[#3b5ccc] text-[#3b5ccc] bg-[#3b5ccc]/10"
                                        : "border-[#c8ccd4]/10 text-[#c8ccd4]/30 hover:text-[#c8ccd4]/60 hover:border-[#c8ccd4]/20"
                                }`}
                            >
                                {view === "login" ? "LOGIN" : view === "signup" ? "SIGN_UP" : "FORGOT_PASS"}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-md mx-auto">
                        {/* ═══ Login Form ═══ */}
                        {activeView === "login" && (
                            <div className="bp-auth-card opacity-0 border border-[#3b5ccc]/15">
                                <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                    AUTH_MODULE // LOGIN
                                </div>
                                <div className="p-8">
                                    <div className="w-16 h-16 border-2 border-[#3b5ccc]/20 mx-auto mb-6 flex items-center justify-center bg-[#3b5ccc]/5">
                                        <i className="fa-duotone fa-regular fa-fingerprint text-2xl text-[#3b5ccc]/40"></i>
                                    </div>
                                    <h2 className="text-xl font-bold text-white text-center mb-1">Welcome Back</h2>
                                    <p className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider text-center mb-8">// AUTHENTICATE TO CONTINUE</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">EMAIL_ADDRESS</label>
                                            <div className="relative">
                                                <i className="fa-duotone fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#3b5ccc]/20"></i>
                                                <input
                                                    type="email"
                                                    placeholder="operator@company.com"
                                                    className="w-full bg-transparent border border-[#3b5ccc]/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">PASSWORD</label>
                                            <div className="relative">
                                                <i className="fa-duotone fa-regular fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#3b5ccc]/20"></i>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter password"
                                                    className="w-full bg-transparent border border-[#3b5ccc]/15 pl-10 pr-12 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#c8ccd4]/20 hover:text-[#c8ccd4]/50 transition-colors"
                                                >
                                                    <i className={`fa-duotone fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <div className="w-4 h-4 border border-[#3b5ccc]/15 hover:border-[#3b5ccc]/30 transition-colors"></div>
                                                <span className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider">REMEMBER_ME</span>
                                            </label>
                                            <button
                                                onClick={() => setActiveView("forgot")}
                                                className="font-mono text-[10px] text-[#3b5ccc]/50 tracking-wider hover:text-[#3b5ccc] transition-colors"
                                            >
                                                FORGOT_PASSWORD?
                                            </button>
                                        </div>
                                        <button className="w-full px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc] mt-2">
                                            AUTHENTICATE
                                        </button>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-[#3b5ccc]/10">
                                        <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest text-center mb-4">OR_CONTINUE_WITH</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { icon: "fa-google", label: "Google" },
                                                { icon: "fa-github", label: "GitHub" },
                                                { icon: "fa-linkedin", label: "LinkedIn" },
                                            ].map((provider) => (
                                                <button
                                                    key={provider.label}
                                                    className="flex items-center justify-center gap-2 py-2.5 border border-[#c8ccd4]/10 hover:border-[#3b5ccc]/30 hover:bg-[#3b5ccc]/5 transition-colors"
                                                >
                                                    <i className={`fa-brands ${provider.icon} text-sm text-[#c8ccd4]/30`}></i>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <span className="font-mono text-[10px] text-[#c8ccd4]/20 tracking-wider">NO_ACCOUNT? </span>
                                        <button
                                            onClick={() => setActiveView("signup")}
                                            className="font-mono text-[10px] text-[#3b5ccc]/60 tracking-wider hover:text-[#3b5ccc] transition-colors"
                                        >
                                            REGISTER_NOW
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══ Sign Up Form ═══ */}
                        {activeView === "signup" && (
                            <div className="bp-auth-card opacity-0 border border-[#3b5ccc]/15">
                                <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                    AUTH_MODULE // REGISTRATION
                                </div>
                                <div className="p-8">
                                    <div className="w-16 h-16 border-2 border-[#14b8a6]/20 mx-auto mb-6 flex items-center justify-center bg-[#14b8a6]/5">
                                        <i className="fa-duotone fa-regular fa-user-plus text-2xl text-[#14b8a6]/40"></i>
                                    </div>
                                    <h2 className="text-xl font-bold text-white text-center mb-1">Create Account</h2>
                                    <p className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider text-center mb-8">// NEW OPERATOR REGISTRATION</p>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">FIRST_NAME</label>
                                                <input
                                                    type="text"
                                                    placeholder="First"
                                                    className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">LAST_NAME</label>
                                                <input
                                                    type="text"
                                                    placeholder="Last"
                                                    className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">EMAIL_ADDRESS</label>
                                            <input
                                                type="email"
                                                placeholder="operator@company.com"
                                                className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">PASSWORD</label>
                                            <input
                                                type="password"
                                                placeholder="Min 8 characters"
                                                className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                            />
                                            <div className="flex gap-1 mt-2">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="flex-1 h-1 bg-[#c8ccd4]/10"></div>
                                                ))}
                                            </div>
                                            <div className="font-mono text-[8px] text-[#c8ccd4]/15 tracking-wider mt-1">PASSWORD_STRENGTH: --</div>
                                        </div>
                                        <div>
                                            <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">CONFIRM_PASSWORD</label>
                                            <input
                                                type="password"
                                                placeholder="Re-enter password"
                                                className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">ACCOUNT_TYPE</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {["Recruiter", "Hiring Company"].map((type) => (
                                                    <button
                                                        key={type}
                                                        className="py-2.5 border border-[#3b5ccc]/15 font-mono text-[10px] text-[#c8ccd4]/40 tracking-wider hover:border-[#3b5ccc]/40 hover:text-white hover:bg-[#3b5ccc]/5 transition-colors"
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <label className="flex items-start gap-2 cursor-pointer mt-2">
                                            <div className="w-4 h-4 border border-[#3b5ccc]/15 hover:border-[#3b5ccc]/30 transition-colors flex-shrink-0 mt-0.5"></div>
                                            <span className="font-mono text-[10px] text-[#c8ccd4]/20 tracking-wider leading-relaxed">
                                                I agree to the <span className="text-[#3b5ccc]/50">Terms of Service</span> and <span className="text-[#3b5ccc]/50">Privacy Policy</span>
                                            </span>
                                        </label>
                                        <button className="w-full px-5 py-2.5 bg-[#14b8a6] text-white font-mono text-[10px] tracking-widest hover:bg-[#14b8a6]/90 transition-colors border border-[#14b8a6]">
                                            CREATE_ACCOUNT
                                        </button>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <span className="font-mono text-[10px] text-[#c8ccd4]/20 tracking-wider">HAVE_ACCOUNT? </span>
                                        <button
                                            onClick={() => setActiveView("login")}
                                            className="font-mono text-[10px] text-[#3b5ccc]/60 tracking-wider hover:text-[#3b5ccc] transition-colors"
                                        >
                                            LOGIN_HERE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══ Forgot Password ═══ */}
                        {activeView === "forgot" && (
                            <div className="bp-auth-card opacity-0 border border-[#3b5ccc]/15">
                                <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                    AUTH_MODULE // PASSWORD RECOVERY
                                </div>
                                <div className="p-8">
                                    <div className="w-16 h-16 border-2 border-[#eab308]/20 mx-auto mb-6 flex items-center justify-center bg-[#eab308]/5">
                                        <i className="fa-duotone fa-regular fa-key text-2xl text-[#eab308]/40"></i>
                                    </div>
                                    <h2 className="text-xl font-bold text-white text-center mb-1">Reset Password</h2>
                                    <p className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider text-center mb-8">// CREDENTIAL RECOVERY PROTOCOL</p>

                                    <div className="space-y-4">
                                        <div className="border border-[#eab308]/10 bg-[#eab308]/5 p-4">
                                            <div className="flex items-start gap-3">
                                                <i className="fa-duotone fa-regular fa-circle-info text-xs text-[#eab308]/40 mt-0.5"></i>
                                                <p className="text-xs text-[#c8ccd4]/40 leading-relaxed">
                                                    Enter the email address associated with your account. We will send you a secure link to reset your password.
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">EMAIL_ADDRESS</label>
                                            <div className="relative">
                                                <i className="fa-duotone fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#3b5ccc]/20"></i>
                                                <input
                                                    type="email"
                                                    placeholder="operator@company.com"
                                                    className="w-full bg-transparent border border-[#3b5ccc]/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                />
                                            </div>
                                        </div>
                                        <button className="w-full px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]">
                                            SEND_RESET_LINK
                                        </button>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setActiveView("login")}
                                            className="font-mono text-[10px] text-[#3b5ccc]/50 tracking-wider hover:text-[#3b5ccc] transition-colors"
                                        >
                                            <i className="fa-duotone fa-regular fa-arrow-left text-[8px] mr-1"></i>
                                            BACK_TO_LOGIN
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
