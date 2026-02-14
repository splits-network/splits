"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

// -- Types ------------------------------------------------------------------

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

const emptyWizard: WizardData = {
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

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const experienceLevels = ["Entry-level", "Mid-level", "Senior", "Lead", "Executive"];

// -- Animated Modal Wrapper -------------------------------------------------

function AnimatedModal({
    open,
    onClose,
    children,
    wide,
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
        if (mounted && open && backdropRef.current && boxRef.current) {
            gsap.fromTo(
                backdropRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.25, ease: "power2.out" },
            );
            gsap.fromTo(
                boxRef.current,
                { opacity: 0, y: 30, scale: 0.97 },
                { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" },
            );
        }
    }, [mounted, open]);

    const handleClose = useCallback(() => {
        if (!backdropRef.current || !boxRef.current) {
            onClose();
            return;
        }
        gsap.to(boxRef.current, {
            opacity: 0,
            y: 20,
            scale: 0.97,
            duration: 0.2,
            ease: "power2.in",
        });
        gsap.to(backdropRef.current, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                setMounted(false);
                onClose();
            },
        });
    }, [onClose]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className="absolute inset-0 bg-[#0f1b3d]/40"
                onClick={handleClose}
            />
            {/* Modal box */}
            <div
                ref={boxRef}
                className={`relative bg-white border-2 border-[#233876]/15 ${wide ? "max-w-3xl" : "max-w-xl"} w-full max-h-[90vh] overflow-y-auto`}
            >
                {/* Corner marks */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/30" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/30" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/30" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/30" />

                {children}
            </div>
        </div>
    );
}

// -- Standard Form Modal ----------------------------------------------------

function CreateJobModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [form, setForm] = useState<JobFormData>(emptyJobForm);
    const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
    const [submitted, setSubmitted] = useState(false);

    const update = (field: keyof JobFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validate = (): boolean => {
        const errs: Partial<Record<keyof JobFormData, string>> = {};
        if (!form.title.trim()) errs.title = "Required";
        if (!form.company.trim()) errs.company = "Required";
        if (!form.location.trim()) errs.location = "Required";
        if (!form.description.trim()) errs.description = "Required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setForm(emptyJobForm);
                setErrors({});
                onClose();
            }, 1200);
        }
    };

    const handleCancel = () => {
        setForm(emptyJobForm);
        setErrors({});
        setSubmitted(false);
        onClose();
    };

    return (
        <AnimatedModal open={open} onClose={handleCancel}>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-dashed border-[#233876]/10 pb-6">
                    <div>
                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                            New Listing
                        </div>
                        <h3 className="text-xl font-bold text-[#0f1b3d]">
                            Create Job Listing
                        </h3>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="w-8 h-8 border border-[#233876]/15 flex items-center justify-center text-[#233876]/40 hover:text-[#233876] hover:border-[#233876]/30 transition-colors"
                    >
                        <i className="fa-regular fa-xmark" />
                    </button>
                </div>

                {submitted ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-2 border-[#233876]/20 flex items-center justify-center mx-auto mb-4">
                            <i className="fa-duotone fa-regular fa-check text-2xl text-[#233876]" />
                        </div>
                        <div className="font-bold text-[#0f1b3d] mb-1">
                            Job Listing Created
                        </div>
                        <div className="text-sm text-[#0f1b3d]/40">
                            Your listing has been published to the network.
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Form fields */}
                        <div className="space-y-5">
                            {/* Title */}
                            <fieldset>
                                <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => update("title", e.target.value)}
                                    placeholder="e.g. Senior Software Engineer"
                                    className={`w-full border-2 ${errors.title ? "border-red-400" : "border-[#233876]/10"} bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors`}
                                />
                                {errors.title && (
                                    <span className="font-mono text-[10px] text-red-400 mt-1 block">
                                        {errors.title}
                                    </span>
                                )}
                            </fieldset>

                            {/* Company + Location row */}
                            <div className="grid grid-cols-2 gap-4">
                                <fieldset>
                                    <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        value={form.company}
                                        onChange={(e) => update("company", e.target.value)}
                                        placeholder="e.g. Acme Inc"
                                        className={`w-full border-2 ${errors.company ? "border-red-400" : "border-[#233876]/10"} bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors`}
                                    />
                                    {errors.company && (
                                        <span className="font-mono text-[10px] text-red-400 mt-1 block">
                                            {errors.company}
                                        </span>
                                    )}
                                </fieldset>
                                <fieldset>
                                    <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => update("location", e.target.value)}
                                        placeholder="e.g. San Francisco, CA"
                                        className={`w-full border-2 ${errors.location ? "border-red-400" : "border-[#233876]/10"} bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors`}
                                    />
                                    {errors.location && (
                                        <span className="font-mono text-[10px] text-red-400 mt-1 block">
                                            {errors.location}
                                        </span>
                                    )}
                                </fieldset>
                            </div>

                            {/* Salary + Type row */}
                            <div className="grid grid-cols-3 gap-4">
                                <fieldset>
                                    <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                        Salary Min
                                    </label>
                                    <input
                                        type="text"
                                        value={form.salaryMin}
                                        onChange={(e) => update("salaryMin", e.target.value)}
                                        placeholder="$80,000"
                                        className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                    />
                                </fieldset>
                                <fieldset>
                                    <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                        Salary Max
                                    </label>
                                    <input
                                        type="text"
                                        value={form.salaryMax}
                                        onChange={(e) => update("salaryMax", e.target.value)}
                                        placeholder="$120,000"
                                        className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                    />
                                </fieldset>
                                <fieldset>
                                    <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => update("type", e.target.value)}
                                        className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] focus:border-[#233876]/30 focus:outline-none transition-colors"
                                    >
                                        {jobTypes.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            </div>

                            {/* Description */}
                            <fieldset>
                                <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => update("description", e.target.value)}
                                    placeholder="Describe the role, responsibilities, and team..."
                                    rows={3}
                                    className={`w-full border-2 ${errors.description ? "border-red-400" : "border-[#233876]/10"} bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors resize-none`}
                                />
                                {errors.description && (
                                    <span className="font-mono text-[10px] text-red-400 mt-1 block">
                                        {errors.description}
                                    </span>
                                )}
                            </fieldset>

                            {/* Requirements */}
                            <fieldset>
                                <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                    Requirements
                                </label>
                                <textarea
                                    value={form.requirements}
                                    onChange={(e) => update("requirements", e.target.value)}
                                    placeholder="List the key requirements for this role..."
                                    rows={3}
                                    className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors resize-none"
                                />
                            </fieldset>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-dashed border-[#233876]/10">
                            <button
                                onClick={handleCancel}
                                className="btn btn-sm border-2 border-[#233876]/20 bg-white text-[#0f1b3d]/60 hover:border-[#233876]/40 hover:text-[#0f1b3d] rounded-none px-6 font-medium tracking-wide transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="btn btn-sm border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none px-6 font-medium tracking-wide"
                            >
                                <i className="fa-duotone fa-regular fa-plus" />
                                Create Listing
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AnimatedModal>
    );
}

// -- Multi-Step Wizard Modal ------------------------------------------------

function WizardModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<WizardData>(emptyWizard);
    const [submitted, setSubmitted] = useState(false);
    const stepContentRef = useRef<HTMLDivElement>(null);

    const totalSteps = 4;
    const stepLabels = ["Job Details", "Requirements", "Compensation", "Review"];

    const update = (field: keyof WizardData, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const animateStep = (direction: "next" | "back") => {
        if (!stepContentRef.current) return;
        const xFrom = direction === "next" ? 30 : -30;
        gsap.fromTo(
            stepContentRef.current,
            { opacity: 0, x: xFrom },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
        );
    };

    const goNext = () => {
        if (step < totalSteps) {
            setStep((s) => s + 1);
            setTimeout(() => animateStep("next"), 10);
        }
    };

    const goBack = () => {
        if (step > 1) {
            setStep((s) => s - 1);
            setTimeout(() => animateStep("back"), 10);
        }
    };

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setStep(1);
            setData(emptyWizard);
            onClose();
        }, 1500);
    };

    const handleCancel = () => {
        setStep(1);
        setData(emptyWizard);
        setSubmitted(false);
        onClose();
    };

    return (
        <AnimatedModal open={open} onClose={handleCancel} wide>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-dashed border-[#233876]/10 pb-6">
                    <div>
                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                            Job Wizard // Step {String(step).padStart(2, "0")} of {String(totalSteps).padStart(2, "0")}
                        </div>
                        <h3 className="text-xl font-bold text-[#0f1b3d]">
                            Post a Job
                        </h3>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="w-8 h-8 border border-[#233876]/15 flex items-center justify-center text-[#233876]/40 hover:text-[#233876] hover:border-[#233876]/30 transition-colors"
                    >
                        <i className="fa-regular fa-xmark" />
                    </button>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-px mb-8">
                    {stepLabels.map((label, i) => {
                        const stepNum = i + 1;
                        const isActive = stepNum === step;
                        const isDone = stepNum < step || submitted;
                        return (
                            <div key={i} className="flex-1">
                                <div
                                    className={`h-1 w-full ${isDone ? "bg-[#233876]" : isActive ? "bg-[#233876]/50" : "bg-[#233876]/10"} transition-colors duration-300`}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={`font-mono text-[10px] ${isDone ? "text-[#233876]" : isActive ? "text-[#233876]/70" : "text-[#233876]/25"} transition-colors`}
                                    >
                                        {String(stepNum).padStart(2, "0")}
                                    </span>
                                    <span
                                        className={`text-xs ${isActive ? "text-[#0f1b3d] font-semibold" : "text-[#0f1b3d]/30"} transition-colors hidden sm:block`}
                                    >
                                        {label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {submitted ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 border-2 border-[#233876]/20 flex items-center justify-center mx-auto mb-4">
                            <i className="fa-duotone fa-regular fa-rocket text-2xl text-[#233876]" />
                        </div>
                        <div className="font-bold text-[#0f1b3d] mb-1">
                            Job Published
                        </div>
                        <div className="text-sm text-[#0f1b3d]/40">
                            Your job listing is now live on the network.
                        </div>
                    </div>
                ) : (
                    <>
                        <div ref={stepContentRef} className="min-h-[260px]">
                            {/* Step 1: Job Details */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <fieldset>
                                        <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                            Job Title
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => update("title", e.target.value)}
                                            placeholder="e.g. Senior Software Engineer"
                                            className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            value={data.company}
                                            onChange={(e) => update("company", e.target.value)}
                                            placeholder="e.g. Acme Inc"
                                            className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                        />
                                    </fieldset>
                                    <div className="grid grid-cols-2 gap-4">
                                        <fieldset>
                                            <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={data.location}
                                                onChange={(e) => update("location", e.target.value)}
                                                placeholder="e.g. Remote"
                                                className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                                Type
                                            </label>
                                            <select
                                                value={data.type}
                                                onChange={(e) => update("type", e.target.value)}
                                                className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] focus:border-[#233876]/30 focus:outline-none transition-colors"
                                            >
                                                {jobTypes.map((t) => (
                                                    <option key={t} value={t}>
                                                        {t}
                                                    </option>
                                                ))}
                                            </select>
                                        </fieldset>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Requirements */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <fieldset>
                                        <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                            Experience Level
                                        </label>
                                        <select
                                            value={data.experienceLevel}
                                            onChange={(e) => update("experienceLevel", e.target.value)}
                                            className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] focus:border-[#233876]/30 focus:outline-none transition-colors"
                                        >
                                            {experienceLevels.map((lvl) => (
                                                <option key={lvl} value={lvl}>
                                                    {lvl}
                                                </option>
                                            ))}
                                        </select>
                                    </fieldset>
                                    <fieldset>
                                        <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                            Required Skills
                                        </label>
                                        <input
                                            type="text"
                                            value={data.skills}
                                            onChange={(e) => update("skills", e.target.value)}
                                            placeholder="e.g. React, TypeScript, Node.js"
                                            className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                            Job Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => update("description", e.target.value)}
                                            placeholder="Describe the role in detail..."
                                            rows={5}
                                            className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors resize-none"
                                        />
                                    </fieldset>
                                </div>
                            )}

                            {/* Step 3: Compensation */}
                            {step === 3 && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <fieldset>
                                            <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                                Salary Min
                                            </label>
                                            <input
                                                type="text"
                                                value={data.salaryMin}
                                                onChange={(e) => update("salaryMin", e.target.value)}
                                                placeholder="$80,000"
                                                className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                                Salary Max
                                            </label>
                                            <input
                                                type="text"
                                                value={data.salaryMax}
                                                onChange={(e) => update("salaryMax", e.target.value)}
                                                placeholder="$120,000"
                                                className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                            />
                                        </fieldset>
                                    </div>
                                    <fieldset>
                                        <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                            Equity Package
                                        </label>
                                        <input
                                            type="text"
                                            value={data.equity}
                                            onChange={(e) => update("equity", e.target.value)}
                                            placeholder="e.g. 0.1% - 0.5% over 4 years"
                                            className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className="block font-mono text-xs tracking-wider text-[#233876]/50 uppercase mb-2">
                                            Benefits
                                        </label>
                                        <textarea
                                            value={data.benefits}
                                            onChange={(e) => update("benefits", e.target.value)}
                                            placeholder="e.g. Health insurance, 401k match, unlimited PTO..."
                                            rows={4}
                                            className="w-full border-2 border-[#233876]/10 bg-[#f7f8fa] px-4 py-3 text-sm text-[#0f1b3d] placeholder:text-[#0f1b3d]/25 focus:border-[#233876]/30 focus:outline-none transition-colors resize-none"
                                        />
                                    </fieldset>
                                </div>
                            )}

                            {/* Step 4: Review */}
                            {step === 4 && (
                                <div className="space-y-4">
                                    <div className="font-mono text-xs tracking-wider text-[#233876]/40 uppercase mb-4">
                                        Review Your Listing
                                    </div>

                                    <div className="grid grid-cols-2 gap-px bg-[#233876]/10">
                                        {[
                                            { label: "Title", value: data.title },
                                            { label: "Company", value: data.company },
                                            { label: "Location", value: data.location },
                                            { label: "Type", value: data.type },
                                            { label: "Experience", value: data.experienceLevel },
                                            { label: "Skills", value: data.skills },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-white p-4">
                                                <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                                    {item.label}
                                                </div>
                                                <div className="text-sm font-medium text-[#0f1b3d] mt-1">
                                                    {item.value || (
                                                        <span className="text-[#0f1b3d]/20 italic">
                                                            Not specified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-px bg-[#233876]/10">
                                        <div className="bg-white p-4">
                                            <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                                Salary Range
                                            </div>
                                            <div className="text-sm font-medium text-[#0f1b3d] mt-1">
                                                {data.salaryMin && data.salaryMax
                                                    ? `${data.salaryMin} - ${data.salaryMax}`
                                                    : data.salaryMin || data.salaryMax || (
                                                          <span className="text-[#0f1b3d]/20 italic">
                                                              Not specified
                                                          </span>
                                                      )}
                                            </div>
                                        </div>
                                        <div className="bg-white p-4">
                                            <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                                Equity
                                            </div>
                                            <div className="text-sm font-medium text-[#0f1b3d] mt-1">
                                                {data.equity || (
                                                    <span className="text-[#0f1b3d]/20 italic">
                                                        Not specified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {data.description && (
                                        <div className="bg-[#f7f8fa] border border-[#233876]/8 p-4">
                                            <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-2">
                                                Description
                                            </div>
                                            <div className="text-sm text-[#0f1b3d]/60 leading-relaxed whitespace-pre-wrap">
                                                {data.description}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-dashed border-[#233876]/10">
                            <button
                                onClick={handleCancel}
                                className="btn btn-sm border-2 border-[#233876]/20 bg-white text-[#0f1b3d]/60 hover:border-[#233876]/40 hover:text-[#0f1b3d] rounded-none px-6 font-medium tracking-wide transition-colors"
                            >
                                Cancel
                            </button>
                            <div className="flex items-center gap-3">
                                {step > 1 && (
                                    <button
                                        onClick={goBack}
                                        className="btn btn-sm border-2 border-[#233876]/20 bg-white text-[#233876]/60 hover:border-[#233876]/40 hover:text-[#233876] rounded-none px-6 font-medium tracking-wide transition-colors"
                                    >
                                        <i className="fa-regular fa-chevron-left text-xs" />
                                        Back
                                    </button>
                                )}
                                {step < totalSteps ? (
                                    <button
                                        onClick={goNext}
                                        className="btn btn-sm border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none px-6 font-medium tracking-wide"
                                    >
                                        Next
                                        <i className="fa-regular fa-chevron-right text-xs" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        className="btn btn-sm border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none px-6 font-medium tracking-wide"
                                    >
                                        <i className="fa-duotone fa-regular fa-rocket" />
                                        Publish Job
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AnimatedModal>
    );
}

// -- Confirmation Dialog Modal ----------------------------------------------

function DeleteConfirmModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [deleting, setDeleting] = useState(false);

    const handleConfirm = () => {
        setDeleting(true);
        setTimeout(() => {
            setDeleting(false);
            onClose();
        }, 1000);
    };

    const handleCancel = () => {
        setDeleting(false);
        onClose();
    };

    return (
        <AnimatedModal open={open} onClose={handleCancel}>
            <div className="p-8">
                {/* Warning icon */}
                <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 border-2 border-red-300 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-2xl text-red-500" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-[#0f1b3d] mb-3">
                        Delete Job Listing
                    </h3>
                    <p className="text-sm text-[#0f1b3d]/50 leading-relaxed max-w-sm mx-auto mb-4">
                        Are you sure you want to delete this job listing? This action will
                        permanently remove the listing and all associated candidate applications.
                    </p>

                    {/* Affected item preview */}
                    <div className="border-2 border-red-200 bg-red-50/50 p-4 max-w-sm mx-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 border border-red-200 flex items-center justify-center flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-briefcase text-red-400 text-sm" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-sm text-[#0f1b3d]">
                                    Senior Software Engineer
                                </div>
                                <div className="font-mono text-[10px] text-[#0f1b3d]/30 tracking-wider">
                                    TechCorp // 3 candidates // Posted 5 days ago
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning box */}
                <div className="flex items-start gap-3 bg-[#f7f8fa] border border-[#233876]/8 p-4 mb-8">
                    <i className="fa-duotone fa-regular fa-circle-info text-[#233876]/40 mt-0.5" />
                    <div className="text-xs text-[#0f1b3d]/40 leading-relaxed">
                        This action cannot be undone. All candidate data, recruiter
                        assignments, and application history will be permanently deleted.
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={handleCancel}
                        disabled={deleting}
                        className="btn btn-sm border-2 border-[#233876]/20 bg-white text-[#0f1b3d]/60 hover:border-[#233876]/40 hover:text-[#0f1b3d] rounded-none px-6 font-medium tracking-wide transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={deleting}
                        className="btn btn-sm border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 rounded-none px-6 font-medium tracking-wide disabled:opacity-50"
                    >
                        {deleting ? (
                            <>
                                <span className="loading loading-spinner loading-xs" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-trash" />
                                Delete Listing
                            </>
                        )}
                    </button>
                </div>
            </div>
        </AnimatedModal>
    );
}

// -- Page -------------------------------------------------------------------

export default function ModalsNinePage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const cards = containerRef.current.querySelectorAll(".modal-trigger-card");
        gsap.fromTo(
            cards,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
                stagger: 0.12,
            },
        );
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-white relative">
            {/* Dotted grid background */}
            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #233876 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Blueprint border */}
            <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/10 pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6 py-24">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                        REF: EN-2026-MD09 // Component Library
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold text-[#0f1b3d] mb-6 leading-tight">
                        Modal <span className="text-[#233876]">Components</span>
                    </h1>
                    <p className="text-lg text-[#0f1b3d]/50 max-w-2xl mx-auto leading-relaxed">
                        Precision-engineered dialog patterns for creating, managing,
                        and confirming actions within the recruiting workflow.
                    </p>
                </div>

                {/* Trigger Cards */}
                <div className="grid md:grid-cols-3 gap-px bg-[#233876]/10 max-w-5xl mx-auto">
                    {/* Card 1: Standard Form */}
                    <div className="modal-trigger-card bg-white p-8 opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 border-2 border-[#233876]/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-file-plus text-xl text-[#233876]" />
                            </div>
                            <div>
                                <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                    01 // Standard Form
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-[#0f1b3d] mb-2">
                            Create Job Listing
                        </h3>
                        <p className="text-sm text-[#0f1b3d]/40 leading-relaxed mb-6">
                            Standard modal form with input validation, multiple field types,
                            and submit/cancel actions.
                        </p>

                        <div className="space-y-2 mb-8">
                            {["Form validation", "Multiple field types", "Success state"].map(
                                (item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 text-xs text-[#0f1b3d]/30"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-[#233876]/30" />
                                        {item}
                                    </div>
                                ),
                            )}
                        </div>

                        <button
                            onClick={() => setCreateOpen(true)}
                            className="btn btn-sm border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none w-full font-medium tracking-wide"
                        >
                            <i className="fa-duotone fa-regular fa-plus" />
                            Create Job Listing
                        </button>
                    </div>

                    {/* Card 2: Wizard */}
                    <div className="modal-trigger-card bg-white p-8 opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 border-2 border-[#233876]/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-xl text-[#233876]" />
                            </div>
                            <div>
                                <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                    02 // Multi-Step Wizard
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-[#0f1b3d] mb-2">
                            Post a Job (Wizard)
                        </h3>
                        <p className="text-sm text-[#0f1b3d]/40 leading-relaxed mb-6">
                            Four-step guided workflow with progress tracking, step
                            navigation, and review before submission.
                        </p>

                        <div className="space-y-2 mb-8">
                            {["4-step navigation", "Progress indicator", "Review summary"].map(
                                (item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 text-xs text-[#0f1b3d]/30"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-[#233876]/30" />
                                        {item}
                                    </div>
                                ),
                            )}
                        </div>

                        <button
                            onClick={() => setWizardOpen(true)}
                            className="btn btn-sm border-2 border-[#233876] bg-white text-[#233876] hover:bg-[#233876]/5 rounded-none w-full font-medium tracking-wide"
                        >
                            <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                            Post a Job (Wizard)
                        </button>
                    </div>

                    {/* Card 3: Confirmation */}
                    <div className="modal-trigger-card bg-white p-8 opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 border-2 border-red-300 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-trash text-xl text-red-500" />
                            </div>
                            <div>
                                <div className="font-mono text-[10px] text-red-400/60 tracking-wider uppercase">
                                    03 // Destructive Action
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-[#0f1b3d] mb-2">
                            Delete Job
                        </h3>
                        <p className="text-sm text-[#0f1b3d]/40 leading-relaxed mb-6">
                            Confirmation dialog for destructive actions with warning
                            messaging and irreversible action acknowledgment.
                        </p>

                        <div className="space-y-2 mb-8">
                            {["Warning messaging", "Affected item preview", "Loading state"].map(
                                (item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 text-xs text-[#0f1b3d]/30"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-red-300" />
                                        {item}
                                    </div>
                                ),
                            )}
                        </div>

                        <button
                            onClick={() => setDeleteOpen(true)}
                            className="btn btn-sm border-2 border-red-400 bg-white text-red-500 hover:bg-red-50 rounded-none w-full font-medium tracking-wide"
                        >
                            <i className="fa-duotone fa-regular fa-trash" />
                            Delete Job
                        </button>
                    </div>
                </div>

                {/* Footer reference */}
                <div className="max-w-5xl mx-auto mt-12 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">
                        EMPLOYMENT NETWORKS // MODAL PATTERNS
                    </span>
                    <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">
                        v9.0
                    </span>
                </div>
            </div>

            {/* Modals */}
            <CreateJobModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
            <DeleteConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
        </div>
    );
}
