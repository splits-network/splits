"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

/* ─── Types ───────────────────────────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4;

interface FormData {
    title: string;
    department: string;
    location: string;
    locationType: "onsite" | "remote" | "hybrid" | "";
    salaryMin: string;
    salaryMax: string;
    currency: string;
    type: string;
    experienceLevel: string;
    description: string;
    requirements: string;
    responsibilities: string;
    benefits: string[];
    tags: string;
    equity: string;
    deadline: string;
    recruiterName: string;
    recruiterEmail: string;
    recruiterAgency: string;
    featured: boolean;
    agreeTos: boolean;
    resume: File | null;
}

interface FieldError {
    [key: string]: string;
}

const STEPS = [
    { num: 1 as Step, label: "Position", icon: "fa-duotone fa-regular fa-briefcase" },
    { num: 2 as Step, label: "Details", icon: "fa-duotone fa-regular fa-file-lines" },
    { num: 3 as Step, label: "Recruiter", icon: "fa-duotone fa-regular fa-user-tie" },
    { num: 4 as Step, label: "Review", icon: "fa-duotone fa-regular fa-check-double" },
];

const BENEFITS_OPTIONS = [
    "Health Insurance",
    "Dental & Vision",
    "401k Match",
    "Unlimited PTO",
    "Remote Flexibility",
    "Equity/Stock Options",
    "Learning Budget",
    "Home Office Stipend",
    "Parental Leave",
    "Wellness Programs",
    "Commuter Benefits",
    "Free Meals",
];

const DEPARTMENTS = [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Sales",
    "Customer Success",
    "Data",
    "Finance",
    "Legal",
    "Operations",
    "HR",
    "Security",
];

export default function FormsFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [errors, setErrors] = useState<FieldError>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        title: "",
        department: "",
        location: "",
        locationType: "",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
        type: "",
        experienceLevel: "",
        description: "",
        requirements: "",
        responsibilities: "",
        benefits: [],
        tags: "",
        equity: "",
        deadline: "",
        recruiterName: "",
        recruiterEmail: "",
        recruiterAgency: "",
        featured: false,
        agreeTos: false,
        resume: null,
    });

    const update = (field: keyof FormData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const toggleBenefit = (b: string) => {
        setFormData((prev) => ({
            ...prev,
            benefits: prev.benefits.includes(b)
                ? prev.benefits.filter((x) => x !== b)
                : [...prev.benefits, b],
        }));
    };

    /* ── Validation ── */
    const validateStep = (step: Step): boolean => {
        const errs: FieldError = {};
        if (step === 1) {
            if (!formData.title.trim()) errs.title = "Job title is required";
            if (!formData.department) errs.department = "Select a department";
            if (!formData.location.trim()) errs.location = "Location is required";
            if (!formData.locationType) errs.locationType = "Select a location type";
            if (!formData.type) errs.type = "Select a job type";
            if (!formData.experienceLevel) errs.experienceLevel = "Select an experience level";
        } else if (step === 2) {
            if (!formData.description.trim()) errs.description = "Description is required";
            if (formData.description.trim().length < 50) errs.description = "Description must be at least 50 characters";
            if (!formData.requirements.trim()) errs.requirements = "At least one requirement is needed";
            if (!formData.deadline) errs.deadline = "Application deadline is required";
        } else if (step === 3) {
            if (!formData.recruiterName.trim()) errs.recruiterName = "Recruiter name is required";
            if (!formData.recruiterEmail.trim()) errs.recruiterEmail = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recruiterEmail))
                errs.recruiterEmail = "Enter a valid email";
            if (!formData.agreeTos) errs.agreeTos = "You must agree to the terms";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 4) as Step);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        await new Promise((r) => setTimeout(r, 2000));
        setSubmitting(false);
        setSubmitted(true);
    };

    /* ── Animations ── */
    useEffect(() => {
        if (stepContentRef.current) {
            gsap.fromTo(
                stepContentRef.current,
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" },
            );
        }
    }, [currentStep]);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current.querySelector(".cin-form-header"),
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 },
            );
            gsap.fromTo(
                containerRef.current.querySelector(".cin-form-body"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.3 },
            );
        }
    }, []);

    /* ── Field helper ── */
    const fieldClass = (field: string) =>
        errors[field]
            ? "input input-bordered border-error bg-error/5 w-full focus:border-error focus:outline-none"
            : "input input-bordered bg-base-200 border-base-content/10 w-full focus:border-primary focus:outline-none";

    const selectClass = (field: string) =>
        errors[field]
            ? "select select-bordered border-error bg-error/5 w-full focus:border-error"
            : "select select-bordered bg-base-200 border-base-content/10 w-full focus:border-primary";

    if (submitted) {
        return (
            <div ref={containerRef} className="cin-page min-h-screen bg-base-100 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                        <i className="fa-duotone fa-regular fa-check text-success text-3xl" />
                    </div>
                    <h1 className="text-3xl font-black mb-3">Job Posted Successfully</h1>
                    <p className="text-base-content/50 leading-relaxed mb-8">
                        Your job listing for <strong className="text-base-content">{formData.title}</strong> has
                        been submitted and is now under review. You will receive a confirmation email shortly.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => { setSubmitted(false); setCurrentStep(1); setFormData({ title: "", department: "", location: "", locationType: "", salaryMin: "", salaryMax: "", currency: "USD", type: "", experienceLevel: "", description: "", requirements: "", responsibilities: "", benefits: [], tags: "", equity: "", deadline: "", recruiterName: "", recruiterEmail: "", recruiterAgency: "", featured: false, agreeTos: false, resume: null }); }}
                            className="btn btn-primary font-semibold"
                        >
                            <i className="fa-duotone fa-regular fa-plus" />
                            Post Another
                        </button>
                        <button className="btn bg-base-200 border-base-content/10 font-semibold">
                            <i className="fa-duotone fa-regular fa-eye" />
                            View Listing
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-base-100">
            {/* Header */}
            <div className="cin-form-header bg-neutral text-white">
                <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
                    <p className="text-xs uppercase tracking-[0.3em] font-medium text-primary mb-4">
                        Cinematic Editorial
                    </p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-3">
                        Create Job <span className="text-primary">Posting</span>
                    </h1>
                    <p className="text-base text-white/50 max-w-lg leading-relaxed">
                        Fill out the details below to list a new position on the Splits Network marketplace.
                    </p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="bg-base-100 border-b border-base-content/5 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, i) => (
                            <div key={step.num} className="flex items-center flex-1 last:flex-none">
                                <button
                                    onClick={() => {
                                        if (step.num < currentStep) setCurrentStep(step.num);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                                        step.num === currentStep
                                            ? "bg-primary text-primary-content shadow-sm"
                                            : step.num < currentStep
                                              ? "text-primary cursor-pointer hover:bg-primary/10"
                                              : "text-base-content/30 cursor-default"
                                    }`}
                                >
                                    <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                            step.num === currentStep
                                                ? "bg-primary-content/20"
                                                : step.num < currentStep
                                                  ? "bg-primary/10"
                                                  : "bg-base-200"
                                        }`}
                                    >
                                        {step.num < currentStep ? (
                                            <i className="fa-duotone fa-regular fa-check text-[10px]" />
                                        ) : (
                                            step.num
                                        )}
                                    </div>
                                    <span className="hidden sm:inline">{step.label}</span>
                                </button>
                                {i < STEPS.length - 1 && (
                                    <div
                                        className={`flex-1 h-px mx-3 ${
                                            step.num < currentStep ? "bg-primary/30" : "bg-base-content/10"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Body */}
            <div className="cin-form-body max-w-4xl mx-auto px-6 py-10">
                <div ref={stepContentRef}>
                    {/* ═══════ STEP 1: Position ═══════ */}
                    {currentStep === 1 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-black mb-1">Position Information</h2>
                                <p className="text-sm text-base-content/40">Basic details about the role you are posting.</p>
                            </div>

                            <fieldset className="space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Job Title <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Senior Product Designer"
                                        value={formData.title}
                                        onChange={(e) => update("title", e.target.value)}
                                        className={fieldClass("title")}
                                    />
                                    {errors.title && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.title}</p>}
                                </div>

                                {/* Department + Type */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                            Department <span className="text-error">*</span>
                                        </label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => update("department", e.target.value)}
                                            className={selectClass("department")}
                                        >
                                            <option value="">Select department</option>
                                            {DEPARTMENTS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        {errors.department && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.department}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                            Job Type <span className="text-error">*</span>
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => update("type", e.target.value)}
                                            className={selectClass("type")}
                                        >
                                            <option value="">Select type</option>
                                            <option value="full-time">Full-Time</option>
                                            <option value="part-time">Part-Time</option>
                                            <option value="contract">Contract</option>
                                            <option value="remote">Remote</option>
                                        </select>
                                        {errors.type && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.type}</p>}
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Location <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. San Francisco, CA"
                                        value={formData.location}
                                        onChange={(e) => update("location", e.target.value)}
                                        className={fieldClass("location")}
                                    />
                                    {errors.location && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.location}</p>}
                                </div>

                                {/* Location Type (Radio) */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-3 block">
                                        Location Type <span className="text-error">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {(["onsite", "remote", "hybrid"] as const).map((lt) => (
                                            <label
                                                key={lt}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                                                    formData.locationType === lt
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-base-content/10 bg-base-200 text-base-content/60 hover:border-primary/30"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="locationType"
                                                    value={lt}
                                                    checked={formData.locationType === lt}
                                                    onChange={() => update("locationType", lt)}
                                                    className="radio radio-primary radio-sm"
                                                />
                                                <span className="capitalize">{lt}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.locationType && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.locationType}</p>}
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Experience Level <span className="text-error">*</span>
                                    </label>
                                    <select
                                        value={formData.experienceLevel}
                                        onChange={(e) => update("experienceLevel", e.target.value)}
                                        className={selectClass("experienceLevel")}
                                    >
                                        <option value="">Select level</option>
                                        <option value="entry">Entry Level</option>
                                        <option value="mid">Mid Level</option>
                                        <option value="senior">Senior</option>
                                        <option value="executive">Executive</option>
                                    </select>
                                    {errors.experienceLevel && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.experienceLevel}</p>}
                                </div>

                                {/* Salary Range */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Salary Range
                                    </label>
                                    <div className="flex gap-3 items-center">
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => update("currency", e.target.value)}
                                            className="select select-bordered bg-base-200 border-base-content/10 w-24 focus:border-primary"
                                        >
                                            <option>USD</option>
                                            <option>EUR</option>
                                            <option>GBP</option>
                                            <option>CAD</option>
                                            <option>AUD</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Min"
                                            value={formData.salaryMin}
                                            onChange={(e) => update("salaryMin", e.target.value)}
                                            className="input input-bordered bg-base-200 border-base-content/10 flex-1 focus:border-primary focus:outline-none"
                                        />
                                        <span className="text-base-content/30 font-medium">to</span>
                                        <input
                                            type="text"
                                            placeholder="Max"
                                            value={formData.salaryMax}
                                            onChange={(e) => update("salaryMax", e.target.value)}
                                            className="input input-bordered bg-base-200 border-base-content/10 flex-1 focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    )}

                    {/* ═══════ STEP 2: Details ═══════ */}
                    {currentStep === 2 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-black mb-1">Job Details</h2>
                                <p className="text-sm text-base-content/40">Describe the role, requirements, and what you offer.</p>
                            </div>

                            <fieldset className="space-y-5">
                                {/* Description */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Description <span className="text-error">*</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Write a compelling job description..."
                                        value={formData.description}
                                        onChange={(e) => update("description", e.target.value)}
                                        className={`textarea textarea-bordered w-full ${errors.description ? "border-error bg-error/5" : "bg-base-200 border-base-content/10"} focus:border-primary focus:outline-none`}
                                    />
                                    <div className="flex justify-between mt-1">
                                        {errors.description ? (
                                            <p className="text-xs text-error flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.description}</p>
                                        ) : <span />}
                                        <span className={`text-xs ${formData.description.length < 50 ? "text-base-content/30" : "text-success"}`}>
                                            {formData.description.length} characters
                                        </span>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Requirements <span className="text-error">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="One requirement per line..."
                                        value={formData.requirements}
                                        onChange={(e) => update("requirements", e.target.value)}
                                        className={`textarea textarea-bordered w-full ${errors.requirements ? "border-error bg-error/5" : "bg-base-200 border-base-content/10"} focus:border-primary focus:outline-none`}
                                    />
                                    {errors.requirements && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.requirements}</p>}
                                </div>

                                {/* Responsibilities */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Responsibilities
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="One responsibility per line..."
                                        value={formData.responsibilities}
                                        onChange={(e) => update("responsibilities", e.target.value)}
                                        className="textarea textarea-bordered w-full bg-base-200 border-base-content/10 focus:border-primary focus:outline-none"
                                    />
                                </div>

                                {/* Benefits (Checkboxes) */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-3 block">
                                        Benefits
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {BENEFITS_OPTIONS.map((b) => (
                                            <label
                                                key={b}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                                                    formData.benefits.includes(b)
                                                        ? "border-primary bg-primary/5 text-primary font-medium"
                                                        : "border-base-content/10 bg-base-200 text-base-content/50 hover:border-primary/30"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.benefits.includes(b)}
                                                    onChange={() => toggleBenefit(b)}
                                                    className="checkbox checkbox-primary checkbox-sm"
                                                />
                                                {b}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags + Equity + Deadline */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                            Skills / Tags
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. React, TypeScript, Figma"
                                            value={formData.tags}
                                            onChange={(e) => update("tags", e.target.value)}
                                            className="input input-bordered bg-base-200 border-base-content/10 w-full focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                            Equity Range
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 0.05% - 0.15%"
                                            value={formData.equity}
                                            onChange={(e) => update("equity", e.target.value)}
                                            className="input input-bordered bg-base-200 border-base-content/10 w-full focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Application Deadline <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => update("deadline", e.target.value)}
                                        className={fieldClass("deadline")}
                                    />
                                    {errors.deadline && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.deadline}</p>}
                                </div>
                            </fieldset>
                        </div>
                    )}

                    {/* ═══════ STEP 3: Recruiter ═══════ */}
                    {currentStep === 3 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-black mb-1">Recruiter Information</h2>
                                <p className="text-sm text-base-content/40">Who is managing this listing and how can candidates reach out?</p>
                            </div>

                            <fieldset className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                            Full Name <span className="text-error">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Sarah Chen"
                                            value={formData.recruiterName}
                                            onChange={(e) => update("recruiterName", e.target.value)}
                                            className={fieldClass("recruiterName")}
                                        />
                                        {errors.recruiterName && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.recruiterName}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                            Agency / Company
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. TechHire Partners"
                                            value={formData.recruiterAgency}
                                            onChange={(e) => update("recruiterAgency", e.target.value)}
                                            className="input input-bordered bg-base-200 border-base-content/10 w-full focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Email Address <span className="text-error">*</span>
                                    </label>
                                    <div className="relative">
                                        <i className="fa-duotone fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                                        <input
                                            type="email"
                                            placeholder="recruiter@company.com"
                                            value={formData.recruiterEmail}
                                            onChange={(e) => update("recruiterEmail", e.target.value)}
                                            className={`${fieldClass("recruiterEmail")} pl-10`}
                                        />
                                    </div>
                                    {errors.recruiterEmail && <p className="text-xs text-error mt-1 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.recruiterEmail}</p>}
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-base-content/50 font-semibold mb-1.5 block">
                                        Company Logo (optional)
                                    </label>
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-base-content/10 rounded-xl py-8 cursor-pointer hover:border-primary/30 transition-colors bg-base-200/50">
                                        <i className="fa-duotone fa-regular fa-cloud-arrow-up text-3xl text-base-content/20 mb-2" />
                                        <span className="text-sm font-medium text-base-content/40">
                                            {formData.resume ? formData.resume.name : "Click to upload or drag and drop"}
                                        </span>
                                        <span className="text-xs text-base-content/20 mt-1">PNG, JPG, SVG up to 5MB</span>
                                        <input
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.svg"
                                            className="hidden"
                                            onChange={(e) => update("resume", e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>

                                {/* Featured Toggle */}
                                <div className="flex items-center justify-between bg-base-200 rounded-xl p-4">
                                    <div>
                                        <div className="font-bold text-sm">Featured Listing</div>
                                        <div className="text-xs text-base-content/40">Boost visibility with a featured badge and priority placement</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => update("featured", e.target.checked)}
                                        className="toggle toggle-primary"
                                    />
                                </div>

                                {/* Terms */}
                                <div>
                                    <label className={`flex items-start gap-3 cursor-pointer ${errors.agreeTos ? "text-error" : ""}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.agreeTos}
                                            onChange={(e) => update("agreeTos", e.target.checked)}
                                            className={`checkbox ${errors.agreeTos ? "checkbox-error" : "checkbox-primary"} checkbox-sm mt-0.5`}
                                        />
                                        <span className="text-sm text-base-content/60">
                                            I agree to the <a href="#" className="text-primary font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-primary font-medium hover:underline">Posting Guidelines</a>. I confirm this is a legitimate job listing.
                                        </span>
                                    </label>
                                    {errors.agreeTos && <p className="text-xs text-error mt-1 ml-8 flex items-center gap-1"><i className="fa-duotone fa-regular fa-circle-exclamation" />{errors.agreeTos}</p>}
                                </div>
                            </fieldset>
                        </div>
                    )}

                    {/* ═══════ STEP 4: Review ═══════ */}
                    {currentStep === 4 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-black mb-1">Review & Submit</h2>
                                <p className="text-sm text-base-content/40">Double-check your listing before publishing it to the marketplace.</p>
                            </div>

                            {/* Summary Cards */}
                            <div className="space-y-4">
                                {/* Position */}
                                <div className="border border-base-content/5 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Position</h3>
                                        <button onClick={() => setCurrentStep(1)} className="text-xs text-primary font-medium hover:underline">Edit</button>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-base-content/40">Title:</span> <strong>{formData.title || "---"}</strong></div>
                                        <div><span className="text-base-content/40">Department:</span> <strong>{formData.department || "---"}</strong></div>
                                        <div><span className="text-base-content/40">Location:</span> <strong>{formData.location || "---"}</strong></div>
                                        <div><span className="text-base-content/40">Type:</span> <strong className="capitalize">{formData.type || "---"}</strong></div>
                                        <div><span className="text-base-content/40">Level:</span> <strong className="capitalize">{formData.experienceLevel || "---"}</strong></div>
                                        <div><span className="text-base-content/40">Salary:</span> <strong>{formData.salaryMin && formData.salaryMax ? `${formData.currency} ${formData.salaryMin} - ${formData.salaryMax}` : "Not specified"}</strong></div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="border border-base-content/5 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Details</h3>
                                        <button onClick={() => setCurrentStep(2)} className="text-xs text-primary font-medium hover:underline">Edit</button>
                                    </div>
                                    <p className="text-sm text-base-content/60 mb-3">{formData.description.slice(0, 200)}{formData.description.length > 200 ? "..." : ""}</p>
                                    {formData.benefits.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {formData.benefits.map((b) => (
                                                <span key={b} className="badge badge-sm bg-primary/10 text-primary border-0 font-medium">{b}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="text-sm mt-3"><span className="text-base-content/40">Deadline:</span> <strong>{formData.deadline || "---"}</strong></div>
                                </div>

                                {/* Recruiter */}
                                <div className="border border-base-content/5 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Recruiter</h3>
                                        <button onClick={() => setCurrentStep(3)} className="text-xs text-primary font-medium hover:underline">Edit</button>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-base-content/40">Name:</span> <strong>{formData.recruiterName || "---"}</strong></div>
                                        <div><span className="text-base-content/40">Email:</span> <strong>{formData.recruiterEmail || "---"}</strong></div>
                                        <div><span className="text-base-content/40">Agency:</span> <strong>{formData.recruiterAgency || "Not specified"}</strong></div>
                                        <div><span className="text-base-content/40">Featured:</span> <strong>{formData.featured ? "Yes" : "No"}</strong></div>
                                    </div>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning mt-0.5" />
                                <div className="text-sm text-base-content/60">
                                    <strong className="text-base-content">Before you submit:</strong> Once published, your listing will be visible to all recruiters in the network. You can edit or close it at any time from your dashboard.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-base-content/5">
                    {currentStep > 1 ? (
                        <button onClick={prevStep} className="btn bg-base-200 border-base-content/10 font-semibold">
                            <i className="fa-duotone fa-regular fa-arrow-left" />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}
                    {currentStep < 4 ? (
                        <button onClick={nextStep} className="btn btn-primary font-semibold">
                            Continue
                            <i className="fa-duotone fa-regular fa-arrow-right" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn btn-primary font-semibold min-w-[160px]"
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-paper-plane" />
                                    Publish Listing
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
