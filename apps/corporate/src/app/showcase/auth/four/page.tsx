"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AuthView = "login" | "signup" | "forgot";

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
}

/* ------------------------------------------------------------------ */
/*  Password Strength                                                  */
/* ------------------------------------------------------------------ */

function getPasswordStrength(pw: string): {
    score: number;
    label: string;
    color: string;
} {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score, label: "Weak", color: "bg-error" };
    if (score <= 2) return { score, label: "Fair", color: "bg-warning" };
    if (score <= 3) return { score, label: "Good", color: "bg-info" };
    return { score, label: "Strong", color: "bg-success" };
}

const PASSWORD_RULES = [
    { test: (pw: string) => pw.length >= 8, label: "At least 8 characters" },
    { test: (pw: string) => /[A-Z]/.test(pw), label: "One uppercase letter" },
    { test: (pw: string) => /[0-9]/.test(pw), label: "One number" },
    {
        test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
        label: "One special character",
    },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AuthFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState<AuthView>("login");

    /* Login state */
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginShowPw, setLoginShowPw] = useState(false);
    const [loginRemember, setLoginRemember] = useState(false);
    const [loginErrors, setLoginErrors] = useState<FormErrors>({});
    const [loginLoading, setLoginLoading] = useState(false);

    /* Signup state */
    const [signupFirstName, setSignupFirstName] = useState("");
    const [signupLastName, setSignupLastName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirm, setSignupConfirm] = useState("");
    const [signupShowPw, setSignupShowPw] = useState(false);
    const [signupErrors, setSignupErrors] = useState<FormErrors>({});
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupAgree, setSignupAgree] = useState(false);

    /* Forgot state */
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotErrors, setForgotErrors] = useState<FormErrors>({});
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);

    /* Animations */
    useGSAP(
        () => {
            gsap.fromTo(
                ".cin-auth-panel",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            );
        },
        { dependencies: [view], scope: containerRef },
    );

    useGSAP(
        () => {
            gsap.fromTo(
                ".cin-auth-brand",
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
            );
        },
        { scope: containerRef },
    );

    /* Validation */
    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLogin = () => {
        const errors: FormErrors = {};
        if (!loginEmail.trim()) errors.email = "Email is required";
        else if (!validateEmail(loginEmail))
            errors.email = "Enter a valid email address";
        if (!loginPassword) errors.password = "Password is required";
        setLoginErrors(errors);

        if (Object.keys(errors).length === 0) {
            setLoginLoading(true);
            setTimeout(() => setLoginLoading(false), 2000);
        }
    };

    const handleSignup = () => {
        const errors: FormErrors = {};
        if (!signupFirstName.trim())
            errors.firstName = "First name is required";
        if (!signupLastName.trim()) errors.lastName = "Last name is required";
        if (!signupEmail.trim()) errors.email = "Email is required";
        else if (!validateEmail(signupEmail))
            errors.email = "Enter a valid email address";
        if (!signupPassword) errors.password = "Password is required";
        else if (signupPassword.length < 8)
            errors.password = "Password must be at least 8 characters";
        if (signupPassword !== signupConfirm)
            errors.confirmPassword = "Passwords do not match";
        setSignupErrors(errors);

        if (Object.keys(errors).length === 0) {
            setSignupLoading(true);
            setTimeout(() => setSignupLoading(false), 2000);
        }
    };

    const handleForgot = () => {
        const errors: FormErrors = {};
        if (!forgotEmail.trim()) errors.email = "Email is required";
        else if (!validateEmail(forgotEmail))
            errors.email = "Enter a valid email address";
        setForgotErrors(errors);

        if (Object.keys(errors).length === 0) {
            setForgotLoading(true);
            setTimeout(() => {
                setForgotLoading(false);
                setForgotSent(true);
            }, 1500);
        }
    };

    const switchView = (v: AuthView) => {
        setView(v);
        setLoginErrors({});
        setSignupErrors({});
        setForgotErrors({});
        setForgotSent(false);
    };

    const strength = getPasswordStrength(signupPassword);

    /* Social buttons */
    const SocialButtons = () => (
        <div className="space-y-2">
            <button className="btn btn-outline border-base-300 w-full gap-3 hover:border-coral/40">
                <i className="fa-brands fa-google text-sm" />
                <span className="text-sm">Continue with Google</span>
            </button>
            <button className="btn btn-outline border-base-300 w-full gap-3 hover:border-coral/40">
                <i className="fa-brands fa-linkedin text-sm" />
                <span className="text-sm">Continue with LinkedIn</span>
            </button>
            <button className="btn btn-outline border-base-300 w-full gap-3 hover:border-coral/40">
                <i className="fa-brands fa-microsoft text-sm" />
                <span className="text-sm">Continue with Microsoft</span>
            </button>
        </div>
    );

    const Divider = () => (
        <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-base-300" />
            <span className="text-xs text-base-content/40 uppercase tracking-wider">
                or
            </span>
            <div className="flex-1 h-px bg-base-300" />
        </div>
    );

    const ErrorMsg = ({ msg }: { msg?: string }) =>
        msg ? (
            <p className="text-xs text-error mt-1 flex items-center gap-1">
                <i className="fa-duotone fa-regular fa-circle-exclamation text-[10px]" />
                {msg}
            </p>
        ) : null;

    /* ---------------------------------------------------------------- */
    /*  Render forms                                                     */
    /* ---------------------------------------------------------------- */

    const renderLogin = () => (
        <div className="cin-auth-panel">
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black mb-2">
                    Welcome Back
                </h2>
                <p className="text-base-content/50 text-sm">
                    Sign in to your Splits Network account.
                </p>
            </div>

            <SocialButtons />
            <Divider />

            <div className="space-y-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Email
                    </legend>
                    <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@company.com"
                        className={`input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral ${
                            loginErrors.email ? "input-error" : ""
                        }`}
                    />
                    <ErrorMsg msg={loginErrors.email} />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Password
                    </legend>
                    <div className="relative">
                        <input
                            type={loginShowPw ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Enter your password"
                            className={`input input-bordered w-full pr-10 bg-base-200/50 border-base-300 focus:border-coral ${
                                loginErrors.password ? "input-error" : ""
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setLoginShowPw(!loginShowPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                        >
                            <i
                                className={`fa-duotone fa-regular ${
                                    loginShowPw ? "fa-eye-slash" : "fa-eye"
                                } text-sm`}
                            />
                        </button>
                    </div>
                    <ErrorMsg msg={loginErrors.password} />
                </fieldset>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-xs checkbox-primary"
                            checked={loginRemember}
                            onChange={(e) => setLoginRemember(e.target.checked)}
                        />
                        <span className="text-xs text-base-content/60">
                            Remember me
                        </span>
                    </label>
                    <button
                        onClick={() => switchView("forgot")}
                        className="text-xs text-primary hover:underline"
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loginLoading}
                    className="btn btn-primary w-full"
                >
                    {loginLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </div>

            <p className="text-center text-sm text-base-content/50 mt-6">
                Don&apos;t have an account?{" "}
                <button
                    onClick={() => switchView("signup")}
                    className="text-primary font-semibold hover:underline"
                >
                    Create one
                </button>
            </p>
        </div>
    );

    const renderSignup = () => (
        <div className="cin-auth-panel">
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black mb-2">
                    Create Account
                </h2>
                <p className="text-base-content/50 text-sm">
                    Join the split-fee recruiting marketplace.
                </p>
            </div>

            <SocialButtons />
            <Divider />

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                            First Name
                        </legend>
                        <input
                            type="text"
                            value={signupFirstName}
                            onChange={(e) => setSignupFirstName(e.target.value)}
                            placeholder="Sarah"
                            className={`input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral ${
                                signupErrors.firstName ? "input-error" : ""
                            }`}
                        />
                        <ErrorMsg msg={signupErrors.firstName} />
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                            Last Name
                        </legend>
                        <input
                            type="text"
                            value={signupLastName}
                            onChange={(e) => setSignupLastName(e.target.value)}
                            placeholder="Chen"
                            className={`input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral ${
                                signupErrors.lastName ? "input-error" : ""
                            }`}
                        />
                        <ErrorMsg msg={signupErrors.lastName} />
                    </fieldset>
                </div>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Work Email
                    </legend>
                    <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@company.com"
                        className={`input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral ${
                            signupErrors.email ? "input-error" : ""
                        }`}
                    />
                    <ErrorMsg msg={signupErrors.email} />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Password
                    </legend>
                    <div className="relative">
                        <input
                            type={signupShowPw ? "text" : "password"}
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="Create a strong password"
                            className={`input input-bordered w-full pr-10 bg-base-200/50 border-base-300 focus:border-coral ${
                                signupErrors.password ? "input-error" : ""
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setSignupShowPw(!signupShowPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                        >
                            <i
                                className={`fa-duotone fa-regular ${
                                    signupShowPw ? "fa-eye-slash" : "fa-eye"
                                } text-sm`}
                            />
                        </button>
                    </div>
                    <ErrorMsg msg={signupErrors.password} />

                    {/* Password strength */}
                    {signupPassword.length > 0 && (
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex gap-1">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-colors ${
                                                i < strength.score
                                                    ? strength.color
                                                    : "bg-base-300"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-base-content/50 w-12 text-right">
                                    {strength.label}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                {PASSWORD_RULES.map((rule) => (
                                    <div
                                        key={rule.label}
                                        className="flex items-center gap-1.5 text-[11px]"
                                    >
                                        <i
                                            className={`fa-duotone fa-regular ${
                                                rule.test(signupPassword)
                                                    ? "fa-circle-check text-success"
                                                    : "fa-circle text-base-content/20"
                                            } text-[10px]`}
                                        />
                                        <span
                                            className={
                                                rule.test(signupPassword)
                                                    ? "text-base-content/70"
                                                    : "text-base-content/40"
                                            }
                                        >
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                        Confirm Password
                    </legend>
                    <input
                        type="password"
                        value={signupConfirm}
                        onChange={(e) => setSignupConfirm(e.target.value)}
                        placeholder="Confirm your password"
                        className={`input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral ${
                            signupErrors.confirmPassword ? "input-error" : ""
                        }`}
                    />
                    <ErrorMsg msg={signupErrors.confirmPassword} />
                </fieldset>

                <label className="flex items-start gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary mt-0.5"
                        checked={signupAgree}
                        onChange={(e) => setSignupAgree(e.target.checked)}
                    />
                    <span className="text-xs text-base-content/50 leading-relaxed">
                        I agree to the{" "}
                        <span className="text-primary hover:underline cursor-pointer">
                            Terms of Service
                        </span>{" "}
                        and{" "}
                        <span className="text-primary hover:underline cursor-pointer">
                            Privacy Policy
                        </span>
                    </span>
                </label>

                <button
                    onClick={handleSignup}
                    disabled={signupLoading || !signupAgree}
                    className="btn btn-primary w-full"
                >
                    {signupLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            Creating account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </div>

            <p className="text-center text-sm text-base-content/50 mt-6">
                Already have an account?{" "}
                <button
                    onClick={() => switchView("login")}
                    className="text-primary font-semibold hover:underline"
                >
                    Sign in
                </button>
            </p>
        </div>
    );

    const renderForgot = () => (
        <div className="cin-auth-panel">
            {forgotSent ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                        <i className="fa-duotone fa-regular fa-envelope-circle-check text-3xl text-success" />
                    </div>
                    <h2 className="text-2xl font-black mb-2">
                        Check Your Email
                    </h2>
                    <p className="text-base-content/50 text-sm mb-6 max-w-sm mx-auto">
                        We sent a password reset link to{" "}
                        <span className="font-semibold text-base-content">
                            {forgotEmail}
                        </span>
                        . The link expires in 1 hour.
                    </p>
                    <div className="space-y-3">
                        <button className="btn btn-outline border-base-300 btn-sm">
                            <i className="fa-duotone fa-regular fa-envelope mr-2" />
                            Open email app
                        </button>
                        <p className="text-xs text-base-content/40">
                            Didn&apos;t receive it?{" "}
                            <button
                                onClick={() => setForgotSent(false)}
                                className="text-primary hover:underline"
                            >
                                Resend
                            </button>
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <button
                        onClick={() => switchView("login")}
                        className="flex items-center gap-1 text-sm text-base-content/50 hover:text-primary transition-colors mb-6"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left text-xs" />
                        Back to sign in
                    </button>
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-black mb-2">
                            Reset Password
                        </h2>
                        <p className="text-base-content/50 text-sm">
                            Enter your email and we&apos;ll send you a reset
                            link.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-xs uppercase tracking-wider text-base-content/50">
                                Email Address
                            </legend>
                            <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="you@company.com"
                                className={`input input-bordered w-full bg-base-200/50 border-base-300 focus:border-coral ${
                                    forgotErrors.email ? "input-error" : ""
                                }`}
                            />
                            <ErrorMsg msg={forgotErrors.email} />
                        </fieldset>

                        <button
                            onClick={handleForgot}
                            disabled={forgotLoading}
                            className="btn btn-primary w-full"
                        >
                            {forgotLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    /* ---------------------------------------------------------------- */
    /*  Layout                                                           */
    /* ---------------------------------------------------------------- */

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100 flex">
            {/* Left: Brand panel */}
            <div className="cin-auth-brand hidden lg:flex lg:w-[45%] bg-neutral text-neutral-content flex-col justify-between p-10">
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-split text-primary-content" />
                        </div>
                        <span className="font-black text-xl tracking-tight">
                            Splits Network
                        </span>
                    </div>

                    <div className="max-w-md">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4 font-semibold">
                            The Recruiting Marketplace
                        </p>
                        <h2 className="text-3xl xl:text-4xl font-black leading-tight mb-6">
                            Split fees.
                            <br />
                            Close more.
                            <br />
                            Earn together.
                        </h2>
                        <p className="text-neutral-content/50 leading-relaxed">
                            Join thousands of recruiters who collaborate to fill
                            positions faster and earn split-fee commissions on
                            placements across the network.
                        </p>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="mt-auto pt-10">
                    <div className="border-t border-white/10 pt-8">
                        <div className="flex gap-1 mb-3">
                            {Array.from({ length: 5 }, (_, i) => (
                                <i
                                    key={i}
                                    className="fa-duotone fa-solid fa-star text-warning text-xs"
                                />
                            ))}
                        </div>
                        <blockquote className="text-sm text-neutral-content/70 leading-relaxed italic mb-4">
                            &ldquo;Splits Network transformed how our agency
                            works. We&apos;ve closed 3x more placements since
                            joining the marketplace and built an incredible
                            network of recruiting partners.&rdquo;
                        </blockquote>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">
                                    MR
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Maria Rodriguez
                                </p>
                                <p className="text-xs text-neutral-content/40">
                                    VP of Talent, Apex Recruiting
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Auth forms */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-split text-sm text-primary-content" />
                        </div>
                        <span className="font-black text-lg tracking-tight">
                            Splits Network
                        </span>
                    </div>

                    {view === "login" && renderLogin()}
                    {view === "signup" && renderSignup()}
                    {view === "forgot" && renderForgot()}
                </div>
            </div>
        </div>
    );
}
