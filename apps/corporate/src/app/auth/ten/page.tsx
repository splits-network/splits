"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── component ─── */

export default function AuthShowcaseTen() {
  const mainRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRemember, setLoginRemember] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupTerms, setSignupTerms] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useGSAP(() => {
    if (!mainRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(".auth-scanline", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" });
    gsap.fromTo(".auth-card", { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.3, ease: "power3.out" });
    gsap.fromTo(".status-pulse", { scale: 0.6, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { scope: mainRef });

  const passwordStrength = (pw: string) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "bg-error" };
    if (score <= 2) return { level: 2, label: "Fair", color: "bg-warning" };
    if (score <= 3) return { level: 3, label: "Good", color: "bg-primary" };
    return { level: 4, label: "Strong", color: "bg-success" };
  };

  const handleLogin = () => {
    if (!loginEmail || !loginPassword) { setLoginError("All fields are required"); return; }
    setLoginError("");
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 1500);
  };

  const handleSignup = () => {
    const errs: Record<string, string> = {};
    if (!signupName.trim()) errs.name = "Name is required";
    if (!signupEmail.trim()) errs.email = "Email is required";
    if (signupPassword.length < 8) errs.password = "Minimum 8 characters";
    if (signupPassword !== signupConfirm) errs.confirm = "Passwords do not match";
    if (!signupTerms) errs.terms = "You must accept the terms";
    setSignupErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 1500);
  };

  const handleForgot = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setForgotSent(true); }, 1200);
  };

  const pw = passwordStrength(signupPassword);
  const inputClass = (err?: string) => `input input-sm w-full bg-base-300 border font-mono text-sm ${err ? "border-error" : "border-base-content/10 focus:border-primary/40"}`;

  return (
    <main ref={mainRef} className="min-h-screen bg-base-300 text-base-content flex items-center justify-center px-6">
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/30 pointer-events-none z-10" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="auth-scanline h-[2px] bg-primary w-32 mx-auto mb-6 origin-left" />
          <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 mx-auto mb-4">
            <i className="fa-duotone fa-regular fa-split text-xl" />
          </div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary mb-1">Splits Network</p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/20">Mission Control // Authentication</p>
        </div>

        {/* Auth Card */}
        <div className="auth-card bg-base-200 border border-base-content/10 shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-base-content/10">
            {(["login", "signup", "forgot"] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setLoginError(""); setSignupErrors({}); setForgotSent(false); }} className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-wider transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab ? "text-primary border-primary bg-primary/5" : "text-base-content/25 border-transparent hover:text-base-content/40"
              }`}>
                {tab === "login" ? "Sign In" : tab === "signup" ? "Sign Up" : "Reset"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Login */}
            {activeTab === "login" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fa-duotone fa-regular fa-right-to-bracket text-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary">// auth.login</span>
                </div>

                {loginError && (
                  <div className="p-3 bg-error/10 border border-error/20 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-xs" />
                    <span className="font-mono text-[11px] text-error">{loginError}</span>
                  </div>
                )}

                <fieldset className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Email</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="operator@company.com" className={inputClass()} />
                </fieldset>
                <fieldset className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Password</label>
                  <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="********" className={inputClass()} />
                </fieldset>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={loginRemember} onChange={() => setLoginRemember(!loginRemember)} />
                    <span className="font-mono text-[10px] text-base-content/30">Remember me</span>
                  </label>
                  <button onClick={() => setActiveTab("forgot")} className="font-mono text-[10px] text-primary/60 hover:text-primary uppercase tracking-wider">Forgot password?</button>
                </div>

                <button onClick={handleLogin} disabled={submitting} className="btn btn-primary btn-sm w-full font-mono uppercase tracking-wider text-[10px]">
                  {submitting ? <><span className="loading loading-spinner loading-xs" /> Authenticating...</> : <><i className="fa-duotone fa-regular fa-right-to-bracket mr-1" /> Sign In</>}
                </button>

                <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-base-content/5" /></div><div className="relative flex justify-center"><span className="bg-base-200 px-3 font-mono text-[9px] text-base-content/20 uppercase">or continue with</span></div></div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="btn btn-outline btn-sm font-mono text-[10px]"><i className="fa-brands fa-google mr-2 text-sm" /> Google</button>
                  <button className="btn btn-outline btn-sm font-mono text-[10px]"><i className="fa-brands fa-linkedin mr-2 text-sm" /> LinkedIn</button>
                </div>
              </div>
            )}

            {/* Signup */}
            {activeTab === "signup" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fa-duotone fa-regular fa-user-plus text-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary">// auth.register</span>
                </div>

                <fieldset className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Full Name</label>
                  <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Katherine Reyes" className={inputClass(signupErrors.name)} />
                  {signupErrors.name && <p className="text-error text-[11px] font-mono">{signupErrors.name}</p>}
                </fieldset>
                <fieldset className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Email</label>
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="operator@company.com" className={inputClass(signupErrors.email)} />
                  {signupErrors.email && <p className="text-error text-[11px] font-mono">{signupErrors.email}</p>}
                </fieldset>
                <fieldset className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Password</label>
                  <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Minimum 8 characters" className={inputClass(signupErrors.password)} />
                  {signupPassword && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-base-300 flex gap-0.5">
                        {[1, 2, 3, 4].map(l => <div key={l} className={`flex-1 h-full ${l <= pw.level ? pw.color : "bg-base-content/5"}`} />)}
                      </div>
                      <span className={`font-mono text-[9px] uppercase tracking-wider ${pw.level <= 1 ? "text-error" : pw.level <= 2 ? "text-warning" : pw.level <= 3 ? "text-primary" : "text-success"}`}>{pw.label}</span>
                    </div>
                  )}
                  {signupErrors.password && <p className="text-error text-[11px] font-mono">{signupErrors.password}</p>}
                </fieldset>
                <fieldset className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Confirm Password</label>
                  <input type="password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} placeholder="Re-enter password" className={inputClass(signupErrors.confirm)} />
                  {signupErrors.confirm && <p className="text-error text-[11px] font-mono">{signupErrors.confirm}</p>}
                </fieldset>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-xs checkbox-primary mt-0.5" checked={signupTerms} onChange={() => setSignupTerms(!signupTerms)} />
                  <span className="font-mono text-[10px] text-base-content/30 leading-relaxed">
                    I agree to the <span className="text-primary cursor-pointer">Terms of Service</span> and <span className="text-primary cursor-pointer">Privacy Policy</span>
                  </span>
                </label>
                {signupErrors.terms && <p className="text-error text-[11px] font-mono">{signupErrors.terms}</p>}

                <button onClick={handleSignup} disabled={submitting} className="btn btn-primary btn-sm w-full font-mono uppercase tracking-wider text-[10px]">
                  {submitting ? <><span className="loading loading-spinner loading-xs" /> Creating Account...</> : <><i className="fa-duotone fa-regular fa-user-plus mr-1" /> Create Account</>}
                </button>

                <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-base-content/5" /></div><div className="relative flex justify-center"><span className="bg-base-200 px-3 font-mono text-[9px] text-base-content/20 uppercase">or sign up with</span></div></div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="btn btn-outline btn-sm font-mono text-[10px]"><i className="fa-brands fa-google mr-2 text-sm" /> Google</button>
                  <button className="btn btn-outline btn-sm font-mono text-[10px]"><i className="fa-brands fa-linkedin mr-2 text-sm" /> LinkedIn</button>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            {activeTab === "forgot" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fa-duotone fa-regular fa-key text-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary">// auth.reset_password</span>
                </div>

                {forgotSent ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 flex items-center justify-center bg-success/10 text-success border border-success/20 mx-auto mb-4"><i className="fa-duotone fa-regular fa-envelope-circle-check text-2xl" /></div>
                    <h3 className="text-lg font-bold mb-2">Reset Link Sent</h3>
                    <p className="text-sm text-base-content/40 mb-4">Check your inbox at <span className="font-mono text-primary">{forgotEmail}</span> for password reset instructions.</p>
                    <button onClick={() => setForgotSent(false)} className="btn btn-outline btn-sm font-mono uppercase tracking-wider text-[10px]">Send Again</button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-base-content/40 mb-4">Enter your email address and we will send you a link to reset your password.</p>
                    <fieldset className="space-y-1.5">
                      <label className="font-mono text-[11px] uppercase tracking-wider text-base-content/40">Email Address</label>
                      <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="operator@company.com" className={inputClass()} />
                    </fieldset>
                    <button onClick={handleForgot} disabled={submitting} className="btn btn-primary btn-sm w-full font-mono uppercase tracking-wider text-[10px]">
                      {submitting ? <><span className="loading loading-spinner loading-xs" /> Sending...</> : <><i className="fa-duotone fa-regular fa-paper-plane mr-1" /> Send Reset Link</>}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center p-4 border-t border-base-content/5">
            <div className="flex items-center gap-4 text-base-content/15">
              <div className="flex items-center gap-1"><i className="fa-duotone fa-regular fa-lock text-[10px]" /><span className="font-mono text-[9px] uppercase tracking-wider">256-bit TLS</span></div>
              <span>|</span>
              <div className="flex items-center gap-1"><i className="fa-duotone fa-regular fa-shield-check text-[10px]" /><span className="font-mono text-[9px] uppercase tracking-wider">SOC 2</span></div>
            </div>
          </div>
        </div>

        {/* Bottom status */}
        <div className="flex items-center justify-center gap-2 mt-8 text-base-content/15">
          <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
          <span className="font-mono text-[9px] uppercase tracking-wider">All Systems Operational</span>
        </div>
      </div>
    </main>
  );
}
