"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const steps = [
    { num: "01", label: "Welcome", icon: "fa-duotone fa-regular fa-hand-wave" },
    { num: "02", label: "Profile", icon: "fa-duotone fa-regular fa-user" },
    { num: "03", label: "Preferences", icon: "fa-duotone fa-regular fa-sliders" },
    { num: "04", label: "Complete", icon: "fa-duotone fa-regular fa-badge-check" },
];

const industries = ["Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Legal", "Media"];
const roles = ["Recruiter", "Hiring Manager", "Talent Acquisition Lead", "Agency Owner", "HR Director"];
const interests = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations", "Executive", "Finance"];

export default function OnboardingNinePage() {
    const ref = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [teamSize, setTeamSize] = useState("1-5");

    useGSAP(() => {
        if (!ref.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.set(ref.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 }); return; }
        const $1 = (s: string) => ref.current!.querySelector(s);
        gsap.fromTo($1(".onb-container"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    }, { scope: ref });

    const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    const next = () => { if (step < 3) setStep(step + 1); };
    const prev = () => { if (step > 0) setStep(step - 1); };

    return (
        <div ref={ref} className="min-h-screen bg-white flex items-center justify-center py-12 px-6 relative">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/8 pointer-events-none" />
            <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">v9.0</div>
            <div className="absolute bottom-8 left-8 font-mono text-[10px] text-[#233876]/15 tracking-wider">EMPLOYMENT NETWORKS</div>

            <div className="onb-container opacity-0 w-full max-w-2xl relative z-10">
                {/* Progress */}
                <div className="flex items-center justify-center gap-1 mb-8">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <div className={`w-8 h-8 border-2 flex items-center justify-center transition-colors ${i === step ? "border-[#233876] bg-[#233876]" : i < step ? "border-emerald-500 bg-emerald-500" : "border-[#233876]/10"}`}>
                                {i < step ? <i className="fa-regular fa-check text-[10px] text-white" /> : <span className={`font-mono text-[9px] font-bold ${i === step ? "text-white" : "text-[#233876]/20"}`}>{s.num}</span>}
                            </div>
                            {i < steps.length - 1 && <div className={`w-12 h-[2px] ${i < step ? "bg-emerald-500" : "bg-[#233876]/8"}`} />}
                        </div>
                    ))}
                </div>

                <div className="border-2 border-[#233876]/10 bg-white relative">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" /><div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" /><div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                    <div className="p-8">
                        {/* Step 0: Welcome */}
                        {step === 0 && (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 border-2 border-[#233876]/15 flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-duotone fa-regular fa-network-wired text-2xl text-[#233876]" />
                                </div>
                                <div className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase mb-4">Welcome to</div>
                                <h1 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-4">Employment Networks</h1>
                                <p className="text-sm text-[#0f1b3d]/45 max-w-md mx-auto leading-relaxed mb-8">Let&apos;s get your account set up in just a few steps. This will help us personalize your experience and connect you with the right opportunities.</p>
                                <div className="grid grid-cols-3 gap-px bg-[#233876]/10 max-w-sm mx-auto mb-8">
                                    {[{ val: "10,000+", lbl: "Roles" }, { val: "2,000+", lbl: "Recruiters" }, { val: "500+", lbl: "Companies" }].map((s, i) => (
                                        <div key={i} className="bg-white px-4 py-3 text-center"><div className="font-mono text-lg font-bold text-[#233876]">{s.val}</div><div className="font-mono text-[8px] text-[#0f1b3d]/25 uppercase tracking-wider">{s.lbl}</div></div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Profile */}
                        {step === 1 && (
                            <div>
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6"><div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Step 02 // Profile Setup</div><h2 className="text-2xl font-bold text-[#0f1b3d]">Tell Us About You</h2></div>
                                <div className="space-y-5">
                                    <div><label className="text-sm font-semibold text-[#0f1b3d] block mb-2">Full Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-2.5 border-2 border-[#233876]/10 text-sm bg-white outline-none text-[#0f1b3d] focus:border-[#233876]/30 transition-colors placeholder-[#0f1b3d]/25" /></div>
                                    <div><label className="text-sm font-semibold text-[#0f1b3d] block mb-2">Company / Organization</label><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Where you work" className="w-full px-4 py-2.5 border-2 border-[#233876]/10 text-sm bg-white outline-none text-[#0f1b3d] focus:border-[#233876]/30 transition-colors placeholder-[#0f1b3d]/25" /></div>
                                    <div><label className="text-sm font-semibold text-[#0f1b3d] block mb-2">Your Role</label><select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 border-2 border-[#233876]/10 text-sm bg-white outline-none text-[#0f1b3d] focus:border-[#233876]/30 transition-colors"><option value="">Select...</option>{roles.map((r) => <option key={r}>{r}</option>)}</select></div>
                                    <div><label className="text-sm font-semibold text-[#0f1b3d] block mb-2">Team Size</label>
                                        <div className="grid grid-cols-4 gap-px bg-[#233876]/10">
                                            {["1-5", "6-20", "21-50", "50+"].map((s) => (
                                                <label key={s} className={`flex items-center justify-center py-2.5 cursor-pointer text-xs font-medium transition-colors ${teamSize === s ? "bg-[#233876] text-white" : "bg-white text-[#0f1b3d]/40 hover:bg-[#233876]/[0.03]"}`}>
                                                    <input type="radio" name="teamSize" value={s} checked={teamSize === s} onChange={() => setTeamSize(s)} className="hidden" />{s}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Preferences */}
                        {step === 2 && (
                            <div>
                                <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-6"><div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Step 03 // Preferences</div><h2 className="text-2xl font-bold text-[#0f1b3d]">Your Interests</h2></div>
                                <div className="space-y-6">
                                    <div><label className="text-sm font-semibold text-[#0f1b3d] block mb-3">Industries You Focus On</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {industries.map((ind) => (
                                                <button key={ind} onClick={() => toggle(selectedIndustries, setSelectedIndustries, ind)} className={`px-3 py-2 border text-xs font-medium transition-colors ${selectedIndustries.includes(ind) ? "border-[#233876] bg-[#233876] text-white" : "border-[#233876]/10 text-[#0f1b3d]/40 hover:border-[#233876]/25"}`}>{ind}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div><label className="text-sm font-semibold text-[#0f1b3d] block mb-3">Roles You Recruit For</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {interests.map((int) => (
                                                <button key={int} onClick={() => toggle(selectedInterests, setSelectedInterests, int)} className={`px-3 py-2 border text-xs font-medium transition-colors ${selectedInterests.includes(int) ? "border-[#233876] bg-[#233876] text-white" : "border-[#233876]/10 text-[#0f1b3d]/40 hover:border-[#233876]/25"}`}>{int}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Complete */}
                        {step === 3 && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-regular fa-check text-2xl text-white" />
                                </div>
                                <div className="font-mono text-xs tracking-[0.3em] text-emerald-600/50 uppercase mb-3">Setup Complete</div>
                                <h2 className="text-3xl font-bold text-[#0f1b3d] mb-3">You&apos;re All Set{name ? `, ${name.split(" ")[0]}` : ""}!</h2>
                                <p className="text-sm text-[#0f1b3d]/40 max-w-md mx-auto mb-8">Your account is configured and ready. Explore the dashboard, browse available roles, or post your first job.</p>
                                <div className="flex flex-col sm:flex-row justify-center gap-3">
                                    <button className="px-6 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium">Go to Dashboard <i className="fa-regular fa-arrow-right text-xs ml-1" /></button>
                                    <button className="px-6 py-2.5 border-2 border-[#233876]/20 text-sm text-[#233876] hover:border-[#233876] transition-colors font-medium">Browse Roles</button>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        {step < 3 && (
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-dashed border-[#233876]/10">
                                {step > 0 ? (
                                    <button onClick={prev} className="px-5 py-2 border-2 border-[#233876]/15 text-sm text-[#233876]/60 hover:border-[#233876] transition-colors"><i className="fa-regular fa-arrow-left text-xs mr-2" />Back</button>
                                ) : <div />}
                                <div className="flex items-center gap-3">
                                    {step > 0 && step < 3 && <button onClick={() => setStep(3)} className="text-xs text-[#0f1b3d]/25 hover:text-[#0f1b3d]/50 transition-colors">Skip</button>}
                                    <button onClick={next} className="px-6 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium">
                                        {step === 0 ? "Get Started" : "Continue"} <i className="fa-regular fa-arrow-right text-xs ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-4"><span className="font-mono text-[9px] text-[#233876]/15 tracking-wider">STEP {step + 1} OF {steps.length}</span></div>
            </div>
        </div>
    );
}
