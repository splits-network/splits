"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface FormErrors { [key: string]: string }

const steps = [
    { num: "01", label: "Basics", icon: "fa-duotone fa-regular fa-briefcase" },
    { num: "02", label: "Details", icon: "fa-duotone fa-regular fa-file-lines" },
    { num: "03", label: "Requirements", icon: "fa-duotone fa-regular fa-list-check" },
    { num: "04", label: "Review", icon: "fa-duotone fa-regular fa-magnifying-glass-plus" },
];

const departments = [
    "Engineering", "Product", "Design", "Marketing", "Sales",
    "Operations", "Finance", "Legal", "People / HR", "Data Science",
];

const employmentTypes = [
    { value: "full-time", label: "Full-Time" },
    { value: "part-time", label: "Part-Time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
];

const experienceLevels = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "mid", label: "Mid Level (3-5 years)" },
    { value: "senior", label: "Senior (6-9 years)" },
    { value: "lead", label: "Lead / Staff (10+ years)" },
    { value: "executive", label: "Executive / VP" },
];

const benefitOptions = [
    "Health Insurance", "Dental & Vision", "401(k) Match", "Remote Work",
    "Flexible Hours", "Equity / Stock Options", "PTO / Unlimited PTO",
    "Learning Budget", "Gym Membership", "Parental Leave",
    "Mental Health Support", "Relocation Assistance",
];

const skillSuggestions = [
    "React", "TypeScript", "Node.js", "Python", "AWS", "Kubernetes",
    "SQL", "GraphQL", "Go", "Rust", "Docker", "Terraform",
    "Product Strategy", "Figma", "Data Analysis", "Machine Learning",
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function FormsOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [title, setTitle] = useState("");
    const [department, setDepartment] = useState("");
    const [employmentType, setEmploymentType] = useState("full-time");
    const [location, setLocation] = useState("");
    const [remotePolicy, setRemotePolicy] = useState("hybrid");
    const [salaryMin, setSalaryMin] = useState("");
    const [salaryMax, setSalaryMax] = useState("");
    const [description, setDescription] = useState("");
    const [responsibilities, setResponsibilities] = useState("");
    const [experience, setExperience] = useState("mid");
    const [skills, setSkills] = useState<string[]>(["React", "TypeScript"]);
    const [benefits, setBenefits] = useState<string[]>(["Health Insurance", "Remote Work"]);
    const [splitFee, setSplitFee] = useState("20");
    const [guarantee, setGuarantee] = useState("90");
    const [urgency, setUrgency] = useState("normal");
    const [resumeFile, setResumeFile] = useState<string | null>(null);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const validateStep = (step: number): boolean => {
        const e: FormErrors = {};
        if (step === 0) {
            if (!title.trim()) e.title = "Job title is required";
            if (!department) e.department = "Select a department";
            if (!location.trim()) e.location = "Location is required";
        }
        if (step === 1) {
            if (!description.trim()) e.description = "Description is required";
            if (description.trim().length < 50) e.description = "Minimum 50 characters";
            if (!salaryMin || !salaryMax) e.salary = "Both salary bounds required";
            if (salaryMin && salaryMax && Number(salaryMin) >= Number(salaryMax)) e.salary = "Min must be less than max";
        }
        if (step === 2) { if (skills.length === 0) e.skills = "Add at least one skill"; }
        if (step === 3) { if (!agreeTerms) e.terms = "You must agree to terms"; }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => { if (validateStep(currentStep)) setCurrentStep((s) => Math.min(s + 1, 3)); };
    const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));
    const handleSubmit = () => {
        if (!validateStep(3)) return;
        setSubmitting(true);
        setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 2000);
    };
    const toggleSkill = (s: string) => setSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
    const toggleBenefit = (b: string) => setBenefits((p) => p.includes(b) ? p.filter((x) => x !== b) : [...p, b]);

    useGSAP(() => {
        if (!mainRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => mainRef.current!.querySelectorAll(s);
        const $1 = (s: string) => mainRef.current!.querySelector(s);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo($1(".form-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
          .fromTo($(".form-title-word"), { opacity: 0, y: 60, rotateX: 30 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1 }, "-=0.3")
          .fromTo($1(".form-subtitle"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
          .fromTo($(".step-ind"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.3")
          .fromTo($1(".form-container"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
    }, { scope: mainRef });

    const FieldError = ({ field }: { field: string }) =>
        errors[field] ? (
            <p className="text-error text-xs mt-1 flex items-center gap-1">
                <i className="fa-duotone fa-regular fa-circle-exclamation text-[10px]" />{errors[field]}
            </p>
        ) : null;

    if (submitted) {
        return (
            <main ref={mainRef} className="min-h-screen bg-base-100 flex items-center justify-center">
                <div className="text-center max-w-lg px-6">
                    <div className="w-20 h-20 bg-success/10 flex items-center justify-center mx-auto mb-6">
                        <i className="fa-duotone fa-regular fa-circle-check text-success text-4xl" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-4">Job Posted!</h1>
                    <p className="text-base-content/60 leading-relaxed mb-8">
                        Your posting for <strong className="text-base-content">{title}</strong> is now live on the Splits Network marketplace.
                    </p>
                    <div className="bg-base-200 p-6 mb-8 text-left">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-[10px] uppercase tracking-widest text-base-content/40">Department</span><p className="font-bold">{department}</p></div>
                            <div><span className="text-[10px] uppercase tracking-widest text-base-content/40">Type</span><p className="font-bold capitalize">{employmentType.replace("-", " ")}</p></div>
                            <div><span className="text-[10px] uppercase tracking-widest text-base-content/40">Salary</span><p className="font-bold">${Number(salaryMin).toLocaleString()} - ${Number(salaryMax).toLocaleString()}</p></div>
                            <div><span className="text-[10px] uppercase tracking-widest text-base-content/40">Split Fee</span><p className="font-bold">{splitFee}%</p></div>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => { setSubmitted(false); setCurrentStep(0); }} className="btn btn-primary"><i className="fa-duotone fa-regular fa-plus" /> Post Another</button>
                        <button className="btn btn-ghost"><i className="fa-duotone fa-regular fa-gauge-high" /> Dashboard</button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Header ──────────────────────────────────────── */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10" style={{ clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)" }} />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="form-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">Create Job Posting</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="form-title-word inline-block opacity-0">Post a</span>{" "}
                            <span className="form-title-word inline-block opacity-0 text-primary">new role</span>{" "}
                            <br className="hidden md:block" />
                            <span className="form-title-word inline-block opacity-0">to the marketplace.</span>
                        </h1>
                        <p className="form-subtitle text-base text-neutral-content/50 max-w-xl opacity-0">
                            Define the role, set your terms, and let the network find the perfect candidates.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Step Indicators ─────────────────────────────── */}
            <section className="bg-base-200 border-b border-base-300">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex overflow-x-auto">
                        {steps.map((step, i) => (
                            <button key={step.num} onClick={() => { if (i < currentStep) setCurrentStep(i); }}
                                className={`step-ind opacity-0 flex items-center gap-3 px-6 py-4 border-b-2 transition-all text-sm font-semibold whitespace-nowrap ${
                                    i === currentStep ? "border-primary text-primary"
                                    : i < currentStep ? "border-success text-success cursor-pointer"
                                    : "border-transparent text-base-content/30"
                                }`}>
                                <span className={`w-7 h-7 flex items-center justify-center text-xs font-bold ${
                                    i === currentStep ? "bg-primary text-primary-content"
                                    : i < currentStep ? "bg-success text-success-content"
                                    : "bg-base-300 text-base-content/40"
                                }`}>{i < currentStep ? <i className="fa-duotone fa-regular fa-check text-[10px]" /> : step.num}</span>
                                <span className="hidden sm:inline">{step.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Form Content ────────────────────────────────── */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="form-container opacity-0 grid lg:grid-cols-5 gap-10 lg:gap-16">
                    <div className="lg:col-span-3">
                        {/* Step 0: Basics */}
                        {currentStep === 0 && (
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Job Basics</h2>
                                <p className="text-sm text-base-content/50 mb-8">Start with the fundamental details about this role.</p>
                                <div className="space-y-6">
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Job Title <span className="text-error">*</span></label>
                                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Full-Stack Engineer"
                                            className={`input w-full bg-base-200 border-base-300 focus:border-primary focus:outline-none ${errors.title ? "border-error" : ""}`} />
                                        <FieldError field="title" />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Department <span className="text-error">*</span></label>
                                        <select value={department} onChange={(e) => setDepartment(e.target.value)}
                                            className={`select w-full bg-base-200 border-base-300 focus:border-primary focus:outline-none ${errors.department ? "border-error" : ""}`}>
                                            <option value="">Select department...</option>
                                            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <FieldError field="department" />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-3 block">Employment Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {employmentTypes.map((et) => (
                                                <button key={et.value} type="button" onClick={() => setEmploymentType(et.value)}
                                                    className={`px-4 py-2 text-sm font-semibold border transition-all ${
                                                        employmentType === et.value ? "bg-primary text-primary-content border-primary" : "bg-base-200 text-base-content/60 border-base-300 hover:border-primary/50"
                                                    }`}>{et.label}</button>
                                            ))}
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Location <span className="text-error">*</span></label>
                                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA"
                                            className={`input w-full bg-base-200 border-base-300 focus:border-primary focus:outline-none ${errors.location ? "border-error" : ""}`} />
                                        <FieldError field="location" />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-3 block">Remote Policy</label>
                                        <div className="space-y-2">
                                            {[
                                                { value: "onsite", label: "On-site only", icon: "fa-duotone fa-regular fa-building" },
                                                { value: "hybrid", label: "Hybrid (office + remote)", icon: "fa-duotone fa-regular fa-arrows-split-up-and-left" },
                                                { value: "remote", label: "Fully remote", icon: "fa-duotone fa-regular fa-globe" },
                                            ].map((opt) => (
                                                <label key={opt.value} className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                                                    remotePolicy === opt.value ? "border-primary bg-primary/5" : "border-base-300 bg-base-200 hover:border-base-content/20"
                                                }`}>
                                                    <input type="radio" name="remote" value={opt.value} checked={remotePolicy === opt.value}
                                                        onChange={(e) => setRemotePolicy(e.target.value)} className="radio radio-primary radio-sm" />
                                                    <i className={`${opt.icon} text-sm ${remotePolicy === opt.value ? "text-primary" : "text-base-content/40"}`} />
                                                    <span className={`text-sm font-semibold ${remotePolicy === opt.value ? "text-base-content" : "text-base-content/60"}`}>{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Details */}
                        {currentStep === 1 && (
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Role Details</h2>
                                <p className="text-sm text-base-content/50 mb-8">Describe the role and set compensation.</p>
                                <div className="space-y-6">
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Job Description <span className="text-error">*</span></label>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Describe the role, team, and what makes this opportunity exciting..."
                                            className={`textarea w-full bg-base-200 border-base-300 focus:border-primary focus:outline-none leading-relaxed ${errors.description ? "border-error" : ""}`} />
                                        <div className="flex justify-between mt-1"><FieldError field="description" /><span className={`text-[10px] ${description.length >= 50 ? "text-success" : "text-base-content/30"}`}>{description.length}/50 min</span></div>
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Key Responsibilities</label>
                                        <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={4} placeholder="One per line..."
                                            className="textarea w-full bg-base-200 border-base-300 focus:border-primary focus:outline-none leading-relaxed" />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Salary Range (USD) <span className="text-error">*</span></label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm">$</span>
                                                <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="120,000"
                                                    className={`input w-full pl-7 bg-base-200 border-base-300 focus:border-primary focus:outline-none ${errors.salary ? "border-error" : ""}`} />
                                            </div>
                                            <span className="text-base-content/30 font-bold">to</span>
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm">$</span>
                                                <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="180,000"
                                                    className={`input w-full pl-7 bg-base-200 border-base-300 focus:border-primary focus:outline-none ${errors.salary ? "border-error" : ""}`} />
                                            </div>
                                        </div>
                                        <FieldError field="salary" />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Experience Level</label>
                                        <select value={experience} onChange={(e) => setExperience(e.target.value)}
                                            className="select w-full bg-base-200 border-base-300 focus:border-primary focus:outline-none">
                                            {experienceLevels.map((el) => <option key={el.value} value={el.value}>{el.label}</option>)}
                                        </select>
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Attach Job Description (PDF)</label>
                                        <div className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                                            resumeFile ? "border-success bg-success/5" : "border-base-300 hover:border-primary/50 bg-base-200"
                                        }`} onClick={() => setResumeFile(resumeFile ? null : "job-description.pdf")}>
                                            {resumeFile ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <i className="fa-duotone fa-regular fa-file-pdf text-success text-xl" />
                                                    <span className="text-sm font-semibold text-success">{resumeFile}</span>
                                                    <span className="text-xs text-base-content/40">Click to remove</span>
                                                </div>
                                            ) : (
                                                <><i className="fa-duotone fa-regular fa-cloud-arrow-up text-2xl text-base-content/30 mb-2" /><p className="text-sm text-base-content/50">Click to upload or drag and drop</p><p className="text-[10px] text-base-content/30 mt-1">PDF, DOC up to 10MB</p></>
                                            )}
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Requirements */}
                        {currentStep === 2 && (
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Requirements & Terms</h2>
                                <p className="text-sm text-base-content/50 mb-8">Define skills, benefits, and marketplace terms.</p>
                                <div className="space-y-6">
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-3 block">Required Skills <span className="text-error">*</span></label>
                                        {skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {skills.map((sk) => (
                                                    <span key={sk} className="flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-content text-xs font-semibold">
                                                        {sk}<button onClick={() => toggleSkill(sk)} className="hover:opacity-70"><i className="fa-solid fa-xmark text-[9px]" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {skillSuggestions.filter((s) => !skills.includes(s)).map((sk) => (
                                                <button key={sk} type="button" onClick={() => toggleSkill(sk)}
                                                    className="px-3 py-1 text-xs font-semibold bg-base-200 text-base-content/50 border border-base-300 hover:border-primary/50 hover:text-primary transition-colors">
                                                    <i className="fa-solid fa-plus text-[8px] mr-1" />{sk}
                                                </button>
                                            ))}
                                        </div>
                                        <FieldError field="skills" />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-3 block">Benefits Offered</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {benefitOptions.map((b) => (
                                                <label key={b} className={`flex items-center gap-2 p-2.5 border cursor-pointer transition-all text-sm ${
                                                    benefits.includes(b) ? "border-secondary bg-secondary/5 text-base-content" : "border-base-300 bg-base-200 text-base-content/50 hover:border-base-content/20"
                                                }`}>
                                                    <input type="checkbox" checked={benefits.includes(b)} onChange={() => toggleBenefit(b)} className="checkbox checkbox-secondary checkbox-xs" />{b}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Recruiter Split Fee (%)</label>
                                        <div className="flex items-center gap-4">
                                            <input type="range" min="10" max="30" step="1" value={splitFee} onChange={(e) => setSplitFee(e.target.value)} className="range range-primary flex-1" />
                                            <span className="text-2xl font-black text-primary w-16 text-center">{splitFee}%</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-base-content/30 mt-1 px-1"><span>10%</span><span>20% standard</span><span>30%</span></div>
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">Guarantee Period</label>
                                        <div className="flex gap-2">
                                            {["30", "60", "90", "120"].map((g) => (
                                                <button key={g} type="button" onClick={() => setGuarantee(g)}
                                                    className={`flex-1 py-2 text-sm font-bold border transition-all ${
                                                        guarantee === g ? "bg-primary text-primary-content border-primary" : "bg-base-200 text-base-content/50 border-base-300 hover:border-primary/50"
                                                    }`}>{g} days</button>
                                            ))}
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-3 block">Hiring Urgency</label>
                                        <div className="flex gap-2">
                                            {[
                                                { value: "low", label: "Low", icon: "fa-duotone fa-regular fa-clock" },
                                                { value: "normal", label: "Normal", icon: "fa-duotone fa-regular fa-gauge" },
                                                { value: "high", label: "High", icon: "fa-duotone fa-regular fa-gauge-high" },
                                                { value: "urgent", label: "Urgent", icon: "fa-duotone fa-regular fa-bolt" },
                                            ].map((u) => (
                                                <button key={u.value} type="button" onClick={() => setUrgency(u.value)}
                                                    className={`flex-1 flex flex-col items-center gap-1 py-3 border transition-all ${
                                                        urgency === u.value ? u.value === "urgent" ? "bg-error text-error-content border-error" : "bg-primary text-primary-content border-primary"
                                                        : "bg-base-200 text-base-content/50 border-base-300"
                                                    }`}><i className={u.icon} /><span className="text-xs font-semibold">{u.label}</span></button>
                                            ))}
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Review & Submit</h2>
                                <p className="text-sm text-base-content/50 mb-8">Confirm details before posting.</p>
                                <div className="space-y-6">
                                    {[
                                        { title: "Basics", step: 0, items: [
                                            { label: "Title", value: title || "Not set" },
                                            { label: "Department", value: department || "Not set" },
                                            { label: "Type", value: employmentTypes.find((t) => t.value === employmentType)?.label },
                                            { label: "Location", value: location || "Not set" },
                                            { label: "Remote", value: remotePolicy.charAt(0).toUpperCase() + remotePolicy.slice(1) },
                                        ]},
                                        { title: "Details", step: 1, items: [
                                            { label: "Description", value: description ? `${description.substring(0, 80)}...` : "Not set" },
                                            { label: "Salary", value: salaryMin && salaryMax ? `$${Number(salaryMin).toLocaleString()} - $${Number(salaryMax).toLocaleString()}` : "Not set" },
                                            { label: "Experience", value: experienceLevels.find((l) => l.value === experience)?.label },
                                        ]},
                                        { title: "Requirements", step: 2, items: [
                                            { label: "Skills", value: skills.join(", ") || "None" },
                                            { label: "Benefits", value: `${benefits.length} selected` },
                                            { label: "Split Fee", value: `${splitFee}%` },
                                            { label: "Guarantee", value: `${guarantee} days` },
                                            { label: "Urgency", value: urgency.charAt(0).toUpperCase() + urgency.slice(1) },
                                        ]},
                                    ].map((sec) => (
                                        <div key={sec.title} className="border border-base-300 bg-base-200">
                                            <div className="flex items-center justify-between p-4 border-b border-base-300">
                                                <h3 className="text-sm font-black uppercase tracking-wider">{sec.title}</h3>
                                                <button onClick={() => setCurrentStep(sec.step)} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                                            </div>
                                            <div className="p-4 grid grid-cols-2 gap-3">
                                                {sec.items.map((it) => (
                                                    <div key={it.label}><span className="text-[10px] uppercase tracking-widest text-base-content/40">{it.label}</span><p className="text-sm font-semibold truncate">{it.value}</p></div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <label className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${
                                        agreeTerms ? "border-primary bg-primary/5" : errors.terms ? "border-error bg-error/5" : "border-base-300 bg-base-200"
                                    }`}>
                                        <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="checkbox checkbox-primary checkbox-sm mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold">I agree to the Splits Network marketplace terms</p>
                                            <p className="text-xs text-base-content/50 mt-0.5">By posting, you commit to the split fee and guarantee period above.</p>
                                        </div>
                                    </label>
                                    <FieldError field="terms" />
                                </div>
                            </div>
                        )}

                        {/* Nav Buttons */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-base-300">
                            <button onClick={handleBack} disabled={currentStep === 0} className="btn btn-ghost btn-sm disabled:opacity-30">
                                <i className="fa-duotone fa-regular fa-arrow-left" /> Back
                            </button>
                            {currentStep < 3 ? (
                                <button onClick={handleNext} className="btn btn-primary btn-sm">Continue <i className="fa-duotone fa-regular fa-arrow-right" /></button>
                            ) : (
                                <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">
                                    {submitting ? <><span className="loading loading-spinner loading-sm" />Publishing...</> : <><i className="fa-duotone fa-regular fa-paper-plane" /> Post to Marketplace</>}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2">
                        <div className="bg-base-200 border-t-4 border-primary p-6 mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">Progress</h3>
                            <div className="space-y-3">
                                {steps.map((step, i) => (
                                    <div key={step.num} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold ${
                                            i < currentStep ? "bg-success text-success-content" : i === currentStep ? "bg-primary text-primary-content" : "bg-base-300 text-base-content/30"
                                        }`}>{i < currentStep ? <i className="fa-solid fa-check" /> : step.num}</div>
                                        <span className={`text-sm ${i <= currentStep ? "font-semibold text-base-content" : "text-base-content/40"}`}>{step.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-base-300">
                                <div className="flex justify-between text-xs text-base-content/50 mb-1"><span>Completion</span><span>{Math.round(((currentStep + 1) / 4) * 100)}%</span></div>
                                <div className="w-full h-1.5 bg-base-300"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentStep + 1) / 4) * 100}%` }} /></div>
                            </div>
                        </div>
                        <div className="bg-base-200 p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2"><i className="fa-duotone fa-regular fa-lightbulb text-warning" /> Tips</h3>
                            <div className="space-y-3">
                                {[
                                    currentStep === 0 && "Be specific with the job title for better recruiter matching.",
                                    currentStep === 0 && "Including remote policy helps recruiters source faster.",
                                    currentStep === 1 && "Descriptions with 200+ words get 3x more recruiter engagement.",
                                    currentStep === 1 && "Transparent salary ranges attract higher-quality candidates.",
                                    currentStep === 2 && "5-8 required skills gets the best match quality.",
                                    currentStep === 2 && "Standard 20% split fee attracts the most recruiter interest.",
                                    currentStep === 3 && "Review carefully. Changes after posting notify active recruiters.",
                                    currentStep === 3 && "Most roles receive first submissions within 24-48 hours.",
                                ].filter(Boolean).map((tip, i) => (
                                    <div key={i} className="flex gap-2 text-xs text-base-content/60"><i className="fa-duotone fa-regular fa-circle-info text-primary mt-0.5 flex-shrink-0" /><span>{tip}</span></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
