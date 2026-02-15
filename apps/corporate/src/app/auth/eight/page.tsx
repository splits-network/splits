"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const BG = {
  deep: "#0a1628",
  mid: "#0d1d33",
  card: "#0f2847",
  dark: "#081220",
  input: "#0b1a2e",
};

const D = { fast: 0.3, normal: 0.6, hero: 1.0, build: 1.4 };
const E = { smooth: "power2.out", bounce: "back.out(1.2)", elastic: "elastic.out(1, 0.5)" };

type AuthView = "login" | "signup" | "forgot";

export default function AuthEightPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useGSAP(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: E.smooth } });
    tl.from(".auth-logo", { opacity: 0, scale: 0.8, duration: D.normal, ease: E.bounce })
      .from(".auth-card", { opacity: 0, y: 30, duration: D.normal }, "-=0.3")
      .from(".auth-sidebar", { opacity: 0, x: 30, duration: D.normal }, "-=0.4");
  }, { scope: containerRef });

  useGSAP(() => {
    gsap.fromTo(".auth-form-content", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: D.fast, ease: E.smooth });
  }, [view]);

  const renderLogin = () => (
    <div className="auth-form-content">
      <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
      <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-8">// SIGN IN TO YOUR ACCOUNT</p>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-cyan-500/15 font-mono text-sm text-white/60 hover:border-cyan-500/30 hover:text-white/80 transition-colors" style={{ background: BG.input }}>
          <i className="fa-brands fa-google" />
          Google
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-cyan-500/15 font-mono text-sm text-white/60 hover:border-cyan-500/30 hover:text-white/80 transition-colors" style={{ background: BG.input }}>
          <i className="fa-brands fa-linkedin" />
          LinkedIn
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: "rgba(34,211,238,0.1)" }} />
        <span className="font-mono text-xs text-white/30">OR</span>
        <div className="flex-1 h-px" style={{ background: "rgba(34,211,238,0.1)" }} />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Email Address</label>
        <div className="relative">
          <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
            style={{ background: BG.input }}
          />
        </div>
      </div>

      {/* Password */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-mono text-xs text-white/50 uppercase tracking-wider">Password</label>
          <button onClick={() => setView("forgot")} className="font-mono text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <i className="fa-duotone fa-regular fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
            style={{ background: BG.input }}
          />
          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
            <i className={`fa-duotone fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2 mb-6">
        <input type="checkbox" className="checkbox checkbox-xs checkbox-primary border-cyan-500/30" />
        <span className="text-sm text-white/50 font-mono">Remember me</span>
      </div>

      {/* Submit */}
      <button className="w-full py-3 rounded-lg font-mono text-sm font-bold text-white transition-colors hover:opacity-90" style={{ background: "#22d3ee" }}>
        Sign In
      </button>

      <p className="text-center mt-6 text-sm text-white/40 font-mono">
        Don&apos;t have an account?{" "}
        <button onClick={() => setView("signup")} className="text-cyan-400 hover:text-cyan-300 transition-colors">
          Sign up
        </button>
      </p>
    </div>
  );

  const renderSignup = () => (
    <div className="auth-form-content">
      <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
      <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-8">// JOIN THE NETWORK</p>

      {/* Social Signup */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-cyan-500/15 font-mono text-sm text-white/60 hover:border-cyan-500/30 hover:text-white/80 transition-colors" style={{ background: BG.input }}>
          <i className="fa-brands fa-google" />
          Google
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-cyan-500/15 font-mono text-sm text-white/60 hover:border-cyan-500/30 hover:text-white/80 transition-colors" style={{ background: BG.input }}>
          <i className="fa-brands fa-linkedin" />
          LinkedIn
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: "rgba(34,211,238,0.1)" }} />
        <span className="font-mono text-xs text-white/30">OR</span>
        <div className="flex-1 h-px" style={{ background: "rgba(34,211,238,0.1)" }} />
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1.5 block">First Name</label>
          <input
            type="text"
            placeholder="John"
            className="w-full px-3 py-2.5 rounded-lg border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
            style={{ background: BG.input }}
          />
        </div>
        <div>
          <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Last Name</label>
          <input
            type="text"
            placeholder="Doe"
            className="w-full px-3 py-2.5 rounded-lg border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
            style={{ background: BG.input }}
          />
        </div>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Email Address</label>
        <div className="relative">
          <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
            style={{ background: BG.input }}
          />
        </div>
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Password</label>
        <div className="relative">
          <i className="fa-duotone fa-regular fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
            style={{ background: BG.input }}
          />
          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
            <i className={`fa-duotone fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
          </button>
        </div>
        {/* Strength Indicator */}
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="flex-1 h-1 rounded-full" style={{ background: n <= 2 ? "#22d3ee" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
        <p className="font-mono text-xs text-white/30 mt-1">Password strength: Medium</p>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2 mb-6">
        <input type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} className="checkbox checkbox-xs checkbox-primary border-cyan-500/30 mt-0.5" />
        <span className="text-xs text-white/40 font-mono leading-relaxed">
          I agree to the <button className="text-cyan-400 hover:text-cyan-300">Terms of Service</button> and <button className="text-cyan-400 hover:text-cyan-300">Privacy Policy</button>
        </span>
      </div>

      {/* Submit */}
      <button className="w-full py-3 rounded-lg font-mono text-sm font-bold text-white transition-colors hover:opacity-90" style={{ background: "#22d3ee" }}>
        Create Account
      </button>

      <p className="text-center mt-6 text-sm text-white/40 font-mono">
        Already have an account?{" "}
        <button onClick={() => setView("login")} className="text-cyan-400 hover:text-cyan-300 transition-colors">
          Sign in
        </button>
      </p>
    </div>
  );

  const renderForgot = () => (
    <div className="auth-form-content">
      <div className="w-14 h-14 mx-auto mb-6 rounded-xl border border-cyan-500/30 flex items-center justify-center" style={{ background: BG.input }}>
        <i className="fa-duotone fa-regular fa-key text-cyan-400 text-xl" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-1 text-center">Reset your password</h2>
      <p className="text-white/40 font-mono text-xs text-center mb-8">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <div className="mb-6">
        <label className="font-mono text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Email Address</label>
        <div className="relative">
          <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
            style={{ background: BG.input }}
          />
        </div>
      </div>

      <button className="w-full py-3 rounded-lg font-mono text-sm font-bold text-white transition-colors hover:opacity-90 mb-4" style={{ background: "#22d3ee" }}>
        Send Reset Link
      </button>

      <button onClick={() => setView("login")} className="w-full py-3 rounded-lg border border-cyan-500/15 font-mono text-sm text-white/50 hover:text-white/70 hover:border-cyan-500/30 transition-colors flex items-center justify-center gap-2">
        <i className="fa-duotone fa-regular fa-arrow-left" />
        Back to sign in
      </button>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen text-white flex" style={{ background: BG.deep }}>
      {/* Blueprint Grid Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner Dimension Marks */}
      <div className="fixed top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50" />

      {/* Left: Auth Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="auth-logo flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-lg border border-cyan-500/30 flex items-center justify-center" style={{ background: BG.card }}>
              <i className="fa-duotone fa-regular fa-compass-drafting text-cyan-400" />
            </div>
            <span className="font-mono text-sm text-cyan-400 tracking-wider">SPLITS NETWORK</span>
          </div>

          {/* Form Card */}
          <div className="auth-card rounded-xl border border-cyan-500/20 p-8" style={{ background: BG.card }}>
            {view === "login" && renderLogin()}
            {view === "signup" && renderSignup()}
            {view === "forgot" && renderForgot()}
          </div>
        </div>
      </div>

      {/* Right: Sidebar (hidden on mobile) */}
      <div className="auth-sidebar hidden lg:flex relative z-10 w-[480px] items-center justify-center p-12" style={{ background: BG.dark }}>
        <div className="max-w-sm">
          <div className="mb-8">
            <p className="font-mono text-xs text-cyan-400 tracking-[0.3em] uppercase mb-4">// WHY SPLITS NETWORK</p>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">The Blueprint for Smarter Recruiting</h2>
            <p className="text-white/50 font-mono text-sm">
              Join 5,000+ recruiters who use Splits Network to find split-fee opportunities, connect with partners, and close placements faster.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { value: "$2.4M", label: "Avg. annual placement value" },
              { value: "5,000+", label: "Active recruiters" },
              { value: "94%", label: "Success rate" },
              { value: "23 days", label: "Avg. time to fill" },
            ].map(stat => (
              <div key={stat.label} className="p-3 rounded-lg border border-cyan-500/10" style={{ background: BG.input }}>
                <p className="text-xl font-bold text-cyan-400 font-mono">{stat.value}</p>
                <p className="text-white/40 text-xs font-mono">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-lg border border-cyan-500/10 p-5" style={{ background: BG.input }}>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(n => (
                <i key={n} className="fa-solid fa-star text-cyan-400 text-xs" />
              ))}
            </div>
            <p className="text-white/60 text-sm italic mb-3">
              &ldquo;Splits Network transformed our recruiting business. We closed 3x more placements in our first quarter.&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border border-cyan-500/20 flex items-center justify-center font-mono text-xs text-cyan-400 font-bold" style={{ background: BG.dark }}>
                SC
              </div>
              <div>
                <p className="text-white text-sm">Sarah Chen</p>
                <p className="text-white/40 text-xs font-mono">Senior Recruiter, TechHire</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
