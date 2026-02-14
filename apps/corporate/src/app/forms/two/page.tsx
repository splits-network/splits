"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

interface FormData {
    title: string;
    company: string;
    department: string;
    location: string;
    locationType: string;
    employmentType: string;
    experienceLevel: string;
    salaryMin: string;
    salaryMax: string;
    currency: string;
    description: string;
    requirements: string;
    benefits: string;
    skills: string[];
    splitFee: string;
    splitModel: string;
    urgency: string;
    headcount: string;
    confidential: boolean;
    featured: boolean;
    autoMatch: boolean;
    notifyNetwork: boolean;
    resumeRequired: boolean;
    coverLetterRequired: boolean;
}

interface FieldError {
    field: string;
    message: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const steps = [
    { number: 1, label: "Role Details" },
    { number: 2, label: "Compensation" },
    { number: 3, label: "Description" },
    { number: 4, label: "Network Settings" },
    { number: 5, label: "Review & Post" },
];

const departments = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations", "Finance", "Legal", "HR", "Data Science"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior", "Staff", "Principal", "Director", "VP", "C-Level"];
const popularSkills = ["React", "TypeScript", "Node.js", "Python", "AWS", "Kubernetes", "GraphQL", "PostgreSQL", "Go", "Rust", "Docker", "Terraform", "Machine Learning", "System Design", "Leadership", "Agile"];

/* ─── Validation ─────────────────────────────────────────────────────────────── */

function validateStep(step: number, data: FormData): FieldError[] {
    const errors: FieldError[] = [];
    if (step === 1) {
        if (!data.title.trim()) errors.push({ field: "title", message: "Job title is required" });
        if (!data.company.trim()) errors.push({ field: "company", message: "Company name is required" });
        if (!data.location.trim()) errors.push({ field: "location", message: "Location is required" });
        if (!data.employmentType) errors.push({ field: "employmentType", message: "Select employment type" });
    }
    if (step === 2) {
        if (!data.salaryMin.trim()) errors.push({ field: "salaryMin", message: "Minimum salary is required" });
        if (!data.salaryMax.trim()) errors.push({ field: "salaryMax", message: "Maximum salary is required" });
        if (data.salaryMin && data.salaryMax && Number(data.salaryMin) > Number(data.salaryMax)) {
            errors.push({ field: "salaryMax", message: "Max must exceed min salary" });
        }
    }
    if (step === 3) {
        if (!data.description.trim()) errors.push({ field: "description", message: "Job description is required" });
        if (data.skills.length === 0) errors.push({ field: "skills", message: "Select at least one skill" });
    }
    return errors;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function FormsTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<FieldError[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        title: "", company: "", department: "", location: "", locationType: "hybrid",
        employmentType: "", experienceLevel: "", salaryMin: "", salaryMax: "", currency: "USD",
        description: "", requirements: "", benefits: "", skills: [],
        splitFee: "20", splitModel: "50-50", urgency: "standard", headcount: "1",
        confidential: false, featured: false, autoMatch: true, notifyNetwork: true,
        resumeRequired: true, coverLetterRequired: false,
    });

    const update = (field: keyof FormData, value: string | boolean | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (showValidation) setErrors((prev) => prev.filter((e) => e.field !== field));
    };

    const toggleSkill = (skill: string) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
        }));
    };

    const fieldError = (field: string) => errors.find((e) => e.field === field);

    useGSAP(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.from("[data-page-header]", { y: -30, opacity: 0, duration: 0.7, ease: "power3.out" });
        gsap.from("[data-step-indicator]", { y: -15, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.2 });
        gsap.from("[data-form-panel]", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.4 });
        gsap.from("[data-sidebar-panel]", { x: 30, opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.5 });
    }, { scope: containerRef });

    const goNext = () => {
        const stepErrors = validateStep(currentStep, formData);
        if (stepErrors.length > 0) { setErrors(stepErrors); setShowValidation(true); return; }
        setErrors([]); setShowValidation(false);
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const goPrev = () => {
        if (currentStep > 1) { setCurrentStep(currentStep - 1); setErrors([]); setShowValidation(false); }
    };

    const handleSubmit = () => {
        setSubmitting(true);
        setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 2000);
    };

    if (submitted) {
        return (
            <div ref={containerRef} className="min-h-screen bg-base-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                        <i className="fa-duotone fa-regular fa-check text-3xl text-success" />
                    </div>
                    <h2 className="text-2xl font-bold text-base-content mb-3">Job Posted Successfully</h2>
                    <p className="text-sm text-base-content/50 leading-relaxed mb-2">
                        <span className="font-semibold text-base-content/70">{formData.title}</span> at <span className="font-semibold text-base-content/70">{formData.company}</span> is now live.
                    </p>
                    <p className="text-sm text-base-content/40 mb-8">{formData.notifyNetwork ? "Your recruiting network has been notified." : "The listing is visible on the marketplace."}</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => { setSubmitted(false); setCurrentStep(1); }} className="px-6 py-3 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">Post Another Job</button>
                        <button className="px-6 py-3 border border-base-300 text-base-content/60 text-sm font-medium rounded-lg hover:border-base-content/30 transition-colors">View Listing</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            <div data-page-header className="border-b border-base-300 bg-base-100">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
                    <button className="flex items-center gap-2 text-xs text-base-content/40 hover:text-base-content/60 transition-colors mb-4"><i className="fa-duotone fa-regular fa-arrow-left text-[10px]" /> Back to Jobs</button>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-base-content/30 font-semibold mb-2">New Listing</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">Create Job Posting</h1>
                </div>
            </div>

            <div className="border-b border-base-200 bg-base-100">
                <div className="max-w-6xl mx-auto px-6 md:px-10">
                    <div className="flex overflow-x-auto gap-0">
                        {steps.map((step) => {
                            const isActive = step.number === currentStep;
                            const isCompleted = step.number < currentStep;
                            return (
                                <button key={step.number} data-step-indicator onClick={() => { if (step.number < currentStep) { setCurrentStep(step.number); setErrors([]); } }}
                                    className={`flex items-center gap-2.5 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${isActive ? "border-b-base-content text-base-content" : isCompleted ? "border-b-secondary/40 text-secondary cursor-pointer" : "border-b-transparent text-base-content/30"}`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? "bg-base-content text-base-100" : isCompleted ? "bg-secondary/15 text-secondary" : "bg-base-200 text-base-content/30"}`}>
                                        {isCompleted ? <i className="fa-duotone fa-regular fa-check text-[9px]" /> : step.number}
                                    </span>
                                    <span className="hidden md:inline">{step.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div data-form-panel className="flex-1 min-w-0">
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <StepHeader title="Role Details" desc="Define the position you are hiring for." />
                                <FormField label="Job Title" required error={fieldError("title")}>
                                    <input type="text" value={formData.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Senior Frontend Engineer" className={inputCls(fieldError("title"))} />
                                </FormField>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField label="Company" required error={fieldError("company")}>
                                        <input type="text" value={formData.company} onChange={(e) => update("company", e.target.value)} placeholder="Company name" className={inputCls(fieldError("company"))} />
                                    </FormField>
                                    <FormField label="Department">
                                        <select value={formData.department} onChange={(e) => update("department", e.target.value)} className={inputCls()}><option value="">Select department</option>{departments.map((d) => <option key={d} value={d}>{d}</option>)}</select>
                                    </FormField>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField label="Location" required error={fieldError("location")}>
                                        <input type="text" value={formData.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. San Francisco, CA" className={inputCls(fieldError("location"))} />
                                    </FormField>
                                    <FormField label="Location Type">
                                        <div className="flex gap-2">
                                            {["remote", "hybrid", "onsite"].map((opt) => (
                                                <button key={opt} onClick={() => update("locationType", opt)} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-[0.1em] transition-all ${formData.locationType === opt ? "bg-base-content text-base-100" : "bg-base-200/50 text-base-content/40 hover:bg-base-200"}`}>{opt}</button>
                                            ))}
                                        </div>
                                    </FormField>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField label="Employment Type" required error={fieldError("employmentType")}>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Full-time", "Part-time", "Contract", "Freelance"].map((type) => (
                                                <button key={type} onClick={() => update("employmentType", type)} className={`py-2.5 rounded-lg text-xs font-semibold transition-all border ${formData.employmentType === type ? "border-base-content bg-base-content text-base-100" : fieldError("employmentType") ? "border-error/30 bg-error/5 text-base-content/40" : "border-base-300 bg-base-100 text-base-content/50 hover:border-base-content/30"}`}>{type}</button>
                                            ))}
                                        </div>
                                    </FormField>
                                    <FormField label="Experience Level">
                                        <select value={formData.experienceLevel} onChange={(e) => update("experienceLevel", e.target.value)} className={inputCls()}><option value="">Select level</option>{experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}</select>
                                    </FormField>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <StepHeader title="Compensation" desc="Set the salary range and fee structure." />
                                <FormField label="Currency">
                                    <div className="flex gap-2">
                                        {["USD", "EUR", "GBP", "CAD"].map((c) => (
                                            <button key={c} onClick={() => update("currency", c)} className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${formData.currency === c ? "bg-base-content text-base-100" : "bg-base-200/50 text-base-content/40 hover:bg-base-200"}`}>{c}</button>
                                        ))}
                                    </div>
                                </FormField>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField label="Minimum Salary" required error={fieldError("salaryMin")}>
                                        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 text-sm">$</span><input type="text" value={formData.salaryMin} onChange={(e) => update("salaryMin", e.target.value.replace(/[^0-9]/g, ""))} placeholder="120,000" className={`${inputCls(fieldError("salaryMin"))} pl-8`} /></div>
                                    </FormField>
                                    <FormField label="Maximum Salary" required error={fieldError("salaryMax")}>
                                        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 text-sm">$</span><input type="text" value={formData.salaryMax} onChange={(e) => update("salaryMax", e.target.value.replace(/[^0-9]/g, ""))} placeholder="180,000" className={`${inputCls(fieldError("salaryMax"))} pl-8`} /></div>
                                    </FormField>
                                </div>
                                <div className="h-px bg-base-200 my-2" />
                                <FormField label="Recruiting Fee (% of salary)">
                                    <div className="flex items-center gap-4">
                                        <input type="range" min="10" max="30" step="1" value={formData.splitFee} onChange={(e) => update("splitFee", e.target.value)} className="flex-1 accent-secondary h-1.5" />
                                        <span className="text-lg font-bold text-base-content tabular-nums w-14 text-right">{formData.splitFee}%</span>
                                    </div>
                                    <p className="text-[11px] text-base-content/30 mt-1">Estimated fee: ${((Number(formData.salaryMin || 0) + Number(formData.salaryMax || 0)) / 2 * Number(formData.splitFee) / 100).toLocaleString()}</p>
                                </FormField>
                                <FormField label="Split Model">
                                    <div className="grid grid-cols-3 gap-3">
                                        {[{ value: "50-50", label: "50 / 50", desc: "Equal split" }, { value: "60-40", label: "60 / 40", desc: "Sourcer leads" }, { value: "custom", label: "Custom", desc: "Set your own" }].map((m) => (
                                            <button key={m.value} onClick={() => update("splitModel", m.value)} className={`p-4 rounded-xl border text-center transition-all ${formData.splitModel === m.value ? "border-base-content bg-base-content/5" : "border-base-200 hover:border-base-300"}`}>
                                                <p className={`text-sm font-bold ${formData.splitModel === m.value ? "text-base-content" : "text-base-content/50"}`}>{m.label}</p>
                                                <p className="text-[10px] text-base-content/30 mt-0.5">{m.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </FormField>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <StepHeader title="Job Description" desc="Provide details about the role, requirements, and benefits." />
                                <FormField label="Description" required error={fieldError("description")}>
                                    <textarea value={formData.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the role, responsibilities, team, and what makes this opportunity unique..." rows={6} className={inputCls(fieldError("description"))} />
                                    <p className="text-[10px] text-base-content/25 mt-1 text-right">{formData.description.length} characters</p>
                                </FormField>
                                <FormField label="Requirements"><textarea value={formData.requirements} onChange={(e) => update("requirements", e.target.value)} placeholder="List the must-have qualifications and nice-to-haves..." rows={4} className={inputCls()} /></FormField>
                                <FormField label="Benefits & Perks"><textarea value={formData.benefits} onChange={(e) => update("benefits", e.target.value)} placeholder="Health insurance, equity, PTO, learning budget..." rows={3} className={inputCls()} /></FormField>
                                <FormField label="Skills & Technologies" required error={fieldError("skills")}>
                                    <div className="flex flex-wrap gap-2">
                                        {popularSkills.map((skill) => (
                                            <button key={skill} onClick={() => toggleSkill(skill)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${formData.skills.includes(skill) ? "border-base-content bg-base-content text-base-100" : "border-base-300 text-base-content/40 hover:border-base-content/30 hover:text-base-content/60"}`}>
                                                {formData.skills.includes(skill) && <i className="fa-duotone fa-regular fa-check text-[9px] mr-1" />}{skill}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.skills.length > 0 && <p className="text-[11px] text-secondary mt-2 font-medium">{formData.skills.length} selected</p>}
                                </FormField>
                                <FormField label="Attachments">
                                    <div className="border-2 border-dashed border-base-300 rounded-xl p-8 text-center hover:border-base-content/20 transition-colors cursor-pointer">
                                        <i className="fa-duotone fa-regular fa-cloud-arrow-up text-2xl text-base-content/20 mb-3" />
                                        <p className="text-sm text-base-content/50 mb-1">Drag and drop files, or <span className="text-secondary font-semibold">browse</span></p>
                                        <p className="text-[10px] text-base-content/25">PDF, DOC, DOCX up to 10MB</p>
                                    </div>
                                </FormField>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <StepHeader title="Network Settings" desc="Configure how this role is shared across the Splits Network." />
                                <FormField label="Urgency Level">
                                    <div className="grid grid-cols-3 gap-3">
                                        {[{ value: "standard", label: "Standard", desc: "Normal timeline", icon: "fa-duotone fa-regular fa-clock" }, { value: "urgent", label: "Urgent", desc: "Fast-track", icon: "fa-duotone fa-regular fa-bolt" }, { value: "critical", label: "Critical", desc: "Immediate need", icon: "fa-duotone fa-regular fa-fire" }].map((u) => (
                                            <button key={u.value} onClick={() => update("urgency", u.value)} className={`p-4 rounded-xl border text-left transition-all ${formData.urgency === u.value ? "border-base-content bg-base-content/5" : "border-base-200 hover:border-base-300"}`}>
                                                <i className={`${u.icon} text-sm mb-2 block ${formData.urgency === u.value ? "text-base-content" : "text-base-content/25"}`} />
                                                <p className={`text-sm font-bold ${formData.urgency === u.value ? "text-base-content" : "text-base-content/50"}`}>{u.label}</p>
                                                <p className="text-[10px] text-base-content/30 mt-0.5">{u.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </FormField>
                                <FormField label="Number of Openings">
                                    <div className="flex items-center gap-3">
                                        <input type="text" value={formData.headcount} onChange={(e) => update("headcount", e.target.value.replace(/[^0-9]/g, ""))} className="w-20 text-center px-3 py-2.5 bg-base-200/50 border border-base-300 rounded-lg text-sm focus:outline-none focus:border-secondary/50 transition-colors" />
                                        <span className="text-sm text-base-content/40">position(s)</span>
                                    </div>
                                </FormField>
                                <div className="h-px bg-base-200 my-2" />
                                <div className="space-y-4">
                                    <ToggleField label="AI Auto-Match" desc="Automatically match and notify compatible recruiters" checked={formData.autoMatch} onChange={(v) => update("autoMatch", v)} />
                                    <ToggleField label="Notify Network" desc="Send a notification to recruiters matching this role" checked={formData.notifyNetwork} onChange={(v) => update("notifyNetwork", v)} />
                                    <ToggleField label="Confidential" desc="Hide company name until a recruiter is approved" checked={formData.confidential} onChange={(v) => update("confidential", v)} />
                                    <ToggleField label="Featured Listing" desc="Boost visibility at the top of the marketplace" checked={formData.featured} onChange={(v) => update("featured", v)} />
                                    <ToggleField label="Resume Required" desc="Candidates must upload a resume to apply" checked={formData.resumeRequired} onChange={(v) => update("resumeRequired", v)} />
                                    <ToggleField label="Cover Letter" desc="Candidates must write a cover letter" checked={formData.coverLetterRequired} onChange={(v) => update("coverLetterRequired", v)} />
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <StepHeader title="Review & Post" desc="Verify all details before publishing to the network." />
                                <ReviewCard title="Role" step={1} onEdit={() => setCurrentStep(1)}>
                                    <ReviewRow label="Title" value={formData.title || "\u2014"} /><ReviewRow label="Company" value={formData.company || "\u2014"} /><ReviewRow label="Location" value={`${formData.location || "\u2014"} (${formData.locationType})`} /><ReviewRow label="Type" value={formData.employmentType || "\u2014"} /><ReviewRow label="Level" value={formData.experienceLevel || "\u2014"} />
                                </ReviewCard>
                                <ReviewCard title="Compensation" step={2} onEdit={() => setCurrentStep(2)}>
                                    <ReviewRow label="Salary" value={formData.salaryMin && formData.salaryMax ? `$${Number(formData.salaryMin).toLocaleString()} \u2013 $${Number(formData.salaryMax).toLocaleString()} ${formData.currency}` : "\u2014"} /><ReviewRow label="Fee" value={`${formData.splitFee}%`} /><ReviewRow label="Split" value={formData.splitModel} />
                                </ReviewCard>
                                <ReviewCard title="Description" step={3} onEdit={() => setCurrentStep(3)}>
                                    <ReviewRow label="Description" value={formData.description ? `${formData.description.slice(0, 100)}...` : "\u2014"} /><ReviewRow label="Skills" value={formData.skills.length > 0 ? formData.skills.join(", ") : "\u2014"} />
                                </ReviewCard>
                                <ReviewCard title="Network" step={4} onEdit={() => setCurrentStep(4)}>
                                    <ReviewRow label="Urgency" value={formData.urgency} /><ReviewRow label="Headcount" value={formData.headcount} /><ReviewRow label="AI Match" value={formData.autoMatch ? "On" : "Off"} /><ReviewRow label="Featured" value={formData.featured ? "Yes" : "No"} />
                                </ReviewCard>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-base-200">
                            <button onClick={goPrev} disabled={currentStep === 1} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${currentStep === 1 ? "text-base-content/15 cursor-not-allowed" : "text-base-content/60 hover:text-base-content border border-base-300 hover:border-base-content/30"}`}>
                                <i className="fa-duotone fa-regular fa-arrow-left text-xs" /> Previous
                            </button>
                            {currentStep < 5 ? (
                                <button onClick={goNext} className="flex items-center gap-2 px-6 py-2.5 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">Continue <i className="fa-duotone fa-regular fa-arrow-right text-xs" /></button>
                            ) : (
                                <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {submitting ? <><i className="fa-duotone fa-regular fa-spinner-third animate-spin text-xs" /> Publishing...</> : <><i className="fa-duotone fa-regular fa-paper-plane text-xs" /> Publish Job</>}
                                </button>
                            )}
                        </div>
                    </div>

                    <aside data-sidebar-panel className="w-full lg:w-[280px] shrink-0 space-y-6">
                        <div className="border border-base-200 rounded-xl p-5">
                            <h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-3">Progress</h4>
                            <div className="w-full bg-base-200 rounded-full h-1.5 mb-2"><div className="bg-secondary h-1.5 rounded-full transition-all duration-500" style={{ width: `${(currentStep / 5) * 100}%` }} /></div>
                            <p className="text-xs text-base-content/40">Step {currentStep} of 5</p>
                        </div>
                        <div className="border border-base-200 rounded-xl p-5">
                            <h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-3">Tips</h4>
                            <div className="space-y-3">
                                {[{ icon: "fa-duotone fa-regular fa-lightbulb", text: "Detailed descriptions attract 40% more qualified candidates" }, { icon: "fa-duotone fa-regular fa-chart-simple", text: "Competitive salaries fill 3x faster on the network" }, { icon: "fa-duotone fa-regular fa-users", text: "Split-fee roles get 5x more recruiter engagement" }].map((tip, i) => (
                                    <div key={i} className="flex gap-2.5"><i className={`${tip.icon} text-xs text-secondary/50 mt-0.5 shrink-0`} /><p className="text-xs text-base-content/40 leading-relaxed">{tip.text}</p></div>
                                ))}
                            </div>
                        </div>
                        <div className="border border-base-200 rounded-xl p-5">
                            <h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-3">Actions</h4>
                            <div className="space-y-2">
                                {[{ icon: "fa-duotone fa-regular fa-floppy-disk", label: "Save as Draft" }, { icon: "fa-duotone fa-regular fa-eye", label: "Preview Listing" }, { icon: "fa-duotone fa-regular fa-copy", label: "Duplicate Existing" }].map((a) => (
                                    <button key={a.label} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-base-content/50 hover:text-base-content hover:bg-base-200/50 rounded-lg transition-colors"><i className={`${a.icon} w-4 text-center`} /> {a.label}</button>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

/* ─── Sub-Components ─────────────────────────────────────────────────────────── */

function StepHeader({ title, desc }: { title: string; desc: string }) {
    return (<div className="mb-2"><h2 className="text-lg font-bold text-base-content">{title}</h2><p className="text-sm text-base-content/40">{desc}</p></div>);
}

function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: FieldError; children: React.ReactNode }) {
    return (
        <fieldset className="space-y-1.5">
            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-[0.1em] flex items-center gap-1">{label}{required && <span className="text-secondary">*</span>}</label>
            {children}
            {error && <p className="text-[11px] text-error flex items-center gap-1 mt-1"><i className="fa-duotone fa-regular fa-circle-exclamation text-[10px]" />{error.message}</p>}
        </fieldset>
    );
}

function inputCls(error?: FieldError) {
    return `w-full px-4 py-2.5 bg-base-200/50 border rounded-lg text-sm focus:outline-none transition-colors placeholder:text-base-content/25 resize-none ${error ? "border-error/40 focus:border-error/60 bg-error/5" : "border-base-300 focus:border-secondary/50"}`;
}

function ToggleField({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!checked)} className="w-full flex items-start gap-4 p-4 rounded-xl border border-base-200 hover:border-base-300 transition-colors text-left">
            <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 mt-0.5 ${checked ? "bg-secondary" : "bg-base-300"}`}><div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} /></div>
            <div><p className="text-sm font-semibold text-base-content">{label}</p><p className="text-xs text-base-content/40 mt-0.5">{desc}</p></div>
        </button>
    );
}

function ReviewCard({ title, step, onEdit, children }: { title: string; step: number; onEdit: () => void; children: React.ReactNode }) {
    return (
        <div className="border border-base-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-base-200/30 border-b border-base-200">
                <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-secondary/15 flex items-center justify-center text-[9px] font-bold text-secondary">{step}</span><span className="text-xs font-semibold text-base-content/70 uppercase tracking-[0.1em]">{title}</span></div>
                <button onClick={onEdit} className="text-[11px] text-secondary font-semibold hover:underline">Edit</button>
            </div>
            <div className="px-5 py-3 divide-y divide-base-200">{children}</div>
        </div>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (<div className="flex justify-between py-2"><span className="text-xs text-base-content/40">{label}</span><span className="text-xs font-medium text-base-content/70 text-right max-w-[60%]">{value}</span></div>);
}
