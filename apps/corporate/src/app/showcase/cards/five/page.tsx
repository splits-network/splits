"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";

// ─── Card Categories ──────────────────────────────────────────────────────────

const categories = [
    {
        key: "all",
        label: "All Signals",
        icon: "fa-duotone fa-regular fa-signal-stream",
    },
    {
        key: "Engineering",
        label: "Engineering",
        icon: "fa-duotone fa-regular fa-code",
    },
    {
        key: "Design",
        label: "Design",
        icon: "fa-duotone fa-regular fa-pen-ruler",
    },
    {
        key: "Product",
        label: "Product",
        icon: "fa-duotone fa-regular fa-lightbulb",
    },
    { key: "Data", label: "Data", icon: "fa-duotone fa-regular fa-database" },
    {
        key: "Marketing",
        label: "Marketing",
        icon: "fa-duotone fa-regular fa-bullhorn",
    },
    {
        key: "Sales",
        label: "Sales",
        icon: "fa-duotone fa-regular fa-chart-line",
    },
];

const teamMembers = [
    {
        name: "Sarah Chen",
        role: "Lead Recruiter",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        placements: 47,
        rating: 4.9,
        specialty: "Engineering",
        color: "border-info/20",
    },
    {
        name: "Michael Torres",
        role: "Senior Recruiter",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        placements: 32,
        rating: 4.7,
        specialty: "Product",
        color: "border-warning/20",
    },
    {
        name: "Emma Schmidt",
        role: "Tech Recruiter",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
        placements: 28,
        rating: 4.8,
        specialty: "Design",
        color: "border-success/20",
    },
    {
        name: "David Kim",
        role: "Data Recruiter",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        placements: 39,
        rating: 4.6,
        specialty: "Data Science",
        color: "border-yellow/20",
    },
];

const companyCards = [
    {
        name: "Stripe",
        roles: 12,
        industry: "Fintech",
        size: "5,000+",
        color: "border-info/20",
        icon: "fa-duotone fa-regular fa-credit-card",
    },
    {
        name: "Notion",
        roles: 8,
        industry: "Productivity",
        size: "1,000+",
        color: "border-warning/20",
        icon: "fa-duotone fa-regular fa-pen-to-square",
    },
    {
        name: "Linear",
        roles: 5,
        industry: "Dev Tools",
        size: "100+",
        color: "border-success/20",
        icon: "fa-duotone fa-regular fa-diagram-project",
    },
    {
        name: "Figma",
        roles: 9,
        industry: "Design Tools",
        size: "1,500+",
        color: "border-yellow/20",
        icon: "fa-duotone fa-regular fa-pen-ruler",
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardsFivePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState("all");

    const filtered =
        activeCategory === "all"
            ? mockJobs
            : mockJobs.filter((j) => j.department === activeCategory);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".opacity-0"), {
                    opacity: 1,
                });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(
                ".page-head",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            );
            tl.fromTo(
                ".cat-btn",
                { opacity: 0, scale: 0.9 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.25,
                    stagger: 0.04,
                    ease: "back.out(1.4)",
                },
                "-=0.2",
            );
            tl.fromTo(
                ".section-label",
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: 0.3, stagger: 0.1 },
                "-=0.1",
            );
            tl.fromTo(
                ".card-item",
                { opacity: 0, y: 25, scale: 0.97 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    stagger: 0.04,
                    ease: "back.out(1.2)",
                },
                "-=0.2",
            );
        },
        { scope: containerRef },
    );

    const handleCategoryChange = (key: string) => {
        setActiveCategory(key);
        gsap.fromTo(
            ".job-card",
            { opacity: 0, y: 15 },
            {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.03,
                ease: "power2.out",
            },
        );
    };

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#09090b] text-[#e5e7eb]"
        >
            <div
                className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                }}
            />

            <div className="container mx-auto px-4 py-10">
                {/* Header */}
                <div className="page-head mb-8 opacity-0">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">
                            Observatory Online
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="text-[#e5e7eb]">Card </span>
                        <span className="text-info">Gallery</span>
                    </h1>
                    <p className="text-sm text-[#e5e7eb]/40 font-mono">
                        Multiple card variants across the observatory ecosystem.
                    </p>
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => handleCategoryChange(cat.key)}
                            className={`cat-btn flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors opacity-0 ${
                                activeCategory === cat.key
                                    ? "border-info/40 bg-info/10 text-info"
                                    : "border-[#27272a] text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 hover:border-[#e5e7eb]/10"
                            }`}
                        >
                            <i className={`${cat.icon} text-[10px]`} />{" "}
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* ═══ SECTION 1: Featured Job Cards (Large) ═══ */}
                <div className="mb-12">
                    <h2 className="section-label flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-info/60 mb-5 opacity-0">
                        <i className="fa-duotone fa-regular fa-star" /> Featured
                        Signals
                        <div className="h-px flex-1 bg-[#27272a] ml-2" />
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {filtered
                            .filter((j) => j.featured)
                            .slice(0, 4)
                            .map((job) => (
                                <div
                                    key={job.id}
                                    className="card-item border border-info/20 bg-[#18181b]/40 rounded-xl p-6 hover:bg-[#18181b]/70 hover:border-info/30 transition-all cursor-pointer group opacity-0"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <i className="fa-duotone fa-regular fa-star text-warning text-xs" />
                                                <h3 className="font-bold group-hover:text-info transition-colors">
                                                    {job.title}
                                                </h3>
                                            </div>
                                            <div className="text-xs text-[#e5e7eb]/40">
                                                {job.company} -- {job.location}
                                            </div>
                                        </div>
                                        <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0 mt-1" />
                                    </div>
                                    <p className="text-sm text-[#e5e7eb]/40 mb-4 line-clamp-2">
                                        {job.description}
                                    </p>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-mono text-sm text-info font-bold">
                                            {job.salary.currency}{" "}
                                            {Math.round(job.salary.min / 1000)}k
                                            -{" "}
                                            {Math.round(job.salary.max / 1000)}k
                                        </span>
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/20">
                                            {job.type}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#27272a]/40">
                                        {job.tags.slice(0, 4).map((tag, i) => (
                                            <span
                                                key={i}
                                                className="font-mono text-[9px] text-[#e5e7eb]/25 border border-[#27272a]/50 px-2 py-0.5 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#27272a]/40">
                                        <div className="flex items-center gap-1.5">
                                            <img
                                                src={job.recruiter.avatar}
                                                alt=""
                                                className="w-5 h-5 rounded object-cover border border-[#27272a]"
                                            />
                                            <span className="text-[10px] text-[#e5e7eb]/30">
                                                {job.recruiter.name}
                                            </span>
                                        </div>
                                        <div className="ml-auto flex items-center gap-3 font-mono text-[9px] text-[#e5e7eb]/15">
                                            <span>
                                                <i className="fa-duotone fa-regular fa-users mr-1" />
                                                {job.applicants}
                                            </span>
                                            <span>
                                                <i className="fa-duotone fa-regular fa-eye mr-1" />
                                                {job.views}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* ═══ SECTION 2: Standard Job Cards (Compact) ═══ */}
                <div className="mb-12">
                    <h2 className="section-label flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-warning/60 mb-5 opacity-0">
                        <i className="fa-duotone fa-regular fa-signal-stream" />{" "}
                        All Listings
                        <span className="ml-2 font-mono text-[9px] text-[#e5e7eb]/15">
                            {filtered.length} signals
                        </span>
                        <div className="h-px flex-1 bg-[#27272a] ml-2" />
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filtered.slice(0, 9).map((job) => (
                            <div
                                key={job.id}
                                className="job-card card-item border border-[#27272a] bg-[#18181b]/40 rounded-xl p-4 hover:border-[#e5e7eb]/10 hover:bg-[#18181b]/60 transition-all cursor-pointer opacity-0"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold truncate">
                                            {job.title}
                                        </h3>
                                        <div className="text-xs text-[#e5e7eb]/30 truncate">
                                            {job.company}
                                        </div>
                                    </div>
                                    <span
                                        className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${job.status === "open" ? "bg-success animate-pulse" : job.status === "filled" ? "bg-info" : "bg-warning"}`}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[#e5e7eb]/30 mb-3">
                                    <i className="fa-duotone fa-regular fa-location-dot text-[10px]" />
                                    <span className="truncate">
                                        {job.location}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-info/60">
                                        {job.salary.currency}{" "}
                                        {Math.round(job.salary.min / 1000)}k-
                                        {Math.round(job.salary.max / 1000)}k
                                    </span>
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/15">
                                        {job.department}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ SECTION 3: Recruiter Cards ═══ */}
                <div className="mb-12">
                    <h2 className="section-label flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-success/60 mb-5 opacity-0">
                        <i className="fa-duotone fa-regular fa-user-tie" />{" "}
                        Network Recruiters
                        <div className="h-px flex-1 bg-[#27272a] ml-2" />
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {teamMembers.map((member, i) => (
                            <div
                                key={i}
                                className={`card-item border ${member.color} bg-[#18181b]/40 rounded-xl p-5 text-center hover:bg-[#18181b]/60 transition-all cursor-pointer opacity-0`}
                            >
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-14 h-14 rounded-xl object-cover border border-[#27272a] mx-auto mb-3"
                                />
                                <div className="font-bold text-sm mb-0.5">
                                    {member.name}
                                </div>
                                <div className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/25 mb-3">
                                    {member.role}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="border border-[#27272a] bg-[#09090b] rounded-lg py-1.5">
                                        <div className="font-mono text-sm font-bold text-info">
                                            {member.placements}
                                        </div>
                                        <div className="font-mono text-[7px] uppercase text-[#e5e7eb]/15">
                                            Placed
                                        </div>
                                    </div>
                                    <div className="border border-[#27272a] bg-[#09090b] rounded-lg py-1.5">
                                        <div className="font-mono text-sm font-bold text-warning">
                                            {member.rating}
                                        </div>
                                        <div className="font-mono text-[7px] uppercase text-[#e5e7eb]/15">
                                            Rating
                                        </div>
                                    </div>
                                </div>
                                <span className="inline-block font-mono text-[9px] text-[#e5e7eb]/20 border border-[#27272a]/50 px-2 py-0.5 rounded">
                                    {member.specialty}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ SECTION 4: Company Cards ═══ */}
                <div className="mb-12">
                    <h2 className="section-label flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent/60 mb-5 opacity-0">
                        <i className="fa-duotone fa-regular fa-building" />{" "}
                        Companies on Network
                        <div className="h-px flex-1 bg-[#27272a] ml-2" />
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {companyCards.map((company, i) => (
                            <div
                                key={i}
                                className={`card-item border ${company.color} bg-[#18181b]/40 rounded-xl p-5 hover:bg-[#18181b]/60 transition-all cursor-pointer opacity-0`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center justify-center mb-3">
                                    <i
                                        className={`${company.icon} text-lg text-[#e5e7eb]/30`}
                                    />
                                </div>
                                <div className="font-bold text-sm mb-1">
                                    {company.name}
                                </div>
                                <div className="font-mono text-[10px] text-[#e5e7eb]/25 mb-3">
                                    {company.industry} -- {company.size}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-[#27272a]/40">
                                    <span className="font-mono text-xs text-info">
                                        {company.roles} open roles
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ SECTION 5: Stat/Metric Cards (Mini) ═══ */}
                <div>
                    <h2 className="section-label flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-5 opacity-0">
                        <i className="fa-duotone fa-regular fa-chart-mixed" />{" "}
                        Network Telemetry
                        <div className="h-px flex-1 bg-[#27272a] ml-2" />
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            {
                                label: "Total Roles",
                                value: "2,847",
                                icon: "fa-duotone fa-regular fa-briefcase",
                                color: "text-info",
                                trend: "+15%",
                            },
                            {
                                label: "Placements MTD",
                                value: "147",
                                icon: "fa-duotone fa-regular fa-handshake",
                                color: "text-success",
                                trend: "+9%",
                            },
                            {
                                label: "Active Recruiters",
                                value: "1,205",
                                icon: "fa-duotone fa-regular fa-user-tie",
                                color: "text-warning",
                                trend: "+8%",
                            },
                            {
                                label: "Avg. Fill Time",
                                value: "18d",
                                icon: "fa-duotone fa-regular fa-clock",
                                color: "text-accent",
                                trend: "-3d",
                            },
                        ].map((metric, i) => (
                            <div
                                key={i}
                                className="card-item border border-[#27272a] bg-[#18181b]/40 rounded-xl p-4 opacity-0"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <i
                                        className={`${metric.icon} text-sm ${metric.color}`}
                                    />
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/25">
                                        {metric.label}
                                    </span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="font-mono text-2xl font-bold text-[#e5e7eb]">
                                        {metric.value}
                                    </span>
                                    <span className="font-mono text-[10px] text-success/60 mb-1">
                                        {metric.trend}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
