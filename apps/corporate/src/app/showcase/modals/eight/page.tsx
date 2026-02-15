"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

// ─── Blueprint Design Tokens ────────────────────────────────────────────────
const BG = {
    deepest: "#0a1628",
    deep: "#081220",
    mid: "#0d1d33",
    card: "#0f2847",
};
const CYAN = {
    solid: "#22d3ee",
    text: "text-cyan-400",
    textMuted: "text-cyan-500/60",
    border: "border-cyan-500/20",
    borderHover: "border-cyan-400/40",
    bgSubtle: "rgba(34,211,238,0.08)",
    bgLight: "rgba(34,211,238,0.1)",
};
const ANIM = { fast: 0.3, normal: 0.5, ease: "power2.out", bounce: "back.out(1.4)" };

// ─── Types ──────────────────────────────────────────────────────────────────
interface JobFormData {
    title: string;
    company: string;
    location: string;
    salaryMin: string;
    salaryMax: string;
    type: string;
    description: string;
    requirements: string;
}

interface WizardData {
    title: string;
    company: string;
    location: string;
    type: string;
    experienceLevel: string;
    skills: string;
    description: string;
    salaryMin: string;
    salaryMax: string;
    equity: string;
    benefits: string;
}

const emptyJobForm: JobFormData = {
    title: "",
    company: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    type: "full-time",
    description: "",
    requirements: "",
};

const emptyWizard: WizardData = {
    title: "",
    company: "",
    location: "",
    type: "full-time",
    experienceLevel: "mid",
    skills: "",
    description: "",
    salaryMin: "",
    salaryMax: "",
    equity: "",
    benefits: "",
};

// ─── Shared input styles ────────────────────────────────────────────────────
const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-cyan-500/20 text-white text-sm placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-colors";
const inputStyle = { backgroundColor: BG.deep };

const selectClass =
    "w-full px-4 py-2.5 rounded-lg border border-cyan-500/20 text-white text-sm focus:border-cyan-400/50 focus:outline-none transition-colors appearance-none";

const labelClass = "block text-sm font-semibold text-slate-300 mb-1.5";

// ─── Modal backdrop animation helper ────────────────────────────────────────
function animateModalIn(backdropEl: HTMLElement | null, boxEl: HTMLElement | null) {
    if (!backdropEl || !boxEl) return;
    gsap.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: ANIM.fast, ease: ANIM.ease });
    gsap.fromTo(
        boxEl,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: ANIM.normal, ease: ANIM.bounce },
    );
}

function animateModalOut(
    backdropEl: HTMLElement | null,
    boxEl: HTMLElement | null,
    onComplete: () => void,
) {
    if (!backdropEl || !boxEl) {
        onComplete();
        return;
    }
    const tl = gsap.timeline({ onComplete });
    tl.to(boxEl, { opacity: 0, y: 30, scale: 0.95, duration: ANIM.fast, ease: "power2.in" });
    tl.to(backdropEl, { opacity: 0, duration: 0.2 }, "-=0.15");
}

// ─── Validation helpers ─────────────────────────────────────────────────────
function validateJobForm(data: JobFormData): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!data.title.trim()) errors.title = "Title is required";
    if (!data.company.trim()) errors.company = "Company is required";
    if (!data.location.trim()) errors.location = "Location is required";
    if (!data.description.trim()) errors.description = "Description is required";
    return errors;
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function ModalsEightPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showWizardModal, setShowWizardModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const pageRef = useRef<HTMLDivElement>(null);

    // Animate trigger buttons on mount
    useEffect(() => {
        if (!pageRef.current) return;
        const buttons = pageRef.current.querySelectorAll(".bp-trigger-btn");
        gsap.fromTo(
            buttons,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: ANIM.normal, ease: ANIM.bounce, stagger: 0.12 },
        );
    }, []);

    return (
        <div ref={pageRef}>
            {/* ── Page section ── */}
            <section
                className="min-h-screen relative overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: BG.deepest }}
            >
                {/* Blueprint grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Corner dimension marks */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30" />
                <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-cyan-500/30" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-cyan-500/30" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-cyan-500/30" />

                {/* Subtle grid lines */}
                <div className="absolute top-[30%] left-0 right-0 h-px bg-cyan-500/15" />
                <div className="absolute top-[70%] left-0 right-0 h-px bg-cyan-500/15" />
                <div className="absolute left-[25%] top-0 bottom-0 w-px bg-cyan-500/10" />
                <div className="absolute left-[75%] top-0 bottom-0 w-px bg-cyan-500/10" />

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-mono mb-8">
                            <i className="fa-duotone fa-regular fa-window-restore text-xs" />
                            <span>MODAL COMPONENTS</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                            Blueprint <span className="text-cyan-400">Modals</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed font-light">
                            Precision-engineered dialog components. Standard forms, multi-step wizards,
                            and confirmation dialogs built with the Blueprint construction aesthetic.
                        </p>

                        {/* ── Trigger Buttons ── */}
                        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                            {/* Create Job Listing */}
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bp-trigger-btn group rounded-xl p-6 border border-cyan-500/20 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-1 text-left opacity-0"
                                style={{ backgroundColor: BG.card }}
                            >
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-cyan-500/30"
                                    style={{ backgroundColor: CYAN.bgLight }}
                                >
                                    <i className="fa-duotone fa-regular fa-plus text-xl text-cyan-400" />
                                </div>
                                <h3 className="font-bold text-white mb-1">Create Job Listing</h3>
                                <p className="text-xs text-slate-400 font-mono">Standard form modal</p>
                            </button>

                            {/* Post a Job (Wizard) */}
                            <button
                                onClick={() => setShowWizardModal(true)}
                                className="bp-trigger-btn group rounded-xl p-6 border border-cyan-500/20 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-1 text-left opacity-0"
                                style={{ backgroundColor: BG.card }}
                            >
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-cyan-500/30"
                                    style={{ backgroundColor: CYAN.bgLight }}
                                >
                                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-xl text-cyan-400" />
                                </div>
                                <h3 className="font-bold text-white mb-1">Post a Job (Wizard)</h3>
                                <p className="text-xs text-slate-400 font-mono">Multi-step wizard</p>
                            </button>

                            {/* Delete Job */}
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="bp-trigger-btn group rounded-xl p-6 border border-cyan-500/20 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-1 text-left opacity-0"
                                style={{ backgroundColor: BG.card }}
                            >
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-red-500/30"
                                    style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
                                >
                                    <i className="fa-duotone fa-regular fa-trash text-xl text-red-400" />
                                </div>
                                <h3 className="font-bold text-white mb-1">Delete Job</h3>
                                <p className="text-xs text-slate-400 font-mono">Confirmation dialog</p>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Modals ── */}
            {showCreateModal && (
                <CreateJobModal onClose={() => setShowCreateModal(false)} />
            )}
            {showWizardModal && (
                <WizardModal onClose={() => setShowWizardModal(false)} />
            )}
            {showDeleteModal && (
                <DeleteConfirmModal onClose={() => setShowDeleteModal(false)} />
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODAL 1 - Create Job Listing (Standard Form)
// ═════════════════════════════════════════════════════════════════════════════

function CreateJobModal({ onClose }: { onClose: () => void }) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [form, setForm] = useState<JobFormData>(emptyJobForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        animateModalIn(backdropRef.current, boxRef.current);
    }, []);

    const close = useCallback(() => {
        animateModalOut(backdropRef.current, boxRef.current, onClose);
    }, [onClose]);

    const handleChange = (field: keyof JobFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = () => {
        const validationErrors = validateJobForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setSubmitted(true);
    };

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === backdropRef.current && close()}
        >
            <div
                ref={boxRef}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/20"
                style={{ backgroundColor: BG.card }}
            >
                {/* Top accent bar */}
                <div className="h-1 w-full" style={{ backgroundColor: CYAN.solid }} />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-cyan-500/10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/30"
                            style={{ backgroundColor: CYAN.bgSubtle }}
                        >
                            <i className="fa-duotone fa-regular fa-briefcase text-lg text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-white">Create Job Listing</h2>
                            <p className="text-xs text-cyan-400/60 font-mono">NEW LISTING</p>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-500/10 transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {submitted ? (
                        <div className="text-center py-12">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30"
                                style={{ backgroundColor: CYAN.bgSubtle }}
                            >
                                <i className="fa-duotone fa-regular fa-check text-3xl text-cyan-400" />
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Listing Created</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Your job listing &ldquo;{form.title}&rdquo; has been submitted successfully.
                            </p>
                            <button
                                onClick={close}
                                className="btn btn-sm border-0 text-slate-900 font-semibold"
                                style={{ backgroundColor: CYAN.solid }}
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Title + Company row */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <fieldset>
                                    <label className={labelClass}>
                                        Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        style={inputStyle}
                                        placeholder="e.g. Senior Frontend Engineer"
                                        value={form.title}
                                        onChange={(e) => handleChange("title", e.target.value)}
                                    />
                                    {errors.title && (
                                        <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                                    )}
                                </fieldset>
                                <fieldset>
                                    <label className={labelClass}>
                                        Company <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        style={inputStyle}
                                        placeholder="e.g. Acme Corp"
                                        value={form.company}
                                        onChange={(e) => handleChange("company", e.target.value)}
                                    />
                                    {errors.company && (
                                        <p className="text-red-400 text-xs mt-1">{errors.company}</p>
                                    )}
                                </fieldset>
                            </div>

                            {/* Location + Type row */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <fieldset>
                                    <label className={labelClass}>
                                        Location <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        style={inputStyle}
                                        placeholder="e.g. San Francisco, CA"
                                        value={form.location}
                                        onChange={(e) => handleChange("location", e.target.value)}
                                    />
                                    {errors.location && (
                                        <p className="text-red-400 text-xs mt-1">{errors.location}</p>
                                    )}
                                </fieldset>
                                <fieldset>
                                    <label className={labelClass}>Type</label>
                                    <select
                                        className={selectClass}
                                        style={inputStyle}
                                        value={form.type}
                                        onChange={(e) => handleChange("type", e.target.value)}
                                    >
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="freelance">Freelance</option>
                                    </select>
                                </fieldset>
                            </div>

                            {/* Salary Range */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <fieldset>
                                    <label className={labelClass}>Salary Min</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        style={inputStyle}
                                        placeholder="e.g. 120,000"
                                        value={form.salaryMin}
                                        onChange={(e) => handleChange("salaryMin", e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <label className={labelClass}>Salary Max</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        style={inputStyle}
                                        placeholder="e.g. 180,000"
                                        value={form.salaryMax}
                                        onChange={(e) => handleChange("salaryMax", e.target.value)}
                                    />
                                </fieldset>
                            </div>

                            {/* Description */}
                            <fieldset>
                                <label className={labelClass}>
                                    Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    className={`${inputClass} min-h-[80px] resize-y`}
                                    style={inputStyle}
                                    placeholder="Describe the role, responsibilities, and team..."
                                    value={form.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-red-400 text-xs mt-1">{errors.description}</p>
                                )}
                            </fieldset>

                            {/* Requirements */}
                            <fieldset>
                                <label className={labelClass}>Requirements</label>
                                <textarea
                                    className={`${inputClass} min-h-[80px] resize-y`}
                                    style={inputStyle}
                                    placeholder="List key requirements, one per line..."
                                    value={form.requirements}
                                    onChange={(e) => handleChange("requirements", e.target.value)}
                                    rows={3}
                                />
                            </fieldset>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-cyan-500/10">
                        <button
                            onClick={close}
                            className="btn btn-sm btn-ghost text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn btn-sm border-0 text-slate-900 font-semibold"
                            style={{ backgroundColor: CYAN.solid }}
                        >
                            <i className="fa-duotone fa-regular fa-check" />
                            Create Listing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODAL 2 - Multi-Step Wizard
// ═════════════════════════════════════════════════════════════════════════════

const WIZARD_STEPS = [
    { label: "Job Details", icon: "fa-duotone fa-regular fa-briefcase" },
    { label: "Requirements", icon: "fa-duotone fa-regular fa-list-check" },
    { label: "Compensation", icon: "fa-duotone fa-regular fa-coins" },
    { label: "Review", icon: "fa-duotone fa-regular fa-flag-checkered" },
];

function WizardModal({ onClose }: { onClose: () => void }) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(0);
    const [data, setData] = useState<WizardData>(emptyWizard);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        animateModalIn(backdropRef.current, boxRef.current);
    }, []);

    const close = useCallback(() => {
        animateModalOut(backdropRef.current, boxRef.current, onClose);
    }, [onClose]);

    const updateField = (field: keyof WizardData, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const animateStepTransition = (direction: "next" | "back", cb: () => void) => {
        const el = stepContentRef.current;
        if (!el) {
            cb();
            return;
        }
        const xOut = direction === "next" ? -30 : 30;
        const xIn = direction === "next" ? 30 : -30;
        gsap.to(el, {
            opacity: 0,
            x: xOut,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                cb();
                gsap.fromTo(el, { opacity: 0, x: xIn }, { opacity: 1, x: 0, duration: 0.25, ease: ANIM.ease });
            },
        });
    };

    const goNext = () => {
        if (step < 3) animateStepTransition("next", () => setStep((s) => s + 1));
        else setSubmitted(true);
    };
    const goBack = () => {
        if (step > 0) animateStepTransition("back", () => setStep((s) => s - 1));
    };

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === backdropRef.current && close()}
        >
            <div
                ref={boxRef}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/20"
                style={{ backgroundColor: BG.card }}
            >
                {/* Top accent bar */}
                <div className="h-1 w-full" style={{ backgroundColor: CYAN.solid }} />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-cyan-500/10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/30"
                            style={{ backgroundColor: CYAN.bgSubtle }}
                        >
                            <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-lg text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-white">Post a Job</h2>
                            <p className="text-xs text-cyan-400/60 font-mono">STEP-BY-STEP WIZARD</p>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-500/10 transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                {/* Progress indicator */}
                {!submitted && (
                    <div className="px-6 pt-5 pb-2">
                        <div className="flex items-center justify-between mb-3">
                            {WIZARD_STEPS.map((s, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold transition-colors ${
                                            i <= step
                                                ? "border-cyan-400/50 text-cyan-400"
                                                : "border-cyan-500/15 text-slate-500"
                                        }`}
                                        style={{
                                            backgroundColor: i <= step ? CYAN.bgLight : "transparent",
                                        }}
                                    >
                                        {i < step ? (
                                            <i className="fa-duotone fa-regular fa-check text-xs" />
                                        ) : (
                                            <span>{i + 1}</span>
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs font-mono hidden sm:block ${
                                            i <= step ? "text-cyan-400" : "text-slate-500"
                                        }`}
                                    >
                                        {s.label}
                                    </span>
                                    {i < WIZARD_STEPS.length - 1 && (
                                        <div
                                            className="hidden sm:block w-8 h-px mx-1"
                                            style={{
                                                backgroundColor:
                                                    i < step ? CYAN.solid : "rgba(34,211,238,0.15)",
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Progress bar */}
                        <div
                            className="h-1 rounded-full overflow-hidden"
                            style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    backgroundColor: CYAN.solid,
                                    width: `${((step + 1) / WIZARD_STEPS.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-6">
                    {submitted ? (
                        <div className="text-center py-12">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30"
                                style={{ backgroundColor: CYAN.bgSubtle }}
                            >
                                <i className="fa-duotone fa-regular fa-rocket text-3xl text-cyan-400" />
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Job Posted!</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                &ldquo;{data.title || "Your job"}&rdquo; is now live on the marketplace.
                            </p>
                            <button
                                onClick={close}
                                className="btn btn-sm border-0 text-slate-900 font-semibold"
                                style={{ backgroundColor: CYAN.solid }}
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <div ref={stepContentRef}>
                            {step === 0 && (
                                <WizardStep1 data={data} updateField={updateField} />
                            )}
                            {step === 1 && (
                                <WizardStep2 data={data} updateField={updateField} />
                            )}
                            {step === 2 && (
                                <WizardStep3 data={data} updateField={updateField} />
                            )}
                            {step === 3 && <WizardStep4 data={data} />}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-cyan-500/10">
                        <button
                            onClick={close}
                            className="btn btn-sm btn-ghost text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <div className="flex items-center gap-3">
                            {step > 0 && (
                                <button
                                    onClick={goBack}
                                    className="btn btn-sm btn-outline border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-left" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={goNext}
                                className="btn btn-sm border-0 text-slate-900 font-semibold"
                                style={{ backgroundColor: CYAN.solid }}
                            >
                                {step === 3 ? (
                                    <>
                                        <i className="fa-duotone fa-regular fa-rocket" />
                                        Submit
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <i className="fa-duotone fa-regular fa-arrow-right" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Wizard Step Components ─────────────────────────────────────────────────

function WizardStep1({
    data,
    updateField,
}: {
    data: WizardData;
    updateField: (field: keyof WizardData, value: string) => void;
}) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
                <i className="fa-duotone fa-regular fa-briefcase text-cyan-400" />
                <h3 className="font-bold text-white">Job Details</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <fieldset>
                    <label className={labelClass}>Job Title</label>
                    <input
                        type="text"
                        className={inputClass}
                        style={inputStyle}
                        placeholder="e.g. Senior Backend Engineer"
                        value={data.title}
                        onChange={(e) => updateField("title", e.target.value)}
                    />
                </fieldset>
                <fieldset>
                    <label className={labelClass}>Company</label>
                    <input
                        type="text"
                        className={inputClass}
                        style={inputStyle}
                        placeholder="e.g. Acme Corp"
                        value={data.company}
                        onChange={(e) => updateField("company", e.target.value)}
                    />
                </fieldset>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <fieldset>
                    <label className={labelClass}>Location</label>
                    <input
                        type="text"
                        className={inputClass}
                        style={inputStyle}
                        placeholder="e.g. Remote / New York, NY"
                        value={data.location}
                        onChange={(e) => updateField("location", e.target.value)}
                    />
                </fieldset>
                <fieldset>
                    <label className={labelClass}>Employment Type</label>
                    <select
                        className={selectClass}
                        style={inputStyle}
                        value={data.type}
                        onChange={(e) => updateField("type", e.target.value)}
                    >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="freelance">Freelance</option>
                    </select>
                </fieldset>
            </div>
        </div>
    );
}

function WizardStep2({
    data,
    updateField,
}: {
    data: WizardData;
    updateField: (field: keyof WizardData, value: string) => void;
}) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
                <i className="fa-duotone fa-regular fa-list-check text-cyan-400" />
                <h3 className="font-bold text-white">Requirements</h3>
            </div>
            <fieldset>
                <label className={labelClass}>Experience Level</label>
                <select
                    className={selectClass}
                    style={inputStyle}
                    value={data.experienceLevel}
                    onChange={(e) => updateField("experienceLevel", e.target.value)}
                >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead / Principal</option>
                    <option value="executive">Executive</option>
                </select>
            </fieldset>
            <fieldset>
                <label className={labelClass}>Key Skills</label>
                <input
                    type="text"
                    className={inputClass}
                    style={inputStyle}
                    placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
                    value={data.skills}
                    onChange={(e) => updateField("skills", e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">Comma-separated list of required skills</p>
            </fieldset>
            <fieldset>
                <label className={labelClass}>Job Description</label>
                <textarea
                    className={`${inputClass} min-h-[100px] resize-y`}
                    style={inputStyle}
                    placeholder="Describe the role, team, and day-to-day responsibilities..."
                    value={data.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                />
            </fieldset>
        </div>
    );
}

function WizardStep3({
    data,
    updateField,
}: {
    data: WizardData;
    updateField: (field: keyof WizardData, value: string) => void;
}) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
                <i className="fa-duotone fa-regular fa-coins text-cyan-400" />
                <h3 className="font-bold text-white">Compensation</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <fieldset>
                    <label className={labelClass}>Salary Min (USD)</label>
                    <input
                        type="text"
                        className={inputClass}
                        style={inputStyle}
                        placeholder="e.g. 120,000"
                        value={data.salaryMin}
                        onChange={(e) => updateField("salaryMin", e.target.value)}
                    />
                </fieldset>
                <fieldset>
                    <label className={labelClass}>Salary Max (USD)</label>
                    <input
                        type="text"
                        className={inputClass}
                        style={inputStyle}
                        placeholder="e.g. 180,000"
                        value={data.salaryMax}
                        onChange={(e) => updateField("salaryMax", e.target.value)}
                    />
                </fieldset>
            </div>
            <fieldset>
                <label className={labelClass}>Equity</label>
                <input
                    type="text"
                    className={inputClass}
                    style={inputStyle}
                    placeholder="e.g. 0.1% - 0.5% equity grant"
                    value={data.equity}
                    onChange={(e) => updateField("equity", e.target.value)}
                />
            </fieldset>
            <fieldset>
                <label className={labelClass}>Benefits</label>
                <textarea
                    className={`${inputClass} min-h-[80px] resize-y`}
                    style={inputStyle}
                    placeholder="e.g. Health insurance, 401k match, unlimited PTO, remote work..."
                    value={data.benefits}
                    onChange={(e) => updateField("benefits", e.target.value)}
                    rows={3}
                />
            </fieldset>
        </div>
    );
}

function WizardStep4({ data }: { data: WizardData }) {
    const reviewRows = [
        { label: "Title", value: data.title },
        { label: "Company", value: data.company },
        { label: "Location", value: data.location },
        { label: "Type", value: data.type },
        { label: "Experience", value: data.experienceLevel },
        { label: "Skills", value: data.skills },
        { label: "Salary Range", value: data.salaryMin || data.salaryMax ? `$${data.salaryMin} - $${data.salaryMax}` : "" },
        { label: "Equity", value: data.equity },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
                <i className="fa-duotone fa-regular fa-flag-checkered text-cyan-400" />
                <h3 className="font-bold text-white">Review & Submit</h3>
            </div>
            <p className="text-sm text-slate-400">
                Review the details below before posting your job to the marketplace.
            </p>

            <div className="rounded-xl border border-cyan-500/15 overflow-hidden" style={{ backgroundColor: BG.deep }}>
                {reviewRows.map((row, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between px-4 py-3 ${
                            i < reviewRows.length - 1 ? "border-b border-cyan-500/10" : ""
                        }`}
                    >
                        <span className="text-xs font-mono text-slate-500 uppercase">{row.label}</span>
                        <span className="text-sm text-white text-right max-w-[60%] truncate">
                            {row.value || <span className="text-slate-500 italic">Not provided</span>}
                        </span>
                    </div>
                ))}
            </div>

            {data.description && (
                <div>
                    <p className="text-xs font-mono text-slate-500 uppercase mb-2">Description</p>
                    <div
                        className="rounded-lg border border-cyan-500/10 px-4 py-3 text-sm text-slate-300 leading-relaxed"
                        style={{ backgroundColor: BG.deep }}
                    >
                        {data.description}
                    </div>
                </div>
            )}

            {data.benefits && (
                <div>
                    <p className="text-xs font-mono text-slate-500 uppercase mb-2">Benefits</p>
                    <div
                        className="rounded-lg border border-cyan-500/10 px-4 py-3 text-sm text-slate-300 leading-relaxed"
                        style={{ backgroundColor: BG.deep }}
                    >
                        {data.benefits}
                    </div>
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODAL 3 - Delete Confirmation Dialog
// ═════════════════════════════════════════════════════════════════════════════

function DeleteConfirmModal({ onClose }: { onClose: () => void }) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        animateModalIn(backdropRef.current, boxRef.current);
    }, []);

    const close = useCallback(() => {
        animateModalOut(backdropRef.current, boxRef.current, onClose);
    }, [onClose]);

    const handleDelete = () => {
        setDeleting(true);
        setTimeout(() => {
            setDeleting(false);
            setDeleted(true);
        }, 1200);
    };

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === backdropRef.current && close()}
        >
            <div
                ref={boxRef}
                className="w-full max-w-md rounded-2xl border border-red-500/20 overflow-hidden"
                style={{ backgroundColor: BG.card }}
            >
                {/* Top accent bar - red for destructive */}
                <div className="h-1 w-full bg-red-500" />

                <div className="px-6 py-8">
                    {deleted ? (
                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30"
                                style={{ backgroundColor: CYAN.bgSubtle }}
                            >
                                <i className="fa-duotone fa-regular fa-check text-3xl text-cyan-400" />
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Job Deleted</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                The job listing has been permanently removed.
                            </p>
                            <button
                                onClick={close}
                                className="btn btn-sm border-0 text-slate-900 font-semibold"
                                style={{ backgroundColor: CYAN.solid }}
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Warning icon */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30"
                                    style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-3xl text-red-400" />
                                </div>
                                <h3 className="font-bold text-xl text-white mb-2">Delete Job Listing?</h3>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                                    This will permanently delete{" "}
                                    <span className="text-white font-semibold">&ldquo;Senior Frontend Engineer&rdquo;</span>{" "}
                                    and all associated applications. This action cannot be undone.
                                </p>
                            </div>

                            {/* Warning details */}
                            <div
                                className="rounded-xl border border-red-500/15 p-4 mb-6 space-y-2"
                                style={{ backgroundColor: "rgba(239,68,68,0.05)" }}
                            >
                                <div className="flex items-center gap-2 text-sm">
                                    <i className="fa-duotone fa-regular fa-circle-xmark text-red-400 text-xs" />
                                    <span className="text-slate-300">12 active applications will be removed</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <i className="fa-duotone fa-regular fa-circle-xmark text-red-400 text-xs" />
                                    <span className="text-slate-300">3 recruiter assignments will be cancelled</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <i className="fa-duotone fa-regular fa-circle-xmark text-red-400 text-xs" />
                                    <span className="text-slate-300">All conversation history will be lost</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={close}
                                    className="btn btn-sm btn-ghost text-slate-400 hover:text-white"
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-sm bg-red-500 border-0 text-white font-semibold hover:bg-red-600"
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-trash" />
                                            Delete Permanently
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
