"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── types ─── */

type Step = 1 | 2 | 3 | 4;

interface FormData {
    title: string;
    department: string;
    location: string;
    locationType: string;
    experienceLevel: string;
    employmentType: string;
    salaryMin: string;
    salaryMax: string;
    currency: string;
    description: string;
    requirements: string;
    benefits: string;
    skills: string[];
    splitFeeEnabled: boolean;
    splitPercentage: string;
    splitVisibility: string;
    urgency: string;
    startDate: string;
    applicationDeadline: string;
    hiringManagerName: string;
    hiringManagerEmail: string;
    resume: boolean;
    coverLetter: boolean;
    portfolio: boolean;
}

interface FieldError {
    field: string;
    message: string;
}

/* ─── step config ─── */

const steps = [
    {
        num: 1 as Step,
        label: "Role Details",
        icon: "fa-briefcase",
        desc: "Basic job information",
    },
    {
        num: 2 as Step,
        label: "Description",
        icon: "fa-file-lines",
        desc: "Job description & requirements",
    },
    {
        num: 3 as Step,
        label: "Split Config",
        icon: "fa-split",
        desc: "Fee splitting & visibility",
    },
    {
        num: 4 as Step,
        label: "Review",
        icon: "fa-check-circle",
        desc: "Review & publish",
    },
];

const skillOptions = [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "Go",
    "Rust",
    "AWS",
    "GCP",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "MongoDB",
    "GraphQL",
    "REST APIs",
    "System Design",
    "Machine Learning",
    "Data Engineering",
    "DevOps",
    "CI/CD",
    "Agile",
    "Product Management",
    "UI/UX Design",
];

const departments = [
    "Engineering",
    "Product",
    "Design",
    "Data Science",
    "DevOps",
    "Marketing",
    "Sales",
    "Operations",
];
const locations = [
    "San Francisco, CA",
    "New York, NY",
    "Austin, TX",
    "Seattle, WA",
    "Remote - US",
    "Remote - Global",
    "London, UK",
    "Berlin, DE",
];
const locationTypes = ["On-site", "Remote", "Hybrid"];
const experienceLevels = [
    "Junior (0-2 yrs)",
    "Mid (3-5 yrs)",
    "Senior (5-8 yrs)",
    "Staff (8-12 yrs)",
    "Principal (12+ yrs)",
    "Director",
    "VP",
];
const employmentTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Contract-to-Hire",
];
const currencies = ["USD", "EUR", "GBP", "CAD"];
const urgencyLevels = [
    "Low - No rush",
    "Medium - Within 60 days",
    "High - Within 30 days",
    "Critical - Immediate",
];

/* ─── component ─── */

export default function FormsTen() {
    const mainRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [errors, setErrors] = useState<FieldError[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [skillInput, setSkillInput] = useState("");
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);

    const [form, setForm] = useState<FormData>({
        title: "",
        department: "",
        location: "",
        locationType: "",
        experienceLevel: "",
        employmentType: "",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
        description: "",
        requirements: "",
        benefits: "",
        skills: [],
        splitFeeEnabled: true,
        splitPercentage: "50",
        splitVisibility: "network",
        urgency: "",
        startDate: "",
        applicationDeadline: "",
        hiringManagerName: "",
        hiringManagerEmail: "",
        resume: true,
        coverLetter: false,
        portfolio: false,
    });

    const updateField = <K extends keyof FormData>(
        key: K,
        value: FormData[K],
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => prev.filter((e) => e.field !== key));
    };

    const addSkill = (skill: string) => {
        if (!form.skills.includes(skill))
            updateField("skills", [...form.skills, skill]);
        setSkillInput("");
        setShowSkillDropdown(false);
    };

    const removeSkill = (skill: string) =>
        updateField(
            "skills",
            form.skills.filter((s) => s !== skill),
        );

    const filteredSkills = skillOptions.filter(
        (s) =>
            s.toLowerCase().includes(skillInput.toLowerCase()) &&
            !form.skills.includes(s),
    );

    const validateStep = (step: Step): FieldError[] => {
        const errs: FieldError[] = [];
        if (step === 1) {
            if (!form.title.trim())
                errs.push({ field: "title", message: "Job title is required" });
            if (!form.department)
                errs.push({
                    field: "department",
                    message: "Select a department",
                });
            if (!form.location)
                errs.push({ field: "location", message: "Select a location" });
            if (!form.experienceLevel)
                errs.push({
                    field: "experienceLevel",
                    message: "Select experience level",
                });
            if (!form.employmentType)
                errs.push({
                    field: "employmentType",
                    message: "Select employment type",
                });
            if (!form.salaryMin)
                errs.push({
                    field: "salaryMin",
                    message: "Min salary required",
                });
            if (!form.salaryMax)
                errs.push({
                    field: "salaryMax",
                    message: "Max salary required",
                });
        }
        if (step === 2) {
            if (!form.description.trim())
                errs.push({
                    field: "description",
                    message: "Description is required",
                });
            if (form.skills.length === 0)
                errs.push({
                    field: "skills",
                    message: "Add at least one skill",
                });
        }
        if (step === 3) {
            if (!form.urgency)
                errs.push({
                    field: "urgency",
                    message: "Select urgency level",
                });
        }
        return errs;
    };

    const goNext = () => {
        const errs = validateStep(currentStep);
        if (errs.length > 0) {
            setErrors(errs);
            return;
        }
        setErrors([]);
        if (currentStep < 4) setCurrentStep((currentStep + 1) as Step);
    };

    const goPrev = () => {
        if (currentStep > 1) setCurrentStep((currentStep - 1) as Step);
    };

    const handleSubmit = () => {
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
        }, 2500);
    };

    const getError = (field: string) => errors.find((e) => e.field === field);

    /* ─── GSAP ─── */
    useGSAP(
        () => {
            if (!mainRef.current) return;
            const pRM = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (pRM) return;
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(
                ".form-scanline",
                { scaleX: 0 },
                { scaleX: 1, duration: 0.6 },
            )
                .fromTo(
                    ".form-title span",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.2",
                )
                .fromTo(
                    ".form-subtitle",
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.4 },
                    "-=0.1",
                );
            gsap.fromTo(
                ".step-indicator",
                { opacity: 0, y: -15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    stagger: 0.08,
                    delay: 0.4,
                    ease: "power2.out",
                },
            );
        },
        { scope: mainRef },
    );

    useEffect(() => {
        const pRM = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (pRM) return;
        requestAnimationFrame(() => {
            const fields = document.querySelectorAll(".form-field");
            if (fields.length === 0) return;
            gsap.fromTo(
                fields,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    stagger: 0.04,
                    ease: "power2.out",
                },
            );
        });
    }, [currentStep]);

    /* ─── field helpers ─── */
    const inputCls = (field: string) =>
        `w-full bg-base-300 border ${getError(field) ? "border-error/40" : "border-base-content/5"} px-4 py-2.5 font-mono text-xs text-base-content placeholder:text-base-content/15 focus:outline-none focus:border-coral/30 transition-colors`;
    const selectCls = (field: string) =>
        `w-full bg-base-300 border ${getError(field) ? "border-error/40" : "border-base-content/5"} px-4 py-2.5 font-mono text-xs text-base-content focus:outline-none focus:border-coral/30 transition-colors appearance-none cursor-pointer`;

    const Field = ({
        label,
        required,
        field,
        hint,
        children,
    }: {
        label: string;
        required?: boolean;
        field: string;
        hint?: string;
        children: React.ReactNode;
    }) => {
        const err = getError(field);
        return (
            <fieldset className="form-field">
                <div className="flex items-center justify-between mb-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-base-content/40">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </label>
                    {err && (
                        <span className="font-mono text-[9px] text-error flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-[8px]" />
                            {err.message}
                        </span>
                    )}
                </div>
                {children}
                {hint && !err && (
                    <p className="font-mono text-[9px] text-base-content/20 mt-1">
                        {hint}
                    </p>
                )}
            </fieldset>
        );
    };

    /* ─── success state ─── */
    if (submitted) {
        return (
            <div
                ref={mainRef}
                className="min-h-screen bg-base-300 text-base-content flex items-center justify-center"
            >
                <div className="text-center p-12 max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-success/10 border border-success/20">
                        <i className="fa-duotone fa-regular fa-check text-3xl text-success" />
                    </div>
                    <p className="font-mono text-xs tracking-[0.3em] uppercase text-success mb-3">
                        // job.published
                    </p>
                    <h2 className="text-2xl font-black tracking-tight mb-3">
                        Job <span className="text-success">Published</span>
                    </h2>
                    <p className="font-mono text-xs text-base-content/40 mb-2">
                        {form.title || "Untitled Role"}
                    </p>
                    <p className="font-mono text-xs text-base-content/30 mb-8">
                        Your job has been published to the network. Recruiters
                        with matching candidates will be notified.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setCurrentStep(1);
                            }}
                            className="px-6 py-2.5 bg-primary text-primary-content font-mono text-[10px] uppercase tracking-wider hover:opacity-80 transition-opacity"
                        >
                            <i className="fa-duotone fa-regular fa-plus mr-2" />
                            Post Another
                        </button>
                        <button className="px-6 py-2.5 bg-base-200 border border-base-content/5 text-base-content/50 font-mono text-[10px] uppercase tracking-wider hover:border-coral/20 transition-colors">
                            <i className="fa-duotone fa-regular fa-arrow-right mr-2" />
                            View Listing
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={mainRef}
            className="min-h-screen bg-base-300 text-base-content"
        >
            {/* Header */}
            <section className="relative px-6 pt-10 pb-6">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="form-scanline h-[2px] bg-primary w-32 origin-left" />
                    </div>
                    <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-2 opacity-80">
                        sys.jobs &gt; create_posting v2.0
                    </p>
                    <h1 className="form-title text-3xl md:text-4xl font-black tracking-tight leading-[0.95]">
                        <span>Post </span>
                        <span className="text-primary">Job</span>
                    </h1>
                    <p className="form-subtitle text-base-content/40 font-mono text-sm mt-1">
                        Create a new job posting and publish to the recruiting
                        network
                    </p>
                </div>
                <div className="absolute top-8 right-6 w-8 h-8 border-r-2 border-t-2 border-coral/20" />
            </section>

            {/* Step indicators */}
            <section className="px-6 pb-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {steps.map((step, idx) => {
                            const isComplete = currentStep > step.num;
                            const isActive = currentStep === step.num;
                            return (
                                <div
                                    key={step.num}
                                    className="step-indicator flex items-center gap-2 flex-shrink-0"
                                >
                                    {idx > 0 && (
                                        <div
                                            className={`w-8 h-[1px] ${isComplete ? "bg-primary" : "bg-base-content/10"}`}
                                        />
                                    )}
                                    <button
                                        onClick={() => {
                                            if (isComplete)
                                                setCurrentStep(step.num);
                                        }}
                                        className={`flex items-center gap-2.5 px-3 py-2 border transition-colors ${
                                            isActive
                                                ? "bg-primary/10 border-coral/20 text-primary"
                                                : isComplete
                                                  ? "bg-success/5 border-success/20 text-success cursor-pointer hover:bg-success/10"
                                                  : "bg-base-200 border-base-content/5 text-base-content/25"
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 flex items-center justify-center border text-[10px] font-bold font-mono ${
                                                isActive
                                                    ? "bg-primary text-primary-content border-coral"
                                                    : isComplete
                                                      ? "bg-success text-success-content border-success"
                                                      : "bg-base-content/5 border-base-content/10 text-base-content/20"
                                            }`}
                                        >
                                            {isComplete ? (
                                                <i className="fa-duotone fa-regular fa-check text-[9px]" />
                                            ) : (
                                                step.num
                                            )}
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="font-mono text-[10px] font-bold uppercase tracking-wider leading-none">
                                                {step.label}
                                            </p>
                                            <p className="font-mono text-[8px] text-base-content/20 leading-none mt-0.5">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Form content */}
            <section className="px-6 pb-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-base-200 border border-base-content/5 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-content/5">
                            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-coral/20">
                                <i
                                    className={`fa-duotone fa-regular ${steps[currentStep - 1].icon} text-sm`}
                                />
                            </div>
                            <div>
                                <p className="font-mono text-sm font-bold">
                                    {steps[currentStep - 1].label}
                                </p>
                                <p className="font-mono text-[10px] text-base-content/30">
                                    {steps[currentStep - 1].desc}
                                </p>
                            </div>
                            <div className="ml-auto font-mono text-[10px] text-base-content/15">
                                Step {currentStep} of {steps.length}
                            </div>
                        </div>

                        {errors.length > 0 && (
                            <div className="mb-6 p-3 bg-error/5 border border-error/20 flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-sm mt-0.5" />
                                <div>
                                    <p className="font-mono text-xs font-bold text-error mb-1">
                                        Validation errors
                                    </p>
                                    <p className="font-mono text-[10px] text-error/60">
                                        Fix {errors.length} error
                                        {errors.length > 1 ? "s" : ""} to
                                        continue.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* STEP 1 */}
                        {currentStep === 1 && (
                            <div className="space-y-5">
                                <Field
                                    label="Job Title"
                                    required
                                    field="title"
                                    hint="e.g. Senior React Developer, Staff Backend Engineer"
                                >
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) =>
                                            updateField("title", e.target.value)
                                        }
                                        placeholder="Enter job title..."
                                        className={inputCls("title")}
                                    />
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field
                                        label="Department"
                                        required
                                        field="department"
                                    >
                                        <select
                                            value={form.department}
                                            onChange={(e) =>
                                                updateField(
                                                    "department",
                                                    e.target.value,
                                                )
                                            }
                                            className={selectCls("department")}
                                        >
                                            <option value="">
                                                Select department...
                                            </option>
                                            {departments.map((d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field
                                        label="Experience Level"
                                        required
                                        field="experienceLevel"
                                    >
                                        <select
                                            value={form.experienceLevel}
                                            onChange={(e) =>
                                                updateField(
                                                    "experienceLevel",
                                                    e.target.value,
                                                )
                                            }
                                            className={selectCls(
                                                "experienceLevel",
                                            )}
                                        >
                                            <option value="">
                                                Select level...
                                            </option>
                                            {experienceLevels.map((l) => (
                                                <option key={l} value={l}>
                                                    {l}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field
                                        label="Location"
                                        required
                                        field="location"
                                    >
                                        <select
                                            value={form.location}
                                            onChange={(e) =>
                                                updateField(
                                                    "location",
                                                    e.target.value,
                                                )
                                            }
                                            className={selectCls("location")}
                                        >
                                            <option value="">
                                                Select location...
                                            </option>
                                            {locations.map((l) => (
                                                <option key={l} value={l}>
                                                    {l}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field
                                        label="Location Type"
                                        field="locationType"
                                    >
                                        <div className="flex gap-2">
                                            {locationTypes.map((lt) => (
                                                <button
                                                    key={lt}
                                                    onClick={() =>
                                                        updateField(
                                                            "locationType",
                                                            lt,
                                                        )
                                                    }
                                                    className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-wider border transition-colors ${form.locationType === lt ? "bg-primary/10 border-coral/20 text-primary" : "bg-base-300 border-base-content/5 text-base-content/30 hover:border-base-content/10"}`}
                                                >
                                                    {lt}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                </div>
                                <Field
                                    label="Employment Type"
                                    required
                                    field="employmentType"
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {employmentTypes.map((et) => (
                                            <button
                                                key={et}
                                                onClick={() =>
                                                    updateField(
                                                        "employmentType",
                                                        et,
                                                    )
                                                }
                                                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider border transition-colors ${form.employmentType === et ? "bg-primary/10 border-coral/20 text-primary" : "bg-base-300 border-base-content/5 text-base-content/30 hover:border-base-content/10"}`}
                                            >
                                                {et}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <Field label="Currency" field="currency">
                                        <select
                                            value={form.currency}
                                            onChange={(e) =>
                                                updateField(
                                                    "currency",
                                                    e.target.value,
                                                )
                                            }
                                            className={selectCls("currency")}
                                        >
                                            {currencies.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field
                                        label="Salary Min"
                                        required
                                        field="salaryMin"
                                        hint="Annual base"
                                    >
                                        <input
                                            type="text"
                                            value={form.salaryMin}
                                            onChange={(e) =>
                                                updateField(
                                                    "salaryMin",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="120,000"
                                            className={inputCls("salaryMin")}
                                        />
                                    </Field>
                                    <Field
                                        label="Salary Max"
                                        required
                                        field="salaryMax"
                                    >
                                        <input
                                            type="text"
                                            value={form.salaryMax}
                                            onChange={(e) =>
                                                updateField(
                                                    "salaryMax",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="180,000"
                                            className={inputCls("salaryMax")}
                                        />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {currentStep === 2 && (
                            <div className="space-y-5">
                                <Field
                                    label="Job Description"
                                    required
                                    field="description"
                                    hint="Describe the role, responsibilities, and what makes it exciting"
                                >
                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            updateField(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Write a compelling job description..."
                                        rows={6}
                                        className={`${inputCls("description")} resize-none`}
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="font-mono text-[9px] text-base-content/15">
                                            {form.description.length} chars
                                        </span>
                                        {form.description.length > 0 &&
                                            form.description.length < 100 && (
                                                <span className="font-mono text-[9px] text-warning">
                                                    Consider more detail
                                                </span>
                                            )}
                                        {form.description.length >= 100 && (
                                            <span className="font-mono text-[9px] text-success">
                                                <i className="fa-duotone fa-regular fa-check text-[8px] mr-1" />
                                                Good length
                                            </span>
                                        )}
                                    </div>
                                </Field>
                                <Field
                                    label="Requirements"
                                    field="requirements"
                                    hint="Key qualifications and must-haves"
                                >
                                    <textarea
                                        value={form.requirements}
                                        onChange={(e) =>
                                            updateField(
                                                "requirements",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="List key requirements..."
                                        rows={4}
                                        className={`${inputCls("requirements")} resize-none`}
                                    />
                                </Field>
                                <Field
                                    label="Benefits & Perks"
                                    field="benefits"
                                >
                                    <textarea
                                        value={form.benefits}
                                        onChange={(e) =>
                                            updateField(
                                                "benefits",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Health, equity, PTO, etc."
                                        rows={3}
                                        className={`${inputCls("benefits")} resize-none`}
                                    />
                                </Field>
                                <Field
                                    label="Required Skills"
                                    required
                                    field="skills"
                                    hint="Add relevant skills"
                                >
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => {
                                                setSkillInput(e.target.value);
                                                setShowSkillDropdown(true);
                                            }}
                                            onFocus={() =>
                                                setShowSkillDropdown(true)
                                            }
                                            placeholder="Type to search skills..."
                                            className={inputCls("skills")}
                                        />
                                        {showSkillDropdown &&
                                            skillInput &&
                                            filteredSkills.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-base-200 border border-base-content/5 shadow-lg z-10 max-h-40 overflow-y-auto">
                                                    {filteredSkills
                                                        .slice(0, 8)
                                                        .map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() =>
                                                                    addSkill(s)
                                                                }
                                                                className="w-full text-left px-4 py-2 font-mono text-xs text-base-content/50 hover:bg-primary/5 hover:text-primary transition-colors"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                    </div>
                                    {form.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {form.skills.map((s) => (
                                                <span
                                                    key={s}
                                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-coral/20 font-mono text-[10px] text-primary"
                                                >
                                                    {s}
                                                    <button
                                                        onClick={() =>
                                                            removeSkill(s)
                                                        }
                                                        className="text-primary/40 hover:text-primary"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-xmark text-[8px]" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </Field>
                                <Field
                                    label="Application Materials"
                                    field="materials"
                                >
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            {
                                                key: "resume" as const,
                                                label: "Resume / CV",
                                                icon: "fa-file-lines",
                                            },
                                            {
                                                key: "coverLetter" as const,
                                                label: "Cover Letter",
                                                icon: "fa-envelope",
                                            },
                                            {
                                                key: "portfolio" as const,
                                                label: "Portfolio",
                                                icon: "fa-images",
                                            },
                                        ].map((item) => (
                                            <button
                                                key={item.key}
                                                onClick={() =>
                                                    updateField(
                                                        item.key,
                                                        !form[item.key],
                                                    )
                                                }
                                                className={`flex items-center gap-2 px-4 py-2.5 border transition-colors ${form[item.key] ? "bg-primary/10 border-coral/20 text-primary" : "bg-base-300 border-base-content/5 text-base-content/25 hover:border-base-content/10"}`}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${item.icon} text-xs`}
                                                />
                                                <span className="font-mono text-[10px] uppercase tracking-wider">
                                                    {item.label}
                                                </span>
                                                {form[item.key] && (
                                                    <i className="fa-duotone fa-regular fa-check text-[9px]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {currentStep === 3 && (
                            <div className="space-y-5">
                                <Field
                                    label="Enable Split Fee"
                                    field="splitFeeEnabled"
                                >
                                    <button
                                        onClick={() =>
                                            updateField(
                                                "splitFeeEnabled",
                                                !form.splitFeeEnabled,
                                            )
                                        }
                                        className={`flex items-center gap-3 p-4 border w-full transition-colors ${form.splitFeeEnabled ? "bg-primary/5 border-coral/20" : "bg-base-300 border-base-content/5"}`}
                                    >
                                        <div
                                            className={`w-10 h-5 rounded-full relative transition-colors ${form.splitFeeEnabled ? "bg-primary" : "bg-base-content/15"}`}
                                        >
                                            <div
                                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.splitFeeEnabled ? "left-5" : "left-0.5"}`}
                                            />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-mono text-xs font-bold">
                                                {form.splitFeeEnabled
                                                    ? "Split Fee Enabled"
                                                    : "Direct Placement Only"}
                                            </p>
                                            <p className="font-mono text-[10px] text-base-content/30">
                                                {form.splitFeeEnabled
                                                    ? "Network recruiters can submit candidates"
                                                    : "Only your recruiters can fill this role"}
                                            </p>
                                        </div>
                                    </button>
                                </Field>
                                {form.splitFeeEnabled && (
                                    <>
                                        <Field
                                            label="Split Percentage"
                                            field="splitPercentage"
                                            hint="Your share of the placement fee"
                                        >
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="30"
                                                    max="70"
                                                    step="5"
                                                    value={form.splitPercentage}
                                                    onChange={(e) =>
                                                        updateField(
                                                            "splitPercentage",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 h-1 appearance-none bg-base-content/10 accent-primary cursor-pointer"
                                                />
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="font-mono text-lg font-black text-primary">
                                                        {form.splitPercentage}%
                                                    </span>
                                                    <span className="font-mono text-[10px] text-base-content/20">
                                                        /{" "}
                                                        {100 -
                                                            parseInt(
                                                                form.splitPercentage,
                                                            )}
                                                        %
                                                    </span>
                                                </div>
                                            </div>
                                        </Field>
                                        <Field
                                            label="Network Visibility"
                                            field="splitVisibility"
                                        >
                                            <div className="space-y-2">
                                                {[
                                                    {
                                                        value: "network",
                                                        label: "Full Network",
                                                        desc: "All verified recruiters can see",
                                                        icon: "fa-globe",
                                                    },
                                                    {
                                                        value: "preferred",
                                                        label: "Preferred Partners",
                                                        desc: "Only preferred recruiter partners",
                                                        icon: "fa-star",
                                                    },
                                                    {
                                                        value: "invite",
                                                        label: "Invite Only",
                                                        desc: "Recruiters you specifically invite",
                                                        icon: "fa-envelope",
                                                    },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() =>
                                                            updateField(
                                                                "splitVisibility",
                                                                opt.value,
                                                            )
                                                        }
                                                        className={`w-full flex items-center gap-3 p-3 border transition-colors text-left ${form.splitVisibility === opt.value ? "bg-primary/5 border-coral/20" : "bg-base-300 border-base-content/5 hover:border-base-content/10"}`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 border flex items-center justify-center ${form.splitVisibility === opt.value ? "bg-primary border-coral" : "border-base-content/15"}`}
                                                        >
                                                            {form.splitVisibility ===
                                                                opt.value && (
                                                                <i className="fa-duotone fa-regular fa-check text-primary-content text-[8px]" />
                                                            )}
                                                        </div>
                                                        <i
                                                            className={`fa-duotone fa-regular ${opt.icon} text-sm ${form.splitVisibility === opt.value ? "text-primary" : "text-base-content/20"}`}
                                                        />
                                                        <div>
                                                            <p
                                                                className={`font-mono text-xs font-bold ${form.splitVisibility === opt.value ? "text-base-content" : "text-base-content/50"}`}
                                                            >
                                                                {opt.label}
                                                            </p>
                                                            <p className="font-mono text-[10px] text-base-content/25">
                                                                {opt.desc}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </Field>
                                    </>
                                )}
                                <Field
                                    label="Urgency Level"
                                    required
                                    field="urgency"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {urgencyLevels.map((u) => (
                                            <button
                                                key={u}
                                                onClick={() =>
                                                    updateField("urgency", u)
                                                }
                                                className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider border transition-colors text-left ${form.urgency === u ? "bg-primary/10 border-coral/20 text-primary" : "bg-base-300 border-base-content/5 text-base-content/30 hover:border-base-content/10"}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field
                                        label="Target Start Date"
                                        field="startDate"
                                    >
                                        <input
                                            type="date"
                                            value={form.startDate}
                                            onChange={(e) =>
                                                updateField(
                                                    "startDate",
                                                    e.target.value,
                                                )
                                            }
                                            className={inputCls("startDate")}
                                        />
                                    </Field>
                                    <Field
                                        label="Application Deadline"
                                        field="applicationDeadline"
                                    >
                                        <input
                                            type="date"
                                            value={form.applicationDeadline}
                                            onChange={(e) =>
                                                updateField(
                                                    "applicationDeadline",
                                                    e.target.value,
                                                )
                                            }
                                            className={inputCls(
                                                "applicationDeadline",
                                            )}
                                        />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field
                                        label="Hiring Manager"
                                        field="hiringManagerName"
                                    >
                                        <input
                                            type="text"
                                            value={form.hiringManagerName}
                                            onChange={(e) =>
                                                updateField(
                                                    "hiringManagerName",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Full name"
                                            className={inputCls(
                                                "hiringManagerName",
                                            )}
                                        />
                                    </Field>
                                    <Field
                                        label="Manager Email"
                                        field="hiringManagerEmail"
                                    >
                                        <input
                                            type="email"
                                            value={form.hiringManagerEmail}
                                            onChange={(e) =>
                                                updateField(
                                                    "hiringManagerEmail",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="email@company.com"
                                            className={inputCls(
                                                "hiringManagerEmail",
                                            )}
                                        />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-5">
                                {[
                                    {
                                        title: "Role Details",
                                        icon: "fa-briefcase",
                                        step: 1 as Step,
                                        items: [
                                            {
                                                label: "Title",
                                                value: form.title,
                                            },
                                            {
                                                label: "Department",
                                                value: form.department,
                                            },
                                            {
                                                label: "Location",
                                                value: `${form.location} (${form.locationType || "N/A"})`,
                                            },
                                            {
                                                label: "Experience",
                                                value: form.experienceLevel,
                                            },
                                            {
                                                label: "Type",
                                                value: form.employmentType,
                                            },
                                            {
                                                label: "Salary",
                                                value: `${form.currency} ${form.salaryMin} - ${form.salaryMax}`,
                                            },
                                        ],
                                    },
                                    {
                                        title: "Description",
                                        icon: "fa-file-lines",
                                        step: 2 as Step,
                                        items: [
                                            {
                                                label: "Description",
                                                value: form.description
                                                    ? `${form.description.substring(0, 120)}...`
                                                    : "",
                                            },
                                            {
                                                label: "Skills",
                                                value: form.skills.join(", "),
                                            },
                                            {
                                                label: "Materials",
                                                value:
                                                    [
                                                        form.resume && "Resume",
                                                        form.coverLetter &&
                                                            "Cover Letter",
                                                        form.portfolio &&
                                                            "Portfolio",
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ") || "None",
                                            },
                                        ],
                                    },
                                    {
                                        title: "Split Config",
                                        icon: "fa-split",
                                        step: 3 as Step,
                                        items: [
                                            {
                                                label: "Split Fee",
                                                value: form.splitFeeEnabled
                                                    ? "Enabled"
                                                    : "Disabled",
                                            },
                                            ...(form.splitFeeEnabled
                                                ? [
                                                      {
                                                          label: "Split",
                                                          value: `${form.splitPercentage}/${100 - parseInt(form.splitPercentage)}`,
                                                      },
                                                      {
                                                          label: "Visibility",
                                                          value: form.splitVisibility,
                                                      },
                                                  ]
                                                : []),
                                            {
                                                label: "Urgency",
                                                value: form.urgency,
                                            },
                                        ],
                                    },
                                ].map((section) => (
                                    <div
                                        key={section.title}
                                        className="form-field p-4 bg-base-300/30 border border-base-content/[0.03]"
                                    >
                                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-content/5">
                                            <i
                                                className={`fa-duotone fa-regular ${section.icon} text-xs text-primary`}
                                            />
                                            <span className="font-mono text-xs font-bold uppercase tracking-wider">
                                                {section.title}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setCurrentStep(section.step)
                                                }
                                                className="ml-auto font-mono text-[9px] text-primary hover:text-primary/70 uppercase tracking-wider"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {section.items.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-start gap-3"
                                                >
                                                    <span className="font-mono text-[10px] text-base-content/25 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">
                                                        {item.label}
                                                    </span>
                                                    <span
                                                        className={`font-mono text-xs ${item.value ? "text-base-content/60" : "text-base-content/20 italic"}`}
                                                    >
                                                        {item.value ||
                                                            "Not set"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="p-4 bg-warning/5 border border-warning/20 flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-info-circle text-warning text-sm mt-0.5" />
                                    <div>
                                        <p className="font-mono text-xs font-bold text-warning mb-1">
                                            Ready to publish?
                                        </p>
                                        <p className="font-mono text-[10px] text-warning/60">
                                            Once published, this job will be
                                            visible to{" "}
                                            {form.splitFeeEnabled
                                                ? "network recruiters"
                                                : "your organization only"}
                                            .
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-base-content/5">
                            <button
                                onClick={goPrev}
                                disabled={currentStep === 1}
                                className={`flex items-center gap-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider border transition-colors ${currentStep === 1 ? "border-base-content/5 text-base-content/15 cursor-not-allowed" : "border-base-content/10 text-base-content/40 hover:text-base-content/60 hover:border-base-content/20"}`}
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left text-[10px]" />
                                Previous
                            </button>
                            <div className="flex items-center gap-2">
                                <button className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-base-content/25 hover:text-base-content/40 transition-colors">
                                    Save Draft
                                </button>
                                {currentStep < 4 ? (
                                    <button
                                        onClick={goNext}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-content font-mono text-[10px] uppercase tracking-wider hover:opacity-80 transition-opacity"
                                    >
                                        Continue
                                        <i className="fa-duotone fa-regular fa-arrow-right text-[10px]" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-success text-success-content font-mono text-[10px] uppercase tracking-wider hover:opacity-80 transition-opacity disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="w-3 h-3 border border-success-content/30 border-t-success-content rounded-full animate-spin" />
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-duotone fa-regular fa-rocket text-[10px]" />
                                                Publish Job
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
