"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

// ─── Memphis Colors ─────────────────────────────────────────────────────────
const C = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    dark: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface RecruiterForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    title: string;
    experience: string;
    specializations: string[];
    bio: string;
    linkedIn: string;
    website: string;
    referralSource: string;
    agreeTerms: boolean;
    agreeMarketing: boolean;
    resume: string;
    preferredContact: string;
}

type ValidationState = "idle" | "error" | "success" | "warning";

const INITIAL_FORM: RecruiterForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    experience: "",
    specializations: [],
    bio: "",
    linkedIn: "",
    website: "",
    referralSource: "",
    agreeTerms: false,
    agreeMarketing: false,
    resume: "",
    preferredContact: "email",
};

const SPECIALIZATIONS = [
    "Software Engineering",
    "Product Management",
    "Design / UX",
    "Data Science",
    "DevOps / SRE",
    "Sales / Marketing",
    "Finance / Accounting",
    "Executive Search",
    "Healthcare",
    "Legal",
];

const STEPS = [
    { label: "Personal Info", icon: "fa-duotone fa-regular fa-user", color: C.coral },
    { label: "Professional", icon: "fa-duotone fa-regular fa-briefcase", color: C.teal },
    { label: "Specializations", icon: "fa-duotone fa-regular fa-bullseye", color: C.yellow },
    { label: "Confirm", icon: "fa-duotone fa-regular fa-check-double", color: C.purple },
];

// ─── Validation helpers ─────────────────────────────────────────────────────
function getFieldState(value: string, touched: boolean, required: boolean): { state: ValidationState; message: string } {
    if (!touched) return { state: "idle", message: "" };
    if (required && !value.trim()) return { state: "error", message: "This field is required" };
    if (value.trim().length > 0 && value.trim().length < 2) return { state: "warning", message: "Seems too short" };
    if (value.trim()) return { state: "success", message: "" };
    return { state: "idle", message: "" };
}

function getEmailState(value: string, touched: boolean): { state: ValidationState; message: string } {
    if (!touched) return { state: "idle", message: "" };
    if (!value.trim()) return { state: "error", message: "Email is required" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { state: "error", message: "Invalid email format" };
    return { state: "success", message: "" };
}

function stateColor(state: ValidationState): string {
    switch (state) {
        case "error": return C.coral;
        case "success": return C.teal;
        case "warning": return C.yellow;
        default: return C.dark;
    }
}

function stateIcon(state: ValidationState): string | null {
    switch (state) {
        case "error": return "fa-solid fa-circle-xmark";
        case "success": return "fa-solid fa-circle-check";
        case "warning": return "fa-solid fa-triangle-exclamation";
        default: return null;
    }
}

// ─── Input Component ────────────────────────────────────────────────────────
function MemphisInput({
    label, value, onChange, placeholder, type = "text", required = false,
    state = "idle", message = "", disabled = false,
}: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
    type?: string; required?: boolean; state?: ValidationState; message?: string; disabled?: boolean;
}) {
    return (
        <fieldset className="relative">
            <label className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>
                {label}
                {required && <span style={{ color: C.coral }}>*</span>}
                {stateIcon(state) && (
                    <i className={`${stateIcon(state)} text-xs ml-auto`} style={{ color: stateColor(state) }}></i>
                )}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-all"
                style={{
                    borderColor: stateColor(state),
                    backgroundColor: disabled ? "#E8E3DE" : C.cream,
                    color: C.dark,
                    boxShadow: state === "error" ? `0 0 0 1px ${C.coral}` : state === "success" ? `0 0 0 1px ${C.teal}` : "none",
                }}
            />
            {message && (
                <p className="text-xs font-bold mt-1.5 flex items-center gap-1" style={{ color: stateColor(state) }}>
                    {message}
                </p>
            )}
        </fieldset>
    );
}

// ─── Textarea Component ─────────────────────────────────────────────────────
function MemphisTextarea({
    label, value, onChange, placeholder, required = false, rows = 4,
    state = "idle", message = "", maxLength,
}: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
    required?: boolean; rows?: number; state?: ValidationState; message?: string; maxLength?: number;
}) {
    return (
        <fieldset className="relative">
            <label className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>
                {label}
                {required && <span style={{ color: C.coral }}>*</span>}
                {stateIcon(state) && (
                    <i className={`${stateIcon(state)} text-xs ml-auto`} style={{ color: stateColor(state) }}></i>
                )}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-all resize-none"
                style={{ borderColor: stateColor(state), backgroundColor: C.cream, color: C.dark }}
            />
            <div className="flex items-center justify-between mt-1">
                {message && <p className="text-xs font-bold" style={{ color: stateColor(state) }}>{message}</p>}
                {maxLength && (
                    <p className="text-xs font-bold ml-auto" style={{ color: value.length > maxLength * 0.9 ? C.coral : "rgba(26,26,46,0.4)" }}>
                        {value.length}/{maxLength}
                    </p>
                )}
            </div>
        </fieldset>
    );
}

// ─── Select Component ───────────────────────────────────────────────────────
function MemphisSelect({
    label, value, onChange, options, required = false, state = "idle",
}: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; required?: boolean; state?: ValidationState;
}) {
    return (
        <fieldset>
            <label className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>
                {label}
                {required && <span style={{ color: C.coral }}>*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none cursor-pointer transition-all"
                style={{ borderColor: stateColor(state), backgroundColor: C.cream, color: C.dark }}
            >
                <option value="">Select...</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </fieldset>
    );
}

// ─── File Upload Component ──────────────────────────────────────────────────
function MemphisFileUpload({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const [dragOver, setDragOver] = useState(false);

    return (
        <fieldset>
            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>
                {label}
            </label>
            <div
                className="border-3 border-dashed p-6 text-center transition-all cursor-pointer"
                style={{
                    borderColor: dragOver ? C.teal : value ? C.teal : C.dark,
                    backgroundColor: dragOver ? "rgba(78,205,196,0.05)" : value ? "rgba(78,205,196,0.03)" : C.cream,
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); onChange("resume_uploaded.pdf"); }}
                onClick={() => onChange(value ? "" : "resume_uploaded.pdf")}
            >
                {value ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                            <i className="fa-duotone fa-regular fa-file-pdf text-lg" style={{ color: C.dark }}></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold" style={{ color: C.dark }}>{value}</p>
                            <p className="text-xs" style={{ color: C.teal }}>Click to remove</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center border-3"
                            style={{ borderColor: C.dark }}>
                            <i className="fa-duotone fa-regular fa-cloud-arrow-up text-xl" style={{ color: C.dark }}></i>
                        </div>
                        <p className="text-sm font-bold mb-1" style={{ color: C.dark }}>
                            Drop your file here or click to browse
                        </p>
                        <p className="text-xs" style={{ color: "rgba(26,26,46,0.5)" }}>
                            PDF, DOC, DOCX up to 10MB
                        </p>
                    </>
                )}
            </div>
        </fieldset>
    );
}

// ─── Radio Group Component ──────────────────────────────────────────────────
function MemphisRadioGroup({
    label, value, onChange, options,
}: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string; icon: string }[];
}) {
    return (
        <fieldset>
            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-3" style={{ color: C.dark }}>
                {label}
            </label>
            <div className="flex flex-wrap gap-3">
                {options.map((opt) => (
                    <button key={opt.value} type="button"
                        onClick={() => onChange(opt.value)}
                        className="flex items-center gap-2 px-4 py-2.5 border-3 text-sm font-bold uppercase tracking-wider transition-all"
                        style={{
                            borderColor: value === opt.value ? C.teal : C.dark,
                            backgroundColor: value === opt.value ? C.teal : "transparent",
                            color: value === opt.value ? C.dark : C.dark,
                        }}
                    >
                        <i className={`${opt.icon} text-xs`}></i>
                        {opt.label}
                    </button>
                ))}
            </div>
        </fieldset>
    );
}

// ─── Checkbox Component ─────────────────────────────────────────────────────
function MemphisCheckbox({
    label, checked, onChange, color = C.teal,
}: {
    label: string; checked: boolean; onChange: (v: boolean) => void; color?: string;
}) {
    return (
        <button type="button" onClick={() => onChange(!checked)}
            className="flex items-center gap-3 text-left w-full group">
            <div className="w-6 h-6 flex-shrink-0 border-3 flex items-center justify-center transition-all"
                style={{
                    borderColor: checked ? color : C.dark,
                    backgroundColor: checked ? color : "transparent",
                }}>
                {checked && <i className="fa-solid fa-check text-xs" style={{ color: color === C.yellow ? C.dark : C.white }}></i>}
            </div>
            <span className="text-sm font-semibold" style={{ color: C.dark }}>{label}</span>
        </button>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function FormsSixPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<RecruiterForm>(INITIAL_FORM);
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    const stepRef = useRef<HTMLDivElement>(null);

    const touch = useCallback((field: string) => {
        setTouched((prev) => new Set(prev).add(field));
    }, []);

    const updateField = useCallback(<K extends keyof RecruiterForm>(field: K, value: RecruiterForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        touch(field);
    }, [touch]);

    const toggleSpecialization = useCallback((spec: string) => {
        setForm((prev) => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter((s) => s !== spec)
                : [...prev.specializations, spec],
        }));
        touch("specializations");
    }, [touch]);

    const animateStep = useCallback((direction: "next" | "back") => {
        if (!stepRef.current) return;
        gsap.fromTo(
            stepRef.current,
            { opacity: 0, x: direction === "next" ? 50 : -50 },
            { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" },
        );
    }, []);

    const goNext = () => { if (step < 3) { setStep((s) => s + 1); animateStep("next"); } };
    const goBack = () => { if (step > 0) { setStep((s) => s - 1); animateStep("back"); } };

    const handleSubmit = () => {
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
        }, 2000);
    };

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(
            pageRef.current.querySelector(".form-card"),
            { opacity: 0, y: 40, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.5)", delay: 0.2 },
        );
        gsap.fromTo(
            pageRef.current.querySelector(".page-heading"),
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        );
    }, []);

    // ── Validation states ──
    const fnState = getFieldState(form.firstName, touched.has("firstName"), true);
    const lnState = getFieldState(form.lastName, touched.has("lastName"), true);
    const emState = getEmailState(form.email, touched.has("email"));
    const compState = getFieldState(form.company, touched.has("company"), true);
    const bioState = form.bio.length > 400
        ? { state: "warning" as ValidationState, message: "Consider being more concise" }
        : getFieldState(form.bio, touched.has("bio"), false);

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.dark }}>
            {/* Memphis Background Shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[8%] left-[5%] w-20 h-20 rounded-full border-[4px] opacity-20" style={{ borderColor: C.coral }} />
                <div className="absolute top-[50%] right-[7%] w-16 h-16 rounded-full opacity-15" style={{ backgroundColor: C.teal }} />
                <div className="absolute bottom-[15%] left-[12%] w-12 h-12 rotate-45 opacity-15" style={{ backgroundColor: C.yellow }} />
                <div className="absolute top-[25%] right-[18%] w-14 h-14 rotate-12 opacity-15" style={{ backgroundColor: C.purple }} />
                <svg className="absolute bottom-[25%] right-[30%] opacity-15" width="80" height="25" viewBox="0 0 80 25">
                    <polyline points="0,20 10,5 20,20 30,5 40,20 50,5 60,20 70,5 80,20" fill="none" stroke={C.coral} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16">
                {/* Header */}
                <div className="page-heading text-center mb-12 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] mb-6"
                        style={{ backgroundColor: C.coral, color: C.white }}>
                        <i className="fa-duotone fa-regular fa-file-pen"></i>
                        Registration Form
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-4"
                        style={{ color: C.white }}>
                        Recruiter{" "}
                        <span className="relative inline-block">
                            <span style={{ color: C.coral }}>Onboarding</span>
                            <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: C.coral }} />
                        </span>
                    </h1>
                    <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
                        Join the network in 4 simple steps. Start placing candidates today.
                    </p>
                </div>

                {/* Form Card */}
                <div className="form-card max-w-3xl mx-auto border-4" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                    {/* Step Progress Header */}
                    <div className="p-6 border-b-4" style={{ borderColor: C.dark }}>
                        <div className="flex items-center gap-2">
                            {STEPS.map((s, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                    <div className="flex items-center w-full gap-2">
                                        <div className="w-9 h-9 flex items-center justify-center text-xs font-black flex-shrink-0 border-3 transition-all"
                                            style={{
                                                backgroundColor: submitted ? C.teal : i <= step ? s.color : C.white,
                                                borderColor: submitted ? C.teal : s.color,
                                                color: submitted
                                                    ? C.white
                                                    : i <= step
                                                        ? (s.color === C.yellow ? C.dark : C.white)
                                                        : s.color,
                                            }}>
                                            {submitted || i < step
                                                ? <i className="fa-solid fa-check text-xs"></i>
                                                : <i className={`${s.icon} text-xs`}></i>}
                                        </div>
                                        {i < STEPS.length - 1 && (
                                            <div className="flex-1 h-1 transition-all"
                                                style={{ backgroundColor: submitted ? C.teal : i < step ? s.color : "#E0E0E0" }} />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block"
                                        style={{ color: i <= step || submitted ? C.dark : "#999" }}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div ref={stepRef} className="p-8">
                        {submitted ? (
                            <div className="py-16 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center border-4"
                                    style={{ borderColor: C.teal, backgroundColor: C.teal }}>
                                    <i className="fa-duotone fa-regular fa-party-horn text-4xl" style={{ color: C.white }}></i>
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-wide mb-3" style={{ color: C.dark }}>
                                    Welcome Aboard!
                                </h2>
                                <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(26,26,46,0.6)" }}>
                                    Your recruiter application has been submitted. We&apos;ll review your profile and get back to you within 24 hours.
                                </p>
                                <button onClick={() => { setForm(INITIAL_FORM); setTouched(new Set()); setStep(0); setSubmitted(false); }}
                                    className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                    Start Over
                                </button>
                            </div>
                        ) : submitting ? (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-4 animate-pulse"
                                    style={{ borderColor: C.purple, backgroundColor: C.purple }}>
                                    <i className="fa-duotone fa-regular fa-spinner-third fa-spin text-3xl" style={{ color: C.white }}></i>
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-wide mb-2" style={{ color: C.dark }}>
                                    Submitting Application...
                                </h3>
                                <p className="text-sm" style={{ color: "rgba(26,26,46,0.5)" }}>
                                    Setting up your recruiter profile
                                </p>
                                {/* Animated progress bar */}
                                <div className="max-w-xs mx-auto mt-6 h-2 border-2 overflow-hidden" style={{ borderColor: C.dark }}>
                                    <div className="h-full animate-pulse" style={{ backgroundColor: C.purple, width: "70%", transition: "width 2s" }} />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Step badge */}
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-[0.15em]"
                                        style={{ backgroundColor: STEPS[step].color, color: STEPS[step].color === C.yellow ? C.dark : C.white }}>
                                        Step {step + 1} of 4
                                    </span>
                                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: C.dark }}>
                                        {STEPS[step].label}
                                    </span>
                                </div>

                                {/* Step 1: Personal Info */}
                                {step === 0 && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <MemphisInput label="First Name" value={form.firstName} required
                                                onChange={(v) => updateField("firstName", v)} placeholder="Marcus"
                                                state={fnState.state} message={fnState.message} />
                                            <MemphisInput label="Last Name" value={form.lastName} required
                                                onChange={(v) => updateField("lastName", v)} placeholder="Thompson"
                                                state={lnState.state} message={lnState.message} />
                                        </div>
                                        <MemphisInput label="Email Address" value={form.email} required type="email"
                                            onChange={(v) => updateField("email", v)} placeholder="marcus@recruiter.com"
                                            state={emState.state} message={emState.message} />
                                        <MemphisInput label="Phone Number" value={form.phone}
                                            onChange={(v) => updateField("phone", v)} placeholder="+1 (555) 123-4567" />
                                        <MemphisRadioGroup label="Preferred Contact Method" value={form.preferredContact}
                                            onChange={(v) => updateField("preferredContact", v)}
                                            options={[
                                                { value: "email", label: "Email", icon: "fa-duotone fa-regular fa-envelope" },
                                                { value: "phone", label: "Phone", icon: "fa-duotone fa-regular fa-phone" },
                                                { value: "both", label: "Both", icon: "fa-duotone fa-regular fa-arrows-repeat" },
                                            ]} />
                                    </div>
                                )}

                                {/* Step 2: Professional */}
                                {step === 1 && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <MemphisInput label="Company / Agency" value={form.company} required
                                                onChange={(v) => updateField("company", v)} placeholder="Talent Partners Inc."
                                                state={compState.state} message={compState.message} />
                                            <MemphisInput label="Job Title" value={form.title}
                                                onChange={(v) => updateField("title", v)} placeholder="Senior Recruiter" />
                                        </div>
                                        <MemphisSelect label="Years of Experience" value={form.experience} required
                                            onChange={(v) => updateField("experience", v)}
                                            options={[
                                                { value: "0-1", label: "0 - 1 years" },
                                                { value: "1-3", label: "1 - 3 years" },
                                                { value: "3-5", label: "3 - 5 years" },
                                                { value: "5-10", label: "5 - 10 years" },
                                                { value: "10+", label: "10+ years" },
                                            ]} />
                                        <MemphisTextarea label="Professional Bio" value={form.bio}
                                            onChange={(v) => updateField("bio", v)} rows={4} maxLength={500}
                                            placeholder="Tell us about your recruiting experience, approach, and what makes you stand out..."
                                            state={bioState.state} message={bioState.message} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <MemphisInput label="LinkedIn Profile" value={form.linkedIn}
                                                onChange={(v) => updateField("linkedIn", v)} placeholder="linkedin.com/in/username" />
                                            <MemphisInput label="Website / Portfolio" value={form.website}
                                                onChange={(v) => updateField("website", v)} placeholder="yoursite.com" />
                                        </div>
                                        <MemphisFileUpload label="Resume / CV" value={form.resume}
                                            onChange={(v) => updateField("resume", v)} />
                                    </div>
                                )}

                                {/* Step 3: Specializations */}
                                {step === 2 && (
                                    <div className="space-y-5">
                                        <p className="text-sm" style={{ color: "rgba(26,26,46,0.6)" }}>
                                            Select all industries and roles you specialize in. This helps us match you with relevant opportunities.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {SPECIALIZATIONS.map((spec) => {
                                                const colors = [C.coral, C.teal, C.yellow, C.purple];
                                                const color = colors[SPECIALIZATIONS.indexOf(spec) % colors.length];
                                                const selected = form.specializations.includes(spec);
                                                return (
                                                    <button key={spec} type="button"
                                                        onClick={() => toggleSpecialization(spec)}
                                                        className="flex items-center gap-3 p-4 border-3 text-left transition-all"
                                                        style={{
                                                            borderColor: selected ? color : "rgba(26,26,46,0.15)",
                                                            backgroundColor: selected ? color : "transparent",
                                                        }}>
                                                        <div className="w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center"
                                                            style={{
                                                                borderColor: selected ? (color === C.yellow ? C.dark : C.white) : C.dark,
                                                                backgroundColor: selected ? "rgba(255,255,255,0.2)" : "transparent",
                                                            }}>
                                                            {selected && <i className="fa-solid fa-check text-[10px]"
                                                                style={{ color: color === C.yellow ? C.dark : C.white }}></i>}
                                                        </div>
                                                        <span className="text-sm font-bold"
                                                            style={{ color: selected ? (color === C.yellow ? C.dark : C.white) : C.dark }}>
                                                            {spec}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {form.specializations.length > 0 && (
                                            <p className="text-xs font-bold" style={{ color: C.teal }}>
                                                <i className="fa-solid fa-check-double mr-1"></i>
                                                {form.specializations.length} specialization{form.specializations.length > 1 ? "s" : ""} selected
                                            </p>
                                        )}
                                        <MemphisSelect label="How did you hear about us?" value={form.referralSource}
                                            onChange={(v) => updateField("referralSource", v)}
                                            options={[
                                                { value: "linkedin", label: "LinkedIn" },
                                                { value: "referral", label: "Referral from colleague" },
                                                { value: "google", label: "Google Search" },
                                                { value: "social", label: "Social Media" },
                                                { value: "event", label: "Conference / Event" },
                                                { value: "other", label: "Other" },
                                            ]} />
                                    </div>
                                )}

                                {/* Step 4: Confirm */}
                                {step === 3 && (
                                    <div className="space-y-5">
                                        {/* Review Summary */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border-3 p-4" style={{ borderColor: C.coral }}>
                                                <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: C.coral }}>
                                                    <i className="fa-duotone fa-regular fa-user"></i> Personal
                                                </h4>
                                                <div className="space-y-1 text-sm">
                                                    <p><span className="font-bold" style={{ color: C.dark }}>Name:</span> <span style={{ opacity: 0.7 }}>{form.firstName} {form.lastName || "---"}</span></p>
                                                    <p><span className="font-bold" style={{ color: C.dark }}>Email:</span> <span style={{ opacity: 0.7 }}>{form.email || "---"}</span></p>
                                                    <p><span className="font-bold" style={{ color: C.dark }}>Phone:</span> <span style={{ opacity: 0.7 }}>{form.phone || "---"}</span></p>
                                                    <p><span className="font-bold" style={{ color: C.dark }}>Contact:</span> <span style={{ opacity: 0.7 }}>{form.preferredContact}</span></p>
                                                </div>
                                            </div>
                                            <div className="border-3 p-4" style={{ borderColor: C.teal }}>
                                                <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: C.teal }}>
                                                    <i className="fa-duotone fa-regular fa-briefcase"></i> Professional
                                                </h4>
                                                <div className="space-y-1 text-sm">
                                                    <p><span className="font-bold" style={{ color: C.dark }}>Company:</span> <span style={{ opacity: 0.7 }}>{form.company || "---"}</span></p>
                                                    <p><span className="font-bold" style={{ color: C.dark }}>Title:</span> <span style={{ opacity: 0.7 }}>{form.title || "---"}</span></p>
                                                    <p><span className="font-bold" style={{ color: C.dark }}>Experience:</span> <span style={{ opacity: 0.7 }}>{form.experience || "---"}</span></p>
                                                    <p><span className="font-bold" style={{ color: C.dark }}>Resume:</span> <span style={{ opacity: 0.7 }}>{form.resume || "None"}</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        {form.specializations.length > 0 && (
                                            <div className="border-3 p-4" style={{ borderColor: C.yellow }}>
                                                <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: C.dark }}>
                                                    <i className="fa-duotone fa-regular fa-bullseye" style={{ color: C.yellow }}></i> Specializations
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {form.specializations.map((spec) => (
                                                        <span key={spec} className="px-3 py-1 text-xs font-bold border-2"
                                                            style={{ borderColor: C.yellow, color: C.dark }}>
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Agreement Checkboxes */}
                                        <div className="border-3 p-5 space-y-4" style={{ borderColor: C.purple }}>
                                            <h4 className="text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2" style={{ color: C.purple }}>
                                                <i className="fa-duotone fa-regular fa-file-contract"></i> Agreements
                                            </h4>
                                            <MemphisCheckbox
                                                label="I agree to the Terms of Service and Privacy Policy *"
                                                checked={form.agreeTerms}
                                                onChange={(v) => updateField("agreeTerms", v)}
                                                color={C.purple} />
                                            <MemphisCheckbox
                                                label="I'd like to receive updates about new features and opportunities"
                                                checked={form.agreeMarketing}
                                                onChange={(v) => updateField("agreeMarketing", v)}
                                                color={C.teal} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer Navigation */}
                    {!submitted && !submitting && (
                        <div className="p-6 border-t-4 flex items-center justify-between" style={{ borderColor: C.dark }}>
                            <button onClick={() => { if (step === 0) { setForm(INITIAL_FORM); setTouched(new Set()); } else goBack(); }}
                                className="px-5 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                style={{ borderColor: C.dark, backgroundColor: C.white, color: C.dark }}>
                                {step === 0 ? "Reset" : <><i className="fa-solid fa-arrow-left text-xs"></i> Back</>}
                            </button>
                            <div className="flex items-center gap-3">
                                {step < 3 ? (
                                    <button onClick={goNext}
                                        className="px-5 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                        style={{
                                            borderColor: STEPS[step].color, backgroundColor: STEPS[step].color,
                                            color: STEPS[step].color === C.yellow ? C.dark : C.white,
                                        }}>
                                        Next <i className="fa-solid fa-arrow-right text-xs"></i>
                                    </button>
                                ) : (
                                    <button onClick={handleSubmit} disabled={!form.agreeTerms}
                                        className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                                        style={{ borderColor: C.teal, backgroundColor: C.teal, color: C.dark }}>
                                        <i className="fa-duotone fa-regular fa-paper-plane text-xs"></i>
                                        Submit Application
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Validation States Showcase */}
                <div className="max-w-3xl mx-auto mt-12 border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                    <h3 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: C.dark }}>
                        <span className="px-3 py-1 text-xs" style={{ backgroundColor: C.purple, color: C.white }}>Reference</span>
                        Validation States
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <MemphisInput label="Success State" value="marcus@email.com" onChange={() => {}} state="success" message="" />
                        <MemphisInput label="Error State" value="invalid" onChange={() => {}} state="error" message="Invalid email format" />
                        <MemphisInput label="Warning State" value="M" onChange={() => {}} state="warning" message="Seems too short" />
                        <MemphisInput label="Disabled State" value="Read only value" onChange={() => {}} disabled />
                    </div>
                </div>
            </div>
        </div>
    );
}
