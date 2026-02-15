"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* --- Data ----------------------------------------------------------------- */

const steps = [
    { id: 1, label: "Welcome", icon: "fa-duotone fa-regular fa-hand-wave" },
    { id: 2, label: "Profile", icon: "fa-duotone fa-regular fa-user" },
    { id: 3, label: "Specializations", icon: "fa-duotone fa-regular fa-bullseye" },
    { id: 4, label: "Preferences", icon: "fa-duotone fa-regular fa-sliders" },
    { id: 5, label: "Ready", icon: "fa-duotone fa-regular fa-rocket" },
];

const specializations = ["Engineering", "Product", "Design", "Data Science", "DevOps", "Machine Learning", "Sales", "Marketing", "Finance", "Operations", "Executive", "Customer Success"];
const industries = ["SaaS", "Fintech", "Healthcare Tech", "Developer Tools", "E-Commerce", "EdTech", "AI/ML", "Cybersecurity", "Climate Tech", "Gaming"];
const companyStages = ["Seed", "Series A", "Series B", "Series C+", "Growth", "Public"];

/* --- Page ----------------------------------------------------------------- */

export default function OnboardingOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [role, setRole] = useState<"recruiter" | "company" | "">("");

    const toggleItem = (arr: string[], val: string, setter: (v: string[]) => void) => {
        setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    };

    const canProceed = () => {
        if (currentStep === 1) return role !== "";
        if (currentStep === 2) return true;
        if (currentStep === 3) return selectedSpecs.length > 0;
        if (currentStep === 4) return true;
        return true;
    };

    useGSAP(() => {
        if (!mainRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => mainRef.current!.querySelectorAll(s);
        const $1 = (s: string) => mainRef.current!.querySelector(s);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo($1(".onboard-logo"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 })
          .fromTo($(".onboard-step-indicator"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.3")
          .fromTo($1(".onboard-panel"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
    }, { scope: mainRef });

    return (
        <main ref={mainRef} className="min-h-screen bg-neutral text-neutral-content flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative">
                <div className="absolute top-0 right-0 w-full h-full bg-primary/5" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,20% 100%)" }} />
                <div className="relative z-10">
                    <div className="onboard-logo opacity-0 mb-16">
                        <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center font-black text-lg">S</div>
                        <p className="text-sm font-semibold text-neutral-content/40 mt-3">Splits Network</p>
                    </div>
                    <h2 className="text-3xl font-black leading-tight tracking-tight mb-4">
                        Join the network.<br />
                        <span className="text-primary">Start earning.</span>
                    </h2>
                    <p className="text-sm text-neutral-content/40 leading-relaxed max-w-sm">
                        Set up your recruiter profile in minutes. We will match you with companies and roles that fit your expertise.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="relative z-10 space-y-3">
                    {steps.map((step) => (
                        <div key={step.id} className={`onboard-step-indicator opacity-0 flex items-center gap-3 px-4 py-3 transition-all ${currentStep === step.id ? "bg-neutral-content/10" : currentStep > step.id ? "opacity-60" : "opacity-30"}`}>
                            <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0 ${currentStep > step.id ? "bg-success text-success-content" : currentStep === step.id ? "bg-primary text-primary-content" : "bg-neutral-content/10"}`}>
                                {currentStep > step.id ? <i className="fa-solid fa-check" /> : step.id}
                            </div>
                            <span className="text-sm font-semibold">{step.label}</span>
                            {currentStep === step.id && <div className="ml-auto w-1.5 h-1.5 bg-primary" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Content */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-base-100 text-base-content">
                <div className="onboard-panel opacity-0 w-full max-w-lg">
                    {/* Mobile step indicator */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        {steps.map((step) => (
                            <div key={step.id} className={`h-1 flex-1 ${currentStep >= step.id ? "bg-primary" : "bg-base-300"}`} />
                        ))}
                    </div>

                    {/* Step 1: Welcome / Role Selection */}
                    {currentStep === 1 && (
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-2">Welcome to Splits</h1>
                            <p className="text-base-content/50 mb-8">First, tell us how you will be using the platform.</p>

                            <div className="space-y-4">
                                {[
                                    { id: "recruiter" as const, title: "I am a Recruiter", desc: "I source and place candidates for split-fee commissions", icon: "fa-duotone fa-regular fa-users", color: "primary" },
                                    { id: "company" as const, title: "I am a Company", desc: "I want to post roles and find recruiters to fill them", icon: "fa-duotone fa-regular fa-building", color: "secondary" },
                                ].map((option) => (
                                    <button key={option.id} onClick={() => setRole(option.id)}
                                        className={`w-full text-left p-6 border-2 transition-all flex items-start gap-4 ${role === option.id ? `border-${option.color} bg-${option.color}/5` : "border-base-300 hover:border-base-content/20"}`}>
                                        <div className={`w-12 h-12 bg-${option.color}/10 flex items-center justify-center flex-shrink-0`}>
                                            <i className={`${option.icon} text-${option.color} text-xl`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-1">{option.title}</h3>
                                            <p className="text-sm text-base-content/50">{option.desc}</p>
                                        </div>
                                        {role === option.id && <i className={`fa-solid fa-circle-check text-${option.color} ml-auto mt-1`} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Profile */}
                    {currentStep === 2 && (
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-2">Build your profile</h1>
                            <p className="text-base-content/50 mb-8">This information helps companies find and trust you.</p>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-primary/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-camera text-primary text-xl" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Profile Photo</p>
                                    <button className="text-xs text-primary font-semibold">Upload image</button>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">First Name</label>
                                        <input type="text" placeholder="Sarah" className="input input-bordered w-full" />
                                    </fieldset>
                                    <fieldset>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">Last Name</label>
                                        <input type="text" placeholder="Kim" className="input input-bordered w-full" />
                                    </fieldset>
                                </div>
                                <fieldset>
                                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">Professional Title</label>
                                    <input type="text" placeholder="Senior Technical Recruiter" className="input input-bordered w-full" />
                                </fieldset>
                                <fieldset>
                                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">Location</label>
                                    <input type="text" placeholder="San Francisco, CA" className="input input-bordered w-full" />
                                </fieldset>
                                <fieldset>
                                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">LinkedIn Profile</label>
                                    <input type="text" placeholder="linkedin.com/in/yourname" className="input input-bordered w-full" />
                                </fieldset>
                                <fieldset>
                                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">Short Bio</label>
                                    <textarea placeholder="Tell companies about your recruiting experience..." className="textarea textarea-bordered w-full h-24" />
                                </fieldset>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Specializations */}
                    {currentStep === 3 && (
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-2">Your specializations</h1>
                            <p className="text-base-content/50 mb-8">Select the areas where you recruit. Pick at least one.</p>

                            <div className="mb-8">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">Functional Areas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {specializations.map((s) => (
                                        <button key={s} onClick={() => toggleItem(selectedSpecs, s, setSelectedSpecs)}
                                            className={`px-4 py-2 text-sm font-semibold transition-all ${selectedSpecs.includes(s) ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/60 hover:bg-base-300"}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">Industries</h3>
                                <div className="flex flex-wrap gap-2">
                                    {industries.map((ind) => (
                                        <button key={ind} onClick={() => toggleItem(selectedIndustries, ind, setSelectedIndustries)}
                                            className={`px-4 py-2 text-sm font-semibold transition-all ${selectedIndustries.includes(ind) ? "bg-secondary text-secondary-content" : "bg-base-200 text-base-content/60 hover:bg-base-300"}`}>
                                            {ind}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">Company Stage</h3>
                                <div className="flex flex-wrap gap-2">
                                    {companyStages.map((stage) => (
                                        <button key={stage} onClick={() => toggleItem(selectedStages, stage, setSelectedStages)}
                                            className={`px-4 py-2 text-sm font-semibold transition-all ${selectedStages.includes(stage) ? "bg-accent text-accent-content" : "bg-base-200 text-base-content/60 hover:bg-base-300"}`}>
                                            {stage}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedSpecs.length > 0 && (
                                <div className="mt-6 p-4 bg-primary/5 border border-primary/20">
                                    <p className="text-xs font-semibold text-primary mb-2">Selected ({selectedSpecs.length + selectedIndustries.length + selectedStages.length})</p>
                                    <div className="flex flex-wrap gap-1">
                                        {[...selectedSpecs, ...selectedIndustries, ...selectedStages].map((item) => (
                                            <span key={item} className="px-2 py-1 bg-primary text-primary-content text-[10px] font-bold">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Preferences */}
                    {currentStep === 4 && (
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-2">Your preferences</h1>
                            <p className="text-base-content/50 mb-8">Fine-tune how you want to work on the marketplace.</p>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">Split Fee Range</h3>
                                    <div className="bg-base-200 p-5 border border-base-300">
                                        <div className="flex justify-between text-sm mb-3">
                                            <span className="font-bold text-primary">20%</span>
                                            <span className="text-base-content/40">to</span>
                                            <span className="font-bold text-primary">50%</span>
                                        </div>
                                        <input type="range" min="10" max="60" defaultValue="35" className="range range-primary range-sm w-full" />
                                        <p className="text-xs text-base-content/40 mt-2">Your preferred commission split percentage</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">Availability</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["Full-Time", "Part-Time", "Project-Based"].map((a, i) => (
                                            <button key={a} className={`p-4 border-2 text-center text-sm font-semibold transition-all ${i === 0 ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/20"}`}>
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">Notification Preferences</h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: "New roles matching my specializations", defaultChecked: true },
                                            { label: "Messages from companies", defaultChecked: true },
                                            { label: "Placement status updates", defaultChecked: true },
                                            { label: "Weekly marketplace digest", defaultChecked: false },
                                        ].map((pref) => (
                                            <label key={pref.label} className="flex items-center justify-between p-3 bg-base-200 border border-base-300 cursor-pointer">
                                                <span className="text-sm">{pref.label}</span>
                                                <input type="checkbox" className="toggle toggle-primary toggle-sm" defaultChecked={pref.defaultChecked} />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Ready */}
                    {currentStep === 5 && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-success/10 flex items-center justify-center mx-auto mb-6">
                                <i className="fa-duotone fa-regular fa-rocket text-success text-4xl" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight mb-2">You are all set!</h1>
                            <p className="text-base-content/50 mb-8 max-w-sm mx-auto">
                                Your profile is ready. Start browsing open roles and submit your first candidate.
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-10 max-w-sm mx-auto">
                                {[
                                    { value: "2,400+", label: "Open Roles", icon: "fa-duotone fa-regular fa-briefcase" },
                                    { value: "800+", label: "Companies", icon: "fa-duotone fa-regular fa-building" },
                                    { value: "$42K", label: "Avg Fee", icon: "fa-duotone fa-regular fa-dollar-sign" },
                                ].map((stat) => (
                                    <div key={stat.label} className="p-4 bg-base-200 border border-base-300 text-center">
                                        <i className={`${stat.icon} text-primary text-lg mb-2 block`} />
                                        <div className="text-lg font-black">{stat.value}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-base-content/40">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                <button className="btn btn-primary w-full"><i className="fa-duotone fa-regular fa-briefcase" /> Browse Open Roles</button>
                                <button className="btn btn-ghost w-full"><i className="fa-duotone fa-regular fa-gauge-high" /> Go to Dashboard</button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    {currentStep < 5 && (
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-base-300">
                            <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                className={`btn btn-ghost ${currentStep === 1 ? "invisible" : ""}`}>
                                <i className="fa-solid fa-arrow-left text-xs" /> Back
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-base-content/30">Step {currentStep} of 5</span>
                                <button onClick={() => setCurrentStep(Math.min(5, currentStep + 1))} disabled={!canProceed()}
                                    className="btn btn-primary">
                                    {currentStep === 4 ? "Finish" : "Continue"} <i className="fa-solid fa-arrow-right text-xs" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
