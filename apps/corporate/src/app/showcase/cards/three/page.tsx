"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Animation constants ──────────────────────────────────────────────────────
const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };

// ── Types & Data ─────────────────────────────────────────────────────────────

type CardCategory = "all" | "jobs" | "recruiters" | "companies" | "candidates";

const categories: { id: CardCategory; label: string; count: number }[] = [
    { id: "all", label: "All", count: 20 },
    { id: "jobs", label: "Jobs", count: 8 },
    { id: "recruiters", label: "Recruiters", count: 4 },
    { id: "companies", label: "Companies", count: 4 },
    { id: "candidates", label: "Candidates", count: 4 },
];

const tags = ["Engineering", "Design", "Product", "Remote", "Senior", "Startup", "Enterprise", "AI/ML"];

const jobCards = [
    { id: 1, title: "Senior Frontend Engineer", company: "Stripe", location: "San Francisco", salary: "$180K-$240K", type: "Full-time", tags: ["Engineering", "Senior"], applicants: 47, featured: true, hot: true },
    { id: 2, title: "Product Designer", company: "Figma", location: "Remote", salary: "$160K-$210K", type: "Remote", tags: ["Design", "Remote"], applicants: 32, featured: false, hot: false },
    { id: 3, title: "Engineering Manager", company: "Notion", location: "New York", salary: "$200K-$280K", type: "Full-time", tags: ["Engineering", "Senior"], applicants: 19, featured: true, hot: false },
    { id: 4, title: "ML Engineer", company: "OpenAI", location: "San Francisco", salary: "$220K-$320K", type: "Full-time", tags: ["Engineering", "AI/ML"], applicants: 63, featured: false, hot: true },
    { id: 5, title: "Staff Backend Engineer", company: "Vercel", location: "Remote", salary: "$190K-$260K", type: "Remote", tags: ["Engineering", "Remote", "Senior"], applicants: 28, featured: false, hot: false },
    { id: 6, title: "Head of Design", company: "Linear", location: "Remote", salary: "$200K-$270K", type: "Remote", tags: ["Design", "Remote", "Senior"], applicants: 15, featured: false, hot: false },
    { id: 7, title: "DevOps Lead", company: "Datadog", location: "New York", salary: "$175K-$235K", type: "Full-time", tags: ["Engineering", "Senior"], applicants: 22, featured: false, hot: false },
    { id: 8, title: "Product Manager", company: "Airbnb", location: "San Francisco", salary: "$170K-$230K", type: "Full-time", tags: ["Product"], applicants: 41, featured: false, hot: false },
];

const recruiterCards = [
    { name: "Sarah Mitchell", agency: "TechTalent Partners", initials: "SM", placements: 142, specialties: ["Engineering", "Product"], rating: 4.9 },
    { name: "David Chen", agency: "Elite Search", initials: "DC", placements: 98, specialties: ["Design", "Engineering"], rating: 4.8 },
    { name: "Maria Garcia", agency: "Swift Recruiting", initials: "MG", placements: 67, specialties: ["AI/ML", "Senior"], rating: 4.7 },
    { name: "James Park", agency: "Apex Talent", initials: "JP", placements: 215, specialties: ["Enterprise", "Senior"], rating: 4.9 },
];

const companyCards = [
    { name: "Stripe", sector: "Fintech", employees: "8,000+", openRoles: 24, logo: "S" },
    { name: "Figma", sector: "Design Tools", employees: "1,500+", openRoles: 12, logo: "F" },
    { name: "Notion", sector: "Productivity", employees: "800+", openRoles: 18, logo: "N" },
    { name: "OpenAI", sector: "Artificial Intelligence", employees: "2,000+", openRoles: 34, logo: "O" },
];

const candidateCards = [
    { name: "Alex Rivera", role: "Staff Engineer", company: "Netflix", skills: ["React", "Node.js", "GraphQL"], availability: "Immediately", match: 96 },
    { name: "Priya Patel", role: "Senior SWE", company: "Google", skills: ["Python", "ML", "TensorFlow"], availability: "2 weeks", match: 91 },
    { name: "Tom Baker", role: "Frontend Lead", company: "Airbnb", skills: ["React", "TypeScript", "Design Systems"], availability: "1 month", match: 88 },
    { name: "Lisa Chen", role: "Staff Engineer", company: "Shopify", skills: ["Ruby", "React", "PostgreSQL"], availability: "Immediately", match: 93 },
];

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function CardsThreePage() {
    const [activeCategory, setActiveCategory] = useState<CardCategory>("all");
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleTag = (tag: string) => {
        setActiveTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    };

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: E.precise } });
            tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
            tl.fromTo($1(".page-title"), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.3");
            tl.fromTo($1(".page-divider"), { scaleX: 0 }, { scaleX: 1, duration: D.normal, transformOrigin: "left center" }, "-=0.2");
            tl.fromTo($(".filter-item"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.03 }, "-=0.1");

            $(".card-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.precise, scrollTrigger: { trigger: section, start: "top 88%" } },
                );
            });
        },
        { scope: containerRef },
    );

    const showJobs = activeCategory === "all" || activeCategory === "jobs";
    const showRecruiters = activeCategory === "all" || activeCategory === "recruiters";
    const showCompanies = activeCategory === "all" || activeCategory === "companies";
    const showCandidates = activeCategory === "all" || activeCategory === "candidates";

    const filteredJobs = activeTags.length === 0
        ? jobCards
        : jobCards.filter((j) => j.tags.some((t) => activeTags.includes(t)));

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            {/* ── HEADER ─────────────────────────────────────── */}
            <header className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-10 pb-6">
                    <div className="flex items-end gap-4 mb-5">
                        <span className="page-number opacity-0 text-5xl lg:text-7xl font-black tracking-tighter text-neutral/6 select-none leading-none">
                            C3
                        </span>
                        <div className="page-title opacity-0 pb-1">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-1">
                                Marketplace
                            </p>
                            <h1 className="text-2xl lg:text-4xl font-black tracking-tight">
                                Card Gallery
                            </h1>
                        </div>
                    </div>
                    <div className="page-divider h-[2px] bg-neutral/20 mb-5" style={{ transformOrigin: "left center" }} />

                    {/* Category filters */}
                    <div className="flex flex-wrap items-center gap-[2px] mb-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`filter-item opacity-0 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${
                                    activeCategory === cat.id
                                        ? "bg-neutral text-neutral-content"
                                        : "text-base-content/30 hover:text-base-content hover:bg-base-200"
                                }`}
                            >
                                {cat.label}
                                <span className={`ml-2 text-[9px] ${
                                    activeCategory === cat.id ? "text-neutral-content/50" : "text-base-content/15"
                                }`}>
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Tag filters */}
                    <div className="flex flex-wrap items-center gap-1">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`filter-item opacity-0 px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] font-bold transition-colors border ${
                                    activeTags.includes(tag)
                                        ? "border-neutral bg-neutral text-neutral-content"
                                        : "border-neutral/10 text-base-content/25 hover:border-neutral/30 hover:text-base-content/50"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                        {activeTags.length > 0 && (
                            <button
                                onClick={() => setActiveTags([])}
                                className="filter-item opacity-0 px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] font-bold text-base-content/20 hover:text-base-content transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="px-6 lg:px-12 py-10">
                {/* ── FEATURED JOBS (large cards) ─────────────── */}
                {showJobs && (
                    <div className="card-section mb-12">
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">01</span>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">
                                Featured Roles
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2px] bg-neutral/10 mb-8">
                            {filteredJobs.filter((j) => j.featured).map((job) => (
                                <div key={job.id} className="bg-base-100 p-6 hover:bg-base-200/50 transition-colors cursor-pointer group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {job.hot && (
                                                    <span className="px-1.5 py-0.5 bg-error/10 text-error text-[7px] uppercase tracking-[0.15em] font-black">
                                                        Hot
                                                    </span>
                                                )}
                                                <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/25 font-bold">
                                                    {job.company}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                                                {job.title}
                                            </h3>
                                        </div>
                                        <div className="w-10 h-10 bg-neutral text-neutral-content flex items-center justify-center text-xs font-black flex-shrink-0">
                                            {job.company[0]}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {job.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 bg-base-200 text-[8px] uppercase tracking-[0.15em] font-bold text-base-content/40">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold tracking-tight">{job.salary}</span>
                                            <span className="text-[10px] text-base-content/30">{job.location}</span>
                                        </div>
                                        <span className="text-[9px] uppercase tracking-[0.15em] text-base-content/25 font-bold">
                                            {job.applicants} applicants
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Standard job cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10">
                            {filteredJobs.filter((j) => !j.featured).map((job) => (
                                <div key={job.id} className="bg-base-100 p-5 hover:bg-base-200/50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-2 mb-2">
                                        {job.hot && (
                                            <span className="w-1.5 h-1.5 bg-error flex-shrink-0" />
                                        )}
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/25 font-bold truncate">
                                            {job.company}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black tracking-tight mb-2 group-hover:text-primary transition-colors">
                                        {job.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-0.5 mb-3">
                                        {job.tags.slice(0, 2).map((tag) => (
                                            <span key={tag} className="px-1.5 py-0.5 bg-base-200 text-[7px] uppercase tracking-[0.15em] font-bold text-base-content/30">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold tracking-tight">{job.salary}</span>
                                        <span className="text-[9px] text-base-content/20">{job.location}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── RECRUITER CARDS ─────────────────────────── */}
                {showRecruiters && (
                    <div className="card-section mb-12">
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">02</span>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">
                                Top Recruiters
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10">
                            {recruiterCards.map((rec) => (
                                <div key={rec.name} className="bg-base-100 p-5 hover:bg-base-200/50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center text-[10px] font-black">
                                            {rec.initials}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                                                {rec.name}
                                            </div>
                                            <div className="text-[9px] text-base-content/30">{rec.agency}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-0.5 mb-3">
                                        {rec.specialties.map((s) => (
                                            <span key={s} className="px-1.5 py-0.5 bg-base-200 text-[7px] uppercase tracking-[0.15em] font-bold text-base-content/30">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between border-t border-base-300 pt-3">
                                        <div>
                                            <div className="text-sm font-black tracking-tighter">{rec.placements}</div>
                                            <div className="text-[7px] uppercase tracking-[0.15em] text-base-content/20">Placements</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black tracking-tighter">{rec.rating}</div>
                                            <div className="text-[7px] uppercase tracking-[0.15em] text-base-content/20">Rating</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── COMPANY CARDS ───────────────────────────── */}
                {showCompanies && (
                    <div className="card-section mb-12">
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">03</span>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">
                                Companies Hiring
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10">
                            {companyCards.map((company) => (
                                <div key={company.name} className="bg-base-100 hover:bg-base-200/50 transition-colors cursor-pointer group">
                                    <div className="p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-neutral text-neutral-content flex items-center justify-center text-sm font-black">
                                                {company.logo}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">
                                                    {company.name}
                                                </div>
                                                <div className="text-[9px] text-base-content/30">{company.sector}</div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-base-content/30 mb-3">{company.employees} employees</p>
                                    </div>
                                    <div className="bg-base-200/50 px-5 py-3 flex items-center justify-between">
                                        <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-base-content/40">
                                            {company.openRoles} open roles
                                        </span>
                                        <i className="fa-duotone fa-regular fa-arrow-right text-xs text-base-content/20 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CANDIDATE CARDS ─────────────────────────── */}
                {showCandidates && (
                    <div className="card-section mb-12">
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">04</span>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">
                                Available Candidates
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2px] bg-neutral/10">
                            {candidateCards.map((candidate) => (
                                <div key={candidate.name} className="bg-base-100 p-5 hover:bg-base-200/50 transition-colors cursor-pointer group flex items-center gap-5">
                                    <div className="w-12 h-12 bg-base-200 flex items-center justify-center text-xs font-black text-base-content/30 flex-shrink-0">
                                        {candidate.name.split(" ").map((n) => n[0]).join("")}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-black tracking-tight mb-0.5 group-hover:text-primary transition-colors">
                                            {candidate.name}
                                        </div>
                                        <div className="text-[10px] text-base-content/30 mb-2">
                                            {candidate.role} at {candidate.company}
                                        </div>
                                        <div className="flex flex-wrap gap-0.5">
                                            {candidate.skills.map((skill) => (
                                                <span key={skill} className="px-1.5 py-0.5 bg-base-200 text-[7px] uppercase tracking-[0.15em] font-bold text-base-content/30">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-xl font-black tracking-tighter">{candidate.match}%</div>
                                        <div className="text-[7px] uppercase tracking-[0.15em] text-base-content/20">Match</div>
                                        <div className="text-[9px] text-base-content/30 mt-1">{candidate.availability}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
