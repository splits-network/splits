"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

const D = { fast: 0.3, normal: 0.5, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)" };

const STEPS = [
    { id: 1, label: "Basics", icon: "fa-duotone fa-regular fa-layer-group" },
    { id: 2, label: "Details", icon: "fa-duotone fa-regular fa-file-lines" },
    { id: 3, label: "Requirements", icon: "fa-duotone fa-regular fa-list-check" },
    { id: 4, label: "Review", icon: "fa-duotone fa-regular fa-flag-checkered" },
];

const DEPARTMENTS = ["Engineering", "Design", "Product", "Marketing", "Sales", "Customer Success", "Data", "Operations", "Finance", "Legal"];
const JOB_TYPES = ["full-time", "part-time", "contract", "remote"];
const EXP_LEVELS = ["entry", "mid", "senior", "executive"];

type Errors = Record<string, string>;

export default function FormsEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [department, setDepartment] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("full-time");
    const [expLevel, setExpLevel] = useState("mid");
    const [salaryMin, setSalaryMin] = useState("");
    const [salaryMax, setSalaryMax] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState(["", "", ""]);
    const [responsibilities, setResponsibilities] = useState(["", "", ""]);
    const [benefits, setBenefits] = useState<string[]>(["Health insurance", "Equity"]);
    const [benefitInput, setBenefitInput] = useState("");
    const [featured, setFeatured] = useState(false);
    const [urgent, setUrgent] = useState(false);
    const [resume, setResume] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);

    useGSAP(() => {
        if (!containerRef.current) return;
        if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const tl = gsap.timeline({ defaults: { ease: E.smooth } });
        tl.fromTo(".bp-form-badge", { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: D.fast });
        tl.fromTo(".bp-form-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: D.normal }, "-=0.2");
        tl.fromTo(".bp-form-stepper", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: D.fast }, "-=0.2");
        tl.fromTo(".bp-form-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: D.fast }, "-=0.1");
    }, { scope: containerRef });

    const validateStep = (s: number): boolean => {
        const e: Errors = {};
        if (s === 1) {
            if (!title.trim()) e.title = "Job title is required";
            if (!company.trim()) e.company = "Company name is required";
            if (!department) e.department = "Select a department";
            if (!location.trim()) e.location = "Location is required";
        } else if (s === 2) {
            if (!description.trim()) e.description = "Description is required";
            if (description.trim().length < 20) e.description = "Description must be at least 20 characters";
            if (!salaryMin || !salaryMax) e.salary = "Both salary fields are required";
            if (salaryMin && salaryMax && Number(salaryMin) >= Number(salaryMax)) e.salary = "Max must be greater than min";
        } else if (s === 3) {
            if (requirements.filter(r => r.trim()).length < 2) e.requirements = "At least 2 requirements needed";
            if (responsibilities.filter(r => r.trim()).length < 2) e.responsibilities = "At least 2 responsibilities needed";
        } else if (s === 4) {
            if (!agreed) e.agreed = "You must agree to the terms";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const animateTransition = (direction: "forward" | "back", cb: () => void) => {
        const xOut = direction === "forward" ? -20 : 20;
        const xIn = direction === "forward" ? 20 : -20;
        gsap.to(".bp-form-body", {
            opacity: 0, x: xOut, duration: 0.15, ease: "power2.in",
            onComplete: () => {
                cb();
                requestAnimationFrame(() => {
                    gsap.fromTo(".bp-form-body", { opacity: 0, x: xIn }, { opacity: 1, x: 0, duration: D.fast, ease: E.smooth });
                });
            },
        });
    };

    const goNext = () => { if (validateStep(step) && step < 4) animateTransition("forward", () => setStep(step + 1)); };
    const goBack = () => { if (step > 1) animateTransition("back", () => { setStep(step - 1); setErrors({}); }); };

    const handleSubmit = () => {
        if (!validateStep(4)) return;
        setSubmitting(true);
        setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 2000);
    };

    const addBenefit = () => { if (benefitInput.trim()) { setBenefits([...benefits, benefitInput.trim()]); setBenefitInput(""); } };

    const inputCls = (field?: string) =>
        `w-full px-4 py-2.5 rounded-lg border text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
            field && errors[field] ? "border-red-400/60 focus:border-red-400" : "border-cyan-500/20 focus:border-cyan-400/50"
        }`;
    const inputBg = { backgroundColor: "#0d1d33" };

    const resetForm = () => {
        setSubmitted(false); setStep(1); setTitle(""); setCompany(""); setDescription("");
        setDepartment(""); setLocation(""); setSalaryMin(""); setSalaryMax("");
        setRequirements(["","",""]); setResponsibilities(["","",""]);
        setBenefits(["Health insurance","Equity"]); setFeatured(false); setUrgent(false);
        setAgreed(false); setResume(null); setErrors({});
    };

    if (submitted) {
        return (
            <div ref={containerRef} className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0a1628" }}>
                <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
                <div className="relative z-10 text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 rounded-2xl border-2 border-cyan-500/30 flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                        <i className="fa-duotone fa-regular fa-circle-check text-4xl text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Role Published</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        Your job posting for <span className="text-cyan-400 font-medium">{title}</span> at{" "}
                        <span className="text-white font-medium">{company}</span> is now live.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={resetForm} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-900" style={{ backgroundColor: "#22d3ee" }}>
                            <i className="fa-duotone fa-regular fa-plus mr-2" />Post Another
                        </button>
                        <button className="px-5 py-2.5 rounded-lg border border-cyan-500/30 text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors">View Listing</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: "#0a1628" }}>
            <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="fixed top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-cyan-500/20 pointer-events-none z-10" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <div className="bp-form-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-mono mb-6 opacity-0">
                        <i className="fa-duotone fa-regular fa-compass-drafting text-xs" /><span>CREATE JOB POSTING // BLUEPRINT v8</span>
                    </div>
                    <h1 className="bp-form-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">Post a New <span className="text-cyan-400">Role</span></h1>
                    <p className="bp-form-title text-slate-400 text-sm opacity-0">Fill in the details to publish your role to the marketplace.</p>
                </div>

                {/* Stepper */}
                <div className="bp-form-stepper flex items-center justify-between mb-10 max-w-lg mx-auto opacity-0">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <button onClick={() => { if (s.id < step) setStep(s.id); }} disabled={s.id > step}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all ${s.id === step ? "text-slate-900 font-semibold" : s.id < step ? "text-cyan-400 cursor-pointer hover:bg-cyan-500/10" : "text-slate-500 cursor-default"}`}
                                style={s.id === step ? { backgroundColor: "#22d3ee" } : {}}>
                                <i className={`${s.icon} text-xs ${s.id === step ? "text-slate-900" : s.id < step ? "text-cyan-400" : "text-slate-600"}`} />
                                <span className="hidden sm:inline">{s.label}</span><span className="sm:hidden">{s.id}</span>
                            </button>
                            {i < STEPS.length - 1 && <div className="w-6 lg:w-10 h-px mx-1" style={{ backgroundColor: s.id < step ? "#22d3ee" : "rgba(34,211,238,0.15)" }} />}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bp-form-card rounded-xl border border-cyan-500/15 overflow-hidden opacity-0" style={{ backgroundColor: "#0d1d33" }}>
                    <div className="px-6 py-4 border-b border-cyan-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <i className={`${STEPS[step - 1].icon} text-cyan-400 text-sm`} />
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40">Phase {String(step).padStart(2, "0")} // {STEPS[step - 1].label}</span>
                        </div>
                        <span className="font-mono text-[10px] text-cyan-500/30">{step} of {STEPS.length}</span>
                    </div>

                    <div className="bp-form-body p-6 lg:p-8">
                        {step === 1 && (
                            <div className="space-y-5">
                                <fieldset>
                                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Job Title *</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Product Designer" className={inputCls("title")} style={inputBg} />
                                    {errors.title && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><i className="fa-regular fa-circle-exclamation text-[10px]" />{errors.title}</p>}
                                </fieldset>
                                <fieldset>
                                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Company *</label>
                                    <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Stripe" className={inputCls("company")} style={inputBg} />
                                    {errors.company && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><i className="fa-regular fa-circle-exclamation text-[10px]" />{errors.company}</p>}
                                </fieldset>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <fieldset>
                                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Department *</label>
                                        <select value={department} onChange={e => setDepartment(e.target.value)} className={inputCls("department")} style={inputBg}>
                                            <option value="">Select department</option>
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        {errors.department && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><i className="fa-regular fa-circle-exclamation text-[10px]" />{errors.department}</p>}
                                    </fieldset>
                                    <fieldset>
                                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Location *</label>
                                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" className={inputCls("location")} style={inputBg} />
                                        {errors.location && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><i className="fa-regular fa-circle-exclamation text-[10px]" />{errors.location}</p>}
                                    </fieldset>
                                </div>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <fieldset>
                                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Job Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {JOB_TYPES.map(t => (
                                                <button key={t} type="button" onClick={() => setJobType(t)} className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors ${jobType === t ? "border-cyan-400/50 text-cyan-400" : "border-cyan-500/15 text-slate-400 hover:border-cyan-500/30"}`}
                                                    style={jobType === t ? { backgroundColor: "rgba(34,211,238,0.1)" } : { backgroundColor: "rgba(34,211,238,0.02)" }}>{t}</button>
                                            ))}
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Experience Level</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {EXP_LEVELS.map(l => (
                                                <button key={l} type="button" onClick={() => setExpLevel(l)} className={`px-3 py-2 rounded-lg text-xs font-mono border capitalize transition-colors ${expLevel === l ? "border-cyan-400/50 text-cyan-400" : "border-cyan-500/15 text-slate-400 hover:border-cyan-500/30"}`}
                                                    style={expLevel === l ? { backgroundColor: "rgba(34,211,238,0.1)" } : { backgroundColor: "rgba(34,211,238,0.02)" }}>{l}</button>
                                            ))}
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5">
                                <fieldset>
                                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Description *</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the role, team, and what success looks like..." rows={6} className={inputCls("description") + " resize-none"} style={inputBg} />
                                    <div className="flex justify-between mt-1">
                                        {errors.description ? <p className="text-xs text-red-400 flex items-center gap-1"><i className="fa-regular fa-circle-exclamation text-[10px]" />{errors.description}</p> : <span />}
                                        <span className={`font-mono text-[10px] ${description.length >= 20 ? "text-cyan-500/40" : "text-slate-500"}`}>{description.length} chars</span>
                                    </div>
                                </fieldset>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <fieldset>
                                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Salary Min (USD) *</label>
                                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/40 text-sm">$</span>
                                            <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="80,000" className={inputCls("salary") + " pl-7"} style={inputBg} /></div>
                                    </fieldset>
                                    <fieldset>
                                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Salary Max (USD) *</label>
                                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/40 text-sm">$</span>
                                            <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="120,000" className={inputCls("salary") + " pl-7"} style={inputBg} /></div>
                                    </fieldset>
                                </div>
                                {errors.salary && <p className="text-xs text-red-400 flex items-center gap-1"><i className="fa-regular fa-circle-exclamation text-[10px]" />{errors.salary}</p>}
                                <fieldset>
                                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Benefits</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {benefits.map((b, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-cyan-500/20 text-slate-300" style={{ backgroundColor: "rgba(34,211,238,0.05)" }}>
                                                {b}<button type="button" onClick={() => setBenefits(benefits.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400"><i className="fa-regular fa-xmark text-[10px]" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" value={benefitInput} onChange={e => setBenefitInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }} placeholder="Add a benefit..." className={inputCls() + " flex-1"} style={inputBg} />
                                        <button type="button" onClick={addBenefit} className="px-4 py-2.5 rounded-lg border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/10 transition-colors"><i className="fa-regular fa-plus" /></button>
                                    </div>
                                </fieldset>
                                <fieldset>
                                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50 mb-2">Job Description PDF (optional)</label>
                                    <div className="border-2 border-dashed border-cyan-500/15 rounded-lg p-6 text-center hover:border-cyan-500/30 transition-colors cursor-pointer" style={{ backgroundColor: "rgba(34,211,238,0.02)" }} onClick={() => setResume(resume ? null : "job-description.pdf")}>
                                        {resume ? (
                                            <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm"><i className="fa-duotone fa-regular fa-file-pdf text-lg" /><span>{resume}</span><span className="text-slate-500 text-xs">(click to remove)</span></div>
                                        ) : (
                                            <><i className="fa-duotone fa-regular fa-cloud-arrow-up text-2xl text-cyan-500/30 mb-2" /><p className="text-sm text-slate-400">Click to upload PDF</p><p className="text-[10px] font-mono text-slate-500 mt-1">Max 10MB</p></>
                                        )}
                                    </div>
                                </fieldset>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <fieldset>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50">Requirements * (min 2)</label>
                                        <button type="button" onClick={() => setRequirements([...requirements, ""])} className="text-xs text-cyan-400 hover:underline flex items-center gap-1"><i className="fa-regular fa-plus text-[10px]" />Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {requirements.map((r, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] text-cyan-500/30 w-5 text-right flex-shrink-0">{i + 1}.</span>
                                                <input type="text" value={r} onChange={e => { const n = [...requirements]; n[i] = e.target.value; setRequirements(n); }} placeholder={`Requirement ${i + 1}`} className={inputCls("requirements") + " flex-1"} style={inputBg} />
                                                {requirements.length > 2 && <button type="button" onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center"><i className="fa-regular fa-trash text-xs" /></button>}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.requirements && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><i className="fa-regular fa-circle-exclamation text-[10px]" />{errors.requirements}</p>}
                                </fieldset>
                                <fieldset>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/50">Responsibilities * (min 2)</label>
                                        <button type="button" onClick={() => setResponsibilities([...responsibilities, ""])} className="text-xs text-cyan-400 hover:underline flex items-center gap-1"><i className="fa-regular fa-plus text-[10px]" />Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {responsibilities.map((r, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] text-cyan-500/30 w-5 text-right flex-shrink-0">{i + 1}.</span>
                                                <input type="text" value={r} onChange={e => { const n = [...responsibilities]; n[i] = e.target.value; setResponsibilities(n); }} placeholder={`Responsibility ${i + 1}`} className={inputCls("responsibilities") + " flex-1"} style={inputBg} />
                                                {responsibilities.length > 2 && <button type="button" onClick={() => setResponsibilities(responsibilities.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center"><i className="fa-regular fa-trash text-xs" /></button>}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.responsibilities && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><i className="fa-regular fa-circle-exclamation text-[10px]" />{errors.responsibilities}</p>}
                                </fieldset>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${featured ? "border-cyan-400/50" : "border-cyan-500/15 hover:border-cyan-500/30"}`} style={featured ? { backgroundColor: "rgba(34,211,238,0.08)" } : { backgroundColor: "rgba(34,211,238,0.02)" }}>
                                        <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="checkbox checkbox-xs border-cyan-500/30" />
                                        <div><div className="text-sm text-white font-medium">Featured Listing</div><div className="text-[10px] text-slate-500">Boost visibility in the marketplace</div></div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${urgent ? "border-yellow-400/50" : "border-cyan-500/15 hover:border-cyan-500/30"}`} style={urgent ? { backgroundColor: "rgba(250,204,21,0.08)" } : { backgroundColor: "rgba(34,211,238,0.02)" }}>
                                        <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} className="checkbox checkbox-xs border-cyan-500/30" />
                                        <div><div className="text-sm text-white font-medium">Urgent Hire</div><div className="text-[10px] text-slate-500">Flag as time-sensitive</div></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/40 mb-4">Review Your Posting</div>
                                <div className="rounded-lg border border-cyan-500/15 overflow-hidden" style={{ backgroundColor: "#0f2847" }}>
                                    <div className="px-5 py-3 border-b border-cyan-500/10 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-briefcase text-cyan-400 text-xs" />
                                        <span className="text-sm font-semibold text-white">{title || "Untitled"}</span>
                                        {featured && <span className="font-mono text-[9px] text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">Featured</span>}
                                        {urgent && <span className="font-mono text-[9px] text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full">Urgent</span>}
                                    </div>
                                    <div className="p-5 space-y-3 text-sm">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><span className="text-slate-500 text-xs">Company</span><div className="text-white">{company || "\u2014"}</div></div>
                                            <div><span className="text-slate-500 text-xs">Department</span><div className="text-white">{department || "\u2014"}</div></div>
                                            <div><span className="text-slate-500 text-xs">Location</span><div className="text-white">{location || "\u2014"}</div></div>
                                            <div><span className="text-slate-500 text-xs">Type</span><div className="text-white capitalize">{jobType} / {expLevel}</div></div>
                                            <div className="col-span-2"><span className="text-slate-500 text-xs">Salary</span><div className="text-cyan-300 font-mono">{salaryMin && salaryMax ? `$${Number(salaryMin).toLocaleString()} - $${Number(salaryMax).toLocaleString()}` : "\u2014"}</div></div>
                                        </div>
                                        {description && <div className="pt-3 border-t border-cyan-500/10"><span className="text-slate-500 text-xs">Description</span><p className="text-slate-400 text-xs leading-relaxed mt-1">{description.slice(0, 200)}{description.length > 200 ? "..." : ""}</p></div>}
                                        <div className="pt-3 border-t border-cyan-500/10 grid grid-cols-2 gap-3">
                                            <div><span className="text-slate-500 text-xs">Requirements</span><div className="text-white text-xs mt-1">{requirements.filter(r => r.trim()).length} items</div></div>
                                            <div><span className="text-slate-500 text-xs">Benefits</span><div className="text-white text-xs mt-1">{benefits.length} items</div></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-500/20" style={{ backgroundColor: "rgba(250,204,21,0.05)" }}>
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-yellow-400 mt-0.5" />
                                    <div><div className="text-sm font-medium text-white mb-1">Before you publish</div><p className="text-xs text-slate-400 leading-relaxed">This listing will be visible to all recruiters. Ensure all details are accurate.</p></div>
                                </div>
                                <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${errors.agreed ? "border-red-400/50" : "border-cyan-500/15"}`} style={{ backgroundColor: "rgba(34,211,238,0.02)" }}>
                                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="checkbox checkbox-xs border-cyan-500/30 mt-0.5" />
                                    <div><div className="text-sm text-white">I agree to the Terms of Service and Marketplace Guidelines</div><div className="text-[10px] text-slate-500 mt-1">By posting, you confirm authorization and agree to platform fees.</div></div>
                                </label>
                                {errors.agreed && <p className="text-xs text-red-400 flex items-center gap-1"><i className="fa-regular fa-circle-exclamation text-[10px]" />{errors.agreed}</p>}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-cyan-500/10 flex items-center justify-between">
                        <button type="button" onClick={goBack} disabled={step === 1} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${step === 1 ? "text-slate-600 cursor-not-allowed" : "text-slate-400 hover:text-white border border-cyan-500/15 hover:border-cyan-500/30"}`}>
                            <i className="fa-regular fa-arrow-left text-xs" />Back
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1 mr-3">
                                {STEPS.map(s => <div key={s.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: s.id <= step ? "#22d3ee" : "rgba(34,211,238,0.15)" }} />)}
                            </div>
                            {step < 4 ? (
                                <button type="button" onClick={goNext} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-900" style={{ backgroundColor: "#22d3ee" }}>Next<i className="fa-regular fa-arrow-right text-xs" /></button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-900 disabled:opacity-60" style={{ backgroundColor: "#22d3ee" }}>
                                    {submitting ? <><span className="loading loading-spinner loading-xs" />Publishing...</> : <><i className="fa-duotone fa-regular fa-paper-plane text-xs" />Publish Role</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
