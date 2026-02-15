"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

// ─── Memphis Colors ─────────────────────────────────────────────────────────
const COLORS = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    dark: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
};

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
    // Step 1
    title: string;
    company: string;
    location: string;
    type: string;
    // Step 2
    experienceLevel: string;
    skills: string;
    description: string;
    // Step 3
    salaryMin: string;
    salaryMax: string;
    equity: string;
    benefits: string;
}

const INITIAL_JOB_FORM: JobFormData = {
    title: "",
    company: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    type: "full-time",
    description: "",
    requirements: "",
};

const INITIAL_WIZARD_FORM: WizardFormData = {
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

// ─── Memphis Decoration Component ──────────────────────────────────────────
function MemphisDecorations() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[8%] left-[4%] w-24 h-24 rounded-full border-[5px] opacity-30"
                style={{ borderColor: COLORS.coral }} />
            <div className="absolute top-[55%] right-[6%] w-20 h-20 rounded-full opacity-25"
                style={{ backgroundColor: COLORS.teal }} />
            <div className="absolute bottom-[12%] left-[10%] w-14 h-14 rounded-full opacity-20"
                style={{ backgroundColor: COLORS.yellow }} />
            <div className="absolute top-[18%] right-[12%] w-16 h-16 rotate-12 opacity-25"
                style={{ backgroundColor: COLORS.purple }} />
            <div className="absolute bottom-[20%] right-[20%] w-24 h-10 -rotate-6 border-[3px] opacity-20"
                style={{ borderColor: COLORS.coral }} />
            <div className="absolute top-[40%] left-[18%] w-12 h-12 rotate-45 opacity-20"
                style={{ backgroundColor: COLORS.coral }} />
            {/* Triangle */}
            <div className="absolute top-[28%] left-[38%] opacity-15"
                style={{
                    width: 0, height: 0,
                    borderLeft: "25px solid transparent",
                    borderRight: "25px solid transparent",
                    borderBottom: `43px solid ${COLORS.yellow}`,
                    transform: "rotate(-15deg)",
                }} />
            {/* Dots pattern */}
            <div className="absolute top-[12%] right-[30%] opacity-15">
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                    ))}
                </div>
            </div>
            {/* Zigzag */}
            <svg className="absolute bottom-[8%] right-[35%] opacity-20" width="100" height="30" viewBox="0 0 100 30">
                <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                    fill="none" stroke={COLORS.purple} strokeWidth="3" strokeLinecap="round" />
            </svg>
            {/* Plus */}
            <svg className="absolute top-[65%] left-[30%] opacity-20" width="35" height="35" viewBox="0 0 35 35">
                <line x1="17.5" y1="4" x2="17.5" y2="31" stroke={COLORS.yellow} strokeWidth="4" strokeLinecap="round" />
                <line x1="4" y1="17.5" x2="31" y2="17.5" stroke={COLORS.yellow} strokeWidth="4" strokeLinecap="round" />
            </svg>
        </div>
    );
}

// ─── Animated Modal Wrapper ─────────────────────────────────────────────────
function AnimatedModal({
    open,
    onClose,
    children,
    wide = false,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    wide?: boolean;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (open) {
            setMounted(true);
        }
    }, [open]);

    useEffect(() => {
        if (!mounted) return;
        const backdrop = backdropRef.current;
        const box = boxRef.current;
        if (!backdrop || !box) return;

        if (open) {
            gsap.set(backdrop, { display: "flex" });
            gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
            gsap.fromTo(
                box,
                { opacity: 0, scale: 0.8, y: 40, rotation: -2 },
                { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.4, ease: "back.out(1.7)" },
            );
        } else {
            gsap.to(box, { opacity: 0, scale: 0.85, y: 30, duration: 0.2, ease: "power2.in" });
            gsap.to(backdrop, {
                opacity: 0, duration: 0.25, ease: "power2.in", delay: 0.05,
                onComplete: () => {
                    gsap.set(backdrop, { display: "none" });
                    setMounted(false);
                },
            });
        }
    }, [open, mounted]);

    if (!mounted) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(26, 26, 46, 0.8)", display: "none" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                ref={boxRef}
                className={`relative border-4 overflow-y-auto ${wide ? "max-w-3xl" : "max-w-lg"} w-full max-h-[90vh]`}
                style={{ backgroundColor: COLORS.white, borderColor: COLORS.dark }}
            >
                {children}
            </div>
        </div>
    );
}

// ─── Standard Modal: Create Job Listing ─────────────────────────────────────
function CreateJobModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [form, setForm] = useState<JobFormData>(INITIAL_JOB_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
    const [submitted, setSubmitted] = useState(false);

    const updateField = useCallback((field: keyof JobFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }, []);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof JobFormData, string>> = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (!form.company.trim()) newErrors.company = "Company is required";
        if (!form.location.trim()) newErrors.location = "Location is required";
        if (!form.description.trim()) newErrors.description = "Description is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setForm(INITIAL_JOB_FORM);
            setErrors({});
            onClose();
        }, 1500);
    };

    const handleClose = () => {
        setForm(INITIAL_JOB_FORM);
        setErrors({});
        setSubmitted(false);
        onClose();
    };

    return (
        <AnimatedModal open={open} onClose={handleClose}>
            {/* Header */}
            <div className="p-6 border-b-4" style={{ borderColor: COLORS.coral, backgroundColor: COLORS.coral }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center border-3"
                            style={{ backgroundColor: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-briefcase text-lg" style={{ color: COLORS.coral }}></i>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-wider" style={{ color: COLORS.white }}>
                            Create Job Listing
                        </h2>
                    </div>
                    <button onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center font-black text-lg border-2 transition-transform hover:rotate-90"
                        style={{ backgroundColor: COLORS.white, borderColor: COLORS.white, color: COLORS.coral }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
                {submitted ? (
                    <div className="py-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center border-4"
                            style={{ borderColor: COLORS.teal, backgroundColor: COLORS.teal }}>
                            <i className="fa-duotone fa-regular fa-check text-3xl" style={{ color: COLORS.white }}></i>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-wide" style={{ color: COLORS.dark }}>
                            Job Created!
                        </h3>
                        <p className="text-sm mt-2" style={{ color: COLORS.dark, opacity: 0.6 }}>
                            Your listing is now live on the marketplace.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Title */}
                        <fieldset>
                            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
                                style={{ color: COLORS.dark }}>
                                Job Title <span style={{ color: COLORS.coral }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="e.g. Senior Software Engineer"
                                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B]"
                                style={{ borderColor: errors.title ? COLORS.coral : COLORS.dark, backgroundColor: COLORS.cream, color: COLORS.dark }}
                            />
                            {errors.title && (
                                <p className="text-xs font-bold mt-1" style={{ color: COLORS.coral }}>{errors.title}</p>
                            )}
                        </fieldset>

                        {/* Company & Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <fieldset>
                                <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
                                    style={{ color: COLORS.dark }}>
                                    Company <span style={{ color: COLORS.coral }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.company}
                                    onChange={(e) => updateField("company", e.target.value)}
                                    placeholder="e.g. TechCorp"
                                    className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B]"
                                    style={{ borderColor: errors.company ? COLORS.coral : COLORS.dark, backgroundColor: COLORS.cream, color: COLORS.dark }}
                                />
                                {errors.company && (
                                    <p className="text-xs font-bold mt-1" style={{ color: COLORS.coral }}>{errors.company}</p>
                                )}
                            </fieldset>
                            <fieldset>
                                <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
                                    style={{ color: COLORS.dark }}>
                                    Location <span style={{ color: COLORS.coral }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => updateField("location", e.target.value)}
                                    placeholder="e.g. New York, NY"
                                    className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B]"
                                    style={{ borderColor: errors.location ? COLORS.coral : COLORS.dark, backgroundColor: COLORS.cream, color: COLORS.dark }}
                                />
                                {errors.location && (
                                    <p className="text-xs font-bold mt-1" style={{ color: COLORS.coral }}>{errors.location}</p>
                                )}
                            </fieldset>
                        </div>

                        {/* Salary Range & Type */}
                        <div className="grid grid-cols-3 gap-4">
                            <fieldset>
                                <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
                                    style={{ color: COLORS.dark }}>
                                    Min Salary
                                </label>
                                <input
                                    type="text"
                                    value={form.salaryMin}
                                    onChange={(e) => updateField("salaryMin", e.target.value)}
                                    placeholder="$80,000"
                                    className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B]"
                                    style={{ borderColor: COLORS.dark, backgroundColor: COLORS.cream, color: COLORS.dark }}
                                />
                            </fieldset>
                            <fieldset>
                                <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
                                    style={{ color: COLORS.dark }}>
                                    Max Salary
                                </label>
                                <input
                                    type="text"
                                    value={form.salaryMax}
                                    onChange={(e) => updateField("salaryMax", e.target.value)}
                                    placeholder="$120,000"
                                    className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B]"
                                    style={{ borderColor: COLORS.dark, backgroundColor: COLORS.cream, color: COLORS.dark }}
                                />
                            </fieldset>
                            <fieldset>
                                <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
                                    style={{ color: COLORS.dark }}>
                                    Type
                                </label>
                                <select
                                    value={form.type}
                                    onChange={(e) => updateField("type", e.target.value)}
                                    className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B] cursor-pointer"
                                    style={{ borderColor: COLORS.dark, backgroundColor: COLORS.cream, color: COLORS.dark }}
                                >
                                    <option value="full-time">Full-Time</option>
                                    <option value="part-time">Part-Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </fieldset>
                        </div>

                        {/* Description */}
                        <fieldset>
                            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
                                style={{ color: COLORS.dark }}>
                                Description <span style={{ color: COLORS.coral }}>*</span>
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Describe the role, responsibilities, and team..."
                                rows={3}
                                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B] resize-none"
                                style={{ borderColor: errors.description ? COLORS.coral : COLORS.dark, backgroundColor: COLORS.cream, color: COLORS.dark }}
                            />
                            {errors.description && (
                                <p className="text-xs font-bold mt-1" style={{ color: COLORS.coral }}>{errors.description}</p>
                            )}
                        </fieldset>

                        {/* Requirements */}
                        <fieldset>
                            <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
                                style={{ color: COLORS.dark }}>
                                Requirements
                            </label>
                            <textarea
                                value={form.requirements}
                                onChange={(e) => updateField("requirements", e.target.value)}
                                placeholder="List key requirements, one per line..."
                                rows={3}
                                className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B] resize-none"
                                style={{ borderColor: COLORS.dark, backgroundColor: COLORS.cream, color: COLORS.dark }}
                            />
                        </fieldset>
                    </>
                )}
            </div>

            {/* Footer */}
            {!submitted && (
                <div className="p-6 border-t-4 flex justify-end gap-3" style={{ borderColor: COLORS.dark }}>
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                        style={{ borderColor: COLORS.dark, backgroundColor: COLORS.white, color: COLORS.dark }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                        style={{ borderColor: COLORS.coral, backgroundColor: COLORS.coral, color: COLORS.white }}
                    >
                        <i className="fa-duotone fa-regular fa-plus"></i>
                        Create Listing
                    </button>
                </div>
            )}
        </AnimatedModal>
    );
}

// ─── Wizard Modal: Post a Job ───────────────────────────────────────────────
const WIZARD_STEPS = [
    { label: "Job Details", icon: "fa-duotone fa-regular fa-briefcase", color: COLORS.coral },
    { label: "Requirements", icon: "fa-duotone fa-regular fa-list-check", color: COLORS.teal },
    { label: "Compensation", icon: "fa-duotone fa-regular fa-money-bill-wave", color: COLORS.yellow },
    { label: "Review", icon: "fa-duotone fa-regular fa-eye", color: COLORS.purple },
];

function WizardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<WizardFormData>(INITIAL_WIZARD_FORM);
    const [submitted, setSubmitted] = useState(false);
    const stepContentRef = useRef<HTMLDivElement>(null);

    const updateField = useCallback((field: keyof WizardFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const animateStepTransition = useCallback((direction: "next" | "back") => {
        if (!stepContentRef.current) return;
        const x = direction === "next" ? 40 : -40;
        gsap.fromTo(
            stepContentRef.current,
            { opacity: 0, x },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
        );
    }, []);

    const goNext = () => {
        if (step < 3) {
            setStep((s) => s + 1);
            animateStepTransition("next");
        }
    };

    const goBack = () => {
        if (step > 0) {
            setStep((s) => s - 1);
            animateStepTransition("back");
        }
    };

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setStep(0);
            setForm(INITIAL_WIZARD_FORM);
            onClose();
        }, 1500);
    };

    const handleClose = () => {
        setStep(0);
        setForm(INITIAL_WIZARD_FORM);
        setSubmitted(false);
        onClose();
    };

    const inputStyle = (borderOverride?: string) => ({
        borderColor: borderOverride || COLORS.dark,
        backgroundColor: COLORS.cream,
        color: COLORS.dark,
    });

    return (
        <AnimatedModal open={open} onClose={handleClose} wide>
            {/* Header with Progress */}
            <div className="p-6 border-b-4" style={{ borderColor: COLORS.dark }}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-3" style={{ color: COLORS.dark }}>
                        <div className="w-10 h-10 flex items-center justify-center"
                            style={{ backgroundColor: WIZARD_STEPS[step].color }}>
                            <i className={`${WIZARD_STEPS[step].icon} text-lg`}
                                style={{ color: WIZARD_STEPS[step].color === COLORS.yellow ? COLORS.dark : COLORS.white }}></i>
                        </div>
                        Post a Job
                    </h2>
                    <button onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center font-black text-lg border-3 transition-transform hover:rotate-90"
                        style={{ backgroundColor: COLORS.dark, borderColor: COLORS.dark, color: COLORS.white }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                    {WIZARD_STEPS.map((s, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="flex items-center w-full gap-2">
                                <div
                                    className="w-8 h-8 flex items-center justify-center text-xs font-black flex-shrink-0 border-3 transition-colors"
                                    style={{
                                        backgroundColor: i <= step ? s.color : COLORS.white,
                                        borderColor: s.color,
                                        color: i <= step
                                            ? (s.color === COLORS.yellow ? COLORS.dark : COLORS.white)
                                            : s.color,
                                    }}
                                >
                                    {i < step ? <i className="fa-solid fa-check text-xs"></i> : i + 1}
                                </div>
                                {i < WIZARD_STEPS.length - 1 && (
                                    <div className="flex-1 h-1" style={{ backgroundColor: i < step ? s.color : "#E0E0E0" }} />
                                )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block"
                                style={{ color: i <= step ? COLORS.dark : "#999" }}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="p-6" ref={stepContentRef}>
                {submitted ? (
                    <div className="py-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center border-4"
                            style={{ borderColor: COLORS.teal, backgroundColor: COLORS.teal }}>
                            <i className="fa-duotone fa-regular fa-rocket text-3xl" style={{ color: COLORS.white }}></i>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-wide" style={{ color: COLORS.dark }}>
                            Job Posted!
                        </h3>
                        <p className="text-sm mt-2" style={{ color: COLORS.dark, opacity: 0.6 }}>
                            Your listing is live. Recruiters can now submit candidates.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Step 1: Job Details */}
                        {step === 0 && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-[0.15em]"
                                        style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                                        Step 1
                                    </span>
                                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: COLORS.dark }}>
                                        Job Details
                                    </span>
                                </div>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                        Job Title
                                    </label>
                                    <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B]"
                                        style={inputStyle()} />
                                </fieldset>
                                <div className="grid grid-cols-2 gap-4">
                                    <fieldset>
                                        <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                            Company
                                        </label>
                                        <input type="text" value={form.company} onChange={(e) => updateField("company", e.target.value)}
                                            placeholder="e.g. TechCorp"
                                            className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B]"
                                            style={inputStyle()} />
                                    </fieldset>
                                    <fieldset>
                                        <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                            Location
                                        </label>
                                        <input type="text" value={form.location} onChange={(e) => updateField("location", e.target.value)}
                                            placeholder="e.g. San Francisco, CA"
                                            className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B]"
                                            style={inputStyle()} />
                                    </fieldset>
                                </div>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                        Employment Type
                                    </label>
                                    <select value={form.type} onChange={(e) => updateField("type", e.target.value)}
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B] cursor-pointer"
                                        style={inputStyle()}>
                                        <option value="full-time">Full-Time</option>
                                        <option value="part-time">Part-Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="remote">Remote</option>
                                    </select>
                                </fieldset>
                            </div>
                        )}

                        {/* Step 2: Requirements */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-[0.15em]"
                                        style={{ backgroundColor: COLORS.teal, color: COLORS.white }}>
                                        Step 2
                                    </span>
                                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: COLORS.dark }}>
                                        Requirements
                                    </span>
                                </div>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                        Experience Level
                                    </label>
                                    <select value={form.experienceLevel} onChange={(e) => updateField("experienceLevel", e.target.value)}
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#4ECDC4] cursor-pointer"
                                        style={inputStyle()}>
                                        <option value="entry">Entry Level</option>
                                        <option value="mid">Mid Level</option>
                                        <option value="senior">Senior</option>
                                        <option value="lead">Lead / Principal</option>
                                        <option value="executive">Executive</option>
                                    </select>
                                </fieldset>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                        Required Skills
                                    </label>
                                    <input type="text" value={form.skills} onChange={(e) => updateField("skills", e.target.value)}
                                        placeholder="e.g. React, TypeScript, Node.js"
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#4ECDC4]"
                                        style={inputStyle()} />
                                </fieldset>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                        Job Description
                                    </label>
                                    <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)}
                                        placeholder="Describe the role, responsibilities, and day-to-day..."
                                        rows={5}
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#4ECDC4] resize-none"
                                        style={inputStyle()} />
                                </fieldset>
                            </div>
                        )}

                        {/* Step 3: Compensation */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-[0.15em]"
                                        style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                        Step 3
                                    </span>
                                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: COLORS.dark }}>
                                        Compensation
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <fieldset>
                                        <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                            Min Salary
                                        </label>
                                        <input type="text" value={form.salaryMin} onChange={(e) => updateField("salaryMin", e.target.value)}
                                            placeholder="$80,000"
                                            className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FFE66D]"
                                            style={inputStyle()} />
                                    </fieldset>
                                    <fieldset>
                                        <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                            Max Salary
                                        </label>
                                        <input type="text" value={form.salaryMax} onChange={(e) => updateField("salaryMax", e.target.value)}
                                            placeholder="$150,000"
                                            className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FFE66D]"
                                            style={inputStyle()} />
                                    </fieldset>
                                </div>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                        Equity Package
                                    </label>
                                    <input type="text" value={form.equity} onChange={(e) => updateField("equity", e.target.value)}
                                        placeholder="e.g. 0.1% - 0.5% equity"
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FFE66D]"
                                        style={inputStyle()} />
                                </fieldset>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: COLORS.dark }}>
                                        Benefits
                                    </label>
                                    <textarea value={form.benefits} onChange={(e) => updateField("benefits", e.target.value)}
                                        placeholder="e.g. Health, dental, 401k match, unlimited PTO..."
                                        rows={3}
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FFE66D] resize-none"
                                        style={inputStyle()} />
                                </fieldset>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-[0.15em]"
                                        style={{ backgroundColor: COLORS.purple, color: COLORS.white }}>
                                        Step 4
                                    </span>
                                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: COLORS.dark }}>
                                        Review &amp; Submit
                                    </span>
                                </div>

                                {/* Review Cards */}
                                <div className="border-4 p-5" style={{ borderColor: COLORS.coral }}>
                                    <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: COLORS.coral }}>
                                        <i className="fa-duotone fa-regular fa-briefcase"></i>
                                        Job Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="font-bold" style={{ color: COLORS.dark }}>Title:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.title || "---"}</span></div>
                                        <div><span className="font-bold" style={{ color: COLORS.dark }}>Company:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.company || "---"}</span></div>
                                        <div><span className="font-bold" style={{ color: COLORS.dark }}>Location:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.location || "---"}</span></div>
                                        <div><span className="font-bold" style={{ color: COLORS.dark }}>Type:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.type}</span></div>
                                    </div>
                                </div>

                                <div className="border-4 p-5" style={{ borderColor: COLORS.teal }}>
                                    <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: COLORS.teal }}>
                                        <i className="fa-duotone fa-regular fa-list-check"></i>
                                        Requirements
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <div><span className="font-bold" style={{ color: COLORS.dark }}>Experience:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.experienceLevel}</span></div>
                                        <div><span className="font-bold" style={{ color: COLORS.dark }}>Skills:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.skills || "---"}</span></div>
                                        <div><span className="font-bold" style={{ color: COLORS.dark }}>Description:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.description ? form.description.substring(0, 80) + (form.description.length > 80 ? "..." : "") : "---"}</span></div>
                                    </div>
                                </div>

                                <div className="border-4 p-5" style={{ borderColor: COLORS.yellow }}>
                                    <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: COLORS.dark }}>
                                        <i className="fa-duotone fa-regular fa-money-bill-wave" style={{ color: COLORS.yellow }}></i>
                                        Compensation
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="font-bold" style={{ color: COLORS.dark }}>Salary:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.salaryMin || "---"} - {form.salaryMax || "---"}</span></div>
                                        <div><span className="font-bold" style={{ color: COLORS.dark }}>Equity:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.equity || "---"}</span></div>
                                        <div className="col-span-2"><span className="font-bold" style={{ color: COLORS.dark }}>Benefits:</span> <span style={{ color: COLORS.dark, opacity: 0.7 }}>{form.benefits || "---"}</span></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer Navigation */}
            {!submitted && (
                <div className="p-6 border-t-4 flex items-center justify-between" style={{ borderColor: COLORS.dark }}>
                    <button
                        onClick={handleClose}
                        className="px-5 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                        style={{ borderColor: COLORS.dark, backgroundColor: COLORS.white, color: COLORS.dark }}
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-3">
                        {step > 0 && (
                            <button
                                onClick={goBack}
                                className="px-5 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                style={{ borderColor: COLORS.dark, backgroundColor: COLORS.white, color: COLORS.dark }}
                            >
                                <i className="fa-solid fa-arrow-left text-xs"></i>
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={goNext}
                                className="px-5 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                style={{ borderColor: WIZARD_STEPS[step].color, backgroundColor: WIZARD_STEPS[step].color, color: WIZARD_STEPS[step].color === COLORS.yellow ? COLORS.dark : COLORS.white }}
                            >
                                Next
                                <i className="fa-solid fa-arrow-right text-xs"></i>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="px-5 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                style={{ borderColor: COLORS.purple, backgroundColor: COLORS.purple, color: COLORS.white }}
                            >
                                <i className="fa-duotone fa-regular fa-rocket text-xs"></i>
                                Submit Listing
                            </button>
                        )}
                    </div>
                </div>
            )}
        </AnimatedModal>
    );
}

// ─── Confirmation Modal: Delete Job ─────────────────────────────────────────
function DeleteJobModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [deleting, setDeleting] = useState(false);

    const handleConfirm = () => {
        setDeleting(true);
        setTimeout(() => {
            setDeleting(false);
            onClose();
        }, 1200);
    };

    const handleClose = () => {
        setDeleting(false);
        onClose();
    };

    return (
        <AnimatedModal open={open} onClose={handleClose}>
            {/* Destructive Header */}
            <div className="p-6 border-b-4" style={{ borderColor: COLORS.coral, backgroundColor: COLORS.dark }}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center border-3"
                        style={{ borderColor: COLORS.coral, backgroundColor: COLORS.coral }}>
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-xl" style={{ color: COLORS.white }}></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-wider" style={{ color: COLORS.white }}>
                            Delete Job Listing
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.coral }}>
                            Destructive Action
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                {deleting ? (
                    <div className="py-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4 animate-pulse"
                            style={{ borderColor: COLORS.coral, backgroundColor: COLORS.coral }}>
                            <i className="fa-duotone fa-regular fa-trash text-2xl" style={{ color: COLORS.white }}></i>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-wide" style={{ color: COLORS.dark }}>
                            Deleting...
                        </h3>
                    </div>
                ) : (
                    <>
                        {/* Warning Box */}
                        <div className="p-5 border-4 mb-6" style={{ borderColor: COLORS.coral, backgroundColor: "#FFF5F5" }}>
                            <div className="flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-exclamation-circle text-xl mt-0.5" style={{ color: COLORS.coral }}></i>
                                <div>
                                    <p className="text-sm font-bold mb-2" style={{ color: COLORS.dark }}>
                                        Are you sure you want to delete this job listing?
                                    </p>
                                    <p className="text-sm" style={{ color: COLORS.dark, opacity: 0.7 }}>
                                        This action cannot be undone. All associated data will be permanently removed, including:
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Impact List */}
                        <div className="space-y-3 mb-6">
                            {[
                                { icon: "fa-duotone fa-regular fa-users", text: "All candidate applications will be discarded", color: COLORS.coral },
                                { icon: "fa-duotone fa-regular fa-comments", text: "Recruiter conversations will be archived", color: COLORS.teal },
                                { icon: "fa-duotone fa-regular fa-chart-bar", text: "Analytics and engagement data will be lost", color: COLORS.purple },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 border-3"
                                    style={{ borderColor: item.color }}>
                                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: item.color }}>
                                        <i className={`${item.icon} text-sm`}
                                            style={{ color: item.color === COLORS.teal ? COLORS.dark : COLORS.white }}></i>
                                    </div>
                                    <span className="text-sm font-semibold" style={{ color: COLORS.dark }}>
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Job Preview */}
                        <div className="p-4 border-3" style={{ borderColor: COLORS.dark, backgroundColor: COLORS.cream }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-black text-sm uppercase" style={{ color: COLORS.dark }}>Senior Software Engineer</h4>
                                    <p className="text-xs" style={{ color: COLORS.dark, opacity: 0.6 }}>TechCorp -- San Francisco, CA</p>
                                </div>
                                <span className="px-2 py-1 text-xs font-black uppercase"
                                    style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                                    Active
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            {!deleting && (
                <div className="p-6 border-t-4 flex justify-end gap-3" style={{ borderColor: COLORS.dark }}>
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                        style={{ borderColor: COLORS.dark, backgroundColor: COLORS.white, color: COLORS.dark }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                        style={{ borderColor: COLORS.coral, backgroundColor: COLORS.coral, color: COLORS.white }}
                    >
                        <i className="fa-duotone fa-regular fa-trash"></i>
                        Delete Listing
                    </button>
                </div>
            )}
        </AnimatedModal>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ModalsSixPage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pageRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const cards = pageRef.current.querySelectorAll(".trigger-card");
        gsap.fromTo(
            cards,
            { opacity: 0, y: 50, scale: 0.85, rotation: -3 },
            {
                opacity: 1, y: 0, scale: 1, rotation: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
                stagger: 0.15,
                delay: 0.3,
            },
        );

        const heading = pageRef.current.querySelector(".page-heading");
        if (heading) {
            gsap.fromTo(
                heading,
                { opacity: 0, y: -40, skewY: 2 },
                { opacity: 1, y: 0, skewY: 0, duration: 0.8, ease: "power2.out" },
            );
        }

        const subtext = pageRef.current.querySelector(".page-subtext");
        if (subtext) {
            gsap.fromTo(
                subtext,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.2 },
            );
        }
    }, []);

    return (
        <div ref={pageRef} className="relative min-h-screen overflow-hidden" style={{ backgroundColor: COLORS.dark }}>
            <MemphisDecorations />

            <div className="relative z-10 container mx-auto px-4 py-20">
                {/* Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <div className="page-heading opacity-0">
                        <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] mb-6 inline-block"
                            style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-window-restore"></i>
                            Modal Components
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6"
                            style={{ color: COLORS.white }}>
                            Modals &amp;{" "}
                            <span className="relative inline-block">
                                <span style={{ color: COLORS.coral }}>Dialogs</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: COLORS.coral }} />
                            </span>
                        </h1>
                    </div>
                    <p className="page-subtext text-lg opacity-0" style={{ color: "rgba(255,255,255,0.7)" }}>
                        Standard forms, multi-step wizards, and confirmation dialogs -- built with bold Memphis energy.
                    </p>
                </div>

                {/* Trigger Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Card 1: Create Job */}
                    <div className="trigger-card opacity-0">
                        <div className="border-4 p-8 text-center transition-transform hover:-translate-y-2 cursor-pointer"
                            style={{ borderColor: COLORS.coral, backgroundColor: "rgba(255,255,255,0.03)" }}
                            onClick={() => setCreateOpen(true)}>
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-16 h-16" style={{ backgroundColor: COLORS.coral }} />
                            <div className="relative">
                                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-4"
                                    style={{ borderColor: COLORS.coral }}>
                                    <i className="fa-duotone fa-regular fa-briefcase text-3xl" style={{ color: COLORS.coral }}></i>
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-wide mb-3" style={{ color: COLORS.white }}>
                                    Standard Form
                                </h3>
                                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    A classic modal form with validation, multiple field types, and submit flow.
                                </p>
                                <button
                                    className="w-full py-3 text-sm font-black uppercase tracking-wider border-4 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    style={{ borderColor: COLORS.coral, backgroundColor: COLORS.coral, color: COLORS.white }}
                                >
                                    <i className="fa-duotone fa-regular fa-plus"></i>
                                    Create Job Listing
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Wizard */}
                    <div className="trigger-card opacity-0">
                        <div className="border-4 p-8 text-center transition-transform hover:-translate-y-2 cursor-pointer"
                            style={{ borderColor: COLORS.teal, backgroundColor: "rgba(255,255,255,0.03)" }}
                            onClick={() => setWizardOpen(true)}>
                            <div className="absolute top-0 right-0 w-16 h-16" style={{ backgroundColor: COLORS.teal }} />
                            <div className="relative">
                                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-4"
                                    style={{ borderColor: COLORS.teal }}>
                                    <i className="fa-duotone fa-regular fa-hat-wizard text-3xl" style={{ color: COLORS.teal }}></i>
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-wide mb-3" style={{ color: COLORS.white }}>
                                    Multi-Step Wizard
                                </h3>
                                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    A 4-step wizard with progress tracking, step navigation, and review.
                                </p>
                                <button
                                    className="w-full py-3 text-sm font-black uppercase tracking-wider border-4 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    style={{ borderColor: COLORS.teal, backgroundColor: COLORS.teal, color: COLORS.dark }}
                                >
                                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles"></i>
                                    Post a Job (Wizard)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Delete Confirmation */}
                    <div className="trigger-card opacity-0">
                        <div className="border-4 p-8 text-center transition-transform hover:-translate-y-2 cursor-pointer"
                            style={{ borderColor: COLORS.purple, backgroundColor: "rgba(255,255,255,0.03)" }}
                            onClick={() => setDeleteOpen(true)}>
                            <div className="absolute top-0 right-0 w-16 h-16" style={{ backgroundColor: COLORS.purple }} />
                            <div className="relative">
                                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-4"
                                    style={{ borderColor: COLORS.purple }}>
                                    <i className="fa-duotone fa-regular fa-trash text-3xl" style={{ color: COLORS.purple }}></i>
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-wide mb-3" style={{ color: COLORS.white }}>
                                    Confirmation Dialog
                                </h3>
                                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    A destructive action dialog with warning details and impact preview.
                                </p>
                                <button
                                    className="w-full py-3 text-sm font-black uppercase tracking-wider border-4 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    style={{ borderColor: COLORS.coral, backgroundColor: COLORS.coral, color: COLORS.white }}
                                >
                                    <i className="fa-duotone fa-regular fa-trash"></i>
                                    Delete Job
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateJobModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
            <DeleteJobModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
        </div>
    );
}
