"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

// ─── Memphis Colors ─────────────────────────────────────────────────────────
const C = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    dark: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
};

// ─── Data ───────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Engineering", "Design", "Product", "Marketing", "Sales"];

const FEATURED_JOB = {
    title: "VP of Engineering",
    company: "RocketLab",
    location: "New York, NY",
    salary: "$250K - $320K",
    type: "Full-Time",
    remote: "Hybrid",
    description: "Lead a world-class engineering organization of 50+ engineers. Drive technical strategy, build culture, and ship products that matter.",
    tags: ["Leadership", "Series C", "Equity"],
    applicants: 128,
    daysAgo: 1,
    featured: true,
    color: C.coral,
};

const JOBS = [
    { title: "Senior Frontend Engineer", company: "TechCorp", location: "San Francisco, CA", salary: "$160K-$200K", type: "Full-Time", remote: "Remote", tags: ["React", "TypeScript"], applicants: 34, daysAgo: 2, category: "Engineering", color: C.coral },
    { title: "Product Designer", company: "DesignStudio", location: "Austin, TX", salary: "$120K-$160K", type: "Full-Time", remote: "On-site", tags: ["Figma", "UX Research"], applicants: 22, daysAgo: 3, category: "Design", color: C.teal },
    { title: "Backend Engineer", company: "DataDriven", location: "Seattle, WA", salary: "$150K-$190K", type: "Full-Time", remote: "Remote", tags: ["Node.js", "PostgreSQL"], applicants: 41, daysAgo: 1, category: "Engineering", color: C.purple },
    { title: "Product Manager", company: "StartupXYZ", location: "Denver, CO", salary: "$130K-$170K", type: "Full-Time", remote: "Hybrid", tags: ["B2B", "SaaS"], applicants: 56, daysAgo: 5, category: "Product", color: C.yellow },
    { title: "UX Researcher", company: "UserFirst", location: "Portland, OR", salary: "$110K-$140K", type: "Contract", remote: "Remote", tags: ["Interviews", "Analytics"], applicants: 18, daysAgo: 2, category: "Design", color: C.coral },
    { title: "DevOps Engineer", company: "CloudScale", location: "Chicago, IL", salary: "$140K-$180K", type: "Full-Time", remote: "Remote", tags: ["K8s", "AWS"], applicants: 27, daysAgo: 4, category: "Engineering", color: C.teal },
    { title: "Content Strategist", company: "BrandCo", location: "Remote", salary: "$90K-$120K", type: "Full-Time", remote: "Remote", tags: ["SEO", "Writing"], applicants: 63, daysAgo: 1, category: "Marketing", color: C.purple },
    { title: "Sales Director", company: "GrowthEngine", location: "Boston, MA", salary: "$140K-$200K", type: "Full-Time", remote: "On-site", tags: ["Enterprise", "SaaS"], applicants: 15, daysAgo: 3, category: "Sales", color: C.yellow },
    { title: "Mobile Engineer", company: "AppWorks", location: "Miami, FL", salary: "$130K-$170K", type: "Full-Time", remote: "Hybrid", tags: ["React Native", "iOS"], applicants: 29, daysAgo: 2, category: "Engineering", color: C.coral },
];

const RECRUITERS = [
    { name: "Marcus Thompson", title: "Senior Recruiter", specialties: ["Engineering", "Product"], placements: 47, rating: 4.9, color: C.coral },
    { name: "Priya Sharma", title: "Tech Recruiter", specialties: ["Frontend", "Design"], placements: 32, rating: 4.8, color: C.teal },
    { name: "David Chen", title: "Executive Search", specialties: ["C-Suite", "VP"], placements: 18, rating: 5.0, color: C.purple },
    { name: "Sarah Kim", title: "Contract Specialist", specialties: ["DevOps", "Backend"], placements: 55, rating: 4.7, color: C.yellow },
];

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function CardsSixPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [hoveredJob, setHoveredJob] = useState<number | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    const filteredJobs = activeCategory === "All"
        ? JOBS
        : JOBS.filter((j) => j.category === activeCategory);

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.fromTo(
            pageRef.current.querySelector(".page-heading"),
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        );

        gsap.fromTo(
            pageRef.current.querySelectorAll(".card-item"),
            { opacity: 0, y: 40, scale: 0.9, rotation: -2 },
            { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.4, ease: "back.out(1.5)", stagger: 0.06, delay: 0.3 },
        );
    }, []);

    // Re-animate on filter change
    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const cards = pageRef.current.querySelectorAll(".job-card");
        gsap.fromTo(
            cards,
            { opacity: 0, y: 20, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.3)", stagger: 0.04 },
        );
    }, [activeCategory]);

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.dark }}>
            {/* Color Bar */}
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="page-heading text-center mb-12 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] mb-6"
                        style={{ backgroundColor: C.teal, color: C.dark }}>
                        <i className="fa-duotone fa-regular fa-grid-2"></i>
                        Card Components
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-4"
                        style={{ color: C.white }}>
                        Cards &amp;{" "}
                        <span className="relative inline-block">
                            <span style={{ color: C.teal }}>Grids</span>
                            <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: C.teal }} />
                        </span>
                    </h1>
                    <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
                        Job listings, recruiter profiles, and company cards in bold Memphis style.
                    </p>
                </div>

                {/* ═══ Featured Job Card ═══ */}
                <div className="card-item max-w-5xl mx-auto mb-12">
                    <div className="border-4 p-0 relative overflow-hidden" style={{ borderColor: C.coral, backgroundColor: C.white }}>
                        {/* Featured banner */}
                        <div className="absolute top-0 right-0 px-4 py-1.5 text-xs font-black uppercase tracking-wider z-10"
                            style={{ backgroundColor: C.coral, color: C.white }}>
                            <i className="fa-duotone fa-regular fa-star mr-1"></i> Featured
                        </div>
                        <div className="grid md:grid-cols-3">
                            {/* Left accent */}
                            <div className="p-8 flex flex-col justify-center" style={{ backgroundColor: C.coral }}>
                                <h3 className="text-3xl font-black uppercase tracking-tight leading-[1.1] mb-3" style={{ color: C.white }}>
                                    {FEATURED_JOB.title}
                                </h3>
                                <p className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>
                                    {FEATURED_JOB.company} -- {FEATURED_JOB.location}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {FEATURED_JOB.tags.map((tag) => (
                                        <span key={tag} className="px-2 py-1 text-xs font-bold uppercase border-2"
                                            style={{ borderColor: C.white, color: C.white }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* Right content */}
                            <div className="md:col-span-2 p-8">
                                <p className="text-sm leading-relaxed mb-6" style={{ color: C.dark, opacity: 0.7 }}>
                                    {FEATURED_JOB.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 text-sm font-black" style={{ backgroundColor: C.yellow, color: C.dark }}>
                                            {FEATURED_JOB.salary}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold uppercase" style={{ color: C.dark, opacity: 0.4 }}>
                                        {FEATURED_JOB.type} -- {FEATURED_JOB.remote}
                                    </span>
                                    <span className="text-xs font-bold" style={{ color: C.dark, opacity: 0.4 }}>
                                        <i className="fa-duotone fa-regular fa-users mr-1"></i>
                                        {FEATURED_JOB.applicants} applicants
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                        style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                        Apply Now
                                    </button>
                                    <button className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                        style={{ borderColor: C.dark, color: C.dark }}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ Category Filters ═══ */}
                <div className="card-item max-w-5xl mx-auto mb-8">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider mr-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Filter:
                        </span>
                        {CATEGORIES.map((cat) => {
                            const colors = [C.coral, C.coral, C.teal, C.yellow, C.purple, C.teal];
                            const color = colors[CATEGORIES.indexOf(cat) % colors.length];
                            const isActive = activeCategory === cat;
                            return (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3 transition-all"
                                    style={{
                                        borderColor: isActive ? color : "rgba(255,255,255,0.15)",
                                        backgroundColor: isActive ? color : "transparent",
                                        color: isActive ? (color === C.yellow ? C.dark : C.white) : "rgba(255,255,255,0.5)",
                                    }}>
                                    {cat}
                                </button>
                            );
                        })}
                        <span className="ml-auto text-xs font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {filteredJobs.length} results
                        </span>
                    </div>
                </div>

                {/* ═══ Job Cards Grid ═══ */}
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {filteredJobs.map((job, i) => (
                        <div key={`${job.title}-${i}`}
                            className="job-card border-4 p-0 transition-transform cursor-pointer relative overflow-hidden"
                            style={{
                                borderColor: hoveredJob === i ? job.color : C.dark,
                                backgroundColor: C.white,
                                transform: hoveredJob === i ? "translateY(-4px)" : "none",
                            }}
                            onMouseEnter={() => setHoveredJob(i)}
                            onMouseLeave={() => setHoveredJob(null)}>
                            {/* Top color strip */}
                            <div className="h-1.5" style={{ backgroundColor: job.color }} />

                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                                            style={{ backgroundColor: job.color, color: job.color === C.yellow ? C.dark : C.white }}>
                                            {job.type}
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border-2"
                                            style={{ borderColor: job.color, color: job.color }}>
                                            {job.remote}
                                        </span>
                                    </div>
                                    <button className="w-7 h-7 flex items-center justify-center border-2 transition-colors"
                                        style={{ borderColor: "rgba(26,26,46,0.15)", color: "rgba(26,26,46,0.3)" }}>
                                        <i className="fa-regular fa-bookmark text-xs"></i>
                                    </button>
                                </div>

                                {/* Title & Company */}
                                <h3 className="text-base font-black uppercase tracking-wide leading-tight mb-1" style={{ color: C.dark }}>
                                    {job.title}
                                </h3>
                                <p className="text-xs font-semibold mb-3" style={{ color: C.dark, opacity: 0.5 }}>
                                    {job.company} -- {job.location}
                                </p>

                                {/* Salary */}
                                <p className="text-lg font-black mb-3" style={{ color: job.color }}>
                                    {job.salary}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {job.tags.map((tag) => (
                                        <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase border-2"
                                            style={{ borderColor: "rgba(26,26,46,0.15)", color: C.dark }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t-2" style={{ borderColor: C.cream }}>
                                    <span className="text-[10px] font-bold uppercase" style={{ color: C.dark, opacity: 0.4 }}>
                                        <i className="fa-duotone fa-regular fa-users mr-1"></i>{job.applicants} applied
                                    </span>
                                    <span className="text-[10px] font-bold uppercase" style={{ color: C.dark, opacity: 0.4 }}>
                                        {job.daysAgo}d ago
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ═══ Recruiter Cards ═══ */}
                <div className="max-w-5xl mx-auto mb-16">
                    <div className="card-item flex items-center gap-3 mb-8">
                        <span className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em]"
                            style={{ backgroundColor: C.purple, color: C.white }}>
                            <i className="fa-duotone fa-regular fa-user-tie mr-2"></i>
                            Top Recruiters
                        </span>
                        <div className="flex-1 h-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {RECRUITERS.map((recruiter, i) => (
                            <div key={i} className="card-item border-4 p-6 text-center transition-transform hover:-translate-y-1 cursor-pointer"
                                style={{ borderColor: recruiter.color, backgroundColor: C.white }}>
                                {/* Avatar */}
                                <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full flex items-center justify-center"
                                    style={{ borderColor: recruiter.color, backgroundColor: recruiter.color }}>
                                    <span className="text-lg font-black"
                                        style={{ color: recruiter.color === C.yellow ? C.dark : C.white }}>
                                        {recruiter.name.split(" ").map((n) => n[0]).join("")}
                                    </span>
                                </div>

                                <h3 className="text-sm font-black uppercase tracking-wide mb-0.5" style={{ color: C.dark }}>
                                    {recruiter.name}
                                </h3>
                                <p className="text-xs font-semibold mb-3" style={{ color: recruiter.color }}>
                                    {recruiter.title}
                                </p>

                                {/* Specialties */}
                                <div className="flex flex-wrap justify-center gap-1 mb-4">
                                    {recruiter.specialties.map((s) => (
                                        <span key={s} className="px-2 py-0.5 text-[10px] font-bold uppercase border-2"
                                            style={{ borderColor: recruiter.color, color: C.dark }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>

                                {/* Stats */}
                                <div className="flex justify-center gap-4 mb-4">
                                    <div className="text-center">
                                        <p className="text-lg font-black" style={{ color: recruiter.color }}>{recruiter.placements}</p>
                                        <p className="text-[10px] font-bold uppercase" style={{ color: C.dark, opacity: 0.4 }}>Placed</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-black" style={{ color: recruiter.color }}>{recruiter.rating}</p>
                                        <p className="text-[10px] font-bold uppercase" style={{ color: C.dark, opacity: 0.4 }}>Rating</p>
                                    </div>
                                </div>

                                <button className="w-full py-2 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: recruiter.color, backgroundColor: recruiter.color, color: recruiter.color === C.yellow ? C.dark : C.white }}>
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ Compact List Cards ═══ */}
                <div className="max-w-5xl mx-auto">
                    <div className="card-item flex items-center gap-3 mb-8">
                        <span className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em]"
                            style={{ backgroundColor: C.yellow, color: C.dark }}>
                            <i className="fa-duotone fa-regular fa-building mr-2"></i>
                            Trending Companies
                        </span>
                        <div className="flex-1 h-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { name: "TechCorp Industries", sector: "Recruiting Tech", openRoles: 12, color: C.coral, initials: "TC" },
                            { name: "StartupXYZ", sector: "SaaS Platform", openRoles: 8, color: C.teal, initials: "SX" },
                            { name: "DesignStudio", sector: "Creative Agency", openRoles: 5, color: C.purple, initials: "DS" },
                            { name: "CloudScale", sector: "Cloud Infrastructure", openRoles: 15, color: C.yellow, initials: "CS" },
                        ].map((company, i) => (
                            <div key={i} className="card-item border-4 p-4 flex items-center gap-4 transition-transform hover:-translate-y-1 cursor-pointer"
                                style={{ borderColor: company.color, backgroundColor: C.white }}>
                                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-3"
                                    style={{ borderColor: company.color, backgroundColor: company.color }}>
                                    <span className="text-sm font-black"
                                        style={{ color: company.color === C.yellow ? C.dark : C.white }}>
                                        {company.initials}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black uppercase tracking-wide truncate" style={{ color: C.dark }}>
                                        {company.name}
                                    </h4>
                                    <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>{company.sector}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-black" style={{ color: company.color }}>{company.openRoles}</p>
                                    <p className="text-[10px] font-bold uppercase" style={{ color: C.dark, opacity: 0.4 }}>Open Roles</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
