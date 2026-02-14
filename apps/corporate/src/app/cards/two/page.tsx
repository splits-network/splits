"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const categories = ["All", "Engineering", "Product", "Design", "Marketing", "Sales", "Operations"];

const jobCards = [
    { id: 1, title: "Staff Frontend Engineer", company: "Meridian Corp", location: "San Francisco, CA", type: "Hybrid", salary: "$200k - $260k", split: "50/50", category: "Engineering", applicants: 34, daysAgo: 2, featured: true, urgent: false, skills: ["React", "TypeScript", "GraphQL"] },
    { id: 2, title: "Product Manager", company: "Helix Dynamics", location: "Remote", type: "Remote", salary: "$160k - $200k", split: "60/40", category: "Product", applicants: 22, daysAgo: 5, featured: false, urgent: true, skills: ["Strategy", "Analytics", "Agile"] },
    { id: 3, title: "Senior UX Designer", company: "Cirrus Technologies", location: "New York, NY", type: "Onsite", salary: "$140k - $180k", split: "50/50", category: "Design", applicants: 18, daysAgo: 1, featured: true, urgent: false, skills: ["Figma", "Research", "Design Systems"] },
    { id: 4, title: "DevOps Lead", company: "Quantum Financial", location: "Austin, TX", type: "Hybrid", salary: "$180k - $230k", split: "50/50", category: "Engineering", applicants: 11, daysAgo: 7, featured: false, urgent: false, skills: ["Kubernetes", "AWS", "Terraform"] },
    { id: 5, title: "Growth Marketing Manager", company: "Apex Robotics", location: "Los Angeles, CA", type: "Remote", salary: "$130k - $160k", split: "60/40", category: "Marketing", applicants: 29, daysAgo: 3, featured: false, urgent: false, skills: ["SEO", "Paid Media", "Analytics"] },
    { id: 6, title: "VP of Engineering", company: "Meridian Corp", location: "San Francisco, CA", type: "Onsite", salary: "$280k - $350k", split: "50/50", category: "Engineering", applicants: 8, daysAgo: 10, featured: true, urgent: true, skills: ["Leadership", "Architecture", "Go"] },
    { id: 7, title: "Sales Director, Enterprise", company: "Helix Dynamics", location: "Chicago, IL", type: "Hybrid", salary: "$200k - $250k", split: "70/30", category: "Sales", applicants: 15, daysAgo: 4, featured: false, urgent: false, skills: ["Enterprise", "SaaS", "Negotiation"] },
    { id: 8, title: "Data Engineer", company: "Cirrus Technologies", location: "Remote", type: "Remote", salary: "$150k - $190k", split: "50/50", category: "Engineering", applicants: 20, daysAgo: 6, featured: false, urgent: false, skills: ["Python", "Spark", "SQL"] },
    { id: 9, title: "Head of Operations", company: "Quantum Financial", location: "New York, NY", type: "Onsite", salary: "$170k - $220k", split: "60/40", category: "Operations", applicants: 12, daysAgo: 8, featured: false, urgent: false, skills: ["Strategy", "Process", "Analytics"] },
];

const recruiterCards = [
    { name: "Sarah Chen", specialty: "Frontend & Full-Stack", placements: 47, rating: 4.9, initials: "SC", location: "San Francisco, CA" },
    { name: "Marcus Rivera", specialty: "Product & Design", placements: 32, rating: 4.8, initials: "MR", location: "New York, NY" },
    { name: "Diana Foster", specialty: "Engineering Leadership", placements: 61, rating: 5.0, initials: "DF", location: "Austin, TX" },
    { name: "James Park", specialty: "Data & ML", placements: 28, rating: 4.7, initials: "JP", location: "Remote" },
];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function CardsTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredJobs = activeCategory === "All"
        ? jobCards
        : jobCards.filter((j) => j.category === activeCategory);

    useGSAP(() => {
        gsap.from("[data-page-title]", {
            y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
        });
        gsap.from("[data-filter-btn]", {
            y: 15, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.3,
        });
        gsap.utils.toArray<HTMLElement>("[data-divider]").forEach((line) => {
            gsap.from(line, {
                scaleX: 0, transformOrigin: "left center", duration: 1, ease: "power2.inOut",
                scrollTrigger: { trigger: line, start: "top 90%" },
            });
        });
        gsap.from("[data-card]", {
            y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power2.out", delay: 0.4,
        });
        gsap.from("[data-recruiter-card]", {
            y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: "[data-recruiters]", start: "top 80%" },
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="overflow-hidden min-h-screen bg-base-100">
            {/* ─── Header ────────────────────────────────────────────── */}
            <section className="bg-neutral text-neutral-content py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p data-page-title className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4">
                        Marketplace
                    </p>
                    <h1 data-page-title className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-4">
                        Open<br />Positions
                    </h1>
                    <p data-page-title className="text-lg text-neutral-content/60 max-w-xl leading-relaxed">
                        Browse split-fee opportunities across the network.
                        Filter by department, review terms, and submit candidates.
                    </p>
                </div>
            </section>

            {/* ─── Filter Bar ─────────────────────────────────────────── */}
            <section className="bg-base-200 border-b border-base-300">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                data-filter-btn
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 text-xs uppercase tracking-[0.15em] font-medium whitespace-nowrap transition-colors ${
                                    activeCategory === cat
                                        ? "bg-secondary text-secondary-content"
                                        : "text-base-content/50 hover:text-base-content hover:bg-base-300"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-base-content/40 uppercase tracking-wider whitespace-nowrap">
                            {filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </section>

            {/* ─── Featured Cards ─────────────────────────────────────── */}
            <section className="py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    {/* Featured section */}
                    {filteredJobs.some((j) => j.featured) && (
                        <>
                            <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">Featured Positions</p>
                            <div data-divider className="h-px bg-base-300 mb-8" />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
                                {filteredJobs.filter((j) => j.featured).map((job) => (
                                    <div key={job.id} data-card className="border border-base-300 p-6 md:p-8 hover:border-secondary/40 transition-colors group cursor-pointer relative">
                                        {/* Featured badge */}
                                        <div className="absolute top-0 right-6 bg-secondary text-secondary-content px-3 py-1 text-[10px] uppercase tracking-wider font-semibold">
                                            Featured
                                        </div>

                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content group-hover:text-secondary transition-colors tracking-tight">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm text-base-content/50 mt-1">
                                                    {job.company} &middot; {job.location}
                                                </p>
                                            </div>
                                            {job.urgent && (
                                                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-warning/10 text-warning shrink-0">
                                                    Urgent
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {job.skills.map((s) => (
                                                <span key={s} className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium border border-base-300 text-base-content/50">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="h-px bg-base-300 mb-4" />

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-primary">{job.salary}</span>
                                                <span className="text-base-content/40">{job.split} split</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-base-content/40">
                                                <span>{job.applicants} applicants</span>
                                                <span>&middot;</span>
                                                <span>{job.daysAgo}d ago</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-4">
                                            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
                                                job.type === "Remote" ? "bg-success/10 text-success"
                                                : job.type === "Hybrid" ? "bg-info/10 text-info"
                                                : "bg-base-200 text-base-content/50"
                                            }`}>
                                                {job.type}
                                            </span>
                                            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-base-200 text-base-content/50">
                                                {job.category}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* All Cards */}
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">All Positions</p>
                    <div data-divider className="h-px bg-base-300 mb-8" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.filter((j) => !j.featured).map((job) => (
                            <div key={job.id} data-card className="border border-base-300 p-6 hover:border-secondary/40 transition-colors group cursor-pointer">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
                                        job.type === "Remote" ? "bg-success/10 text-success"
                                        : job.type === "Hybrid" ? "bg-info/10 text-info"
                                        : "bg-base-200 text-base-content/50"
                                    }`}>
                                        {job.type}
                                    </span>
                                    {job.urgent && (
                                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-warning/10 text-warning">
                                            Urgent
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-base-content group-hover:text-secondary transition-colors tracking-tight mb-1">
                                    {job.title}
                                </h3>
                                <p className="text-sm text-base-content/50 mb-4">
                                    {job.company} &middot; {job.location}
                                </p>

                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {job.skills.map((s) => (
                                        <span key={s} className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium border border-base-300 text-base-content/50">
                                            {s}
                                        </span>
                                    ))}
                                </div>

                                <div className="h-px bg-base-300 mb-3" />

                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-primary">{job.salary}</span>
                                    <span className="text-xs text-base-content/40">{job.split}</span>
                                </div>

                                <div className="flex items-center justify-between mt-3 text-xs text-base-content/40">
                                    <span>{job.applicants} applicants</span>
                                    <span>{job.daysAgo}d ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Recruiter Cards ────────────────────────────────────── */}
            <section className="bg-neutral text-neutral-content py-16 md:py-24" data-recruiters>
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">Top Recruiters</p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">Network partners</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recruiterCards.map((rec) => (
                            <div key={rec.name} data-recruiter-card className="border border-neutral-content/10 p-6 hover:border-secondary/40 transition-colors group cursor-pointer text-center">
                                <div className="w-14 h-14 bg-neutral-content/10 flex items-center justify-center mx-auto mb-4 text-lg font-bold text-neutral-content/60 group-hover:text-secondary group-hover:bg-secondary/10 transition-colors">
                                    {rec.initials}
                                </div>
                                <h3 className="font-bold text-neutral-content group-hover:text-secondary transition-colors mb-1">{rec.name}</h3>
                                <p className="text-xs text-neutral-content/50 mb-4">{rec.specialty}</p>

                                <div className="h-px bg-neutral-content/10 mb-4" />

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-content/40">{rec.placements} placements</span>
                                    <span className="flex items-center gap-1 text-secondary">
                                        <i className="fa-solid fa-star text-[10px]" />
                                        {rec.rating}
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-content/30 mt-2">{rec.location}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Colophon ──────────────────────────────────────────── */}
            <section className="bg-base-200 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">
                        Splits Network &middot; Cards Grid &middot; Magazine Editorial
                    </p>
                </div>
            </section>
        </div>
    );
}
