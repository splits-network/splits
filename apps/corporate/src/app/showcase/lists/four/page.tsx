"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

/* ─── View Modes ──────────────────────────────────────────────────────────── */
type ViewMode = "table" | "grid" | "gmail";

/* ─── Sidebar Nav Items ───────────────────────────────────────────────────── */
const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-duotone fa-regular fa-grid-2" },
    { id: "roles", label: "Roles", icon: "fa-duotone fa-regular fa-briefcase" },
    { id: "recruiters", label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie" },
    { id: "candidates", label: "Candidates", icon: "fa-duotone fa-regular fa-users" },
    { id: "companies", label: "Companies", icon: "fa-duotone fa-regular fa-building" },
    { id: "applications", label: "Applications", icon: "fa-duotone fa-regular fa-file-lines" },
    { id: "messages", label: "Messages", icon: "fa-duotone fa-regular fa-comments" },
    { id: "placements", label: "Placements", icon: "fa-duotone fa-regular fa-handshake" },
];

const ACTIVE_NAV = "roles";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function formatSalary(salary: JobListing["salary"]) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: salary.currency,
            maximumFractionDigits: 0,
        }).format(n);
    return `${fmt(salary.min)} - ${fmt(salary.max)}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function statusColor(status: JobListing["status"]) {
    switch (status) {
        case "open":
            return "badge-success";
        case "filled":
            return "badge-error";
        case "pending":
            return "badge-warning";
        case "closed":
            return "badge-neutral";
    }
}

function typeIcon(type: JobListing["type"]) {
    switch (type) {
        case "full-time":
            return "fa-duotone fa-regular fa-briefcase";
        case "part-time":
            return "fa-duotone fa-regular fa-clock";
        case "contract":
            return "fa-duotone fa-regular fa-file-contract";
        case "remote":
            return "fa-duotone fa-regular fa-wifi";
    }
}

/* ─── Sidebar Navigation ──────────────────────────────────────────────────── */
function SidebarNav({ onClose }: { onClose?: () => void }) {
    return (
        <nav className="flex flex-col h-full bg-neutral text-white">
            {/* Brand */}
            <div className="px-5 py-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-split text-primary-content text-sm" />
                        </div>
                        <div>
                            <div className="font-black text-sm tracking-tight leading-none">
                                Splits
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mt-0.5">
                                Network
                            </div>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="lg:hidden btn btn-ghost btn-sm btn-square text-white/50 hover:text-white"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    )}
                </div>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold px-3 mb-3">
                    Navigation
                </div>
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.id === ACTIVE_NAV;
                        return (
                            <li key={item.id}>
                                <button
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                        isActive
                                            ? "bg-primary text-primary-content shadow-sm"
                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    <i
                                        className={`${item.icon} w-5 text-center ${
                                            isActive ? "" : "opacity-60"
                                        }`}
                                    />
                                    {item.label}
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-content/50" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-user text-white/50 text-xs" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white/70 truncate">
                            Demo User
                        </div>
                        <div className="text-[10px] text-white/30 truncate">
                            demo@splits.network
                        </div>
                    </div>
                    <button className="text-white/30 hover:text-white/60 transition-colors">
                        <i className="fa-duotone fa-regular fa-ellipsis-vertical text-sm" />
                    </button>
                </div>
            </div>
        </nav>
    );
}

/* ─── Detail Panel (shared between Grid + Gmail) ──────────────────────────── */
function DetailPanel({
    job,
    onClose,
    showClose,
}: {
    job: JobListing;
    onClose?: () => void;
    showClose?: boolean;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (panelRef.current) {
            gsap.fromTo(
                panelRef.current,
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" },
            );
        }
    }, [job.id]);

    return (
        <div ref={panelRef} className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b border-base-content/5 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className={`badge badge-sm ${statusColor(job.status)} font-semibold uppercase tracking-wider`}
                            >
                                {job.status}
                            </span>
                            {job.featured && (
                                <span className="badge badge-sm badge-primary font-semibold">
                                    <i className="fa-duotone fa-regular fa-star mr-1" />
                                    Featured
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-black leading-tight">
                            {job.title}
                        </h2>
                        <p className="text-base-content/50 font-medium mt-1">
                            {job.company}
                        </p>
                    </div>
                    {showClose && onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm btn-square shrink-0"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-8">
                {/* Quick Info Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-base-content/40 font-semibold mb-1">
                            Location
                        </div>
                        <div className="font-bold text-sm flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-location-dot text-primary" />
                            {job.location}
                        </div>
                    </div>
                    <div className="bg-base-200 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-base-content/40 font-semibold mb-1">
                            Salary
                        </div>
                        <div className="font-bold text-sm flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-money-bill-wave text-primary" />
                            {formatSalary(job.salary)}
                        </div>
                    </div>
                    <div className="bg-base-200 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-base-content/40 font-semibold mb-1">
                            Type
                        </div>
                        <div className="font-bold text-sm flex items-center gap-2 capitalize">
                            <i className={`${typeIcon(job.type)} text-primary`} />
                            {job.type}
                        </div>
                    </div>
                    <div className="bg-base-200 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-base-content/40 font-semibold mb-1">
                            Level
                        </div>
                        <div className="font-bold text-sm flex items-center gap-2 capitalize">
                            <i className="fa-duotone fa-regular fa-chart-simple text-primary" />
                            {job.experienceLevel}
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-6 text-sm text-base-content/50">
                    <span className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-users text-primary" />
                        <strong className="text-base-content">{job.applicants}</strong>{" "}
                        applicants
                    </span>
                    <span className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-eye text-primary" />
                        <strong className="text-base-content">
                            {job.views.toLocaleString()}
                        </strong>{" "}
                        views
                    </span>
                    <span className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-calendar text-primary" />
                        {formatDate(job.postedDate)}
                    </span>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
                        Description
                    </h3>
                    <p className="text-base-content/70 leading-relaxed">
                        {job.description}
                    </p>
                </div>

                {/* Requirements */}
                <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
                        Requirements
                    </h3>
                    <ul className="space-y-2">
                        {job.requirements.map((req, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 text-sm text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                {req}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Responsibilities */}
                <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
                        Responsibilities
                    </h3>
                    <ul className="space-y-2">
                        {job.responsibilities.map((resp, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 text-sm text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right text-primary/50 mt-0.5 shrink-0" />
                                {resp}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Benefits */}
                <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
                        Benefits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {job.benefits.map((b, i) => (
                            <span
                                key={i}
                                className="badge badge-lg bg-primary/10 text-primary border-0 font-medium"
                            >
                                {b}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
                        Skills & Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="badge bg-base-200 border-base-content/10 font-medium text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Equity */}
                {job.equity && (
                    <div className="bg-base-200 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-base-content/40 font-semibold mb-1">
                            Equity Range
                        </div>
                        <div className="font-bold flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-chart-pie text-primary" />
                            {job.equity}
                        </div>
                    </div>
                )}

                {/* Recruiter */}
                <div className="border-t border-base-content/5 pt-6">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                        Recruiter
                    </h3>
                    <div className="flex items-center gap-4">
                        <img
                            src={job.recruiter.avatar}
                            alt={job.recruiter.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                        />
                        <div>
                            <div className="font-bold">{job.recruiter.name}</div>
                            <div className="text-sm text-base-content/50">
                                {job.recruiter.agency}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deadline */}
                <div className="bg-neutral text-white rounded-xl p-5 text-center">
                    <div className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-1">
                        Application Deadline
                    </div>
                    <div className="text-lg font-black">
                        {formatDate(job.deadline)}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function ListsFourPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    /* ── Filtering ── */
    const filteredJobs = mockJobs.filter((job) => {
        const matchesSearch =
            searchQuery === "" ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.tags.some((t) =>
                t.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        const matchesType = filterType === "all" || job.type === filterType;
        const matchesStatus =
            filterStatus === "all" || job.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    /* ── View Transition Animation ── */
    useEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
            );
        }
    }, [viewMode]);

    /* ── Auto-select first job in gmail mode ── */
    useEffect(() => {
        if (viewMode === "gmail" && !selectedJob && filteredJobs.length > 0) {
            setSelectedJob(filteredJobs[0]);
        }
    }, [viewMode, selectedJob, filteredJobs]);

    /* ── Stagger list items on filter change ── */
    useEffect(() => {
        if (!contentRef.current) return;
        const items = contentRef.current.querySelectorAll(".cin-list-item");
        if (items.length) {
            gsap.fromTo(
                items,
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    stagger: 0.03,
                    ease: "power2.out",
                },
            );
        }
    }, [filteredJobs.length, viewMode, searchQuery, filterType, filterStatus]);

    const handleSelectJob = useCallback((job: JobListing) => {
        setSelectedJob(job);
    }, []);

    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-base-100 flex">
            {/* ══════════════════════════════════════════════════════════════
                SIDEBAR — Desktop (persistent) + Mobile (overlay)
               ══════════════════════════════════════════════════════════════ */}

            {/* Desktop Sidebar — always visible on lg+ */}
            <aside className="hidden lg:flex w-[240px] shrink-0 h-screen sticky top-0 z-40">
                <SidebarNav />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="relative w-[260px] h-full shadow-2xl animate-[slideInLeft_0.25s_ease-out]">
                        <SidebarNav onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MAIN CONTENT
               ══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* ── HEADER ── */}
                <header className="bg-neutral text-white">
                    <div className="px-6 py-10 lg:py-12">
                        <div className="flex items-start gap-4">
                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden mt-1 btn btn-ghost btn-sm btn-square text-white/50 hover:text-white -ml-2"
                            >
                                <i className="fa-duotone fa-regular fa-bars text-lg" />
                            </button>
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] font-medium text-primary mb-3">
                                    Cinematic Editorial
                                </p>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-3">
                                    Job <span className="text-primary">Listings</span>
                                </h1>
                                <p className="text-base text-white/50 max-w-xl leading-relaxed">
                                    Explore open positions from top companies. Three view
                                    modes to browse exactly how you prefer.
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── CONTROLS ── */}
                <div className="sticky top-0 z-30 bg-base-100 border-b border-base-content/5 shadow-sm">
                    <div className="px-6 py-4">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            {/* Search & Filters */}
                            <div className="flex flex-wrap gap-3 items-center flex-1">
                                {/* Search */}
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                                    <input
                                        type="text"
                                        placeholder="Search jobs, companies, skills..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="input input-bordered w-full pl-10 bg-base-200 border-base-content/10 focus:border-primary focus:outline-none"
                                    />
                                </div>

                                {/* Type Filter */}
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="select select-bordered bg-base-200 border-base-content/10 focus:border-primary font-medium"
                                >
                                    <option value="all">All Types</option>
                                    <option value="full-time">Full-Time</option>
                                    <option value="part-time">Part-Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="remote">Remote</option>
                                </select>

                                {/* Status Filter */}
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="select select-bordered bg-base-200 border-base-content/10 focus:border-primary font-medium"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="filled">Filled</option>
                                    <option value="pending">Pending</option>
                                    <option value="closed">Closed</option>
                                </select>

                                {/* Result Count */}
                                <span className="text-sm text-base-content/40 font-medium whitespace-nowrap">
                                    {filteredJobs.length} result
                                    {filteredJobs.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex bg-base-200 rounded-xl p-1 shrink-0">
                                <button
                                    onClick={() => {
                                        setViewMode("table");
                                        setSelectedJob(null);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                        viewMode === "table"
                                            ? "bg-primary text-primary-content shadow-sm"
                                            : "text-base-content/50 hover:text-base-content"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-table" />
                                    Table
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode("grid");
                                        setSelectedJob(null);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                        viewMode === "grid"
                                            ? "bg-primary text-primary-content shadow-sm"
                                            : "text-base-content/50 hover:text-base-content"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-grid-2" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode("gmail")}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                        viewMode === "gmail"
                                            ? "bg-primary text-primary-content shadow-sm"
                                            : "text-base-content/50 hover:text-base-content"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-table-columns" />
                                    Split
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CONTENT AREA ── */}
                <div ref={contentRef} className="flex-1">
                    {filteredJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <i className="fa-duotone fa-regular fa-ghost text-6xl text-base-content/10 mb-6" />
                            <h3 className="text-2xl font-black mb-2">
                                No jobs found
                            </h3>
                            <p className="text-base-content/50 max-w-md">
                                Try adjusting your search query or filters to find what
                                you are looking for.
                            </p>
                        </div>
                    ) : viewMode === "table" ? (
                        /* ═══════════ TABLE VIEW ═══════════ */
                        <div className="px-6 py-6">
                            <div className="overflow-x-auto rounded-xl border border-base-content/5">
                                <table className="table w-full">
                                    <thead>
                                        <tr className="bg-base-200">
                                            <th className="text-xs uppercase tracking-wider text-base-content/40 font-semibold py-4">
                                                Position
                                            </th>
                                            <th className="text-xs uppercase tracking-wider text-base-content/40 font-semibold py-4">
                                                Company
                                            </th>
                                            <th className="text-xs uppercase tracking-wider text-base-content/40 font-semibold py-4">
                                                Location
                                            </th>
                                            <th className="text-xs uppercase tracking-wider text-base-content/40 font-semibold py-4">
                                                Salary
                                            </th>
                                            <th className="text-xs uppercase tracking-wider text-base-content/40 font-semibold py-4">
                                                Type
                                            </th>
                                            <th className="text-xs uppercase tracking-wider text-base-content/40 font-semibold py-4">
                                                Status
                                            </th>
                                            <th className="text-xs uppercase tracking-wider text-base-content/40 font-semibold py-4 text-right">
                                                Applicants
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredJobs.map((job) => (
                                            <tr
                                                key={job.id}
                                                className="cin-list-item hover:bg-base-200/50 cursor-pointer transition-colors border-b border-base-content/5 last:border-0"
                                                onClick={() =>
                                                    setSelectedJob(
                                                        selectedJob?.id === job.id
                                                            ? null
                                                            : job,
                                                    )
                                                }
                                            >
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        {job.featured && (
                                                            <i className="fa-duotone fa-regular fa-star text-primary text-xs" />
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-sm">
                                                                {job.title}
                                                            </div>
                                                            <div className="text-xs text-base-content/40 mt-0.5">
                                                                {job.department}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 font-medium text-sm">
                                                    {job.company}
                                                </td>
                                                <td className="py-4 text-sm text-base-content/60">
                                                    {job.location}
                                                </td>
                                                <td className="py-4 text-sm font-semibold">
                                                    {formatSalary(job.salary)}
                                                </td>
                                                <td className="py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-sm text-base-content/60 capitalize">
                                                        <i
                                                            className={`${typeIcon(job.type)} text-xs text-primary`}
                                                        />
                                                        {job.type}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <span
                                                        className={`badge badge-sm ${statusColor(job.status)} font-semibold uppercase tracking-wider`}
                                                    >
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right text-sm text-base-content/50">
                                                    {job.applicants}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Row Detail Expand */}
                            {selectedJob && (
                                <div className="mt-6 border border-base-content/5 rounded-xl bg-base-100 shadow-lg overflow-hidden">
                                    <DetailPanel
                                        job={selectedJob}
                                        onClose={() => setSelectedJob(null)}
                                        showClose
                                    />
                                </div>
                            )}
                        </div>
                    ) : viewMode === "grid" ? (
                        /* ═══════════ GRID VIEW + SIDEBAR ═══════════ */
                        <div className="px-6 py-6">
                            <div className="flex gap-6">
                                {/* Cards Grid */}
                                <div
                                    className={`grid gap-4 transition-all duration-300 ${
                                        selectedJob
                                            ? "grid-cols-1 sm:grid-cols-2 flex-1"
                                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full"
                                    }`}
                                >
                                    {filteredJobs.map((job) => (
                                        <div
                                            key={job.id}
                                            onClick={() => handleSelectJob(job)}
                                            className={`cin-list-item group cursor-pointer rounded-xl border transition-all duration-200 p-5 ${
                                                selectedJob?.id === job.id
                                                    ? "border-primary bg-primary/5 shadow-lg"
                                                    : "border-base-content/5 bg-base-100 hover:border-primary/30 hover:shadow-md"
                                            }`}
                                        >
                                            {/* Card Header */}
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <span
                                                    className={`badge badge-sm ${statusColor(job.status)} font-semibold uppercase tracking-wider`}
                                                >
                                                    {job.status}
                                                </span>
                                                {job.featured && (
                                                    <i className="fa-duotone fa-regular fa-star text-primary text-sm" />
                                                )}
                                            </div>

                                            {/* Title & Company */}
                                            <h3 className="font-black text-base leading-tight mb-1 group-hover:text-primary transition-colors">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm text-base-content/50 font-medium mb-3">
                                                {job.company}
                                            </p>

                                            {/* Meta */}
                                            <div className="space-y-1.5 text-sm text-base-content/50 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-duotone fa-regular fa-location-dot text-primary text-xs w-4 text-center" />
                                                    {job.location}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-duotone fa-regular fa-money-bill-wave text-primary text-xs w-4 text-center" />
                                                    <span className="font-semibold text-base-content">
                                                        {formatSalary(job.salary)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 capitalize">
                                                    <i
                                                        className={`${typeIcon(job.type)} text-primary text-xs w-4 text-center`}
                                                    />
                                                    {job.type}
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1">
                                                {job.tags.slice(0, 3).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="badge badge-sm bg-base-200 border-0 text-base-content/60 font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {job.tags.length > 3 && (
                                                    <span className="badge badge-sm bg-base-200 border-0 text-base-content/40 font-medium">
                                                        +{job.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-base-content/5 text-xs text-base-content/40">
                                                <span>
                                                    {job.applicants} applicants
                                                </span>
                                                <span>
                                                    {formatDate(job.postedDate)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Sidebar Detail Panel */}
                                {selectedJob && (
                                    <div className="hidden lg:block w-[480px] shrink-0 border border-base-content/5 rounded-xl bg-base-100 shadow-lg overflow-hidden sticky top-[81px] h-[calc(100vh-81px-48px)]">
                                        <DetailPanel
                                            job={selectedJob}
                                            onClose={() => setSelectedJob(null)}
                                            showClose
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ═══════════ GMAIL / SPLIT VIEW ═══════════ */
                        <div className="flex h-[calc(100vh-81px)]">
                            {/* Left: Job List */}
                            <div className="w-full md:w-[400px] lg:w-[440px] shrink-0 border-r border-base-content/5 overflow-y-auto">
                                {filteredJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => handleSelectJob(job)}
                                        className={`cin-list-item cursor-pointer px-5 py-4 border-b border-base-content/5 transition-all duration-150 ${
                                            selectedJob?.id === job.id
                                                ? "bg-primary/5 border-l-4 border-l-primary"
                                                : "hover:bg-base-200/50 border-l-4 border-l-transparent"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    {job.featured && (
                                                        <i className="fa-duotone fa-regular fa-star text-primary text-xs" />
                                                    )}
                                                    <h3
                                                        className={`font-bold text-sm truncate ${
                                                            selectedJob?.id ===
                                                            job.id
                                                                ? "text-primary"
                                                                : ""
                                                        }`}
                                                    >
                                                        {job.title}
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-base-content/50 font-medium truncate">
                                                    {job.company}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-base-content/40">
                                                    <span className="flex items-center gap-1">
                                                        <i className="fa-duotone fa-regular fa-location-dot" />
                                                        {job.location}
                                                    </span>
                                                    <span className="font-semibold text-base-content/60">
                                                        {formatSalary(job.salary)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {job.tags.slice(0, 2).map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="badge badge-xs bg-base-200 border-0 text-base-content/50"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span
                                                    className={`badge badge-xs ${statusColor(job.status)} font-semibold uppercase tracking-wider`}
                                                >
                                                    {job.status}
                                                </span>
                                                <div className="text-[11px] text-base-content/30 mt-2">
                                                    {formatDate(job.postedDate)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right: Detail Panel */}
                            <div className="hidden md:flex flex-1 bg-base-100 overflow-hidden">
                                {selectedJob ? (
                                    <div className="w-full overflow-hidden">
                                        <DetailPanel job={selectedJob} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-full text-center p-12">
                                        <i className="fa-duotone fa-regular fa-hand-pointer text-6xl text-base-content/10 mb-6" />
                                        <h3 className="text-xl font-black mb-2">
                                            Select a job
                                        </h3>
                                        <p className="text-base-content/40 max-w-sm">
                                            Click on a job listing from the panel on
                                            the left to see its full details here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
