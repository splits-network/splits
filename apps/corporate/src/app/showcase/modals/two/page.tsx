"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { gsap } from "gsap";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

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
    type: "full-time",
    description: "",
    requirements: "",
};

const emptyWizardForm: WizardFormData = {
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

/* ─── Animation Helpers ──────────────────────────────────────────────────────── */

function animateModalIn(backdropEl: HTMLElement, boxEl: HTMLElement) {
    const tl = gsap.timeline();
    tl.fromTo(
        backdropEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    tl.fromTo(
        boxEl,
        { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" },
        "-=0.15"
    );
    return tl;
}

function animateModalOut(
    backdropEl: HTMLElement,
    boxEl: HTMLElement,
    onComplete: () => void
) {
    const tl = gsap.timeline({ onComplete });
    tl.to(boxEl, {
        opacity: 0,
        y: 30,
        scale: 0.97,
        duration: 0.25,
        ease: "power2.in",
    });
    tl.to(backdropEl, { opacity: 0, duration: 0.2, ease: "power2.in" }, "-=0.1");
    return tl;
}

/* ─── Standard Modal ─────────────────────────────────────────────────────────── */

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
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            setForm(emptyJobForm);
            setErrors({});
            setSubmitted(false);
        }
    }, [open]);

    useEffect(() => {
        if (visible && backdropRef.current && boxRef.current) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [visible]);

    const handleClose = useCallback(() => {
        if (backdropRef.current && boxRef.current) {
            animateModalOut(backdropRef.current, boxRef.current, () => {
                setVisible(false);
                onClose();
            });
        } else {
            setVisible(false);
            onClose();
        }
    }, [onClose]);

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
        if (validate()) {
            setSubmitted(true);
            setTimeout(() => handleClose(), 1200);
        }
    };

    const updateField = (field: keyof JobFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    if (!visible) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                ref={boxRef}
                className="bg-base-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                style={{ opacity: 0 }}
            >
                {/* Header */}
                <div className="border-b border-base-300 px-8 py-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-1">
                            New Position
                        </p>
                        <h2 className="text-2xl font-bold text-base-content tracking-tight">
                            Create Job Listing
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                </div>

                {submitted ? (
                    <div className="px-8 py-16 text-center">
                        <i className="fa-duotone fa-regular fa-circle-check text-secondary text-5xl mb-6 block" />
                        <h3 className="text-2xl font-bold text-base-content tracking-tight mb-2">
                            Job Created
                        </h3>
                        <p className="text-base-content/60">
                            Your listing has been published to the network.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Form Body */}
                        <div className="px-8 py-8 space-y-6">
                            {/* Title */}
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    className={`input input-bordered w-full bg-base-200 focus:border-secondary ${errors.title ? "border-error" : ""}`}
                                    placeholder="e.g., Senior Software Engineer"
                                    value={form.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                />
                                {errors.title && (
                                    <p className="text-error text-xs mt-1">{errors.title}</p>
                                )}
                            </fieldset>

                            {/* Company + Location row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <fieldset>
                                    <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        className={`input input-bordered w-full bg-base-200 focus:border-secondary ${errors.company ? "border-error" : ""}`}
                                        placeholder="e.g., Acme Corp"
                                        value={form.company}
                                        onChange={(e) => updateField("company", e.target.value)}
                                    />
                                    {errors.company && (
                                        <p className="text-error text-xs mt-1">{errors.company}</p>
                                    )}
                                </fieldset>
                                <fieldset>
                                    <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        className={`input input-bordered w-full bg-base-200 focus:border-secondary ${errors.location ? "border-error" : ""}`}
                                        placeholder="e.g., San Francisco, CA"
                                        value={form.location}
                                        onChange={(e) => updateField("location", e.target.value)}
                                    />
                                    {errors.location && (
                                        <p className="text-error text-xs mt-1">{errors.location}</p>
                                    )}
                                </fieldset>
                            </div>

                            {/* Salary + Type row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <fieldset>
                                    <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                        Salary Min
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-base-200 focus:border-secondary"
                                        placeholder="$80,000"
                                        value={form.salaryMin}
                                        onChange={(e) => updateField("salaryMin", e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                        Salary Max
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-base-200 focus:border-secondary"
                                        placeholder="$120,000"
                                        value={form.salaryMax}
                                        onChange={(e) => updateField("salaryMax", e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                        Type
                                    </label>
                                    <select
                                        className="select select-bordered w-full bg-base-200 focus:border-secondary"
                                        value={form.type}
                                        onChange={(e) => updateField("type", e.target.value)}
                                    >
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="freelance">Freelance</option>
                                    </select>
                                </fieldset>
                            </div>

                            {/* Description */}
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                    Description
                                </label>
                                <textarea
                                    className={`textarea textarea-bordered w-full bg-base-200 focus:border-secondary h-28 ${errors.description ? "border-error" : ""}`}
                                    placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                                    value={form.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                />
                                {errors.description && (
                                    <p className="text-error text-xs mt-1">{errors.description}</p>
                                )}
                            </fieldset>

                            {/* Requirements */}
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                    Requirements
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full bg-base-200 focus:border-secondary h-28"
                                    placeholder="List the key qualifications, skills, and experience required..."
                                    value={form.requirements}
                                    onChange={(e) => updateField("requirements", e.target.value)}
                                />
                            </fieldset>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-base-300 px-8 py-5 flex justify-end gap-3">
                            <button
                                onClick={handleClose}
                                className="btn btn-ghost text-base-content/60 font-semibold uppercase text-xs tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="btn btn-secondary font-semibold uppercase text-xs tracking-wider px-8"
                            >
                                <i className="fa-duotone fa-regular fa-paper-plane mr-2" />
                                Publish Listing
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ─── Wizard Modal ───────────────────────────────────────────────────────────── */

const WIZARD_STEPS = [
    { label: "Job Details", icon: "fa-duotone fa-regular fa-briefcase" },
    { label: "Requirements", icon: "fa-duotone fa-regular fa-list-check" },
    { label: "Compensation", icon: "fa-duotone fa-regular fa-money-bill-wave" },
    { label: "Review", icon: "fa-duotone fa-regular fa-magnifying-glass" },
];

function WizardModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [form, setForm] = useState<WizardFormData>(emptyWizardForm);
    const [step, setStep] = useState(0);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [submitted, setSubmitted] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            setForm(emptyWizardForm);
            setStep(0);
            setErrors({});
            setSubmitted(false);
        }
    }, [open]);

    useEffect(() => {
        if (visible && backdropRef.current && boxRef.current) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [visible]);

    const handleClose = useCallback(() => {
        if (backdropRef.current && boxRef.current) {
            animateModalOut(backdropRef.current, boxRef.current, () => {
                setVisible(false);
                onClose();
            });
        } else {
            setVisible(false);
            onClose();
        }
    }, [onClose]);

    const animateStepTransition = (direction: "next" | "back") => {
        if (!stepContentRef.current) return;
        const xStart = direction === "next" ? 30 : -30;
        gsap.fromTo(
            stepContentRef.current,
            { opacity: 0, x: xStart },
            { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
        );
    };

    const updateField = (field: keyof WizardFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validateStep = (): boolean => {
        const newErrors: Partial<Record<string, string>> = {};
        if (step === 0) {
            if (!form.title.trim()) newErrors.title = "Title is required";
            if (!form.company.trim()) newErrors.company = "Company is required";
            if (!form.location.trim()) newErrors.location = "Location is required";
        } else if (step === 1) {
            if (!form.skills.trim()) newErrors.skills = "Skills are required";
            if (!form.description.trim()) newErrors.description = "Description is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep((s) => Math.min(s + 1, 3));
            animateStepTransition("next");
        }
    };

    const handleBack = () => {
        setStep((s) => Math.max(s - 1, 0));
        setErrors({});
        animateStepTransition("back");
    };

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => handleClose(), 1500);
    };

    if (!visible) return null;

    const renderStepContent = () => {
        if (submitted) {
            return (
                <div className="py-16 text-center">
                    <i className="fa-duotone fa-regular fa-party-horn text-secondary text-5xl mb-6 block" />
                    <h3 className="text-2xl font-bold text-base-content tracking-tight mb-2">
                        Job Posted Successfully
                    </h3>
                    <p className="text-base-content/60">
                        Your listing is now live on the Splits Network.
                    </p>
                </div>
            );
        }

        switch (step) {
            case 0:
                return (
                    <div className="space-y-6">
                        <fieldset>
                            <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                Job Title
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full bg-base-200 focus:border-secondary ${errors.title ? "border-error" : ""}`}
                                placeholder="e.g., Product Designer"
                                value={form.title}
                                onChange={(e) => updateField("title", e.target.value)}
                            />
                            {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
                        </fieldset>
                        <fieldset>
                            <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                Company
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full bg-base-200 focus:border-secondary ${errors.company ? "border-error" : ""}`}
                                placeholder="e.g., Stellar Inc"
                                value={form.company}
                                onChange={(e) => updateField("company", e.target.value)}
                            />
                            {errors.company && <p className="text-error text-xs mt-1">{errors.company}</p>}
                        </fieldset>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    className={`input input-bordered w-full bg-base-200 focus:border-secondary ${errors.location ? "border-error" : ""}`}
                                    placeholder="e.g., Remote / NYC"
                                    value={form.location}
                                    onChange={(e) => updateField("location", e.target.value)}
                                />
                                {errors.location && <p className="text-error text-xs mt-1">{errors.location}</p>}
                            </fieldset>
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                    Employment Type
                                </label>
                                <select
                                    className="select select-bordered w-full bg-base-200 focus:border-secondary"
                                    value={form.type}
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
            case 1:
                return (
                    <div className="space-y-6">
                        <fieldset>
                            <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                Experience Level
                            </label>
                            <select
                                className="select select-bordered w-full bg-base-200 focus:border-secondary"
                                value={form.experienceLevel}
                                onChange={(e) => updateField("experienceLevel", e.target.value)}
                            >
                                <option value="junior">Junior (0-2 years)</option>
                                <option value="mid">Mid-Level (3-5 years)</option>
                                <option value="senior">Senior (6-10 years)</option>
                                <option value="lead">Lead / Staff (10+ years)</option>
                                <option value="executive">Executive</option>
                            </select>
                        </fieldset>
                        <fieldset>
                            <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                Required Skills
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full bg-base-200 focus:border-secondary ${errors.skills ? "border-error" : ""}`}
                                placeholder="e.g., React, TypeScript, Node.js"
                                value={form.skills}
                                onChange={(e) => updateField("skills", e.target.value)}
                            />
                            {errors.skills && <p className="text-error text-xs mt-1">{errors.skills}</p>}
                        </fieldset>
                        <fieldset>
                            <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                Job Description
                            </label>
                            <textarea
                                className={`textarea textarea-bordered w-full bg-base-200 focus:border-secondary h-36 ${errors.description ? "border-error" : ""}`}
                                placeholder="Describe the role in detail: responsibilities, team structure, growth opportunities..."
                                value={form.description}
                                onChange={(e) => updateField("description", e.target.value)}
                            />
                            {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}
                        </fieldset>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                    Salary Minimum
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full bg-base-200 focus:border-secondary"
                                    placeholder="$90,000"
                                    value={form.salaryMin}
                                    onChange={(e) => updateField("salaryMin", e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                    Salary Maximum
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full bg-base-200 focus:border-secondary"
                                    placeholder="$140,000"
                                    value={form.salaryMax}
                                    onChange={(e) => updateField("salaryMax", e.target.value)}
                                />
                            </fieldset>
                        </div>
                        <fieldset>
                            <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                Equity
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-base-200 focus:border-secondary"
                                placeholder="e.g., 0.1% - 0.5% stock options"
                                value={form.equity}
                                onChange={(e) => updateField("equity", e.target.value)}
                            />
                        </fieldset>
                        <fieldset>
                            <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">
                                Benefits
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full bg-base-200 focus:border-secondary h-28"
                                placeholder="e.g., Health insurance, 401k match, unlimited PTO, remote work..."
                                value={form.benefits}
                                onChange={(e) => updateField("benefits", e.target.value)}
                            />
                        </fieldset>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-4">
                                Job Details
                            </p>
                            <div className="bg-base-200 p-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-base-content/60 text-sm">Title</span>
                                    <span className="text-base-content font-medium text-sm">{form.title || "---"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/60 text-sm">Company</span>
                                    <span className="text-base-content font-medium text-sm">{form.company || "---"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/60 text-sm">Location</span>
                                    <span className="text-base-content font-medium text-sm">{form.location || "---"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/60 text-sm">Type</span>
                                    <span className="text-base-content font-medium text-sm capitalize">{form.type}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-4">
                                Requirements
                            </p>
                            <div className="bg-base-200 p-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-base-content/60 text-sm">Experience</span>
                                    <span className="text-base-content font-medium text-sm capitalize">{form.experienceLevel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/60 text-sm">Skills</span>
                                    <span className="text-base-content font-medium text-sm">{form.skills || "---"}</span>
                                </div>
                            </div>
                            {form.description && (
                                <p className="text-sm text-base-content/70 mt-3 leading-relaxed line-clamp-3">
                                    {form.description}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-4">
                                Compensation
                            </p>
                            <div className="bg-base-200 p-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-base-content/60 text-sm">Salary Range</span>
                                    <span className="text-base-content font-medium text-sm">
                                        {form.salaryMin && form.salaryMax
                                            ? `${form.salaryMin} - ${form.salaryMax}`
                                            : form.salaryMin || form.salaryMax || "---"}
                                    </span>
                                </div>
                                {form.equity && (
                                    <div className="flex justify-between">
                                        <span className="text-base-content/60 text-sm">Equity</span>
                                        <span className="text-base-content font-medium text-sm">{form.equity}</span>
                                    </div>
                                )}
                            </div>
                            {form.benefits && (
                                <p className="text-sm text-base-content/70 mt-3 leading-relaxed line-clamp-3">
                                    {form.benefits}
                                </p>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                ref={boxRef}
                className="bg-base-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                style={{ opacity: 0 }}
            >
                {/* Header */}
                <div className="border-b border-base-300 px-8 py-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-1">
                            {submitted ? "Complete" : `Step ${step + 1} of ${WIZARD_STEPS.length}`}
                        </p>
                        <h2 className="text-2xl font-bold text-base-content tracking-tight">
                            {submitted ? "All Done" : WIZARD_STEPS[step].label}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                </div>

                {/* Progress Indicator */}
                {!submitted && (
                    <div className="px-8 pt-6">
                        <div className="flex items-center gap-2">
                            {WIZARD_STEPS.map((s, i) => (
                                <div key={s.label} className="flex items-center flex-1">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 text-xs font-bold shrink-0 transition-colors duration-300 ${
                                            i < step
                                                ? "bg-secondary text-secondary-content"
                                                : i === step
                                                  ? "bg-base-content text-base-100"
                                                  : "bg-base-200 text-base-content/30"
                                        }`}
                                    >
                                        {i < step ? (
                                            <i className="fa-duotone fa-regular fa-check text-xs" />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                    {i < WIZARD_STEPS.length - 1 && (
                                        <div
                                            className={`h-px flex-1 mx-2 transition-colors duration-300 ${
                                                i < step ? "bg-secondary" : "bg-base-300"
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2">
                            {WIZARD_STEPS.map((s, i) => (
                                <p
                                    key={s.label}
                                    className={`text-[10px] uppercase tracking-wider ${
                                        i <= step ? "text-base-content/60" : "text-base-content/25"
                                    }`}
                                >
                                    {s.label}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step Content */}
                <div ref={stepContentRef} className="px-8 py-8">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="border-t border-base-300 px-8 py-5 flex justify-between">
                        <div>
                            {step > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="btn btn-ghost text-base-content/60 font-semibold uppercase text-xs tracking-wider"
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-left mr-2" />
                                    Back
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="btn btn-ghost text-base-content/60 font-semibold uppercase text-xs tracking-wider"
                            >
                                Cancel
                            </button>
                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="btn btn-secondary font-semibold uppercase text-xs tracking-wider px-8"
                                >
                                    Next
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="btn btn-secondary font-semibold uppercase text-xs tracking-wider px-8"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket-launch mr-2" />
                                    Publish Job
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Confirmation Modal ─────────────────────────────────────────────────────── */

function DeleteJobModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            setDeleting(false);
            setDeleted(false);
        }
    }, [open]);

    useEffect(() => {
        if (visible && backdropRef.current && boxRef.current) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [visible]);

    const handleClose = useCallback(() => {
        if (backdropRef.current && boxRef.current) {
            animateModalOut(backdropRef.current, boxRef.current, () => {
                setVisible(false);
                onClose();
            });
        } else {
            setVisible(false);
            onClose();
        }
    }, [onClose]);

    const handleDelete = () => {
        setDeleting(true);
        setTimeout(() => {
            setDeleting(false);
            setDeleted(true);
            setTimeout(() => handleClose(), 1000);
        }, 1200);
    };

    if (!visible) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !deleting) handleClose();
            }}
        >
            <div
                ref={boxRef}
                className="bg-base-100 w-full max-w-md"
                style={{ opacity: 0 }}
            >
                {/* Header */}
                <div className="border-b border-base-300 px-8 py-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-error font-medium mb-1">
                            Destructive Action
                        </p>
                        <h2 className="text-2xl font-bold text-base-content tracking-tight">
                            Delete Job Listing
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={deleting}
                        className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-8">
                    {deleted ? (
                        <div className="text-center py-4">
                            <i className="fa-duotone fa-regular fa-circle-check text-secondary text-4xl mb-4 block" />
                            <p className="text-lg font-bold text-base-content tracking-tight">
                                Job listing deleted.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-error/10 flex items-center justify-center shrink-0">
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-xl" />
                                </div>
                                <div>
                                    <p className="text-base-content font-semibold mb-1">
                                        This action cannot be undone.
                                    </p>
                                    <p className="text-base-content/60 text-sm leading-relaxed">
                                        Deleting this job listing will permanently remove it from the
                                        Splits Network marketplace. All associated applications,
                                        candidate submissions, and recruiter assignments will be
                                        archived.
                                    </p>
                                </div>
                            </div>

                            {/* Sample job card being deleted */}
                            <div className="bg-base-200 p-5 mb-2">
                                <p className="font-bold text-base-content text-sm mb-1">
                                    Senior Product Designer
                                </p>
                                <p className="text-xs text-base-content/50">
                                    Acme Corp &middot; San Francisco, CA &middot; Posted 12 days ago
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <span className="text-[10px] uppercase tracking-wider bg-base-300 text-base-content/60 px-2 py-1">
                                        3 Applications
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider bg-base-300 text-base-content/60 px-2 py-1">
                                        2 Recruiters
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!deleted && (
                    <div className="border-t border-base-300 px-8 py-5 flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            disabled={deleting}
                            className="btn btn-ghost text-base-content/60 font-semibold uppercase text-xs tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="btn btn-error font-semibold uppercase text-xs tracking-wider px-8"
                        >
                            {deleting ? (
                                <>
                                    <span className="loading loading-spinner loading-xs mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-trash mr-2" />
                                    Delete Permanently
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Page Component ─────────────────────────────────────────────────────────── */

export default function ModalsPageTwo() {
    const [createOpen, setCreateOpen] = useState(false);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        gsap.from("[data-page-text]", {
            y: 50,
            opacity: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
        });

        gsap.from("[data-modal-card]", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            delay: 0.3,
            ease: "power2.out",
        });

        gsap.from("[data-divider]", {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1,
            ease: "power2.inOut",
            delay: 0.2,
        });
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            {/* Hero Header */}
            <section className="bg-neutral text-neutral-content py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p
                        data-page-text
                        className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-6"
                    >
                        Component Showcase
                    </p>
                    <h1
                        data-page-text
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-6"
                    >
                        Modal
                        <br />
                        Patterns
                    </h1>
                    <p
                        data-page-text
                        className="text-lg md:text-xl text-neutral-content/70 max-w-xl leading-relaxed"
                    >
                        Three essential modal interactions: standard forms, multi-step
                        wizards, and destructive confirmations. Built for the magazine
                        editorial aesthetic.
                    </p>
                </div>
            </section>

            {/* Modal Cards */}
            <section className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div data-divider className="h-px bg-base-300 mb-16" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Standard Modal Card */}
                        <div data-modal-card className="group">
                            <div className="border border-base-300 p-8 h-full flex flex-col">
                                <div className="mb-6">
                                    <i className="fa-duotone fa-regular fa-plus-large text-secondary text-2xl mb-5 block" />
                                    <p className="text-xs uppercase tracking-[0.3em] text-base-content/40 font-medium mb-2">
                                        Pattern 01
                                    </p>
                                    <h3 className="text-xl font-bold text-base-content tracking-tight mb-3">
                                        Standard Form Modal
                                    </h3>
                                    <p className="text-base-content/60 text-sm leading-relaxed">
                                        A classic form overlay for creating new records.
                                        Includes field validation, inline error messaging,
                                        and a success confirmation state.
                                    </p>
                                </div>
                                <div className="mt-auto pt-6 border-t border-base-300">
                                    <button
                                        onClick={() => setCreateOpen(true)}
                                        className="btn btn-secondary btn-block font-semibold uppercase text-xs tracking-wider"
                                    >
                                        <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                                        Create Job Listing
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Wizard Modal Card */}
                        <div data-modal-card className="group">
                            <div className="border border-base-300 p-8 h-full flex flex-col">
                                <div className="mb-6">
                                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-secondary text-2xl mb-5 block" />
                                    <p className="text-xs uppercase tracking-[0.3em] text-base-content/40 font-medium mb-2">
                                        Pattern 02
                                    </p>
                                    <h3 className="text-xl font-bold text-base-content tracking-tight mb-3">
                                        Multi-Step Wizard
                                    </h3>
                                    <p className="text-base-content/60 text-sm leading-relaxed">
                                        A guided, four-step workflow for complex data entry.
                                        Features a progress indicator, step validation,
                                        animated transitions, and a final review screen.
                                    </p>
                                </div>
                                <div className="mt-auto pt-6 border-t border-base-300">
                                    <button
                                        onClick={() => setWizardOpen(true)}
                                        className="btn btn-secondary btn-block font-semibold uppercase text-xs tracking-wider"
                                    >
                                        <i className="fa-duotone fa-regular fa-wand-magic-sparkles mr-2" />
                                        Post a Job (Wizard)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Delete Confirmation Card */}
                        <div data-modal-card className="group">
                            <div className="border border-base-300 p-8 h-full flex flex-col">
                                <div className="mb-6">
                                    <i className="fa-duotone fa-regular fa-trash text-secondary text-2xl mb-5 block" />
                                    <p className="text-xs uppercase tracking-[0.3em] text-base-content/40 font-medium mb-2">
                                        Pattern 03
                                    </p>
                                    <h3 className="text-xl font-bold text-base-content tracking-tight mb-3">
                                        Destructive Confirmation
                                    </h3>
                                    <p className="text-base-content/60 text-sm leading-relaxed">
                                        A safety-first dialog for irreversible actions.
                                        Shows a clear warning, context about the impact,
                                        and requires explicit confirmation to proceed.
                                    </p>
                                </div>
                                <div className="mt-auto pt-6 border-t border-base-300">
                                    <button
                                        onClick={() => setDeleteOpen(true)}
                                        className="btn btn-error btn-block font-semibold uppercase text-xs tracking-wider"
                                    >
                                        <i className="fa-duotone fa-regular fa-trash mr-2" />
                                        Delete Job
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="bg-base-200 py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <i className="fa-duotone fa-regular fa-paintbrush-fine text-secondary text-lg mb-3 block" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-2">
                                Editorial Design
                            </h4>
                            <p className="text-base-content/50 text-sm leading-relaxed">
                                Clean typography, generous whitespace, and sharp
                                borders carry the magazine aesthetic into every modal.
                            </p>
                        </div>
                        <div>
                            <i className="fa-duotone fa-regular fa-bolt text-secondary text-lg mb-3 block" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-2">
                                GSAP Transitions
                            </h4>
                            <p className="text-base-content/50 text-sm leading-relaxed">
                                Smooth open and close animations with spring-like easing
                                give every interaction a polished, intentional feel.
                            </p>
                        </div>
                        <div>
                            <i className="fa-duotone fa-regular fa-shield-check text-secondary text-lg mb-3 block" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-2">
                                Form Validation
                            </h4>
                            <p className="text-base-content/50 text-sm leading-relaxed">
                                Inline field-level validation with clear error states.
                                Required fields are enforced before progression.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Colophon */}
            <section className="bg-base-200 border-t border-base-300 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">
                        Splits Network &middot; Modal Patterns &middot; Magazine
                        Editorial
                    </p>
                </div>
            </section>

            {/* Modals */}
            <CreateJobModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
            <DeleteJobModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
        </div>
    );
}
