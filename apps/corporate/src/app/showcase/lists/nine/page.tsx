"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

// ── Helpers ----------------------------------------------------------------

function formatSalary(s: JobListing["salary"]) {
    const fmt = (n: number) =>
        n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
    return `${s.currency === "USD" ? "$" : s.currency === "EUR" ? "\u20ac" : s.currency === "CAD" ? "C$" : s.currency === "AUD" ? "A$" : s.currency + " "}${fmt(s.min)} - ${fmt(s.max)}`;
}

function timeAgo(iso: string) {
    const days = Math.floor(
        (Date.now() - new Date(iso).getTime()) / 86_400_000,
    );
    if (days === 0) return "Today";
    if (days === 1) return "1d ago";
    return `${days}d ago`;
}

const statusColor: Record<string, string> = {
    open: "text-emerald-600 border-emerald-300",
    filled: "text-[#233876]/40 border-[#233876]/15",
    pending: "text-amber-600 border-amber-300",
    closed: "text-red-500 border-red-300",
};

type ViewMode = "table" | "grid" | "gmail";

const sidebarNav = [
    { id: "dashboard", label: "Dashboard", icon: "fa-grid-2" },
    { id: "roles", label: "Roles", icon: "fa-briefcase", active: true },
    { id: "recruiters", label: "Recruiters", icon: "fa-user-tie" },
    { id: "candidates", label: "Candidates", icon: "fa-users" },
    { id: "companies", label: "Companies", icon: "fa-building" },
    { id: "applications", label: "Applications", icon: "fa-file-lines" },
    { id: "messages", label: "Messages", icon: "fa-comments" },
    { id: "placements", label: "Placements", icon: "fa-badge-check" },
];

// ── Component ---------------------------------------------------------------

export default function ListsNinePage() {
    const [view, setView] = useState<ViewMode>("table");
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [levelFilter, setLevelFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const prevView = useRef<ViewMode>(view);

    // Filtered jobs
    const jobs = useMemo(() => {
        let list = mockJobs;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (j) =>
                    j.title.toLowerCase().includes(q) ||
                    j.company.toLowerCase().includes(q) ||
                    j.location.toLowerCase().includes(q) ||
                    j.tags.some((t) => t.toLowerCase().includes(q)),
            );
        }
        if (typeFilter !== "all") list = list.filter((j) => j.type === typeFilter);
        if (levelFilter !== "all")
            list = list.filter((j) => j.experienceLevel === levelFilter);
        return list;
    }, [search, typeFilter, levelFilter]);

    const selected = useMemo(
        () => (selectedId ? mockJobs.find((j) => j.id === selectedId) ?? null : null),
        [selectedId],
    );

    // Animate view transitions
    useEffect(() => {
        if (prevView.current === view) return;
        prevView.current = view;
        if (!containerRef.current) return;
        const target = containerRef.current.querySelector(".nine-list-body");
        if (!target) return;
        gsap.fromTo(
            target,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" },
        );
    }, [view]);

    // Animate detail panel on selection change
    useEffect(() => {
        if (!containerRef.current) return;
        const panel = containerRef.current.querySelector(".nine-detail-panel");
        if (!panel) return;
        gsap.fromTo(
            panel,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" },
        );
    }, [selectedId]);

    // Initial load animation
    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(
            containerRef.current.querySelector(".nine-list-header"),
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        );
        gsap.fromTo(
            containerRef.current.querySelector(".nine-list-controls"),
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.15 },
        );
        gsap.fromTo(
            containerRef.current.querySelector(".nine-list-body"),
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.3 },
        );
    }, []);

    const handleSelect = useCallback((id: string) => {
        setSelectedId((prev) => (prev === id ? null : id));
    }, []);

    // ── Render ---------------------------------------------------------------
    return (
        <div ref={containerRef} className="min-h-screen bg-white flex">
            {/* Dotted grid background */}
            <div
                className="fixed inset-0 opacity-[0.06] pointer-events-none z-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #233876 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* ── Mobile sidebar overlay ──────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ─────────────────────────────────────── */}
            <aside
                className={`nine-sidebar fixed lg:sticky top-0 left-0 z-50 lg:z-20 h-screen w-[220px] flex-shrink-0 bg-white border-r-2 border-[#233876]/10 flex flex-col transition-transform duration-200 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* Sidebar header */}
                <div className="px-5 py-5 border-b border-dashed border-[#233876]/10">
                    <div className="font-mono text-[9px] tracking-[0.3em] text-[#233876]/25 uppercase mb-1">
                        Splits Network
                    </div>
                    <div className="font-bold text-sm text-[#0f1b3d]">
                        Portal
                    </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 py-3 overflow-y-auto">
                    {sidebarNav.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSidebarOpen(false)}
                            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                                item.active
                                    ? "bg-[#233876]/5 text-[#233876] border-r-[3px] border-r-[#233876]"
                                    : "text-[#0f1b3d]/40 hover:text-[#0f1b3d]/70 hover:bg-[#f7f8fa]"
                            }`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${item.icon} w-4 text-center text-sm ${
                                    item.active ? "text-[#233876]" : ""
                                }`}
                            />
                            <span
                                className={`text-sm ${
                                    item.active ? "font-semibold" : "font-medium"
                                }`}
                            >
                                {item.label}
                            </span>
                            {item.active && (
                                <span className="ml-auto w-1.5 h-1.5 bg-[#233876]" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar footer */}
                <div className="px-5 py-4 border-t border-dashed border-[#233876]/10">
                    <div className="font-mono text-[9px] tracking-wider text-[#233876]/20 uppercase">
                        v9.0 // Clean Architecture
                    </div>
                </div>
            </aside>

            {/* ── Main content ────────────────────────────────── */}
            <div className="relative z-10 flex-1 min-w-0">
                {/* ── Header ──────────────────────────────────────── */}
                <header className="nine-list-header border-b border-[#233876]/10 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
                    <div className="px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Mobile sidebar toggle */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden w-9 h-9 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/40 hover:text-[#233876] hover:border-[#233876]/40 transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-bars text-sm" />
                                </button>
                                <div>
                                    <div className="font-mono text-[10px] tracking-[0.3em] text-[#233876]/30 uppercase mb-1">
                                        REF: LST-09 // Employment Networks
                                    </div>
                                    <h1 className="text-2xl font-bold text-[#0f1b3d]">
                                        Job Listings
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-[#233876]/30 mr-2 hidden sm:inline">
                                    {jobs.length} results
                                </span>
                                {/* View toggle */}
                                {(
                                    [
                                        ["table", "fa-table-list", "Table"],
                                        ["grid", "fa-grid-2", "Grid"],
                                        ["gmail", "fa-table-columns", "Split"],
                                    ] as const
                                ).map(([mode, icon, label]) => (
                                    <button
                                        key={mode}
                                        onClick={() => setView(mode)}
                                        className={`flex items-center gap-1.5 px-3 py-2 border-2 font-mono text-xs tracking-wide transition-colors ${
                                            view === mode
                                                ? "border-[#233876] bg-[#233876] text-white"
                                                : "border-[#233876]/15 text-[#233876]/50 hover:border-[#233876]/40 hover:text-[#233876]"
                                        }`}
                                    >
                                        <i className={`fa-duotone fa-regular ${icon}`} />
                                        <span className="hidden sm:inline">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Controls bar ────────────────────────────────── */}
                <div className="nine-list-controls border-b border-[#233876]/10 bg-[#f7f8fa]">
                    <div className="px-6 py-3">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[220px] max-w-md">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#233876]/25 text-sm" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search title, company, skill..."
                                    className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#233876]/10 font-mono text-sm text-[#0f1b3d] placeholder:text-[#233876]/25 focus:border-[#233876]/40 focus:outline-none transition-colors"
                                />
                            </div>
                            {/* Type filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="bg-white border-2 border-[#233876]/10 px-3 py-2 font-mono text-xs text-[#0f1b3d] focus:border-[#233876]/40 focus:outline-none"
                            >
                                <option value="all">All Types</option>
                                <option value="full-time">Full-time</option>
                                <option value="remote">Remote</option>
                                <option value="contract">Contract</option>
                                <option value="part-time">Part-time</option>
                            </select>
                            {/* Level filter */}
                            <select
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                className="bg-white border-2 border-[#233876]/10 px-3 py-2 font-mono text-xs text-[#0f1b3d] focus:border-[#233876]/40 focus:outline-none"
                            >
                                <option value="all">All Levels</option>
                                <option value="entry">Entry</option>
                                <option value="mid">Mid</option>
                                <option value="senior">Senior</option>
                                <option value="executive">Executive</option>
                            </select>
                            {search || typeFilter !== "all" || levelFilter !== "all" ? (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setTypeFilter("all");
                                        setLevelFilter("all");
                                    }}
                                    className="font-mono text-xs text-[#233876]/40 hover:text-[#233876] transition-colors underline"
                                >
                                    Clear
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* ── Body ────────────────────────────────────────── */}
                <div className="nine-list-body px-6 py-6">
                    {jobs.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-14 h-14 border-2 border-[#233876]/15 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-xl text-[#233876]/30" />
                            </div>
                            <div className="font-bold text-[#0f1b3d]/60 mb-1">
                                No results found
                            </div>
                            <div className="font-mono text-xs text-[#233876]/30">
                                Try adjusting your search or filters
                            </div>
                        </div>
                    ) : view === "table" ? (
                        <TableView
                            jobs={jobs}
                            selectedId={selectedId}
                            onSelect={handleSelect}
                        />
                    ) : view === "grid" ? (
                        <GridView
                            jobs={jobs}
                            selected={selected}
                            selectedId={selectedId}
                            onSelect={handleSelect}
                        />
                    ) : (
                        <GmailView
                            jobs={jobs}
                            selected={selected}
                            selectedId={selectedId}
                            onSelect={handleSelect}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE VIEW
// ═══════════════════════════════════════════════════════════════════════════════

function TableView({
    jobs,
    selectedId,
    onSelect,
}: {
    jobs: JobListing[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="border-2 border-[#233876]/10 overflow-x-auto">
            {/* Corner marks */}
            <div className="relative">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="bg-[#f7f8fa] border-b-2 border-[#233876]/10">
                            {["Title", "Company", "Location", "Salary", "Type", "Level", "Status", "Posted"].map(
                                (h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left font-mono text-[10px] tracking-[0.2em] text-[#233876]/40 uppercase font-medium"
                                    >
                                        {h}
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job) => (
                            <tr
                                key={job.id}
                                onClick={() => onSelect(job.id)}
                                className={`border-b border-[#233876]/6 cursor-pointer transition-colors ${
                                    selectedId === job.id
                                        ? "bg-[#233876]/5"
                                        : "hover:bg-[#f7f8fa]"
                                }`}
                            >
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-sm text-[#0f1b3d]">
                                        {job.title}
                                    </div>
                                    {job.featured && (
                                        <span className="font-mono text-[9px] text-[#233876]/50 tracking-wider uppercase">
                                            FEATURED
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-[#0f1b3d]/60">
                                    {job.company}
                                </td>
                                <td className="px-4 py-3 text-xs text-[#0f1b3d]/50">
                                    {job.location}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-[#233876] font-medium">
                                    {formatSalary(job.salary)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-[10px] tracking-wider text-[#0f1b3d]/40 uppercase border border-[#233876]/10 px-2 py-0.5">
                                        {job.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-[10px] tracking-wider text-[#0f1b3d]/40 uppercase">
                                        {job.experienceLevel}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`font-mono text-[10px] tracking-wider uppercase border px-2 py-0.5 ${statusColor[job.status]}`}
                                    >
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-[#0f1b3d]/30">
                                    {timeAgo(job.postedDate)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expandable detail below table */}
            {selectedId && (
                <DetailInline
                    job={jobs.find((j) => j.id === selectedId) ?? null}
                    onClose={() => onSelect(selectedId)}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRID VIEW + SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════

function GridView({
    jobs,
    selected,
    selectedId,
    onSelect,
}: {
    jobs: JobListing[];
    selected: JobListing | null;
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="flex gap-6">
            {/* Cards grid */}
            <div
                className={`grid gap-px bg-[#233876]/10 ${
                    selected
                        ? "grid-cols-1 sm:grid-cols-2 flex-1"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full"
                }`}
            >
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        onClick={() => onSelect(job.id)}
                        className={`bg-white p-5 cursor-pointer transition-colors ${
                            selectedId === job.id
                                ? "ring-2 ring-[#233876]/30 ring-inset"
                                : "hover:bg-[#f7f8fa]"
                        }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="font-semibold text-sm text-[#0f1b3d] mb-0.5">
                                    {job.title}
                                </div>
                                <div className="font-mono text-xs text-[#0f1b3d]/40">
                                    {job.company}
                                </div>
                            </div>
                            {job.featured && (
                                <span className="w-2 h-2 bg-[#233876] flex-shrink-0 mt-1.5" />
                            )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                            <span className="text-xs text-[#0f1b3d]/40 flex items-center gap-1">
                                <i className="fa-duotone fa-regular fa-location-dot text-[10px]" />
                                {job.location}
                            </span>
                            <span className="font-mono text-xs text-[#233876] font-medium">
                                {formatSalary(job.salary)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <span className="font-mono text-[9px] tracking-wider text-[#0f1b3d]/30 uppercase border border-[#233876]/8 px-1.5 py-0.5">
                                    {job.type}
                                </span>
                                <span className="font-mono text-[9px] tracking-wider text-[#0f1b3d]/30 uppercase border border-[#233876]/8 px-1.5 py-0.5">
                                    {job.experienceLevel}
                                </span>
                            </div>
                            <span
                                className={`font-mono text-[9px] tracking-wider uppercase border px-1.5 py-0.5 ${statusColor[job.status]}`}
                            >
                                {job.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar detail panel */}
            {selected && (
                <div className="nine-detail-panel hidden lg:block w-[420px] flex-shrink-0 sticky top-[130px] self-start max-h-[calc(100vh-150px)] overflow-y-auto">
                    <DetailPanel job={selected} onClose={() => onSelect(selected.id)} />
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GMAIL VIEW (Split)
// ═══════════════════════════════════════════════════════════════════════════════

function GmailView({
    jobs,
    selected,
    selectedId,
    onSelect,
}: {
    jobs: JobListing[];
    selected: JobListing | null;
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="flex gap-px bg-[#233876]/10 border-2 border-[#233876]/10 min-h-[70vh]">
            {/* Left list */}
            <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 overflow-y-auto max-h-[75vh] bg-white">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        onClick={() => onSelect(job.id)}
                        className={`px-5 py-4 border-b border-[#233876]/6 cursor-pointer transition-colors ${
                            selectedId === job.id
                                ? "bg-[#233876]/5 border-l-[3px] border-l-[#233876]"
                                : "hover:bg-[#f7f8fa] border-l-[3px] border-l-transparent"
                        }`}
                    >
                        <div className="flex items-start justify-between mb-1">
                            <div className="font-semibold text-sm text-[#0f1b3d] leading-tight">
                                {job.title}
                            </div>
                            <span className="font-mono text-[10px] text-[#0f1b3d]/25 flex-shrink-0 ml-3">
                                {timeAgo(job.postedDate)}
                            </span>
                        </div>
                        <div className="font-mono text-xs text-[#0f1b3d]/40 mb-1">
                            {job.company}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-[#0f1b3d]/30">
                                {job.location}
                            </span>
                            <span className="font-mono text-xs text-[#233876] font-medium">
                                {formatSalary(job.salary)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right detail */}
            <div className="nine-detail-panel hidden md:block flex-1 bg-white overflow-y-auto max-h-[75vh]">
                {selected ? (
                    <DetailPanel job={selected} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-14 h-14 border-2 border-[#233876]/10 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-arrow-left text-xl text-[#233876]/20" />
                            </div>
                            <div className="font-mono text-xs text-[#233876]/25">
                                Select a listing to view details
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL PANEL (used by Grid sidebar & Gmail right pane)
// ═══════════════════════════════════════════════════════════════════════════════

function DetailPanel({
    job,
    onClose,
}: {
    job: JobListing;
    onClose?: () => void;
}) {
    return (
        <div className="border-2 border-[#233876]/10 bg-white relative">
            {/* Corner marks */}
            <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
            <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
            <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
            <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

            <div className="p-6">
                {/* Top bar */}
                <div className="flex items-start justify-between mb-5 border-b border-dashed border-[#233876]/10 pb-4">
                    <div>
                        <div className="font-mono text-[10px] text-[#233876]/25 tracking-wider uppercase mb-1">
                            {job.department} // {job.id.toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-[#0f1b3d] leading-tight mb-1">
                            {job.title}
                        </h2>
                        <div className="font-mono text-sm text-[#233876]">
                            {job.company}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-8 h-8 border border-[#233876]/15 flex items-center justify-center text-[#233876]/30 hover:text-[#233876] hover:border-[#233876]/40 transition-colors"
                        >
                            <i className="fa-regular fa-xmark text-sm" />
                        </button>
                    )}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-px bg-[#233876]/10 mb-5">
                    {[
                        ["Location", job.location, "fa-location-dot"],
                        ["Salary", formatSalary(job.salary), "fa-money-bill"],
                        ["Type", job.type, "fa-briefcase"],
                        ["Level", job.experienceLevel, "fa-layer-group"],
                    ].map(([label, val, icon]) => (
                        <div key={label} className="bg-white p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <i
                                    className={`fa-duotone fa-regular ${icon} text-[10px] text-[#233876]/30`}
                                />
                                <span className="font-mono text-[9px] tracking-wider text-[#233876]/30 uppercase">
                                    {label}
                                </span>
                            </div>
                            <div className="text-sm font-medium text-[#0f1b3d] capitalize">
                                {val}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex gap-4 mb-5">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-[#0f1b3d]/35">
                        <i className="fa-duotone fa-regular fa-users text-[10px]" />
                        {job.applicants} applicants
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-[#0f1b3d]/35">
                        <i className="fa-duotone fa-regular fa-eye text-[10px]" />
                        {job.views.toLocaleString()} views
                    </div>
                    <span
                        className={`font-mono text-[10px] tracking-wider uppercase border px-2 py-0.5 ${statusColor[job.status]}`}
                    >
                        {job.status}
                    </span>
                </div>

                {/* Description */}
                <div className="mb-5">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#233876]/25 uppercase mb-2">
                        Description
                    </div>
                    <p className="text-sm text-[#0f1b3d]/55 leading-relaxed">
                        {job.description}
                    </p>
                </div>

                {/* Requirements */}
                <div className="mb-5">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#233876]/25 uppercase mb-2">
                        Requirements
                    </div>
                    <ul className="space-y-1.5">
                        {job.requirements.map((r, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-[#0f1b3d]/50"
                            >
                                <span className="w-1 h-1 rounded-full bg-[#233876]/20 mt-2 flex-shrink-0" />
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Responsibilities */}
                <div className="mb-5">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#233876]/25 uppercase mb-2">
                        Responsibilities
                    </div>
                    <ul className="space-y-1.5">
                        {job.responsibilities.map((r, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-[#0f1b3d]/50"
                            >
                                <span className="w-1 h-1 rounded-full bg-[#233876]/20 mt-2 flex-shrink-0" />
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Benefits */}
                <div className="mb-5">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#233876]/25 uppercase mb-2">
                        Benefits
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {job.benefits.map((b, i) => (
                            <span
                                key={i}
                                className="font-mono text-[10px] tracking-wider text-[#233876]/50 border border-[#233876]/10 px-2 py-1"
                            >
                                {b}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div className="mb-5">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#233876]/25 uppercase mb-2">
                        Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {job.tags.map((t, i) => (
                            <span
                                key={i}
                                className="font-mono text-[10px] tracking-wider text-[#0f1b3d]/50 bg-[#f7f8fa] border border-[#233876]/8 px-2 py-1"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recruiter */}
                <div className="border-t border-dashed border-[#233876]/10 pt-4">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#233876]/25 uppercase mb-3">
                        Recruiter
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-[#233876]/15 overflow-hidden flex-shrink-0">
                            <img
                                src={job.recruiter.avatar}
                                alt={job.recruiter.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="font-semibold text-sm text-[#0f1b3d]">
                                {job.recruiter.name}
                            </div>
                            <div className="font-mono text-xs text-[#0f1b3d]/30">
                                {job.recruiter.agency}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Apply CTA */}
                <div className="mt-6">
                    <a
                        href="https://splits.network/sign-up"
                        className="btn btn-sm border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none w-full font-medium tracking-wide font-mono text-xs"
                    >
                        Apply Now
                        <i className="fa-regular fa-arrow-right ml-1" />
                    </a>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL INLINE (used below table view)
// ═══════════════════════════════════════════════════════════════════════════════

function DetailInline({
    job,
    onClose,
}: {
    job: JobListing | null;
    onClose: () => void;
}) {
    if (!job) return null;
    return (
        <div className="nine-detail-panel border-t-2 border-[#233876]/15 bg-[#f7f8fa]">
            <div className="p-6 max-w-5xl">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="font-mono text-[10px] text-[#233876]/25 tracking-wider uppercase mb-1">
                            {job.department} // {job.id.toUpperCase()}
                        </div>
                        <h3 className="text-xl font-bold text-[#0f1b3d] mb-1">
                            {job.title}
                        </h3>
                        <div className="font-mono text-sm text-[#233876]">
                            {job.company} &middot; {job.location}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 border border-[#233876]/15 flex items-center justify-center text-[#233876]/30 hover:text-[#233876] hover:border-[#233876]/40 transition-colors"
                    >
                        <i className="fa-regular fa-xmark text-sm" />
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <p className="text-sm text-[#0f1b3d]/55 leading-relaxed mb-4">
                            {job.description}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <div className="font-mono text-[10px] tracking-[0.2em] text-[#233876]/25 uppercase mb-2">
                                    Requirements
                                </div>
                                <ul className="space-y-1">
                                    {job.requirements.map((r, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-xs text-[#0f1b3d]/50"
                                        >
                                            <span className="w-1 h-1 rounded-full bg-[#233876]/20 mt-1.5 flex-shrink-0" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <div className="font-mono text-[10px] tracking-[0.2em] text-[#233876]/25 uppercase mb-2">
                                    Responsibilities
                                </div>
                                <ul className="space-y-1">
                                    {job.responsibilities.map((r, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-xs text-[#0f1b3d]/50"
                                        >
                                            <span className="w-1 h-1 rounded-full bg-[#233876]/20 mt-1.5 flex-shrink-0" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-px bg-[#233876]/10 mb-4">
                            {[
                                ["Salary", formatSalary(job.salary)],
                                ["Type", job.type],
                                ["Level", job.experienceLevel],
                                ["Posted", timeAgo(job.postedDate)],
                            ].map(([label, val]) => (
                                <div key={label} className="bg-white p-3">
                                    <div className="font-mono text-[9px] tracking-wider text-[#233876]/25 uppercase mb-0.5">
                                        {label}
                                    </div>
                                    <div className="text-xs font-medium text-[#0f1b3d] capitalize">
                                        {val}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Benefits */}
                        <div className="font-mono text-[10px] tracking-[0.2em] text-[#233876]/25 uppercase mb-2">
                            Benefits
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                            {job.benefits.map((b, i) => (
                                <span
                                    key={i}
                                    className="font-mono text-[9px] text-[#233876]/40 border border-[#233876]/8 px-1.5 py-0.5"
                                >
                                    {b}
                                </span>
                            ))}
                        </div>

                        {/* Recruiter */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 border-2 border-[#233876]/15 overflow-hidden">
                                <img
                                    src={job.recruiter.avatar}
                                    alt={job.recruiter.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="font-semibold text-xs text-[#0f1b3d]">
                                    {job.recruiter.name}
                                </div>
                                <div className="font-mono text-[10px] text-[#0f1b3d]/25">
                                    {job.recruiter.agency}
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-sm border-2 border-[#233876] bg-[#233876] text-white hover:bg-[#1a2a5c] rounded-none w-full font-medium tracking-wide font-mono text-xs"
                        >
                            Apply Now
                            <i className="fa-regular fa-arrow-right ml-1" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
