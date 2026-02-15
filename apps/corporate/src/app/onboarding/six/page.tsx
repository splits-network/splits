"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

const C = { coral: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

const STEPS = [
    { label: "Welcome", icon: "fa-duotone fa-regular fa-hand-wave", color: C.coral },
    { label: "Your Profile", icon: "fa-duotone fa-regular fa-user", color: C.teal },
    { label: "Preferences", icon: "fa-duotone fa-regular fa-sliders", color: C.yellow },
    { label: "Invite Team", icon: "fa-duotone fa-regular fa-users", color: C.purple },
    { label: "Ready!", icon: "fa-duotone fa-regular fa-rocket", color: C.coral },
];

const ROLES = [
    { value: "recruiter", label: "Recruiter", desc: "I source and place candidates", icon: "fa-duotone fa-regular fa-user-tie", color: C.coral },
    { value: "company", label: "Company", desc: "I hire through recruiters", icon: "fa-duotone fa-regular fa-building", color: C.teal },
    { value: "candidate", label: "Candidate", desc: "I'm looking for a role", icon: "fa-duotone fa-regular fa-user", color: C.purple },
];

const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Legal", "Manufacturing", "Education", "Marketing", "Sales", "Design", "Engineering"];

const TEAM_SIZES = [
    { value: "solo", label: "Just Me", icon: "fa-duotone fa-regular fa-user" },
    { value: "small", label: "2-5", icon: "fa-duotone fa-regular fa-user-group" },
    { value: "medium", label: "6-20", icon: "fa-duotone fa-regular fa-users" },
    { value: "large", label: "20+", icon: "fa-duotone fa-regular fa-building" },
];

export default function OnboardingSixPage() {
    const [step, setStep] = useState(0);
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [industries, setIndustries] = useState<string[]>([]);
    const [teamSize, setTeamSize] = useState("");
    const [emails, setEmails] = useState(["", ""]);
    const [notifPref, setNotifPref] = useState({ email: true, push: true, digest: true });
    const stepRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    const animateStep = useCallback((dir: "next" | "back") => {
        if (!stepRef.current) return;
        gsap.fromTo(stepRef.current, { opacity: 0, x: dir === "next" ? 50 : -50 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" });
    }, []);

    const goNext = () => { if (step < 4) { setStep(s => s + 1); animateStep("next"); } };
    const goBack = () => { if (step > 0) { setStep(s => s - 1); animateStep("back"); } };

    const toggleIndustry = (ind: string) => {
        setIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
    };

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(pageRef.current.querySelector(".onboard-card"), { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.5)", delay: 0.2 });

        const shapes = pageRef.current.querySelectorAll(".memphis-shape");
        gsap.fromTo(shapes, { opacity: 0, scale: 0, rotation: -180 }, { opacity: 0.15, scale: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.5)", stagger: { each: 0.06, from: "random" }, delay: 0.4 });
        shapes.forEach((shape, i) => {
            gsap.to(shape, { y: `+=${8 + (i % 3) * 4}`, rotation: `+=${(i % 2 === 0 ? 1 : -1) * 5}`, duration: 3 + i * 0.3, ease: "sine.inOut", repeat: -1, yoyo: true });
        });
    }, []);

    return (
        <div ref={pageRef} className="min-h-screen relative overflow-hidden flex items-center" style={{ backgroundColor: C.dark }}>
            {/* Memphis Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="memphis-shape absolute top-[8%] left-[5%] w-20 h-20 rounded-full border-[4px]" style={{ borderColor: C.coral }} />
                <div className="memphis-shape absolute top-[55%] right-[7%] w-16 h-16 rounded-full" style={{ backgroundColor: C.teal }} />
                <div className="memphis-shape absolute bottom-[12%] left-[10%] w-12 h-12 rotate-45" style={{ backgroundColor: C.yellow }} />
                <div className="memphis-shape absolute top-[22%] right-[15%] w-14 h-14 rotate-12" style={{ backgroundColor: C.purple }} />
                <div className="memphis-shape absolute bottom-[25%] right-[30%] w-10 h-10 rounded-full border-3" style={{ borderColor: C.coral }} />
                <div className="memphis-shape absolute top-[70%] left-[25%]" style={{ width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderBottom: `31px solid ${C.teal}` }} />
                <svg className="memphis-shape absolute bottom-[10%] right-[40%]" width="80" height="25" viewBox="0 0 80 25">
                    <polyline points="0,20 10,5 20,20 30,5 40,20 50,5 60,20 70,5 80,20" fill="none" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <svg className="memphis-shape absolute top-[15%] left-[40%]" width="30" height="30" viewBox="0 0 30 30">
                    <line x1="15" y1="3" x2="15" y2="27" stroke={C.yellow} strokeWidth="3" strokeLinecap="round" />
                    <line x1="3" y1="15" x2="27" y2="15" stroke={C.yellow} strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
                <div className="onboard-card border-4" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                    {/* Progress Header */}
                    <div className="p-6 border-b-4" style={{ borderColor: C.dark }}>
                        <div className="flex items-center gap-1">
                            {STEPS.map((s, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="flex items-center w-full gap-1">
                                        <div className="w-8 h-8 flex items-center justify-center text-xs font-black flex-shrink-0 border-3 transition-all"
                                            style={{
                                                backgroundColor: i <= step ? s.color : C.white,
                                                borderColor: s.color,
                                                color: i <= step ? (s.color === C.yellow ? C.dark : C.white) : s.color,
                                            }}>
                                            {i < step ? <i className="fa-solid fa-check text-xs"></i> : <i className={`${s.icon} text-xs`}></i>}
                                        </div>
                                        {i < STEPS.length - 1 && <div className="flex-1 h-1" style={{ backgroundColor: i < step ? s.color : "#E0E0E0" }} />}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:block"
                                        style={{ color: i <= step ? C.dark : "#999" }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div ref={stepRef} className="p-8">
                        {/* Step 0: Welcome */}
                        {step === 0 && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-4"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral }}>
                                    <i className="fa-duotone fa-regular fa-hand-wave text-3xl" style={{ color: C.white }}></i>
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tight mb-3" style={{ color: C.dark }}>
                                    Welcome to <span style={{ color: C.coral }}>Splits Network</span>
                                </h2>
                                <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: C.dark, opacity: 0.6 }}>
                                    Let&apos;s get you set up in just a few minutes. First, tell us who you are.
                                </p>
                                <div className="grid gap-4 max-w-md mx-auto">
                                    {ROLES.map((r) => (
                                        <button key={r.value} onClick={() => setRole(r.value)}
                                            className="flex items-center gap-4 p-5 border-3 text-left transition-all"
                                            style={{
                                                borderColor: role === r.value ? r.color : "rgba(26,26,46,0.15)",
                                                backgroundColor: role === r.value ? r.color : "transparent",
                                            }}>
                                            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border-2"
                                                style={{
                                                    borderColor: role === r.value ? (r.color === C.yellow ? C.dark : C.white) : r.color,
                                                    backgroundColor: role === r.value ? "rgba(255,255,255,0.2)" : "transparent",
                                                }}>
                                                <i className={`${r.icon} text-lg`} style={{ color: role === r.value ? (r.color === C.yellow ? C.dark : C.white) : r.color }}></i>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-wide" style={{ color: role === r.value ? (r.color === C.yellow ? C.dark : C.white) : C.dark }}>{r.label}</p>
                                                <p className="text-xs" style={{ color: role === r.value ? (r.color === C.yellow ? C.dark : "rgba(255,255,255,0.7)") : "rgba(26,26,46,0.5)" }}>{r.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Profile */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-[0.15em]" style={{ backgroundColor: C.teal, color: C.white }}>Step 2</span>
                                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: C.dark }}>Your Profile</span>
                                </div>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Full Name</label>
                                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Marcus Thompson"
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none" style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }} />
                                </fieldset>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Company / Agency</label>
                                    <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Talent Partners Inc."
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none" style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }} />
                                </fieldset>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Location</label>
                                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA"
                                        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none" style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }} />
                                </fieldset>
                                <fieldset>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Team Size</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {TEAM_SIZES.map((t) => (
                                            <button key={t.value} onClick={() => setTeamSize(t.value)}
                                                className="p-3 border-3 text-center transition-all"
                                                style={{
                                                    borderColor: teamSize === t.value ? C.teal : "rgba(26,26,46,0.15)",
                                                    backgroundColor: teamSize === t.value ? C.teal : "transparent",
                                                    color: teamSize === t.value ? C.dark : C.dark,
                                                }}>
                                                <i className={`${t.icon} text-sm block mb-1`}></i>
                                                <span className="text-xs font-bold">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>
                            </div>
                        )}

                        {/* Step 2: Preferences */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-[0.15em]" style={{ backgroundColor: C.yellow, color: C.dark }}>Step 3</span>
                                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: C.dark }}>Preferences</span>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-3" style={{ color: C.dark }}>Industries You Recruit For</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {INDUSTRIES.map((ind) => {
                                            const colors = [C.coral, C.teal, C.yellow, C.purple];
                                            const color = colors[INDUSTRIES.indexOf(ind) % 4];
                                            const selected = industries.includes(ind);
                                            return (
                                                <button key={ind} onClick={() => toggleIndustry(ind)}
                                                    className="flex items-center gap-2 p-3 border-3 text-left transition-all"
                                                    style={{
                                                        borderColor: selected ? color : "rgba(26,26,46,0.12)",
                                                        backgroundColor: selected ? color : "transparent",
                                                    }}>
                                                    <div className="w-4 h-4 flex-shrink-0 border-2 flex items-center justify-center"
                                                        style={{ borderColor: selected ? (color === C.yellow ? C.dark : C.white) : C.dark, backgroundColor: selected ? "rgba(255,255,255,0.2)" : "transparent" }}>
                                                        {selected && <i className="fa-solid fa-check text-[8px]" style={{ color: color === C.yellow ? C.dark : C.white }}></i>}
                                                    </div>
                                                    <span className="text-xs font-bold" style={{ color: selected ? (color === C.yellow ? C.dark : C.white) : C.dark }}>{ind}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="border-3 p-5" style={{ borderColor: C.teal }}>
                                    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-3" style={{ color: C.dark }}>
                                        <i className="fa-duotone fa-regular fa-bell mr-1" style={{ color: C.teal }}></i>Notification Preferences
                                    </label>
                                    {[
                                        { key: "email" as const, label: "Email notifications", desc: "Get updates in your inbox" },
                                        { key: "push" as const, label: "Push notifications", desc: "Real-time browser alerts" },
                                        { key: "digest" as const, label: "Weekly digest", desc: "Summary of weekly activity" },
                                    ].map((n) => (
                                        <button key={n.key} onClick={() => setNotifPref(p => ({ ...p, [n.key]: !p[n.key] }))}
                                            className="flex items-center gap-3 w-full text-left py-3 border-b-2" style={{ borderColor: C.cream }}>
                                            <div className="w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center"
                                                style={{ borderColor: notifPref[n.key] ? C.teal : "rgba(26,26,46,0.2)", backgroundColor: notifPref[n.key] ? C.teal : "transparent" }}>
                                                {notifPref[n.key] && <i className="fa-solid fa-check text-[9px]" style={{ color: C.dark }}></i>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold" style={{ color: C.dark }}>{n.label}</p>
                                                <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>{n.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Invite Team */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-[0.15em]" style={{ backgroundColor: C.purple, color: C.white }}>Step 4</span>
                                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: C.dark }}>Invite Your Team</span>
                                </div>
                                <p className="text-sm" style={{ color: C.dark, opacity: 0.6 }}>
                                    Invite colleagues to join your workspace. They&apos;ll receive an email invitation.
                                </p>
                                <div className="space-y-3">
                                    {emails.map((email, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input value={email} onChange={(e) => { const next = [...emails]; next[i] = e.target.value; setEmails(next); }}
                                                placeholder={`colleague${i + 1}@company.com`}
                                                className="flex-1 px-4 py-3 border-3 text-sm font-semibold outline-none"
                                                style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }} />
                                            {emails.length > 1 && (
                                                <button onClick={() => setEmails(emails.filter((_, j) => j !== i))}
                                                    className="w-10 h-auto flex items-center justify-center border-3"
                                                    style={{ borderColor: C.coral, color: C.coral }}>
                                                    <i className="fa-solid fa-xmark text-xs"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setEmails([...emails, ""])}
                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                                    style={{ color: C.purple }}>
                                    <i className="fa-solid fa-plus text-xs"></i>Add Another
                                </button>
                                <div className="p-4 border-3" style={{ borderColor: C.yellow }}>
                                    <p className="text-xs flex items-center gap-2" style={{ color: C.dark, opacity: 0.6 }}>
                                        <i className="fa-duotone fa-regular fa-lightbulb" style={{ color: C.yellow }}></i>
                                        You can always invite more team members later from Settings.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Complete */}
                        {step === 4 && (
                            <div className="text-center py-8">
                                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center border-4"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral }}>
                                    <i className="fa-duotone fa-regular fa-party-horn text-4xl" style={{ color: C.white }}></i>
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tight mb-3" style={{ color: C.dark }}>
                                    You&apos;re All <span style={{ color: C.teal }}>Set!</span>
                                </h2>
                                <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: C.dark, opacity: 0.6 }}>
                                    Your workspace is ready. Start exploring the marketplace, post your first job, or connect with recruiters.
                                </p>
                                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                                    {[
                                        { label: "Post a Job", icon: "fa-duotone fa-regular fa-plus", color: C.coral },
                                        { label: "Browse Jobs", icon: "fa-duotone fa-regular fa-magnifying-glass", color: C.teal },
                                        { label: "Dashboard", icon: "fa-duotone fa-regular fa-grid-2", color: C.purple },
                                    ].map((action, i) => (
                                        <button key={i} className="p-4 border-3 text-center transition-transform hover:-translate-y-1"
                                            style={{ borderColor: action.color }}>
                                            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: action.color }}>
                                                <i className={`${action.icon} text-sm`} style={{ color: action.color === C.yellow ? C.dark : C.white }}></i>
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider" style={{ color: C.dark }}>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <button className="px-8 py-4 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-rocket text-xs"></i>Go to Dashboard
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Navigation */}
                    {step < 4 && (
                        <div className="p-6 border-t-4 flex items-center justify-between" style={{ borderColor: C.dark }}>
                            {step > 0 ? (
                                <button onClick={goBack} className="px-5 py-3 text-xs font-black uppercase tracking-wider border-3 flex items-center gap-2"
                                    style={{ borderColor: C.dark, color: C.dark }}>
                                    <i className="fa-solid fa-arrow-left text-xs"></i>Back
                                </button>
                            ) : <div />}
                            <div className="flex items-center gap-3">
                                {step > 0 && step < 4 && (
                                    <button onClick={goNext} className="px-4 py-3 text-xs font-black uppercase tracking-wider"
                                        style={{ color: C.dark, opacity: 0.4 }}>Skip</button>
                                )}
                                <button onClick={goNext}
                                    className="px-6 py-3 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                    style={{
                                        borderColor: STEPS[step].color, backgroundColor: STEPS[step].color,
                                        color: STEPS[step].color === C.yellow ? C.dark : C.white,
                                    }}>
                                    {step === 0 ? "Let's Go" : "Continue"} <i className="fa-solid fa-arrow-right text-xs"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
