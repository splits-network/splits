"use client";

import { useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };

type Step = 1 | 2 | 3 | 4 | 5;

const stepDefs = [
    { number: "01", title: "Welcome", icon: "fa-hand-wave" },
    { number: "02", title: "Profile", icon: "fa-user" },
    { number: "03", title: "Expertise", icon: "fa-briefcase" },
    { number: "04", title: "Preferences", icon: "fa-sliders" },
    { number: "05", title: "Complete", icon: "fa-check" },
];

export default function OnboardingThreePage() {
    const [step, setStep] = useState<Step>(1);
    const [role, setRole] = useState<"recruiter" | "company" | "">("");
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [regions, setRegions] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const animateStep = useCallback((newStep: Step) => {
        if (!contentRef.current || newStep === step) return;
        const dir = newStep > step ? 1 : -1;
        gsap.to(contentRef.current, {
            opacity: 0, x: dir * 40, duration: D.fast, ease: E.precise,
            onComplete: () => {
                setStep(newStep);
                gsap.fromTo(contentRef.current, { opacity: 0, x: -dir * 40 }, { opacity: 1, x: 0, duration: D.normal, ease: E.precise });
            },
        });
    }, [step]);

    const toggleItem = (arr: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
        setter((p) => p.includes(val) ? p.filter((v) => v !== val) : [...p, val]);
    };

    useGSAP(() => {
        if (!containerRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
        const $1 = (sel: string) => containerRef.current!.querySelector(sel);
        const tl = gsap.timeline({ defaults: { ease: E.precise } });
        tl.fromTo($1(".logo-mark"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: D.normal });
        tl.fromTo($(".progress-step"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.05 }, "-=0.2");
    }, { scope: containerRef });

    const inputClass = "w-full px-4 py-3 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral placeholder:text-base-content/25 transition-colors";

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen flex flex-col">
            {/* Top bar */}
            <div className="border-b border-neutral/10 px-6 lg:px-12 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="logo-mark opacity-0 w-8 h-8 bg-neutral flex items-center justify-center">
                        <span className="text-neutral-content text-[10px] font-black">SN</span>
                    </div>
                    <span className="text-xs font-black tracking-tight">SPLITS NETWORK</span>
                </div>
                {step < 5 && (
                    <button className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/25 hover:text-base-content transition-colors">
                        Skip for now
                    </button>
                )}
            </div>

            {/* Progress */}
            {step < 5 && (
                <div className="px-6 lg:px-12 py-4 border-b border-neutral/10">
                    <div className="flex items-center gap-0 max-w-2xl mx-auto">
                        {stepDefs.slice(0, 4).map((s, i) => {
                            const stepNum = (i + 1) as Step;
                            const active = step === stepNum;
                            const done = step > stepNum;
                            return (
                                <div key={s.number} className="progress-step opacity-0 flex-1 flex items-center">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${active ? "bg-neutral text-neutral-content" : done ? "bg-base-200" : ""}`}>
                                        <span className={`text-sm font-black tracking-tighter ${active ? "" : done ? "text-base-content/50" : "text-base-content/15"}`}>{s.number}</span>
                                        <span className={`text-[9px] uppercase tracking-[0.15em] font-bold hidden sm:inline ${active ? "" : done ? "text-base-content/40" : "text-base-content/20"}`}>{s.title}</span>
                                        {done && <i className="fa-duotone fa-regular fa-check text-[9px] text-success" />}
                                    </div>
                                    {i < 3 && <div className={`flex-1 h-[1px] ${done ? "bg-neutral/30" : "bg-neutral/10"}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div ref={contentRef} className="w-full max-w-lg">
                    {step === 1 && (
                        <div className="text-center">
                            <div className="text-[6rem] font-black tracking-tighter text-neutral/6 select-none leading-none mb-4">01</div>
                            <h2 className="text-3xl font-black tracking-tight mb-3">Welcome to Splits Network</h2>
                            <p className="text-sm text-base-content/40 leading-relaxed mb-8 max-w-sm mx-auto">
                                The split-fee recruiting marketplace. Let&apos;s set up your account in a few quick steps.
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/25 font-bold mb-4">I am a...</p>
                            <div className="grid grid-cols-2 gap-[2px] bg-neutral/10 mb-8">
                                {[
                                    { id: "recruiter" as const, label: "Recruiter", icon: "fa-user-tie", desc: "I place candidates" },
                                    { id: "company" as const, label: "Company", icon: "fa-building", desc: "I hire talent" },
                                ].map((opt) => (
                                    <button key={opt.id} onClick={() => setRole(opt.id)} className={`bg-base-100 p-6 text-center transition-colors ${role === opt.id ? "bg-neutral text-neutral-content" : "hover:bg-base-200"}`}>
                                        <i className={`fa-duotone fa-regular ${opt.icon} text-2xl mb-3 block ${role === opt.id ? "" : "text-base-content/15"}`} />
                                        <div className="text-sm font-black tracking-tight mb-0.5">{opt.label}</div>
                                        <div className={`text-[9px] uppercase tracking-[0.1em] ${role === opt.id ? "text-neutral-content/50" : "text-base-content/25"}`}>{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => role && animateStep(2)} disabled={!role} className="px-8 py-3 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                Get Started
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="text-center mb-8">
                                <div className="text-5xl font-black tracking-tighter text-neutral/6 select-none leading-none mb-2">02</div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Build Your Profile</h2>
                                <p className="text-sm text-base-content/40">Tell us about yourself so we can find the right matches.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">First Name</label><input type="text" placeholder="Jane" className={inputClass} /></div>
                                    <div><label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Last Name</label><input type="text" placeholder="Doe" className={inputClass} /></div>
                                </div>
                                <div><label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">{role === "company" ? "Company Name" : "Agency / Firm"}</label><input type="text" placeholder={role === "company" ? "Acme Corp" : "TechTalent Partners"} className={inputClass} /></div>
                                <div><label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">Location</label><input type="text" placeholder="San Francisco, CA" className={inputClass} /></div>
                                <div><label className="text-[10px] uppercase tracking-[0.25em] text-base-content/40 font-bold block mb-2">LinkedIn Profile</label><input type="text" placeholder="linkedin.com/in/..." className={inputClass} /></div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div className="text-center mb-8">
                                <div className="text-5xl font-black tracking-tighter text-neutral/6 select-none leading-none mb-2">03</div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Your Expertise</h2>
                                <p className="text-sm text-base-content/40">Select your areas of specialization.</p>
                            </div>
                            <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/25 font-bold mb-3">Specializations</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[2px] bg-neutral/10 mb-6">
                                {["Frontend", "Backend", "Full Stack", "DevOps", "AI / ML", "Mobile", "Design", "Product", "Data Science", "Security", "Engineering Mgmt", "Executive"].map((s) => (
                                    <button key={s} onClick={() => toggleItem(specialties, setSpecialties, s)} className={`bg-base-100 p-3 text-center text-[10px] uppercase tracking-[0.1em] font-bold transition-colors ${specialties.includes(s) ? "bg-neutral text-neutral-content" : "text-base-content/30 hover:bg-base-200"}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/25 font-bold mb-3">Regions</p>
                            <div className="flex flex-wrap gap-1">
                                {["US West", "US East", "Canada", "UK", "Europe", "APAC", "Remote Only"].map((r) => (
                                    <button key={r} onClick={() => toggleItem(regions, setRegions, r)} className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] font-bold border transition-colors ${regions.includes(r) ? "border-neutral bg-neutral text-neutral-content" : "border-neutral/10 text-base-content/25 hover:border-neutral/30"}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <div className="text-center mb-8">
                                <div className="text-5xl font-black tracking-tighter text-neutral/6 select-none leading-none mb-2">04</div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Preferences</h2>
                                <p className="text-sm text-base-content/40">Customize how you use Splits Network.</p>
                            </div>
                            <div className="space-y-0">
                                {[
                                    { label: "Email notifications for new matches", desc: "Get alerted when relevant jobs are posted", default: true },
                                    { label: "Public profile visibility", desc: "Allow other users to find and view your profile", default: true },
                                    { label: "Weekly marketplace digest", desc: "Receive a summary of marketplace activity", default: false },
                                    { label: "Allow split-fee proposals", desc: "Other recruiters can send you partnership proposals", default: true },
                                ].map((pref) => {
                                    const [enabled, setEnabled] = useState(pref.default);
                                    return (
                                        <div key={pref.label} className="flex items-center justify-between py-4 border-b border-base-300 last:border-0">
                                            <div className="flex-1 mr-4">
                                                <div className="text-xs font-bold tracking-tight">{pref.label}</div>
                                                <div className="text-[10px] text-base-content/30 mt-0.5">{pref.desc}</div>
                                            </div>
                                            <button onClick={() => setEnabled(!enabled)} className={`w-10 h-5 relative transition-colors flex-shrink-0 ${enabled ? "bg-neutral" : "bg-base-300"}`}>
                                                <div className={`absolute top-0.5 w-4 h-4 transition-all ${enabled ? "left-5.5 bg-neutral-content" : "left-0.5 bg-base-content/30"}`} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-neutral text-neutral-content flex items-center justify-center mx-auto mb-6">
                                <i className="fa-duotone fa-regular fa-check text-3xl" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight mb-3">You&apos;re All Set</h2>
                            <p className="text-sm text-base-content/40 leading-relaxed mb-8 max-w-sm mx-auto">
                                Your account is ready. Start exploring the marketplace, connect with {role === "company" ? "recruiters" : "companies"}, and make your first placement.
                            </p>
                            <div className="grid grid-cols-3 gap-[2px] bg-neutral/10 max-w-sm mx-auto mb-8">
                                {[
                                    { value: "12K+", label: "Recruiters" },
                                    { value: "8.4K", label: "Companies" },
                                    { value: "24K", label: "Open Roles" },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-base-100 py-4 px-3 text-center">
                                        <div className="text-lg font-black tracking-tighter">{stat.value}</div>
                                        <div className="text-[7px] uppercase tracking-[0.2em] text-base-content/25 mt-0.5">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-[2px] justify-center">
                                <button className="px-6 py-3 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors">
                                    Go to Dashboard
                                </button>
                                <button className="px-6 py-3 bg-base-200 text-[10px] uppercase tracking-[0.3em] font-black text-base-content/40 hover:text-base-content transition-colors">
                                    Browse Marketplace
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    {step > 1 && step < 5 && (
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-neutral/10">
                            <button onClick={() => animateStep((step - 1) as Step)} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-base-content/25 hover:text-base-content transition-colors">
                                <i className="fa-duotone fa-regular fa-arrow-left text-xs" /> Back
                            </button>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/15 font-bold">Step {step} of 4</span>
                            <button onClick={() => animateStep((step === 4 ? 5 : step + 1) as Step)} className="flex items-center gap-2 px-5 py-2.5 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.25em] font-black hover:bg-primary hover:text-primary-content transition-colors">
                                {step === 4 ? "Complete" : "Continue"} <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
