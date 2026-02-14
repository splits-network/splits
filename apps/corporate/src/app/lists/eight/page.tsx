"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

// ─── Constants ──────────────────────────────────────────────────────────────
const D = { fast: 0.3, normal: 0.5, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)" };

type ViewMode = "table" | "grid" | "gmail";

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "fa-duotone fa-regular fa-grid-2-plus" },
    { id: "roles", label: "Roles", icon: "fa-duotone fa-regular fa-briefcase", active: true },
    { id: "recruiters", label: "Recruiters", icon: "fa-duotone fa-regular fa-hard-hat" },
    { id: "candidates", label: "Candidates", icon: "fa-duotone fa-regular fa-user-helmet-safety" },
    { id: "companies", label: "Companies", icon: "fa-duotone fa-regular fa-compass-drafting" },
    { id: "applications", label: "Applications", icon: "fa-duotone fa-regular fa-file-lines" },
    { id: "messages", label: "Messages", icon: "fa-duotone fa-regular fa-comments" },
    { id: "placements", label: "Placements", icon: "fa-duotone fa-regular fa-flag-checkered" },
];

const STATUS_COLORS: Record<string, string> = {
    open: "#22d3ee",
    filled: "#4ade80",
    pending: "#facc15",
    closed: "#f87171",
};

function formatSalary(min: number, max: number, currency: string) {
    const fmt = (n: number) =>
        currency === "USD" || currency === "CAD" || currency === "AUD"
            ? `$${(n / 1000).toFixed(0)}k`
            : `${(n / 1000).toFixed(0)}k ${currency}`;
    return `${fmt(min)} - ${fmt(max)}`;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)} months ago`;
}

// ─── Detail Panel (shared between Grid + Gmail views) ───────────────────────
function DetailPanel({ job, onClose }: { job: JobListing; onClose?: () => void }) {
    return (
        <div className="bp-detail-panel h-full overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: STATUS_COLORS[job.status] || "#22d3ee" }}
                            />
                            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-500/50">
                                {job.status}
                            </span>
                            {job.featured && (
                                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                                    Featured
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{job.title}</h2>
                        <p className="text-cyan-400 font-medium">{job.company}</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg border border-cyan-500/20 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
                        >
                            <i className="fa-regular fa-xmark text-sm" />
                        </button>
                    )}
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-location-dot text-cyan-500/50 text-xs" />
                        {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-money-bill text-cyan-500/50 text-xs" />
                        {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-briefcase text-cyan-500/50 text-xs" />
                        {job.type}
                    </span>
                </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-px mx-6 my-4" style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                <div className="px-3 py-3 text-center" style={{ backgroundColor: "#0f2847" }}>
                    <div className="font-mono text-lg font-bold text-cyan-300">{job.applicants}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Applicants</div>
                </div>
                <div className="px-3 py-3 text-center" style={{ backgroundColor: "#0f2847" }}>
                    <div className="font-mono text-lg font-bold text-cyan-300">{job.views.toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Views</div>
                </div>
                <div className="px-3 py-3 text-center" style={{ backgroundColor: "#0f2847" }}>
                    <div className="font-mono text-lg font-bold text-cyan-300">{job.tags.length}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Skills</div>
                </div>
            </div>

            {/* Description */}
            <div className="px-6 pb-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 mb-3">
                    Description
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="px-6 pb-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 mb-3">
                    Requirements
                </h3>
                <ul className="space-y-2">
                    {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <span
                                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                style={{ backgroundColor: "#22d3ee" }}
                            />
                            {req}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Responsibilities */}
            <div className="px-6 pb-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 mb-3">
                    Responsibilities
                </h3>
                <ul className="space-y-2">
                    {job.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <span
                                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                style={{ backgroundColor: "#22d3ee" }}
                            />
                            {resp}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Benefits */}
            <div className="px-6 pb-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 mb-3">
                    Benefits
                </h3>
                <div className="flex flex-wrap gap-2">
                    {job.benefits.map((b, i) => (
                        <span
                            key={i}
                            className="text-xs px-3 py-1.5 rounded-full border border-cyan-500/20 text-slate-400"
                            style={{ backgroundColor: "rgba(34,211,238,0.05)" }}
                        >
                            {b}
                        </span>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div className="px-6 pb-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 mb-3">
                    Skills / Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, i) => (
                        <span
                            key={i}
                            className="text-xs px-3 py-1 rounded border border-cyan-500/30 text-cyan-400 font-mono"
                            style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Recruiter */}
            <div className="px-6 pb-6">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 mb-3">
                    Recruiter
                </h3>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-cyan-500/15"
                    style={{ backgroundColor: "#0f2847" }}>
                    <img
                        src={job.recruiter.avatar}
                        alt={job.recruiter.name}
                        className="w-10 h-10 rounded-lg object-cover border border-cyan-500/20"
                    />
                    <div>
                        <div className="font-semibold text-white text-sm">{job.recruiter.name}</div>
                        <div className="text-xs text-cyan-500/50 font-mono">{job.recruiter.agency}</div>
                    </div>
                </div>
            </div>

            {/* Equity if available */}
            {job.equity && (
                <div className="px-6 pb-6">
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-cyan-500/15"
                        style={{ backgroundColor: "rgba(34,211,238,0.05)" }}>
                        <i className="fa-duotone fa-regular fa-chart-pie text-cyan-400 text-sm" />
                        <span className="text-sm text-slate-400">Equity: </span>
                        <span className="text-sm font-mono text-cyan-300">{job.equity}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page Component ────────────────────────────────────────────────────
export default function ListsEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const prevViewRef = useRef<ViewMode>(viewMode);

    const filteredJobs = mockJobs.filter((job) => {
        const matchesSearch =
            searchQuery === "" ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || job.status === statusFilter;
        const matchesType = typeFilter === "all" || job.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Animate on initial mount
    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const tl = gsap.timeline({ defaults: { ease: E.smooth } });

            tl.fromTo(
                ".bp-sidebar-logo",
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.fast },
            );
            tl.fromTo(
                ".bp-sidebar-item",
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: D.fast, stagger: 0.04 },
                "-=0.1",
            );
            tl.fromTo(
                ".bp-list-badge",
                { opacity: 0, y: -15 },
                { opacity: 1, y: 0, duration: D.fast },
                "-=0.15",
            );
            tl.fromTo(
                ".bp-list-title",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.2",
            );
            tl.fromTo(
                ".bp-list-controls",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.fast },
                "-=0.2",
            );
            tl.fromTo(
                ".bp-list-content",
                { opacity: 0 },
                { opacity: 1, duration: D.fast },
                "-=0.1",
            );
        },
        { scope: containerRef },
    );

    // Animate view transitions
    const handleViewChange = useCallback(
        (newMode: ViewMode) => {
            if (newMode === viewMode) return;
            prevViewRef.current = viewMode;

            if (contentRef.current) {
                gsap.to(contentRef.current, {
                    opacity: 0,
                    y: 8,
                    duration: 0.15,
                    ease: "power2.in",
                    onComplete: () => {
                        setViewMode(newMode);
                        setSelectedJob(null);
                        requestAnimationFrame(() => {
                            if (contentRef.current) {
                                gsap.fromTo(
                                    contentRef.current,
                                    { opacity: 0, y: 8 },
                                    { opacity: 1, y: 0, duration: D.fast, ease: E.smooth },
                                );
                            }
                        });
                    },
                });
            } else {
                setViewMode(newMode);
                setSelectedJob(null);
            }
        },
        [viewMode],
    );

    // Select first job in Gmail mode if none selected
    useEffect(() => {
        if (viewMode === "gmail" && !selectedJob && filteredJobs.length > 0) {
            setSelectedJob(filteredJobs[0]);
        }
    }, [viewMode, selectedJob, filteredJobs]);

    return (
        <div ref={containerRef} className="min-h-screen flex" style={{ backgroundColor: "#0a1628" }}>
            {/* Blueprint grid overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Corner dimension marks */}
            <div className="fixed top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-cyan-500/20 pointer-events-none z-10" />
            <div className="fixed bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-cyan-500/20 pointer-events-none z-10" />

            {/* ══════════════════════════════════════════════════════════════
                MOBILE SIDEBAR OVERLAY
               ══════════════════════════════════════════════════════════════ */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                />
            )}

            {/* ══════════════════════════════════════════════════════════════
                SIDEBAR NAVIGATION
               ══════════════════════════════════════════════════════════════ */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 lg:z-10 h-screen w-[240px] flex-shrink-0 border-r border-cyan-500/10 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ backgroundColor: "#081220" }}
            >
                {/* Logo / Brand */}
                <div className="bp-sidebar-logo px-5 py-6 border-b border-cyan-500/10 opacity-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-lg border border-cyan-500/30 flex items-center justify-center"
                            style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                        >
                            <i className="fa-duotone fa-regular fa-network-wired text-cyan-400 text-sm" />
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm leading-tight">Splits Network</div>
                            <div className="font-mono text-[9px] text-cyan-500/40 tracking-wider uppercase">Blueprint v8</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-500/30 px-3 mb-3">
                        Navigation
                    </div>
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSidebarOpen(false)}
                            className={`bp-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 opacity-0 ${
                                item.active
                                    ? "text-slate-900 font-semibold"
                                    : "text-slate-400 hover:text-white hover:bg-cyan-500/[0.05]"
                            }`}
                            style={item.active ? { backgroundColor: "#22d3ee" } : {}}
                        >
                            <i className={`${item.icon} text-sm w-5 text-center ${item.active ? "text-slate-900" : "text-cyan-500/50"}`} />
                            <span>{item.label}</span>
                            {item.active && (
                                <span className="ml-auto font-mono text-[9px] text-slate-800/60 tracking-wider">
                                    ACTIVE
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar footer */}
                <div className="px-5 py-4 border-t border-cyan-500/10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg border border-cyan-500/20 flex items-center justify-center font-mono text-xs font-bold text-cyan-400"
                            style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                        >
                            EN
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">Employment Networks</div>
                            <div className="font-mono text-[9px] text-cyan-500/30 truncate">admin@splits.network</div>
                        </div>
                    </div>
                </div>

                {/* Blueprint dimension line at bottom */}
                <div className="px-3 py-2 border-t border-cyan-500/5">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.08)" }} />
                        <span className="font-mono text-[8px] text-cyan-500/15">{NAV_ITEMS.length} modules</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.08)" }} />
                    </div>
                </div>
            </aside>

            {/* ══════════════════════════════════════════════════════════════
                MAIN CONTENT
               ══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0 relative z-10">
                <div className="px-4 lg:px-8 py-8 max-w-[1400px]">
                    {/* ── Header ── */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            {/* Mobile sidebar toggle */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden w-10 h-10 rounded-lg border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:border-cyan-400/40 transition-colors"
                                style={{ backgroundColor: "#0d1d33" }}
                            >
                                <i className="fa-duotone fa-regular fa-bars text-sm" />
                            </button>
                            <div className="bp-list-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-mono opacity-0">
                                <i className="fa-duotone fa-regular fa-compass-drafting text-xs" />
                                <span>JOB LISTINGS // BLUEPRINT v8</span>
                            </div>
                        </div>

                        <h1 className="bp-list-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                            Open <span className="text-cyan-400">Positions</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-mono opacity-0 bp-list-title">
                            {filteredJobs.length} of {mockJobs.length} roles
                        </p>
                    </div>

                    {/* ── Controls Bar ── */}
                    <div className="bp-list-controls flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6 opacity-0">
                        {/* Search + Filters */}
                        <div className="flex flex-wrap gap-3 items-center flex-1">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[240px] max-w-md">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/40 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search jobs, companies, skills..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                                    style={{ backgroundColor: "#0d1d33" }}
                                />
                            </div>

                            {/* Status filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-colors cursor-pointer"
                                style={{ backgroundColor: "#0d1d33" }}
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="filled">Filled</option>
                                <option value="pending">Pending</option>
                                <option value="closed">Closed</option>
                            </select>

                            {/* Type filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-colors cursor-pointer"
                                style={{ backgroundColor: "#0d1d33" }}
                            >
                                <option value="all">All Types</option>
                                <option value="full-time">Full-Time</option>
                                <option value="part-time">Part-Time</option>
                                <option value="contract">Contract</option>
                                <option value="remote">Remote</option>
                            </select>
                        </div>

                        {/* View mode toggle */}
                        <div className="flex items-center rounded-lg border border-cyan-500/20 overflow-hidden" style={{ backgroundColor: "#0d1d33" }}>
                            <button
                                onClick={() => handleViewChange("table")}
                                className={`px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                                    viewMode === "table"
                                        ? "text-slate-900 font-semibold"
                                        : "text-slate-400 hover:text-cyan-400"
                                }`}
                                style={viewMode === "table" ? { backgroundColor: "#22d3ee" } : {}}
                            >
                                <i className="fa-duotone fa-regular fa-table-list text-xs" />
                                <span className="hidden sm:inline">Table</span>
                            </button>
                            <button
                                onClick={() => handleViewChange("grid")}
                                className={`px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                                    viewMode === "grid"
                                        ? "text-slate-900 font-semibold"
                                        : "text-slate-400 hover:text-cyan-400"
                                }`}
                                style={viewMode === "grid" ? { backgroundColor: "#22d3ee" } : {}}
                            >
                                <i className="fa-duotone fa-regular fa-grid-2 text-xs" />
                                <span className="hidden sm:inline">Grid</span>
                            </button>
                            <button
                                onClick={() => handleViewChange("gmail")}
                                className={`px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                                    viewMode === "gmail"
                                        ? "text-slate-900 font-semibold"
                                        : "text-slate-400 hover:text-cyan-400"
                                }`}
                                style={viewMode === "gmail" ? { backgroundColor: "#22d3ee" } : {}}
                            >
                                <i className="fa-duotone fa-regular fa-columns-3 text-xs" />
                                <span className="hidden sm:inline">Split</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Content ── */}
                    <div ref={contentRef} className="bp-list-content opacity-0">
                        {filteredJobs.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 rounded-xl border border-cyan-500/20 flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: "rgba(34,211,238,0.05)" }}>
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-2xl text-cyan-500/30" />
                                </div>
                                <p className="text-slate-400 text-sm">No jobs match your search criteria.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setStatusFilter("all");
                                        setTypeFilter("all");
                                    }}
                                    className="mt-4 text-cyan-400 text-sm hover:underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : viewMode === "table" ? (
                            <TableView jobs={filteredJobs} selectedJob={selectedJob} onSelectJob={setSelectedJob} />
                        ) : viewMode === "grid" ? (
                            <GridView jobs={filteredJobs} selectedJob={selectedJob} onSelectJob={setSelectedJob} />
                        ) : (
                            <GmailView jobs={filteredJobs} selectedJob={selectedJob} onSelectJob={setSelectedJob} />
                        )}
                    </div>
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(34, 211, 238, 0.15);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(34, 211, 238, 0.3);
                }
            `}</style>
        </div>
    );
}

// ─── TABLE VIEW ─────────────────────────────────────────────────────────────
function TableView({
    jobs,
    selectedJob,
    onSelectJob,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelectJob: (job: JobListing | null) => void;
}) {
    return (
        <div className="flex gap-6">
            {/* Table */}
            <div className={`flex-1 min-w-0 rounded-xl border border-cyan-500/15 overflow-hidden transition-all duration-300 ${selectedJob ? "max-w-[calc(100%-440px)]" : "max-w-full"}`} style={{ backgroundColor: "#0d1d33" }}>
                {/* Blueprint label */}
                <div className="px-4 py-2 border-b border-cyan-500/10 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/30">
                        Table View // Data Grid
                    </span>
                    <div className="flex items-center gap-3">
                        {selectedJob && (
                            <span className="font-mono text-[10px] text-cyan-400/50">
                                <i className="fa-duotone fa-regular fa-arrow-right text-[8px] mr-1" />
                                Click row to view details
                            </span>
                        )}
                        <span className="font-mono text-[10px] text-cyan-500/30">{jobs.length} records</span>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-cyan-500/10">
                                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-cyan-500/50 font-medium">
                                    Title
                                </th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-cyan-500/50 font-medium">
                                    Company
                                </th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-cyan-500/50 font-medium hidden md:table-cell">
                                    Location
                                </th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-cyan-500/50 font-medium hidden lg:table-cell">
                                    Salary
                                </th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-cyan-500/50 font-medium">
                                    Status
                                </th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-cyan-500/50 font-medium hidden xl:table-cell">
                                    Posted
                                </th>
                                <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-cyan-500/50 font-medium hidden lg:table-cell">
                                    Applicants
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => {
                                const isSelected = selectedJob?.id === job.id;
                                return (
                                    <tr
                                        key={job.id}
                                        onClick={() => onSelectJob(isSelected ? null : job)}
                                        className={`border-b border-cyan-500/5 cursor-pointer transition-colors group ${
                                            isSelected
                                                ? "border-l-2 border-l-cyan-400"
                                                : "border-l-2 border-l-transparent hover:bg-cyan-500/[0.03]"
                                        }`}
                                        style={isSelected ? { backgroundColor: "rgba(34,211,238,0.05)" } : {}}
                                    >
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                {job.featured && (
                                                    <i className="fa-duotone fa-regular fa-star text-cyan-400 text-[10px]" />
                                                )}
                                                <span className={`font-medium transition-colors ${
                                                    isSelected ? "text-cyan-400" : "text-white group-hover:text-cyan-400"
                                                }`}>
                                                    {job.title}
                                                </span>
                                            </div>
                                            <div className="flex gap-1.5 mt-1">
                                                {job.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-[10px] font-mono text-cyan-500/40 border border-cyan-500/10 px-1.5 py-0.5 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {job.tags.length > 3 && (
                                                    <span className="text-[10px] font-mono text-cyan-500/30">
                                                        +{job.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-300">{job.company}</td>
                                        <td className="px-4 py-3.5 text-slate-400 hidden md:table-cell">
                                            <span className="flex items-center gap-1.5">
                                                <i className="fa-duotone fa-regular fa-location-dot text-cyan-500/30 text-[10px]" />
                                                {job.location}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-cyan-300 text-xs hidden lg:table-cell">
                                            {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="flex items-center gap-1.5">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: STATUS_COLORS[job.status] || "#22d3ee" }}
                                                />
                                                <span className="text-xs capitalize text-slate-400">{job.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500 text-xs font-mono hidden xl:table-cell">
                                            {timeAgo(job.postedDate)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono text-slate-400 text-xs hidden lg:table-cell">
                                            {job.applicants}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Bottom blueprint line */}
                <div className="px-4 py-2 border-t border-cyan-500/10 flex items-center gap-2">
                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                    <span className="font-mono text-[10px] text-cyan-500/20">END OF RECORDS</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                </div>
            </div>

            {/* Sidebar detail panel */}
            {selectedJob && (
                <div
                    className="hidden lg:block w-[420px] flex-shrink-0 rounded-xl border border-cyan-500/15 overflow-hidden sticky top-8 self-start"
                    style={{ backgroundColor: "#0d1d33", maxHeight: "calc(100vh - 4rem)" }}
                >
                    <DetailPanel job={selectedJob} onClose={() => onSelectJob(null)} />
                </div>
            )}
        </div>
    );
}

// ─── GRID VIEW ──────────────────────────────────────────────────────────────
function GridView({
    jobs,
    selectedJob,
    onSelectJob,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelectJob: (job: JobListing | null) => void;
}) {
    return (
        <div className="flex gap-6">
            {/* Cards grid */}
            <div className={`flex-1 transition-all duration-300 ${selectedJob ? "max-w-[55%]" : "max-w-full"}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" style={selectedJob ? { gridTemplateColumns: "repeat(2, 1fr)" } : {}}>
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => onSelectJob(job.id === selectedJob?.id ? null : job)}
                            className={`group relative cursor-pointer transition-all duration-200 ${
                                selectedJob?.id === job.id ? "ring-1 ring-cyan-400/50" : ""
                            }`}
                        >
                            {/* Isometric shadow */}
                            <div
                                className="absolute inset-0 rounded-xl translate-y-1 translate-x-1"
                                style={{ backgroundColor: "rgba(34,211,238,0.03)" }}
                            />
                            <div
                                className="relative rounded-xl p-5 border border-cyan-500/15 transition-all duration-200 group-hover:border-cyan-400/30 group-hover:-translate-y-0.5"
                                style={{ backgroundColor: "#0d1d33" }}
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: STATUS_COLORS[job.status] || "#22d3ee" }}
                                        />
                                        <span className="font-mono text-[10px] uppercase text-slate-500">{job.status}</span>
                                    </div>
                                    {job.featured && (
                                        <span className="font-mono text-[10px] text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-white text-sm mb-1 group-hover:text-cyan-400 transition-colors leading-tight">
                                    {job.title}
                                </h3>
                                <p className="text-cyan-400/70 text-xs font-medium mb-3">{job.company}</p>

                                <div className="space-y-1.5 text-xs text-slate-400 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-location-dot text-cyan-500/30 text-[10px] w-3 text-center" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-money-bill text-cyan-500/30 text-[10px] w-3 text-center" />
                                        <span className="font-mono text-cyan-300">
                                            {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                                        </span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {job.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] font-mono text-cyan-500/50 border border-cyan-500/10 px-1.5 py-0.5 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Bottom bar */}
                                <div className="flex items-center justify-between pt-3 border-t border-cyan-500/10">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={job.recruiter.avatar}
                                            alt={job.recruiter.name}
                                            className="w-5 h-5 rounded object-cover border border-cyan-500/20"
                                        />
                                        <span className="text-[10px] text-slate-500">{job.recruiter.name}</span>
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-500">
                                        {job.applicants} <span className="text-cyan-500/30">apps</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar detail panel */}
            {selectedJob && (
                <div
                    className="hidden lg:block w-[45%] max-w-[500px] rounded-xl border border-cyan-500/15 overflow-hidden sticky top-8 self-start"
                    style={{ backgroundColor: "#0d1d33", maxHeight: "calc(100vh - 4rem)" }}
                >
                    <DetailPanel job={selectedJob} onClose={() => onSelectJob(null)} />
                </div>
            )}
        </div>
    );
}

// ─── GMAIL VIEW ─────────────────────────────────────────────────────────────
function GmailView({
    jobs,
    selectedJob,
    onSelectJob,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelectJob: (job: JobListing) => void;
}) {
    return (
        <div className="flex gap-0 rounded-xl border border-cyan-500/15 overflow-hidden" style={{ backgroundColor: "#0d1d33", height: "calc(100vh - 280px)", minHeight: "500px" }}>
            {/* Left list */}
            <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-cyan-500/10 flex flex-col">
                {/* List header */}
                <div className="px-4 py-2.5 border-b border-cyan-500/10 flex items-center justify-between flex-shrink-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/30">
                        Inbox // {jobs.length} roles
                    </span>
                    <i className="fa-duotone fa-regular fa-inbox text-cyan-500/20 text-sm" />
                </div>

                {/* Job list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => onSelectJob(job)}
                            className={`px-4 py-3.5 border-b border-cyan-500/5 cursor-pointer transition-colors ${
                                selectedJob?.id === job.id
                                    ? "border-l-2 border-l-cyan-400"
                                    : "border-l-2 border-l-transparent hover:bg-cyan-500/[0.03]"
                            }`}
                            style={selectedJob?.id === job.id ? { backgroundColor: "rgba(34,211,238,0.05)" } : {}}
                        >
                            <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {job.featured && (
                                        <i className="fa-duotone fa-regular fa-star text-cyan-400 text-[10px] flex-shrink-0" />
                                    )}
                                    <span className={`text-sm font-medium truncate ${
                                        selectedJob?.id === job.id ? "text-cyan-400" : "text-white"
                                    }`}>
                                        {job.title}
                                    </span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-500 flex-shrink-0 ml-2">
                                    {timeAgo(job.postedDate)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs text-cyan-400/60 font-medium">{job.company}</span>
                                <span className="text-cyan-500/20 text-[10px]">//</span>
                                <span className="text-xs text-slate-500 truncate">{job.location}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: STATUS_COLORS[job.status] || "#22d3ee" }}
                                    />
                                    <span className="text-[10px] capitalize text-slate-500">{job.status}</span>
                                </div>
                                <span className="font-mono text-[10px] text-cyan-500/40">
                                    {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right detail panel */}
            <div className="hidden md:flex flex-1 flex-col">
                {selectedJob ? (
                    <DetailPanel job={selectedJob} />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-xl border border-cyan-500/15 flex items-center justify-center mx-auto mb-3"
                                style={{ backgroundColor: "rgba(34,211,238,0.05)" }}>
                                <i className="fa-duotone fa-regular fa-envelope-open text-xl text-cyan-500/20" />
                            </div>
                            <p className="text-slate-500 text-sm">Select a job to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
