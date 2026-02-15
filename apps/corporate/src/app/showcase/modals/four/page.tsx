"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

/* ─── Types ──────────────────────────────────────────────────────────────── */

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

const INITIAL_FORM: JobFormData = {
    title: "",
    company: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    type: "full-time",
    description: "",
    requirements: "",
};

const INITIAL_WIZARD: WizardData = {
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

const JOB_TYPES = [
    { value: "full-time", label: "Full-Time" },
    { value: "part-time", label: "Part-Time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
];

const EXPERIENCE_LEVELS = [
    { value: "junior", label: "Junior (0-2 years)" },
    { value: "mid", label: "Mid-Level (3-5 years)" },
    { value: "senior", label: "Senior (6-10 years)" },
    { value: "lead", label: "Lead / Principal (10+ years)" },
];

const WIZARD_STEPS = [
    { label: "Job Details", icon: "fa-duotone fa-regular fa-briefcase" },
    { label: "Requirements", icon: "fa-duotone fa-regular fa-list-check" },
    { label: "Compensation", icon: "fa-duotone fa-regular fa-money-check-dollar" },
    { label: "Review", icon: "fa-duotone fa-regular fa-check-double" },
];

/* ─── Animation Helpers ──────────────────────────────────────────────────── */

function animateModalIn(backdropEl: HTMLElement, boxEl: HTMLElement) {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    tl.fromTo(
        boxEl,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5 },
        0.1,
    );
    return tl;
}

function animateModalOut(
    backdropEl: HTMLElement,
    boxEl: HTMLElement,
    onComplete: () => void,
) {
    const tl = gsap.timeline({
        defaults: { ease: "power2.in" },
        onComplete,
    });
    tl.to(boxEl, { opacity: 0, y: 40, scale: 0.96, duration: 0.3 });
    tl.to(backdropEl, { opacity: 0, duration: 0.25 }, 0.1);
    return tl;
}

/* ─── Standard Modal ─────────────────────────────────────────────────────── */

function CreateJobModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [form, setForm] = useState<JobFormData>(INITIAL_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
    const [visible, setVisible] = useState(false);

    const set = useCallback(
        (field: keyof JobFormData, value: string) =>
            setForm((prev) => ({ ...prev, [field]: value })),
        [],
    );

    useEffect(() => {
        if (open) {
            setVisible(true);
            setForm(INITIAL_FORM);
            setErrors({});
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
        }
    }, [onClose]);

    const validate = useCallback((): boolean => {
        const e: Partial<Record<keyof JobFormData, string>> = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.company.trim()) e.company = "Company is required";
        if (!form.location.trim()) e.location = "Location is required";
        if (!form.description.trim()) e.description = "Description is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [form]);

    const handleSubmit = useCallback(() => {
        if (validate()) handleClose();
    }, [validate, handleClose]);

    if (!visible) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === backdropRef.current && handleClose()}
        >
            <div
                ref={boxRef}
                className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-base-content/5"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-1">
                            New Listing
                        </p>
                        <h3 className="text-2xl font-black tracking-tight">
                            Create Job Listing
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                </div>

                {/* Form */}
                <div className="px-8 pb-4 space-y-5">
                    {/* Title */}
                    <fieldset>
                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                            Job Title
                        </label>
                        <input
                            type="text"
                            className={`input input-bordered w-full bg-base-200 ${errors.title ? "input-error" : ""}`}
                            placeholder="e.g. Senior Frontend Engineer"
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                        />
                        {errors.title && (
                            <p className="text-error text-xs mt-1">{errors.title}</p>
                        )}
                    </fieldset>

                    {/* Company + Location */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <fieldset>
                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                Company
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full bg-base-200 ${errors.company ? "input-error" : ""}`}
                                placeholder="e.g. Acme Corp"
                                value={form.company}
                                onChange={(e) => set("company", e.target.value)}
                            />
                            {errors.company && (
                                <p className="text-error text-xs mt-1">
                                    {errors.company}
                                </p>
                            )}
                        </fieldset>
                        <fieldset>
                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                Location
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full bg-base-200 ${errors.location ? "input-error" : ""}`}
                                placeholder="e.g. San Francisco, CA"
                                value={form.location}
                                onChange={(e) => set("location", e.target.value)}
                            />
                            {errors.location && (
                                <p className="text-error text-xs mt-1">
                                    {errors.location}
                                </p>
                            )}
                        </fieldset>
                    </div>

                    {/* Salary + Type */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        <fieldset>
                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                Salary Min
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-base-200"
                                placeholder="$80,000"
                                value={form.salaryMin}
                                onChange={(e) => set("salaryMin", e.target.value)}
                            />
                        </fieldset>
                        <fieldset>
                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                Salary Max
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-base-200"
                                placeholder="$120,000"
                                value={form.salaryMax}
                                onChange={(e) => set("salaryMax", e.target.value)}
                            />
                        </fieldset>
                        <fieldset>
                            <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                Type
                            </label>
                            <select
                                className="select select-bordered w-full bg-base-200"
                                value={form.type}
                                onChange={(e) => set("type", e.target.value)}
                            >
                                {JOB_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </fieldset>
                    </div>

                    {/* Description */}
                    <fieldset>
                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                            Description
                        </label>
                        <textarea
                            className={`textarea textarea-bordered w-full bg-base-200 min-h-[100px] ${errors.description ? "textarea-error" : ""}`}
                            placeholder="Describe the role, responsibilities, and what makes it exciting..."
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                        />
                        {errors.description && (
                            <p className="text-error text-xs mt-1">
                                {errors.description}
                            </p>
                        )}
                    </fieldset>

                    {/* Requirements */}
                    <fieldset>
                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                            Requirements
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full bg-base-200 min-h-[80px]"
                            placeholder="List required skills, experience, and qualifications..."
                            value={form.requirements}
                            onChange={(e) => set("requirements", e.target.value)}
                        />
                    </fieldset>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-base-content/5">
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary font-semibold shadow-lg"
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        Create Listing
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Wizard Modal ───────────────────────────────────────────────────────── */

function WizardModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);
    const [wizard, setWizard] = useState<WizardData>(INITIAL_WIZARD);
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);

    const set = useCallback(
        (field: keyof WizardData, value: string) =>
            setWizard((prev) => ({ ...prev, [field]: value })),
        [],
    );

    useEffect(() => {
        if (open) {
            setVisible(true);
            setWizard(INITIAL_WIZARD);
            setStep(0);
        }
    }, [open]);

    useEffect(() => {
        if (visible && backdropRef.current && boxRef.current) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [visible]);

    const animateStepTransition = useCallback((direction: "next" | "back") => {
        if (!stepContentRef.current) return;
        const xOut = direction === "next" ? -30 : 30;
        const xIn = direction === "next" ? 30 : -30;

        gsap.timeline({ defaults: { ease: "power2.out" } })
            .to(stepContentRef.current, {
                opacity: 0,
                x: xOut,
                duration: 0.15,
            })
            .set(stepContentRef.current, { x: xIn })
            .to(stepContentRef.current, {
                opacity: 1,
                x: 0,
                duration: 0.25,
            });
    }, []);

    const handleClose = useCallback(() => {
        if (backdropRef.current && boxRef.current) {
            animateModalOut(backdropRef.current, boxRef.current, () => {
                setVisible(false);
                onClose();
            });
        }
    }, [onClose]);

    const goNext = useCallback(() => {
        if (step < 3) {
            animateStepTransition("next");
            setTimeout(() => setStep((s) => s + 1), 150);
        }
    }, [step, animateStepTransition]);

    const goBack = useCallback(() => {
        if (step > 0) {
            animateStepTransition("back");
            setTimeout(() => setStep((s) => s - 1), 150);
        }
    }, [step, animateStepTransition]);

    if (!visible) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === backdropRef.current && handleClose()}
        >
            <div
                ref={boxRef}
                className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-base-content/5"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-2">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-1">
                            Step {step + 1} of 4
                        </p>
                        <h3 className="text-2xl font-black tracking-tight">
                            Post a Job
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2">
                        {WIZARD_STEPS.map((s, i) => (
                            <div key={i} className="flex items-center flex-1">
                                <div
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                                        i === step
                                            ? "bg-primary text-primary-content"
                                            : i < step
                                              ? "bg-primary/10 text-primary"
                                              : "bg-base-200 text-base-content/30"
                                    }`}
                                >
                                    <i className={s.icon} />
                                    <span className="hidden sm:inline">
                                        {s.label}
                                    </span>
                                </div>
                                {i < 3 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-2 rounded transition-colors duration-300 ${
                                            i < step
                                                ? "bg-primary"
                                                : "bg-base-content/10"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div ref={stepContentRef} className="px-8 pb-4 min-h-[280px]">
                    {step === 0 && (
                        <div className="space-y-5">
                            <fieldset>
                                <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full bg-base-200"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    value={wizard.title}
                                    onChange={(e) =>
                                        set("title", e.target.value)
                                    }
                                />
                            </fieldset>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <fieldset>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="e.g. Acme Corp"
                                        value={wizard.company}
                                        onChange={(e) =>
                                            set("company", e.target.value)
                                        }
                                    />
                                </fieldset>
                                <fieldset>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="e.g. San Francisco, CA"
                                        value={wizard.location}
                                        onChange={(e) =>
                                            set("location", e.target.value)
                                        }
                                    />
                                </fieldset>
                            </div>
                            <fieldset>
                                <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                    Employment Type
                                </label>
                                <select
                                    className="select select-bordered w-full bg-base-200"
                                    value={wizard.type}
                                    onChange={(e) =>
                                        set("type", e.target.value)
                                    }
                                >
                                    {JOB_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-5">
                            <fieldset>
                                <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                    Experience Level
                                </label>
                                <select
                                    className="select select-bordered w-full bg-base-200"
                                    value={wizard.experienceLevel}
                                    onChange={(e) =>
                                        set("experienceLevel", e.target.value)
                                    }
                                >
                                    {EXPERIENCE_LEVELS.map((l) => (
                                        <option key={l.value} value={l.value}>
                                            {l.label}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>
                            <fieldset>
                                <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                    Key Skills
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full bg-base-200"
                                    placeholder="e.g. React, TypeScript, Node.js, AWS"
                                    value={wizard.skills}
                                    onChange={(e) =>
                                        set("skills", e.target.value)
                                    }
                                />
                                <p className="text-xs text-base-content/40 mt-1">
                                    Separate skills with commas
                                </p>
                            </fieldset>
                            <fieldset>
                                <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                    Role Description
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full bg-base-200 min-h-[120px]"
                                    placeholder="Describe the responsibilities, team, and what makes this role unique..."
                                    value={wizard.description}
                                    onChange={(e) =>
                                        set("description", e.target.value)
                                    }
                                />
                            </fieldset>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <fieldset>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                        Salary Min
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="$100,000"
                                        value={wizard.salaryMin}
                                        onChange={(e) =>
                                            set("salaryMin", e.target.value)
                                        }
                                    />
                                </fieldset>
                                <fieldset>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                        Salary Max
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-base-200"
                                        placeholder="$150,000"
                                        value={wizard.salaryMax}
                                        onChange={(e) =>
                                            set("salaryMax", e.target.value)
                                        }
                                    />
                                </fieldset>
                            </div>
                            <fieldset>
                                <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                    Equity
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full bg-base-200"
                                    placeholder="e.g. 0.1% - 0.5% options"
                                    value={wizard.equity}
                                    onChange={(e) =>
                                        set("equity", e.target.value)
                                    }
                                />
                            </fieldset>
                            <fieldset>
                                <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold block mb-1.5">
                                    Benefits
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full bg-base-200 min-h-[100px]"
                                    placeholder="e.g. Health/dental/vision, 401k match, unlimited PTO, remote flexibility..."
                                    value={wizard.benefits}
                                    onChange={(e) =>
                                        set("benefits", e.target.value)
                                    }
                                />
                            </fieldset>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <p className="text-sm text-base-content/50 mb-4">
                                Review your listing before publishing.
                            </p>

                            {/* Review Card: Job Details */}
                            <div className="bg-base-200 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fa-duotone fa-regular fa-briefcase text-primary" />
                                    <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                                        Job Details
                                    </span>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-base-content/40">
                                            Title:
                                        </span>{" "}
                                        <span className="font-semibold">
                                            {wizard.title || "Not set"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-base-content/40">
                                            Company:
                                        </span>{" "}
                                        <span className="font-semibold">
                                            {wizard.company || "Not set"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-base-content/40">
                                            Location:
                                        </span>{" "}
                                        <span className="font-semibold">
                                            {wizard.location || "Not set"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-base-content/40">
                                            Type:
                                        </span>{" "}
                                        <span className="font-semibold capitalize">
                                            {wizard.type.replace("-", " ")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Review Card: Requirements */}
                            <div className="bg-base-200 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fa-duotone fa-regular fa-list-check text-primary" />
                                    <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                                        Requirements
                                    </span>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-base-content/40">
                                            Experience:
                                        </span>{" "}
                                        <span className="font-semibold">
                                            {EXPERIENCE_LEVELS.find(
                                                (l) =>
                                                    l.value ===
                                                    wizard.experienceLevel,
                                            )?.label || wizard.experienceLevel}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-base-content/40">
                                            Skills:
                                        </span>{" "}
                                        <span className="font-semibold">
                                            {wizard.skills || "Not set"}
                                        </span>
                                    </div>
                                </div>
                                {wizard.description && (
                                    <p className="text-sm text-base-content/60 mt-3 line-clamp-2">
                                        {wizard.description}
                                    </p>
                                )}
                            </div>

                            {/* Review Card: Compensation */}
                            <div className="bg-base-200 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fa-duotone fa-regular fa-money-check-dollar text-primary" />
                                    <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                                        Compensation
                                    </span>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-base-content/40">
                                            Salary:
                                        </span>{" "}
                                        <span className="font-semibold">
                                            {wizard.salaryMin && wizard.salaryMax
                                                ? `${wizard.salaryMin} - ${wizard.salaryMax}`
                                                : "Not set"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-base-content/40">
                                            Equity:
                                        </span>{" "}
                                        <span className="font-semibold">
                                            {wizard.equity || "None"}
                                        </span>
                                    </div>
                                </div>
                                {wizard.benefits && (
                                    <p className="text-sm text-base-content/60 mt-3 line-clamp-2">
                                        {wizard.benefits}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-6 border-t border-base-content/5">
                    <div>
                        {step > 0 && (
                            <button
                                onClick={goBack}
                                className="btn btn-ghost font-semibold"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left" />
                                Back
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClose}
                            className="btn btn-ghost font-semibold"
                        >
                            Cancel
                        </button>
                        {step < 3 ? (
                            <button
                                onClick={goNext}
                                className="btn btn-primary font-semibold shadow-lg"
                            >
                                Next
                                <i className="fa-duotone fa-regular fa-arrow-right" />
                            </button>
                        ) : (
                            <button
                                onClick={handleClose}
                                className="btn btn-primary font-semibold shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-check" />
                                Publish Listing
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Confirmation Dialog ────────────────────────────────────────────────── */

function DeleteConfirmModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) setVisible(true);
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
        }
    }, [onClose]);

    if (!visible) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === backdropRef.current && handleClose()}
        >
            <div
                ref={boxRef}
                className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md border border-base-content/5"
            >
                {/* Icon */}
                <div className="flex justify-center pt-8 pb-4">
                    <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-3xl" />
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-6 text-center">
                    <h3 className="text-xl font-black tracking-tight mb-2">
                        Delete Job Listing
                    </h3>
                    <p className="text-sm text-base-content/50 leading-relaxed mb-2">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-base-content">
                            Senior Frontend Engineer
                        </span>{" "}
                        at Acme Corp?
                    </p>
                    <p className="text-xs text-base-content/40 leading-relaxed">
                        This action cannot be undone. All associated
                        applications, candidate submissions, and recruiter
                        assignments will be permanently removed.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 px-8 pb-8 justify-center">
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost font-semibold flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleClose}
                        className="btn btn-error font-semibold flex-1 shadow-lg"
                    >
                        <i className="fa-duotone fa-regular fa-trash" />
                        Delete Listing
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function ModalsFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                ".cin-page-kicker",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6 },
            )
                .fromTo(
                    ".cin-page-title",
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.8 },
                    0.15,
                )
                .fromTo(
                    ".cin-page-sub",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    0.35,
                )
                .fromTo(
                    ".cin-card",
                    { opacity: 0, y: 40, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.6,
                        stagger: 0.12,
                        ease: "back.out(1.2)",
                    },
                    0.5,
                );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-neutral">
            {/* Hero Header */}
            <div className="relative pt-24 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <p className="cin-page-kicker text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4 opacity-0">
                        Component Showcase
                    </p>
                    <h1 className="cin-page-title text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6 opacity-0">
                        Modal
                        <br />
                        <span className="text-primary">Patterns</span>
                    </h1>
                    <p className="cin-page-sub text-lg text-white/50 max-w-xl mx-auto leading-relaxed opacity-0">
                        Three essential modal interactions designed for the
                        recruiting workflow. Cinematic transitions, thoughtful
                        forms, and decisive actions.
                    </p>
                </div>
            </div>

            {/* Cards */}
            <div className="max-w-5xl mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Create Job Card */}
                    <div className="cin-card bg-white/5 border border-white/10 rounded-2xl p-8 opacity-0">
                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                            <i className="fa-duotone fa-regular fa-plus text-primary text-2xl" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">
                            Standard Form Modal
                        </h3>
                        <p className="text-sm text-white/40 leading-relaxed mb-8">
                            A comprehensive form for creating a new job listing.
                            Includes validation, structured fields, and a clean
                            layout.
                        </p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="btn btn-primary btn-block font-semibold shadow-lg"
                        >
                            <i className="fa-duotone fa-regular fa-briefcase" />
                            Create Job Listing
                        </button>
                    </div>

                    {/* Wizard Card */}
                    <div className="cin-card bg-white/5 border border-white/10 rounded-2xl p-8 opacity-0">
                        <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                            <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-secondary text-2xl" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">
                            Multi-Step Wizard
                        </h3>
                        <p className="text-sm text-white/40 leading-relaxed mb-8">
                            A guided four-step flow that walks users through the
                            complete job posting process with animated
                            transitions.
                        </p>
                        <button
                            onClick={() => setShowWizard(true)}
                            className="btn btn-secondary btn-block font-semibold shadow-lg"
                        >
                            <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                            Post a Job (Wizard)
                        </button>
                    </div>

                    {/* Delete Card */}
                    <div className="cin-card bg-white/5 border border-white/10 rounded-2xl p-8 opacity-0">
                        <div className="w-14 h-14 rounded-full bg-error/20 flex items-center justify-center mb-6">
                            <i className="fa-duotone fa-regular fa-trash text-error text-2xl" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">
                            Confirmation Dialog
                        </h3>
                        <p className="text-sm text-white/40 leading-relaxed mb-8">
                            A focused destructive-action confirmation with clear
                            warning messaging and deliberate call-to-action
                            buttons.
                        </p>
                        <button
                            onClick={() => setShowDelete(true)}
                            className="btn btn-error btn-block font-semibold shadow-lg"
                        >
                            <i className="fa-duotone fa-regular fa-trash" />
                            Delete Job
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateJobModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
            />
            <WizardModal
                open={showWizard}
                onClose={() => setShowWizard(false)}
            />
            <DeleteConfirmModal
                open={showDelete}
                onClose={() => setShowDelete(false)}
            />
        </div>
    );
}
