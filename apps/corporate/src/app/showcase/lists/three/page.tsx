"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

// ── Animation constants (matching landing/article three) ─────────────────────
const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };

// ── Types ────────────────────────────────────────────────────────────────────
type ViewMode = "table" | "grid" | "gmail";

// ── Sidebar nav items ────────────────────────────────────────────────────────
const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-grid-2" },
    { id: "roles", label: "Roles", icon: "fa-briefcase", active: true },
    { id: "recruiters", label: "Recruiters", icon: "fa-user-tie" },
    { id: "candidates", label: "Candidates", icon: "fa-users" },
    { id: "companies", label: "Companies", icon: "fa-building" },
    { id: "applications", label: "Applications", icon: "fa-file-lines" },
    { id: "messages", label: "Messages", icon: "fa-envelope" },
    { id: "placements", label: "Placements", icon: "fa-handshake" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatSalary(salary: JobListing["salary"]): string {
    const fmt = (n: number) => {
        if (salary.currency === "USD" || salary.currency === "CAD" || salary.currency === "AUD") {
            return "$" + Math.round(n / 1000) + "K";
        }
        return "\u20AC" + Math.round(n / 1000) + "K";
    };
    return `${fmt(salary.min)} - ${fmt(salary.max)}`;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    return `${month} ${day}`;
}

function statusLabel(status: JobListing["status"]): string {
    switch (status) {
        case "open": return "Active";
        case "filled": return "Filled";
        case "pending": return "Pending";
        case "closed": return "Closed";
    }
}

function statusColor(status: JobListing["status"]): string {
    switch (status) {
        case "open": return "text-success";
        case "filled": return "text-base-content/30";
        case "pending": return "text-warning";
        case "closed": return "text-error";
    }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ListsThreePage() {
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // ── Filtering ─────────────────────────────────────────
    const filteredJobs = useMemo(() => {
        return mockJobs.filter((job) => {
            const matchesSearch =
                search === "" ||
                job.title.toLowerCase().includes(search.toLowerCase()) ||
                job.company.toLowerCase().includes(search.toLowerCase()) ||
                job.location.toLowerCase().includes(search.toLowerCase()) ||
                job.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
            const matchesType = filterType === "all" || job.type === filterType;
            const matchesStatus = filterStatus === "all" || job.status === filterStatus;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [search, filterType, filterStatus]);

    // ── View transitions ──────────────────────────────────
    const animateViewChange = useCallback((newMode: ViewMode) => {
        if (!contentRef.current || newMode === viewMode) return;
        gsap.to(contentRef.current, {
            opacity: 0,
            y: 10,
            duration: D.fast,
            ease: E.precise,
            onComplete: () => {
                setViewMode(newMode);
                setSelectedJob(null);
                gsap.fromTo(
                    contentRef.current,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.precise },
                );
            },
        });
    }, [viewMode]);

    // ── Header animation ──────────────────────────────────
    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // Sidebar nav items
            gsap.fromTo(
                $(".sidebar-nav-item"),
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: D.fast, ease: E.precise, stagger: 0.04 },
            );

            const tl = gsap.timeline({ defaults: { ease: E.precise } });
            tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
            tl.fromTo($1(".page-title"), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.3");
            tl.fromTo($1(".page-divider"), { scaleX: 0 }, { scaleX: 1, duration: D.normal, transformOrigin: "left center" }, "-=0.2");
            tl.fromTo($(".toolbar-item"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.04 }, "-=0.2");
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen flex">
            {/* ── SIDEBAR ──────────────────────────────────── */}
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-neutral/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-56 bg-base-100 border-r-2 border-neutral flex-shrink-0 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar header */}
                <div className="px-5 pt-6 pb-4 border-b border-base-300">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-black tracking-tight">EN</span>
                        <button
                            className="lg:hidden text-base-content/40 hover:text-base-content text-xs"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mt-1">
                        Splits Network
                    </p>
                </div>

                {/* Nav items */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    <div className="space-y-0.5">
                        {navItems.map((item) => (
                            <div
                                key={item.id}
                                className={`sidebar-nav-item opacity-0 flex items-center gap-3 px-3 py-2.5 cursor-default transition-colors duration-200 ${
                                    item.active
                                        ? "bg-neutral text-neutral-content"
                                        : "text-base-content/40 hover:text-base-content hover:bg-base-200"
                                }`}
                            >
                                <i className={`fa-duotone fa-regular ${item.icon} w-4 text-center text-xs`} />
                                <span className="text-xs font-bold uppercase tracking-[0.1em]">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Sidebar footer */}
                <div className="px-5 py-4 border-t border-base-300">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-neutral text-neutral-content flex items-center justify-center text-[10px] font-black">
                            JD
                        </div>
                        <div>
                            <div className="text-[10px] font-bold tracking-tight">Jane Doe</div>
                            <div className="text-[9px] text-base-content/30 uppercase tracking-[0.1em]">Recruiter</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────── */}
            <div className="flex-1 min-w-0">
                {/* ── HEADER ───────────────────────────────────── */}
                <header className="border-b-2 border-neutral">
                    <div className="px-6 lg:px-10 pt-8 pb-6">
                        <div className="flex items-end gap-4 mb-6">
                            {/* Mobile sidebar toggle */}
                            <button
                                className="lg:hidden text-base-content/40 hover:text-base-content transition-colors mr-2"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <i className="fa-duotone fa-regular fa-bars text-lg" />
                            </button>

                            <div className="page-number opacity-0 text-5xl lg:text-7xl font-black leading-none tracking-tighter text-neutral/8 select-none">
                                L3
                            </div>
                            <div className="page-title opacity-0 pb-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40 mb-1">
                                    Employment Networks
                                </p>
                                <h1 className="text-xl lg:text-3xl font-black tracking-tight">
                                    Job Listings
                                </h1>
                            </div>
                        </div>

                        <div className="page-divider h-[2px] bg-neutral/20 mb-5" style={{ transformOrigin: "left center" }} />

                        {/* ── TOOLBAR ─────────────────────────────── */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="toolbar-item opacity-0 flex-1 min-w-[200px] max-w-md">
                                <div className="relative">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-xs" />
                                    <input
                                        type="text"
                                        placeholder="Search roles, companies, skills..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-base-200 border-2 border-transparent focus:border-neutral text-sm font-medium tracking-tight placeholder:text-base-content/30 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Type filter */}
                            <div className="toolbar-item opacity-0">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="bg-base-200 border-2 border-transparent focus:border-neutral px-3 py-2.5 text-xs uppercase tracking-[0.15em] font-bold outline-none cursor-pointer"
                                >
                                    <option value="all">All Types</option>
                                    <option value="full-time">Full-time</option>
                                    <option value="remote">Remote</option>
                                    <option value="contract">Contract</option>
                                    <option value="part-time">Part-time</option>
                                </select>
                            </div>

                            {/* Status filter */}
                            <div className="toolbar-item opacity-0">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="bg-base-200 border-2 border-transparent focus:border-neutral px-3 py-2.5 text-xs uppercase tracking-[0.15em] font-bold outline-none cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="open">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="filled">Filled</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Result count */}
                            <div className="toolbar-item opacity-0 text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-bold mr-2">
                                {filteredJobs.length} results
                            </div>

                            {/* View toggle */}
                            <div className="toolbar-item opacity-0 flex gap-0 border-2 border-neutral/15">
                                {([
                                    { mode: "table" as ViewMode, icon: "fa-table-list", label: "Table" },
                                    { mode: "grid" as ViewMode, icon: "fa-grid-2", label: "Grid" },
                                    { mode: "gmail" as ViewMode, icon: "fa-columns-3", label: "Split" },
                                ]).map((v) => (
                                    <button
                                        key={v.mode}
                                        onClick={() => animateViewChange(v.mode)}
                                        title={v.label}
                                        className={`px-3 py-2 text-xs transition-colors duration-200 ${
                                            viewMode === v.mode
                                                ? "bg-neutral text-neutral-content"
                                                : "hover:bg-base-200 text-base-content/40"
                                        }`}
                                    >
                                        <i className={`fa-duotone fa-regular ${v.icon}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── CONTENT ──────────────────────────────────── */}
                <div ref={contentRef} className="min-h-[70vh]">
                    {viewMode === "table" && (
                        <TableView jobs={filteredJobs} selectedJob={selectedJob} onSelect={setSelectedJob} />
                    )}
                    {viewMode === "grid" && (
                        <GridView jobs={filteredJobs} selectedJob={selectedJob} onSelect={setSelectedJob} />
                    )}
                    {viewMode === "gmail" && (
                        <GmailView jobs={filteredJobs} selectedJob={selectedJob} onSelect={setSelectedJob} />
                    )}
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// TABLE VIEW
// ═════════════════════════════════════════════════════════════════════════════

function TableView({
    jobs,
    selectedJob,
    onSelect,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelect: (j: JobListing | null) => void;
}) {
    return (
        <div className="px-6 lg:px-10 py-6">
            {/* Column headers */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 border-b-2 border-neutral/10 mb-1">
                <div className="col-span-1 text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-bold">#</div>
                <div className="col-span-3 text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-bold">Position</div>
                <div className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-bold">Company</div>
                <div className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-bold">Location</div>
                <div className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-bold">Salary</div>
                <div className="col-span-1 text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-bold">Status</div>
                <div className="col-span-1 text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-bold text-right">Posted</div>
            </div>

            {/* Rows */}
            <div className="space-y-0">
                {jobs.map((job, i) => (
                    <button
                        key={job.id}
                        onClick={() => onSelect(selectedJob?.id === job.id ? null : job)}
                        className={`w-full text-left grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-4 py-4 border-b border-base-300/50 transition-colors duration-200 group ${
                            selectedJob?.id === job.id
                                ? "bg-neutral text-neutral-content"
                                : "hover:bg-base-200"
                        }`}
                    >
                        {/* Index */}
                        <div className="hidden lg:block col-span-1">
                            <span className={`text-sm font-mono ${
                                selectedJob?.id === job.id ? "text-neutral-content/40" : "text-base-content/20"
                            }`}>
                                {String(i + 1).padStart(2, "0")}
                            </span>
                        </div>

                        {/* Title */}
                        <div className="col-span-3">
                            <span className="text-sm font-bold tracking-tight">
                                {job.title}
                            </span>
                            {job.featured && (
                                <span className={`ml-2 text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 font-bold ${
                                    selectedJob?.id === job.id
                                        ? "bg-neutral-content/20"
                                        : "bg-primary/10 text-primary"
                                }`}>
                                    Featured
                                </span>
                            )}
                        </div>

                        {/* Company */}
                        <div className="col-span-2">
                            <span className={`text-sm ${
                                selectedJob?.id === job.id ? "text-neutral-content/70" : "text-base-content/60"
                            }`}>
                                {job.company}
                            </span>
                        </div>

                        {/* Location */}
                        <div className="col-span-2">
                            <span className={`text-xs ${
                                selectedJob?.id === job.id ? "text-neutral-content/50" : "text-base-content/40"
                            }`}>
                                {job.location}
                            </span>
                        </div>

                        {/* Salary */}
                        <div className="col-span-2">
                            <span className="text-sm font-bold tracking-tight">
                                {formatSalary(job.salary)}
                            </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                            <span className={`text-[10px] uppercase tracking-[0.15em] font-bold ${
                                selectedJob?.id === job.id ? "text-neutral-content/60" : statusColor(job.status)
                            }`}>
                                {statusLabel(job.status)}
                            </span>
                        </div>

                        {/* Posted */}
                        <div className="col-span-1 text-right">
                            <span className={`text-xs font-mono ${
                                selectedJob?.id === job.id ? "text-neutral-content/40" : "text-base-content/30"
                            }`}>
                                {formatDate(job.postedDate)}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Expanded detail (below table) */}
            {selectedJob && (
                <div className="mt-6 border-t-2 border-neutral pt-6">
                    <DetailPanel job={selectedJob} onClose={() => onSelect(null)} />
                </div>
            )}

            {jobs.length === 0 && <EmptyState />}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// GRID VIEW + SIDEBAR DETAIL
// ═════════════════════════════════════════════════════════════════════════════

function GridView({
    jobs,
    selectedJob,
    onSelect,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelect: (j: JobListing | null) => void;
}) {
    return (
        <div className="px-6 lg:px-10 py-6">
            <div className={`flex gap-6 ${selectedJob ? "" : ""}`}>
                {/* Cards grid */}
                <div className={`flex-1 transition-all duration-300 ${selectedJob ? "lg:w-1/2" : "w-full"}`}>
                    <div className={`grid gap-[2px] bg-neutral/10 ${
                        selectedJob
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}>
                        {jobs.map((job) => (
                            <button
                                key={job.id}
                                onClick={() => onSelect(selectedJob?.id === job.id ? null : job)}
                                className={`bg-base-100 p-5 text-left transition-colors duration-200 group ${
                                    selectedJob?.id === job.id
                                        ? "bg-neutral text-neutral-content"
                                        : "hover:bg-base-200"
                                }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                                        selectedJob?.id === job.id ? "text-neutral-content/40" : statusColor(job.status)
                                    }`}>
                                        {statusLabel(job.status)}
                                    </span>
                                    {job.featured && (
                                        <span className={`text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 font-bold ${
                                            selectedJob?.id === job.id
                                                ? "bg-neutral-content/20"
                                                : "bg-primary/10 text-primary"
                                        }`}>
                                            Featured
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-black tracking-tight mb-1 leading-tight">
                                    {job.title}
                                </h3>

                                {/* Company */}
                                <p className={`text-xs mb-3 ${
                                    selectedJob?.id === job.id ? "text-neutral-content/60" : "text-base-content/50"
                                }`}>
                                    {job.company}
                                </p>

                                {/* Divider */}
                                <div className={`h-[1px] mb-3 ${
                                    selectedJob?.id === job.id ? "bg-neutral-content/15" : "bg-base-300"
                                }`} />

                                {/* Meta */}
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] uppercase tracking-[0.15em] ${
                                        selectedJob?.id === job.id ? "text-neutral-content/40" : "text-base-content/30"
                                    }`}>
                                        {job.location}
                                    </span>
                                    <span className="text-xs font-bold tracking-tight">
                                        {formatSalary(job.salary)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                    {jobs.length === 0 && <EmptyState />}
                </div>

                {/* Sidebar detail */}
                {selectedJob && (
                    <div className="hidden lg:block w-1/2 border-l-2 border-neutral pl-6 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
                        <DetailPanel job={selectedJob} onClose={() => onSelect(null)} />
                    </div>
                )}
            </div>

            {/* Mobile detail (below grid) */}
            {selectedJob && (
                <div className="lg:hidden mt-6 border-t-2 border-neutral pt-6">
                    <DetailPanel job={selectedJob} onClose={() => onSelect(null)} />
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// GMAIL VIEW (split pane)
// ═════════════════════════════════════════════════════════════════════════════

function GmailView({
    jobs,
    selectedJob,
    onSelect,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelect: (j: JobListing | null) => void;
}) {
    const activeJob = selectedJob || jobs[0] || null;

    return (
        <div className="flex min-h-[70vh]">
            {/* Left list */}
            <div className={`border-r-2 border-neutral overflow-y-auto ${
                activeJob ? "w-full lg:w-2/5" : "w-full"
            }`} style={{ maxHeight: "calc(100vh - 12rem)" }}>
                {jobs.map((job, i) => (
                    <button
                        key={job.id}
                        onClick={() => onSelect(job)}
                        className={`w-full text-left px-6 py-4 border-b border-base-300/50 transition-colors duration-200 ${
                            activeJob?.id === job.id
                                ? "bg-neutral text-neutral-content"
                                : "hover:bg-base-200"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Index */}
                            <span className={`text-xs font-mono mt-0.5 flex-shrink-0 w-5 ${
                                activeJob?.id === job.id ? "text-neutral-content/30" : "text-base-content/20"
                            }`}>
                                {String(i + 1).padStart(2, "0")}
                            </span>

                            <div className="flex-1 min-w-0">
                                {/* Title + status */}
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-bold tracking-tight truncate">
                                        {job.title}
                                    </h3>
                                    {job.featured && (
                                        <span className={`text-[8px] uppercase tracking-[0.15em] px-1 py-0.5 font-bold flex-shrink-0 ${
                                            activeJob?.id === job.id
                                                ? "bg-neutral-content/20"
                                                : "bg-primary/10 text-primary"
                                        }`}>
                                            F
                                        </span>
                                    )}
                                </div>

                                {/* Company + location */}
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${
                                        activeJob?.id === job.id ? "text-neutral-content/60" : "text-base-content/50"
                                    }`}>
                                        {job.company}
                                    </span>
                                    <span className={`text-[10px] ${
                                        activeJob?.id === job.id ? "text-neutral-content/30" : "text-base-content/20"
                                    }`}>
                                        /
                                    </span>
                                    <span className={`text-[10px] uppercase tracking-[0.1em] ${
                                        activeJob?.id === job.id ? "text-neutral-content/40" : "text-base-content/30"
                                    }`}>
                                        {job.location}
                                    </span>
                                </div>

                                {/* Salary + date */}
                                <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-xs font-bold tracking-tight">
                                        {formatSalary(job.salary)}
                                    </span>
                                    <span className={`text-[10px] font-mono ${
                                        activeJob?.id === job.id ? "text-neutral-content/30" : "text-base-content/20"
                                    }`}>
                                        {formatDate(job.postedDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
                {jobs.length === 0 && (
                    <div className="p-6">
                        <EmptyState />
                    </div>
                )}
            </div>

            {/* Right detail */}
            {activeJob && (
                <div className="hidden lg:block flex-1 overflow-y-auto px-8 py-6" style={{ maxHeight: "calc(100vh - 12rem)" }}>
                    <DetailPanel job={activeJob} onClose={() => onSelect(null)} />
                </div>
            )}

            {/* Mobile detail */}
            {selectedJob && (
                <div className="lg:hidden fixed inset-0 z-50 bg-base-100 overflow-y-auto pt-4 px-6 pb-8">
                    <button
                        onClick={() => onSelect(null)}
                        className="mb-4 text-xs uppercase tracking-[0.2em] text-base-content/40 hover:text-base-content font-bold transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left mr-2" />
                        Back to list
                    </button>
                    <DetailPanel job={selectedJob} onClose={() => onSelect(null)} />
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// DETAIL PANEL (shared across views)
// ═════════════════════════════════════════════════════════════════════════════

function DetailPanel({ job, onClose }: { job: JobListing; onClose: () => void }) {
    return (
        <div>
            {/* Close + status */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${statusColor(job.status)}`}>
                        {statusLabel(job.status)}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-base-content/20">/</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-base-content/30 font-bold">
                        {job.type}
                    </span>
                    {job.featured && (
                        <span className="text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 font-bold bg-primary/10 text-primary">
                            Featured
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-xs text-base-content/30 hover:text-base-content transition-colors"
                >
                    <i className="fa-duotone fa-regular fa-xmark" />
                </button>
            </div>

            {/* Title */}
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight mb-2">
                {job.title}
            </h2>

            {/* Company + location */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold">{job.company}</span>
                <span className="text-base-content/20">/</span>
                <span className="text-sm text-base-content/50">{job.location}</span>
            </div>

            <div className="h-[2px] bg-neutral/10 mb-6" />

            {/* Key metrics grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10 mb-6">
                <div className="bg-base-100 p-3">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 mb-1">Salary</div>
                    <div className="text-sm font-black tracking-tight">{formatSalary(job.salary)}</div>
                </div>
                <div className="bg-base-100 p-3">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 mb-1">Applicants</div>
                    <div className="text-sm font-black tracking-tight">{job.applicants}</div>
                </div>
                <div className="bg-base-100 p-3">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 mb-1">Views</div>
                    <div className="text-sm font-black tracking-tight">{job.views.toLocaleString()}</div>
                </div>
                <div className="bg-base-100 p-3">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 mb-1">Level</div>
                    <div className="text-sm font-black tracking-tight capitalize">{job.experienceLevel}</div>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
                {job.tags.map((tag, i) => (
                    <span
                        key={i}
                        className="text-[10px] uppercase tracking-[0.15em] text-base-content/40 border border-base-300 px-2 py-1 font-bold"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Description */}
            <div className="mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                    Description
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                    {job.description}
                </p>
            </div>

            {/* Requirements */}
            <div className="mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                    Requirements
                </h3>
                <ul className="space-y-2">
                    {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-base-content/60">
                            <span className="text-[10px] font-mono text-base-content/20 mt-0.5 flex-shrink-0">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            {req}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Responsibilities */}
            <div className="mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                    Responsibilities
                </h3>
                <ul className="space-y-2">
                    {job.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-base-content/60">
                            <span className="text-[10px] font-mono text-base-content/20 mt-0.5 flex-shrink-0">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            {resp}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Benefits */}
            <div className="mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                    Benefits
                </h3>
                <div className="flex flex-wrap gap-1.5">
                    {job.benefits.map((benefit, i) => (
                        <span
                            key={i}
                            className="text-[10px] uppercase tracking-[0.1em] text-base-content/50 bg-base-200 px-2.5 py-1 font-bold"
                        >
                            {benefit}
                        </span>
                    ))}
                </div>
            </div>

            <div className="h-[2px] bg-neutral/10 mb-6" />

            {/* Recruiter */}
            <div className="mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                    Recruiter
                </h3>
                <div className="flex items-center gap-4">
                    <img
                        src={job.recruiter.avatar}
                        alt={job.recruiter.name}
                        className="w-10 h-10 object-cover"
                    />
                    <div>
                        <div className="text-sm font-bold tracking-tight">{job.recruiter.name}</div>
                        <div className="text-xs text-base-content/40">{job.recruiter.agency}</div>
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/20 block mb-1">Posted</span>
                    <span className="text-xs font-bold">{formatDate(job.postedDate)}</span>
                </div>
                <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/20 block mb-1">Deadline</span>
                    <span className="text-xs font-bold">{formatDate(job.deadline)}</span>
                </div>
                <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/20 block mb-1">Department</span>
                    <span className="text-xs font-bold">{job.department}</span>
                </div>
                {job.equity && (
                    <div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/20 block mb-1">Equity</span>
                        <span className="text-xs font-bold">{job.equity}</span>
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
                <a
                    href="https://splits.network/sign-up"
                    className="btn btn-neutral btn-sm font-bold tracking-wide flex-1"
                >
                    Apply Now
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                </a>
                <button className="btn btn-outline btn-sm border-2 font-bold tracking-wide">
                    <i className="fa-duotone fa-regular fa-bookmark" />
                </button>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═════════════════════════════════════════════════════════════════════════════

function EmptyState() {
    return (
        <div className="py-20 text-center">
            <div className="text-6xl font-black tracking-tighter text-neutral/5 mb-4 select-none">00</div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold">
                No results match your filters
            </p>
        </div>
    );
}
