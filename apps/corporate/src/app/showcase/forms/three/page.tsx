"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ── Animation constants ──────────────────────────────────────────────────────
const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };

// ── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;
type ValidationState = "idle" | "error" | "success" | "warning";

interface FieldState {
    value: string;
    validation: ValidationState;
    message?: string;
}

// ── Step definitions ─────────────────────────────────────────────────────────
const steps = [
    { number: "01", label: "Role Details", icon: "fa-briefcase" },
    { number: "02", label: "Requirements", icon: "fa-list-check" },
    { number: "03", label: "Compensation", icon: "fa-money-bill" },
    { number: "04", label: "Review & Submit", icon: "fa-paper-plane" },
];

// ── Validation indicator ─────────────────────────────────────────────────────
function ValidationBadge({ state, message }: { state: ValidationState; message?: string }) {
    if (state === "idle") return null;

    const config = {
        error: { icon: "fa-circle-xmark", color: "text-error", bg: "bg-error/5", border: "border-error/20" },
        success: { icon: "fa-circle-check", color: "text-success", bg: "bg-success/5", border: "border-success/20" },
        warning: { icon: "fa-triangle-exclamation", color: "text-warning", bg: "bg-warning/5", border: "border-warning/20" },
    }[state]!;

    return (
        <div className={`flex items-center gap-2 mt-2 px-3 py-2 ${config.bg} border ${config.border}`}>
            <i className={`fa-duotone fa-regular ${config.icon} text-xs ${config.color}`} />
            <span className={`text-[10px] uppercase tracking-[0.1em] font-bold ${config.color}`}>
                {message}
            </span>
        </div>
    );
}

// ── Form field wrapper ───────────────────────────────────────────────────────
function FormField({
    label,
    required,
    hint,
    children,
    validation,
    validationMessage,
    className = "",
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
    validation?: ValidationState;
    validationMessage?: string;
    className?: string;
}) {
    return (
        <div className={`form-field ${className}`}>
            <div className="flex items-baseline justify-between mb-2">
                <label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </label>
                {hint && (
                    <span className="text-[9px] text-base-content/25 tracking-wide">{hint}</span>
                )}
            </div>
            {children}
            {validation && validation !== "idle" && (
                <ValidationBadge state={validation} message={validationMessage} />
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 1 — Role Details
// ═════════════════════════════════════════════════════════════════════════════

function StepRoleDetails({
    fields,
    setField,
}: {
    fields: Record<string, FieldState>;
    setField: (key: string, value: string) => void;
}) {
    const inputClass = (v: ValidationState) =>
        `w-full px-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none transition-colors border-2 ${
            v === "error"
                ? "border-error/40 focus:border-error"
                : v === "success"
                    ? "border-success/40 focus:border-success"
                    : "border-transparent focus:border-neutral"
        } placeholder:text-base-content/25`;

    return (
        <div className="space-y-6">
            <FormField
                label="Job Title"
                required
                validation={fields.title?.validation}
                validationMessage={fields.title?.message}
            >
                <input
                    type="text"
                    placeholder="e.g., Senior Frontend Engineer"
                    value={fields.title?.value || ""}
                    onChange={(e) => setField("title", e.target.value)}
                    className={inputClass(fields.title?.validation || "idle")}
                />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    label="Company"
                    required
                    validation={fields.company?.validation}
                    validationMessage={fields.company?.message}
                >
                    <input
                        type="text"
                        placeholder="Company name"
                        value={fields.company?.value || ""}
                        onChange={(e) => setField("company", e.target.value)}
                        className={inputClass(fields.company?.validation || "idle")}
                    />
                </FormField>

                <FormField label="Department" hint="Optional">
                    <input
                        type="text"
                        placeholder="e.g., Engineering"
                        value={fields.department?.value || ""}
                        onChange={(e) => setField("department", e.target.value)}
                        className={inputClass("idle")}
                    />
                </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Location" required>
                    <input
                        type="text"
                        placeholder="City, State or Remote"
                        value={fields.location?.value || ""}
                        onChange={(e) => setField("location", e.target.value)}
                        className={inputClass("idle")}
                    />
                </FormField>

                <FormField label="Employment Type" required>
                    <select
                        value={fields.type?.value || ""}
                        onChange={(e) => setField("type", e.target.value)}
                        className="w-full px-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral cursor-pointer"
                    >
                        <option value="">Select type</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="remote">Remote</option>
                    </select>
                </FormField>
            </div>

            <FormField label="Job Description" required hint="Markdown supported">
                <textarea
                    rows={6}
                    placeholder="Describe the role, responsibilities, and what makes it exciting..."
                    value={fields.description?.value || ""}
                    onChange={(e) => setField("description", e.target.value)}
                    className="w-full px-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral placeholder:text-base-content/25 resize-none"
                />
            </FormField>

            {/* File upload */}
            <FormField label="Job Description Document" hint="PDF, DOCX up to 10MB">
                <div className="border-2 border-dashed border-neutral/15 p-8 text-center hover:border-neutral/30 transition-colors cursor-pointer">
                    <i className="fa-duotone fa-regular fa-cloud-arrow-up text-2xl text-base-content/15 mb-3 block" />
                    <p className="text-xs font-bold tracking-tight text-base-content/40 mb-1">
                        Drop file here or click to upload
                    </p>
                    <p className="text-[9px] text-base-content/25 uppercase tracking-[0.15em]">
                        PDF, DOCX / Max 10MB
                    </p>
                </div>
            </FormField>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 2 — Requirements
// ═════════════════════════════════════════════════════════════════════════════

function StepRequirements() {
    const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js"]);
    const [newSkill, setNewSkill] = useState("");

    const experienceLevels = [
        { value: "entry", label: "Entry Level", desc: "0-2 years" },
        { value: "mid", label: "Mid Level", desc: "3-5 years" },
        { value: "senior", label: "Senior", desc: "5-8 years" },
        { value: "lead", label: "Lead / Staff", desc: "8+ years" },
    ];

    const [selectedLevel, setSelectedLevel] = useState("senior");

    const benefits = [
        { id: "health", label: "Health Insurance", icon: "fa-heart-pulse" },
        { id: "dental", label: "Dental & Vision", icon: "fa-tooth" },
        { id: "401k", label: "401(k) Match", icon: "fa-piggy-bank" },
        { id: "pto", label: "Unlimited PTO", icon: "fa-umbrella-beach" },
        { id: "remote", label: "Remote Work", icon: "fa-house-laptop" },
        { id: "equity", label: "Equity Package", icon: "fa-chart-line" },
        { id: "learning", label: "Learning Budget", icon: "fa-book-open" },
        { id: "gym", label: "Gym Membership", icon: "fa-dumbbell" },
    ];

    const [selectedBenefits, setSelectedBenefits] = useState<string[]>(["health", "pto", "remote", "equity"]);

    const toggleBenefit = (id: string) => {
        setSelectedBenefits((prev) =>
            prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
        );
    };

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    return (
        <div className="space-y-8">
            {/* Experience Level - Radio */}
            <FormField label="Experience Level" required>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10">
                    {experienceLevels.map((level) => (
                        <button
                            key={level.value}
                            onClick={() => setSelectedLevel(level.value)}
                            className={`p-4 text-left transition-colors ${
                                selectedLevel === level.value
                                    ? "bg-neutral text-neutral-content"
                                    : "bg-base-100 hover:bg-base-200"
                            }`}
                        >
                            <div className={`text-xs font-black tracking-tight mb-0.5 ${
                                selectedLevel === level.value ? "" : ""
                            }`}>
                                {level.label}
                            </div>
                            <div className={`text-[9px] uppercase tracking-[0.15em] ${
                                selectedLevel === level.value
                                    ? "text-neutral-content/50"
                                    : "text-base-content/30"
                            }`}>
                                {level.desc}
                            </div>
                        </button>
                    ))}
                </div>
            </FormField>

            {/* Skills - Tag input */}
            <FormField label="Required Skills" required hint={`${skills.length} added`}>
                <div className="flex flex-wrap gap-[2px] mb-3">
                    {skills.map((skill) => (
                        <span
                            key={skill}
                            className="flex items-center gap-2 px-3 py-1.5 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.15em] font-bold"
                        >
                            {skill}
                            <button
                                onClick={() => setSkills(skills.filter((s) => s !== skill))}
                                className="text-neutral-content/40 hover:text-neutral-content transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-xmark text-[9px]" />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-[2px]">
                    <input
                        type="text"
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        className="flex-1 px-4 py-2.5 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral placeholder:text-base-content/25"
                    />
                    <button
                        onClick={addSkill}
                        className="px-4 py-2.5 bg-base-200 text-base-content/40 hover:text-base-content transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-plus text-xs" />
                    </button>
                </div>
            </FormField>

            {/* Benefits - Checkboxes */}
            <FormField label="Benefits Offered" hint="Select all that apply">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10">
                    {benefits.map((benefit) => (
                        <button
                            key={benefit.id}
                            onClick={() => toggleBenefit(benefit.id)}
                            className={`p-4 flex items-center gap-3 text-left transition-colors ${
                                selectedBenefits.includes(benefit.id)
                                    ? "bg-neutral text-neutral-content"
                                    : "bg-base-100 text-base-content/40 hover:bg-base-200"
                            }`}
                        >
                            <i className={`fa-duotone fa-regular ${benefit.icon} text-sm ${
                                selectedBenefits.includes(benefit.id) ? "" : "opacity-40"
                            }`} />
                            <span className="text-[10px] uppercase tracking-[0.1em] font-bold">
                                {benefit.label}
                            </span>
                        </button>
                    ))}
                </div>
            </FormField>

            {/* Additional requirements */}
            <FormField label="Additional Requirements" hint="Optional">
                <textarea
                    rows={4}
                    placeholder="Any additional qualifications, certifications, or requirements..."
                    className="w-full px-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral placeholder:text-base-content/25 resize-none"
                />
            </FormField>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 3 — Compensation
// ═════════════════════════════════════════════════════════════════════════════

function StepCompensation() {
    const [salaryMin, setSalaryMin] = useState("120000");
    const [salaryMax, setSalaryMax] = useState("180000");
    const [currency, setCurrency] = useState("USD");
    const [splitFee, setSplitFee] = useState("20");
    const [showSalary, setShowSalary] = useState(true);

    return (
        <div className="space-y-8">
            {/* Salary range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Salary Minimum" required>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 text-sm font-bold">$</span>
                        <input
                            type="text"
                            value={salaryMin}
                            onChange={(e) => setSalaryMin(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral"
                        />
                    </div>
                </FormField>

                <FormField label="Salary Maximum" required>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 text-sm font-bold">$</span>
                        <input
                            type="text"
                            value={salaryMax}
                            onChange={(e) => setSalaryMax(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral"
                        />
                    </div>
                </FormField>

                <FormField label="Currency">
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral cursor-pointer"
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                    </select>
                </FormField>
            </div>

            {/* Show salary toggle */}
            <div className="flex items-center justify-between p-4 bg-base-200">
                <div>
                    <p className="text-xs font-bold tracking-tight">Display Salary on Listing</p>
                    <p className="text-[9px] text-base-content/30 uppercase tracking-[0.1em] mt-0.5">
                        Listings with visible salary get 40% more applications
                    </p>
                </div>
                <button
                    onClick={() => setShowSalary(!showSalary)}
                    className={`w-10 h-5 rounded-none relative transition-colors ${
                        showSalary ? "bg-neutral" : "bg-base-300"
                    }`}
                >
                    <div
                        className={`absolute top-0.5 w-4 h-4 transition-all ${
                            showSalary
                                ? "left-5.5 bg-neutral-content"
                                : "left-0.5 bg-base-content/30"
                        }`}
                    />
                </button>
            </div>

            {/* Split fee */}
            <FormField label="Split Fee Percentage" required>
                <div className="grid grid-cols-5 gap-[2px] bg-neutral/10">
                    {["15", "20", "25", "30", "Custom"].map((fee) => (
                        <button
                            key={fee}
                            onClick={() => fee !== "Custom" && setSplitFee(fee)}
                            className={`py-4 text-center transition-colors ${
                                splitFee === fee
                                    ? "bg-neutral text-neutral-content"
                                    : "bg-base-100 hover:bg-base-200 text-base-content/40"
                            }`}
                        >
                            <div className="text-lg font-black tracking-tighter">
                                {fee === "Custom" ? "?" : `${fee}%`}
                            </div>
                            <div className={`text-[8px] uppercase tracking-[0.15em] mt-0.5 ${
                                splitFee === fee ? "text-neutral-content/50" : "text-base-content/20"
                            }`}>
                                {fee === "Custom" ? "Custom" : "Split"}
                            </div>
                        </button>
                    ))}
                </div>
            </FormField>

            {/* Fee preview */}
            <div className="border-2 border-neutral/10 p-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-4">
                    Fee Calculation Preview
                </p>
                <div className="grid grid-cols-3 gap-[2px] bg-neutral/10">
                    <div className="bg-base-100 p-4 text-center">
                        <div className="text-2xl font-black tracking-tighter">
                            ${Math.round(parseInt(salaryMax || "0") * parseInt(splitFee || "0") / 100).toLocaleString()}
                        </div>
                        <div className="text-[8px] uppercase tracking-[0.2em] text-base-content/30 mt-1">
                            Max Fee
                        </div>
                    </div>
                    <div className="bg-base-100 p-4 text-center">
                        <div className="text-2xl font-black tracking-tighter">{splitFee}%</div>
                        <div className="text-[8px] uppercase tracking-[0.2em] text-base-content/30 mt-1">
                            Split Rate
                        </div>
                    </div>
                    <div className="bg-base-100 p-4 text-center">
                        <div className="text-2xl font-black tracking-tighter">
                            ${(parseInt(salaryMin || "0")).toLocaleString()} - ${(parseInt(salaryMax || "0")).toLocaleString()}
                        </div>
                        <div className="text-[8px] uppercase tracking-[0.2em] text-base-content/30 mt-1">
                            Salary Range
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 4 — Review
// ═════════════════════════════════════════════════════════════════════════════

function StepReview({ onSubmit, submitting }: { onSubmit: () => void; submitting: boolean }) {
    return (
        <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-neutral/10">
                <div className="bg-base-100 p-6">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                        Role Details
                    </p>
                    <h3 className="text-lg font-black tracking-tight mb-1">Senior Frontend Engineer</h3>
                    <p className="text-xs text-base-content/40">Stripe / San Francisco, CA</p>
                    <p className="text-xs text-base-content/40 mt-1">Full-time / Engineering</p>
                </div>
                <div className="bg-base-100 p-6">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                        Compensation
                    </p>
                    <h3 className="text-lg font-black tracking-tight mb-1">$120K - $180K</h3>
                    <p className="text-xs text-base-content/40">USD / 20% split fee</p>
                    <p className="text-xs text-base-content/40 mt-1">Max placement fee: $36,000</p>
                </div>
                <div className="bg-base-100 p-6">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                        Requirements
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {["React", "TypeScript", "Node.js"].map((skill) => (
                            <span key={skill} className="px-2 py-0.5 bg-base-200 text-[9px] uppercase tracking-[0.1em] font-bold text-base-content/50">
                                {skill}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-base-content/40 mt-2">Senior level / 5-8 years</p>
                </div>
                <div className="bg-base-100 p-6">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                        Benefits
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {["Health", "PTO", "Remote", "Equity"].map((b) => (
                            <span key={b} className="px-2 py-0.5 bg-base-200 text-[9px] uppercase tracking-[0.1em] font-bold text-base-content/50">
                                {b}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Terms checkbox */}
            <div className="border-2 border-neutral/10 p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                    <div className="w-5 h-5 border-2 border-neutral flex items-center justify-center flex-shrink-0 mt-0.5 bg-neutral text-neutral-content">
                        <i className="fa-duotone fa-regular fa-check text-[9px]" />
                    </div>
                    <div>
                        <p className="text-xs font-bold tracking-tight">
                            I confirm this listing is accurate and agree to the Terms of Service
                        </p>
                        <p className="text-[9px] text-base-content/30 mt-1 tracking-wide">
                            By submitting, you agree to the split-fee terms and marketplace guidelines.
                        </p>
                    </div>
                </label>
            </div>

            {/* Submit */}
            <button
                onClick={onSubmit}
                disabled={submitting}
                className="w-full py-4 bg-neutral text-neutral-content text-[11px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {submitting ? (
                    <>
                        <span className="w-4 h-4 border-2 border-neutral-content/30 border-t-neutral-content animate-spin" />
                        Publishing Role...
                    </>
                ) : (
                    <>
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                        Publish Job Listing
                    </>
                )}
            </button>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function FormsThreePage() {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [fields, setFields] = useState<Record<string, FieldState>>({
        title: { value: "Senior Frontend Engineer", validation: "success", message: "Title looks good" },
        company: { value: "Stripe", validation: "success", message: "Company verified" },
        department: { value: "Engineering", validation: "idle" },
        location: { value: "", validation: "warning", message: "Location recommended for better visibility" },
        type: { value: "full-time", validation: "idle" },
        description: { value: "", validation: "idle" },
    });

    const setField = (key: string, value: string) => {
        setFields((prev) => ({
            ...prev,
            [key]: { ...prev[key], value },
        }));
    };

    const animateStepChange = (newStep: Step) => {
        if (!contentRef.current || newStep === currentStep) return;
        gsap.to(contentRef.current, {
            opacity: 0,
            x: newStep > currentStep ? 30 : -30,
            duration: D.fast,
            ease: E.precise,
            onComplete: () => {
                setCurrentStep(newStep);
                gsap.fromTo(
                    contentRef.current,
                    { opacity: 0, x: newStep > currentStep ? -30 : 30 },
                    { opacity: 1, x: 0, duration: D.normal, ease: E.precise },
                );
            },
        });
    };

    const handleSubmit = () => {
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
        }, 2500);
    };

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: E.precise } });
            tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
            tl.fromTo($1(".page-title"), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.3");
            tl.fromTo($1(".page-divider"), { scaleX: 0 }, { scaleX: 1, duration: D.normal, transformOrigin: "left center" }, "-=0.2");
            tl.fromTo($(".step-indicator"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.06 }, "-=0.2");
            tl.fromTo($(".form-field"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.04 }, "-=0.1");
        },
        { scope: containerRef },
    );

    if (submitted) {
        return (
            <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 bg-neutral text-neutral-content flex items-center justify-center mx-auto mb-6">
                        <i className="fa-duotone fa-regular fa-check text-2xl" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-3">Role Published</h2>
                    <p className="text-sm text-base-content/40 mb-6">
                        Your job listing is now live on the marketplace. Recruiters in your network will be notified.
                    </p>
                    <div className="flex gap-[2px] justify-center">
                        <button
                            onClick={() => { setSubmitted(false); setCurrentStep(1); }}
                            className="px-5 py-3 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.25em] font-black hover:bg-primary hover:text-primary-content transition-colors"
                        >
                            Create Another
                        </button>
                        <button className="px-5 py-3 bg-base-200 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/40 hover:text-base-content transition-colors">
                            View Listing
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            {/* ── HEADER ─────────────────────────────────────── */}
            <header className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-12 pb-8">
                    <div className="flex items-end gap-4 mb-6">
                        <span className="page-number opacity-0 text-6xl lg:text-8xl font-black tracking-tighter text-neutral/6 select-none leading-none">
                            F3
                        </span>
                        <div className="page-title opacity-0 pb-1">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-1">
                                Create Listing
                            </p>
                            <h1 className="text-2xl lg:text-4xl font-black tracking-tight">
                                Post a New Role
                            </h1>
                        </div>
                    </div>
                    <div className="page-divider h-[2px] bg-neutral/20" style={{ transformOrigin: "left center" }} />

                    {/* Step indicators */}
                    <div className="flex items-center gap-0 mt-6 overflow-x-auto">
                        {steps.map((step, i) => {
                            const stepNum = (i + 1) as Step;
                            const isActive = currentStep === stepNum;
                            const isComplete = currentStep > stepNum;

                            return (
                                <button
                                    key={step.number}
                                    onClick={() => animateStepChange(stepNum)}
                                    className={`step-indicator opacity-0 flex items-center gap-3 px-5 py-3 transition-colors whitespace-nowrap ${
                                        isActive
                                            ? "bg-neutral text-neutral-content"
                                            : isComplete
                                                ? "bg-base-200 text-base-content"
                                                : "text-base-content/30 hover:bg-base-200"
                                    }`}
                                >
                                    <span className={`text-lg font-black tracking-tighter ${
                                        isActive ? "" : isComplete ? "text-base-content/50" : "text-base-content/15"
                                    }`}>
                                        {step.number}
                                    </span>
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase tracking-[0.15em] font-bold">
                                            {step.label}
                                        </div>
                                    </div>
                                    {isComplete && (
                                        <i className="fa-duotone fa-regular fa-check text-xs ml-1 text-success" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ── FORM CONTENT ───────────────────────────────── */}
            <div className="px-6 lg:px-12 py-10">
                <div className="max-w-4xl">
                    <div ref={contentRef}>
                        {currentStep === 1 && <StepRoleDetails fields={fields} setField={setField} />}
                        {currentStep === 2 && <StepRequirements />}
                        {currentStep === 3 && <StepCompensation />}
                        {currentStep === 4 && <StepReview onSubmit={handleSubmit} submitting={submitting} />}
                    </div>

                    {/* Navigation */}
                    {currentStep < 4 && (
                        <div className="flex items-center justify-between mt-10 pt-6 border-t-2 border-neutral/10">
                            <button
                                onClick={() => currentStep > 1 && animateStepChange((currentStep - 1) as Step)}
                                disabled={currentStep === 1}
                                className="flex items-center gap-2 px-5 py-3 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/30 hover:text-base-content disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left text-xs" />
                                Previous
                            </button>

                            <div className="text-[9px] uppercase tracking-[0.2em] text-base-content/20 font-bold">
                                Step {currentStep} of 4
                            </div>

                            <button
                                onClick={() => animateStepChange((currentStep + 1) as Step)}
                                className="flex items-center gap-2 px-5 py-3 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.25em] font-black hover:bg-primary hover:text-primary-content transition-colors"
                            >
                                Next Step
                                <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
