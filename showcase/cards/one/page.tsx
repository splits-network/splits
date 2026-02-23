"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

type CardCategory = "all" | "jobs" | "recruiters" | "companies" | "candidates";

const categories: { value: CardCategory; label: string; icon: string }[] = [
    { value: "all", label: "All", icon: "fa-duotone fa-regular fa-grid-2" },
    {
        value: "jobs",
        label: "Jobs",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        value: "recruiters",
        label: "Recruiters",
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    {
        value: "companies",
        label: "Companies",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        value: "candidates",
        label: "Candidates",
        icon: "fa-duotone fa-regular fa-user",
    },
];

const jobCards = [
    {
        id: "j1",
        title: "Senior Full-Stack Engineer",
        company: "TechCorp",
        initials: "TC",
        location: "Remote",
        salary: "$180k-$220k",
        split: "20%",
        urgency: "high",
        tags: ["React", "Node.js", "AWS"],
        applicants: 34,
        featured: true,
    },
    {
        id: "j2",
        title: "VP of Engineering",
        company: "DataFlow",
        initials: "DF",
        location: "San Francisco",
        salary: "$250k-$300k",
        split: "25%",
        urgency: "urgent",
        tags: ["Leadership", "Scale"],
        applicants: 12,
        featured: true,
    },
    {
        id: "j3",
        title: "Product Manager",
        company: "InnovateCo",
        initials: "IC",
        location: "Remote",
        salary: "$160k-$185k",
        split: "20%",
        urgency: "normal",
        tags: ["B2B SaaS", "PLG"],
        applicants: 28,
        featured: false,
    },
    {
        id: "j4",
        title: "Data Scientist",
        company: "AnalyticsPro",
        initials: "AP",
        location: "Austin, TX",
        salary: "$150k-$190k",
        split: "18%",
        urgency: "normal",
        tags: ["Python", "ML"],
        applicants: 19,
        featured: false,
    },
    {
        id: "j5",
        title: "DevOps Engineer",
        company: "CloudScale",
        initials: "CS",
        location: "Remote",
        salary: "$170k-$210k",
        split: "20%",
        urgency: "high",
        tags: ["Kubernetes", "Terraform"],
        applicants: 15,
        featured: false,
    },
    {
        id: "j6",
        title: "UX Designer",
        company: "DesignLab",
        initials: "DL",
        location: "New York",
        salary: "$140k-$170k",
        split: "20%",
        urgency: "low",
        tags: ["Figma", "Research"],
        applicants: 42,
        featured: false,
    },
];

const recruiterCards = [
    {
        id: "r1",
        name: "Sarah Kim",
        initials: "SK",
        specialty: "Engineering",
        placements: 47,
        rating: 4.9,
        location: "San Francisco",
        online: true,
        featured: true,
    },
    {
        id: "r2",
        name: "Marcus Chen",
        initials: "MC",
        specialty: "Executive",
        placements: 31,
        rating: 4.8,
        location: "New York",
        online: true,
        featured: false,
    },
    {
        id: "r3",
        name: "Elena Volkov",
        initials: "EV",
        specialty: "Data & AI",
        placements: 28,
        rating: 4.7,
        location: "Remote",
        online: false,
        featured: false,
    },
    {
        id: "r4",
        name: "James Rivera",
        initials: "JR",
        specialty: "Product",
        placements: 22,
        rating: 4.6,
        location: "Austin, TX",
        online: true,
        featured: true,
    },
];

const companyCards = [
    {
        id: "c1",
        name: "TechCorp",
        initials: "TC",
        industry: "Enterprise Software",
        openRoles: 12,
        size: "500-1000",
        stage: "Series C",
        featured: true,
    },
    {
        id: "c2",
        name: "DataFlow Inc",
        initials: "DF",
        industry: "Data Analytics",
        openRoles: 8,
        size: "200-500",
        stage: "Series B",
        featured: false,
    },
    {
        id: "c3",
        name: "InnovateCo",
        initials: "IC",
        industry: "SaaS",
        openRoles: 5,
        size: "50-200",
        stage: "Series A",
        featured: false,
    },
];

const candidateCards = [
    {
        id: "ca1",
        name: "Alex Novak",
        initials: "AN",
        role: "Full-Stack Engineer",
        experience: "7 years",
        skills: ["React", "Node.js", "Go"],
        status: "Active",
        match: 95,
    },
    {
        id: "ca2",
        name: "Diana Wu",
        initials: "DW",
        role: "Product Manager",
        experience: "5 years",
        skills: ["Strategy", "Analytics", "B2B"],
        status: "Active",
        match: 88,
    },
    {
        id: "ca3",
        name: "Robert Tanaka",
        initials: "RT",
        role: "Data Scientist",
        experience: "4 years",
        skills: ["Python", "ML", "SQL"],
        status: "Passive",
        match: 82,
    },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function CardsOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [filter, setFilter] = useState<CardCategory>("all");

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                return;
            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(
                $1(".cards-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            )
                .fromTo(
                    $(".cards-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".cards-desc"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                );

            $(".cards-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        scrollTrigger: { trigger: section, start: "top 85%" },
                    },
                );
            });
        },
        { scope: mainRef },
    );

    const urgencyColors: Record<string, string> = {
        low: "text-base-content/40",
        normal: "text-info",
        high: "text-warning",
        urgent: "text-error",
    };

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="cards-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                            Marketplace
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="cards-title-word inline-block opacity-0">
                                Browse the
                            </span>{" "}
                            <span className="cards-title-word inline-block opacity-0 text-primary">
                                network.
                            </span>
                        </h1>
                        <p className="cards-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                            Jobs, recruiters, companies, and candidates in one
                            connected ecosystem.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="bg-base-200 border-b border-base-300 py-4">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setFilter(cat.value)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all ${
                                    filter === cat.value
                                        ? "bg-primary text-primary-content"
                                        : "bg-base-100 text-base-content/60 hover:text-base-content border border-base-300"
                                }`}
                            >
                                <i className={`${cat.icon} text-xs`} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                {/* Featured Jobs */}
                {(filter === "all" || filter === "jobs") && (
                    <div className="cards-section opacity-0 mb-14">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                                    Featured
                                </p>
                                <h2 className="text-2xl font-black tracking-tight">
                                    Hot Roles
                                </h2>
                            </div>
                            <a
                                href="#"
                                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                            >
                                View all{" "}
                                <i className="fa-solid fa-arrow-right text-xs" />
                            </a>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            {jobCards
                                .filter((j) => j.featured)
                                .map((job) => (
                                    <div
                                        key={job.id}
                                        className="border-l-4 border-coral bg-base-200 p-6 hover:bg-base-300/50 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                                                    {job.initials}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-sm text-base-content/50">
                                                        {job.company}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                Featured
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/60 mb-3">
                                            <span className="flex items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-dollar-sign text-xs" />
                                                {job.salary}
                                            </span>
                                            <span
                                                className={`flex items-center gap-1 font-semibold ${urgencyColors[job.urgency]}`}
                                            >
                                                <i className="fa-duotone fa-regular fa-bolt text-xs" />
                                                {job.urgency}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-users text-xs" />
                                                {job.applicants} applicants
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                {job.tags.map((t) => (
                                                    <span
                                                        key={t}
                                                        className="px-2 py-0.5 bg-base-300 text-[10px] font-semibold text-base-content/50"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-sm font-bold text-primary">
                                                {job.split} fee
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        {/* Regular job cards grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {jobCards
                                .filter((j) => !j.featured)
                                .map((job) => (
                                    <div
                                        key={job.id}
                                        className="bg-base-200 p-5 border border-base-300 hover:border-coral/50 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 bg-secondary text-secondary-content flex items-center justify-center font-bold text-xs">
                                                {job.initials}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                                                    {job.title}
                                                </h3>
                                                <p className="text-xs text-base-content/40">
                                                    {job.company}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-xs text-base-content/50 mb-3">
                                            <div className="flex justify-between">
                                                <span>{job.location}</span>
                                                <span className="font-semibold text-primary">
                                                    {job.salary}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>
                                                    {job.applicants} applicants
                                                </span>
                                                <span>{job.split} fee</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {job.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    className="px-2 py-0.5 bg-base-100 text-[10px] font-semibold text-base-content/40"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Recruiters */}
                {(filter === "all" || filter === "recruiters") && (
                    <div className="cards-section opacity-0 mb-14">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                                    Top Performers
                                </p>
                                <h2 className="text-2xl font-black tracking-tight">
                                    Recruiters
                                </h2>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recruiterCards.map((r) => (
                                <div
                                    key={r.id}
                                    className={`p-5 border hover:border-coral/50 transition-all cursor-pointer ${r.featured ? "bg-base-200 border-l-4 border-l-primary border-t-0 border-r border-b border-base-300" : "bg-base-200 border-base-300"}`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="relative">
                                            <div className="w-11 h-11 bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                                                {r.initials}
                                            </div>
                                            {r.online && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-base-200 rounded-full" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">
                                                {r.name}
                                            </h3>
                                            <p className="text-xs text-base-content/40">
                                                {r.specialty}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-center mb-3">
                                        <div className="bg-base-100 p-2">
                                            <div className="text-lg font-black text-primary">
                                                {r.placements}
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-base-content/40">
                                                Placements
                                            </div>
                                        </div>
                                        <div className="bg-base-100 p-2">
                                            <div className="text-lg font-black text-secondary">
                                                {r.rating}
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-base-content/40">
                                                Rating
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-base-content/40 flex items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-location-dot" />
                                        {r.location}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Companies */}
                {(filter === "all" || filter === "companies") && (
                    <div className="cards-section opacity-0 mb-14">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-1">
                                    Hiring Now
                                </p>
                                <h2 className="text-2xl font-black tracking-tight">
                                    Companies
                                </h2>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {companyCards.map((c) => (
                                <div
                                    key={c.id}
                                    className={`p-6 border hover:border-secondary/50 transition-all cursor-pointer ${c.featured ? "border-t-4 border-t-secondary bg-base-200 border-x border-b border-base-300" : "bg-base-200 border-base-300"}`}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg">
                                            {c.initials}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">
                                                {c.name}
                                            </h3>
                                            <p className="text-xs text-base-content/40">
                                                {c.industry}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                        <div>
                                            <div className="text-xl font-black text-secondary">
                                                {c.openRoles}
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-base-content/40">
                                                Open Roles
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">
                                                {c.size}
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-base-content/40">
                                                Employees
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">
                                                {c.stage}
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-base-content/40">
                                                Stage
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn btn-secondary btn-sm w-full">
                                        View Open Roles{" "}
                                        <i className="fa-duotone fa-regular fa-arrow-right" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Candidates */}
                {(filter === "all" || filter === "candidates") && (
                    <div className="cards-section opacity-0">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-1">
                                    Matched
                                </p>
                                <h2 className="text-2xl font-black tracking-tight">
                                    Candidates
                                </h2>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {candidateCards.map((c) => (
                                <div
                                    key={c.id}
                                    className="bg-base-200 p-5 border border-base-300 hover:border-yellow/50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-accent text-accent-content flex items-center justify-center font-bold text-sm">
                                                {c.initials}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm">
                                                    {c.name}
                                                </h3>
                                                <p className="text-xs text-base-content/40">
                                                    {c.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-accent">
                                                {c.match}%
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-base-content/40">
                                                Match
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-base-content/50 mb-3">
                                        <span>{c.experience}</span>
                                        <span className="text-base-content/20">
                                            |
                                        </span>
                                        <span
                                            className={
                                                c.status === "Active"
                                                    ? "text-success font-semibold"
                                                    : "text-base-content/40"
                                            }
                                        >
                                            {c.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {c.skills.map((s) => (
                                            <span
                                                key={s}
                                                className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-semibold"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
