"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function formatSalary(salary: JobListing["salary"]) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: salary.currency, maximumFractionDigits: 0 }).format(n);
    return `${fmt(salary.min)} - ${fmt(salary.max)}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusColor(status: JobListing["status"]) {
    switch (status) { case "open": return "badge-success"; case "filled": return "badge-error"; case "pending": return "badge-warning"; case "closed": return "badge-neutral"; }
}

/* ─── Categories for filtering ────────────────────────────────────────────── */
const categories = [
    { id: "all", label: "All", icon: "fa-duotone fa-regular fa-grid-2" },
    { id: "Engineering", label: "Engineering", icon: "fa-duotone fa-regular fa-code" },
    { id: "Design", label: "Design", icon: "fa-duotone fa-regular fa-palette" },
    { id: "Marketing", label: "Marketing", icon: "fa-duotone fa-regular fa-bullhorn" },
    { id: "Data", label: "Data", icon: "fa-duotone fa-regular fa-chart-line" },
    { id: "Product", label: "Product", icon: "fa-duotone fa-regular fa-cube" },
    { id: "Sales", label: "Sales", icon: "fa-duotone fa-regular fa-phone" },
];

/* ─── Recruiter cards data ────────────────────────────────────────────────── */
const recruiters = [
    { name: "Sarah Chen", agency: "TechHire Partners", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", placements: 47, specialties: ["Engineering", "Product"], rating: 4.9 },
    { name: "Michael Torres", agency: "Scale Recruiting", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", placements: 63, specialties: ["Engineering", "Data"], rating: 4.8 },
    { name: "Jessica Park", agency: "CreativeEdge Talent", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", placements: 31, specialties: ["Design", "Marketing"], rating: 4.7 },
    { name: "David Kim", agency: "DataTalent Group", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", placements: 52, specialties: ["Data", "Engineering"], rating: 4.9 },
];

/* ─── Company cards data ──────────────────────────────────────────────────── */
const companies = [
    { name: "Stripe", openRoles: 12, industry: "Fintech", size: "5,000+", logo: "fa-duotone fa-regular fa-credit-card" },
    { name: "Notion", openRoles: 8, industry: "Productivity", size: "1,000+", logo: "fa-duotone fa-regular fa-note-sticky" },
    { name: "Linear", openRoles: 5, industry: "Dev Tools", size: "100+", logo: "fa-duotone fa-regular fa-bolt" },
    { name: "Figma", openRoles: 9, industry: "Design Tools", size: "1,500+", logo: "fa-duotone fa-regular fa-pen-ruler" },
];

export default function CardsFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredJobs = activeCategory === "all"
        ? mockJobs
        : mockJobs.filter((j) => j.department === activeCategory);

    const featuredJobs = mockJobs.filter((j) => j.featured);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".cin-reveal, .cin-card"), { opacity: 1, y: 0 });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            gsap.fromTo($1(".cin-cards-hero"), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 });

            // Featured cards
            gsap.fromTo($(".cin-featured-card"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: $1(".cin-featured-section"), start: "top 80%" } });

            // Standard cards
            gsap.fromTo($(".cin-job-card"), { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", scrollTrigger: { trigger: $1(".cin-jobs-grid"), start: "top 85%" } });

            // Recruiter cards
            gsap.fromTo($(".cin-recruiter-card"), { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: $1(".cin-recruiter-section"), start: "top 85%" } });

            // Company cards
            gsap.fromTo($(".cin-company-card"), { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: $1(".cin-company-section"), start: "top 85%" } });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-base-100">
            {/* Header */}
            <div className="cin-cards-hero bg-neutral text-white opacity-0">
                <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
                    <p className="text-xs uppercase tracking-[0.3em] font-medium text-primary mb-4">Cinematic Editorial</p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-3">
                        Card <span className="text-primary">Gallery</span>
                    </h1>
                    <p className="text-base text-white/50 max-w-xl leading-relaxed">
                        Multiple card variants for jobs, recruiters, and companies. Featuring highlighted cards, hover states, and category filtering.
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                FEATURED CARDS — Large hero-style
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-featured-section py-14 lg:py-18">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="mb-8">
                        <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">Spotlight</p>
                        <h2 className="text-2xl md:text-3xl font-black">Featured Positions</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {featuredJobs.slice(0, 4).map((job) => (
                            <div
                                key={job.id}
                                className="cin-featured-card group relative border-2 border-primary/20 rounded-2xl p-6 bg-base-100 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer opacity-0"
                            >
                                <div className="absolute top-4 right-4">
                                    <span className="badge badge-primary font-semibold"><i className="fa-duotone fa-regular fa-star mr-1" />Featured</span>
                                </div>
                                <div className="flex items-start gap-4 mb-4">
                                    <img src={job.recruiter.avatar} alt="" className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/20" />
                                    <div className="min-w-0">
                                        <h3 className="font-black text-lg leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
                                        <p className="text-sm text-base-content/50 font-medium">{job.company}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-base-content/50 leading-relaxed mb-4 line-clamp-2">{job.description}</p>
                                <div className="flex items-center gap-4 text-sm text-base-content/40 mb-4">
                                    <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-location-dot text-primary text-xs" />{job.location}</span>
                                    <span className="font-semibold text-base-content/70">{formatSalary(job.salary)}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {job.tags.slice(0, 4).map((t, i) => (
                                        <span key={i} className="badge badge-sm bg-primary/10 text-primary border-0 font-medium">{t}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-base-content/5 text-xs text-base-content/30">
                                    <span>{job.applicants} applicants</span>
                                    <span>{formatDate(job.postedDate)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                STANDARD JOB CARDS — With category filter
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-base-200 py-14 lg:py-18">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">Browse</p>
                            <h2 className="text-2xl md:text-3xl font-black">All Positions</h2>
                        </div>
                        <span className="text-sm text-base-content/40 font-medium">{filteredJobs.length} results</span>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                    activeCategory === cat.id
                                        ? "bg-primary text-primary-content shadow-sm"
                                        : "bg-base-100 text-base-content/50 hover:text-base-content border border-base-content/5"
                                }`}
                            >
                                <i className={cat.icon} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Cards Grid */}
                    <div className="cin-jobs-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                className="cin-job-card group bg-base-100 rounded-xl border border-base-content/5 p-5 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer opacity-0"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`badge badge-sm ${statusColor(job.status)} font-semibold uppercase tracking-wider`}>{job.status}</span>
                                    {job.featured && <i className="fa-duotone fa-regular fa-star text-primary text-xs" />}
                                </div>
                                <h3 className="font-black text-base leading-tight mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                                <p className="text-sm text-base-content/50 font-medium mb-3">{job.company}</p>
                                <div className="space-y-1.5 text-sm text-base-content/40 mb-4">
                                    <div className="flex items-center gap-2"><i className="fa-duotone fa-regular fa-location-dot text-primary text-xs w-4 text-center" />{job.location}</div>
                                    <div className="flex items-center gap-2"><i className="fa-duotone fa-regular fa-money-bill-wave text-primary text-xs w-4 text-center" /><span className="font-semibold text-base-content/60">{formatSalary(job.salary)}</span></div>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {job.tags.slice(0, 3).map((t, i) => <span key={i} className="badge badge-sm bg-base-200 border-0 text-base-content/50">{t}</span>)}
                                    {job.tags.length > 3 && <span className="badge badge-sm bg-base-200 border-0 text-base-content/30">+{job.tags.length - 3}</span>}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-base-content/5 text-xs text-base-content/30">
                                    <span>{job.applicants} applicants</span>
                                    <span>{formatDate(job.postedDate)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                RECRUITER CARDS — Profile style
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-recruiter-section py-14 lg:py-18">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="mb-8">
                        <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">Network</p>
                        <h2 className="text-2xl md:text-3xl font-black">Top Recruiters</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {recruiters.map((rec, i) => (
                            <div
                                key={i}
                                className="cin-recruiter-card group bg-base-100 border border-base-content/5 rounded-xl p-5 text-center hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer opacity-0"
                            >
                                <img src={rec.avatar} alt={rec.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all" />
                                <h3 className="font-black text-base mb-0.5 group-hover:text-primary transition-colors">{rec.name}</h3>
                                <p className="text-xs text-base-content/40 font-medium mb-3">{rec.agency}</p>
                                <div className="flex items-center justify-center gap-1 mb-3">
                                    <i className="fa-solid fa-star text-warning text-xs" />
                                    <span className="font-bold text-sm">{rec.rating}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 justify-center mb-3">
                                    {rec.specialties.map((s, j) => <span key={j} className="badge badge-sm bg-primary/10 text-primary border-0 font-medium">{s}</span>)}
                                </div>
                                <div className="text-xs text-base-content/30 pt-3 border-t border-base-content/5">
                                    <strong className="text-base-content/60">{rec.placements}</strong> placements
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                COMPANY CARDS — Minimal style
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-company-section bg-neutral text-white py-14 lg:py-18">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="mb-8">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-2">Employers</p>
                        <h2 className="text-2xl md:text-3xl font-black">Hiring Companies</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {companies.map((co, i) => (
                            <div
                                key={i}
                                className="cin-company-card group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer opacity-0"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                                    <i className={`${co.logo} text-primary text-xl`} />
                                </div>
                                <h3 className="font-black text-lg mb-1">{co.name}</h3>
                                <p className="text-xs text-white/40 mb-4">{co.industry} &middot; {co.size} employees</p>
                                <div className="flex items-center justify-between">
                                    <span className="badge badge-sm badge-primary font-semibold">{co.openRoles} open roles</span>
                                    <i className="fa-duotone fa-regular fa-arrow-right text-white/30 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
