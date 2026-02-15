"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(salary: JobListing["salary"]) {
    const fmt = (n: number) =>
        n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
    return `${salary.currency} ${fmt(salary.min)} - ${fmt(salary.max)}`;
}

function statusColor(status: JobListing["status"]) {
    switch (status) {
        case "open":
            return "text-success";
        case "filled":
            return "text-info";
        case "pending":
            return "text-warning";
        case "closed":
            return "text-error";
    }
}

function statusDot(status: JobListing["status"]) {
    switch (status) {
        case "open":
            return "bg-success";
        case "filled":
            return "bg-info";
        case "pending":
            return "bg-warning";
        case "closed":
            return "bg-error";
    }
}

function typeLabel(type: JobListing["type"]) {
    switch (type) {
        case "full-time":
            return "Full-Time";
        case "part-time":
            return "Part-Time";
        case "contract":
            return "Contract";
        case "remote":
            return "Remote";
    }
}

function daysAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1d ago";
    return `${days}d ago`;
}

// ─── View Types ───────────────────────────────────────────────────────────────

type ViewMode = "table" | "grid" | "gmail";

// ─── Sidebar Navigation ──────────────────────────────────────────────────────

const sidebarNav = [
    { key: "dashboard",    label: "Dashboard",    icon: "fa-duotone fa-regular fa-chart-tree-map" },
    { key: "roles",        label: "Roles",        icon: "fa-duotone fa-regular fa-briefcase",     active: true },
    { key: "recruiters",   label: "Recruiters",   icon: "fa-duotone fa-regular fa-user-tie" },
    { key: "candidates",   label: "Candidates",   icon: "fa-duotone fa-regular fa-users" },
    { key: "companies",    label: "Companies",    icon: "fa-duotone fa-regular fa-building" },
    { key: "applications", label: "Applications", icon: "fa-duotone fa-regular fa-file-lines" },
    { key: "messages",     label: "Messages",     icon: "fa-duotone fa-regular fa-comments" },
    { key: "placements",   label: "Placements",   icon: "fa-duotone fa-regular fa-handshake" },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ListsFivePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState<ViewMode>("table");
    const [search, setSearch] = useState("");
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Filter jobs
    const filtered = mockJobs.filter((job) => {
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            job.title.toLowerCase().includes(q) ||
            job.company.toLowerCase().includes(q) ||
            job.location.toLowerCase().includes(q) ||
            job.tags.some((t) => t.toLowerCase().includes(q));
        const matchesStatus =
            statusFilter === "all" || job.status === statusFilter;
        const matchesType = typeFilter === "all" || job.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // GSAP intro animation
    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                gsap.set(
                    containerRef.current.querySelectorAll(".opacity-0"),
                    { opacity: 1 },
                );
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            // Sidebar slides in
            tl.fromTo(
                ".sidebar-nav",
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.5 },
            );
            tl.fromTo(
                ".sidebar-nav-item",
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: 0.3, stagger: 0.04 },
                "-=0.3",
            );

            tl.fromTo(
                ".header-status",
                { opacity: 0 },
                { opacity: 1, duration: 0.3 },
                "-=0.2",
            );
            tl.fromTo(
                ".header-title",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
                "-=0.1",
            );
            tl.fromTo(
                ".header-sub",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.5 },
                "-=0.4",
            );
            tl.fromTo(
                ".toolbar-bar",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
                "-=0.2",
            );
            tl.fromTo(
                ".content-area",
                { opacity: 0 },
                { opacity: 1, duration: 0.4 },
                "-=0.1",
            );
        },
        { scope: containerRef },
    );

    // Animate content on view change
    useEffect(() => {
        if (!contentRef.current) return;
        gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
        );
    }, [view]);

    const handleSelect = useCallback(
        (job: JobListing) => {
            setSelectedJob((prev) => (prev?.id === job.id ? null : job));
        },
        [],
    );

    // ─── Render Helpers ───────────────────────────────────────────────────────

    const renderDetailPanel = (job: JobListing) => (
        <div className="detail-panel border border-[#27272a] bg-[#18181b]/80 rounded-xl p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-[#e5e7eb] mb-1">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[#e5e7eb]/60">
                        <i className="fa-duotone fa-regular fa-building text-info text-xs" />
                        {job.company}
                    </div>
                </div>
                <button
                    onClick={() => setSelectedJob(null)}
                    className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#09090b] flex items-center justify-center text-[#e5e7eb]/40 hover:text-[#e5e7eb] hover:border-info/30 transition-colors"
                >
                    <i className="fa-duotone fa-regular fa-xmark text-sm" />
                </button>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 border border-[#27272a] bg-[#09090b] px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/50">
                    <i className="fa-duotone fa-regular fa-location-dot text-info" />
                    {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5 border border-[#27272a] bg-[#09090b] px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/50">
                    <i className="fa-duotone fa-regular fa-money-bill text-success" />
                    {formatSalary(job.salary)}
                </span>
                <span className="inline-flex items-center gap-1.5 border border-[#27272a] bg-[#09090b] px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/50">
                    <i className="fa-duotone fa-regular fa-briefcase text-warning" />
                    {typeLabel(job.type)}
                </span>
                <span className={`inline-flex items-center gap-1.5 border border-[#27272a] bg-[#09090b] px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider ${statusColor(job.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(job.status)} ${job.status === "open" ? "animate-pulse" : ""}`} />
                    {job.status}
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="border border-[#27272a] bg-[#09090b] rounded-lg p-3 text-center">
                    <div className="font-mono text-lg font-bold text-[#e5e7eb]">{job.applicants}</div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/30">Applicants</div>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] rounded-lg p-3 text-center">
                    <div className="font-mono text-lg font-bold text-[#e5e7eb]">{job.views.toLocaleString()}</div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/30">Views</div>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] rounded-lg p-3 text-center">
                    <div className="font-mono text-lg font-bold text-[#e5e7eb]">{daysAgo(job.postedDate)}</div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/30">Posted</div>
                </div>
            </div>

            {/* Description */}
            <div className="mb-6">
                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-info/60 mb-3">Description</h4>
                <p className="text-sm leading-relaxed text-[#e5e7eb]/60">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="mb-6">
                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-warning/60 mb-3">Requirements</h4>
                <ul className="space-y-2">
                    {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#e5e7eb]/60">
                            <i className="fa-duotone fa-regular fa-terminal text-warning/40 text-[10px] mt-1 flex-shrink-0" />
                            {req}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Responsibilities */}
            <div className="mb-6">
                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-success/60 mb-3">Responsibilities</h4>
                <ul className="space-y-2">
                    {job.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#e5e7eb]/60">
                            <i className="fa-duotone fa-regular fa-chevron-right text-success/40 text-[10px] mt-1 flex-shrink-0" />
                            {resp}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Benefits */}
            <div className="mb-6">
                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-accent/60 mb-3">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                    {job.benefits.map((b, i) => (
                        <span key={i} className="border border-accent/20 bg-accent/5 px-2.5 py-1 rounded-lg font-mono text-[10px] text-accent/70">
                            {b}
                        </span>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, i) => (
                        <span key={i} className="border border-[#27272a] bg-[#09090b] px-2.5 py-1 rounded-lg font-mono text-[10px] text-[#e5e7eb]/50">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Recruiter */}
            <div className="border-t border-[#27272a]/50 pt-4">
                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-3">Recruiter</h4>
                <div className="flex items-center gap-3">
                    <img
                        src={job.recruiter.avatar}
                        alt={job.recruiter.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#27272a]"
                    />
                    <div>
                        <div className="text-sm font-bold text-[#e5e7eb]">{job.recruiter.name}</div>
                        <div className="font-mono text-[10px] text-[#e5e7eb]/40 uppercase tracking-wider">{job.recruiter.agency}</div>
                    </div>
                </div>
            </div>

            {/* Equity if present */}
            {job.equity && (
                <div className="mt-4 pt-4 border-t border-[#27272a]/50">
                    <div className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-chart-pie text-info text-xs" />
                        <span className="font-mono text-xs text-[#e5e7eb]/50">Equity: {job.equity}</span>
                    </div>
                </div>
            )}
        </div>
    );

    // ─── TABLE VIEW ───────────────────────────────────────────────────────────

    const renderTable = () => (
        <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_140px_160px_140px_80px] gap-0 border-b border-[#27272a] bg-[#09090b]/60">
                <div className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30">Title / Company</div>
                <div className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30">Location</div>
                <div className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30">Salary</div>
                <div className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30">Type</div>
                <div className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30 text-center">Status</div>
            </div>

            {/* Table rows */}
            {filtered.map((job) => (
                <div
                    key={job.id}
                    onClick={() => handleSelect(job)}
                    className={`grid grid-cols-[1fr_140px_160px_140px_80px] gap-0 border-b border-[#27272a]/40 last:border-0 cursor-pointer transition-colors ${
                        selectedJob?.id === job.id
                            ? "bg-info/5 border-l-2 border-l-info"
                            : "hover:bg-[#e5e7eb]/[0.02]"
                    }`}
                >
                    <div className="px-4 py-3.5 flex items-center gap-3 min-w-0">
                        {job.featured && (
                            <i className="fa-duotone fa-regular fa-star text-warning text-xs flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-[#e5e7eb] truncate">{job.title}</div>
                            <div className="text-xs text-[#e5e7eb]/40 truncate">{job.company}</div>
                        </div>
                    </div>
                    <div className="px-4 py-3.5 flex items-center">
                        <span className="text-xs text-[#e5e7eb]/50 truncate">{job.location}</span>
                    </div>
                    <div className="px-4 py-3.5 flex items-center">
                        <span className="font-mono text-xs text-[#e5e7eb]/60">{formatSalary(job.salary)}</span>
                    </div>
                    <div className="px-4 py-3.5 flex items-center">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40">{typeLabel(job.type)}</span>
                    </div>
                    <div className="px-4 py-3.5 flex items-center justify-center">
                        <span className={`w-2 h-2 rounded-full ${statusDot(job.status)} ${job.status === "open" ? "animate-pulse" : ""}`} />
                    </div>
                </div>
            ))}

            {filtered.length === 0 && (
                <div className="px-4 py-12 text-center">
                    <i className="fa-duotone fa-regular fa-radar text-2xl text-[#e5e7eb]/20 mb-3 block" />
                    <div className="font-mono text-sm text-[#e5e7eb]/30">No signals detected</div>
                    <div className="font-mono text-[10px] text-[#e5e7eb]/15 mt-1 uppercase tracking-wider">Adjust filters to scan wider</div>
                </div>
            )}
        </div>
    );

    // ─── GRID VIEW ────────────────────────────────────────────────────────────

    const renderGrid = () => (
        <div className={`flex gap-6 ${selectedJob ? "" : ""}`}>
            {/* Cards grid */}
            <div className={`flex-1 grid ${selectedJob ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
                {filtered.map((job) => (
                    <div
                        key={job.id}
                        onClick={() => handleSelect(job)}
                        className={`border rounded-xl p-5 cursor-pointer transition-all ${
                            selectedJob?.id === job.id
                                ? "border-info/40 bg-info/5"
                                : "border-[#27272a] bg-[#18181b]/40 hover:border-[#e5e7eb]/10 hover:bg-[#18181b]/60"
                        }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {job.featured && <i className="fa-duotone fa-regular fa-star text-warning text-xs" />}
                                    <h3 className="text-sm font-bold text-[#e5e7eb] truncate">{job.title}</h3>
                                </div>
                                <div className="text-xs text-[#e5e7eb]/40">{job.company}</div>
                            </div>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${statusDot(job.status)} ${job.status === "open" ? "animate-pulse" : ""}`} />
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[#e5e7eb]/40 mb-4">
                            <span className="flex items-center gap-1">
                                <i className="fa-duotone fa-regular fa-location-dot text-[10px]" />
                                {job.location}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-info/70">{formatSalary(job.salary)}</span>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/25">{typeLabel(job.type)}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#27272a]/40">
                            {job.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="font-mono text-[9px] text-[#e5e7eb]/30 border border-[#27272a]/50 px-1.5 py-0.5 rounded">
                                    {tag}
                                </span>
                            ))}
                            {job.tags.length > 3 && (
                                <span className="font-mono text-[9px] text-[#e5e7eb]/20">+{job.tags.length - 3}</span>
                            )}
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full px-4 py-16 text-center">
                        <i className="fa-duotone fa-regular fa-radar text-2xl text-[#e5e7eb]/20 mb-3 block" />
                        <div className="font-mono text-sm text-[#e5e7eb]/30">No signals detected</div>
                    </div>
                )}
            </div>

            {/* Sidebar detail */}
            {selectedJob && (
                <div className="hidden lg:block w-[400px] flex-shrink-0 sticky top-4 self-start max-h-[calc(100vh-200px)]">
                    {renderDetailPanel(selectedJob)}
                </div>
            )}
        </div>
    );

    // ─── GMAIL VIEW ───────────────────────────────────────────────────────────

    const renderGmail = () => (
        <div className="flex gap-0 border border-[#27272a] rounded-xl overflow-hidden bg-[#18181b]/40 min-h-[600px]">
            {/* Left list */}
            <div className={`${selectedJob ? "w-[360px] flex-shrink-0" : "flex-1"} border-r border-[#27272a] overflow-y-auto max-h-[calc(100vh-280px)]`}>
                {filtered.map((job) => (
                    <div
                        key={job.id}
                        onClick={() => handleSelect(job)}
                        className={`px-4 py-3.5 border-b border-[#27272a]/40 cursor-pointer transition-colors ${
                            selectedJob?.id === job.id
                                ? "bg-info/5 border-l-2 border-l-info"
                                : "hover:bg-[#e5e7eb]/[0.02]"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {job.featured && <i className="fa-duotone fa-regular fa-star text-warning text-[10px]" />}
                                <span className="text-sm font-bold text-[#e5e7eb] truncate">{job.title}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                <span className="font-mono text-[10px] text-[#e5e7eb]/25">{daysAgo(job.postedDate)}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot(job.status)} ${job.status === "open" ? "animate-pulse" : ""}`} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs text-[#e5e7eb]/40 truncate">{job.company}</span>
                            <span className="text-[#e5e7eb]/15">-</span>
                            <span className="text-xs text-[#e5e7eb]/30 truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-info/50">{formatSalary(job.salary)}</span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/20">{typeLabel(job.type)}</span>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="px-4 py-16 text-center">
                        <i className="fa-duotone fa-regular fa-radar text-2xl text-[#e5e7eb]/20 mb-3 block" />
                        <div className="font-mono text-sm text-[#e5e7eb]/30">No signals detected</div>
                    </div>
                )}
            </div>

            {/* Right detail panel */}
            {selectedJob ? (
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                    {renderDetailPanel(selectedJob)}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-xl border border-[#27272a] bg-[#09090b] flex items-center justify-center mx-auto mb-4">
                            <i className="fa-duotone fa-regular fa-arrow-left text-xl text-[#e5e7eb]/15" />
                        </div>
                        <div className="font-mono text-sm text-[#e5e7eb]/25">Select a listing</div>
                        <div className="font-mono text-[10px] text-[#e5e7eb]/15 mt-1 uppercase tracking-wider">
                            Click a job to view details
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // ─── Main Render ──────────────────────────────────────────────────────────

    return (
        <div ref={containerRef} className="min-h-screen bg-[#09090b] text-[#e5e7eb] flex">
            {/* Scanline overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                }}
            />

            {/* ═══════════ MOBILE SIDEBAR OVERLAY ═══════════ */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ═══════════ SIDEBAR ═══════════ */}
            <aside
                className={`sidebar-nav fixed lg:sticky top-0 left-0 z-40 lg:z-auto h-screen w-[220px] flex-shrink-0 bg-[#0a0a0c] border-r border-[#27272a] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } opacity-0`}
            >
                {/* Sidebar header */}
                <div className="px-4 py-5 border-b border-[#27272a]/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg border border-info/30 bg-info/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-satellite-dish text-info text-sm" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-[#e5e7eb]">Observatory</div>
                            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e5e7eb]/25">Mission Control</div>
                        </div>
                        {/* Mobile close */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto lg:hidden w-7 h-7 rounded-lg border border-[#27272a] flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb] transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-xs" />
                        </button>
                    </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                    {sidebarNav.map((item) => (
                        <button
                            key={item.key}
                            className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors opacity-0 ${
                                item.active
                                    ? "bg-info/10 text-info border border-info/20"
                                    : "text-[#e5e7eb]/40 hover:text-[#e5e7eb]/70 hover:bg-[#e5e7eb]/[0.03] border border-transparent"
                            }`}
                        >
                            <i className={`${item.icon} text-sm w-4 text-center ${item.active ? "text-info" : ""}`} />
                            <span className={`text-sm ${item.active ? "font-bold" : "font-medium"}`}>
                                {item.label}
                            </span>
                            {item.active && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar footer */}
                <div className="px-4 py-4 border-t border-[#27272a]/60">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/20">
                            Online
                        </span>
                    </div>
                    <div className="font-mono text-[9px] text-[#e5e7eb]/15 uppercase tracking-wider">
                        v2.4.1
                    </div>
                </div>
            </aside>

            {/* ═══════════ MAIN CONTENT ═══════════ */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* ═══════════ HEADER ═══════════ */}
                <header className="border-b border-[#27272a] bg-[#09090b]">
                    <div className="px-4 lg:px-6 py-6">
                        {/* Status bar */}
                        <div className="header-status flex items-center gap-3 mb-4 opacity-0">
                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/40 hover:text-[#e5e7eb] hover:border-info/30 transition-colors mr-1"
                            >
                                <i className="fa-duotone fa-regular fa-bars text-sm" />
                            </button>
                            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">
                                Observatory Online
                            </span>
                            <span className="font-mono text-xs text-[#e5e7eb]/30 ml-auto">
                                v2.4.1 // job-listings
                            </span>
                        </div>

                        <h1 className="header-title text-3xl md:text-4xl font-bold mb-2 opacity-0">
                            <span className="text-[#e5e7eb]">Job </span>
                            <span className="text-info">Listings</span>
                        </h1>
                        <p className="header-sub text-sm text-[#e5e7eb]/40 font-mono uppercase tracking-wider opacity-0">
                            {filtered.length} signals detected across the network
                        </p>
                    </div>
                </header>

                {/* ═══════════ TOOLBAR ═══════════ */}
                <div className="toolbar-bar border-b border-[#27272a] bg-[#0a0a0c] sticky top-0 z-30 opacity-0">
                    <div className="px-4 lg:px-6 py-3 flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#e5e7eb]/20 text-xs" />
                            <input
                                type="text"
                                placeholder="Search signals..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-9 pr-3 py-2 text-sm text-[#e5e7eb] placeholder-[#e5e7eb]/20 font-mono focus:outline-none focus:border-info/30 transition-colors"
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e5e7eb]/60 font-mono focus:outline-none focus:border-info/30 transition-colors appearance-none cursor-pointer"
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
                            className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e5e7eb]/60 font-mono focus:outline-none focus:border-info/30 transition-colors appearance-none cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            <option value="full-time">Full-Time</option>
                            <option value="part-time">Part-Time</option>
                            <option value="contract">Contract</option>
                            <option value="remote">Remote</option>
                        </select>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* View toggle */}
                        <div className="flex items-center border border-[#27272a] rounded-lg overflow-hidden">
                            <button
                                onClick={() => { setView("table"); setSelectedJob(null); }}
                                className={`px-3 py-2 text-xs transition-colors ${
                                    view === "table"
                                        ? "bg-info/10 text-info border-r border-info/20"
                                        : "text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 border-r border-[#27272a]"
                                }`}
                                title="Table View"
                            >
                                <i className="fa-duotone fa-regular fa-table-list" />
                            </button>
                            <button
                                onClick={() => { setView("grid"); setSelectedJob(null); }}
                                className={`px-3 py-2 text-xs transition-colors ${
                                    view === "grid"
                                        ? "bg-info/10 text-info border-r border-info/20"
                                        : "text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 border-r border-[#27272a]"
                                }`}
                                title="Grid View"
                            >
                                <i className="fa-duotone fa-regular fa-grid-2" />
                            </button>
                            <button
                                onClick={() => { setView("gmail"); setSelectedJob(null); }}
                                className={`px-3 py-2 text-xs transition-colors ${
                                    view === "gmail"
                                        ? "bg-info/10 text-info"
                                        : "text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60"
                                }`}
                                title="Split View"
                            >
                                <i className="fa-duotone fa-regular fa-table-columns" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══════════ CONTENT ═══════════ */}
                <main className="content-area flex-1 opacity-0">
                    <div className="px-4 lg:px-6 py-6">
                        {/* Summary bar */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                                <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/30">
                                    {filtered.length} of {mockJobs.length} listings
                                </span>
                            </div>
                            {selectedJob && view === "table" && (
                                <span className="font-mono text-[10px] uppercase tracking-wider text-info/50">
                                    <i className="fa-duotone fa-regular fa-signal-stream mr-1" />
                                    {selectedJob.title} selected
                                </span>
                            )}
                        </div>

                        {/* View content */}
                        <div ref={contentRef}>
                            {view === "table" && (
                                <div className="flex gap-6">
                                    <div className="flex-1 overflow-x-auto">{renderTable()}</div>
                                    {selectedJob && (
                                        <div className="hidden lg:block w-[400px] flex-shrink-0 sticky top-[72px] self-start max-h-[calc(100vh-120px)]">
                                            {renderDetailPanel(selectedJob)}
                                        </div>
                                    )}
                                </div>
                            )}
                            {view === "grid" && renderGrid()}
                            {view === "gmail" && renderGmail()}
                        </div>
                    </div>
                </main>

                {/* ═══════════ FOOTER ═══════════ */}
                <footer className="border-t border-[#27272a] bg-[#09090b] py-6 mt-auto">
                    <div className="px-4 lg:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/20">
                                All systems operational
                            </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#e5e7eb]/15 uppercase tracking-wider">
                            Employment Networks // Data Observatory
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
