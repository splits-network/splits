"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// -- Data ---------------------------------------------------------------------

const jobCategories = [
    "Engineering", "Product", "Design", "Marketing", "Sales",
    "Operations", "Finance", "Human Resources", "Legal", "Customer Success",
];

const employmentTypes = [
    { value: "full-time", label: "Full-Time" },
    { value: "part-time", label: "Part-Time" },
    { value: "contract", label: "Contract" },
    { value: "temp-to-hire", label: "Temp-to-Hire" },
];

const experienceLevels = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "mid", label: "Mid Level (3-5 years)" },
    { value: "senior", label: "Senior (6-10 years)" },
    { value: "lead", label: "Lead / Principal (10+ years)" },
    { value: "executive", label: "Executive / C-Suite" },
];

const benefits = [
    "Health Insurance", "Dental & Vision", "401(k) Match", "Stock Options",
    "Remote Work", "Flexible Hours", "Unlimited PTO", "Professional Development",
    "Gym Membership", "Relocation Assistance", "Signing Bonus", "Parental Leave",
];

const steps = [
    { num: "01", label: "Role Details", icon: "fa-duotone fa-regular fa-briefcase" },
    { num: "02", label: "Requirements", icon: "fa-duotone fa-regular fa-list-check" },
    { num: "03", label: "Compensation", icon: "fa-duotone fa-regular fa-money-check-dollar" },
    { num: "04", label: "Review & Post", icon: "fa-duotone fa-regular fa-paper-plane" },
];

// -- Component ----------------------------------------------------------------

export default function FormsNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form field states
    const [title, setTitle] = useState("");
    const [titleError, setTitleError] = useState("");
    const [category, setCategory] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [remote, setRemote] = useState(false);
    const [employmentType, setEmploymentType] = useState("full-time");
    const [experience, setExperience] = useState("");
    const [skills, setSkills] = useState("");
    const [education, setEducation] = useState("");
    const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
    const [salaryMin, setSalaryMin] = useState("");
    const [salaryMax, setSalaryMax] = useState("");
    const [salaryError, setSalaryError] = useState("");
    const [feePercent, setFeePercent] = useState("20");
    const [resume, setResume] = useState<string | null>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo($1(".form-nine-ref"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6 });
            tl.fromTo($1(".form-nine-title"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.0 }, "-=0.3");
            tl.fromTo($1(".form-nine-stepper"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5");
            tl.fromTo($1(".form-nine-body"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3");
        },
        { scope: containerRef },
    );

    const validateStep0 = () => {
        let valid = true;
        if (!title.trim()) { setTitleError("Job title is required"); valid = false; } else { setTitleError(""); }
        if (!category) { setCategoryError("Select a category"); valid = false; } else { setCategoryError(""); }
        return valid;
    };

    const validateStep2 = () => {
        if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
            setSalaryError("Minimum cannot exceed maximum"); return false;
        }
        setSalaryError(""); return true;
    };

    const nextStep = () => {
        if (currentStep === 0 && !validateStep0()) return;
        if (currentStep === 2 && !validateStep2()) return;
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        setSubmitting(true);
        setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 2000);
    };

    const toggleBenefit = (b: string) => {
        setSelectedBenefits((prev) =>
            prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
        );
    };

    const FieldLabel = ({ label, required, ref: refId }: { label: string; required?: boolean; ref?: string }) => (
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-[#0f1b3d]">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {refId && <span className="font-mono text-[9px] text-[#233876]/15">{refId}</span>}
        </div>
    );

    const inputBase = "w-full px-4 py-2.5 border-2 text-sm bg-white outline-none text-[#0f1b3d] transition-colors placeholder-[#0f1b3d]/25";
    const inputNormal = `${inputBase} border-[#233876]/10 focus:border-[#233876]/30`;
    const inputError = `${inputBase} border-red-400 focus:border-red-500`;
    const inputSuccess = `${inputBase} border-emerald-400 focus:border-emerald-500`;

    return (
        <div ref={containerRef} className="min-h-screen bg-white">
            {/* Header */}
            <section className="relative py-16 bg-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/10 pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="form-nine-ref mb-4 opacity-0">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase">REF: EN-FORM-09 // Job Posting</span>
                        </div>
                        <div className="form-nine-title opacity-0">
                            <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] leading-tight mb-4">
                                Create <span className="text-[#233876]">Job Posting</span>
                            </h1>
                            <p className="text-lg text-[#0f1b3d]/50 max-w-xl">Define your role, set your terms, and publish to the recruiter network.</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">v9.0</div>
            </section>

            {/* Stepper */}
            <section className="relative py-6 bg-[#f7f8fa] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#233876 1px, transparent 1px), linear-gradient(90deg, #233876 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="form-nine-stepper max-w-4xl mx-auto opacity-0">
                        <div className="grid grid-cols-4 gap-px bg-[#233876]/10">
                            {steps.map((step, i) => (
                                <button
                                    key={i}
                                    onClick={() => { if (i < currentStep) setCurrentStep(i); }}
                                    className={`flex items-center gap-3 px-5 py-4 transition-colors relative ${
                                        i === currentStep ? "bg-white" : i < currentStep ? "bg-white/80 cursor-pointer" : "bg-[#f7f8fa]"
                                    }`}
                                >
                                    <div className={`w-8 h-8 border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                        i === currentStep ? "border-[#233876] bg-[#233876]" : i < currentStep ? "border-emerald-500 bg-emerald-500" : "border-[#233876]/15"
                                    }`}>
                                        {i < currentStep ? (
                                            <i className="fa-regular fa-check text-xs text-white" />
                                        ) : (
                                            <span className={`font-mono text-[10px] font-bold ${i === currentStep ? "text-white" : "text-[#233876]/30"}`}>{step.num}</span>
                                        )}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <div className={`text-xs font-semibold ${i === currentStep ? "text-[#0f1b3d]" : i < currentStep ? "text-emerald-600" : "text-[#0f1b3d]/30"}`}>
                                            {step.label}
                                        </div>
                                    </div>
                                    {i === currentStep && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#233876]" />}
                                    {i < currentStep && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Form Body */}
            <section className="relative py-12 bg-white overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (<div key={i} className="absolute left-0 right-0 border-t border-dashed border-[#233876]/4" style={{ top: `${(i + 1) * 11}%` }} />))}
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="form-nine-body max-w-4xl mx-auto opacity-0">
                        {submitted ? (
                            /* Success state */
                            <div className="border-2 border-emerald-500/20 bg-white p-12 relative text-center">
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-500/40" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-500/40" />
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-500/40" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-500/40" />
                                <div className="w-16 h-16 border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-regular fa-check text-2xl text-white" />
                                </div>
                                <div className="font-mono text-xs tracking-[0.3em] text-emerald-600/60 uppercase mb-3">Job Posted Successfully</div>
                                <h2 className="text-3xl font-bold text-[#0f1b3d] mb-3">{title || "New Role"}</h2>
                                <p className="text-sm text-[#0f1b3d]/40 mb-8 max-w-md mx-auto">Your job posting is now live. Recruiters in the network will be notified and can begin sourcing candidates immediately.</p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={() => { setSubmitted(false); setCurrentStep(0); }} className="px-6 py-2.5 border-2 border-[#233876]/20 text-sm text-[#233876] hover:border-[#233876] transition-colors font-medium">
                                        Post Another
                                    </button>
                                    <button className="px-6 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium">
                                        View Posting <i className="fa-regular fa-arrow-right text-xs ml-1" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-[#233876]/10 bg-white relative">
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                                <div className="p-8">
                                    {/* Step 0: Role Details */}
                                    {currentStep === 0 && (
                                        <div className="space-y-6">
                                            <div className="border-b border-dashed border-[#233876]/10 pb-4 mb-6">
                                                <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Step 01 of 04</div>
                                                <h2 className="text-2xl font-bold text-[#0f1b3d]">Role Details</h2>
                                            </div>

                                            <div>
                                                <FieldLabel label="Job Title" required ref="FLD-01" />
                                                <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setTitleError(""); }} placeholder="e.g. Senior Software Engineer" className={titleError ? inputError : title ? inputSuccess : inputNormal} />
                                                {titleError && <div className="flex items-center gap-2 mt-1.5"><i className="fa-regular fa-circle-exclamation text-xs text-red-500" /><span className="text-xs text-red-500">{titleError}</span></div>}
                                                {title && !titleError && <div className="flex items-center gap-2 mt-1.5"><i className="fa-regular fa-circle-check text-xs text-emerald-500" /><span className="text-xs text-emerald-500">Looks good</span></div>}
                                            </div>

                                            <div>
                                                <FieldLabel label="Category" required ref="FLD-02" />
                                                <select value={category} onChange={(e) => { setCategory(e.target.value); setCategoryError(""); }} className={categoryError ? inputError : category ? inputSuccess : inputNormal}>
                                                    <option value="">Select category...</option>
                                                    {jobCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
                                                </select>
                                                {categoryError && <div className="flex items-center gap-2 mt-1.5"><i className="fa-regular fa-circle-exclamation text-xs text-red-500" /><span className="text-xs text-red-500">{categoryError}</span></div>}
                                            </div>

                                            <div>
                                                <FieldLabel label="Description" ref="FLD-03" />
                                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe the role, responsibilities, and what makes this opportunity unique..." className={inputNormal + " resize-none"} />
                                                <div className="font-mono text-[9px] text-[#233876]/20 mt-1 text-right">{description.length}/2000</div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <FieldLabel label="Location" ref="FLD-04" />
                                                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" className={inputNormal} />
                                                </div>
                                                <div>
                                                    <FieldLabel label="Remote Work" ref="FLD-05" />
                                                    <label className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#233876]/10 cursor-pointer hover:border-[#233876]/20 transition-colors">
                                                        <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${remote ? "border-[#233876] bg-[#233876]" : "border-[#233876]/20"}`}>
                                                            {remote && <i className="fa-regular fa-check text-[10px] text-white" />}
                                                        </div>
                                                        <span className="text-sm text-[#0f1b3d]/60">This role supports remote work</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <FieldLabel label="Employment Type" ref="FLD-06" />
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#233876]/10">
                                                    {employmentTypes.map((t) => (
                                                        <label key={t.value} className={`flex items-center justify-center gap-2 px-4 py-3 cursor-pointer transition-colors ${employmentType === t.value ? "bg-[#233876] text-white" : "bg-white text-[#0f1b3d]/50 hover:bg-[#233876]/[0.03]"}`}>
                                                            <input type="radio" name="empType" value={t.value} checked={employmentType === t.value} onChange={(e) => setEmploymentType(e.target.value)} className="hidden" />
                                                            <span className="text-sm font-medium">{t.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 1: Requirements */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div className="border-b border-dashed border-[#233876]/10 pb-4 mb-6">
                                                <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Step 02 of 04</div>
                                                <h2 className="text-2xl font-bold text-[#0f1b3d]">Requirements</h2>
                                            </div>

                                            <div>
                                                <FieldLabel label="Experience Level" ref="FLD-07" />
                                                <select value={experience} onChange={(e) => setExperience(e.target.value)} className={inputNormal}>
                                                    <option value="">Select level...</option>
                                                    {experienceLevels.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                                                </select>
                                            </div>

                                            <div>
                                                <FieldLabel label="Required Skills" ref="FLD-08" />
                                                <textarea value={skills} onChange={(e) => setSkills(e.target.value)} rows={3} placeholder="e.g. React, TypeScript, Node.js, PostgreSQL..." className={inputNormal + " resize-none"} />
                                                <div className="font-mono text-[9px] text-[#233876]/20 mt-1">Separate skills with commas</div>
                                            </div>

                                            <div>
                                                <FieldLabel label="Education" ref="FLD-09" />
                                                <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. Bachelor's in Computer Science or equivalent" className={inputNormal} />
                                            </div>

                                            <div>
                                                <FieldLabel label="Job Description Document" ref="FLD-10" />
                                                <div className={`border-2 border-dashed ${resume ? "border-emerald-400 bg-emerald-50/30" : "border-[#233876]/15"} p-8 text-center transition-colors`}>
                                                    {resume ? (
                                                        <div>
                                                            <div className="w-10 h-10 border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center mx-auto mb-3">
                                                                <i className="fa-regular fa-file-check text-white" />
                                                            </div>
                                                            <div className="text-sm font-semibold text-[#0f1b3d] mb-1">{resume}</div>
                                                            <button onClick={() => setResume(null)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Remove file</button>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center mx-auto mb-3">
                                                                <i className="fa-duotone fa-regular fa-cloud-arrow-up text-[#233876]/40" />
                                                            </div>
                                                            <div className="text-sm text-[#0f1b3d]/50 mb-1">Drop your file here or click to browse</div>
                                                            <div className="font-mono text-[9px] text-[#233876]/20">PDF, DOCX up to 10MB</div>
                                                            <button onClick={() => setResume("Job_Description_v2.pdf")} className="mt-3 px-4 py-1.5 border border-[#233876]/15 text-xs text-[#233876]/50 hover:border-[#233876]/30 transition-colors">
                                                                Browse Files
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Compensation */}
                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <div className="border-b border-dashed border-[#233876]/10 pb-4 mb-6">
                                                <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Step 03 of 04</div>
                                                <h2 className="text-2xl font-bold text-[#0f1b3d]">Compensation & Benefits</h2>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <FieldLabel label="Salary Minimum ($)" ref="FLD-11" />
                                                    <input type="number" value={salaryMin} onChange={(e) => { setSalaryMin(e.target.value); setSalaryError(""); }} placeholder="80,000" className={salaryError ? inputError : inputNormal} />
                                                </div>
                                                <div>
                                                    <FieldLabel label="Salary Maximum ($)" ref="FLD-12" />
                                                    <input type="number" value={salaryMax} onChange={(e) => { setSalaryMax(e.target.value); setSalaryError(""); }} placeholder="120,000" className={salaryError ? inputError : inputNormal} />
                                                </div>
                                            </div>
                                            {salaryError && <div className="flex items-center gap-2"><i className="fa-regular fa-circle-exclamation text-xs text-red-500" /><span className="text-xs text-red-500">{salaryError}</span></div>}

                                            <div>
                                                <FieldLabel label="Recruiter Fee (%)" ref="FLD-13" />
                                                <div className="flex items-center gap-4">
                                                    <input type="range" min="10" max="30" value={feePercent} onChange={(e) => setFeePercent(e.target.value)} className="flex-1 accent-[#233876]" />
                                                    <div className="w-16 h-10 border-2 border-[#233876]/15 flex items-center justify-center">
                                                        <span className="font-mono text-sm font-bold text-[#233876]">{feePercent}%</span>
                                                    </div>
                                                </div>
                                                <div className="font-mono text-[9px] text-[#233876]/20 mt-1">Industry standard: 15-25%</div>
                                            </div>

                                            <div>
                                                <FieldLabel label="Benefits" ref="FLD-14" />
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {benefits.map((b) => (
                                                        <label key={b} onClick={() => toggleBenefit(b)} className={`flex items-center gap-2 px-3 py-2 border cursor-pointer transition-colors ${selectedBenefits.includes(b) ? "border-[#233876]/30 bg-[#233876]/[0.04]" : "border-[#233876]/8 hover:border-[#233876]/15"}`}>
                                                            <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${selectedBenefits.includes(b) ? "border-[#233876] bg-[#233876]" : "border-[#233876]/20"}`}>
                                                                {selectedBenefits.includes(b) && <i className="fa-regular fa-check text-[8px] text-white" />}
                                                            </div>
                                                            <span className="text-xs text-[#0f1b3d]/60">{b}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="font-mono text-[9px] text-[#233876]/20 mt-2">{selectedBenefits.length} selected</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Review */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6">
                                            <div className="border-b border-dashed border-[#233876]/10 pb-4 mb-6">
                                                <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Step 04 of 04</div>
                                                <h2 className="text-2xl font-bold text-[#0f1b3d]">Review & Post</h2>
                                            </div>

                                            {/* Warning banner */}
                                            <div className="flex items-start gap-3 p-4 border-2 border-amber-400/30 bg-amber-50/30">
                                                <div className="w-8 h-8 border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
                                                    <i className="fa-regular fa-triangle-exclamation text-sm text-amber-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-[#0f1b3d] mb-0.5">Review before posting</div>
                                                    <p className="text-xs text-[#0f1b3d]/40">Once posted, this role will be visible to all recruiters in the network. You can edit details after posting.</p>
                                                </div>
                                            </div>

                                            <div className="space-y-px bg-[#233876]/10">
                                                {[
                                                    { label: "Job Title", value: title || "Not set", icon: "fa-regular fa-briefcase" },
                                                    { label: "Category", value: category || "Not set", icon: "fa-regular fa-tag" },
                                                    { label: "Location", value: `${location || "Not set"}${remote ? " (Remote)" : ""}`, icon: "fa-regular fa-location-dot" },
                                                    { label: "Employment", value: employmentTypes.find((t) => t.value === employmentType)?.label || "", icon: "fa-regular fa-clock" },
                                                    { label: "Experience", value: experienceLevels.find((l) => l.value === experience)?.label || "Not set", icon: "fa-regular fa-chart-simple" },
                                                    { label: "Salary Range", value: salaryMin && salaryMax ? `$${Number(salaryMin).toLocaleString()} - $${Number(salaryMax).toLocaleString()}` : "Not set", icon: "fa-regular fa-money-bill" },
                                                    { label: "Recruiter Fee", value: `${feePercent}%`, icon: "fa-regular fa-percent" },
                                                    { label: "Benefits", value: selectedBenefits.length > 0 ? `${selectedBenefits.length} selected` : "None", icon: "fa-regular fa-heart" },
                                                ].map((row, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-white">
                                                        <div className="flex items-center gap-3">
                                                            <i className={`${row.icon} text-xs text-[#233876]/40 w-4`} />
                                                            <span className="text-sm text-[#0f1b3d]/50">{row.label}</span>
                                                        </div>
                                                        <span className={`text-sm font-medium ${row.value === "Not set" || row.value === "None" ? "text-[#0f1b3d]/25" : "text-[#0f1b3d]"}`}>{row.value}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {description && (
                                                <div className="border border-[#233876]/8 p-4">
                                                    <div className="font-mono text-[9px] text-[#233876]/25 tracking-wider uppercase mb-2">Description</div>
                                                    <p className="text-sm text-[#0f1b3d]/50 leading-relaxed">{description}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Navigation */}
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-dashed border-[#233876]/10">
                                        <button onClick={prevStep} disabled={currentStep === 0} className={`px-6 py-2.5 border-2 text-sm font-medium transition-colors ${currentStep === 0 ? "border-[#233876]/5 text-[#0f1b3d]/15 cursor-not-allowed" : "border-[#233876]/20 text-[#233876] hover:border-[#233876]"}`}>
                                            <i className="fa-regular fa-arrow-left text-xs mr-2" />Back
                                        </button>
                                        <div className="font-mono text-[10px] text-[#233876]/20 tracking-wider">
                                            {currentStep + 1} / {steps.length}
                                        </div>
                                        {currentStep < 3 ? (
                                            <button onClick={nextStep} className="px-6 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium">
                                                Continue<i className="fa-regular fa-arrow-right text-xs ml-2" />
                                            </button>
                                        ) : (
                                            <button onClick={handleSubmit} disabled={submitting} className="px-8 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium flex items-center gap-2">
                                                {submitting ? (
                                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />Publishing...</>
                                                ) : (
                                                    <>Publish Job<i className="fa-regular fa-paper-plane text-xs" /></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Reference bar */}
            <section className="relative py-6 bg-[#f7f8fa]">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">EMPLOYMENT NETWORKS // FORM v9.0</span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">CLEAN ARCHITECTURE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
