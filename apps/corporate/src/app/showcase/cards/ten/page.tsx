"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── data ─── */

const categories = [
    "All",
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Sales",
];

const featuredJobs = [
    {
        id: 1,
        title: "VP of Engineering",
        company: "Nexus Dynamics",
        location: "San Francisco, CA",
        type: "Full-Time",
        salary: "$280K - $350K",
        split: "60/40",
        urgent: true,
        featured: true,
        applicants: 8,
        posted: "1 day ago",
        skills: ["Leadership", "System Design", "Strategy"],
        category: "Engineering",
        description:
            "Lead a team of 50+ engineers building the next generation of recruiting infrastructure.",
    },
    {
        id: 2,
        title: "Head of Product Design",
        company: "Cortex AI",
        location: "Remote",
        type: "Full-Time",
        salary: "$220K - $280K",
        split: "50/50",
        urgent: false,
        featured: true,
        applicants: 14,
        posted: "2 days ago",
        skills: ["Figma", "Design Systems", "User Research"],
        category: "Design",
        description:
            "Define the visual language and design strategy for AI-powered enterprise products.",
    },
];

const standardJobs = [
    {
        id: 3,
        title: "Senior Frontend Engineer",
        company: "DataVault",
        location: "New York, NY",
        type: "Full-Time",
        salary: "$170K - $210K",
        split: "50/50",
        urgent: false,
        applicants: 22,
        posted: "3 days ago",
        skills: ["React", "TypeScript", "GraphQL"],
        category: "Engineering",
    },
    {
        id: 4,
        title: "Product Manager",
        company: "Relay Systems",
        location: "Austin, TX",
        type: "Full-Time",
        salary: "$150K - $190K",
        split: "50/50",
        urgent: true,
        applicants: 11,
        posted: "1 day ago",
        skills: ["Roadmapping", "Analytics", "Agile"],
        category: "Product",
    },
    {
        id: 5,
        title: "Backend Engineer",
        company: "Nexus Dynamics",
        location: "Hybrid",
        type: "Full-Time",
        salary: "$155K - $200K",
        split: "50/50",
        urgent: false,
        applicants: 31,
        posted: "5 days ago",
        skills: ["Node.js", "PostgreSQL", "Redis"],
        category: "Engineering",
    },
    {
        id: 6,
        title: "Marketing Director",
        company: "Growth Labs",
        location: "Remote",
        type: "Contract",
        salary: "$140K - $175K",
        split: "40/60",
        urgent: false,
        applicants: 7,
        posted: "4 days ago",
        skills: ["SEO", "Content", "Analytics"],
        category: "Marketing",
    },
    {
        id: 7,
        title: "UX Researcher",
        company: "Cortex AI",
        location: "San Francisco, CA",
        type: "Full-Time",
        salary: "$130K - $160K",
        split: "50/50",
        urgent: false,
        applicants: 19,
        posted: "2 days ago",
        skills: ["User Testing", "Interviews", "Data Analysis"],
        category: "Design",
    },
    {
        id: 8,
        title: "DevOps Engineer",
        company: "CloudBase",
        location: "Remote",
        type: "Full-Time",
        salary: "$160K - $195K",
        split: "50/50",
        urgent: false,
        applicants: 15,
        posted: "6 days ago",
        skills: ["Kubernetes", "Terraform", "AWS"],
        category: "Engineering",
    },
    {
        id: 9,
        title: "Sales Director",
        company: "Pipeline Co",
        location: "Chicago, IL",
        type: "Full-Time",
        salary: "$140K - $180K + Comm",
        split: "50/50",
        urgent: true,
        applicants: 5,
        posted: "Today",
        skills: ["Enterprise Sales", "SaaS", "Leadership"],
        category: "Sales",
    },
    {
        id: 10,
        title: "Full-Stack Engineer",
        company: "DataVault",
        location: "Hybrid",
        type: "Contract",
        salary: "$80/hr - $110/hr",
        split: "50/50",
        urgent: false,
        applicants: 27,
        posted: "3 days ago",
        skills: ["React", "Node.js", "PostgreSQL"],
        category: "Engineering",
    },
];

const recruiterCards = [
    {
        name: "Apex Recruiting",
        focus: "Senior Engineering",
        placements: 142,
        rating: 4.8,
        active: 24,
        region: "West Coast",
    },
    {
        name: "TechFlow Partners",
        focus: "Platform Teams",
        placements: 89,
        rating: 4.6,
        active: 18,
        region: "Nationwide",
    },
    {
        name: "Horizon Staffing",
        focus: "Full-Stack",
        placements: 203,
        rating: 4.9,
        active: 31,
        region: "East Coast",
    },
    {
        name: "Summit Talent",
        focus: "Executive Search",
        placements: 67,
        rating: 4.7,
        active: 12,
        region: "Nationwide",
    },
];

/* ─── component ─── */

export default function CardsShowcaseTen() {
    const mainRef = useRef<HTMLElement>(null);
    const [activeCategory, setActiveCategory] = useState("All");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const filteredJobs =
        activeCategory === "All"
            ? standardJobs
            : standardJobs.filter((j) => j.category === activeCategory);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(
                ".page-scanline",
                { scaleX: 0 },
                { scaleX: 1, duration: 0.6 },
            )
                .fromTo(
                    ".page-title span",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.2",
                )
                .fromTo(
                    ".page-subtitle",
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.1",
                );

            gsap.fromTo(
                ".featured-card",
                { opacity: 0, y: 40, scale: 0.97 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".featured-section",
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                ".job-card",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: "power2.out",
                    scrollTrigger: { trigger: ".jobs-grid", start: "top 85%" },
                },
            );

            gsap.fromTo(
                ".recruiter-card",
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    stagger: 0.12,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".recruiter-section",
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                ".status-pulse",
                { scale: 0.6, opacity: 0.4 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                },
            );
        },
        { scope: mainRef },
    );

    return (
        <main
            ref={mainRef}
            className="min-h-screen bg-base-300 text-base-content overflow-x-hidden"
        >
            <div
                className="fixed inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
            <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-coral/30 pointer-events-none z-10" />

            {/* Hero */}
            <section className="relative flex items-center justify-center px-6 pt-28 pb-12">
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="page-scanline h-[2px] bg-primary w-48 mx-auto mb-8 origin-left" />
                    <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-4 opacity-80">
                        sys.ui &gt; card_components v2.0
                    </p>
                    <h1 className="page-title text-4xl md:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                        <span className="block">Card</span>
                        <span className="block text-primary">Systems</span>
                    </h1>
                    <p className="page-subtitle max-w-xl mx-auto text-base-content/50 font-light leading-relaxed">
                        Multiple card variants for jobs, recruiters, and network
                        entities. Featured highlights, grid layouts, and list
                        views.
                    </p>
                </div>
            </section>

            {/* Featured Cards */}
            <section className="featured-section px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
                            // featured.positions
                        </p>
                        <h2 className="text-2xl font-black tracking-tight">
                            Priority Listings
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {featuredJobs.map((job) => (
                            <div
                                key={job.id}
                                className="featured-card group relative p-6 bg-base-200 border-2 border-coral/20 hover:border-coral/40 transition-colors duration-300"
                            >
                                <span className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-content font-mono text-[9px] uppercase tracking-wider">
                                    Featured
                                </span>
                                {job.urgent && (
                                    <span className="absolute top-0 left-4 px-2 py-0.5 bg-warning/10 border border-warning/20 text-warning font-mono text-[9px] uppercase tracking-wider translate-y-[-50%]">
                                        Urgent
                                    </span>
                                )}
                                <div className="flex items-start justify-between mb-4 mt-2">
                                    <div>
                                        <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                                            {job.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-base-content/40">
                                            <span className="flex items-center gap-1 text-xs">
                                                <i className="fa-duotone fa-regular fa-building text-[10px]" />
                                                {job.company}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs">
                                                <i className="fa-duotone fa-regular fa-location-dot text-[10px]" />
                                                {job.location}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-lg font-black text-primary">
                                        {job.salary}
                                    </span>
                                </div>
                                <p className="text-sm text-base-content/40 leading-relaxed mb-4">
                                    {job.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {job.skills.map((s) => (
                                        <span
                                            key={s}
                                            className="px-2 py-0.5 bg-primary/5 border border-coral/15 text-primary font-mono text-[10px] uppercase"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-base-content/5">
                                    <div className="flex items-center gap-4 text-xs text-base-content/30">
                                        <span className="font-mono">
                                            {job.applicants} applicants
                                        </span>
                                        <span className="font-mono">
                                            Split: {job.split}
                                        </span>
                                        <span className="font-mono">
                                            {job.posted}
                                        </span>
                                    </div>
                                    <button className="btn btn-primary btn-xs font-mono uppercase tracking-wider text-[9px]">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job Cards Grid */}
            <section className="px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div>
                            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
                                // all.positions
                            </p>
                            <h2 className="text-2xl font-black tracking-tight">
                                Job Orders
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Category filter */}
                            <div className="flex gap-1">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                                            activeCategory === cat
                                                ? "bg-primary/10 border border-coral/20 text-primary"
                                                : "bg-base-200 border border-base-content/10 text-base-content/30 hover:text-base-content/50"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            {/* View toggle */}
                            <div className="flex border border-base-content/10">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-base-content/30"}`}
                                >
                                    <i className="fa-duotone fa-regular fa-grid-2 text-xs" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-base-content/30"}`}
                                >
                                    <i className="fa-duotone fa-regular fa-list text-xs" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
                    <p className="font-mono text-[10px] text-base-content/25 uppercase tracking-wider mb-4">
                        {filteredJobs.length} results found
                    </p>

                    {viewMode === "grid" ? (
                        <div className="jobs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="job-card group p-5 bg-base-200 border border-base-content/5 hover:border-coral/20 transition-colors duration-200 cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2 py-0.5 bg-base-300 border border-base-content/10 font-mono text-[9px] uppercase tracking-wider text-base-content/40">
                                            {job.type}
                                        </span>
                                        {job.urgent && (
                                            <span className="px-2 py-0.5 bg-warning/10 border border-warning/20 text-warning font-mono text-[9px] uppercase">
                                                Urgent
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">
                                        {job.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-base-content/30 mb-3">
                                        <span>{job.company}</span>
                                        <span className="text-base-content/10">
                                            |
                                        </span>
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {job.skills.map((s) => (
                                            <span
                                                key={s}
                                                className="px-1.5 py-0.5 bg-primary/5 border border-coral/10 text-primary font-mono text-[9px]"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-base-content/5">
                                        <span className="font-mono text-sm font-bold text-primary">
                                            {job.salary}
                                        </span>
                                        <span className="font-mono text-[10px] text-base-content/20">
                                            {job.applicants} apps
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="jobs-grid space-y-2">
                            {filteredJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="job-card group flex items-center justify-between p-4 bg-base-200 border border-base-content/5 hover:border-coral/20 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary border border-coral/20 font-mono text-xs font-bold flex-shrink-0">
                                            {job.company.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors truncate">
                                                    {job.title}
                                                </h3>
                                                {job.urgent && (
                                                    <span className="px-1.5 py-0.5 bg-warning/10 border border-warning/20 text-warning font-mono text-[8px] uppercase flex-shrink-0">
                                                        Urgent
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-base-content/30">
                                                <span>{job.company}</span>
                                                <span className="text-base-content/10">
                                                    |
                                                </span>
                                                <span>{job.location}</span>
                                                <span className="text-base-content/10">
                                                    |
                                                </span>
                                                <span>{job.posted}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex gap-1 flex-shrink-0">
                                            {job.skills.slice(0, 2).map((s) => (
                                                <span
                                                    key={s}
                                                    className="px-1.5 py-0.5 bg-primary/5 border border-coral/10 text-primary font-mono text-[9px]"
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="font-mono text-sm font-bold text-primary w-36 text-right flex-shrink-0">
                                            {job.salary}
                                        </span>
                                        <span className="font-mono text-[10px] text-base-content/20 w-16 text-right flex-shrink-0">
                                            {job.applicants} apps
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Recruiter Cards */}
            <section className="recruiter-section px-6 pb-24 pt-8 border-t border-base-content/10">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
                            // network.partners
                        </p>
                        <h2 className="text-2xl font-black tracking-tight">
                            Top Recruiters
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recruiterCards.map((r) => (
                            <div
                                key={r.name}
                                className="recruiter-card p-5 bg-base-200 border border-base-content/5 hover:border-coral/20 transition-colors group"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-11 h-11 flex items-center justify-center bg-primary/10 text-primary border border-coral/20 font-mono text-base font-bold">
                                        {r.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                                            {r.name}
                                        </h3>
                                        <p className="font-mono text-[10px] text-base-content/30">
                                            {r.focus}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="p-2 bg-base-300 border border-base-content/5 text-center">
                                        <p className="font-mono text-lg font-black text-primary">
                                            {r.placements}
                                        </p>
                                        <p className="font-mono text-[8px] uppercase tracking-wider text-base-content/25">
                                            Placements
                                        </p>
                                    </div>
                                    <div className="p-2 bg-base-300 border border-base-content/5 text-center">
                                        <p className="font-mono text-lg font-black text-warning">
                                            {r.rating}
                                        </p>
                                        <p className="font-mono text-[8px] uppercase tracking-wider text-base-content/25">
                                            Rating
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-base-content/5">
                                    <span className="font-mono text-[10px] text-base-content/25">
                                        {r.active} active splits
                                    </span>
                                    <span className="font-mono text-[10px] text-base-content/20">
                                        {r.region}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <section className="py-10 px-6 border-t border-base-content/10 bg-base-200">
                <div className="max-w-6xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
                    <div className="flex items-center gap-2">
                        <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">
                            Card System Operational
                        </span>
                    </div>
                    <span className="text-base-content/10">|</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                        Splits Network // Component Showcase
                    </span>
                </div>
            </section>
        </main>
    );
}
