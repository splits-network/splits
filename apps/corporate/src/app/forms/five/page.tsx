"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

interface FormData {
    // Step 1 - Role basics
    title: string;
    company: string;
    department: string;
    location: string;
    type: string;
    experienceLevel: string;
    // Step 2 - Compensation
    salaryMin: string;
    salaryMax: string;
    currency: string;
    equity: string;
    benefits: string[];
    // Step 3 - Description
    description: string;
    requirements: string;
    responsibilities: string;
    tags: string;
    // Step 4 - Recruiter & Settings
    recruiterName: string;
    recruiterEmail: string;
    agency: string;
    deadline: string;
    featured: boolean;
    splitFee: string;
    visibility: string;
}

const initialForm: FormData = {
    title: "", company: "", department: "", location: "", type: "", experienceLevel: "",
    salaryMin: "", salaryMax: "", currency: "USD", equity: "", benefits: [],
    description: "", requirements: "", responsibilities: "", tags: "",
    recruiterName: "", recruiterEmail: "", agency: "", deadline: "", featured: false, splitFee: "", visibility: "public",
};

const steps: { label: string; icon: string }[] = [
    { label: "Role Basics", icon: "fa-duotone fa-regular fa-briefcase" },
    { label: "Compensation", icon: "fa-duotone fa-regular fa-money-bill" },
    { label: "Details", icon: "fa-duotone fa-regular fa-file-lines" },
    { label: "Settings", icon: "fa-duotone fa-regular fa-gear" },
];

const benefitOptions = [
    "Health Insurance", "Dental/Vision", "401k Match", "Unlimited PTO",
    "Remote Flexibility", "Learning Budget", "Equity Package", "Gym Membership",
    "Commuter Benefits", "Parental Leave", "Home Office Stipend", "Wellness Programs",
];

const departments = ["Engineering", "Design", "Product", "Marketing", "Sales", "Data", "Operations", "Finance", "Customer Success", "Security"];

// ─── Validation ───────────────────────────────────────────────────────────────

interface FieldError {
    field: string;
    message: string;
}

function validateStep(step: Step, data: FormData): FieldError[] {
    const errors: FieldError[] = [];
    if (step === 1) {
        if (!data.title.trim()) errors.push({ field: "title", message: "Role title is required" });
        if (!data.company.trim()) errors.push({ field: "company", message: "Company name is required" });
        if (!data.department) errors.push({ field: "department", message: "Select a department" });
        if (!data.location.trim()) errors.push({ field: "location", message: "Location is required" });
        if (!data.type) errors.push({ field: "type", message: "Select a job type" });
    }
    if (step === 2) {
        if (!data.salaryMin.trim()) errors.push({ field: "salaryMin", message: "Minimum salary is required" });
        if (!data.salaryMax.trim()) errors.push({ field: "salaryMax", message: "Maximum salary is required" });
        if (data.salaryMin && data.salaryMax && Number(data.salaryMin) > Number(data.salaryMax)) {
            errors.push({ field: "salaryMax", message: "Max must be greater than min" });
        }
    }
    if (step === 3) {
        if (!data.description.trim()) errors.push({ field: "description", message: "Description is required" });
        if (data.description.trim().length < 50) errors.push({ field: "description", message: "At least 50 characters" });
    }
    if (step === 4) {
        if (!data.recruiterName.trim()) errors.push({ field: "recruiterName", message: "Recruiter name is required" });
        if (!data.recruiterEmail.trim()) errors.push({ field: "recruiterEmail", message: "Email is required" });
        if (data.recruiterEmail && !data.recruiterEmail.includes("@")) errors.push({ field: "recruiterEmail", message: "Invalid email address" });
        if (!data.deadline) errors.push({ field: "deadline", message: "Application deadline is required" });
    }
    return errors;
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function FormsFivePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [form, setForm] = useState<FormData>(initialForm);
    const [errors, setErrors] = useState<FieldError[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [touched, setTouched] = useState<Set<string>>(new Set());

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".opacity-0"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(".form-header", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
            tl.fromTo(".step-indicator", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.06 }, "-=0.2");
            tl.fromTo(".form-body", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.1");
        },
        { scope: containerRef },
    );

    const update = (field: keyof FormData, value: string | boolean | string[]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setTouched((prev) => new Set(prev).add(field));
    };

    const fieldError = (field: string) => errors.find((e) => e.field === field);
    const hasError = (field: string) => touched.has(field) && !!fieldError(field);

    const inputCls = (field: string) =>
        `w-full bg-[#18181b] border ${hasError(field) ? "border-error/50" : "border-[#27272a]"} rounded-lg px-3 py-2.5 text-sm text-[#e5e7eb] placeholder-[#e5e7eb]/15 font-mono focus:outline-none ${hasError(field) ? "focus:border-error/70" : "focus:border-info/30"} transition-colors`;

    const goNext = () => {
        const stepErrors = validateStep(currentStep, form);
        setErrors(stepErrors);
        // Touch all fields for this step
        const stepFields: Record<Step, string[]> = {
            1: ["title", "company", "department", "location", "type"],
            2: ["salaryMin", "salaryMax"],
            3: ["description"],
            4: ["recruiterName", "recruiterEmail", "deadline"],
        };
        setTouched((prev) => {
            const next = new Set(prev);
            stepFields[currentStep].forEach((f) => next.add(f));
            return next;
        });
        if (stepErrors.length === 0 && currentStep < 4) {
            setCurrentStep((s) => (s + 1) as Step);
            gsap.fromTo(".form-body", { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" });
        }
    };

    const goPrev = () => {
        if (currentStep > 1) {
            setCurrentStep((s) => (s - 1) as Step);
            setErrors([]);
            gsap.fromTo(".form-body", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" });
        }
    };

    const handleSubmit = () => {
        const stepErrors = validateStep(4, form);
        setErrors(stepErrors);
        setTouched((prev) => {
            const next = new Set(prev);
            ["recruiterName", "recruiterEmail", "deadline"].forEach((f) => next.add(f));
            return next;
        });
        if (stepErrors.length > 0) return;
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
            gsap.fromTo(".success-panel", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" });
        }, 2000);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div ref={containerRef} className="min-h-screen bg-[#09090b] text-[#e5e7eb] flex items-center justify-center p-4">
                <div className="success-panel max-w-lg w-full border border-success/20 bg-[#18181b]/60 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 rounded-xl bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
                        <i className="fa-duotone fa-regular fa-check text-2xl text-success" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Role Published</h2>
                    <p className="text-sm text-[#e5e7eb]/40 mb-6 font-mono">
                        Signal transmitted successfully. Your role is now live on the network.
                    </p>
                    <div className="border border-[#27272a] bg-[#09090b] rounded-lg p-4 mb-6 text-left">
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-2">Transmission Summary</div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-[#e5e7eb]/50">Title</span><span className="font-bold">{form.title}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-[#e5e7eb]/50">Company</span><span className="font-bold">{form.company}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-[#e5e7eb]/50">Salary</span><span className="font-mono text-info">{form.currency} {form.salaryMin} - {form.salaryMax}</span></div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setSubmitted(false); setForm(initialForm); setCurrentStep(1); setTouched(new Set()); }} className="flex-1 btn btn-outline border-[#27272a] text-[#e5e7eb]/50 font-mono text-xs uppercase tracking-wider hover:border-info/30 hover:text-info">
                            <i className="fa-duotone fa-regular fa-plus" /> New Role
                        </button>
                        <button className="flex-1 btn btn-info font-mono text-xs uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-eye" /> View Listing
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-[#09090b] text-[#e5e7eb]">
            {/* Scanline */}
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)" }} />

            <div className="container mx-auto px-4 py-10 max-w-3xl">
                {/* Header */}
                <div className="form-header mb-8 opacity-0">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">Transmission Active</span>
                        <span className="font-mono text-xs text-[#e5e7eb]/20 ml-auto">v2.4.1 // new-role</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="text-[#e5e7eb]">Create </span>
                        <span className="text-info">Role</span>
                    </h1>
                    <p className="text-sm text-[#e5e7eb]/40 font-mono">
                        Broadcast a new role signal across the recruiting network.
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((step, i) => {
                        const stepNum = (i + 1) as Step;
                        const isActive = stepNum === currentStep;
                        const isComplete = stepNum < currentStep;
                        return (
                            <div key={i} className="step-indicator flex items-center gap-2 flex-1 opacity-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-colors ${
                                    isActive ? "border-info/40 bg-info/10 text-info" : isComplete ? "border-success/40 bg-success/10 text-success" : "border-[#27272a] bg-[#18181b] text-[#e5e7eb]/20"
                                }`}>
                                    {isComplete ? <i className="fa-duotone fa-regular fa-check text-xs" /> : <i className={`${step.icon} text-xs`} />}
                                </div>
                                <div className="hidden md:block min-w-0">
                                    <div className={`font-mono text-[9px] uppercase tracking-wider ${isActive ? "text-info" : isComplete ? "text-success/60" : "text-[#e5e7eb]/20"}`}>
                                        Step {stepNum}
                                    </div>
                                    <div className={`text-xs truncate ${isActive ? "text-[#e5e7eb] font-bold" : "text-[#e5e7eb]/30"}`}>{step.label}</div>
                                </div>
                                {i < steps.length - 1 && <div className={`hidden md:block h-px flex-1 ${isComplete ? "bg-success/30" : "bg-[#27272a]"}`} />}
                            </div>
                        );
                    })}
                </div>

                {/* Form body */}
                <div className="form-body border border-[#27272a] bg-[#18181b]/40 rounded-xl p-6 md:p-8 mb-6 opacity-0">
                    {/* Terminal header */}
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#27272a]/50">
                        <span className="w-3 h-3 rounded-full bg-error/60" />
                        <span className="w-3 h-3 rounded-full bg-warning/60" />
                        <span className="w-3 h-3 rounded-full bg-success/60" />
                        <span className="font-mono text-xs text-[#e5e7eb]/20 ml-3">
                            {steps[currentStep - 1].label.toLowerCase().replace(" ", "-")}.config
                        </span>
                        <span className="ml-auto font-mono text-[9px] text-[#e5e7eb]/15 uppercase tracking-wider">
                            {currentStep} of {steps.length}
                        </span>
                    </div>

                    {/* Step 1: Role Basics */}
                    {currentStep === 1 && (
                        <div className="space-y-5">
                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Role Title *</label>
                                <input type="text" placeholder="e.g. Senior Product Designer" value={form.title} onChange={(e) => update("title", e.target.value)} className={inputCls("title")} />
                                {hasError("title") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("title")?.message}</span>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Company *</label>
                                    <input type="text" placeholder="e.g. Stripe" value={form.company} onChange={(e) => update("company", e.target.value)} className={inputCls("company")} />
                                    {hasError("company") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("company")?.message}</span>}
                                </div>
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Department *</label>
                                    <select value={form.department} onChange={(e) => update("department", e.target.value)} className={inputCls("department") + " appearance-none cursor-pointer"}>
                                        <option value="">Select department</option>
                                        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    {hasError("department") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("department")?.message}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Location *</label>
                                <div className="relative">
                                    <i className="fa-duotone fa-regular fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-[#e5e7eb]/15 text-xs" />
                                    <input type="text" placeholder="e.g. San Francisco, CA or Remote" value={form.location} onChange={(e) => update("location", e.target.value)} className={inputCls("location").replace("px-3", "pl-9 pr-3")} />
                                </div>
                                {hasError("location") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("location")?.message}</span>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Job Type *</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["full-time", "part-time", "contract", "remote"].map((t) => (
                                            <button key={t} onClick={() => update("type", t)} className={`py-2 px-3 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors ${form.type === t ? "border-info/40 bg-info/10 text-info" : "border-[#27272a] bg-[#09090b] text-[#e5e7eb]/30 hover:border-[#e5e7eb]/10"}`}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    {hasError("type") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("type")?.message}</span>}
                                </div>
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Experience Level</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["entry", "mid", "senior", "executive"].map((l) => (
                                            <button key={l} onClick={() => update("experienceLevel", l)} className={`py-2 px-3 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors ${form.experienceLevel === l ? "border-warning/40 bg-warning/10 text-warning" : "border-[#27272a] bg-[#09090b] text-[#e5e7eb]/30 hover:border-[#e5e7eb]/10"}`}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Compensation */}
                    {currentStep === 2 && (
                        <div className="space-y-5">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Currency</label>
                                    <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className={inputCls("currency") + " appearance-none cursor-pointer"}>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="CAD">CAD</option>
                                        <option value="AUD">AUD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Min Salary *</label>
                                    <input type="number" placeholder="e.g. 120000" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} className={inputCls("salaryMin")} />
                                    {hasError("salaryMin") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("salaryMin")?.message}</span>}
                                </div>
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Max Salary *</label>
                                    <input type="number" placeholder="e.g. 180000" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} className={inputCls("salaryMax")} />
                                    {hasError("salaryMax") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("salaryMax")?.message}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Equity Range</label>
                                <input type="text" placeholder="e.g. 0.05% - 0.15%" value={form.equity} onChange={(e) => update("equity", e.target.value)} className={inputCls("equity")} />
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-3 block">Benefits</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {benefitOptions.map((b) => {
                                        const selected = form.benefits.includes(b);
                                        return (
                                            <button
                                                key={b}
                                                onClick={() => update("benefits", selected ? form.benefits.filter((x) => x !== b) : [...form.benefits, b])}
                                                className={`py-2 px-3 rounded-lg border text-[11px] text-left transition-colors ${selected ? "border-success/30 bg-success/10 text-success" : "border-[#27272a] bg-[#09090b] text-[#e5e7eb]/30 hover:border-[#e5e7eb]/10"}`}
                                            >
                                                <i className={`fa-duotone fa-regular ${selected ? "fa-check" : "fa-plus"} text-[9px] mr-1.5`} />
                                                {b}
                                            </button>
                                        );
                                    })}
                                </div>
                                {form.benefits.length > 0 && (
                                    <div className="mt-2 font-mono text-[10px] text-success/50">{form.benefits.length} selected</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {currentStep === 3 && (
                        <div className="space-y-5">
                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">
                                    Description *
                                    <span className="text-[#e5e7eb]/15 ml-2 normal-case tracking-normal">(min 50 chars)</span>
                                </label>
                                <textarea rows={5} placeholder="Describe the role, team, and impact..." value={form.description} onChange={(e) => update("description", e.target.value)} className={inputCls("description") + " resize-none"} />
                                <div className="flex justify-between mt-1">
                                    {hasError("description") && <span className="font-mono text-[10px] text-error/70">{fieldError("description")?.message}</span>}
                                    <span className={`font-mono text-[10px] ml-auto ${form.description.length >= 50 ? "text-success/50" : "text-[#e5e7eb]/15"}`}>{form.description.length} chars</span>
                                </div>
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Requirements</label>
                                <textarea rows={4} placeholder="One requirement per line..." value={form.requirements} onChange={(e) => update("requirements", e.target.value)} className={inputCls("requirements") + " resize-none"} />
                                <span className="font-mono text-[10px] text-[#e5e7eb]/15 mt-1 block">Separate with line breaks</span>
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Responsibilities</label>
                                <textarea rows={4} placeholder="One responsibility per line..." value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} className={inputCls("responsibilities") + " resize-none"} />
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Skills / Tags</label>
                                <input type="text" placeholder="e.g. React, TypeScript, Figma (comma separated)" value={form.tags} onChange={(e) => update("tags", e.target.value)} className={inputCls("tags")} />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Settings */}
                    {currentStep === 4 && (
                        <div className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Recruiter Name *</label>
                                    <input type="text" placeholder="e.g. Sarah Chen" value={form.recruiterName} onChange={(e) => update("recruiterName", e.target.value)} className={inputCls("recruiterName")} />
                                    {hasError("recruiterName") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("recruiterName")?.message}</span>}
                                </div>
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Recruiter Email *</label>
                                    <input type="email" placeholder="recruiter@agency.com" value={form.recruiterEmail} onChange={(e) => update("recruiterEmail", e.target.value)} className={inputCls("recruiterEmail")} />
                                    {hasError("recruiterEmail") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("recruiterEmail")?.message}</span>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Agency</label>
                                    <input type="text" placeholder="e.g. TechHire Partners" value={form.agency} onChange={(e) => update("agency", e.target.value)} className={inputCls("agency")} />
                                </div>
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Application Deadline *</label>
                                    <input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} className={inputCls("deadline")} />
                                    {hasError("deadline") && <span className="font-mono text-[10px] text-error/70 mt-1 block">{fieldError("deadline")?.message}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-2 block">Split-Fee Percentage</label>
                                <input type="text" placeholder="e.g. 50/50 or 60/40" value={form.splitFee} onChange={(e) => update("splitFee", e.target.value)} className={inputCls("splitFee")} />
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-3 block">Visibility</label>
                                <div className="flex gap-3">
                                    {[
                                        { value: "public", label: "Public", icon: "fa-duotone fa-regular fa-globe", desc: "Visible to all recruiters" },
                                        { value: "network", label: "Network Only", icon: "fa-duotone fa-regular fa-circle-nodes", desc: "Your connections only" },
                                        { value: "private", label: "Private", icon: "fa-duotone fa-regular fa-lock", desc: "Invite-only access" },
                                    ].map((v) => (
                                        <button key={v.value} onClick={() => update("visibility", v.value)} className={`flex-1 py-3 px-3 rounded-lg border text-center transition-colors ${form.visibility === v.value ? "border-info/40 bg-info/10" : "border-[#27272a] bg-[#09090b] hover:border-[#e5e7eb]/10"}`}>
                                            <i className={`${v.icon} text-sm mb-1 block ${form.visibility === v.value ? "text-info" : "text-[#e5e7eb]/20"}`} />
                                            <div className={`text-xs font-bold mb-0.5 ${form.visibility === v.value ? "text-info" : "text-[#e5e7eb]/40"}`}>{v.label}</div>
                                            <div className="font-mono text-[8px] text-[#e5e7eb]/20">{v.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg border border-[#27272a] bg-[#09090b]">
                                <button onClick={() => update("featured", !form.featured)} className={`w-10 h-5 rounded-full transition-colors relative ${form.featured ? "bg-info/30" : "bg-[#27272a]"}`}>
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${form.featured ? "left-5 bg-info" : "left-0.5 bg-[#e5e7eb]/30"}`} />
                                </button>
                                <div>
                                    <div className="text-xs font-bold text-[#e5e7eb]/70">Featured Listing</div>
                                    <div className="font-mono text-[9px] text-[#e5e7eb]/25">Boost visibility across the network</div>
                                </div>
                                {form.featured && <i className="fa-duotone fa-regular fa-star text-warning text-sm ml-auto" />}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button onClick={goPrev} disabled={currentStep === 1} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors ${currentStep === 1 ? "border-[#27272a]/50 text-[#e5e7eb]/15 cursor-not-allowed" : "border-[#27272a] text-[#e5e7eb]/50 hover:text-[#e5e7eb] hover:border-info/30"}`}>
                        <i className="fa-duotone fa-regular fa-chevron-left text-[10px]" /> Previous
                    </button>

                    {errors.length > 0 && (
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-xs" />
                            <span className="font-mono text-[10px] text-error/70">{errors.length} field{errors.length > 1 ? "s" : ""} need attention</span>
                        </div>
                    )}

                    {currentStep < 4 ? (
                        <button onClick={goNext} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-info/10 border border-info/20 text-info text-xs font-mono uppercase tracking-wider hover:bg-info/20 transition-colors">
                            Next <i className="fa-duotone fa-regular fa-chevron-right text-[10px]" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-info/10 border border-info/20 text-info text-xs font-mono uppercase tracking-wider hover:bg-info/20 transition-colors disabled:opacity-50">
                            {submitting ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-info/30 border-t-info rounded-full animate-spin" />
                                    Transmitting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-satellite-dish text-[10px]" />
                                    Publish Role
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
