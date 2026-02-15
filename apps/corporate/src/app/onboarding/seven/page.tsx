"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StepConfig {
    id: number;
    label: string;
    title: string;
    subtitle: string;
}

const steps: StepConfig[] = [
    { id: 1, label: "IDENTITY", title: "Create Your Profile", subtitle: "// OPERATOR REGISTRATION" },
    { id: 2, label: "ORGANIZATION", title: "Set Up Your Organization", subtitle: "// ENTITY CONFIGURATION" },
    { id: 3, label: "SPECIALIZATION", title: "Define Your Expertise", subtitle: "// CAPABILITY MAPPING" },
    { id: 4, label: "ACTIVATION", title: "Launch Your Pipeline", subtitle: "// SYSTEM INITIALIZATION" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OnboardingSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [completed, setCompleted] = useState(false);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-onboard-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-onboard-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-onboard-progress", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3");
            tl.fromTo(".bp-onboard-content", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            setCompleted(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const currentStepConfig = steps[currentStep - 1];

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    <div className="bp-onboard-ref flex justify-between items-center mb-6 opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-ONBD07-2026</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            ONBOARDING
                        </div>
                    </div>

                    <h1 className="bp-onboard-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                        System <span className="text-[#3b5ccc]">Onboarding</span>
                    </h1>
                    <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mb-10">// MULTI-STEP INITIALIZATION WIZARD</p>

                    {!completed ? (
                        <div className="max-w-3xl mx-auto">
                            {/* ═══ Progress Bar ═══ */}
                            <div className="bp-onboard-progress opacity-0 mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    {steps.map((step) => (
                                        <div key={step.id} className="flex items-center gap-2">
                                            <div
                                                className={`w-8 h-8 flex items-center justify-center font-mono text-[10px] tracking-widest border transition-colors ${
                                                    step.id < currentStep
                                                        ? "bg-[#3b5ccc] border-[#3b5ccc] text-white"
                                                        : step.id === currentStep
                                                          ? "border-[#3b5ccc] text-[#3b5ccc] bg-[#3b5ccc]/10"
                                                          : "border-[#c8ccd4]/15 text-[#c8ccd4]/20"
                                                }`}
                                            >
                                                {step.id < currentStep ? (
                                                    <i className="fa-duotone fa-regular fa-check text-[10px]"></i>
                                                ) : (
                                                    `0${step.id}`
                                                )}
                                            </div>
                                            <span
                                                className={`font-mono text-[9px] tracking-widest hidden md:inline ${
                                                    step.id === currentStep ? "text-[#3b5ccc]" : "text-[#c8ccd4]/20"
                                                }`}
                                            >
                                                {step.label}
                                            </span>
                                            {step.id < 4 && (
                                                <div className="hidden md:block w-12 lg:w-20 h-px mx-2">
                                                    <div className={`h-full ${step.id < currentStep ? "bg-[#3b5ccc]" : "bg-[#c8ccd4]/10"}`}></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full h-1 bg-[#c8ccd4]/5">
                                    <div
                                        className="h-full bg-[#3b5ccc] transition-all duration-500"
                                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* ═══ Step Content ═══ */}
                            <div className="bp-onboard-content opacity-0">
                                <div className="border border-[#3b5ccc]/15">
                                    <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                        STEP-{String(currentStep).padStart(3, "0")} // {currentStepConfig.label}
                                    </div>
                                    <div className="p-8">
                                        <h2 className="text-xl font-bold text-white mb-1">{currentStepConfig.title}</h2>
                                        <p className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider mb-8">{currentStepConfig.subtitle}</p>

                                        {/* Step 1: Identity */}
                                        {currentStep === 1 && (
                                            <div className="space-y-5">
                                                <div className="grid md:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">FIRST_NAME *</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter first name"
                                                            className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">LAST_NAME *</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter last name"
                                                            className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">JOB_TITLE *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Senior Technical Recruiter"
                                                        className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">LOCATION</label>
                                                    <input
                                                        type="text"
                                                        placeholder="City, State"
                                                        className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">AVATAR_UPLOAD</label>
                                                    <div className="border border-dashed border-[#3b5ccc]/20 p-8 text-center hover:border-[#3b5ccc]/40 transition-colors cursor-pointer">
                                                        <i className="fa-duotone fa-regular fa-cloud-arrow-up text-2xl text-[#3b5ccc]/20 mb-3"></i>
                                                        <div className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider">
                                                            DROP_FILE or <span className="text-[#3b5ccc]/60 underline">BROWSE</span>
                                                        </div>
                                                        <div className="font-mono text-[8px] text-[#c8ccd4]/15 tracking-wider mt-1">PNG, JPG up to 5MB</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Organization */}
                                        {currentStep === 2 && (
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">ORGANIZATION_NAME *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Your company or agency name"
                                                        className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">OPERATOR_TYPE *</label>
                                                    <div className="grid md:grid-cols-3 gap-3">
                                                        {["Recruiting Agency", "In-House Team", "Independent Recruiter"].map((type) => (
                                                            <button
                                                                key={type}
                                                                className="p-4 border border-[#3b5ccc]/15 text-center hover:border-[#3b5ccc]/40 hover:bg-[#3b5ccc]/5 transition-colors group"
                                                            >
                                                                <i className="fa-duotone fa-regular fa-building text-lg text-[#3b5ccc]/20 group-hover:text-[#3b5ccc]/50 transition-colors mb-2"></i>
                                                                <div className="font-mono text-[10px] text-[#c8ccd4]/40 tracking-wider group-hover:text-white transition-colors">
                                                                    {type}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">TEAM_SIZE</label>
                                                    <select className="w-full bg-[#0a0e17] border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono">
                                                        <option>1 - Solo operator</option>
                                                        <option>2-5 members</option>
                                                        <option>6-20 members</option>
                                                        <option>21-50 members</option>
                                                        <option>50+ members</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">WEBSITE</label>
                                                    <input
                                                        type="url"
                                                        placeholder="https://yourcompany.com"
                                                        className="w-full bg-transparent border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: Specialization */}
                                        {currentStep === 3 && (
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-3">INDUSTRY_FOCUS *</label>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {[
                                                            "Technology",
                                                            "Finance",
                                                            "Healthcare",
                                                            "Legal",
                                                            "Engineering",
                                                            "Marketing",
                                                            "Sales",
                                                            "Operations",
                                                            "Executive",
                                                        ].map((industry) => (
                                                            <button
                                                                key={industry}
                                                                className="px-3 py-2.5 border border-[#3b5ccc]/15 font-mono text-[10px] text-[#c8ccd4]/40 tracking-wider hover:border-[#3b5ccc]/40 hover:text-white hover:bg-[#3b5ccc]/5 transition-colors"
                                                            >
                                                                {industry}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">EXPERIENCE_YEARS *</label>
                                                    <select className="w-full bg-[#0a0e17] border border-[#3b5ccc]/15 px-4 py-2.5 text-sm text-white focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono">
                                                        <option>Less than 1 year</option>
                                                        <option>1-3 years</option>
                                                        <option>3-5 years</option>
                                                        <option>5-10 years</option>
                                                        <option>10+ years</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-2">PREFERRED_SPLIT_RATE</label>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="30"
                                                            max="70"
                                                            defaultValue="50"
                                                            className="flex-1 accent-[#3b5ccc]"
                                                        />
                                                        <span className="font-mono text-sm text-[#3b5ccc] w-12 text-right">50%</span>
                                                    </div>
                                                    <div className="flex justify-between font-mono text-[8px] text-[#c8ccd4]/15 tracking-wider mt-1">
                                                        <span>30%</span>
                                                        <span>70%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 4: Activation */}
                                        {currentStep === 4 && (
                                            <div className="space-y-6">
                                                <div className="border border-[#14b8a6]/15 bg-[#14b8a6]/5 p-6">
                                                    <div className="font-mono text-[9px] text-[#14b8a6]/40 tracking-widest mb-3">SETUP_SUMMARY</div>
                                                    <div className="space-y-3">
                                                        {[
                                                            { label: "Profile", status: "CONFIGURED", ok: true },
                                                            { label: "Organization", status: "CONFIGURED", ok: true },
                                                            { label: "Specialization", status: "CONFIGURED", ok: true },
                                                            { label: "Email Verification", status: "PENDING", ok: false },
                                                        ].map((item) => (
                                                            <div key={item.label} className="flex items-center justify-between">
                                                                <span className="text-sm text-[#c8ccd4]/50">{item.label}</span>
                                                                <span
                                                                    className={`font-mono text-[9px] tracking-widest ${
                                                                        item.ok ? "text-[#22c55e]/60" : "text-[#eab308]/60"
                                                                    }`}
                                                                >
                                                                    {item.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest block mb-3">QUICK_ACTIONS</label>
                                                    <div className="grid md:grid-cols-2 gap-3">
                                                        {[
                                                            { label: "Import LinkedIn Contacts", icon: "fa-address-book", desc: "Sync your professional network" },
                                                            { label: "Create First Job Role", icon: "fa-briefcase", desc: "Post your first open position" },
                                                            { label: "Invite Team Members", icon: "fa-users", desc: "Add colleagues to your org" },
                                                            { label: "Browse Open Splits", icon: "fa-magnifying-glass", desc: "Find roles to work on" },
                                                        ].map((action) => (
                                                            <button
                                                                key={action.label}
                                                                className="p-4 border border-[#3b5ccc]/15 text-left hover:border-[#3b5ccc]/30 hover:bg-[#3b5ccc]/5 transition-colors group"
                                                            >
                                                                <i className={`fa-duotone fa-regular ${action.icon} text-[#3b5ccc]/30 group-hover:text-[#3b5ccc]/60 transition-colors`}></i>
                                                                <div className="text-sm text-white mt-2">{action.label}</div>
                                                                <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-wider mt-1">{action.desc}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex items-center justify-between mt-6">
                                        <button
                                            onClick={handleBack}
                                            className={`px-5 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors ${
                                                currentStep === 1 ? "invisible" : ""
                                            }`}
                                        >
                                            <i className="fa-duotone fa-regular fa-arrow-left text-[8px] mr-2"></i>
                                            BACK
                                        </button>
                                        <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">
                                            STEP {currentStep} OF {steps.length}
                                        </div>
                                        <button
                                            onClick={handleNext}
                                            className="px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]"
                                        >
                                            {currentStep === 4 ? "ACTIVATE_SYSTEM" : "CONTINUE"}
                                            <i className="fa-duotone fa-regular fa-arrow-right text-[8px] ml-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ═══ Completion State ═══ */
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="border border-[#14b8a6]/15">
                                <div className="font-mono text-[9px] text-[#14b8a6]/30 tracking-widest px-6 py-3 border-b border-[#14b8a6]/10">
                                    INITIALIZATION_COMPLETE
                                </div>
                                <div className="p-12">
                                    <div className="w-20 h-20 border-2 border-[#14b8a6]/30 flex items-center justify-center mx-auto mb-6 bg-[#14b8a6]/5">
                                        <i className="fa-duotone fa-regular fa-rocket text-3xl text-[#14b8a6]/60"></i>
                                    </div>
                                    <div className="font-mono text-[10px] text-[#14b8a6]/40 tracking-widest mb-3">// ALL SYSTEMS OPERATIONAL</div>
                                    <h2 className="text-2xl font-bold text-white mb-3">Welcome to Splits Network</h2>
                                    <p className="text-sm text-[#c8ccd4]/40 leading-relaxed mb-8 max-w-md mx-auto">
                                        Your account has been activated and your pipeline is ready. Start by exploring open split opportunities or creating your first role.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button className="px-6 py-2.5 bg-[#14b8a6] text-white font-mono text-[10px] tracking-widest hover:bg-[#14b8a6]/90 transition-colors border border-[#14b8a6]">
                                            ENTER_DASHBOARD
                                        </button>
                                        <button
                                            onClick={() => { setCompleted(false); setCurrentStep(1); }}
                                            className="px-6 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors"
                                        >
                                            RESTART_DEMO
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
