"use client";

import { useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

interface OnboardingData {
    userType: string;
    firstName: string;
    lastName: string;
    company: string;
    role: string;
    specializations: string[];
    splitFeeMin: string;
    splitFeeMax: string;
    geoPreferences: string[];
    notifyNewJobs: boolean;
    notifyWeeklyDigest: boolean;
}

const STEPS = [
    { label: "Welcome", icon: "fa-duotone fa-regular fa-hand-wave" },
    { label: "Your Profile", icon: "fa-duotone fa-regular fa-user" },
    { label: "Preferences", icon: "fa-duotone fa-regular fa-sliders" },
    { label: "All Set", icon: "fa-duotone fa-regular fa-party-horn" },
];

const SPECIALIZATIONS = ["Technology", "Healthcare", "Finance", "Legal", "Marketing", "Sales", "Engineering", "Executive"];
const GEO_OPTIONS = ["North America", "Europe", "Asia Pacific", "Latin America", "Global"];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function OnboardingPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const stepRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        userType: "", firstName: "", lastName: "", company: "", role: "independent",
        specializations: [], splitFeeMin: "20", splitFeeMax: "40",
        geoPreferences: [], notifyNewJobs: true, notifyWeeklyDigest: true,
    });

    useGSAP(() => {
        gsap.from("[data-onboard-el]", { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" });
    }, { scope: containerRef });

    const animateStep = useCallback((dir: "next" | "back") => {
        if (!stepRef.current) return;
        gsap.fromTo(stepRef.current, { opacity: 0, x: dir === "next" ? 50 : -50 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" });
    }, []);

    const goNext = () => { setStep((s) => Math.min(s + 1, 3)); animateStep("next"); };
    const goBack = () => { setStep((s) => Math.max(s - 1, 0)); animateStep("back"); };
    const toggleSpec = (s: string) => setData((d) => ({ ...d, specializations: d.specializations.includes(s) ? d.specializations.filter((x) => x !== s) : [...d.specializations, s] }));
    const toggleGeo = (g: string) => setData((d) => ({ ...d, geoPreferences: d.geoPreferences.includes(g) ? d.geoPreferences.filter((x) => x !== g) : [...d.geoPreferences, g] }));

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="text-center max-w-lg mx-auto">
                        <i className="fa-duotone fa-regular fa-circle-nodes text-secondary text-5xl mb-8 block" />
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content tracking-tight mb-4">Welcome to Splits Network</h2>
                        <p className="text-base-content/60 leading-relaxed mb-10">The split-fee recruiting marketplace built on transparency. Let us set up your account in just a few steps.</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-4">I am a...</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[{ value: "recruiter", label: "Recruiter", icon: "fa-duotone fa-regular fa-user-tie", desc: "Place candidates and earn split fees" },
                                { value: "company", label: "Hiring Company", icon: "fa-duotone fa-regular fa-building", desc: "Post jobs and find top talent" },
                                { value: "candidate", label: "Candidate", icon: "fa-duotone fa-regular fa-user", desc: "Discover career opportunities" }].map((opt) => (
                                <button key={opt.value} onClick={() => setData((d) => ({ ...d, userType: opt.value }))}
                                    className={`border p-6 text-center transition-colors ${data.userType === opt.value ? "border-secondary bg-secondary/5" : "border-base-300 hover:border-secondary/40"}`}>
                                    <i className={`${opt.icon} text-2xl mb-3 block ${data.userType === opt.value ? "text-secondary" : "text-base-content/30"}`} />
                                    <p className="text-sm font-bold text-base-content mb-1">{opt.label}</p>
                                    <p className="text-[10px] text-base-content/40">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="max-w-lg mx-auto">
                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">Step 2 of 4</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content tracking-tight mb-2">Tell us about yourself</h2>
                        <p className="text-sm text-base-content/50 mb-8">This helps us personalize your marketplace experience.</p>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <fieldset>
                                    <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">First Name</label>
                                    <input type="text" className="input input-bordered w-full bg-base-200 focus:border-secondary" placeholder="Jane" value={data.firstName} onChange={(e) => setData((d) => ({ ...d, firstName: e.target.value }))} />
                                </fieldset>
                                <fieldset>
                                    <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">Last Name</label>
                                    <input type="text" className="input input-bordered w-full bg-base-200 focus:border-secondary" placeholder="Doe" value={data.lastName} onChange={(e) => setData((d) => ({ ...d, lastName: e.target.value }))} />
                                </fieldset>
                            </div>
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">Company / Agency</label>
                                <input type="text" className="input input-bordered w-full bg-base-200 focus:border-secondary" placeholder="Acme Recruiting" value={data.company} onChange={(e) => setData((d) => ({ ...d, company: e.target.value }))} />
                            </fieldset>
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-2 block">Recruiter Type</label>
                                <div className="flex flex-col gap-3">
                                    {[{ value: "independent", label: "Independent Recruiter" }, { value: "agency", label: "Agency Recruiter" }, { value: "corporate", label: "Corporate / In-house" }].map((r) => (
                                        <label key={r.value} className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" name="role" className="radio radio-secondary radio-sm" checked={data.role === r.value} onChange={() => setData((d) => ({ ...d, role: r.value }))} />
                                            <span className="text-sm text-base-content/70">{r.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="max-w-lg mx-auto">
                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-2">Step 3 of 4</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content tracking-tight mb-2">Set your preferences</h2>
                        <p className="text-sm text-base-content/50 mb-8">Help us match you with the right opportunities.</p>
                        <div className="space-y-8">
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-3 block">Industry Specializations</label>
                                <div className="flex flex-wrap gap-2">
                                    {SPECIALIZATIONS.map((s) => (
                                        <button key={s} type="button" onClick={() => toggleSpec(s)}
                                            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium border transition-colors ${data.specializations.includes(s) ? "bg-secondary text-secondary-content border-secondary" : "bg-base-200 text-base-content/50 border-base-300 hover:border-secondary"}`}>{s}</button>
                                    ))}
                                </div>
                            </fieldset>
                            <fieldset>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-3 block">Geographic Focus</label>
                                <div className="flex flex-wrap gap-2">
                                    {GEO_OPTIONS.map((g) => (
                                        <button key={g} type="button" onClick={() => toggleGeo(g)}
                                            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium border transition-colors ${data.geoPreferences.includes(g) ? "bg-secondary text-secondary-content border-secondary" : "bg-base-200 text-base-content/50 border-base-300 hover:border-secondary"}`}>{g}</button>
                                    ))}
                                </div>
                            </fieldset>
                            <div>
                                <label className="text-xs uppercase tracking-[0.2em] text-base-content/50 font-medium mb-3 block">Split-Fee Range (%)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <fieldset>
                                        <input type="text" className="input input-bordered w-full bg-base-200 focus:border-secondary" placeholder="Min %" value={data.splitFeeMin} onChange={(e) => setData((d) => ({ ...d, splitFeeMin: e.target.value }))} />
                                    </fieldset>
                                    <fieldset>
                                        <input type="text" className="input input-bordered w-full bg-base-200 focus:border-secondary" placeholder="Max %" value={data.splitFeeMax} onChange={(e) => setData((d) => ({ ...d, splitFeeMax: e.target.value }))} />
                                    </fieldset>
                                </div>
                            </div>
                            <div className="h-px bg-base-300" />
                            <div className="space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-base-content/60">Notify me of new matching jobs</span>
                                    <input type="checkbox" className="toggle toggle-secondary toggle-sm" checked={data.notifyNewJobs} onChange={(e) => setData((d) => ({ ...d, notifyNewJobs: e.target.checked }))} />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-base-content/60">Send weekly marketplace digest</span>
                                    <input type="checkbox" className="toggle toggle-secondary toggle-sm" checked={data.notifyWeeklyDigest} onChange={(e) => setData((d) => ({ ...d, notifyWeeklyDigest: e.target.checked }))} />
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="text-center max-w-lg mx-auto py-8">
                        <i className="fa-duotone fa-regular fa-circle-check text-secondary text-6xl mb-8 block" />
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content tracking-tight mb-4">You are all set, {data.firstName || "there"}!</h2>
                        <p className="text-base-content/60 leading-relaxed mb-10">Your account is configured and ready. The Splits Network marketplace of 3,200+ recruiters and thousands of open positions is now at your fingertips.</p>
                        <div className="bg-base-200 p-6 text-left mb-8">
                            <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-4">Your Setup Summary</p>
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                <span className="text-base-content/50">Type</span>
                                <span className="text-base-content font-medium capitalize">{data.userType || "Recruiter"}</span>
                                <span className="text-base-content/50">Company</span>
                                <span className="text-base-content font-medium">{data.company || "---"}</span>
                                <span className="text-base-content/50">Specializations</span>
                                <span className="text-base-content font-medium">{data.specializations.length > 0 ? data.specializations.join(", ") : "---"}</span>
                                <span className="text-base-content/50">Fee Range</span>
                                <span className="text-base-content font-medium">{data.splitFeeMin}% - {data.splitFeeMax}%</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-3">
                            <button className="btn btn-secondary font-semibold uppercase text-xs tracking-wider px-8">
                                <i className="fa-duotone fa-regular fa-rocket-launch mr-2" />Go to Dashboard
                            </button>
                            <button className="btn btn-ghost border border-base-300 font-semibold uppercase text-xs tracking-wider px-6">Take a Tour</button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100 overflow-hidden flex flex-col">
            {/* Header */}
            <header className="bg-neutral text-neutral-content py-4 border-b border-neutral-content/10">
                <div className="max-w-5xl mx-auto px-6 md:px-12 flex items-center justify-between">
                    <div data-onboard-el className="flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-nodes text-secondary text-lg" />
                        <span className="text-base font-bold tracking-tight">Splits Network</span>
                    </div>
                    {step < 3 && <button data-onboard-el onClick={() => setStep(3)} className="text-xs uppercase tracking-wider text-neutral-content/40 hover:text-neutral-content transition-colors">Skip Setup</button>}
                </div>
            </header>

            {/* Progress */}
            <div className="bg-base-200 border-b border-base-300">
                <div className="max-w-5xl mx-auto px-6 md:px-12 py-5">
                    <div className="flex items-center justify-between mb-3">
                        {STEPS.map((s, i) => (
                            <div key={s.label} className="flex items-center gap-2">
                                <div className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold transition-colors ${i < step ? "bg-secondary text-secondary-content" : i === step ? "bg-base-content text-base-100" : "bg-base-300 text-base-content/30"}`}>
                                    {i < step ? <i className="fa-regular fa-check" /> : i + 1}
                                </div>
                                <span className={`hidden md:inline text-[10px] uppercase tracking-wider font-medium ${i <= step ? "text-base-content/60" : "text-base-content/25"}`}>{s.label}</span>
                                {i < STEPS.length - 1 && <div className={`hidden md:block w-8 lg:w-16 h-px mx-2 ${i < step ? "bg-secondary" : "bg-base-300"}`} />}
                            </div>
                        ))}
                    </div>
                    <div className="h-1 bg-base-300 w-full">
                        <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <main className="flex-1 py-12 md:py-16">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <div ref={stepRef}>{renderStep()}</div>
                </div>
            </main>

            {/* Footer Nav */}
            {step < 3 && (
                <footer className="border-t border-base-300 py-5">
                    <div className="max-w-5xl mx-auto px-6 md:px-12 flex items-center justify-between">
                        <div>{step > 0 && <button onClick={goBack} className="btn btn-ghost text-base-content/50 font-semibold uppercase text-xs tracking-wider"><i className="fa-duotone fa-regular fa-arrow-left mr-2" />Back</button>}</div>
                        <button onClick={goNext} disabled={step === 0 && !data.userType} className="btn btn-secondary font-semibold uppercase text-xs tracking-wider px-8">
                            {step === 0 ? "Get Started" : "Continue"}<i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
}
