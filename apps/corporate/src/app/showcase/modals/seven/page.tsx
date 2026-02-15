"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

// ─── Blueprint Design Tokens ────────────────────────────────────────────────
const BG_PRIMARY = "#0a0e17";
const BG_SECONDARY = "#0d1220";
const BLUE = "#3b5ccc";
const TEAL = "#14b8a6";
const GREEN = "#22c55e";
const TEXT_PRIMARY = "#c8ccd4";
const RED = "#ef4444";

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

interface WizardFormData {
    // Step 1: Job Details
    title: string;
    company: string;
    location: string;
    type: string;
    // Step 2: Requirements
    experienceLevel: string;
    skills: string;
    description: string;
    // Step 3: Compensation
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
    type: "Full-time",
    description: "",
    requirements: "",
};

const emptyWizardForm: WizardFormData = {
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    experienceLevel: "Mid-level",
    skills: "",
    description: "",
    salaryMin: "",
    salaryMax: "",
    equity: "",
    benefits: "",
};

// ─── Animation Helpers ──────────────────────────────────────────────────────

function animateModalIn(backdrop: HTMLElement | null, box: HTMLElement | null) {
    if (!backdrop || !box) return;
    const tl = gsap.timeline();
    tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    tl.fromTo(
        box,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" },
        "-=0.15",
    );
    return tl;
}

function animateModalOut(
    backdrop: HTMLElement | null,
    box: HTMLElement | null,
    onComplete: () => void,
) {
    if (!backdrop || !box) {
        onComplete();
        return;
    }
    const tl = gsap.timeline({ onComplete });
    tl.to(box, { opacity: 0, y: 30, scale: 0.96, duration: 0.25, ease: "power2.in" });
    tl.to(backdrop, { opacity: 0, duration: 0.2, ease: "power2.in" }, "-=0.1");
    return tl;
}

// ─── Shared Components ──────────────────────────────────────────────────────

function BlueprintInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
    error,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    error?: string;
}) {
    return (
        <fieldset className="space-y-1.5">
            <label className="font-mono text-[10px] tracking-[0.2em] text-[#3b5ccc]/60 uppercase block">
                {label}
                {required && <span className="text-[#ef4444] ml-1">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-[#0a0e17] border ${
                    error ? "border-[#ef4444]/60" : "border-[#3b5ccc]/20"
                } text-[#c8ccd4] px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-[#3b5ccc]/60 transition-colors placeholder:text-[#c8ccd4]/20`}
            />
            {error && (
                <span className="font-mono text-[10px] text-[#ef4444]/80">{error}</span>
            )}
        </fieldset>
    );
}

function BlueprintSelect({
    label,
    value,
    onChange,
    options,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
    required?: boolean;
}) {
    return (
        <fieldset className="space-y-1.5">
            <label className="font-mono text-[10px] tracking-[0.2em] text-[#3b5ccc]/60 uppercase block">
                {label}
                {required && <span className="text-[#ef4444] ml-1">*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#0a0e17] border border-[#3b5ccc]/20 text-[#c8ccd4] px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-[#3b5ccc]/60 transition-colors appearance-none cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0a0e17]">
                        {opt}
                    </option>
                ))}
            </select>
        </fieldset>
    );
}

function BlueprintTextarea({
    label,
    value,
    onChange,
    placeholder,
    rows = 4,
    required = false,
    error,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
    required?: boolean;
    error?: string;
}) {
    return (
        <fieldset className="space-y-1.5">
            <label className="font-mono text-[10px] tracking-[0.2em] text-[#3b5ccc]/60 uppercase block">
                {label}
                {required && <span className="text-[#ef4444]/80 ml-1">*</span>}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={`w-full bg-[#0a0e17] border ${
                    error ? "border-[#ef4444]/60" : "border-[#3b5ccc]/20"
                } text-[#c8ccd4] px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-[#3b5ccc]/60 transition-colors resize-none placeholder:text-[#c8ccd4]/20`}
            />
            {error && (
                <span className="font-mono text-[10px] text-[#ef4444]/80">{error}</span>
            )}
        </fieldset>
    );
}

// ─── Modal 1: Create Job Listing ────────────────────────────────────────────

function CreateJobModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [form, setForm] = useState<JobFormData>(emptyJobForm);
    const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
    const [submitted, setSubmitted] = useState(false);

    const update = useCallback(
        (field: keyof JobFormData) => (value: string) => {
            setForm((prev) => ({ ...prev, [field]: value }));
            if (errors[field]) {
                setErrors((prev) => {
                    const next = { ...prev };
                    delete next[field];
                    return next;
                });
            }
        },
        [errors],
    );

    const validate = useCallback((): boolean => {
        const errs: Partial<Record<keyof JobFormData, string>> = {};
        if (!form.title.trim()) errs.title = "Required";
        if (!form.company.trim()) errs.company = "Required";
        if (!form.location.trim()) errs.location = "Required";
        if (!form.description.trim()) errs.description = "Required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const handleSubmit = useCallback(() => {
        if (!validate()) return;
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setForm(emptyJobForm);
            setErrors({});
            onClose();
        }, 1500);
    }, [validate, onClose]);

    const handleClose = useCallback(() => {
        animateModalOut(backdropRef.current, boxRef.current, () => {
            setForm(emptyJobForm);
            setErrors({});
            setSubmitted(false);
            onClose();
        });
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                ref={boxRef}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#3b5ccc]/20"
                style={{ backgroundColor: BG_SECONDARY }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#3b5ccc]/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-[#3b5ccc]/30 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-file-plus text-[#3b5ccc] text-sm"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Create Job Listing</h3>
                            <span className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                                CMD: NEW_LISTING
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 border border-[#c8ccd4]/10 flex items-center justify-center text-[#c8ccd4]/40 hover:text-white hover:border-[#c8ccd4]/30 transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {submitted ? (
                        <div className="py-12 text-center">
                            <div className="w-14 h-14 border-2 border-[#22c55e]/40 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-check text-[#22c55e] text-xl"></i>
                            </div>
                            <div className="font-mono text-sm text-[#22c55e] tracking-wider mb-1">
                                LISTING CREATED
                            </div>
                            <div className="font-mono text-[10px] text-[#c8ccd4]/30">
                                Job specification published to network
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <BlueprintInput
                                    label="Title"
                                    value={form.title}
                                    onChange={update("title")}
                                    placeholder="Senior Software Engineer"
                                    required
                                    error={errors.title}
                                />
                                <BlueprintInput
                                    label="Company"
                                    value={form.company}
                                    onChange={update("company")}
                                    placeholder="Acme Corp"
                                    required
                                    error={errors.company}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <BlueprintInput
                                    label="Location"
                                    value={form.location}
                                    onChange={update("location")}
                                    placeholder="San Francisco, CA"
                                    required
                                    error={errors.location}
                                />
                                <BlueprintSelect
                                    label="Type"
                                    value={form.type}
                                    onChange={update("type")}
                                    options={[
                                        "Full-time",
                                        "Part-time",
                                        "Contract",
                                        "Freelance",
                                    ]}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <BlueprintInput
                                    label="Salary Min"
                                    value={form.salaryMin}
                                    onChange={update("salaryMin")}
                                    placeholder="80,000"
                                    type="text"
                                />
                                <BlueprintInput
                                    label="Salary Max"
                                    value={form.salaryMax}
                                    onChange={update("salaryMax")}
                                    placeholder="120,000"
                                    type="text"
                                />
                            </div>

                            <BlueprintTextarea
                                label="Description"
                                value={form.description}
                                onChange={update("description")}
                                placeholder="Describe the role, responsibilities, and expectations..."
                                rows={4}
                                required
                                error={errors.description}
                            />

                            <BlueprintTextarea
                                label="Requirements"
                                value={form.requirements}
                                onChange={update("requirements")}
                                placeholder="List qualifications, skills, and experience needed..."
                                rows={3}
                            />
                        </>
                    )}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[#3b5ccc]/10">
                        <span className="font-mono text-[10px] text-[#c8ccd4]/20">
                            {Object.keys(errors).length > 0
                                ? `[${Object.keys(errors).length} VALIDATION ERROR${Object.keys(errors).length > 1 ? "S" : ""}]`
                                : "READY"}
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="px-5 py-2 border border-[#c8ccd4]/15 text-[#c8ccd4]/60 font-mono text-xs tracking-wider hover:bg-white/5 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-5 py-2 bg-[#3b5ccc] text-white font-mono text-xs tracking-wider hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                            >
                                <i className="fa-duotone fa-regular fa-paper-plane mr-2 text-[10px]"></i>
                                SUBMIT
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Modal 2: Multi-Step Wizard ─────────────────────────────────────────────

const WIZARD_STEPS = [
    { id: 1, label: "JOB DETAILS", icon: "fa-duotone fa-regular fa-briefcase" },
    { id: 2, label: "REQUIREMENTS", icon: "fa-duotone fa-regular fa-list-check" },
    { id: 3, label: "COMPENSATION", icon: "fa-duotone fa-regular fa-money-bill" },
    { id: 4, label: "REVIEW", icon: "fa-duotone fa-regular fa-eye" },
];

function WizardModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<WizardFormData>(emptyWizardForm);
    const [submitted, setSubmitted] = useState(false);

    const update = useCallback(
        (field: keyof WizardFormData) => (value: string) => {
            setForm((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const animateStepTransition = useCallback((direction: "next" | "back") => {
        if (!stepContentRef.current) return;
        const xOut = direction === "next" ? -30 : 30;
        const xIn = direction === "next" ? 30 : -30;
        gsap.to(stepContentRef.current, {
            opacity: 0,
            x: xOut,
            duration: 0.15,
            ease: "power2.in",
            onComplete: () => {
                gsap.fromTo(
                    stepContentRef.current,
                    { opacity: 0, x: xIn },
                    { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" },
                );
            },
        });
    }, []);

    const nextStep = useCallback(() => {
        if (step < 4) {
            animateStepTransition("next");
            setTimeout(() => setStep((s) => s + 1), 150);
        }
    }, [step, animateStepTransition]);

    const prevStep = useCallback(() => {
        if (step > 1) {
            animateStepTransition("back");
            setTimeout(() => setStep((s) => s - 1), 150);
        }
    }, [step, animateStepTransition]);

    const handleSubmit = useCallback(() => {
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setStep(1);
            setForm(emptyWizardForm);
            onClose();
        }, 1800);
    }, [onClose]);

    const handleClose = useCallback(() => {
        animateModalOut(backdropRef.current, boxRef.current, () => {
            setStep(1);
            setForm(emptyWizardForm);
            setSubmitted(false);
            onClose();
        });
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                ref={boxRef}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#3b5ccc]/20"
                style={{ backgroundColor: BG_SECONDARY }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#3b5ccc]/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-[#3b5ccc]/30 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-[#3b5ccc] text-sm"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Post a Job</h3>
                            <span className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                                WIZARD: STEP {step}/4
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 border border-[#c8ccd4]/10 flex items-center justify-center text-[#c8ccd4]/40 hover:text-white hover:border-[#c8ccd4]/30 transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="px-6 py-3 border-b border-[#3b5ccc]/10">
                    <div className="flex items-center gap-1">
                        {WIZARD_STEPS.map((ws, idx) => (
                            <div key={ws.id} className="flex items-center flex-1">
                                <div className="flex items-center gap-2 flex-1">
                                    <div
                                        className={`w-7 h-7 border flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                                            ws.id < step
                                                ? "border-[#22c55e]/40 bg-[#22c55e]/10"
                                                : ws.id === step
                                                  ? "border-[#3b5ccc]/60 bg-[#3b5ccc]/10"
                                                  : "border-[#c8ccd4]/10"
                                        }`}
                                    >
                                        {ws.id < step ? (
                                            <i className="fa-duotone fa-regular fa-check text-[10px] text-[#22c55e]"></i>
                                        ) : (
                                            <span
                                                className={`font-mono text-[10px] ${
                                                    ws.id === step
                                                        ? "text-[#3b5ccc]"
                                                        : "text-[#c8ccd4]/20"
                                                }`}
                                            >
                                                {ws.id}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={`font-mono text-[9px] tracking-wider hidden sm:inline ${
                                            ws.id === step
                                                ? "text-[#3b5ccc]"
                                                : ws.id < step
                                                  ? "text-[#22c55e]/60"
                                                  : "text-[#c8ccd4]/20"
                                        }`}
                                    >
                                        {ws.label}
                                    </span>
                                </div>
                                {idx < WIZARD_STEPS.length - 1 && (
                                    <div
                                        className={`h-px flex-1 mx-2 transition-colors duration-300 ${
                                            ws.id < step
                                                ? "bg-[#22c55e]/30"
                                                : "bg-[#c8ccd4]/10"
                                        }`}
                                    ></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div ref={stepContentRef} className="px-6 py-5">
                    {submitted ? (
                        <div className="py-12 text-center">
                            <div className="w-14 h-14 border-2 border-[#22c55e]/40 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-rocket text-[#22c55e] text-xl"></i>
                            </div>
                            <div className="font-mono text-sm text-[#22c55e] tracking-wider mb-1">
                                JOB DEPLOYED
                            </div>
                            <div className="font-mono text-[10px] text-[#c8ccd4]/30">
                                Listing published to the recruiter network
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Job Details */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-widest mb-2">
                                        // DEFINE ROLE PARAMETERS
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <BlueprintInput
                                            label="Job Title"
                                            value={form.title}
                                            onChange={update("title")}
                                            placeholder="Senior Software Engineer"
                                            required
                                        />
                                        <BlueprintInput
                                            label="Company"
                                            value={form.company}
                                            onChange={update("company")}
                                            placeholder="Acme Corp"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <BlueprintInput
                                            label="Location"
                                            value={form.location}
                                            onChange={update("location")}
                                            placeholder="San Francisco, CA / Remote"
                                            required
                                        />
                                        <BlueprintSelect
                                            label="Employment Type"
                                            value={form.type}
                                            onChange={update("type")}
                                            options={[
                                                "Full-time",
                                                "Part-time",
                                                "Contract",
                                                "Freelance",
                                            ]}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Requirements */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-widest mb-2">
                                        // SPECIFY CANDIDATE CRITERIA
                                    </div>
                                    <BlueprintSelect
                                        label="Experience Level"
                                        value={form.experienceLevel}
                                        onChange={update("experienceLevel")}
                                        options={[
                                            "Entry-level",
                                            "Mid-level",
                                            "Senior",
                                            "Lead",
                                            "Principal",
                                            "Executive",
                                        ]}
                                        required
                                    />
                                    <BlueprintInput
                                        label="Skills"
                                        value={form.skills}
                                        onChange={update("skills")}
                                        placeholder="React, TypeScript, Node.js, PostgreSQL..."
                                        required
                                    />
                                    <BlueprintTextarea
                                        label="Role Description"
                                        value={form.description}
                                        onChange={update("description")}
                                        placeholder="Describe the responsibilities and day-to-day work..."
                                        rows={5}
                                        required
                                    />
                                </div>
                            )}

                            {/* Step 3: Compensation */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-widest mb-2">
                                        // CONFIGURE COMPENSATION PACKAGE
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <BlueprintInput
                                            label="Salary Min (USD)"
                                            value={form.salaryMin}
                                            onChange={update("salaryMin")}
                                            placeholder="120,000"
                                        />
                                        <BlueprintInput
                                            label="Salary Max (USD)"
                                            value={form.salaryMax}
                                            onChange={update("salaryMax")}
                                            placeholder="180,000"
                                        />
                                    </div>
                                    <BlueprintInput
                                        label="Equity"
                                        value={form.equity}
                                        onChange={update("equity")}
                                        placeholder="0.1% - 0.5% stock options"
                                    />
                                    <BlueprintTextarea
                                        label="Benefits"
                                        value={form.benefits}
                                        onChange={update("benefits")}
                                        placeholder="Health insurance, 401k matching, unlimited PTO, remote work..."
                                        rows={3}
                                    />
                                </div>
                            )}

                            {/* Step 4: Review */}
                            {step === 4 && (
                                <div className="space-y-4">
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-widest mb-2">
                                        // REVIEW CONFIGURATION
                                    </div>

                                    {/* Review sections */}
                                    <ReviewSection title="JOB DETAILS">
                                        <ReviewRow label="Title" value={form.title} />
                                        <ReviewRow label="Company" value={form.company} />
                                        <ReviewRow label="Location" value={form.location} />
                                        <ReviewRow label="Type" value={form.type} />
                                    </ReviewSection>

                                    <ReviewSection title="REQUIREMENTS">
                                        <ReviewRow
                                            label="Experience"
                                            value={form.experienceLevel}
                                        />
                                        <ReviewRow label="Skills" value={form.skills} />
                                        <ReviewRow
                                            label="Description"
                                            value={
                                                form.description
                                                    ? form.description.slice(0, 80) +
                                                      (form.description.length > 80 ? "..." : "")
                                                    : ""
                                            }
                                        />
                                    </ReviewSection>

                                    <ReviewSection title="COMPENSATION">
                                        <ReviewRow
                                            label="Salary Range"
                                            value={
                                                form.salaryMin || form.salaryMax
                                                    ? `$${form.salaryMin || "—"} - $${form.salaryMax || "—"}`
                                                    : ""
                                            }
                                        />
                                        <ReviewRow label="Equity" value={form.equity} />
                                        <ReviewRow
                                            label="Benefits"
                                            value={
                                                form.benefits
                                                    ? form.benefits.slice(0, 60) +
                                                      (form.benefits.length > 60 ? "..." : "")
                                                    : ""
                                            }
                                        />
                                    </ReviewSection>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[#3b5ccc]/10">
                        <span className="font-mono text-[10px] text-[#c8ccd4]/20">
                            STEP {step} OF 4
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="px-5 py-2 border border-[#c8ccd4]/15 text-[#c8ccd4]/60 font-mono text-xs tracking-wider hover:bg-white/5 transition-colors"
                            >
                                CANCEL
                            </button>
                            {step > 1 && (
                                <button
                                    onClick={prevStep}
                                    className="px-5 py-2 border border-[#3b5ccc]/20 text-[#3b5ccc] font-mono text-xs tracking-wider hover:bg-[#3b5ccc]/10 transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-left mr-2 text-[10px]"></i>
                                    BACK
                                </button>
                            )}
                            {step < 4 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-5 py-2 bg-[#3b5ccc] text-white font-mono text-xs tracking-wider hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                                >
                                    NEXT
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-2 text-[10px]"></i>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="px-5 py-2 bg-[#3b5ccc] text-white font-mono text-xs tracking-wider hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket mr-2 text-[10px]"></i>
                                    DEPLOY
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReviewSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border border-[#3b5ccc]/10">
            <div className="px-4 py-2 border-b border-[#3b5ccc]/10 bg-[#3b5ccc]/[0.03]">
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#3b5ccc]/50">
                    {title}
                </span>
            </div>
            <div className="px-4 py-3 space-y-2">{children}</div>
        </div>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start gap-4">
            <span className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider w-24 flex-shrink-0 pt-0.5">
                {label}:
            </span>
            <span className="text-sm text-[#c8ccd4]/70">
                {value || <span className="text-[#c8ccd4]/15 italic">Not provided</span>}
            </span>
        </div>
    );
}

// ─── Modal 3: Confirmation Dialog ───────────────────────────────────────────

function DeleteConfirmModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [confirming, setConfirming] = useState(false);

    const handleClose = useCallback(() => {
        animateModalOut(backdropRef.current, boxRef.current, () => {
            setConfirming(false);
            onClose();
        });
    }, [onClose]);

    const handleConfirm = useCallback(() => {
        setConfirming(true);
        setTimeout(() => {
            setConfirming(false);
            onClose();
        }, 1200);
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                ref={boxRef}
                className="w-full max-w-md border border-[#ef4444]/20"
                style={{ backgroundColor: BG_SECONDARY }}
            >
                {/* Header - Red warning variant */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#ef4444]/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-[#ef4444]/30 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-[#ef4444] text-sm"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Confirm Deletion</h3>
                            <span className="font-mono text-[10px] text-[#ef4444]/40 tracking-widest">
                                CMD: DELETE_LISTING
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 border border-[#c8ccd4]/10 flex items-center justify-center text-[#c8ccd4]/40 hover:text-white hover:border-[#c8ccd4]/30 transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {confirming ? (
                        <div className="py-6 text-center">
                            <div className="w-14 h-14 border-2 border-[#ef4444]/40 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-trash text-[#ef4444] text-xl"></i>
                            </div>
                            <div className="font-mono text-sm text-[#ef4444] tracking-wider mb-1">
                                LISTING DELETED
                            </div>
                            <div className="font-mono text-[10px] text-[#c8ccd4]/30">
                                Resource permanently removed
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Warning box */}
                            <div className="border border-[#ef4444]/10 bg-[#ef4444]/[0.03] px-4 py-3 mb-5">
                                <div className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-exclamation-circle text-[#ef4444]/60 mt-0.5"></i>
                                    <div>
                                        <div className="text-sm text-[#c8ccd4]/80 mb-2">
                                            You are about to permanently delete this job listing.
                                            This action cannot be undone.
                                        </div>
                                        <div className="font-mono text-[10px] text-[#c8ccd4]/30 space-y-1">
                                            <div>-- All candidate applications will be archived</div>
                                            <div>-- Recruiter assignments will be terminated</div>
                                            <div>-- Pipeline data will be preserved in analytics</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Target listing preview */}
                            <div className="border border-[#3b5ccc]/10 px-4 py-3 mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                                        TARGET:
                                    </span>
                                </div>
                                <div className="text-sm text-white font-semibold mb-1">
                                    Senior Software Engineer
                                </div>
                                <div className="font-mono text-[10px] text-[#c8ccd4]/30">
                                    Acme Corp -- San Francisco, CA -- ID: JOB-2847
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!confirming && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[#ef4444]/10">
                        <span className="font-mono text-[10px] text-[#ef4444]/30">
                            DESTRUCTIVE OPERATION
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="px-5 py-2 border border-[#c8ccd4]/15 text-[#c8ccd4]/60 font-mono text-xs tracking-wider hover:bg-white/5 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-5 py-2 bg-[#ef4444] text-white font-mono text-xs tracking-wider hover:bg-[#ef4444]/90 transition-colors border border-[#ef4444]"
                            >
                                <i className="fa-duotone fa-regular fa-trash mr-2 text-[10px]"></i>
                                DELETE
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ModalsSevenPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showWizardModal, setShowWizardModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Animate buttons on mount
    useEffect(() => {
        if (!containerRef.current) return;
        const cards = containerRef.current.querySelectorAll(".bp-trigger-card");
        gsap.fromTo(
            cards,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
                stagger: 0.12,
                delay: 0.3,
            },
        );
    }, []);

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image:
                        linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div
                ref={containerRef}
                className="min-h-screen relative overflow-hidden"
                style={{ backgroundColor: BG_PRIMARY }}
            >
                {/* Blueprint grid background */}
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                {/* Corner reference marks */}
                <div className="absolute top-6 left-6 font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                    REF: SN-MOD07-2026
                </div>
                <div className="absolute top-6 right-6 font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                    MODAL SHOWCASE
                </div>
                <div className="absolute bottom-6 left-6 font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                    EMPLOYMENT NETWORKS INC.
                </div>
                <div className="absolute bottom-6 right-6 font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                    REV. 07
                </div>

                <div className="container mx-auto px-4 relative z-10 py-24">
                    <div className="max-w-5xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-16 text-center">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">
                                // MODAL COMPONENTS
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                Dialog Systems
                            </h1>
                            <p className="text-[#c8ccd4]/50 max-w-lg mx-auto font-light">
                                Three modal patterns. Forms, wizards, and confirmations.
                                Each engineered for precision interaction.
                            </p>

                            {/* Decorative divider */}
                            <div className="mt-10 h-px bg-[#3b5ccc]/20 max-w-xs mx-auto relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                            </div>
                        </div>

                        {/* Trigger Cards */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Card 1: Create Job Listing */}
                            <div className="bp-trigger-card opacity-0 border border-[#3b5ccc]/20 p-8 relative group"
                                style={{ backgroundColor: BG_SECONDARY }}>
                                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-6">
                                    MOD-001
                                </div>

                                <div className="w-12 h-12 border border-[#3b5ccc]/30 flex items-center justify-center mb-5">
                                    <i className="fa-duotone fa-regular fa-file-plus text-[#3b5ccc] text-xl"></i>
                                </div>

                                <h3 className="font-bold text-white text-lg mb-2">Standard Form</h3>
                                <p className="text-sm text-[#c8ccd4]/40 mb-6 leading-relaxed">
                                    Single-panel modal with form fields, validation, and submission handling.
                                </p>

                                <div className="space-y-1.5 mb-6">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-mono text-[#3b5ccc]/60 text-xs">--</span>
                                        <span className="text-[#c8ccd4]/50">Field validation</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-mono text-[#3b5ccc]/60 text-xs">--</span>
                                        <span className="text-[#c8ccd4]/50">Form state management</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-mono text-[#3b5ccc]/60 text-xs">--</span>
                                        <span className="text-[#c8ccd4]/50">Submit confirmation</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full px-5 py-3 bg-[#3b5ccc] text-white font-mono text-xs tracking-wider hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc] flex items-center justify-center gap-2"
                                >
                                    <span className="text-[#3b5ccc]/60">&gt;</span>
                                    CREATE JOB LISTING
                                </button>

                                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                            </div>

                            {/* Card 2: Multi-Step Wizard */}
                            <div className="bp-trigger-card opacity-0 border border-[#14b8a6]/20 p-8 relative group"
                                style={{ backgroundColor: BG_SECONDARY }}>
                                <div className="font-mono text-[10px] text-[#14b8a6]/40 tracking-widest mb-6">
                                    MOD-002
                                </div>

                                <div className="w-12 h-12 border border-[#14b8a6]/30 flex items-center justify-center mb-5">
                                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-[#14b8a6] text-xl"></i>
                                </div>

                                <h3 className="font-bold text-white text-lg mb-2">Multi-Step Wizard</h3>
                                <p className="text-sm text-[#c8ccd4]/40 mb-6 leading-relaxed">
                                    Four-step wizard with progress tracking, step navigation, and review.
                                </p>

                                <div className="space-y-1.5 mb-6">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-mono text-[#14b8a6]/60 text-xs">--</span>
                                        <span className="text-[#c8ccd4]/50">Progress indicator</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-mono text-[#14b8a6]/60 text-xs">--</span>
                                        <span className="text-[#c8ccd4]/50">Next/Back navigation</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-mono text-[#14b8a6]/60 text-xs">--</span>
                                        <span className="text-[#c8ccd4]/50">Review & submit</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowWizardModal(true)}
                                    className="w-full px-5 py-3 bg-[#14b8a6] text-white font-mono text-xs tracking-wider hover:bg-[#14b8a6]/90 transition-colors border border-[#14b8a6] flex items-center justify-center gap-2"
                                >
                                    <span className="text-[#14b8a6]/60">&gt;</span>
                                    POST A JOB (WIZARD)
                                </button>

                                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#14b8a6] group-hover:w-full transition-all duration-500"></div>
                            </div>

                            {/* Card 3: Delete Confirmation */}
                            <div className="bp-trigger-card opacity-0 border border-[#ef4444]/20 p-8 relative group"
                                style={{ backgroundColor: BG_SECONDARY }}>
                                <div className="font-mono text-[10px] text-[#ef4444]/40 tracking-widest mb-6">
                                    MOD-003
                                </div>

                                <div className="w-12 h-12 border border-[#ef4444]/30 flex items-center justify-center mb-5">
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-[#ef4444] text-xl"></i>
                                </div>

                                <h3 className="font-bold text-white text-lg mb-2">Confirmation Dialog</h3>
                                <p className="text-sm text-[#c8ccd4]/40 mb-6 leading-relaxed">
                                    Destructive action confirmation with warning context and cancel escape.
                                </p>

                                <div className="space-y-1.5 mb-6">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-mono text-[#ef4444]/60 text-xs">--</span>
                                        <span className="text-[#c8ccd4]/50">Warning message</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-mono text-[#ef4444]/60 text-xs">--</span>
                                        <span className="text-[#c8ccd4]/50">Impact disclosure</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-mono text-[#ef4444]/60 text-xs">--</span>
                                        <span className="text-[#c8ccd4]/50">Destructive confirm</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full px-5 py-3 bg-[#ef4444] text-white font-mono text-xs tracking-wider hover:bg-[#ef4444]/90 transition-colors border border-[#ef4444] flex items-center justify-center gap-2"
                                >
                                    <span className="text-[#ef4444]/60">&gt;</span>
                                    DELETE JOB
                                </button>

                                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#ef4444] group-hover:w-full transition-all duration-500"></div>
                            </div>
                        </div>

                        {/* Bottom system info */}
                        <div className="mt-16 text-center">
                            <div className="h-px bg-[#3b5ccc]/10 mb-6 max-w-xs mx-auto"></div>
                            <div className="font-mono text-[10px] text-[#c8ccd4]/20 tracking-widest">
                                3 MODAL PATTERNS -- INDUSTRIAL BLUEPRINT DESIGN SYSTEM
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateJobModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
            <WizardModal
                isOpen={showWizardModal}
                onClose={() => setShowWizardModal(false)}
            />
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
            />
        </>
    );
}
