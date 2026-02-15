"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

const D = { fast: 0.3, normal: 0.5, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.04, normal: 0.08, loose: 0.12 };
const BG = { deep: "#0a1628", mid: "#0d1d33", card: "#0f2847", dark: "#081220", input: "#0b1a2e" };

const PROFILE = {
    name: "Sarah Chen", initials: "SC", title: "Senior Technical Recruiter", location: "San Francisco, CA", timezone: "PST (UTC-8)", email: "sarah@recruiter.io", phone: "+1 (415) 555-0192", linkedin: "linkedin.com/in/sarahchen", online: true, joined: "March 2023", verified: true,
    bio: "Specialized in placing backend engineers and infrastructure talent at high-growth startups. 8+ years of recruiting experience with a track record of building engineering teams from Series A through IPO. Passionate about connecting exceptional talent with mission-driven companies.",
    stats: [
        { label: "Placements", value: "147", icon: "fa-duotone fa-regular fa-handshake" },
        { label: "Success Rate", value: "94%", icon: "fa-duotone fa-regular fa-bullseye" },
        { label: "Avg. Time to Fill", value: "23 days", icon: "fa-duotone fa-regular fa-clock" },
        { label: "Rating", value: "4.9", icon: "fa-duotone fa-regular fa-star" },
    ],
    specializations: ["Backend Engineering", "DevOps/SRE", "Infrastructure", "Data Engineering", "Platform Engineering", "Engineering Management"],
    techStack: ["Go", "Rust", "Python", "Kubernetes", "AWS", "Terraform", "PostgreSQL", "Redis"],
    experience: [
        { period: "2023 - Present", role: "Senior Recruiter", company: "Splits Network", desc: "Top performer in engineering placements. 147 successful placements across 40+ companies." },
        { period: "2019 - 2023", role: "Technical Recruiter", company: "TalentBridge", desc: "Built engineering teams for 12 Series A-C startups. Specialized in distributed systems talent." },
        { period: "2016 - 2019", role: "Recruiter", company: "HireWell", desc: "Started in full-stack recruiting, transitioned to technical specialization. 65+ placements." },
    ],
    activity: [
        { action: "Placed a Senior Backend Engineer at TechForge", time: "2 days ago", icon: "fa-duotone fa-regular fa-check-circle", type: "placement" },
        { action: "Submitted 3 candidates to CloudScale", time: "4 days ago", icon: "fa-duotone fa-regular fa-paper-plane", type: "submission" },
        { action: "Earned Gold Badge for 100+ placements", time: "1 week ago", icon: "fa-duotone fa-regular fa-medal", type: "achievement" },
        { action: "Left feedback on DataFlow Inc role", time: "1 week ago", icon: "fa-duotone fa-regular fa-message", type: "comment" },
        { action: "Claimed ML Engineer role at NexGen AI", time: "2 weeks ago", icon: "fa-duotone fa-regular fa-flag", type: "claim" },
    ],
    recommendations: [
        { name: "Marcus Webb", initials: "MW", title: "VP Engineering, CloudScale", text: "Sarah consistently delivers top-tier candidates. Her understanding of our technical requirements is unmatched." },
        { name: "David Kim", initials: "DK", title: "CTO, DataFlow Inc", text: "One of the best recruiters I have worked with. She placed 5 engineers on our team, all of whom are still with us." },
    ],
};

const SIMILAR = [
    { name: "Elena Vasquez", initials: "EV", specialty: "Full-Stack & DevOps", placements: 98, rating: 4.7 },
    { name: "Tom Bradley", initials: "TB", specialty: "Healthcare IT", placements: 62, rating: 4.6 },
    { name: "Priya Patel", initials: "PP", specialty: "AI/ML Engineering", placements: 41, rating: 4.8 },
];

export default function ProfilesEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"about" | "activity" | "reviews">("about");

    useGSAP(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => containerRef.current!.querySelectorAll(s);
        const $1 = (s: string) => containerRef.current!.querySelector(s);
        gsap.fromTo($1(".bp-prof-hero"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth });
        gsap.fromTo($(".bp-prof-stat"), { opacity: 0, y: 15, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: D.fast, ease: E.bounce, stagger: S.normal, delay: 0.2 });
        gsap.fromTo($1(".bp-prof-main"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: D.build, ease: E.smooth, delay: 0.3 });
        gsap.fromTo($1(".bp-prof-sidebar"), { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: D.build, ease: E.smooth, delay: 0.4 });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: BG.deep }}>
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

            {/* Hero header */}
            <div className="bp-prof-hero border-b opacity-0" style={{ backgroundColor: BG.mid, borderColor: "rgba(34,211,238,0.12)" }}>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-2xl border-2 border-cyan-500/30 flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: "rgba(34,211,238,0.1)", color: "#22d3ee" }}>{PROFILE.initials}</div>
                            {PROFILE.online && <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 bg-green-500" style={{ borderColor: BG.mid }} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-white">{PROFILE.name}</h1>
                                {PROFILE.verified && <i className="fa-duotone fa-regular fa-badge-check text-cyan-400" />}
                            </div>
                            <p className="text-sm text-cyan-400/70 font-mono mb-2">{PROFILE.title}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-location-dot text-cyan-500/30" />{PROFILE.location}</span>
                                <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-globe text-cyan-500/30" />{PROFILE.timezone}</span>
                                <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-calendar text-cyan-500/30" />Joined {PROFILE.joined}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button className="px-4 py-2 rounded-lg border border-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors"><i className="fa-duotone fa-regular fa-message mr-1.5" />Message</button>
                            <button className="px-4 py-2 rounded-lg border border-cyan-500/20 text-sm text-slate-400 hover:text-cyan-400 transition-colors"><i className="fa-duotone fa-regular fa-share-nodes mr-1.5" />Share</button>
                            <button className="px-4 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: "#22d3ee", color: BG.deep }}><i className="fa-duotone fa-regular fa-user-plus mr-1.5" />Connect</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                        {PROFILE.stats.map((s, i) => (
                            <div key={i} className="bp-prof-stat rounded-lg p-3 border border-cyan-500/10 flex items-center gap-3 opacity-0" style={{ backgroundColor: BG.dark }}>
                                <div className="w-9 h-9 rounded-lg border border-cyan-500/20 flex items-center justify-center" style={{ backgroundColor: "rgba(34,211,238,0.06)" }}><i className={`${s.icon} text-sm text-cyan-400`} /></div>
                                <div><div className="text-lg font-bold text-white font-mono">{s.value}</div><div className="text-[10px] font-mono text-slate-600 uppercase">{s.label}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Tabs */}
                <div className="flex gap-1 mb-6">
                    {([["about", "Overview", "fa-duotone fa-regular fa-user"], ["activity", "Activity", "fa-duotone fa-regular fa-timeline"], ["reviews", "Reviews", "fa-duotone fa-regular fa-star"]] as const).map(([key, label, icon]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === key ? "text-cyan-400 border border-cyan-500/30" : "text-slate-500 border border-transparent hover:text-slate-300"}`} style={{ backgroundColor: activeTab === key ? "rgba(34,211,238,0.08)" : "transparent" }}>
                            <i className={`${icon} text-xs`} />{label}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="bp-prof-main lg:col-span-2 space-y-6 opacity-0">
                        {activeTab === "about" && (
                            <>
                                <div className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                    <h3 className="font-bold text-white mb-3 flex items-center gap-2"><i className="fa-duotone fa-regular fa-user text-cyan-400 text-sm" /> About</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{PROFILE.bio}</p>
                                </div>
                                <div className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><i className="fa-duotone fa-regular fa-bullseye text-cyan-400 text-sm" /> Specializations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {PROFILE.specializations.map((s) => <span key={s} className="px-3 py-1.5 rounded-lg border border-cyan-500/20 text-xs text-cyan-400" style={{ backgroundColor: "rgba(34,211,238,0.06)" }}>{s}</span>)}
                                    </div>
                                    <h4 className="text-xs font-mono text-cyan-500/40 uppercase mt-5 mb-3">Tech Stack Expertise</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {PROFILE.techStack.map((s) => <span key={s} className="px-2.5 py-1 rounded text-[11px] border border-cyan-500/10 text-slate-400" style={{ backgroundColor: BG.input }}>{s}</span>)}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><i className="fa-duotone fa-regular fa-briefcase text-cyan-400 text-sm" /> Experience</h3>
                                    <div className="space-y-0 relative">
                                        <div className="absolute left-[15px] top-4 bottom-4 w-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                        {PROFILE.experience.map((exp, i) => (
                                            <div key={i} className="flex gap-4 relative pb-6 last:pb-0">
                                                <div className="w-8 h-8 rounded-lg border border-cyan-500/20 flex items-center justify-center flex-shrink-0 z-10" style={{ backgroundColor: BG.mid }}><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i === 0 ? "#22d3ee" : "rgba(34,211,238,0.3)" }} /></div>
                                                <div>
                                                    <div className="text-[10px] font-mono text-cyan-500/40 mb-0.5">{exp.period}</div>
                                                    <div className="font-bold text-white text-sm">{exp.role}</div>
                                                    <div className="text-xs text-cyan-400/60 mb-1">{exp.company}</div>
                                                    <p className="text-xs text-slate-500 leading-relaxed">{exp.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {activeTab === "activity" && (
                            <div className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2"><i className="fa-duotone fa-regular fa-timeline text-cyan-400 text-sm" /> Recent Activity</h3>
                                <div className="space-y-0 relative">
                                    <div className="absolute left-[15px] top-4 bottom-4 w-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                    {PROFILE.activity.map((item, i) => (
                                        <div key={i} className="flex gap-4 relative pb-5 last:pb-0">
                                            <div className="w-8 h-8 rounded-lg border border-cyan-500/20 flex items-center justify-center flex-shrink-0 z-10" style={{ backgroundColor: BG.mid }}><i className={`${item.icon} text-xs ${item.type === "placement" ? "text-green-400" : item.type === "achievement" ? "text-yellow-400" : "text-cyan-400"}`} /></div>
                                            <div className="pt-1"><p className="text-sm text-slate-300">{item.action}</p><span className="text-[10px] font-mono text-slate-600">{item.time}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === "reviews" && (
                            <div className="space-y-4">
                                {PROFILE.recommendations.map((rec, i) => (
                                    <div key={i} className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg border border-cyan-500/20 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "rgba(34,211,238,0.06)", color: "#22d3ee" }}>{rec.initials}</div>
                                            <div><div className="font-bold text-white text-sm">{rec.name}</div><div className="text-[10px] font-mono text-cyan-500/40">{rec.title}</div></div>
                                            <div className="ml-auto flex gap-0.5">{[1,2,3,4,5].map(n => <i key={n} className="fa-solid fa-star text-[10px] text-cyan-400" />)}</div>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed italic">&quot;{rec.text}&quot;</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bp-prof-sidebar space-y-4 opacity-0">
                        <div className="rounded-xl border border-cyan-500/12 p-5" style={{ backgroundColor: BG.card }}>
                            <h3 className="text-xs font-mono text-cyan-500/40 uppercase mb-3">Contact</h3>
                            {[{ icon: "fa-duotone fa-regular fa-envelope", val: PROFILE.email }, { icon: "fa-duotone fa-regular fa-phone", val: PROFILE.phone }, { icon: "fa-brands fa-linkedin-in", val: PROFILE.linkedin }].map((c, i) => (
                                <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? "1px solid rgba(34,211,238,0.06)" : undefined }}>
                                    <i className={`${c.icon} text-xs text-cyan-500/40 w-4`} /><span className="text-sm text-slate-400">{c.val}</span>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-xl border border-cyan-500/12 p-5" style={{ backgroundColor: BG.card }}>
                            <h3 className="text-xs font-mono text-cyan-500/40 uppercase mb-3">Similar Recruiters</h3>
                            <div className="space-y-3">
                                {SIMILAR.map((s, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-cyan-500/3 -mx-2 px-2 rounded-lg transition-colors" style={{ borderTop: i > 0 ? "1px solid rgba(34,211,238,0.06)" : undefined }}>
                                        <div className="w-9 h-9 rounded-lg border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "rgba(34,211,238,0.06)", color: "#22d3ee" }}>{s.initials}</div>
                                        <div className="flex-1 min-w-0"><div className="text-sm font-medium text-white truncate">{s.name}</div><div className="text-[10px] text-slate-500">{s.specialty}</div></div>
                                        <div className="text-right"><div className="text-xs font-mono text-cyan-400">{s.placements}</div><div className="text-[9px] text-slate-600">placed</div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl border border-cyan-500/15 p-5 relative overflow-hidden" style={{ backgroundColor: BG.card }}>
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.5) 1px,transparent 1px)", backgroundSize: "25px 25px" }} />
                            <div className="relative z-10 text-center">
                                <i className="fa-duotone fa-regular fa-hard-hat text-2xl text-cyan-500/30 mb-2 block" />
                                <h4 className="font-bold text-white text-sm mb-1">Work with {PROFILE.name.split(" ")[0]}?</h4>
                                <p className="text-xs text-slate-500 mb-4">Post a role and this recruiter can submit candidates.</p>
                                <button className="w-full py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: "#22d3ee", color: BG.deep }}><i className="fa-duotone fa-regular fa-plus mr-1.5" />Post a Role</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
