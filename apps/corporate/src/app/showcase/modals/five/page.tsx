"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

// ── Types ────────────────────────────────────────────────────────
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

interface WizardFormData {
    // Step 1 - Job Details
    title: string;
    company: string;
    location: string;
    type: string;
    // Step 2 - Requirements
    experienceLevel: string;
    skills: string;
    description: string;
    // Step 3 - Compensation
    salaryMin: string;
    salaryMax: string;
    equity: string;
    benefits: string;
}

const EMPTY_JOB: JobFormData = {
    title: "",
    company: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    type: "full-time",
    description: "",
    requirements: "",
};

const EMPTY_WIZARD: WizardFormData = {
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

// ── Animation helpers ────────────────────────────────────────────
function animateModalIn(backdropEl: HTMLElement, boxEl: HTMLElement) {
    gsap.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(
        boxEl,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.4)" },
    );
}

function animateModalOut(backdropEl: HTMLElement, boxEl: HTMLElement, onComplete: () => void) {
    const tl = gsap.timeline({ onComplete });
    tl.to(boxEl, { opacity: 0, y: 30, scale: 0.95, duration: 0.2, ease: "power2.in" });
    tl.to(backdropEl, { opacity: 0, duration: 0.15 }, "-=0.1");
}

// ── Standard Modal ───────────────────────────────────────────────
function CreateJobModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [form, setForm] = useState<JobFormData>({ ...EMPTY_JOB });
    const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            setForm({ ...EMPTY_JOB });
            setErrors({});
            setSubmitted(false);
        }
    }, [open]);

    useEffect(() => {
        if (visible && backdropRef.current && boxRef.current) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [visible]);

    const close = useCallback(() => {
        if (backdropRef.current && boxRef.current) {
            animateModalOut(backdropRef.current, boxRef.current, () => {
                setVisible(false);
                onClose();
            });
        }
    }, [onClose]);

    const validate = (): boolean => {
        const e: Partial<Record<keyof JobFormData, string>> = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.company.trim()) e.company = "Company is required";
        if (!form.location.trim()) e.location = "Location is required";
        if (!form.description.trim()) e.description = "Description is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        setSubmitted(true);
    };

    const update = (field: keyof JobFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    if (!visible) return null;

    return (
        <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <div ref={boxRef} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#27272a] bg-[#18181b] rounded-xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-briefcase text-info" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#e5e7eb] text-lg">Create Job Listing</h3>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30">new posting</span>
                        </div>
                    </div>
                    <button onClick={close} className="btn btn-ghost btn-sm btn-square text-[#e5e7eb]/40 hover:text-[#e5e7eb]">
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                </div>

                {submitted ? (
                    /* Success state */
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                            <i className="fa-duotone fa-regular fa-check text-3xl text-success" />
                        </div>
                        <h4 className="text-xl font-bold text-[#e5e7eb] mb-2">Job Created</h4>
                        <p className="text-sm text-[#e5e7eb]/50 mb-8">
                            &quot;{form.title}&quot; at {form.company} has been published to the network.
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-wider text-success/80">Signal broadcast</span>
                        </div>
                        <button onClick={close} className="btn btn-info font-mono uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-arrow-left" />
                            Done
                        </button>
                    </div>
                ) : (
                    /* Form */
                    <>
                        <div className="p-6 space-y-5">
                            {/* Title */}
                            <fieldset>
                                <label className="label">
                                    <span className="label-text text-[#e5e7eb]/70 font-mono text-xs uppercase tracking-wider">Title <span className="text-error">*</span></span>
                                </label>
                                <input type="text" placeholder="e.g. Senior Software Engineer" className={`input input-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info ${errors.title ? "border-error" : ""}`} value={form.title} onChange={(e) => update("title", e.target.value)} />
                                {errors.title && <span className="text-error text-xs mt-1 block font-mono">{errors.title}</span>}
                            </fieldset>

                            {/* Company + Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <fieldset>
                                    <label className="label">
                                        <span className="label-text text-[#e5e7eb]/70 font-mono text-xs uppercase tracking-wider">Company <span className="text-error">*</span></span>
                                    </label>
                                    <input type="text" placeholder="e.g. Acme Corp" className={`input input-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info ${errors.company ? "border-error" : ""}`} value={form.company} onChange={(e) => update("company", e.target.value)} />
                                    {errors.company && <span className="text-error text-xs mt-1 block font-mono">{errors.company}</span>}
                                </fieldset>
                                <fieldset>
                                    <label className="label">
                                        <span className="label-text text-[#e5e7eb]/70 font-mono text-xs uppercase tracking-wider">Location <span className="text-error">*</span></span>
                                    </label>
                                    <input type="text" placeholder="e.g. San Francisco, CA" className={`input input-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info ${errors.location ? "border-error" : ""}`} value={form.location} onChange={(e) => update("location", e.target.value)} />
                                    {errors.location && <span className="text-error text-xs mt-1 block font-mono">{errors.location}</span>}
                                </fieldset>
                            </div>

                            {/* Salary Range + Type */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <fieldset>
                                    <label className="label">
                                        <span className="label-text text-[#e5e7eb]/70 font-mono text-xs uppercase tracking-wider">Min Salary</span>
                                    </label>
                                    <input type="text" placeholder="$80,000" className="input input-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} />
                                </fieldset>
                                <fieldset>
                                    <label className="label">
                                        <span className="label-text text-[#e5e7eb]/70 font-mono text-xs uppercase tracking-wider">Max Salary</span>
                                    </label>
                                    <input type="text" placeholder="$120,000" className="input input-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} />
                                </fieldset>
                                <fieldset>
                                    <label className="label">
                                        <span className="label-text text-[#e5e7eb]/70 font-mono text-xs uppercase tracking-wider">Type</span>
                                    </label>
                                    <select className="select select-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] focus:border-info" value={form.type} onChange={(e) => update("type", e.target.value)}>
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="remote">Remote</option>
                                    </select>
                                </fieldset>
                            </div>

                            {/* Description */}
                            <fieldset>
                                <label className="label">
                                    <span className="label-text text-[#e5e7eb]/70 font-mono text-xs uppercase tracking-wider">Description <span className="text-error">*</span></span>
                                </label>
                                <textarea rows={3} placeholder="Describe the role..." className={`textarea textarea-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info ${errors.description ? "border-error" : ""}`} value={form.description} onChange={(e) => update("description", e.target.value)} />
                                {errors.description && <span className="text-error text-xs mt-1 block font-mono">{errors.description}</span>}
                            </fieldset>

                            {/* Requirements */}
                            <fieldset>
                                <label className="label">
                                    <span className="label-text text-[#e5e7eb]/70 font-mono text-xs uppercase tracking-wider">Requirements</span>
                                </label>
                                <textarea rows={3} placeholder="Key requirements, one per line..." className="textarea textarea-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info" value={form.requirements} onChange={(e) => update("requirements", e.target.value)} />
                            </fieldset>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#27272a]">
                            <button onClick={close} className="btn btn-ghost text-[#e5e7eb]/50 font-mono uppercase tracking-wider text-xs">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} className="btn btn-info font-mono uppercase tracking-wider text-xs">
                                <i className="fa-duotone fa-regular fa-satellite-dish" />
                                Publish Job
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Wizard Modal ─────────────────────────────────────────────────
const WIZARD_STEPS = [
    { label: "Job Details", icon: "fa-duotone fa-regular fa-briefcase" },
    { label: "Requirements", icon: "fa-duotone fa-regular fa-list-check" },
    { label: "Compensation", icon: "fa-duotone fa-regular fa-money-bill-transfer" },
    { label: "Review", icon: "fa-duotone fa-regular fa-eye" },
];

function WizardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<WizardFormData>({ ...EMPTY_WIZARD });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            setStep(0);
            setForm({ ...EMPTY_WIZARD });
            setErrors({});
            setSubmitted(false);
        }
    }, [open]);

    useEffect(() => {
        if (visible && backdropRef.current && boxRef.current) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [visible]);

    // Animate step transitions
    useEffect(() => {
        if (stepContentRef.current) {
            gsap.fromTo(
                stepContentRef.current,
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
            );
        }
    }, [step]);

    const close = useCallback(() => {
        if (backdropRef.current && boxRef.current) {
            animateModalOut(backdropRef.current, boxRef.current, () => {
                setVisible(false);
                onClose();
            });
        }
    }, [onClose]);

    const update = (field: keyof WizardFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined } as Record<string, string>));
    };

    const validateStep = (): boolean => {
        const e: Record<string, string> = {};
        if (step === 0) {
            if (!form.title.trim()) e.title = "Required";
            if (!form.company.trim()) e.company = "Required";
            if (!form.location.trim()) e.location = "Required";
        }
        if (step === 1) {
            if (!form.description.trim()) e.description = "Required";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => {
        if (!validateStep()) return;
        if (step < 3) setStep(step + 1);
    };

    const back = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    if (!visible) return null;

    const inputCls = "input input-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info";
    const textareaCls = "textarea textarea-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info";
    const selectCls = "select select-bordered w-full bg-[#09090b] border-[#27272a] text-[#e5e7eb] focus:border-info";
    const labelCls = "label-text text-[#e5e7eb]/70 font-mono text-xs uppercase tracking-wider";

    return (
        <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <div ref={boxRef} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#27272a] bg-[#18181b] rounded-xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-warning" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#e5e7eb] text-lg">Post a Job</h3>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30">step-by-step wizard</span>
                        </div>
                    </div>
                    <button onClick={close} className="btn btn-ghost btn-sm btn-square text-[#e5e7eb]/40 hover:text-[#e5e7eb]">
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                </div>

                {submitted ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                            <i className="fa-duotone fa-regular fa-rocket text-3xl text-success" />
                        </div>
                        <h4 className="text-xl font-bold text-[#e5e7eb] mb-2">Job Published</h4>
                        <p className="text-sm text-[#e5e7eb]/50 mb-8">
                            &quot;{form.title}&quot; at {form.company} is now live on the network.
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-wider text-success/80">Pipeline active</span>
                        </div>
                        <button onClick={close} className="btn btn-warning font-mono uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-arrow-left" />
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Progress indicator */}
                        <div className="px-6 pt-6">
                            <div className="flex items-center gap-1">
                                {WIZARD_STEPS.map((s, i) => (
                                    <div key={i} className="flex-1 flex items-center gap-1">
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${i === step ? "bg-warning/10 text-warning border border-warning/30" : i < step ? "bg-success/10 text-success border border-success/30" : "text-[#e5e7eb]/30 border border-[#27272a]"}`}>
                                            <i className={`${i < step ? "fa-duotone fa-regular fa-check" : s.icon} text-[10px]`} />
                                            <span className="hidden md:inline">{s.label}</span>
                                            <span className="md:hidden">{i + 1}</span>
                                        </div>
                                        {i < WIZARD_STEPS.length - 1 && (
                                            <div className={`h-px flex-1 min-w-2 ${i < step ? "bg-success/40" : "bg-[#27272a]"}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step content */}
                        <div ref={stepContentRef} className="p-6 space-y-5 min-h-[280px]">
                            {step === 0 && (
                                <>
                                    <fieldset>
                                        <label className="label"><span className={labelCls}>Job Title <span className="text-error">*</span></span></label>
                                        <input type="text" placeholder="e.g. Senior Software Engineer" className={`${inputCls} ${errors.title ? "border-error" : ""}`} value={form.title} onChange={(e) => update("title", e.target.value)} />
                                        {errors.title && <span className="text-error text-xs mt-1 block font-mono">{errors.title}</span>}
                                    </fieldset>
                                    <fieldset>
                                        <label className="label"><span className={labelCls}>Company <span className="text-error">*</span></span></label>
                                        <input type="text" placeholder="e.g. Acme Corp" className={`${inputCls} ${errors.company ? "border-error" : ""}`} value={form.company} onChange={(e) => update("company", e.target.value)} />
                                        {errors.company && <span className="text-error text-xs mt-1 block font-mono">{errors.company}</span>}
                                    </fieldset>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <fieldset>
                                            <label className="label"><span className={labelCls}>Location <span className="text-error">*</span></span></label>
                                            <input type="text" placeholder="e.g. San Francisco, CA" className={`${inputCls} ${errors.location ? "border-error" : ""}`} value={form.location} onChange={(e) => update("location", e.target.value)} />
                                            {errors.location && <span className="text-error text-xs mt-1 block font-mono">{errors.location}</span>}
                                        </fieldset>
                                        <fieldset>
                                            <label className="label"><span className={labelCls}>Job Type</span></label>
                                            <select className={selectCls} value={form.type} onChange={(e) => update("type", e.target.value)}>
                                                <option value="full-time">Full-time</option>
                                                <option value="part-time">Part-time</option>
                                                <option value="contract">Contract</option>
                                                <option value="remote">Remote</option>
                                            </select>
                                        </fieldset>
                                    </div>
                                </>
                            )}

                            {step === 1 && (
                                <>
                                    <fieldset>
                                        <label className="label"><span className={labelCls}>Experience Level</span></label>
                                        <select className={selectCls} value={form.experienceLevel} onChange={(e) => update("experienceLevel", e.target.value)}>
                                            <option value="entry">Entry Level</option>
                                            <option value="mid">Mid Level</option>
                                            <option value="senior">Senior</option>
                                            <option value="lead">Lead / Staff</option>
                                            <option value="executive">Executive</option>
                                        </select>
                                    </fieldset>
                                    <fieldset>
                                        <label className="label"><span className={labelCls}>Required Skills</span></label>
                                        <input type="text" placeholder="e.g. React, TypeScript, Node.js" className={inputCls} value={form.skills} onChange={(e) => update("skills", e.target.value)} />
                                    </fieldset>
                                    <fieldset>
                                        <label className="label"><span className={labelCls}>Description <span className="text-error">*</span></span></label>
                                        <textarea rows={5} placeholder="Describe the role, responsibilities, and what makes it exciting..." className={`${textareaCls} ${errors.description ? "border-error" : ""}`} value={form.description} onChange={(e) => update("description", e.target.value)} />
                                        {errors.description && <span className="text-error text-xs mt-1 block font-mono">{errors.description}</span>}
                                    </fieldset>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <fieldset>
                                            <label className="label"><span className={labelCls}>Min Salary</span></label>
                                            <input type="text" placeholder="$80,000" className={inputCls} value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} />
                                        </fieldset>
                                        <fieldset>
                                            <label className="label"><span className={labelCls}>Max Salary</span></label>
                                            <input type="text" placeholder="$150,000" className={inputCls} value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} />
                                        </fieldset>
                                    </div>
                                    <fieldset>
                                        <label className="label"><span className={labelCls}>Equity</span></label>
                                        <input type="text" placeholder="e.g. 0.1% - 0.5% options" className={inputCls} value={form.equity} onChange={(e) => update("equity", e.target.value)} />
                                    </fieldset>
                                    <fieldset>
                                        <label className="label"><span className={labelCls}>Benefits</span></label>
                                        <textarea rows={3} placeholder="e.g. Health, dental, 401k match, unlimited PTO..." className={textareaCls} value={form.benefits} onChange={(e) => update("benefits", e.target.value)} />
                                    </fieldset>
                                </>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="border border-[#27272a] rounded-lg p-4 space-y-3">
                                        <div className="flex items-center gap-2 mb-3">
                                            <i className="fa-duotone fa-regular fa-clipboard-check text-info" />
                                            <span className="font-mono text-xs uppercase tracking-wider text-[#e5e7eb]/50">Review Summary</span>
                                        </div>

                                        <ReviewRow label="Title" value={form.title} />
                                        <ReviewRow label="Company" value={form.company} />
                                        <ReviewRow label="Location" value={form.location} />
                                        <ReviewRow label="Type" value={form.type} />
                                        <ReviewRow label="Experience" value={form.experienceLevel} />
                                        <ReviewRow label="Skills" value={form.skills || "Not specified"} />
                                        <ReviewRow label="Salary" value={form.salaryMin && form.salaryMax ? `${form.salaryMin} - ${form.salaryMax}` : form.salaryMin || form.salaryMax || "Not specified"} />
                                        <ReviewRow label="Equity" value={form.equity || "None"} />
                                    </div>

                                    {form.description && (
                                        <div className="border border-[#27272a] rounded-lg p-4">
                                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40 block mb-2">Description</span>
                                            <p className="text-sm text-[#e5e7eb]/70 whitespace-pre-wrap">{form.description}</p>
                                        </div>
                                    )}

                                    {form.benefits && (
                                        <div className="border border-[#27272a] rounded-lg p-4">
                                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40 block mb-2">Benefits</span>
                                            <p className="text-sm text-[#e5e7eb]/70 whitespace-pre-wrap">{form.benefits}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer navigation */}
                        <div className="flex items-center justify-between p-6 border-t border-[#27272a]">
                            <button onClick={close} className="btn btn-ghost text-[#e5e7eb]/50 font-mono uppercase tracking-wider text-xs">
                                Cancel
                            </button>
                            <div className="flex gap-3">
                                {step > 0 && (
                                    <button onClick={back} className="btn btn-outline border-[#27272a] text-[#e5e7eb]/60 font-mono uppercase tracking-wider text-xs hover:bg-[#27272a] hover:border-[#27272a]">
                                        <i className="fa-duotone fa-regular fa-arrow-left" />
                                        Back
                                    </button>
                                )}
                                {step < 3 ? (
                                    <button onClick={next} className="btn btn-warning font-mono uppercase tracking-wider text-xs">
                                        Next
                                        <i className="fa-duotone fa-regular fa-arrow-right" />
                                    </button>
                                ) : (
                                    <button onClick={handleSubmit} className="btn btn-success font-mono uppercase tracking-wider text-xs">
                                        <i className="fa-duotone fa-regular fa-rocket" />
                                        Publish Job
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between border-b border-[#27272a]/50 pb-2 last:border-0 last:pb-0">
            <span className="font-mono text-xs text-[#e5e7eb]/40 uppercase tracking-wider">{label}</span>
            <span className="text-sm text-[#e5e7eb]/80 capitalize">{value}</span>
        </div>
    );
}

// ── Confirmation Dialog ──────────────────────────────────────────
function DeleteConfirmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            setDeleted(false);
        }
    }, [open]);

    useEffect(() => {
        if (visible && backdropRef.current && boxRef.current) {
            animateModalIn(backdropRef.current, boxRef.current);
        }
    }, [visible]);

    const close = useCallback(() => {
        if (backdropRef.current && boxRef.current) {
            animateModalOut(backdropRef.current, boxRef.current, () => {
                setVisible(false);
                onClose();
            });
        }
    }, [onClose]);

    const handleDelete = () => {
        setDeleted(true);
    };

    if (!visible) return null;

    return (
        <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <div ref={boxRef} className="w-full max-w-md border border-[#27272a] bg-[#18181b] rounded-xl" onClick={(e) => e.stopPropagation()}>
                {deleted ? (
                    <div className="p-10 text-center">
                        <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-5">
                            <i className="fa-duotone fa-regular fa-trash-check text-2xl text-error" />
                        </div>
                        <h4 className="text-lg font-bold text-[#e5e7eb] mb-2">Job Deleted</h4>
                        <p className="text-sm text-[#e5e7eb]/50 mb-6">The job listing has been removed from the network.</p>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-wider text-error/80">Signal terminated</span>
                        </div>
                        <button onClick={close} className="btn btn-ghost text-[#e5e7eb]/50 font-mono uppercase tracking-wider text-xs">
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-8 text-center">
                            {/* Warning icon */}
                            <div className="w-16 h-16 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-6">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-3xl text-error" />
                            </div>

                            <h3 className="text-xl font-bold text-[#e5e7eb] mb-2">Delete Job Listing</h3>
                            <p className="text-sm text-[#e5e7eb]/50 mb-2">
                                Are you sure you want to delete &quot;Senior Software Engineer&quot; at Acme Corp?
                            </p>
                            <div className="border border-error/20 bg-error/5 rounded-lg p-3 mt-4">
                                <p className="text-xs text-error/80 font-mono">
                                    <i className="fa-duotone fa-regular fa-sensor-triangle-exclamation mr-2" />
                                    This action is permanent. All associated applications, candidate matches, and pipeline data will be removed from the network.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 pt-0 justify-center">
                            <button onClick={close} className="btn btn-ghost text-[#e5e7eb]/50 font-mono uppercase tracking-wider text-xs flex-1">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="btn btn-error font-mono uppercase tracking-wider text-xs flex-1">
                                <i className="fa-duotone fa-regular fa-trash" />
                                Delete Job
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────
export default function ModalsFivePage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Entrance animation for page content
    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(containerRef.current.querySelectorAll(".animate-in"), { opacity: 1 });
            return;
        }

        gsap.fromTo(
            containerRef.current.querySelectorAll(".animate-in"),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.12 },
        );
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#09090b] text-[#e5e7eb] relative overflow-hidden">
            {/* Scanline overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                }}
            />

            <div className="container mx-auto px-4 py-20 relative z-10">
                {/* Page header */}
                <div className="max-w-4xl mx-auto">
                    <div className="animate-in opacity-0 flex items-center gap-3 mb-8">
                        <span className="inline-block w-2 h-2 rounded-full bg-info animate-pulse" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-info/80">
                            Component Library
                        </span>
                        <span className="font-mono text-xs text-[#e5e7eb]/30 ml-auto">
                            modals // showcase
                        </span>
                    </div>

                    <h1 className="animate-in opacity-0 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                        <span className="text-[#e5e7eb]">Modal </span>
                        <span className="text-info">Patterns</span>
                    </h1>

                    <p className="animate-in opacity-0 text-lg text-[#e5e7eb]/50 mb-16 max-w-2xl font-light">
                        Standard form modals, multi-step wizards, and confirmation dialogs
                        -- all designed for the Data Observatory interface.
                    </p>

                    {/* Action cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Create Job Card */}
                        <div className="animate-in opacity-0 border border-info/20 bg-[#18181b]/60 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-briefcase text-info" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Standard Modal</h3>
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/30">form pattern</span>
                                </div>
                            </div>
                            <p className="text-sm text-[#e5e7eb]/50 mb-6 leading-relaxed">
                                Single-view form modal with validation, field types, and submit flow.
                            </p>
                            <div className="flex items-center gap-2 pt-4 border-t border-[#27272a]/50 mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                                <span className="font-mono text-xs text-[#e5e7eb]/40">7 form fields</span>
                            </div>
                            <button
                                onClick={() => setCreateOpen(true)}
                                className="btn btn-info w-full font-mono uppercase tracking-wider text-xs"
                            >
                                <i className="fa-duotone fa-regular fa-plus" />
                                Create Job Listing
                            </button>
                        </div>

                        {/* Wizard Card */}
                        <div className="animate-in opacity-0 border border-warning/20 bg-[#18181b]/60 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-warning" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Wizard Modal</h3>
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/30">multi-step</span>
                                </div>
                            </div>
                            <p className="text-sm text-[#e5e7eb]/50 mb-6 leading-relaxed">
                                Four-step guided workflow with progress tracking and review stage.
                            </p>
                            <div className="flex items-center gap-2 pt-4 border-t border-[#27272a]/50 mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                                <span className="font-mono text-xs text-[#e5e7eb]/40">4 steps</span>
                            </div>
                            <button
                                onClick={() => setWizardOpen(true)}
                                className="btn btn-warning w-full font-mono uppercase tracking-wider text-xs"
                            >
                                <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                                Post a Job (Wizard)
                            </button>
                        </div>

                        {/* Delete Card */}
                        <div className="animate-in opacity-0 border border-error/20 bg-[#18181b]/60 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-error" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Confirm Dialog</h3>
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/30">destructive</span>
                                </div>
                            </div>
                            <p className="text-sm text-[#e5e7eb]/50 mb-6 leading-relaxed">
                                Confirmation dialog for irreversible actions with clear warning messaging.
                            </p>
                            <div className="flex items-center gap-2 pt-4 border-t border-[#27272a]/50 mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                                <span className="font-mono text-xs text-[#e5e7eb]/40">destructive action</span>
                            </div>
                            <button
                                onClick={() => setDeleteOpen(true)}
                                className="btn btn-error w-full font-mono uppercase tracking-wider text-xs"
                            >
                                <i className="fa-duotone fa-regular fa-trash" />
                                Delete Job
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateJobModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
            <DeleteConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
        </div>
    );
}
