"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

// ─── Constants ───────────────────────────────────────────────────────────────

type ViewMode = "table" | "grid" | "gmail";

const statusColors: Record<string, string> = {
    open: "text-[#22c55e]",
    filled: "text-[#14b8a6]",
    pending: "text-[#eab308]",
    closed: "text-[#ef4444]",
};

const levelLabels: Record<string, string> = {
    entry: "L1-ENTRY",
    mid: "L2-MID",
    senior: "L3-SENIOR",
    executive: "L4-EXEC",
};

function formatSalary(min: number, max: number, currency: string) {
    const fmt = (n: number) => {
        if (n >= 1000) return `${Math.round(n / 1000)}K`;
        return String(n);
    };
    return `${currency} ${fmt(min)}-${fmt(max)}`;
}

function daysAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "TODAY";
    if (days === 1) return "1D AGO";
    return `${days}D AGO`;
}

// ─── Detail Panel Component ─────────────────────────────────────────────────

function DetailPanel({
    job,
    onClose,
    inline,
}: {
    job: JobListing;
    onClose: () => void;
    inline?: boolean;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!panelRef.current) return;
            gsap.fromTo(
                panelRef.current,
                { opacity: 0, x: inline ? 0 : 30 },
                { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" },
            );
        },
        { scope: panelRef, dependencies: [job.id] },
    );

    return (
        <div
            ref={panelRef}
            className={`bg-[#0a0e17] border border-[#3b5ccc]/20 overflow-y-auto ${inline ? "h-full" : ""}`}
        >
            {/* Header */}
            <div className="p-6 border-b border-[#3b5ccc]/10">
                <div className="flex items-start justify-between mb-4">
                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                        {job.id.toUpperCase()} // DETAIL VIEW
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 border border-[#c8ccd4]/20 flex items-center justify-center text-[#c8ccd4]/40 hover:text-white hover:border-[#3b5ccc]/40 transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-xs"></i>
                    </button>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{job.title}</h2>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-mono text-xs text-[#3b5ccc]">
                        {job.company}
                    </span>
                    <span className="font-mono text-[10px] text-[#c8ccd4]/30">|</span>
                    <span className="font-mono text-xs text-[#c8ccd4]/50">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                        {job.location}
                    </span>
                    <span className="font-mono text-[10px] text-[#c8ccd4]/30">|</span>
                    <span className={`font-mono text-[10px] tracking-wider ${statusColors[job.status]}`}>
                        [{job.status.toUpperCase()}]
                    </span>
                </div>

                <div className="flex flex-wrap gap-3 font-mono text-[10px]">
                    <span className="text-[#14b8a6]">
                        {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                    </span>
                    <span className="text-[#c8ccd4]/30">|</span>
                    <span className="text-[#c8ccd4]/50">{job.type.toUpperCase()}</span>
                    <span className="text-[#c8ccd4]/30">|</span>
                    <span className="text-[#c8ccd4]/50">
                        {levelLabels[job.experienceLevel]}
                    </span>
                    {job.equity && (
                        <>
                            <span className="text-[#c8ccd4]/30">|</span>
                            <span className="text-[#3b5ccc]">EQUITY: {job.equity}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-px bg-[#3b5ccc]/10 border-b border-[#3b5ccc]/10">
                <div className="bg-[#0a0e17] p-4 text-center">
                    <div className="font-mono text-lg font-bold text-white">
                        {job.applicants}
                    </div>
                    <div className="font-mono text-[9px] text-[#3b5ccc]/60 tracking-widest">
                        APPLICANTS
                    </div>
                </div>
                <div className="bg-[#0a0e17] p-4 text-center">
                    <div className="font-mono text-lg font-bold text-white">
                        {job.views.toLocaleString()}
                    </div>
                    <div className="font-mono text-[9px] text-[#3b5ccc]/60 tracking-widest">
                        VIEWS
                    </div>
                </div>
                <div className="bg-[#0a0e17] p-4 text-center">
                    <div className="font-mono text-lg font-bold text-white">
                        {daysAgo(job.postedDate)}
                    </div>
                    <div className="font-mono text-[9px] text-[#3b5ccc]/60 tracking-widest">
                        POSTED
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="p-6 border-b border-[#3b5ccc]/10">
                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-3">
                    // DESCRIPTION
                </div>
                <p className="text-sm text-[#c8ccd4]/60 leading-relaxed">
                    {job.description}
                </p>
            </div>

            {/* Requirements */}
            <div className="p-6 border-b border-[#3b5ccc]/10">
                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-3">
                    // REQUIREMENTS
                </div>
                <div className="space-y-2">
                    {job.requirements.map((req) => (
                        <div key={req} className="flex items-start gap-2 text-sm">
                            <span className="font-mono text-[#3b5ccc]/60 text-xs mt-0.5">
                                &gt;
                            </span>
                            <span className="text-[#c8ccd4]/60">{req}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Responsibilities */}
            <div className="p-6 border-b border-[#3b5ccc]/10">
                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-3">
                    // RESPONSIBILITIES
                </div>
                <div className="space-y-2">
                    {job.responsibilities.map((resp) => (
                        <div key={resp} className="flex items-start gap-2 text-sm">
                            <span className="font-mono text-[#3b5ccc]/60 text-xs mt-0.5">
                                --
                            </span>
                            <span className="text-[#c8ccd4]/60">{resp}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits */}
            <div className="p-6 border-b border-[#3b5ccc]/10">
                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-3">
                    // BENEFITS
                </div>
                <div className="flex flex-wrap gap-2">
                    {job.benefits.map((b) => (
                        <span
                            key={b}
                            className="px-3 py-1 border border-[#14b8a6]/20 text-[#14b8a6]/70 font-mono text-[10px] tracking-wider"
                        >
                            {b}
                        </span>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div className="p-6 border-b border-[#3b5ccc]/10">
                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-3">
                    // TAGS
                </div>
                <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1 border border-[#3b5ccc]/20 text-[#3b5ccc]/70 font-mono text-[10px] tracking-wider"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Recruiter */}
            <div className="p-6">
                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-3">
                    // ASSIGNED RECRUITER
                </div>
                <div className="flex items-center gap-3">
                    <img
                        src={job.recruiter.avatar}
                        alt={job.recruiter.name}
                        className="w-10 h-10 object-cover border border-[#3b5ccc]/30"
                    />
                    <div>
                        <div className="font-mono text-sm text-white">
                            {job.recruiter.name}
                        </div>
                        <div className="font-mono text-[10px] text-[#c8ccd4]/40">
                            {job.recruiter.agency}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ListsSevenPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const filteredJobs = mockJobs.filter((job) => {
        const matchesSearch =
            !searchQuery ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.tags.some((t) =>
                t.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        const matchesStatus =
            statusFilter === "all" || job.status === statusFilter;
        const matchesType = typeFilter === "all" || job.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Animate view transitions
    useEffect(() => {
        if (!contentRef.current) return;
        gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" },
        );
    }, [viewMode]);

    const handleSelectJob = useCallback(
        (job: JobListing) => {
            setSelectedJob(selectedJob?.id === job.id ? null : job);
        },
        [selectedJob],
    );

    // Boot animation
    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(
                ".bp-header-ref",
                { opacity: 0 },
                { opacity: 1, duration: 0.25 },
            );
            tl.fromTo(
                ".bp-page-title",
                { opacity: 0, clipPath: "inset(0 100% 0 0)" },
                { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 },
                "-=0.1",
            );
            tl.fromTo(
                ".bp-controls-bar",
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.4 },
                "-=0.3",
            );
            tl.fromTo(
                ".bp-content-area",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
                "-=0.2",
            );
            gsap.to(".bp-pulse-dot", {
                opacity: 0.3,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image:
                        linear-gradient(
                            rgba(59, 92, 204, 0.3) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            90deg,
                            rgba(59, 92, 204, 0.3) 1px,
                            transparent 1px
                        );
                    background-size: 60px 60px;
                }
                .bp-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .bp-scrollbar::-webkit-scrollbar-track {
                    background: #0a0e17;
                }
                .bp-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(59, 92, 204, 0.3);
                }
                .bp-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(59, 92, 204, 0.5);
                }
            `}</style>

            <div
                ref={containerRef}
                className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative"
            >
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                {/* ─── Page Header ─────────────────────────────────────── */}
                <header className="relative z-10 border-b border-[#3b5ccc]/10">
                    <div className="container mx-auto px-4 py-6">
                        {/* Top refs */}
                        <div className="bp-header-ref flex justify-between items-center mb-6 opacity-0">
                            <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                                REF: SN-LIST07-2026
                            </div>
                            <div className="flex items-center gap-4 font-mono text-[10px] text-[#c8ccd4]/30">
                                <span>
                                    RECORDS: {filteredJobs.length}/{mockJobs.length}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                                    LIVE
                                </span>
                            </div>
                        </div>

                        <h1 className="bp-page-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                            Job Listings{" "}
                            <span className="text-[#3b5ccc]">Database</span>
                        </h1>
                        <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mb-6">
                            // ACTIVE ROLE REGISTRY
                        </p>

                        {/* ─── Controls Bar ───────────────────────────────── */}
                        <div className="bp-controls-bar flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between opacity-0">
                            {/* Search + Filters */}
                            <div className="flex flex-wrap gap-3 items-center">
                                {/* Search */}
                                <div className="relative">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#3b5ccc]/40 text-xs"></i>
                                    <input
                                        type="text"
                                        placeholder="SEARCH_QUERY..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-[#0d1220] border border-[#3b5ccc]/20 text-[#c8ccd4] font-mono text-xs pl-9 pr-4 py-2.5 w-64 focus:outline-none focus:border-[#3b5ccc]/50 placeholder:text-[#c8ccd4]/20 tracking-wider"
                                    />
                                </div>

                                {/* Status filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-[#0d1220] border border-[#3b5ccc]/20 text-[#c8ccd4] font-mono text-xs px-3 py-2.5 focus:outline-none focus:border-[#3b5ccc]/50 appearance-none cursor-pointer tracking-wider"
                                >
                                    <option value="all">STATUS: ALL</option>
                                    <option value="open">STATUS: OPEN</option>
                                    <option value="filled">STATUS: FILLED</option>
                                    <option value="pending">STATUS: PENDING</option>
                                    <option value="closed">STATUS: CLOSED</option>
                                </select>

                                {/* Type filter */}
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="bg-[#0d1220] border border-[#3b5ccc]/20 text-[#c8ccd4] font-mono text-xs px-3 py-2.5 focus:outline-none focus:border-[#3b5ccc]/50 appearance-none cursor-pointer tracking-wider"
                                >
                                    <option value="all">TYPE: ALL</option>
                                    <option value="full-time">TYPE: FULL-TIME</option>
                                    <option value="part-time">TYPE: PART-TIME</option>
                                    <option value="contract">TYPE: CONTRACT</option>
                                    <option value="remote">TYPE: REMOTE</option>
                                </select>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-px bg-[#3b5ccc]/10">
                                <button
                                    onClick={() => {
                                        setViewMode("table");
                                        setSelectedJob(null);
                                    }}
                                    className={`px-4 py-2.5 font-mono text-[10px] tracking-widest flex items-center gap-2 transition-colors ${
                                        viewMode === "table"
                                            ? "bg-[#3b5ccc] text-white"
                                            : "bg-[#0d1220] text-[#c8ccd4]/50 hover:text-[#c8ccd4]"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-table-list"></i>
                                    TABLE
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode("grid");
                                        setSelectedJob(null);
                                    }}
                                    className={`px-4 py-2.5 font-mono text-[10px] tracking-widest flex items-center gap-2 transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-[#3b5ccc] text-white"
                                            : "bg-[#0d1220] text-[#c8ccd4]/50 hover:text-[#c8ccd4]"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-grid-2"></i>
                                    GRID
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode("gmail");
                                        setSelectedJob(null);
                                    }}
                                    className={`px-4 py-2.5 font-mono text-[10px] tracking-widest flex items-center gap-2 transition-colors ${
                                        viewMode === "gmail"
                                            ? "bg-[#3b5ccc] text-white"
                                            : "bg-[#0d1220] text-[#c8ccd4]/50 hover:text-[#c8ccd4]"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-columns-3"></i>
                                    SPLIT
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ─── Content Area ────────────────────────────────────── */}
                <div
                    ref={contentRef}
                    className="bp-content-area relative z-10 opacity-0"
                >
                    {/* ══════ TABLE VIEW ══════ */}
                    {viewMode === "table" && (
                        <div className="container mx-auto px-4 py-6">
                            <div className="border border-[#3b5ccc]/20 overflow-x-auto">
                                {/* Table Header */}
                                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px_80px] gap-px bg-[#3b5ccc]/10 font-mono text-[10px] tracking-[0.15em] text-[#3b5ccc]/60 uppercase min-w-[800px]">
                                    <div className="bg-[#0d1220] px-4 py-3">
                                        TITLE / COMPANY
                                    </div>
                                    <div className="bg-[#0d1220] px-4 py-3">
                                        LOCATION
                                    </div>
                                    <div className="bg-[#0d1220] px-4 py-3">
                                        SALARY
                                    </div>
                                    <div className="bg-[#0d1220] px-4 py-3">
                                        TYPE / LEVEL
                                    </div>
                                    <div className="bg-[#0d1220] px-4 py-3">
                                        STATUS
                                    </div>
                                    <div className="bg-[#0d1220] px-4 py-3">
                                        POSTED
                                    </div>
                                </div>

                                {/* Table Rows */}
                                {filteredJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => handleSelectJob(job)}
                                        className={`grid grid-cols-[2fr_1fr_1fr_1fr_80px_80px] gap-px bg-[#3b5ccc]/10 cursor-pointer group min-w-[800px] ${
                                            selectedJob?.id === job.id
                                                ? "ring-1 ring-[#3b5ccc]/40"
                                                : ""
                                        }`}
                                    >
                                        <div className="bg-[#0a0e17] px-4 py-4 group-hover:bg-[#0d1220] transition-colors">
                                            <div className="flex items-center gap-2">
                                                {job.featured && (
                                                    <span className="font-mono text-[8px] text-[#eab308] tracking-widest">
                                                        [FT]
                                                    </span>
                                                )}
                                                <span className="text-sm text-white font-medium">
                                                    {job.title}
                                                </span>
                                            </div>
                                            <span className="font-mono text-[10px] text-[#3b5ccc]/60">
                                                {job.company}
                                            </span>
                                        </div>
                                        <div className="bg-[#0a0e17] px-4 py-4 text-xs text-[#c8ccd4]/50 font-mono group-hover:bg-[#0d1220] transition-colors flex items-center">
                                            {job.location}
                                        </div>
                                        <div className="bg-[#0a0e17] px-4 py-4 font-mono text-xs text-[#14b8a6] group-hover:bg-[#0d1220] transition-colors flex items-center">
                                            {formatSalary(
                                                job.salary.min,
                                                job.salary.max,
                                                job.salary.currency,
                                            )}
                                        </div>
                                        <div className="bg-[#0a0e17] px-4 py-4 group-hover:bg-[#0d1220] transition-colors flex items-center">
                                            <div>
                                                <div className="font-mono text-[10px] text-[#c8ccd4]/50 tracking-wider">
                                                    {job.type.toUpperCase()}
                                                </div>
                                                <div className="font-mono text-[10px] text-[#c8ccd4]/30">
                                                    {levelLabels[job.experienceLevel]}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[#0a0e17] px-4 py-4 group-hover:bg-[#0d1220] transition-colors flex items-center">
                                            <span
                                                className={`font-mono text-[10px] tracking-wider ${statusColors[job.status]}`}
                                            >
                                                [{job.status.toUpperCase()}]
                                            </span>
                                        </div>
                                        <div className="bg-[#0a0e17] px-4 py-4 font-mono text-[10px] text-[#c8ccd4]/30 group-hover:bg-[#0d1220] transition-colors flex items-center">
                                            {daysAgo(job.postedDate)}
                                        </div>
                                    </div>
                                ))}

                                {filteredJobs.length === 0 && (
                                    <div className="bg-[#0a0e17] p-12 text-center">
                                        <div className="font-mono text-xs text-[#c8ccd4]/30 tracking-widest">
                                            // NO RECORDS MATCH QUERY
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Detail panel below table */}
                            {selectedJob && (
                                <div className="mt-6">
                                    <DetailPanel
                                        job={selectedJob}
                                        onClose={() => setSelectedJob(null)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════ GRID VIEW ══════ */}
                    {viewMode === "grid" && (
                        <div className="container mx-auto px-4 py-6">
                            <div className="flex gap-6">
                                {/* Cards grid */}
                                <div
                                    className={`grid gap-px bg-[#3b5ccc]/10 ${
                                        selectedJob
                                            ? "grid-cols-1 md:grid-cols-2 w-1/2 lg:w-3/5"
                                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full"
                                    }`}
                                >
                                    {filteredJobs.map((job) => (
                                        <div
                                            key={job.id}
                                            onClick={() => handleSelectJob(job)}
                                            className={`bg-[#0a0e17] p-6 cursor-pointer group relative transition-colors ${
                                                selectedJob?.id === job.id
                                                    ? "ring-1 ring-[#3b5ccc]/40"
                                                    : "hover:bg-[#0d1220]"
                                            }`}
                                        >
                                            {/* ID + Status */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                                                    {job.id.toUpperCase()}
                                                </span>
                                                <span
                                                    className={`font-mono text-[10px] tracking-wider ${statusColors[job.status]}`}
                                                >
                                                    [{job.status.toUpperCase()}]
                                                </span>
                                            </div>

                                            {/* Title + Company */}
                                            <h3 className="text-sm font-bold text-white mb-1">
                                                {job.featured && (
                                                    <i className="fa-duotone fa-regular fa-star text-[#eab308] text-[10px] mr-1.5"></i>
                                                )}
                                                {job.title}
                                            </h3>
                                            <div className="font-mono text-[10px] text-[#3b5ccc]/60 mb-3">
                                                {job.company}
                                            </div>

                                            {/* Location + Salary */}
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] mb-3">
                                                <span className="text-[#c8ccd4]/50">
                                                    <i className="fa-duotone fa-regular fa-location-dot mr-1 text-[#3b5ccc]/40"></i>
                                                    {job.location}
                                                </span>
                                                <span className="text-[#14b8a6]">
                                                    {formatSalary(
                                                        job.salary.min,
                                                        job.salary.max,
                                                        job.salary.currency,
                                                    )}
                                                </span>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {job.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 border border-[#3b5ccc]/15 text-[#c8ccd4]/40 font-mono text-[9px] tracking-wider"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {job.tags.length > 3 && (
                                                    <span className="px-2 py-0.5 text-[#3b5ccc]/40 font-mono text-[9px]">
                                                        +{job.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Hover bar */}
                                            <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                        </div>
                                    ))}

                                    {filteredJobs.length === 0 && (
                                        <div className="bg-[#0a0e17] p-12 text-center col-span-full">
                                            <div className="font-mono text-xs text-[#c8ccd4]/30 tracking-widest">
                                                // NO RECORDS MATCH QUERY
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar detail panel */}
                                {selectedJob && (
                                    <div className="hidden md:block w-1/2 lg:w-2/5 sticky top-0 h-[calc(100vh-200px)] bp-scrollbar overflow-y-auto">
                                        <DetailPanel
                                            job={selectedJob}
                                            onClose={() => setSelectedJob(null)}
                                            inline
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══════ GMAIL / SPLIT VIEW ══════ */}
                    {viewMode === "gmail" && (
                        <div className="flex h-[calc(100vh-200px)]">
                            {/* Left list */}
                            <div
                                className={`border-r border-[#3b5ccc]/10 overflow-y-auto bp-scrollbar ${
                                    selectedJob ? "w-2/5" : "w-full"
                                }`}
                            >
                                {filteredJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={`px-5 py-4 border-b border-[#3b5ccc]/10 cursor-pointer group transition-colors ${
                                            selectedJob?.id === job.id
                                                ? "bg-[#0d1220] border-l-2 border-l-[#3b5ccc]"
                                                : "hover:bg-[#0d1220]/50 border-l-2 border-l-transparent"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {job.featured && (
                                                    <i className="fa-duotone fa-regular fa-star text-[#eab308] text-[8px] flex-shrink-0"></i>
                                                )}
                                                <span className="text-sm text-white font-medium truncate">
                                                    {job.title}
                                                </span>
                                            </div>
                                            <span
                                                className={`font-mono text-[9px] tracking-wider flex-shrink-0 ml-2 ${statusColors[job.status]}`}
                                            >
                                                [{job.status.toUpperCase()}]
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-[10px] text-[#3b5ccc]/60">
                                                {job.company}
                                            </span>
                                            <span className="font-mono text-[10px] text-[#c8ccd4]/20">
                                                |
                                            </span>
                                            <span className="font-mono text-[10px] text-[#c8ccd4]/40 truncate">
                                                {job.location}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-[10px] text-[#14b8a6]">
                                                {formatSalary(
                                                    job.salary.min,
                                                    job.salary.max,
                                                    job.salary.currency,
                                                )}
                                            </span>
                                            <span className="font-mono text-[9px] text-[#c8ccd4]/20">
                                                {daysAgo(job.postedDate)}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {filteredJobs.length === 0 && (
                                    <div className="p-12 text-center">
                                        <div className="font-mono text-xs text-[#c8ccd4]/30 tracking-widest">
                                            // NO RECORDS MATCH QUERY
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right detail panel */}
                            {selectedJob ? (
                                <div className="w-3/5 overflow-y-auto bp-scrollbar">
                                    <DetailPanel
                                        job={selectedJob}
                                        onClose={() => setSelectedJob(null)}
                                        inline
                                    />
                                </div>
                            ) : (
                                <div className="w-3/5 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 border border-[#3b5ccc]/20 flex items-center justify-center mx-auto mb-4">
                                            <i className="fa-duotone fa-regular fa-arrow-left text-[#3b5ccc]/30 text-xl"></i>
                                        </div>
                                        <div className="font-mono text-xs text-[#c8ccd4]/30 tracking-widest">
                                            // SELECT A RECORD TO VIEW
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── Footer Status Bar ───────────────────────────────── */}
                <footer className="relative z-10 border-t border-[#3b5ccc]/10">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between font-mono text-[10px] text-[#c8ccd4]/30">
                        <div className="flex items-center gap-4">
                            <span>
                                VIEW: {viewMode.toUpperCase()}
                            </span>
                            <span>
                                SHOWING: {filteredJobs.length} OF {mockJobs.length}
                            </span>
                            {selectedJob && (
                                <span className="text-[#3b5ccc]/60">
                                    SELECTED: {selectedJob.id.toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="tracking-widest">
                            EMPLOYMENT NETWORKS INC. // 2026
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
