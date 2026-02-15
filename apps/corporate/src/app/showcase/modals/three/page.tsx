"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

// ── Animation constants (matching landing/three) ─────────────────────────────
const D = { fast: 0.35, normal: 0.6, slow: 0.9 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function animateModalIn(backdrop: HTMLElement, box: HTMLElement) {
    const tl = gsap.timeline({ defaults: { ease: E.precise } });
    tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: D.fast });
    tl.fromTo(
        box,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: D.normal },
        "-=0.2",
    );
    return tl;
}

function animateModalOut(backdrop: HTMLElement, box: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
        const tl = gsap.timeline({
            defaults: { ease: E.mechanical },
            onComplete: resolve,
        });
        tl.to(box, { opacity: 0, y: 30, scale: 0.96, duration: D.fast });
        tl.to(backdrop, { opacity: 0, duration: D.fast }, "-=0.15");
    });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ModalsThreePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Modal visibility
    const [showCreate, setShowCreate] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    // Form state
    const [jobForm, setJobForm] = useState<JobFormData>(emptyJobForm);
    const [jobErrors, setJobErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});

    // Wizard state
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardData, setWizardData] = useState<WizardData>(emptyWizard);

    // Refs for GSAP
    const createBackdropRef = useRef<HTMLDivElement>(null);
    const createBoxRef = useRef<HTMLDivElement>(null);
    const wizardBackdropRef = useRef<HTMLDivElement>(null);
    const wizardBoxRef = useRef<HTMLDivElement>(null);
    const deleteBackdropRef = useRef<HTMLDivElement>(null);
    const deleteBoxRef = useRef<HTMLDivElement>(null);

    // ── Animate in on mount ──────────────────────────────────────────────────
    useEffect(() => {
        if (showCreate && createBackdropRef.current && createBoxRef.current) {
            animateModalIn(createBackdropRef.current, createBoxRef.current);
        }
    }, [showCreate]);

    useEffect(() => {
        if (showWizard && wizardBackdropRef.current && wizardBoxRef.current) {
            animateModalIn(wizardBackdropRef.current, wizardBoxRef.current);
        }
    }, [showWizard]);

    useEffect(() => {
        if (showDelete && deleteBackdropRef.current && deleteBoxRef.current) {
            animateModalIn(deleteBackdropRef.current, deleteBoxRef.current);
        }
    }, [showDelete]);

    // ── Page entry animation ─────────────────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(containerRef.current.querySelectorAll("[data-animate]"), { opacity: 1 });
            return;
        }
        const tl = gsap.timeline({ defaults: { ease: E.precise } });
        tl.fromTo(
            containerRef.current.querySelector(".page-number"),
            { opacity: 0, y: 120, skewY: 8 },
            { opacity: 1, y: 0, skewY: 0, duration: 1.2 },
        );
        tl.fromTo(
            containerRef.current.querySelector(".page-headline"),
            { opacity: 0, x: -80 },
            { opacity: 1, x: 0, duration: D.slow },
            "-=0.7",
        );
        tl.fromTo(
            containerRef.current.querySelector(".page-subtext"),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: D.normal },
            "-=0.4",
        );
        tl.fromTo(
            containerRef.current.querySelector(".page-divider"),
            { scaleX: 0 },
            { scaleX: 1, duration: D.normal, transformOrigin: "left center" },
            "-=0.3",
        );
        tl.fromTo(
            containerRef.current.querySelectorAll(".modal-trigger"),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: D.normal, stagger: 0.12 },
            "-=0.2",
        );
    }, []);

    // ── Close handlers (animated) ────────────────────────────────────────────
    const closeCreate = useCallback(async () => {
        if (createBackdropRef.current && createBoxRef.current) {
            await animateModalOut(createBackdropRef.current, createBoxRef.current);
        }
        setShowCreate(false);
        setJobForm(emptyJobForm);
        setJobErrors({});
    }, []);

    const closeWizard = useCallback(async () => {
        if (wizardBackdropRef.current && wizardBoxRef.current) {
            await animateModalOut(wizardBackdropRef.current, wizardBoxRef.current);
        }
        setShowWizard(false);
        setWizardStep(0);
        setWizardData(emptyWizard);
    }, []);

    const closeDelete = useCallback(async () => {
        if (deleteBackdropRef.current && deleteBoxRef.current) {
            await animateModalOut(deleteBackdropRef.current, deleteBoxRef.current);
        }
        setShowDelete(false);
    }, []);

    // ── Form validation ──────────────────────────────────────────────────────
    const validateJobForm = (): boolean => {
        const errors: Partial<Record<keyof JobFormData, string>> = {};
        if (!jobForm.title.trim()) errors.title = "Title is required";
        if (!jobForm.company.trim()) errors.company = "Company is required";
        if (!jobForm.location.trim()) errors.location = "Location is required";
        if (!jobForm.description.trim()) errors.description = "Description is required";
        setJobErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleJobSubmit = () => {
        if (validateJobForm()) {
            closeCreate();
        }
    };

    // ── Wizard step content ──────────────────────────────────────────────────
    const wizardSteps = [
        { number: "01", title: "Job Details", icon: "fa-duotone fa-regular fa-briefcase" },
        { number: "02", title: "Requirements", icon: "fa-duotone fa-regular fa-list-check" },
        { number: "03", title: "Compensation", icon: "fa-duotone fa-regular fa-money-bill" },
        { number: "04", title: "Review", icon: "fa-duotone fa-regular fa-check-double" },
    ];

    const handleWizardSubmit = () => {
        closeWizard();
    };

    // ── Shared styles ────────────────────────────────────────────────────────
    const inputClass =
        "input w-full bg-base-200/50 border-2 border-base-300 focus:border-neutral focus:outline-none font-medium tracking-wide text-sm transition-colors duration-200";
    const selectClass =
        "select w-full bg-base-200/50 border-2 border-base-300 focus:border-neutral focus:outline-none font-medium tracking-wide text-sm transition-colors duration-200";
    const textareaClass =
        "textarea w-full bg-base-200/50 border-2 border-base-300 focus:border-neutral focus:outline-none font-medium tracking-wide text-sm transition-colors duration-200 resize-none";
    const labelClass = "text-[10px] uppercase tracking-[0.25em] font-bold text-base-content/40 mb-1.5 block";

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            {/* ════════════════════════════════════════════════════════════
                HERO SECTION
               ════════════════════════════════════════════════════════════ */}
            <section className="min-h-[95vh] relative overflow-hidden border-b-2 border-neutral">
                <div className="absolute top-0 left-0 right-0 h-1 bg-neutral" />

                <div className="container mx-auto px-6 lg:px-12 pt-24 pb-16 h-full flex flex-col justify-center">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-end">
                        {/* Oversized number */}
                        <div className="col-span-12 lg:col-span-5">
                            <div className="page-number opacity-0 text-[8rem] sm:text-[12rem] lg:text-[16rem] font-black leading-none tracking-tighter text-neutral select-none">
                                03
                            </div>
                        </div>

                        {/* Content */}
                        <div className="col-span-12 lg:col-span-7 pb-4 lg:pb-8">
                            <div className="page-headline opacity-0">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral/50 mb-4">
                                    Component Library
                                </p>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.9] tracking-tight mb-6">
                                    Modal
                                    <br />
                                    Patterns
                                </h1>
                            </div>

                            <div className="page-subtext opacity-0 max-w-xl">
                                <p className="text-base lg:text-lg text-base-content/60 leading-relaxed mb-8">
                                    Three essential modal patterns for creating, editing,
                                    and confirming destructive actions. Built with precision
                                    and animated with intent.
                                </p>
                            </div>

                            <div
                                className="page-divider h-[2px] bg-neutral mb-10 opacity-100"
                                style={{ transformOrigin: "left center" }}
                            />

                            {/* ── Trigger Buttons ─────────────────────────────── */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Create Job Listing */}
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="modal-trigger opacity-0 group border-2 border-neutral p-6 text-left hover:bg-neutral hover:text-neutral-content transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-base-content/20 group-hover:text-neutral-content/30 transition-colors duration-300">
                                            01
                                        </span>
                                        <i className="fa-duotone fa-regular fa-plus text-lg text-base-content/30 group-hover:text-neutral-content/60 transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-sm font-black tracking-tight mb-1">
                                        Create Job Listing
                                    </h3>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 group-hover:text-neutral-content/50 transition-colors duration-300">
                                        Standard Form Modal
                                    </p>
                                </button>

                                {/* Post a Job (Wizard) */}
                                <button
                                    onClick={() => setShowWizard(true)}
                                    className="modal-trigger opacity-0 group border-2 border-neutral p-6 text-left hover:bg-neutral hover:text-neutral-content transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-base-content/20 group-hover:text-neutral-content/30 transition-colors duration-300">
                                            02
                                        </span>
                                        <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-lg text-base-content/30 group-hover:text-neutral-content/60 transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-sm font-black tracking-tight mb-1">
                                        Post a Job (Wizard)
                                    </h3>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 group-hover:text-neutral-content/50 transition-colors duration-300">
                                        Multi-Step Wizard
                                    </p>
                                </button>

                                {/* Delete Job */}
                                <button
                                    onClick={() => setShowDelete(true)}
                                    className="modal-trigger opacity-0 group border-2 border-error/40 p-6 text-left hover:bg-error hover:text-error-content hover:border-error transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-base-content/20 group-hover:text-error-content/30 transition-colors duration-300">
                                            03
                                        </span>
                                        <i className="fa-duotone fa-regular fa-trash text-lg text-error/40 group-hover:text-error-content/60 transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-sm font-black tracking-tight mb-1">
                                        Delete Job
                                    </h3>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 group-hover:text-error-content/50 transition-colors duration-300">
                                        Confirmation Dialog
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════════
                MODAL 1: CREATE JOB LISTING
               ════════════════════════════════════════════════════════════ */}
            {showCreate && (
                <div
                    ref={createBackdropRef}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-neutral/60" onClick={closeCreate} />

                    {/* Modal box */}
                    <div
                        ref={createBoxRef}
                        className="relative bg-base-100 border-2 border-neutral w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        style={{ opacity: 0 }}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-base-100 border-b-2 border-neutral p-6 flex items-start justify-between z-10">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-black tracking-tighter text-neutral/10">
                                    01
                                </span>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/40">
                                        New Entry
                                    </p>
                                    <h2 className="text-xl font-black tracking-tight">
                                        Create Job Listing
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={closeCreate}
                                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content"
                            >
                                <i className="fa-duotone fa-regular fa-xmark text-lg" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-5">
                            {/* Title */}
                            <fieldset>
                                <label className={labelClass}>Job Title</label>
                                <input
                                    type="text"
                                    placeholder="Senior Software Engineer"
                                    className={`${inputClass} ${jobErrors.title ? "border-error" : ""}`}
                                    value={jobForm.title}
                                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                />
                                {jobErrors.title && (
                                    <p className="text-error text-xs mt-1 tracking-wide">{jobErrors.title}</p>
                                )}
                            </fieldset>

                            {/* Company + Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <fieldset>
                                    <label className={labelClass}>Company</label>
                                    <input
                                        type="text"
                                        placeholder="Acme Corp"
                                        className={`${inputClass} ${jobErrors.company ? "border-error" : ""}`}
                                        value={jobForm.company}
                                        onChange={(e) =>
                                            setJobForm({ ...jobForm, company: e.target.value })
                                        }
                                    />
                                    {jobErrors.company && (
                                        <p className="text-error text-xs mt-1 tracking-wide">
                                            {jobErrors.company}
                                        </p>
                                    )}
                                </fieldset>
                                <fieldset>
                                    <label className={labelClass}>Location</label>
                                    <input
                                        type="text"
                                        placeholder="San Francisco, CA"
                                        className={`${inputClass} ${jobErrors.location ? "border-error" : ""}`}
                                        value={jobForm.location}
                                        onChange={(e) =>
                                            setJobForm({ ...jobForm, location: e.target.value })
                                        }
                                    />
                                    {jobErrors.location && (
                                        <p className="text-error text-xs mt-1 tracking-wide">
                                            {jobErrors.location}
                                        </p>
                                    )}
                                </fieldset>
                            </div>

                            {/* Salary Range + Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <fieldset>
                                    <label className={labelClass}>Salary Min</label>
                                    <input
                                        type="text"
                                        placeholder="$120,000"
                                        className={inputClass}
                                        value={jobForm.salaryMin}
                                        onChange={(e) =>
                                            setJobForm({ ...jobForm, salaryMin: e.target.value })
                                        }
                                    />
                                </fieldset>
                                <fieldset>
                                    <label className={labelClass}>Salary Max</label>
                                    <input
                                        type="text"
                                        placeholder="$180,000"
                                        className={inputClass}
                                        value={jobForm.salaryMax}
                                        onChange={(e) =>
                                            setJobForm({ ...jobForm, salaryMax: e.target.value })
                                        }
                                    />
                                </fieldset>
                                <fieldset>
                                    <label className={labelClass}>Type</label>
                                    <select
                                        className={selectClass}
                                        value={jobForm.type}
                                        onChange={(e) =>
                                            setJobForm({ ...jobForm, type: e.target.value })
                                        }
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
                                <label className={labelClass}>Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Describe the role, responsibilities, and team..."
                                    className={`${textareaClass} ${jobErrors.description ? "border-error" : ""}`}
                                    value={jobForm.description}
                                    onChange={(e) =>
                                        setJobForm({ ...jobForm, description: e.target.value })
                                    }
                                />
                                {jobErrors.description && (
                                    <p className="text-error text-xs mt-1 tracking-wide">
                                        {jobErrors.description}
                                    </p>
                                )}
                            </fieldset>

                            {/* Requirements */}
                            <fieldset>
                                <label className={labelClass}>Requirements</label>
                                <textarea
                                    rows={4}
                                    placeholder="List required skills, experience, and qualifications..."
                                    className={textareaClass}
                                    value={jobForm.requirements}
                                    onChange={(e) =>
                                        setJobForm({ ...jobForm, requirements: e.target.value })
                                    }
                                />
                            </fieldset>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-base-100 border-t-2 border-neutral p-6 flex items-center justify-between">
                            <button
                                onClick={closeCreate}
                                className="btn btn-ghost font-bold tracking-wide text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleJobSubmit}
                                className="btn btn-neutral font-bold tracking-wide text-sm"
                            >
                                <i className="fa-duotone fa-regular fa-check mr-2" />
                                Create Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                MODAL 2: MULTI-STEP WIZARD
               ════════════════════════════════════════════════════════════ */}
            {showWizard && (
                <div
                    ref={wizardBackdropRef}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-neutral/60" onClick={closeWizard} />

                    <div
                        ref={wizardBoxRef}
                        className="relative bg-base-100 border-2 border-neutral w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        style={{ opacity: 0 }}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-base-100 border-b-2 border-neutral z-10">
                            <div className="p-6 flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl font-black tracking-tighter text-neutral/10">
                                        02
                                    </span>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/40">
                                            Step {wizardStep + 1} of {wizardSteps.length}
                                        </p>
                                        <h2 className="text-xl font-black tracking-tight">
                                            {wizardSteps[wizardStep].title}
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={closeWizard}
                                    className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark text-lg" />
                                </button>
                            </div>

                            {/* Progress indicator */}
                            <div className="flex">
                                {wizardSteps.map((step, i) => (
                                    <div key={i} className="flex-1 relative">
                                        <div
                                            className={`h-[3px] transition-colors duration-300 ${
                                                i <= wizardStep ? "bg-neutral" : "bg-base-300"
                                            }`}
                                        />
                                        <div className="flex items-center gap-2 px-3 py-2">
                                            <i
                                                className={`${step.icon} text-xs ${
                                                    i <= wizardStep
                                                        ? "text-neutral"
                                                        : "text-base-content/20"
                                                } transition-colors duration-300`}
                                            />
                                            <span
                                                className={`text-[9px] uppercase tracking-[0.2em] font-bold hidden sm:inline ${
                                                    i <= wizardStep
                                                        ? "text-base-content"
                                                        : "text-base-content/30"
                                                } transition-colors duration-300`}
                                            >
                                                {step.title}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="p-6 space-y-5">
                            {/* Step 1: Job Details */}
                            {wizardStep === 0 && (
                                <>
                                    <fieldset>
                                        <label className={labelClass}>Job Title</label>
                                        <input
                                            type="text"
                                            placeholder="Senior Software Engineer"
                                            className={inputClass}
                                            value={wizardData.title}
                                            onChange={(e) =>
                                                setWizardData({ ...wizardData, title: e.target.value })
                                            }
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className={labelClass}>Company</label>
                                        <input
                                            type="text"
                                            placeholder="Acme Corp"
                                            className={inputClass}
                                            value={wizardData.company}
                                            onChange={(e) =>
                                                setWizardData({ ...wizardData, company: e.target.value })
                                            }
                                        />
                                    </fieldset>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <fieldset>
                                            <label className={labelClass}>Location</label>
                                            <input
                                                type="text"
                                                placeholder="San Francisco, CA"
                                                className={inputClass}
                                                value={wizardData.location}
                                                onChange={(e) =>
                                                    setWizardData({
                                                        ...wizardData,
                                                        location: e.target.value,
                                                    })
                                                }
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <label className={labelClass}>Employment Type</label>
                                            <select
                                                className={selectClass}
                                                value={wizardData.type}
                                                onChange={(e) =>
                                                    setWizardData({
                                                        ...wizardData,
                                                        type: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="full-time">Full-time</option>
                                                <option value="part-time">Part-time</option>
                                                <option value="contract">Contract</option>
                                                <option value="freelance">Freelance</option>
                                            </select>
                                        </fieldset>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Requirements */}
                            {wizardStep === 1 && (
                                <>
                                    <fieldset>
                                        <label className={labelClass}>Experience Level</label>
                                        <select
                                            className={selectClass}
                                            value={wizardData.experienceLevel}
                                            onChange={(e) =>
                                                setWizardData({
                                                    ...wizardData,
                                                    experienceLevel: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="entry">Entry Level</option>
                                            <option value="mid">Mid Level</option>
                                            <option value="senior">Senior Level</option>
                                            <option value="lead">Lead / Principal</option>
                                            <option value="executive">Executive</option>
                                        </select>
                                    </fieldset>
                                    <fieldset>
                                        <label className={labelClass}>Required Skills</label>
                                        <input
                                            type="text"
                                            placeholder="React, TypeScript, Node.js, PostgreSQL"
                                            className={inputClass}
                                            value={wizardData.skills}
                                            onChange={(e) =>
                                                setWizardData({
                                                    ...wizardData,
                                                    skills: e.target.value,
                                                })
                                            }
                                        />
                                        <p className="text-[10px] text-base-content/30 mt-1 tracking-wide">
                                            Separate skills with commas
                                        </p>
                                    </fieldset>
                                    <fieldset>
                                        <label className={labelClass}>Job Description</label>
                                        <textarea
                                            rows={6}
                                            placeholder="Describe the role, daily responsibilities, team structure, and growth opportunities..."
                                            className={textareaClass}
                                            value={wizardData.description}
                                            onChange={(e) =>
                                                setWizardData({
                                                    ...wizardData,
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </fieldset>
                                </>
                            )}

                            {/* Step 3: Compensation */}
                            {wizardStep === 2 && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <fieldset>
                                            <label className={labelClass}>Salary Min</label>
                                            <input
                                                type="text"
                                                placeholder="$120,000"
                                                className={inputClass}
                                                value={wizardData.salaryMin}
                                                onChange={(e) =>
                                                    setWizardData({
                                                        ...wizardData,
                                                        salaryMin: e.target.value,
                                                    })
                                                }
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <label className={labelClass}>Salary Max</label>
                                            <input
                                                type="text"
                                                placeholder="$180,000"
                                                className={inputClass}
                                                value={wizardData.salaryMax}
                                                onChange={(e) =>
                                                    setWizardData({
                                                        ...wizardData,
                                                        salaryMax: e.target.value,
                                                    })
                                                }
                                            />
                                        </fieldset>
                                    </div>
                                    <fieldset>
                                        <label className={labelClass}>Equity</label>
                                        <input
                                            type="text"
                                            placeholder="0.5% - 1.0%"
                                            className={inputClass}
                                            value={wizardData.equity}
                                            onChange={(e) =>
                                                setWizardData({
                                                    ...wizardData,
                                                    equity: e.target.value,
                                                })
                                            }
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label className={labelClass}>Benefits</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Health insurance, 401k match, unlimited PTO, remote flexibility..."
                                            className={textareaClass}
                                            value={wizardData.benefits}
                                            onChange={(e) =>
                                                setWizardData({
                                                    ...wizardData,
                                                    benefits: e.target.value,
                                                })
                                            }
                                        />
                                    </fieldset>
                                </>
                            )}

                            {/* Step 4: Review */}
                            {wizardStep === 3 && (
                                <div className="space-y-6">
                                    <div className="border-2 border-base-300 divide-y-2 divide-base-300">
                                        {/* Job Details */}
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <i className="fa-duotone fa-regular fa-briefcase text-xs text-base-content/30" />
                                                <span className={labelClass + " mb-0"}>
                                                    Job Details
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider">
                                                        Title
                                                    </p>
                                                    <p className="text-sm font-bold tracking-tight">
                                                        {wizardData.title || "---"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider">
                                                        Company
                                                    </p>
                                                    <p className="text-sm font-bold tracking-tight">
                                                        {wizardData.company || "---"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider">
                                                        Location
                                                    </p>
                                                    <p className="text-sm font-bold tracking-tight">
                                                        {wizardData.location || "---"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider">
                                                        Type
                                                    </p>
                                                    <p className="text-sm font-bold tracking-tight capitalize">
                                                        {wizardData.type}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Requirements */}
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <i className="fa-duotone fa-regular fa-list-check text-xs text-base-content/30" />
                                                <span className={labelClass + " mb-0"}>
                                                    Requirements
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider">
                                                        Experience
                                                    </p>
                                                    <p className="text-sm font-bold tracking-tight capitalize">
                                                        {wizardData.experienceLevel}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider">
                                                        Skills
                                                    </p>
                                                    <p className="text-sm font-bold tracking-tight">
                                                        {wizardData.skills || "---"}
                                                    </p>
                                                </div>
                                            </div>
                                            {wizardData.description && (
                                                <div className="mt-3">
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mb-1">
                                                        Description
                                                    </p>
                                                    <p className="text-sm text-base-content/60 leading-relaxed">
                                                        {wizardData.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Compensation */}
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <i className="fa-duotone fa-regular fa-money-bill text-xs text-base-content/30" />
                                                <span className={labelClass + " mb-0"}>
                                                    Compensation
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider">
                                                        Salary Range
                                                    </p>
                                                    <p className="text-sm font-bold tracking-tight">
                                                        {wizardData.salaryMin && wizardData.salaryMax
                                                            ? `${wizardData.salaryMin} - ${wizardData.salaryMax}`
                                                            : "---"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider">
                                                        Equity
                                                    </p>
                                                    <p className="text-sm font-bold tracking-tight">
                                                        {wizardData.equity || "---"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider">
                                                        Benefits
                                                    </p>
                                                    <p className="text-sm font-bold tracking-tight">
                                                        {wizardData.benefits ? "Included" : "---"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-base-100 border-t-2 border-neutral p-6 flex items-center justify-between">
                            <div>
                                {wizardStep === 0 ? (
                                    <button
                                        onClick={closeWizard}
                                        className="btn btn-ghost font-bold tracking-wide text-sm"
                                    >
                                        Cancel
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setWizardStep((s) => s - 1)}
                                        className="btn btn-ghost font-bold tracking-wide text-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-left mr-2" />
                                        Back
                                    </button>
                                )}
                            </div>
                            <div>
                                {wizardStep < wizardSteps.length - 1 ? (
                                    <button
                                        onClick={() => setWizardStep((s) => s + 1)}
                                        className="btn btn-neutral font-bold tracking-wide text-sm"
                                    >
                                        Next
                                        <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleWizardSubmit}
                                        className="btn btn-neutral font-bold tracking-wide text-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-check mr-2" />
                                        Submit Job
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                MODAL 3: DELETE CONFIRMATION
               ════════════════════════════════════════════════════════════ */}
            {showDelete && (
                <div
                    ref={deleteBackdropRef}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-neutral/60" onClick={closeDelete} />

                    <div
                        ref={deleteBoxRef}
                        className="relative bg-base-100 border-2 border-error/30 w-full max-w-md"
                        style={{ opacity: 0 }}
                    >
                        {/* Header */}
                        <div className="border-b-2 border-error/10 p-6 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-black tracking-tighter text-error/10">
                                    03
                                </span>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-error/50">
                                        Destructive Action
                                    </p>
                                    <h2 className="text-xl font-black tracking-tight text-error">
                                        Delete Job
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={closeDelete}
                                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content"
                            >
                                <i className="fa-duotone fa-regular fa-xmark text-lg" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 flex items-center justify-center border-2 border-error/20 flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-xl text-error/60" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold tracking-tight mb-2">
                                        Are you sure you want to delete this job listing?
                                    </p>
                                    <p className="text-sm text-base-content/50 leading-relaxed">
                                        This will permanently remove the listing
                                        &ldquo;Senior Software Engineer&rdquo; and all
                                        associated applications. This action cannot be
                                        undone.
                                    </p>
                                </div>
                            </div>

                            {/* Warning box */}
                            <div className="border-2 border-error/10 bg-error/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <i className="fa-duotone fa-regular fa-circle-info text-xs text-error/40" />
                                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-error/40">
                                        Impact
                                    </span>
                                </div>
                                <ul className="space-y-1.5">
                                    {[
                                        "12 active applications will be rejected",
                                        "3 recruiters will be unassigned",
                                        "All candidate submissions will be archived",
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-sm text-base-content/50"
                                        >
                                            <span className="text-error/30 text-xs mt-0.5 font-mono">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t-2 border-error/10 p-6 flex items-center justify-between">
                            <button
                                onClick={closeDelete}
                                className="btn btn-ghost font-bold tracking-wide text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={closeDelete}
                                className="btn bg-error hover:bg-error/80 text-error-content border-0 font-bold tracking-wide text-sm"
                            >
                                <i className="fa-duotone fa-regular fa-trash mr-2" />
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
