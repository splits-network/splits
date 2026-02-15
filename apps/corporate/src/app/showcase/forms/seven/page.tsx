"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormErrors {
    [key: string]: string;
}

const steps = [
    { id: "01", label: "ROLE SPEC", icon: "fa-duotone fa-regular fa-file-lines" },
    { id: "02", label: "REQUIREMENTS", icon: "fa-duotone fa-regular fa-list-check" },
    { id: "03", label: "COMPENSATION", icon: "fa-duotone fa-regular fa-coins" },
    { id: "04", label: "REVIEW", icon: "fa-duotone fa-regular fa-magnifying-glass-chart" },
];

const jobTypes = ["Full-Time", "Part-Time", "Contract", "Remote"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior", "Executive"];
const departments = [
    "Engineering", "Design", "Product", "Marketing", "Sales",
    "Data", "Security", "Infrastructure", "Finance", "Customer Success",
];
const benefits = [
    "Health Insurance", "Dental/Vision", "401k Match", "Equity/Stock Options",
    "Unlimited PTO", "Remote Flexibility", "Learning Budget", "Gym Membership",
    "Parental Leave", "Home Office Stipend", "Conference Budget", "Relocation Assistance",
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FormsSevenPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
    const [jobType, setJobType] = useState("");
    const [expLevel, setExpLevel] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-form-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-form-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-step-indicator", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06 }, "-=0.3");
            tl.fromTo(".bp-form-content", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.1");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    const animateStep = () => {
        if (!formRef.current) return;
        gsap.fromTo(formRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" });
    };

    const goNext = () => {
        // Simple validation for step 0
        if (currentStep === 0) {
            const newErrors: FormErrors = {};
            const title = (document.getElementById("job-title") as HTMLInputElement)?.value;
            if (!title) newErrors.title = "REQUIRED: Job title cannot be empty";
            if (!jobType) newErrors.type = "REQUIRED: Select a job type";
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }
        }
        setErrors({});
        setCurrentStep((s) => Math.min(s + 1, 3));
        setTimeout(animateStep, 10);
    };

    const goBack = () => {
        setErrors({});
        setCurrentStep((s) => Math.max(s - 1, 0));
        setTimeout(animateStep, 10);
    };

    const handleSubmit = () => {
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
        }, 2000);
    };

    const toggleBenefit = (b: string) => {
        setSelectedBenefits((prev) =>
            prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
        );
    };

    const inputClass = (field?: string) =>
        `w-full bg-[#0d1220] border ${errors[field || ""] ? "border-[#ef4444]/50" : "border-[#3b5ccc]/20"} text-[#c8ccd4] font-mono text-xs px-4 py-3 focus:outline-none focus:border-[#3b5ccc]/50 placeholder:text-[#c8ccd4]/15 tracking-wider`;

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59,92,204,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,92,204,0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-12 relative z-10">
                    {/* Header */}
                    <div className="max-w-4xl mx-auto mb-10">
                        <div className="bp-form-ref flex justify-between items-center mb-6 opacity-0">
                            <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-FORM07-2026</div>
                            <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                                DRAFT MODE
                            </div>
                        </div>

                        <h1 className="bp-form-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                            Create Job <span className="text-[#3b5ccc]">Posting</span>
                        </h1>
                        <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider">
                            // NEW ROLE SPECIFICATION INTAKE
                        </p>
                    </div>

                    {/* Step Indicators */}
                    <div className="max-w-4xl mx-auto mb-10">
                        <div className="flex items-center gap-0">
                            {steps.map((step, i) => (
                                <div key={step.id} className="bp-step-indicator flex-1 flex items-center opacity-0">
                                    <div
                                        className={`flex items-center gap-2 px-4 py-3 w-full border transition-colors cursor-pointer ${
                                            i === currentStep
                                                ? "border-[#3b5ccc]/40 bg-[#3b5ccc]/10"
                                                : i < currentStep
                                                    ? "border-[#22c55e]/20 bg-[#22c55e]/5"
                                                    : "border-[#3b5ccc]/10 bg-[#0d1220]"
                                        }`}
                                        onClick={() => { if (i <= currentStep) { setCurrentStep(i); setTimeout(animateStep, 10); } }}
                                    >
                                        <div className={`w-7 h-7 border flex items-center justify-center flex-shrink-0 ${
                                            i === currentStep
                                                ? "border-[#3b5ccc] text-[#3b5ccc]"
                                                : i < currentStep
                                                    ? "border-[#22c55e]/40 text-[#22c55e]"
                                                    : "border-[#c8ccd4]/10 text-[#c8ccd4]/20"
                                        }`}>
                                            {i < currentStep ? (
                                                <i className="fa-duotone fa-regular fa-check text-[10px]"></i>
                                            ) : (
                                                <span className="font-mono text-[10px] font-bold">{step.id}</span>
                                            )}
                                        </div>
                                        <span className={`hidden md:block font-mono text-[10px] tracking-widest ${
                                            i === currentStep ? "text-white" : i < currentStep ? "text-[#22c55e]/60" : "text-[#c8ccd4]/20"
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div ref={formRef} className="bp-form-content max-w-4xl mx-auto opacity-0">
                        {submitted ? (
                            /* Success State */
                            <div className="border border-[#22c55e]/30 bg-[#22c55e]/5 p-12 text-center">
                                <div className="w-16 h-16 border-2 border-[#22c55e] flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-duotone fa-regular fa-check text-2xl text-[#22c55e]"></i>
                                </div>
                                <div className="font-mono text-[10px] text-[#22c55e]/60 tracking-widest mb-3">
                                    // OPERATION COMPLETE
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">Job Posting Created</h2>
                                <p className="text-sm text-[#c8ccd4]/50 mb-8">
                                    Your role specification has been published to the network. Recruiters will begin receiving assignments.
                                </p>
                                <button
                                    onClick={() => { setSubmitted(false); setCurrentStep(0); }}
                                    className="px-6 py-3 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                                >
                                    CREATE_ANOTHER
                                </button>
                            </div>
                        ) : (
                            <div className="border border-[#3b5ccc]/20">
                                {/* Step 1: Role Specification */}
                                {currentStep === 0 && (
                                    <div className="p-8">
                                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-6">
                                            // STEP 01: ROLE SPECIFICATION
                                        </div>

                                        <div className="space-y-6">
                                            {/* Job Title */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">
                                                    JOB TITLE <span className="text-[#ef4444]">*</span>
                                                </label>
                                                <input id="job-title" type="text" placeholder="e.g. Senior Software Engineer" className={inputClass("title")} />
                                                {errors.title && (
                                                    <div className="mt-1.5 font-mono text-[10px] text-[#ef4444]/80 tracking-wider flex items-center gap-1.5">
                                                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-[8px]"></i>
                                                        {errors.title}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Company + Department */}
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">COMPANY</label>
                                                    <input type="text" placeholder="e.g. Acme Corp" className={inputClass()} />
                                                </div>
                                                <div>
                                                    <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">DEPARTMENT</label>
                                                    <select className={`${inputClass()} appearance-none cursor-pointer`}>
                                                        <option value="">Select department...</option>
                                                        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">LOCATION</label>
                                                <input type="text" placeholder="e.g. San Francisco, CA or Remote (US)" className={inputClass()} />
                                            </div>

                                            {/* Job Type - Radio */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-3">
                                                    JOB TYPE <span className="text-[#ef4444]">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {jobTypes.map((t) => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            onClick={() => { setJobType(t); setErrors((e) => { const n = { ...e }; delete n.type; return n; }); }}
                                                            className={`px-4 py-2.5 border font-mono text-[10px] tracking-widest transition-colors ${
                                                                jobType === t
                                                                    ? "border-[#3b5ccc] bg-[#3b5ccc]/10 text-[#3b5ccc]"
                                                                    : "border-[#3b5ccc]/15 text-[#c8ccd4]/40 hover:border-[#3b5ccc]/30 hover:text-[#c8ccd4]/60"
                                                            }`}
                                                        >
                                                            {t.toUpperCase().replace("-", "_")}
                                                        </button>
                                                    ))}
                                                </div>
                                                {errors.type && (
                                                    <div className="mt-1.5 font-mono text-[10px] text-[#ef4444]/80 tracking-wider flex items-center gap-1.5">
                                                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-[8px]"></i>
                                                        {errors.type}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Experience Level - Radio */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-3">EXPERIENCE LEVEL</label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {experienceLevels.map((l) => (
                                                        <button
                                                            key={l}
                                                            type="button"
                                                            onClick={() => setExpLevel(l)}
                                                            className={`px-4 py-2.5 border font-mono text-[10px] tracking-widest transition-colors ${
                                                                expLevel === l
                                                                    ? "border-[#14b8a6] bg-[#14b8a6]/10 text-[#14b8a6]"
                                                                    : "border-[#3b5ccc]/15 text-[#c8ccd4]/40 hover:border-[#3b5ccc]/30"
                                                            }`}
                                                        >
                                                            {l.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">DESCRIPTION</label>
                                                <textarea rows={5} placeholder="Describe the role, team, and impact..." className={inputClass()} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Requirements */}
                                {currentStep === 1 && (
                                    <div className="p-8">
                                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-6">
                                            // STEP 02: REQUIREMENTS &amp; RESPONSIBILITIES
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">
                                                    REQUIREMENTS <span className="font-mono text-[9px] text-[#c8ccd4]/20">(one per line)</span>
                                                </label>
                                                <textarea rows={6} placeholder={"5+ years of experience...\nStrong communication skills...\nProficiency in TypeScript..."} className={inputClass()} />
                                            </div>

                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">
                                                    RESPONSIBILITIES <span className="font-mono text-[9px] text-[#c8ccd4]/20">(one per line)</span>
                                                </label>
                                                <textarea rows={6} placeholder={"Lead design for critical flows...\nCollaborate with engineering...\nMentor junior team members..."} className={inputClass()} />
                                            </div>

                                            {/* Tags */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">
                                                    SKILLS / TAGS <span className="font-mono text-[9px] text-[#c8ccd4]/20">(comma separated)</span>
                                                </label>
                                                <input type="text" placeholder="React, TypeScript, Node.js, PostgreSQL..." className={inputClass()} />
                                            </div>

                                            {/* File upload */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">ATTACH JOB SPEC (OPTIONAL)</label>
                                                <div className="border border-dashed border-[#3b5ccc]/20 bg-[#0d1220] p-8 text-center cursor-pointer hover:border-[#3b5ccc]/40 transition-colors">
                                                    <i className="fa-duotone fa-regular fa-cloud-arrow-up text-2xl text-[#3b5ccc]/30 mb-3"></i>
                                                    <div className="font-mono text-xs text-[#c8ccd4]/30 tracking-wider">
                                                        DROP FILE OR CLICK TO UPLOAD
                                                    </div>
                                                    <div className="font-mono text-[9px] text-[#c8ccd4]/15 mt-1">
                                                        PDF, DOCX up to 10MB
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Compensation */}
                                {currentStep === 2 && (
                                    <div className="p-8">
                                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-6">
                                            // STEP 03: COMPENSATION &amp; BENEFITS
                                        </div>

                                        <div className="space-y-6">
                                            {/* Salary Range */}
                                            <div className="grid md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">SALARY MIN</label>
                                                    <input type="number" placeholder="120000" className={inputClass()} />
                                                </div>
                                                <div>
                                                    <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">SALARY MAX</label>
                                                    <input type="number" placeholder="180000" className={inputClass()} />
                                                </div>
                                                <div>
                                                    <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">CURRENCY</label>
                                                    <select className={`${inputClass()} appearance-none cursor-pointer`}>
                                                        <option value="USD">USD</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="GBP">GBP</option>
                                                        <option value="CAD">CAD</option>
                                                        <option value="AUD">AUD</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Equity */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">EQUITY RANGE (OPTIONAL)</label>
                                                <input type="text" placeholder="e.g. 0.05% - 0.15%" className={inputClass()} />
                                            </div>

                                            {/* Split Fee */}
                                            <div className="border border-[#14b8a6]/20 bg-[#14b8a6]/5 p-5">
                                                <div className="font-mono text-[10px] text-[#14b8a6]/60 tracking-widest mb-3">
                                                    // SPLIT-FEE CONFIGURATION
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">FEE PERCENTAGE</label>
                                                        <input type="text" placeholder="e.g. 20%" className={inputClass()} />
                                                    </div>
                                                    <div>
                                                        <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">SPLIT RATIO</label>
                                                        <input type="text" placeholder="e.g. 50/50" className={inputClass()} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Benefits - Checkboxes */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-3">BENEFITS PACKAGE</label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {benefits.map((b) => (
                                                        <button
                                                            key={b}
                                                            type="button"
                                                            onClick={() => toggleBenefit(b)}
                                                            className={`px-3 py-2 border font-mono text-[10px] tracking-wider text-left transition-colors flex items-center gap-2 ${
                                                                selectedBenefits.includes(b)
                                                                    ? "border-[#3b5ccc]/40 bg-[#3b5ccc]/10 text-[#3b5ccc]"
                                                                    : "border-[#3b5ccc]/10 text-[#c8ccd4]/30 hover:border-[#3b5ccc]/20"
                                                            }`}
                                                        >
                                                            <span className={`w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 ${
                                                                selectedBenefits.includes(b) ? "border-[#3b5ccc] bg-[#3b5ccc]" : "border-[#c8ccd4]/15"
                                                            }`}>
                                                                {selectedBenefits.includes(b) && <i className="fa-solid fa-check text-[7px] text-white"></i>}
                                                            </span>
                                                            {b}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Deadline */}
                                            <div>
                                                <label className="block font-mono text-[10px] text-[#c8ccd4]/50 tracking-widest mb-2">APPLICATION DEADLINE</label>
                                                <input type="date" className={inputClass()} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Review */}
                                {currentStep === 3 && (
                                    <div className="p-8">
                                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-6">
                                            // STEP 04: REVIEW &amp; PUBLISH
                                        </div>

                                        {/* Warning banner */}
                                        <div className="border border-[#eab308]/20 bg-[#eab308]/5 p-4 mb-6 flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-[#eab308] mt-0.5"></i>
                                            <div>
                                                <div className="font-mono text-[10px] text-[#eab308] tracking-widest mb-1">WARNING</div>
                                                <p className="text-xs text-[#c8ccd4]/50">
                                                    Review all details before publishing. This role will be visible to the entire recruiter network upon submission.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Review summary */}
                                        <div className="space-y-0 border border-[#3b5ccc]/20">
                                            {[
                                                { label: "JOB TITLE", value: "Senior Software Engineer", note: "Step 01" },
                                                { label: "COMPANY", value: "Acme Corp", note: "Step 01" },
                                                { label: "LOCATION", value: "San Francisco, CA", note: "Step 01" },
                                                { label: "TYPE", value: jobType || "Full-Time", note: "Step 01" },
                                                { label: "LEVEL", value: expLevel || "Senior", note: "Step 01" },
                                                { label: "SALARY", value: "USD 150K-200K", note: "Step 03" },
                                                { label: "BENEFITS", value: selectedBenefits.length > 0 ? `${selectedBenefits.length} selected` : "None selected", note: "Step 03" },
                                            ].map((row, i) => (
                                                <div key={row.label} className={`grid grid-cols-[140px_1fr_80px] gap-px ${i > 0 ? "border-t border-[#3b5ccc]/10" : ""}`}>
                                                    <div className="bg-[#0d1220] px-4 py-3 font-mono text-[10px] text-[#3b5ccc]/50 tracking-widest">{row.label}</div>
                                                    <div className="bg-[#0a0e17] px-4 py-3 font-mono text-xs text-white">{row.value}</div>
                                                    <div className="bg-[#0a0e17] px-4 py-3 font-mono text-[9px] text-[#c8ccd4]/20 tracking-wider text-right">{row.note}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Featured toggle */}
                                        <div className="mt-6 border border-[#3b5ccc]/15 p-4 flex items-center justify-between">
                                            <div>
                                                <div className="font-mono text-xs text-white">FEATURED LISTING</div>
                                                <div className="font-mono text-[9px] text-[#c8ccd4]/30 mt-0.5">
                                                    Boost visibility with priority placement in recruiter feeds
                                                </div>
                                            </div>
                                            <div className="w-10 h-5 border border-[#3b5ccc]/30 bg-[#0d1220] relative cursor-pointer">
                                                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-[#3b5ccc]/40"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Footer actions */}
                                <div className="border-t border-[#3b5ccc]/10 px-8 py-5 flex items-center justify-between">
                                    <button
                                        onClick={goBack}
                                        disabled={currentStep === 0}
                                        className={`px-5 py-2.5 border font-mono text-[10px] tracking-widest transition-colors ${
                                            currentStep === 0
                                                ? "border-[#c8ccd4]/5 text-[#c8ccd4]/10 cursor-not-allowed"
                                                : "border-[#c8ccd4]/20 text-[#c8ccd4]/50 hover:text-white hover:border-[#3b5ccc]/30"
                                        }`}
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-left text-[8px] mr-2"></i>
                                        PREV_STEP
                                    </button>

                                    <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">
                                        STEP {currentStep + 1} OF {steps.length}
                                    </div>

                                    {currentStep < 3 ? (
                                        <button
                                            onClick={goNext}
                                            className="px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                                        >
                                            NEXT_STEP
                                            <i className="fa-duotone fa-regular fa-arrow-right text-[8px] ml-2"></i>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className={`px-6 py-2.5 font-mono text-[10px] tracking-widest transition-colors border ${
                                                submitting
                                                    ? "bg-[#3b5ccc]/50 border-[#3b5ccc]/50 text-white/50 cursor-not-allowed"
                                                    : "bg-[#22c55e] border-[#22c55e] text-white hover:bg-[#22c55e]/90"
                                            }`}
                                        >
                                            {submitting ? (
                                                <><i className="fa-duotone fa-regular fa-spinner-third fa-spin text-[8px] mr-2"></i>PUBLISHING...</>
                                            ) : (
                                                <><i className="fa-duotone fa-regular fa-rocket text-[8px] mr-2"></i>PUBLISH_ROLE</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
