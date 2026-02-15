"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ───────────────────────────────────────────────────────────────────── */

type CardCategory = "all" | "jobs" | "recruiters" | "candidates" | "companies";

const categories: { value: CardCategory; label: string; icon: string }[] = [
    { value: "all", label: "All", icon: "fa-duotone fa-regular fa-grid-2" },
    { value: "jobs", label: "Jobs", icon: "fa-duotone fa-regular fa-briefcase" },
    { value: "recruiters", label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie" },
    { value: "candidates", label: "Candidates", icon: "fa-duotone fa-regular fa-user" },
    { value: "companies", label: "Companies", icon: "fa-duotone fa-regular fa-building" },
];

const featuredJob = {
    title: "VP of Engineering", company: "Meridian Corp", initials: "MC", location: "San Francisco, CA",
    type: "Full-time", salary: "$300k\u2013$400k", splitFee: "25%", splitModel: "50/50", urgency: "Critical",
    skills: ["Leadership", "System Design", "TypeScript", "AWS"], applicants: 12, daysLeft: 8,
    description: "Lead a 50-person engineering organization through a critical growth phase. Define technical strategy and build world-class engineering culture.",
};

const jobs = [
    { id: 1, title: "Staff Frontend Engineer", company: "Quantum Financial", initials: "QF", location: "Remote", type: "Full-time", salary: "$200k\u2013$260k", splitFee: "20%", skills: ["React", "TypeScript"], applicants: 28, featured: false, urgency: "Standard" },
    { id: 2, title: "Senior Backend Engineer", company: "Cirrus Technologies", initials: "CT", location: "New York, NY", type: "Full-time", salary: "$180k\u2013$240k", splitFee: "20%", skills: ["Go", "Kubernetes"], applicants: 15, featured: false, urgency: "Urgent" },
    { id: 3, title: "Data Engineering Lead", company: "Apex Robotics", initials: "AR", location: "Austin, TX", type: "Hybrid", salary: "$190k\u2013$250k", splitFee: "22%", skills: ["Python", "Spark"], applicants: 9, featured: false, urgency: "Standard" },
    { id: 4, title: "DevOps Architect", company: "Helix Dynamics", initials: "HD", location: "Seattle, WA", type: "Remote", salary: "$210k\u2013$270k", splitFee: "20%", skills: ["Terraform", "AWS"], applicants: 21, featured: false, urgency: "Standard" },
];

const recruiters = [
    { id: 1, name: "Diana Foster", initials: "DF", title: "Technical Recruiter", company: "Foster Talent Group", specialization: "Engineering", placements: 47, rating: 4.9, online: true },
    { id: 2, name: "Tom Bradley", initials: "TB", title: "Executive Recruiter", company: "Bradley & Associates", specialization: "Leadership", placements: 82, rating: 4.8, online: false },
    { id: 3, name: "Lisa Okafor", initials: "LO", title: "Senior Recruiter", company: "Okafor Search", specialization: "Data & AI", placements: 35, rating: 4.7, online: true },
];

const candidates = [
    { id: 1, name: "James Park", initials: "JP", title: "Staff Software Engineer", company: "Currently at Stripe", skills: ["TypeScript", "Go", "Kubernetes"], experience: "12 years", openTo: "Staff+ roles", status: "Active" },
    { id: 2, name: "Sarah Chen", initials: "SC", title: "Principal Engineer", company: "Currently at Netflix", skills: ["Python", "ML", "System Design"], experience: "15 years", openTo: "CTO/VP Eng", status: "Passive" },
];

const companies = [
    { id: 1, name: "Meridian Corp", initials: "MC", industry: "Enterprise SaaS", size: "500\u20131000", openRoles: 8, avgFee: "22%", location: "San Francisco, CA" },
    { id: 2, name: "Quantum Financial", initials: "QF", industry: "Fintech", size: "200\u2013500", openRoles: 5, avgFee: "20%", location: "New York, NY" },
];

export default function CardsTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState<CardCategory>("all");

    useGSAP(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.from("[data-page-hdr]", { y: -30, opacity: 0, duration: 0.7, ease: "power3.out" });
        gsap.from("[data-cat-btn]", { y: -10, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.2 });
        gsap.from("[data-featured]", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.3 });
        gsap.from("[data-card]", { y: 30, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", scrollTrigger: { trigger: "[data-grid]", start: "top 85%" } });
    }, { scope: containerRef });

    const showJobs = activeCategory === "all" || activeCategory === "jobs";
    const showRecruiters = activeCategory === "all" || activeCategory === "recruiters";
    const showCandidates = activeCategory === "all" || activeCategory === "candidates";
    const showCompanies = activeCategory === "all" || activeCategory === "companies";

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            <div data-page-hdr className="border-b border-base-300">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-base-content/30 font-semibold mb-2">Marketplace</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">Browse the Network</h1>
                </div>
            </div>

            <div className="border-b border-base-200">
                <div className="max-w-7xl mx-auto px-6 md:px-10 flex gap-1 overflow-x-auto py-2">
                    {categories.map((cat) => (
                        <button key={cat.value} data-cat-btn onClick={() => setActiveCategory(cat.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.value ? "bg-base-content text-base-100" : "text-base-content/40 hover:text-base-content/60 hover:bg-base-200/50"}`}>
                            <i className={`${cat.icon} text-xs`} />{cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-12 space-y-12">
                {/* Featured */}
                {showJobs && (
                    <div data-featured className="border border-base-200 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-4 right-4"><span className="px-2.5 py-1 bg-warning/10 text-warning text-[9px] font-bold uppercase tracking-[0.1em] rounded-full"><i className="fa-duotone fa-regular fa-fire text-[8px] mr-0.5" /> {featuredJob.urgency}</span></div>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-semibold mb-3">Featured Role</p>
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">{featuredJob.initials}</div>
                            <div className="flex-1">
                                <h2 className="text-xl md:text-2xl font-bold text-base-content mb-1">{featuredJob.title}</h2>
                                <p className="text-sm text-base-content/50 mb-3">{featuredJob.company} &middot; {featuredJob.location} &middot; {featuredJob.type}</p>
                                <p className="text-sm text-base-content/50 leading-relaxed mb-4 max-w-2xl">{featuredJob.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">{featuredJob.skills.map((s) => <span key={s} className="px-2.5 py-1 rounded-full border border-base-300 text-[11px] font-medium text-base-content/50">{s}</span>)}</div>
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <span className="font-bold text-base-content">{featuredJob.salary}</span>
                                    <span className="text-secondary font-semibold">{featuredJob.splitFee} fee</span>
                                    <span className="text-base-content/40">{featuredJob.applicants} applicants</span>
                                    <span className="text-base-content/40">{featuredJob.daysLeft} days left</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Jobs Grid */}
                {showJobs && (
                    <div>
                        <div className="flex items-center justify-between mb-5"><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold">Open Roles</h3><span className="text-xs text-base-content/30">{jobs.length} roles</span></div>
                        <div data-grid className="grid md:grid-cols-2 gap-4">
                            {jobs.map((j) => (
                                <a key={j.id} href="#" data-card className="p-5 border border-base-200 rounded-xl hover:border-base-300 transition-all group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{j.initials}</div>
                                            <div><p className="text-sm font-bold text-base-content group-hover:text-secondary transition-colors">{j.title}</p><p className="text-xs text-base-content/40">{j.company}</p></div>
                                        </div>
                                        {j.urgency === "Urgent" && <span className="px-2 py-0.5 bg-error/10 text-error text-[9px] font-bold uppercase rounded-full"><i className="fa-duotone fa-regular fa-bolt text-[8px] mr-0.5" />Urgent</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-3">{j.skills.map((s) => <span key={s} className="px-2 py-0.5 rounded-full bg-base-200/60 text-[10px] font-medium text-base-content/40">{s}</span>)}</div>
                                    <div className="flex items-center justify-between text-xs text-base-content/40">
                                        <span>{j.location} &middot; {j.type}</span>
                                        <div className="flex items-center gap-3"><span className="font-semibold text-base-content/60">{j.salary}</span><span className="text-secondary font-semibold">{j.splitFee}</span></div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recruiters */}
                {showRecruiters && (
                    <div>
                        <div className="flex items-center justify-between mb-5"><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold">Top Recruiters</h3><span className="text-xs text-base-content/30">{recruiters.length} recruiters</span></div>
                        <div data-grid className="grid md:grid-cols-3 gap-4">
                            {recruiters.map((r) => (
                                <a key={r.id} href="#" data-card className="p-5 border border-base-200 rounded-xl hover:border-base-300 transition-all text-center group">
                                    <div className="relative inline-block mb-3">
                                        <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-base font-bold text-secondary mx-auto">{r.initials}</div>
                                        {r.online && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100" />}
                                    </div>
                                    <p className="text-sm font-bold text-base-content group-hover:text-secondary transition-colors">{r.name}</p>
                                    <p className="text-xs text-base-content/40 mb-3">{r.title}</p>
                                    <div className="flex justify-center gap-4 text-xs text-base-content/40 mb-3">
                                        <span><span className="font-bold text-base-content/60">{r.placements}</span> placements</span>
                                        <span><i className="fa-solid fa-star text-warning text-[9px] mr-0.5" />{r.rating}</span>
                                    </div>
                                    <span className="inline-block px-2.5 py-1 rounded-full bg-base-200/60 text-[10px] font-semibold text-base-content/40">{r.specialization}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Candidates */}
                {showCandidates && (
                    <div>
                        <div className="flex items-center justify-between mb-5"><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold">Candidates</h3></div>
                        <div data-grid className="grid md:grid-cols-2 gap-4">
                            {candidates.map((c) => (
                                <a key={c.id} href="#" data-card className="p-5 border border-base-200 rounded-xl hover:border-base-300 transition-all group">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">{c.initials}</div>
                                        <div><p className="text-sm font-bold text-base-content group-hover:text-secondary transition-colors">{c.name}</p><p className="text-xs text-base-content/40">{c.title}</p><p className="text-[11px] text-base-content/30">{c.company}</p></div>
                                        <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${c.status === "Active" ? "bg-success/10 text-success" : "bg-base-200 text-base-content/30"}`}>{c.status}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-3">{c.skills.map((s) => <span key={s} className="px-2 py-0.5 rounded-full bg-base-200/60 text-[10px] font-medium text-base-content/40">{s}</span>)}</div>
                                    <div className="flex items-center gap-3 text-xs text-base-content/40"><span>{c.experience}</span><span className="w-1 h-1 bg-base-content/15 rounded-full" /><span>Open to: {c.openTo}</span></div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Companies */}
                {showCompanies && (
                    <div>
                        <div className="flex items-center justify-between mb-5"><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold">Companies</h3></div>
                        <div data-grid className="grid md:grid-cols-2 gap-4">
                            {companies.map((co) => (
                                <a key={co.id} href="#" data-card className="p-5 border border-base-200 rounded-xl hover:border-base-300 transition-all group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{co.initials}</div>
                                        <div><p className="text-sm font-bold text-base-content group-hover:text-secondary transition-colors">{co.name}</p><p className="text-xs text-base-content/40">{co.industry} &middot; {co.location}</p></div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-base-content/40">
                                        <span><span className="font-bold text-base-content/60">{co.openRoles}</span> open roles</span>
                                        <span>{co.size} employees</span>
                                        <span className="text-secondary font-semibold">{co.avgFee} avg fee</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
