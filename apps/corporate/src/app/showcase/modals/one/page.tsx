"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

/* ─── Types ───────────────────────────────────────────────────────────────── */

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

const jobTypes = [
    { value: "full-time", label: "Full-Time" },
    { value: "part-time", label: "Part-Time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
];

const experienceLevels = [
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior" },
    { value: "lead", label: "Lead / Principal" },
    { value: "executive", label: "Executive" },
];

/* ─── Animation helpers ───────────────────────────────────────────────────── */

function animateModalOpen(
    backdropEl: HTMLElement | null,
    boxEl: HTMLElement | null,
) {
    if (!backdropEl || !boxEl) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    tl.fromTo(
        boxEl,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4 },
        "-=0.15",
    );
}

function animateModalClose(
    backdropEl: HTMLElement | null,
    boxEl: HTMLElement | null,
    onComplete: () => void,
) {
    if (!backdropEl || !boxEl) {
        onComplete();
        return;
    }
    const tl = gsap.timeline({
        defaults: { ease: "power2.in" },
        onComplete,
    });
    tl.to(boxEl, { opacity: 0, y: 30, scale: 0.97, duration: 0.25 });
    tl.to(backdropEl, { opacity: 0, duration: 0.2 }, "-=0.1");
}

/* ─── Page Component ──────────────────────────────────────────────────────── */

export default function ModalsOne() {
    /* ── Standard modal state ── */
    const [showStandard, setShowStandard] = useState(false);
    const [standardForm, setStandardForm] = useState<JobFormData>(emptyJobForm);
    const [standardErrors, setStandardErrors] = useState<
        Partial<Record<keyof JobFormData, string>>
    >({});
    const [standardSubmitted, setStandardSubmitted] = useState(false);
    const standardBackdropRef = useRef<HTMLDivElement>(null);
    const standardBoxRef = useRef<HTMLDivElement>(null);

    /* ── Wizard modal state ── */
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardData, setWizardData] = useState<WizardData>(emptyWizard);
    const [wizardSubmitted, setWizardSubmitted] = useState(false);
    const wizardBackdropRef = useRef<HTMLDivElement>(null);
    const wizardBoxRef = useRef<HTMLDivElement>(null);
    const wizardStepRef = useRef<HTMLDivElement>(null);

    /* ── Confirmation modal state ── */
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmDeleted, setConfirmDeleted] = useState(false);
    const confirmBackdropRef = useRef<HTMLDivElement>(null);
    const confirmBoxRef = useRef<HTMLDivElement>(null);

    /* ── Page entry animation ── */
    const pageRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!pageRef.current) return;
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReducedMotion) return;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
            pageRef.current.querySelector(".page-kicker"),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
        );
        tl.fromTo(
            pageRef.current.querySelectorAll(".page-headline-word"),
            { opacity: 0, y: 80, rotateX: 40 },
            { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.12 },
            "-=0.3",
        );
        tl.fromTo(
            pageRef.current.querySelector(".page-body"),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7 },
            "-=0.5",
        );
        tl.fromTo(
            pageRef.current.querySelectorAll(".modal-trigger"),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
            "-=0.3",
        );
    }, []);

    /* ── Modal open animations ── */
    useEffect(() => {
        if (showStandard) {
            animateModalOpen(
                standardBackdropRef.current,
                standardBoxRef.current,
            );
        }
    }, [showStandard]);

    useEffect(() => {
        if (showWizard) {
            animateModalOpen(wizardBackdropRef.current, wizardBoxRef.current);
        }
    }, [showWizard]);

    useEffect(() => {
        if (showConfirm) {
            animateModalOpen(confirmBackdropRef.current, confirmBoxRef.current);
        }
    }, [showConfirm]);

    /* ── Wizard step transition ── */
    useEffect(() => {
        if (showWizard && wizardStepRef.current) {
            gsap.fromTo(
                wizardStepRef.current,
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
            );
        }
    }, [wizardStep, showWizard]);

    /* ── Standard modal handlers ── */
    const openStandard = useCallback(() => {
        setStandardForm(emptyJobForm);
        setStandardErrors({});
        setStandardSubmitted(false);
        setShowStandard(true);
    }, []);

    const closeStandard = useCallback(() => {
        animateModalClose(
            standardBackdropRef.current,
            standardBoxRef.current,
            () => setShowStandard(false),
        );
    }, []);

    const validateStandard = useCallback((): boolean => {
        const errors: Partial<Record<keyof JobFormData, string>> = {};
        if (!standardForm.title.trim()) errors.title = "Title is required";
        if (!standardForm.company.trim())
            errors.company = "Company is required";
        if (!standardForm.location.trim())
            errors.location = "Location is required";
        if (!standardForm.description.trim())
            errors.description = "Description is required";
        setStandardErrors(errors);
        return Object.keys(errors).length === 0;
    }, [standardForm]);

    const submitStandard = useCallback(() => {
        if (!validateStandard()) return;
        setStandardSubmitted(true);
    }, [validateStandard]);

    /* ── Wizard modal handlers ── */
    const openWizard = useCallback(() => {
        setWizardData(emptyWizard);
        setWizardStep(0);
        setWizardSubmitted(false);
        setShowWizard(true);
    }, []);

    const closeWizard = useCallback(() => {
        animateModalClose(wizardBackdropRef.current, wizardBoxRef.current, () =>
            setShowWizard(false),
        );
    }, []);

    const wizardNext = useCallback(() => {
        setWizardStep((s) => Math.min(s + 1, 3));
    }, []);

    const wizardBack = useCallback(() => {
        setWizardStep((s) => Math.max(s - 1, 0));
    }, []);

    const submitWizard = useCallback(() => {
        setWizardSubmitted(true);
    }, []);

    /* ── Confirm modal handlers ── */
    const openConfirm = useCallback(() => {
        setConfirmDeleted(false);
        setShowConfirm(true);
    }, []);

    const closeConfirm = useCallback(() => {
        animateModalClose(
            confirmBackdropRef.current,
            confirmBoxRef.current,
            () => setShowConfirm(false),
        );
    }, []);

    const confirmDelete = useCallback(() => {
        setConfirmDeleted(true);
    }, []);

    /* ── Wizard step labels ── */
    const wizardSteps = [
        "Job Details",
        "Requirements",
        "Compensation",
        "Review",
    ];

    return (
        <section ref={pageRef} className="min-h-screen bg-base-100">
            {/* ═══════════════════════════════════════════════════════
                HERO — Split-screen editorial header
               ═══════════════════════════════════════════════════════ */}
            <div className="py-28 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="page-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            Component Showcase
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="page-headline-word inline-block opacity-0">
                                Modal
                            </span>{" "}
                            <span className="page-headline-word inline-block opacity-0 text-primary">
                                patterns
                            </span>{" "}
                            <span className="page-headline-word inline-block opacity-0">
                                that
                            </span>{" "}
                            <span className="page-headline-word inline-block opacity-0">
                                work.
                            </span>
                        </h1>

                        <p className="page-body text-lg md:text-xl text-neutral-content/70 leading-relaxed max-w-xl mb-10 opacity-0">
                            Standard forms, multi-step wizards, and confirmation
                            dialogs. Built with DaisyUI, animated with GSAP, and
                            designed for the real world.
                        </p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                TRIGGER BUTTONS
               ═══════════════════════════════════════════════════════ */}
            <div className="py-20 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Standard Modal Card */}
                        <div className="modal-trigger border-t-4 border-coral bg-base-100 p-8 opacity-0">
                            <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mb-5">
                                <i className="fa-duotone fa-regular fa-file-lines text-2xl text-primary"></i>
                            </div>
                            <h3 className="text-xl font-black mb-2">
                                Standard Form
                            </h3>
                            <p className="text-sm text-base-content/60 leading-relaxed mb-6">
                                A classic modal form with field validation,
                                structured layout, and clear submit/cancel
                                actions.
                            </p>
                            <button
                                onClick={openStandard}
                                className="btn btn-primary w-full"
                            >
                                <i className="fa-duotone fa-regular fa-plus"></i>
                                Create Job Listing
                            </button>
                        </div>

                        {/* Wizard Modal Card */}
                        <div className="modal-trigger border-t-4 border-secondary bg-base-100 p-8 opacity-0">
                            <div className="w-14 h-14 bg-secondary/10 flex items-center justify-center mb-5">
                                <i className="fa-duotone fa-regular fa-hat-wizard text-2xl text-secondary"></i>
                            </div>
                            <h3 className="text-xl font-black mb-2">
                                Multi-Step Wizard
                            </h3>
                            <p className="text-sm text-base-content/60 leading-relaxed mb-6">
                                A guided wizard that breaks complex input across
                                four steps with progress tracking and review.
                            </p>
                            <button
                                onClick={openWizard}
                                className="btn btn-secondary w-full"
                            >
                                <i className="fa-duotone fa-regular fa-wand-magic-sparkles"></i>
                                Post a Job (Wizard)
                            </button>
                        </div>

                        {/* Confirm Modal Card */}
                        <div className="modal-trigger border-t-4 border-error bg-base-100 p-8 opacity-0">
                            <div className="w-14 h-14 bg-error/10 flex items-center justify-center mb-5">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-2xl text-error"></i>
                            </div>
                            <h3 className="text-xl font-black mb-2">
                                Confirmation Dialog
                            </h3>
                            <p className="text-sm text-base-content/60 leading-relaxed mb-6">
                                A destructive action confirmation with clear
                                warning messaging and deliberate confirm/cancel
                                flow.
                            </p>
                            <button
                                onClick={openConfirm}
                                className="btn btn-error w-full"
                            >
                                <i className="fa-duotone fa-regular fa-trash"></i>
                                Delete Job
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                STANDARD MODAL
               ═══════════════════════════════════════════════════════ */}
            {showStandard && (
                <div className="modal modal-open" role="dialog">
                    <div
                        ref={standardBackdropRef}
                        className="modal-backdrop bg-neutral/60"
                        onClick={closeStandard}
                    ></div>
                    <div
                        ref={standardBoxRef}
                        className="modal-box max-w-2xl bg-base-100 p-0 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-neutral text-neutral-content px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-briefcase text-primary-content"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black">
                                            Create Job Listing
                                        </h3>
                                        <p className="text-xs text-neutral-content/60 uppercase tracking-wider">
                                            New Position
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeStandard}
                                    className="btn btn-ghost btn-sm btn-circle text-neutral-content/60 hover:text-neutral-content"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark text-lg"></i>
                                </button>
                            </div>
                        </div>

                        {standardSubmitted ? (
                            /* Success state */
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-success/10 flex items-center justify-center mx-auto mb-5">
                                    <i className="fa-duotone fa-regular fa-check text-3xl text-success"></i>
                                </div>
                                <h4 className="text-xl font-black mb-2">
                                    Job Created
                                </h4>
                                <p className="text-base-content/60 mb-8">
                                    &ldquo;{standardForm.title}&rdquo; at{" "}
                                    {standardForm.company} has been posted
                                    successfully.
                                </p>
                                <button
                                    onClick={closeStandard}
                                    className="btn btn-primary"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            /* Form */
                            <div className="p-8">
                                <div className="grid grid-cols-2 gap-5 mb-5">
                                    <fieldset className="col-span-2 sm:col-span-1">
                                        <label className="label">
                                            <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                Job Title
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Senior Software Engineer"
                                            className={`input input-bordered w-full ${standardErrors.title ? "input-error" : ""}`}
                                            value={standardForm.title}
                                            onChange={(e) =>
                                                setStandardForm((f) => ({
                                                    ...f,
                                                    title: e.target.value,
                                                }))
                                            }
                                        />
                                        {standardErrors.title && (
                                            <p className="text-error text-xs mt-1">
                                                {standardErrors.title}
                                            </p>
                                        )}
                                    </fieldset>

                                    <fieldset className="col-span-2 sm:col-span-1">
                                        <label className="label">
                                            <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                Company
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Acme Corp"
                                            className={`input input-bordered w-full ${standardErrors.company ? "input-error" : ""}`}
                                            value={standardForm.company}
                                            onChange={(e) =>
                                                setStandardForm((f) => ({
                                                    ...f,
                                                    company: e.target.value,
                                                }))
                                            }
                                        />
                                        {standardErrors.company && (
                                            <p className="text-error text-xs mt-1">
                                                {standardErrors.company}
                                            </p>
                                        )}
                                    </fieldset>
                                </div>

                                <div className="grid grid-cols-2 gap-5 mb-5">
                                    <fieldset>
                                        <label className="label">
                                            <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                Location
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. San Francisco, CA"
                                            className={`input input-bordered w-full ${standardErrors.location ? "input-error" : ""}`}
                                            value={standardForm.location}
                                            onChange={(e) =>
                                                setStandardForm((f) => ({
                                                    ...f,
                                                    location: e.target.value,
                                                }))
                                            }
                                        />
                                        {standardErrors.location && (
                                            <p className="text-error text-xs mt-1">
                                                {standardErrors.location}
                                            </p>
                                        )}
                                    </fieldset>

                                    <fieldset>
                                        <label className="label">
                                            <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                Type
                                            </span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full"
                                            value={standardForm.type}
                                            onChange={(e) =>
                                                setStandardForm((f) => ({
                                                    ...f,
                                                    type: e.target.value,
                                                }))
                                            }
                                        >
                                            {jobTypes.map((t) => (
                                                <option
                                                    key={t.value}
                                                    value={t.value}
                                                >
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </fieldset>
                                </div>

                                <div className="grid grid-cols-2 gap-5 mb-5">
                                    <fieldset>
                                        <label className="label">
                                            <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                Salary Min
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="$80,000"
                                            className="input input-bordered w-full"
                                            value={standardForm.salaryMin}
                                            onChange={(e) =>
                                                setStandardForm((f) => ({
                                                    ...f,
                                                    salaryMin: e.target.value,
                                                }))
                                            }
                                        />
                                    </fieldset>

                                    <fieldset>
                                        <label className="label">
                                            <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                Salary Max
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="$150,000"
                                            className="input input-bordered w-full"
                                            value={standardForm.salaryMax}
                                            onChange={(e) =>
                                                setStandardForm((f) => ({
                                                    ...f,
                                                    salaryMax: e.target.value,
                                                }))
                                            }
                                        />
                                    </fieldset>
                                </div>

                                <fieldset className="mb-5">
                                    <label className="label">
                                        <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                            Description
                                        </span>
                                    </label>
                                    <textarea
                                        className={`textarea textarea-bordered w-full h-24 ${standardErrors.description ? "textarea-error" : ""}`}
                                        placeholder="Describe the role, responsibilities, and what makes it exciting..."
                                        value={standardForm.description}
                                        onChange={(e) =>
                                            setStandardForm((f) => ({
                                                ...f,
                                                description: e.target.value,
                                            }))
                                        }
                                    ></textarea>
                                    {standardErrors.description && (
                                        <p className="text-error text-xs mt-1">
                                            {standardErrors.description}
                                        </p>
                                    )}
                                </fieldset>

                                <fieldset className="mb-8">
                                    <label className="label">
                                        <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                            Requirements
                                        </span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered w-full h-24"
                                        placeholder="List key requirements, qualifications, and nice-to-haves..."
                                        value={standardForm.requirements}
                                        onChange={(e) =>
                                            setStandardForm((f) => ({
                                                ...f,
                                                requirements: e.target.value,
                                            }))
                                        }
                                    ></textarea>
                                </fieldset>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 border-t border-base-200 pt-6">
                                    <button
                                        onClick={closeStandard}
                                        className="btn btn-ghost"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitStandard}
                                        className="btn btn-primary"
                                    >
                                        <i className="fa-duotone fa-regular fa-check"></i>
                                        Create Job
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                WIZARD MODAL
               ═══════════════════════════════════════════════════════ */}
            {showWizard && (
                <div className="modal modal-open" role="dialog">
                    <div
                        ref={wizardBackdropRef}
                        className="modal-backdrop bg-neutral/60"
                        onClick={closeWizard}
                    ></div>
                    <div
                        ref={wizardBoxRef}
                        className="modal-box max-w-2xl bg-base-100 p-0 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-neutral text-neutral-content px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-secondary-content"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black">
                                            Post a Job
                                        </h3>
                                        <p className="text-xs text-neutral-content/60 uppercase tracking-wider">
                                            Step {wizardStep + 1} of 4 &mdash;{" "}
                                            {wizardSteps[wizardStep]}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeWizard}
                                    className="btn btn-ghost btn-sm btn-circle text-neutral-content/60 hover:text-neutral-content"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div className="flex gap-2 mt-5">
                                {wizardSteps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 transition-colors duration-300 ${
                                            i <= wizardStep
                                                ? "bg-secondary"
                                                : "bg-neutral-content/20"
                                        }`}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {wizardSubmitted ? (
                            /* Success */
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-success/10 flex items-center justify-center mx-auto mb-5">
                                    <i className="fa-duotone fa-regular fa-party-horn text-3xl text-success"></i>
                                </div>
                                <h4 className="text-xl font-black mb-2">
                                    Job Posted
                                </h4>
                                <p className="text-base-content/60 mb-8">
                                    &ldquo;{wizardData.title}&rdquo; has been
                                    published and is now visible to recruiters.
                                </p>
                                <button
                                    onClick={closeWizard}
                                    className="btn btn-secondary"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="p-8">
                                {/* Step content */}
                                <div
                                    ref={wizardStepRef}
                                    className="min-h-[280px]"
                                >
                                    {/* Step 1: Job Details */}
                                    {wizardStep === 0 && (
                                        <div className="space-y-5">
                                            <fieldset>
                                                <label className="label">
                                                    <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                        Job Title
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Senior Software Engineer"
                                                    className="input input-bordered w-full"
                                                    value={wizardData.title}
                                                    onChange={(e) =>
                                                        setWizardData((d) => ({
                                                            ...d,
                                                            title: e.target
                                                                .value,
                                                        }))
                                                    }
                                                />
                                            </fieldset>
                                            <fieldset>
                                                <label className="label">
                                                    <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                        Company
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Acme Corp"
                                                    className="input input-bordered w-full"
                                                    value={wizardData.company}
                                                    onChange={(e) =>
                                                        setWizardData((d) => ({
                                                            ...d,
                                                            company:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                            </fieldset>
                                            <div className="grid grid-cols-2 gap-5">
                                                <fieldset>
                                                    <label className="label">
                                                        <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                            Location
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Remote"
                                                        className="input input-bordered w-full"
                                                        value={
                                                            wizardData.location
                                                        }
                                                        onChange={(e) =>
                                                            setWizardData(
                                                                (d) => ({
                                                                    ...d,
                                                                    location:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </fieldset>
                                                <fieldset>
                                                    <label className="label">
                                                        <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                            Type
                                                        </span>
                                                    </label>
                                                    <select
                                                        className="select select-bordered w-full"
                                                        value={wizardData.type}
                                                        onChange={(e) =>
                                                            setWizardData(
                                                                (d) => ({
                                                                    ...d,
                                                                    type: e
                                                                        .target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        {jobTypes.map((t) => (
                                                            <option
                                                                key={t.value}
                                                                value={t.value}
                                                            >
                                                                {t.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </fieldset>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Requirements */}
                                    {wizardStep === 1 && (
                                        <div className="space-y-5">
                                            <fieldset>
                                                <label className="label">
                                                    <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                        Experience Level
                                                    </span>
                                                </label>
                                                <select
                                                    className="select select-bordered w-full"
                                                    value={
                                                        wizardData.experienceLevel
                                                    }
                                                    onChange={(e) =>
                                                        setWizardData((d) => ({
                                                            ...d,
                                                            experienceLevel:
                                                                e.target.value,
                                                        }))
                                                    }
                                                >
                                                    {experienceLevels.map(
                                                        (l) => (
                                                            <option
                                                                key={l.value}
                                                                value={l.value}
                                                            >
                                                                {l.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </fieldset>
                                            <fieldset>
                                                <label className="label">
                                                    <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                        Skills
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. React, TypeScript, Node.js"
                                                    className="input input-bordered w-full"
                                                    value={wizardData.skills}
                                                    onChange={(e) =>
                                                        setWizardData((d) => ({
                                                            ...d,
                                                            skills: e.target
                                                                .value,
                                                        }))
                                                    }
                                                />
                                            </fieldset>
                                            <fieldset>
                                                <label className="label">
                                                    <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                        Description
                                                    </span>
                                                </label>
                                                <textarea
                                                    className="textarea textarea-bordered w-full h-32"
                                                    placeholder="Describe the ideal candidate and key responsibilities..."
                                                    value={
                                                        wizardData.description
                                                    }
                                                    onChange={(e) =>
                                                        setWizardData((d) => ({
                                                            ...d,
                                                            description:
                                                                e.target.value,
                                                        }))
                                                    }
                                                ></textarea>
                                            </fieldset>
                                        </div>
                                    )}

                                    {/* Step 3: Compensation */}
                                    {wizardStep === 2 && (
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-2 gap-5">
                                                <fieldset>
                                                    <label className="label">
                                                        <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                            Salary Min
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="$80,000"
                                                        className="input input-bordered w-full"
                                                        value={
                                                            wizardData.salaryMin
                                                        }
                                                        onChange={(e) =>
                                                            setWizardData(
                                                                (d) => ({
                                                                    ...d,
                                                                    salaryMin:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </fieldset>
                                                <fieldset>
                                                    <label className="label">
                                                        <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                            Salary Max
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="$150,000"
                                                        className="input input-bordered w-full"
                                                        value={
                                                            wizardData.salaryMax
                                                        }
                                                        onChange={(e) =>
                                                            setWizardData(
                                                                (d) => ({
                                                                    ...d,
                                                                    salaryMax:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </fieldset>
                                            </div>
                                            <fieldset>
                                                <label className="label">
                                                    <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                        Equity
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 0.1% - 0.5%"
                                                    className="input input-bordered w-full"
                                                    value={wizardData.equity}
                                                    onChange={(e) =>
                                                        setWizardData((d) => ({
                                                            ...d,
                                                            equity: e.target
                                                                .value,
                                                        }))
                                                    }
                                                />
                                            </fieldset>
                                            <fieldset>
                                                <label className="label">
                                                    <span className="label-text font-semibold text-xs uppercase tracking-wider">
                                                        Benefits
                                                    </span>
                                                </label>
                                                <textarea
                                                    className="textarea textarea-bordered w-full h-24"
                                                    placeholder="e.g. Health, dental, 401k match, unlimited PTO..."
                                                    value={wizardData.benefits}
                                                    onChange={(e) =>
                                                        setWizardData((d) => ({
                                                            ...d,
                                                            benefits:
                                                                e.target.value,
                                                        }))
                                                    }
                                                ></textarea>
                                            </fieldset>
                                        </div>
                                    )}

                                    {/* Step 4: Review */}
                                    {wizardStep === 3 && (
                                        <div className="space-y-6">
                                            <p className="text-sm text-base-content/60 uppercase tracking-wider font-semibold mb-4">
                                                Review your listing before
                                                posting
                                            </p>

                                            <div className="bg-base-200 p-6 space-y-4">
                                                <ReviewRow
                                                    label="Title"
                                                    value={
                                                        wizardData.title ||
                                                        "Not provided"
                                                    }
                                                />
                                                <ReviewRow
                                                    label="Company"
                                                    value={
                                                        wizardData.company ||
                                                        "Not provided"
                                                    }
                                                />
                                                <ReviewRow
                                                    label="Location"
                                                    value={
                                                        wizardData.location ||
                                                        "Not provided"
                                                    }
                                                />
                                                <ReviewRow
                                                    label="Type"
                                                    value={
                                                        jobTypes.find(
                                                            (t) =>
                                                                t.value ===
                                                                wizardData.type,
                                                        )?.label || "Full-Time"
                                                    }
                                                />
                                                <ReviewRow
                                                    label="Experience"
                                                    value={
                                                        experienceLevels.find(
                                                            (l) =>
                                                                l.value ===
                                                                wizardData.experienceLevel,
                                                        )?.label || "Mid Level"
                                                    }
                                                />
                                                <ReviewRow
                                                    label="Skills"
                                                    value={
                                                        wizardData.skills ||
                                                        "Not provided"
                                                    }
                                                />
                                                <ReviewRow
                                                    label="Salary"
                                                    value={
                                                        wizardData.salaryMin ||
                                                        wizardData.salaryMax
                                                            ? `${wizardData.salaryMin || "?"} - ${wizardData.salaryMax || "?"}`
                                                            : "Not provided"
                                                    }
                                                />
                                                {wizardData.equity && (
                                                    <ReviewRow
                                                        label="Equity"
                                                        value={
                                                            wizardData.equity
                                                        }
                                                    />
                                                )}
                                            </div>

                                            {wizardData.description && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">
                                                        Description
                                                    </p>
                                                    <p className="text-sm text-base-content/70 leading-relaxed bg-base-200 p-4">
                                                        {wizardData.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-between border-t border-base-200 pt-6 mt-6">
                                    <div>
                                        {wizardStep > 0 && (
                                            <button
                                                onClick={wizardBack}
                                                className="btn btn-ghost"
                                            >
                                                <i className="fa-duotone fa-regular fa-arrow-left"></i>
                                                Back
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeWizard}
                                            className="btn btn-ghost"
                                        >
                                            Cancel
                                        </button>
                                        {wizardStep < 3 ? (
                                            <button
                                                onClick={wizardNext}
                                                className="btn btn-secondary"
                                            >
                                                Next
                                                <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={submitWizard}
                                                className="btn btn-primary"
                                            >
                                                <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                                Publish Job
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                CONFIRMATION MODAL
               ═══════════════════════════════════════════════════════ */}
            {showConfirm && (
                <div className="modal modal-open" role="dialog">
                    <div
                        ref={confirmBackdropRef}
                        className="modal-backdrop bg-neutral/60"
                        onClick={closeConfirm}
                    ></div>
                    <div
                        ref={confirmBoxRef}
                        className="modal-box max-w-md bg-base-100 p-0 overflow-hidden"
                    >
                        {confirmDeleted ? (
                            /* Deleted state */
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-base-200 flex items-center justify-center mx-auto mb-5">
                                    <i className="fa-duotone fa-regular fa-check text-3xl text-base-content/40"></i>
                                </div>
                                <h4 className="text-xl font-black mb-2">
                                    Job Deleted
                                </h4>
                                <p className="text-base-content/60 mb-8">
                                    The job listing has been permanently
                                    removed.
                                </p>
                                <button
                                    onClick={closeConfirm}
                                    className="btn btn-ghost"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Warning header */}
                                <div className="bg-error/10 px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-error flex items-center justify-center flex-shrink-0">
                                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-xl text-error-content"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-error">
                                                Delete Job Listing
                                            </h3>
                                            <p className="text-xs text-error/70 uppercase tracking-wider">
                                                Destructive Action
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="bg-base-200 p-5 mb-6">
                                        <div className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-briefcase text-base-content/40 mt-0.5"></i>
                                            <div>
                                                <p className="font-bold text-sm">
                                                    Senior Software Engineer
                                                </p>
                                                <p className="text-xs text-base-content/50">
                                                    Acme Corp &mdash; San
                                                    Francisco, CA
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-base-content/70 text-sm leading-relaxed mb-2">
                                        This action is{" "}
                                        <span className="font-bold text-error">
                                            permanent and cannot be undone
                                        </span>
                                        . Deleting this job listing will:
                                    </p>
                                    <ul className="text-sm text-base-content/60 space-y-2 mb-8 ml-4">
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-xmark text-error text-xs mt-1"></i>
                                            Remove the listing from all searches
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-xmark text-error text-xs mt-1"></i>
                                            Notify all assigned recruiters
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-xmark text-error text-xs mt-1"></i>
                                            Archive all candidate applications
                                        </li>
                                    </ul>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeConfirm}
                                            className="btn btn-ghost flex-1"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="btn btn-error flex-1"
                                        >
                                            <i className="fa-duotone fa-regular fa-trash"></i>
                                            Delete Permanently
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

/* ─── Review Row sub-component ────────────────────────────────────────────── */

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50 flex-shrink-0 pt-0.5">
                {label}
            </span>
            <span className="text-sm text-base-content/80 text-right">
                {value}
            </span>
        </div>
    );
}
