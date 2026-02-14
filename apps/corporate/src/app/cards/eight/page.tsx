"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.5, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.04, normal: 0.08, loose: 0.12 };
const BG = { deep: "#0a1628", mid: "#0d1d33", card: "#0f2847", dark: "#081220", input: "#0b1a2e" };

const CATEGORIES = ["All", "Engineering", "Product", "Design", "Marketing", "Sales"];

const FEATURED_JOBS = [
    { title: "VP of Engineering", company: "QuantumLeap AI", location: "Remote", salary: "$320K-$400K", splitFee: 30, type: "Executive", skills: ["Leadership", "AI/ML", "Strategy"], applicants: 8, hot: true, posted: "1 day ago" },
    { title: "Staff Frontend Engineer", company: "CloudScale", location: "NYC", salary: "$220K-$280K", splitFee: 25, type: "Full-Time", skills: ["React", "TypeScript", "Next.js"], applicants: 31, hot: false, posted: "3 days ago" },
];

const JOB_CARDS = [
    { title: "Senior Backend Engineer", company: "TechForge", companyInit: "TF", location: "San Francisco", salary: "$180K-$240K", splitFee: 25, type: "Full-Time", experience: "Senior", skills: ["Go", "K8s", "PostgreSQL"], applicants: 24, views: 312, posted: "2 days ago", urgency: "urgent", status: "active" },
    { title: "Product Designer", company: "DesignHub", companyInit: "DH", location: "Remote", salary: "$140K-$180K", splitFee: 20, type: "Full-Time", experience: "Mid", skills: ["Figma", "Design Systems", "UX"], applicants: 45, views: 520, posted: "5 days ago", urgency: "standard", status: "active" },
    { title: "ML Engineer", company: "NexGen AI", companyInit: "NG", location: "Seattle", salary: "$200K-$260K", splitFee: 25, type: "Full-Time", experience: "Senior", skills: ["Python", "PyTorch", "MLOps"], applicants: 18, views: 245, posted: "1 week ago", urgency: "standard", status: "active" },
    { title: "DevOps Lead", company: "InfraCore", companyInit: "IC", location: "Austin, TX", salary: "$170K-$220K", splitFee: 22, type: "Full-Time", experience: "Lead", skills: ["Terraform", "AWS", "Docker"], applicants: 12, views: 180, posted: "3 days ago", urgency: "urgent", status: "active" },
    { title: "Product Manager", company: "BuildRight", companyInit: "BR", location: "NYC", salary: "$160K-$200K", splitFee: 20, type: "Full-Time", experience: "Senior", skills: ["Strategy", "Analytics", "Agile"], applicants: 38, views: 410, posted: "4 days ago", urgency: "standard", status: "active" },
    { title: "iOS Engineer", company: "MobileFirst", companyInit: "MF", location: "Remote", salary: "$150K-$190K", splitFee: 20, type: "Contract", experience: "Mid", skills: ["Swift", "SwiftUI", "Core Data"], applicants: 22, views: 290, posted: "6 days ago", urgency: "standard", status: "active" },
];

const RECRUITER_CARDS = [
    { name: "Sarah Chen", specialty: "Backend Engineering", placements: 47, rating: 4.9, location: "SF Bay Area", initials: "SC", online: true },
    { name: "Marcus Webb", specialty: "Executive Search", placements: 23, rating: 4.8, location: "New York", initials: "MW", online: true },
    { name: "Elena Vasquez", specialty: "Full-Stack & DevOps", placements: 35, rating: 4.7, location: "Austin, TX", initials: "EV", online: false },
    { name: "Tom Bradley", specialty: "Healthcare IT", placements: 19, rating: 4.6, location: "Chicago", initials: "TB", online: false },
];

const COMPANY_CARDS = [
    { name: "TechForge Systems", industry: "Enterprise SaaS", openRoles: 12, avgSalary: "$185K", initials: "TF", stage: "Series B" },
    { name: "QuantumLeap AI", industry: "Artificial Intelligence", openRoles: 8, avgSalary: "$210K", initials: "QL", stage: "Series C" },
    { name: "CloudScale", industry: "Cloud Infrastructure", openRoles: 15, avgSalary: "$175K", initials: "CS", stage: "Series A" },
];

export default function CardsEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState("All");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useGSAP(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => containerRef.current!.querySelectorAll(s);
        const $1 = (s: string) => containerRef.current!.querySelector(s);

        gsap.fromTo($1(".bp-cards-header"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth });
        gsap.fromTo($(".bp-cards-featured"), { opacity: 0, y: 20, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: D.build, ease: E.bounce, stagger: S.loose, delay: 0.2 });

        gsap.fromTo($(".bp-job-card"), { opacity: 0, y: 25 }, {
            opacity: 1, y: 0, duration: D.build, ease: E.smooth, stagger: S.normal,
            scrollTrigger: { trigger: $1(".bp-jobs-grid"), start: "top 85%" },
        });
        gsap.fromTo($(".bp-recruiter-card"), { opacity: 0, y: 25 }, {
            opacity: 1, y: 0, duration: D.build, ease: E.bounce, stagger: S.normal,
            scrollTrigger: { trigger: $1(".bp-recruiters-section"), start: "top 85%" },
        });
        gsap.fromTo($(".bp-company-card"), { opacity: 0, y: 25 }, {
            opacity: 1, y: 0, duration: D.build, ease: E.bounce, stagger: S.normal,
            scrollTrigger: { trigger: $1(".bp-companies-section"), start: "top 85%" },
        });
        gsap.fromTo($(".bp-corner"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: D.fast, ease: E.elastic, stagger: S.normal, delay: 0.5 });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: BG.deep }}>
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="bp-corner fixed top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />

            {/* Header */}
            <div className="bp-cards-header border-b opacity-0" style={{ backgroundColor: BG.mid, borderColor: "rgba(34,211,238,0.12)" }}>
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/30" style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                <i className="fa-duotone fa-regular fa-grid-2 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="font-bold text-white text-xl">Card Components</h1>
                                <p className="text-[10px] font-mono text-cyan-500/50">GRID LAYOUTS // BLUEPRINT CONSTRUCTION</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Category filters */}
                            <div className="flex gap-1 overflow-x-auto">
                                {CATEGORIES.map((cat) => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat ? "text-cyan-400 border border-cyan-500/30" : "text-slate-500 border border-transparent hover:text-slate-300"}`} style={{ backgroundColor: activeCategory === cat ? "rgba(34,211,238,0.08)" : "transparent" }}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            {/* View toggle */}
                            <div className="flex border border-cyan-500/15 rounded-lg overflow-hidden">
                                <button onClick={() => setViewMode("grid")} className={`w-8 h-8 flex items-center justify-center text-xs transition-colors ${viewMode === "grid" ? "text-cyan-400" : "text-slate-600"}`} style={{ backgroundColor: viewMode === "grid" ? "rgba(34,211,238,0.1)" : "transparent" }}>
                                    <i className="fa-duotone fa-regular fa-grid-2" />
                                </button>
                                <button onClick={() => setViewMode("list")} className={`w-8 h-8 flex items-center justify-center text-xs transition-colors ${viewMode === "list" ? "text-cyan-400" : "text-slate-600"}`} style={{ backgroundColor: viewMode === "list" ? "rgba(34,211,238,0.1)" : "transparent" }}>
                                    <i className="fa-duotone fa-regular fa-list" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* ── Featured Cards (Large) ── */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <i className="fa-duotone fa-regular fa-star text-xs text-cyan-500/40" />
                        <span className="text-xs font-mono text-cyan-500/40 uppercase tracking-wider">Featured Roles</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {FEATURED_JOBS.map((job, i) => (
                            <div key={i} className="bp-cards-featured group rounded-xl border border-cyan-500/20 p-6 relative overflow-hidden hover:border-cyan-400/35 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer opacity-0" style={{ backgroundColor: BG.card }}>
                                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.5) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        {job.hot && <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/25">HOT</span>}
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-cyan-500/20 text-cyan-500/60" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>{job.type}</span>
                                        <span className="ml-auto text-[10px] font-mono text-slate-600">{job.posted}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                                        <span>{job.company}</span>
                                        <span className="text-cyan-500/20">|</span>
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {job.skills.map((s) => <span key={s} className="px-2.5 py-1 rounded text-[11px] border border-cyan-500/15 text-cyan-400/70" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>{s}</span>)}
                                    </div>
                                    <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(34,211,238,0.08)" }}>
                                        <span className="font-mono text-sm font-bold text-cyan-400">{job.salary}</span>
                                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600">
                                            <span><i className="fa-duotone fa-regular fa-handshake mr-1" />{job.splitFee}%</span>
                                            <span><i className="fa-duotone fa-regular fa-users mr-1" />{job.applicants}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Job Cards Grid ── */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-briefcase text-xs text-cyan-500/40" />
                            <span className="text-xs font-mono text-cyan-500/40 uppercase tracking-wider">Open Roles</span>
                            <span className="text-[10px] font-mono text-slate-600 ml-1">{JOB_CARDS.length} positions</span>
                        </div>
                    </div>
                    <div className={`bp-jobs-grid ${viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}`}>
                        {JOB_CARDS.map((job, i) => (
                            viewMode === "grid" ? (
                                <div key={i} className="bp-job-card group rounded-xl border border-cyan-500/12 p-5 hover:border-cyan-400/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer opacity-0" style={{ backgroundColor: BG.card }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-lg border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "rgba(34,211,238,0.06)", color: "#22d3ee" }}>{job.companyInit}</div>
                                            <div>
                                                <span className="text-xs text-slate-500">{job.company}</span>
                                            </div>
                                        </div>
                                        {job.urgency === "urgent" && <span className="w-2 h-2 rounded-full bg-orange-400" title="Urgent" />}
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1">{job.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                        <span className="flex items-center gap-1"><i className="fa-duotone fa-regular fa-location-dot text-[9px] text-cyan-500/30" />{job.location}</span>
                                        <span className="text-cyan-500/15">|</span>
                                        <span>{job.type}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {job.skills.slice(0, 3).map((s) => <span key={s} className="px-2 py-0.5 rounded text-[10px] border border-cyan-500/10 text-cyan-500/50" style={{ backgroundColor: "rgba(34,211,238,0.03)" }}>{s}</span>)}
                                    </div>
                                    <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(34,211,238,0.06)" }}>
                                        <span className="text-sm font-mono font-bold text-cyan-400">{job.salary}</span>
                                        <span className="text-[10px] font-mono text-slate-600">{job.splitFee}% split</span>
                                    </div>
                                </div>
                            ) : (
                                <div key={i} className="bp-job-card group flex items-center gap-4 rounded-xl border border-cyan-500/12 px-5 py-4 hover:border-cyan-400/25 transition-all cursor-pointer opacity-0" style={{ backgroundColor: BG.card }}>
                                    <div className="w-10 h-10 rounded-lg border border-cyan-500/20 flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "rgba(34,211,238,0.06)", color: "#22d3ee" }}>{job.companyInit}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white text-sm truncate">{job.title}</h4>
                                            {job.urgency === "urgent" && <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />}
                                        </div>
                                        <div className="text-xs text-slate-500">{job.company} -- {job.location}</div>
                                    </div>
                                    <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                                        {job.skills.slice(0, 2).map((s) => <span key={s} className="px-2 py-0.5 rounded text-[10px] border border-cyan-500/10 text-cyan-500/50">{s}</span>)}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-mono font-bold text-cyan-400">{job.salary}</div>
                                        <div className="text-[10px] font-mono text-slate-600">{job.splitFee}% split</div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* ── Recruiter Cards ── */}
                <div className="bp-recruiters-section mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <i className="fa-duotone fa-regular fa-hard-hat text-xs text-cyan-500/40" />
                        <span className="text-xs font-mono text-cyan-500/40 uppercase tracking-wider">Top Recruiters</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {RECRUITER_CARDS.map((rec, i) => (
                            <div key={i} className="bp-recruiter-card group rounded-xl border border-cyan-500/12 p-5 text-center hover:border-cyan-400/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer opacity-0" style={{ backgroundColor: BG.card }}>
                                <div className="relative inline-block mb-3">
                                    <div className="w-14 h-14 rounded-xl border border-cyan-500/25 flex items-center justify-center text-lg font-bold mx-auto" style={{ backgroundColor: "rgba(34,211,238,0.08)", color: "#22d3ee" }}>{rec.initials}</div>
                                    {rec.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 bg-green-500" style={{ borderColor: BG.card }} />}
                                </div>
                                <h4 className="font-bold text-white text-sm mb-0.5">{rec.name}</h4>
                                <p className="text-[10px] font-mono text-cyan-500/50 mb-2">{rec.specialty}</p>
                                <p className="text-xs text-slate-500 mb-3">{rec.location}</p>
                                <div className="flex items-center justify-center gap-4 pt-3" style={{ borderTop: "1px solid rgba(34,211,238,0.06)" }}>
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-white">{rec.placements}</div>
                                        <div className="text-[9px] font-mono text-slate-600">PLACED</div>
                                    </div>
                                    <div className="w-px h-6" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-cyan-400 flex items-center gap-1">
                                            <i className="fa-solid fa-star text-[8px]" />{rec.rating}
                                        </div>
                                        <div className="text-[9px] font-mono text-slate-600">RATING</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Company Cards ── */}
                <div className="bp-companies-section">
                    <div className="flex items-center gap-2 mb-4">
                        <i className="fa-duotone fa-regular fa-building text-xs text-cyan-500/40" />
                        <span className="text-xs font-mono text-cyan-500/40 uppercase tracking-wider">Hiring Companies</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {COMPANY_CARDS.map((co, i) => (
                            <div key={i} className="bp-company-card group rounded-xl border border-cyan-500/12 p-5 hover:border-cyan-400/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer opacity-0" style={{ backgroundColor: BG.card }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-11 h-11 rounded-xl border border-cyan-500/20 flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "rgba(34,211,238,0.08)", color: "#22d3ee" }}>{co.initials}</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{co.name}</h4>
                                        <span className="text-[10px] font-mono text-cyan-500/40">{co.stage}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mb-4">{co.industry}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg p-2 text-center" style={{ backgroundColor: BG.input }}>
                                        <div className="text-sm font-bold text-white">{co.openRoles}</div>
                                        <div className="text-[9px] font-mono text-slate-600">OPEN ROLES</div>
                                    </div>
                                    <div className="rounded-lg p-2 text-center" style={{ backgroundColor: BG.input }}>
                                        <div className="text-sm font-bold text-cyan-400">{co.avgSalary}</div>
                                        <div className="text-[9px] font-mono text-slate-600">AVG SALARY</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
