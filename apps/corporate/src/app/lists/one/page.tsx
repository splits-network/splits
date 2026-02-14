"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "../../../data/mock-jobs";
import type { JobListing } from "../../../types/job-listing";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

type ViewMode = "table" | "grid" | "gmail";

function formatSalary(salary: JobListing["salary"]): string {
    const fmt = (n: number) =>
        n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
    return `${salary.currency} ${fmt(salary.min)} - ${fmt(salary.max)}`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function statusColor(status: JobListing["status"]): string {
    switch (status) {
        case "open":
            return "bg-success/15 text-success";
        case "filled":
            return "bg-error/15 text-error";
        case "pending":
            return "bg-warning/15 text-warning";
        case "closed":
            return "bg-base-content/15 text-base-content/50";
    }
}

function typeIcon(type: JobListing["type"]): string {
    switch (type) {
        case "full-time":
            return "fa-duotone fa-regular fa-briefcase";
        case "part-time":
            return "fa-duotone fa-regular fa-clock";
        case "contract":
            return "fa-duotone fa-regular fa-file-contract";
        case "remote":
            return "fa-duotone fa-regular fa-globe";
    }
}

/* ─── Detail Panel Component ──────────────────────────────────────────────── */

function DetailPanel({
    job,
    onClose,
    variant,
}: {
    job: JobListing;
    onClose: () => void;
    variant: "sidebar" | "split";
}) {
    return (
        <div
            className={`detail-panel bg-base-100 overflow-y-auto ${
                variant === "sidebar"
                    ? "border-l-4 border-primary"
                    : "border-l-2 border-base-300"
            }`}
        >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span
                        className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(job.status)}`}
                    >
                        {job.status}
                    </span>
                    {job.featured && (
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-primary/15 text-primary">
                            Featured
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm btn-square"
                >
                    <i className="fa-duotone fa-regular fa-xmark text-lg"></i>
                </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Title block */}
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                        {job.department}
                    </p>
                    <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                        {job.title}
                    </h2>
                    <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                        <span>
                            <i className="fa-duotone fa-regular fa-building mr-1"></i>
                            {job.company}
                        </span>
                        <span>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                            {job.location}
                        </span>
                        <span>
                            <i className={`${typeIcon(job.type)} mr-1`}></i>
                            {job.type}
                        </span>
                    </div>
                </div>

                {/* Salary + stats */}
                <div className="grid grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Salary Range
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {formatSalary(job.salary)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Experience
                        </p>
                        <p className="text-lg font-black tracking-tight capitalize">
                            {job.experienceLevel}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Applicants
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {job.applicants}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Views
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {job.views.toLocaleString()}
                        </p>
                    </div>
                </div>

                {job.equity && (
                    <div className="bg-primary/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-1">
                            Equity
                        </p>
                        <p className="text-base font-bold text-primary">
                            {job.equity}
                        </p>
                    </div>
                )}

                {/* Description */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Overview
                    </h3>
                    <p className="text-base-content/70 leading-relaxed">
                        {job.description}
                    </p>
                </div>

                {/* Requirements */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Requirements
                    </h3>
                    <ul className="space-y-2">
                        {job.requirements.map((req, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-check text-primary text-xs mt-1.5 flex-shrink-0"></i>
                                <span className="leading-relaxed">{req}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Responsibilities */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Responsibilities
                    </h3>
                    <ul className="space-y-2">
                        {job.responsibilities.map((resp, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right text-secondary text-xs mt-1.5 flex-shrink-0"></i>
                                <span className="leading-relaxed">{resp}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Benefits */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Benefits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {job.benefits.map((benefit, i) => (
                            <span
                                key={i}
                                className="text-xs uppercase tracking-[0.15em] text-base-content/60 border border-base-300 px-3 py-1.5"
                            >
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="text-xs font-bold uppercase tracking-[0.15em] bg-primary/10 text-primary px-3 py-1.5"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recruiter */}
                <div className="border-t-2 border-base-300 pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                        Recruiter
                    </h3>
                    <div className="flex items-center gap-4">
                        <img
                            src={job.recruiter.avatar}
                            alt={job.recruiter.name}
                            className="w-12 h-12 object-cover"
                        />
                        <div>
                            <p className="font-bold">{job.recruiter.name}</p>
                            <p className="text-sm text-base-content/50">
                                {job.recruiter.agency}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Posted
                        </p>
                        <p className="font-bold">
                            {formatDate(job.postedDate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Deadline
                        </p>
                        <p className="font-bold">
                            {formatDate(job.deadline)}
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex gap-3">
                    <a
                        href="https://splits.network/sign-up"
                        className="btn btn-primary flex-1"
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane"></i>
                        Apply Now
                    </a>
                    <button className="btn btn-outline">
                        <i className="fa-duotone fa-regular fa-bookmark"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Page Component ──────────────────────────────────────────────────────── */

export default function ListsOnePage() {
    const mainRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterLevel, setFilterLevel] = useState<string>("all");

    // Filter jobs
    const filteredJobs = useMemo(() => {
        return mockJobs.filter((job) => {
            const matchesSearch =
                searchQuery === "" ||
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.location
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                job.tags.some((tag) =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase()),
                );
            const matchesType =
                filterType === "all" || job.type === filterType;
            const matchesStatus =
                filterStatus === "all" || job.status === filterStatus;
            const matchesLevel =
                filterLevel === "all" || job.experienceLevel === filterLevel;
            return matchesSearch && matchesType && matchesStatus && matchesLevel;
        });
    }, [searchQuery, filterType, filterStatus, filterLevel]);

    // View mode change with GSAP
    const changeView = useCallback(
        (newMode: ViewMode) => {
            if (newMode === viewMode) return;
            if (!contentRef.current) {
                setViewMode(newMode);
                return;
            }

            gsap.to(contentRef.current, {
                opacity: 0,
                y: 15,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    setViewMode(newMode);
                    setSelectedJob(null);
                    gsap.fromTo(
                        contentRef.current,
                        { opacity: 0, y: 15 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.35,
                            ease: "power3.out",
                        },
                    );
                },
            });
        },
        [viewMode],
    );

    // Select job with animation
    const selectJob = useCallback(
        (job: JobListing) => {
            setSelectedJob((prev) => (prev?.id === job.id ? null : job));
        },
        [],
    );

    // Hero animations
    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const $ = (sel: string) =>
                mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                mainRef.current!.querySelector(sel);

            // Hero entrance
            const heroTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            heroTl
                .fromTo(
                    $1(".hero-kicker"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                )
                .fromTo(
                    $(".hero-headline-word"),
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.12,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".hero-subtitle"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                )
                .fromTo(
                    $(".hero-stat"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.3",
                );

            // Controls bar
            gsap.fromTo(
                $1(".controls-bar"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power3.out",
                    delay: 0.8,
                },
            );

            // Content area
            gsap.fromTo(
                $1(".content-area"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    delay: 1,
                },
            );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden min-h-screen bg-base-100">
            {/* ═══════════════════════════════════════════════════════
                HERO — Compact split-screen header
               ═══════════════════════════════════════════════════════ */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-briefcase mr-2"></i>
                            Job Listings
                        </p>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                            <span className="hero-headline-word inline-block opacity-0">
                                Find your
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">
                                next
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0">
                                opportunity.
                            </span>
                        </h1>

                        <p className="hero-subtitle text-lg text-neutral-content/60 leading-relaxed max-w-xl mb-10 opacity-0">
                            Browse open roles from top companies. Transparent
                            splits, real communication, and a single connected
                            marketplace.
                        </p>

                        <div className="flex flex-wrap gap-8">
                            {[
                                {
                                    value: mockJobs.length.toString(),
                                    label: "Active Roles",
                                },
                                {
                                    value: mockJobs
                                        .filter((j) => j.featured)
                                        .length.toString(),
                                    label: "Featured",
                                },
                                {
                                    value: [
                                        ...new Set(
                                            mockJobs.map((j) => j.company),
                                        ),
                                    ].length.toString(),
                                    label: "Companies",
                                },
                                {
                                    value: mockJobs
                                        .filter((j) => j.type === "remote")
                                        .length.toString(),
                                    label: "Remote",
                                },
                            ].map((stat, i) => (
                                <div key={i} className="hero-stat opacity-0">
                                    <div className="text-2xl font-black tracking-tight text-primary">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider text-neutral-content/40">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Diagonal accent */}
                <div
                    className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block"
                    style={{
                        clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                ></div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                CONTROLS BAR — Search, Filters, View Toggle
               ═══════════════════════════════════════════════════════ */}
            <section className="controls-bar sticky top-0 z-30 bg-base-100 border-b-2 border-base-300 opacity-0">
                <div className="container mx-auto px-6 lg:px-12 py-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Search + Filters */}
                        <div className="flex flex-wrap gap-3 items-center flex-1">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <i className="fa-duotone fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm"></i>
                                <input
                                    type="text"
                                    placeholder="Search jobs, companies, skills..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="input input-bordered w-full pl-9 bg-base-200 border-base-300 text-sm font-medium focus:border-primary focus:outline-none"
                                />
                            </div>

                            {/* Type filter */}
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                            >
                                <option value="all">All Types</option>
                                <option value="full-time">Full-Time</option>
                                <option value="part-time">Part-Time</option>
                                <option value="contract">Contract</option>
                                <option value="remote">Remote</option>
                            </select>

                            {/* Status filter */}
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="filled">Filled</option>
                                <option value="pending">Pending</option>
                                <option value="closed">Closed</option>
                            </select>

                            {/* Level filter */}
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                            >
                                <option value="all">All Levels</option>
                                <option value="entry">Entry</option>
                                <option value="mid">Mid</option>
                                <option value="senior">Senior</option>
                                <option value="executive">Executive</option>
                            </select>
                        </div>

                        {/* View Toggle + Results count */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs uppercase tracking-wider text-base-content/40 font-bold">
                                {filteredJobs.length} results
                            </span>
                            <div className="flex bg-base-200 p-1">
                                <button
                                    onClick={() => changeView("table")}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        viewMode === "table"
                                            ? "bg-primary text-primary-content"
                                            : "text-base-content/50 hover:text-base-content"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-table-list mr-1"></i>
                                    Table
                                </button>
                                <button
                                    onClick={() => changeView("grid")}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-primary text-primary-content"
                                            : "text-base-content/50 hover:text-base-content"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-grid-2 mr-1"></i>
                                    Grid
                                </button>
                                <button
                                    onClick={() => changeView("gmail")}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        viewMode === "gmail"
                                            ? "bg-primary text-primary-content"
                                            : "text-base-content/50 hover:text-base-content"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-columns-3 mr-1"></i>
                                    Split
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                CONTENT AREA
               ═══════════════════════════════════════════════════════ */}
            <section className="content-area opacity-0">
                <div ref={contentRef}>
                    {filteredJobs.length === 0 ? (
                        <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block"></i>
                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                No jobs found
                            </h3>
                            <p className="text-base-content/50">
                                Try adjusting your search or filters.
                            </p>
                        </div>
                    ) : viewMode === "table" ? (
                        <TableView
                            jobs={filteredJobs}
                            selectedJob={selectedJob}
                            onSelect={selectJob}
                        />
                    ) : viewMode === "grid" ? (
                        <GridView
                            jobs={filteredJobs}
                            selectedJob={selectedJob}
                            onSelect={selectJob}
                        />
                    ) : (
                        <GmailView
                            jobs={filteredJobs}
                            selectedJob={selectedJob}
                            onSelect={selectJob}
                        />
                    )}
                </div>
            </section>
        </main>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function TableView({
    jobs,
    selectedJob,
    onSelect,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelect: (job: JobListing) => void;
}) {
    return (
        <div className="flex">
            {/* Table */}
            <div
                className={`flex-1 transition-all duration-300 ${
                    selectedJob ? "lg:w-[55%]" : "w-full"
                }`}
            >
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-200 border-b-2 border-base-300">
                                <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-6">
                                    Title
                                </th>
                                <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-4">
                                    Company
                                </th>
                                <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-4 hidden md:table-cell">
                                    Location
                                </th>
                                <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-4 hidden lg:table-cell">
                                    Salary
                                </th>
                                <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-4 hidden lg:table-cell">
                                    Status
                                </th>
                                <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-4 hidden xl:table-cell">
                                    Type
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr
                                    key={job.id}
                                    onClick={() => onSelect(job)}
                                    className={`cursor-pointer border-b border-base-200 hover:bg-base-200/50 transition-colors ${
                                        selectedJob?.id === job.id
                                            ? "bg-primary/5 border-l-4 border-l-primary"
                                            : ""
                                    }`}
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            {job.featured && (
                                                <i className="fa-duotone fa-regular fa-star text-primary text-xs flex-shrink-0"></i>
                                            )}
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">
                                                    {job.title}
                                                </p>
                                                <div className="flex gap-1 mt-1">
                                                    {job.tags
                                                        .slice(0, 2)
                                                        .map((tag, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/40 px-1.5 py-0.5"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-sm font-semibold">
                                            {job.company}
                                        </p>
                                    </td>
                                    <td className="py-4 px-4 hidden md:table-cell">
                                        <p className="text-sm text-base-content/60">
                                            {job.location}
                                        </p>
                                    </td>
                                    <td className="py-4 px-4 hidden lg:table-cell">
                                        <p className="text-sm font-bold tracking-tight">
                                            {formatSalary(job.salary)}
                                        </p>
                                    </td>
                                    <td className="py-4 px-4 hidden lg:table-cell">
                                        <span
                                            className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(job.status)}`}
                                        >
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 hidden xl:table-cell">
                                        <span className="text-sm text-base-content/50 capitalize">
                                            <i
                                                className={`${typeIcon(job.type)} mr-1`}
                                            ></i>
                                            {job.type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail sidebar */}
            {selectedJob && (
                <div className="hidden lg:block w-[45%] h-[calc(100vh-140px)] sticky top-[140px]">
                    <DetailPanel
                        job={selectedJob}
                        onClose={() => onSelect(selectedJob)}
                        variant="sidebar"
                    />
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GRID VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function GridView({
    jobs,
    selectedJob,
    onSelect,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelect: (job: JobListing) => void;
}) {
    return (
        <div className="flex">
            {/* Cards grid */}
            <div
                className={`flex-1 transition-all duration-300 ${
                    selectedJob ? "lg:w-[55%]" : "w-full"
                }`}
            >
                <div className="container mx-auto px-6 lg:px-12 py-8">
                    <div
                        className={`grid gap-4 ${
                            selectedJob
                                ? "grid-cols-1 md:grid-cols-2"
                                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                        }`}
                    >
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => onSelect(job)}
                                className={`group cursor-pointer bg-base-100 border-2 p-6 transition-all hover:border-primary/30 ${
                                    selectedJob?.id === job.id
                                        ? "border-primary border-l-4"
                                        : "border-base-300"
                                }`}
                            >
                                {/* Card header */}
                                <div className="flex items-start justify-between mb-4">
                                    <span
                                        className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(job.status)}`}
                                    >
                                        {job.status}
                                    </span>
                                    {job.featured && (
                                        <i className="fa-duotone fa-regular fa-star text-primary"></i>
                                    )}
                                </div>

                                {/* Title + Company */}
                                <h3 className="text-lg font-black tracking-tight leading-tight mb-1 group-hover:text-primary transition-colors">
                                    {job.title}
                                </h3>
                                <p className="text-sm font-semibold text-base-content/60 mb-3">
                                    {job.company}
                                </p>

                                {/* Meta row */}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/50 mb-4">
                                    <span>
                                        <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                        {job.location}
                                    </span>
                                    <span>
                                        <i
                                            className={`${typeIcon(job.type)} mr-1`}
                                        ></i>
                                        {job.type}
                                    </span>
                                    <span className="capitalize">
                                        <i className="fa-duotone fa-regular fa-signal mr-1"></i>
                                        {job.experienceLevel}
                                    </span>
                                </div>

                                {/* Salary */}
                                <p className="text-base font-black tracking-tight text-primary mb-4">
                                    {formatSalary(job.salary)}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    {job.tags.slice(0, 3).map((tag, i) => (
                                        <span
                                            key={i}
                                            className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {job.tags.length > 3 && (
                                        <span className="text-[9px] uppercase tracking-wider text-base-content/30 px-2 py-1">
                                            +{job.tags.length - 3}
                                        </span>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-200">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={job.recruiter.avatar}
                                            alt={job.recruiter.name}
                                            className="w-6 h-6 object-cover"
                                        />
                                        <span className="text-xs font-semibold text-base-content/50">
                                            {job.recruiter.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-base-content/30">
                                        <span>
                                            <i className="fa-duotone fa-regular fa-users mr-1"></i>
                                            {job.applicants}
                                        </span>
                                        <span>
                                            <i className="fa-duotone fa-regular fa-eye mr-1"></i>
                                            {job.views.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail sidebar */}
            {selectedJob && (
                <div className="hidden lg:block w-[45%] h-[calc(100vh-140px)] sticky top-[140px]">
                    <DetailPanel
                        job={selectedJob}
                        onClose={() => onSelect(selectedJob)}
                        variant="sidebar"
                    />
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GMAIL VIEW — List on left, detail on right
   ═══════════════════════════════════════════════════════════════════════════ */

function GmailView({
    jobs,
    selectedJob,
    onSelect,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelect: (job: JobListing) => void;
}) {
    const activeJob = selectedJob || jobs[0];

    return (
        <div className="flex h-[calc(100vh-140px)]">
            {/* Left list */}
            <div className="w-full lg:w-[40%] xl:w-[35%] border-r-2 border-base-300 overflow-y-auto">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        onClick={() => onSelect(job)}
                        className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors ${
                            activeJob?.id === job.id
                                ? "bg-primary/5 border-l-4 border-l-primary"
                                : ""
                        }`}
                    >
                        <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                {job.featured && (
                                    <i className="fa-duotone fa-regular fa-star text-primary text-xs flex-shrink-0"></i>
                                )}
                                <h3 className="font-bold text-sm tracking-tight truncate">
                                    {job.title}
                                </h3>
                            </div>
                            <span
                                className={`text-[9px] uppercase tracking-[0.15em] font-bold px-1.5 py-0.5 flex-shrink-0 ml-2 ${statusColor(job.status)}`}
                            >
                                {job.status}
                            </span>
                        </div>

                        <p className="text-xs font-semibold text-base-content/60 mb-1">
                            {job.company}
                        </p>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-base-content/40">
                                <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                {job.location}
                            </span>
                            <span className="text-xs font-bold text-primary">
                                {formatSalary(job.salary)}
                            </span>
                        </div>

                        <div className="flex gap-1 mt-2">
                            {job.tags.slice(0, 3).map((tag, i) => (
                                <span
                                    key={i}
                                    className="text-[8px] uppercase tracking-wider bg-base-200 text-base-content/40 px-1.5 py-0.5"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Right detail */}
            <div className="hidden lg:block flex-1 overflow-y-auto">
                {activeJob ? (
                    <DetailPanel
                        job={activeJob}
                        onClose={() => {}}
                        variant="split"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-base-content/30">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-4xl mb-4 block"></i>
                            <p className="text-sm font-bold uppercase tracking-wider">
                                Select a job to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
