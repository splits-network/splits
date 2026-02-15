"use client";

import { useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type ViewMode = "table" | "grid" | "gmail";

/* ─── Sidebar Navigation ────────────────────────────────────────────────────── */

const sidebarNavItems = [
    { key: "dashboard", label: "Dashboard", icon: "fa-duotone fa-regular fa-objects-column", active: false },
    { key: "roles", label: "Roles", icon: "fa-duotone fa-regular fa-briefcase", active: true },
    { key: "recruiters", label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie", active: false },
    { key: "candidates", label: "Candidates", icon: "fa-duotone fa-regular fa-users", active: false },
    { key: "companies", label: "Companies", icon: "fa-duotone fa-regular fa-building", active: false },
    { key: "applications", label: "Applications", icon: "fa-duotone fa-regular fa-file-lines", active: false },
    { key: "messages", label: "Messages", icon: "fa-duotone fa-regular fa-envelope", active: false },
    { key: "placements", label: "Placements", icon: "fa-duotone fa-regular fa-handshake", active: false },
];

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function formatSalary(salary: JobListing["salary"]): string {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: salary.currency,
            maximumFractionDigits: 0,
        }).format(n);
    return `${fmt(salary.min)} - ${fmt(salary.max)}`;
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
            return "text-success";
        case "filled":
            return "text-info";
        case "pending":
            return "text-warning";
        case "closed":
            return "text-error";
    }
}

function typeLabel(type: JobListing["type"]): string {
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

function experienceLabel(level: JobListing["experienceLevel"]): string {
    switch (level) {
        case "entry":
            return "Entry Level";
        case "mid":
            return "Mid Level";
        case "senior":
            return "Senior";
        case "executive":
            return "Executive";
    }
}

/* ─── Detail Panel (shared between Grid + Gmail sidebar/overlay views) ──── */

function DetailPanel({ job, onClose }: { job: JobListing; onClose?: () => void }) {
    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-8 border-b border-base-300">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-base-content/40 hover:text-base-content transition-colors mb-4 block lg:hidden"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left mr-2" />
                        Back to list
                    </button>
                )}
                <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs uppercase tracking-[0.2em] font-medium ${statusColor(job.status)}`}>
                        {job.status}
                    </span>
                    <span className="w-1 h-1 bg-base-content/20 rounded-full" />
                    <span className="text-xs uppercase tracking-[0.15em] text-base-content/40">
                        {typeLabel(job.type)}
                    </span>
                    {job.featured && (
                        <>
                            <span className="w-1 h-1 bg-base-content/20 rounded-full" />
                            <span className="text-xs uppercase tracking-[0.15em] text-secondary font-medium">
                                Featured
                            </span>
                        </>
                    )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-base-content tracking-tight leading-tight mb-2">
                    {job.title}
                </h2>
                <p className="text-lg text-base-content/60 mb-1">{job.company}</p>
                <div className="flex flex-wrap gap-4 text-sm text-base-content/50 mt-4">
                    <span>
                        <i className="fa-duotone fa-regular fa-location-dot mr-1.5 text-secondary" />
                        {job.location}
                    </span>
                    <span>
                        <i className="fa-duotone fa-regular fa-money-bill mr-1.5 text-secondary" />
                        {formatSalary(job.salary)}
                    </span>
                    <span>
                        <i className="fa-duotone fa-regular fa-briefcase mr-1.5 text-secondary" />
                        {experienceLabel(job.experienceLevel)}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8">
                {/* Description */}
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                        About This Role
                    </p>
                    <p className="text-base-content/70 leading-relaxed">{job.description}</p>
                </div>

                {/* Requirements */}
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                        Requirements
                    </p>
                    <ul className="space-y-2">
                        {job.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3 text-base-content/70">
                                <i className="fa-duotone fa-regular fa-check text-secondary text-xs mt-1.5 shrink-0" />
                                <span>{req}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Responsibilities */}
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                        Responsibilities
                    </p>
                    <ul className="space-y-2">
                        {job.responsibilities.map((resp, i) => (
                            <li key={i} className="flex items-start gap-3 text-base-content/70">
                                <i className="fa-duotone fa-regular fa-circle-dot text-secondary/50 text-xs mt-1.5 shrink-0" />
                                <span>{resp}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Benefits */}
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                        Benefits
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {job.benefits.map((benefit) => (
                            <span
                                key={benefit}
                                className="text-xs uppercase tracking-[0.1em] text-base-content/50 border border-base-300 px-3 py-1.5"
                            >
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                        Skills & Technologies
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs font-medium text-secondary border border-secondary/30 px-3 py-1.5"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Equity */}
                {job.equity && (
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                            Equity Range
                        </p>
                        <p className="text-base-content/70 font-semibold">{job.equity}</p>
                    </div>
                )}

                <div className="h-px bg-base-300" />

                {/* Recruiter */}
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">
                        Posted By
                    </p>
                    <div className="flex items-center gap-4">
                        <img
                            src={job.recruiter.avatar}
                            alt={job.recruiter.name}
                            className="w-12 h-12 object-cover rounded-full"
                        />
                        <div>
                            <p className="font-semibold text-base-content">{job.recruiter.name}</p>
                            <p className="text-sm text-base-content/50">{job.recruiter.agency}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-4">
                    <div>
                        <p className="text-2xl font-bold text-primary">{job.applicants}</p>
                        <p className="text-xs uppercase tracking-[0.15em] text-base-content/40 mt-1">
                            Applicants
                        </p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-primary">{job.views.toLocaleString()}</p>
                        <p className="text-xs uppercase tracking-[0.15em] text-base-content/40 mt-1">
                            Views
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-base-content/60">{formatDate(job.postedDate)}</p>
                        <p className="text-xs uppercase tracking-[0.15em] text-base-content/40 mt-1">
                            Posted
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-base-content/60">{formatDate(job.deadline)}</p>
                        <p className="text-xs uppercase tracking-[0.15em] text-base-content/40 mt-1">
                            Deadline
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function ListsPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Unique filter values
    const departments = [...new Set(mockJobs.map((j) => j.department))].sort();

    const filteredJobs = mockJobs.filter((job) => {
        const matchesSearch =
            searchQuery === "" ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === "all" || job.status === statusFilter;
        const matchesType = typeFilter === "all" || job.type === typeFilter;
        const matchesDept = departmentFilter === "all" || job.department === departmentFilter;

        return matchesSearch && matchesStatus && matchesType && matchesDept;
    });

    // Animate on initial mount
    useGSAP(
        () => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            gsap.from("[data-hero-text]", {
                y: 60,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
            });

            gsap.from("[data-controls]", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                delay: 0.4,
                ease: "power2.out",
            });

            gsap.from("[data-sidebar-item]", {
                x: -20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                delay: 0.3,
                ease: "power2.out",
            });
        },
        { scope: containerRef },
    );

    // Animate content when view mode changes
    const animateContent = useCallback(() => {
        if (!contentRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        );
    }, []);

    const handleViewChange = useCallback(
        (mode: ViewMode) => {
            if (mode === viewMode) return;
            setViewMode(mode);
            setSelectedJob(null);
            // Small delay to let React render the new view
            requestAnimationFrame(() => animateContent());
        },
        [viewMode, animateContent],
    );

    const handleSelectJob = useCallback((job: JobListing) => {
        setSelectedJob((prev) => (prev?.id === job.id ? null : job));
    }, []);

    return (
        <div ref={containerRef} className="overflow-hidden min-h-screen bg-base-100">
            {/* ─── Hero ────────────────────────────────────────────────────── */}
            <section className="relative py-20 md:py-28 bg-neutral text-neutral-content">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p
                        data-hero-text
                        className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4"
                    >
                        Job Listings
                    </p>
                    <h1
                        data-hero-text
                        className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight mb-6"
                    >
                        Open
                        <br />
                        Positions
                    </h1>
                    <p
                        data-hero-text
                        className="text-lg md:text-xl text-neutral-content/70 max-w-xl leading-relaxed"
                    >
                        Browse current opportunities across the network. Find roles
                        matched to your skills and experience.
                    </p>
                </div>
            </section>

            {/* ─── Main Layout: Sidebar + Content ─────────────────────────── */}
            <div className="flex min-h-[calc(100vh-200px)]">
                {/* ─── Sidebar (Desktop) ─────────────────────────────────── */}
                <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-neutral border-r border-neutral-content/10">
                    {/* Brand / Section label */}
                    <div className="px-6 pt-8 pb-6">
                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium">
                            Navigation
                        </p>
                    </div>

                    {/* Nav items */}
                    <nav className="flex-1 px-3">
                        {sidebarNavItems.map((item) => (
                            <button
                                key={item.key}
                                data-sidebar-item
                                className={`w-full flex items-center gap-3 px-4 py-3 mb-0.5 text-sm transition-colors text-left ${
                                    item.active
                                        ? "bg-secondary text-secondary-content font-semibold"
                                        : "text-neutral-content/60 hover:text-neutral-content hover:bg-neutral-content/5"
                                }`}
                            >
                                <i className={`${item.icon} w-5 text-center text-base`} />
                                <span>{item.label}</span>
                                {item.active && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-secondary-content rounded-full" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Sidebar footer */}
                    <div className="px-6 py-6 border-t border-neutral-content/10">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-content/30">
                            Splits Network
                        </p>
                    </div>
                </aside>

                {/* ─── Mobile Sidebar Overlay ─────────────────────────────── */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-neutral/60"
                            onClick={() => setSidebarOpen(false)}
                        />
                        {/* Drawer */}
                        <aside className="relative w-64 h-full bg-neutral flex flex-col">
                            {/* Close button */}
                            <div className="flex items-center justify-between px-6 pt-6 pb-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium">
                                    Navigation
                                </p>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-neutral-content/40 hover:text-neutral-content transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark text-lg" />
                                </button>
                            </div>

                            {/* Nav items */}
                            <nav className="flex-1 px-3 pt-2">
                                {sidebarNavItems.map((item) => (
                                    <button
                                        key={item.key}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 mb-0.5 text-sm transition-colors text-left ${
                                            item.active
                                                ? "bg-secondary text-secondary-content font-semibold"
                                                : "text-neutral-content/60 hover:text-neutral-content hover:bg-neutral-content/5"
                                        }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <i className={`${item.icon} w-5 text-center text-base`} />
                                        <span>{item.label}</span>
                                        {item.active && (
                                            <div className="ml-auto w-1.5 h-1.5 bg-secondary-content rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </nav>

                            {/* Drawer footer */}
                            <div className="px-6 py-6 border-t border-neutral-content/10">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-content/30">
                                    Splits Network
                                </p>
                            </div>
                        </aside>
                    </div>
                )}

                {/* ─── Right Content Column ───────────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* ─── Controls Bar ──────────────────────────────────── */}
                    <section data-controls className="bg-base-200 py-6 border-b border-base-300 sticky top-0 z-30">
                        <div className="px-6 md:px-12">
                            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                {/* Search + Filters */}
                                <div className="flex flex-wrap gap-3 items-center flex-1">
                                    {/* Mobile sidebar toggle */}
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="lg:hidden text-base-content/50 hover:text-base-content transition-colors mr-1"
                                        title="Open navigation"
                                    >
                                        <i className="fa-duotone fa-regular fa-bars text-lg" />
                                    </button>

                                    {/* Search */}
                                    <div className="relative">
                                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
                                        <input
                                            type="text"
                                            placeholder="Search jobs..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="input input-sm bg-base-100 border-base-300 pl-9 pr-4 w-56 text-sm focus:border-secondary focus:outline-none"
                                        />
                                    </div>

                                    {/* Status filter */}
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="select select-sm bg-base-100 border-base-300 text-sm focus:border-secondary focus:outline-none"
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
                                        className="select select-sm bg-base-100 border-base-300 text-sm focus:border-secondary focus:outline-none"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="full-time">Full-Time</option>
                                        <option value="part-time">Part-Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="remote">Remote</option>
                                    </select>

                                    {/* Department filter */}
                                    <select
                                        value={departmentFilter}
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                        className="select select-sm bg-base-100 border-base-300 text-sm focus:border-secondary focus:outline-none"
                                    >
                                        <option value="all">All Departments</option>
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Results count */}
                                    <span className="text-xs uppercase tracking-[0.15em] text-base-content/40 ml-2">
                                        {filteredJobs.length} {filteredJobs.length === 1 ? "result" : "results"}
                                    </span>
                                </div>

                                {/* View mode toggle */}
                                <div className="flex items-center border border-base-300 divide-x divide-base-300">
                                    <button
                                        onClick={() => handleViewChange("table")}
                                        className={`px-4 py-2 text-sm transition-colors ${
                                            viewMode === "table"
                                                ? "bg-secondary text-secondary-content"
                                                : "bg-base-100 text-base-content/50 hover:text-base-content"
                                        }`}
                                        title="Table View"
                                    >
                                        <i className="fa-duotone fa-regular fa-table-list mr-2" />
                                        Table
                                    </button>
                                    <button
                                        onClick={() => handleViewChange("grid")}
                                        className={`px-4 py-2 text-sm transition-colors ${
                                            viewMode === "grid"
                                                ? "bg-secondary text-secondary-content"
                                                : "bg-base-100 text-base-content/50 hover:text-base-content"
                                        }`}
                                        title="Grid View"
                                    >
                                        <i className="fa-duotone fa-regular fa-grid-2 mr-2" />
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => handleViewChange("gmail")}
                                        className={`px-4 py-2 text-sm transition-colors ${
                                            viewMode === "gmail"
                                                ? "bg-secondary text-secondary-content"
                                                : "bg-base-100 text-base-content/50 hover:text-base-content"
                                        }`}
                                        title="Split View"
                                    >
                                        <i className="fa-duotone fa-regular fa-columns-3 mr-2" />
                                        Split
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── Content Area ──────────────────────────────────── */}
                    <div ref={contentRef} className="flex-1">
                        {filteredJobs.length === 0 ? (
                            <div className="py-32 text-center px-6">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-4xl text-base-content/20 mb-6 block" />
                                <p className="text-xl font-bold text-base-content/40 mb-2">No jobs found</p>
                                <p className="text-base-content/30">
                                    Try adjusting your search or filters.
                                </p>
                            </div>
                        ) : viewMode === "table" ? (
                            <TableView
                                jobs={filteredJobs}
                                selectedJob={selectedJob}
                                onSelectJob={handleSelectJob}
                            />
                        ) : viewMode === "grid" ? (
                            <GridView
                                jobs={filteredJobs}
                                selectedJob={selectedJob}
                                onSelectJob={handleSelectJob}
                            />
                        ) : (
                            <GmailView
                                jobs={filteredJobs}
                                selectedJob={selectedJob}
                                onSelectJob={handleSelectJob}
                            />
                        )}
                    </div>

                    {/* ─── Colophon ──────────────────────────────────────── */}
                    <section className="bg-base-200 py-12 mt-auto">
                        <div className="px-6 md:px-12 text-center">
                            <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">
                                Splits Network &middot; Applicant Network &middot;
                                Employment Networks
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Table View
   ═══════════════════════════════════════════════════════════════════════════════ */

function TableView({
    jobs,
    selectedJob,
    onSelectJob,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelectJob: (job: JobListing) => void;
}) {
    return (
        <div className="px-6 md:px-12 py-8">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-base-300">
                            <th className="text-left text-xs uppercase tracking-[0.2em] text-base-content/40 font-medium py-4 pr-4 w-8" />
                            <th className="text-left text-xs uppercase tracking-[0.2em] text-base-content/40 font-medium py-4 pr-4">
                                Title
                            </th>
                            <th className="text-left text-xs uppercase tracking-[0.2em] text-base-content/40 font-medium py-4 pr-4">
                                Company
                            </th>
                            <th className="text-left text-xs uppercase tracking-[0.2em] text-base-content/40 font-medium py-4 pr-4 hidden md:table-cell">
                                Location
                            </th>
                            <th className="text-left text-xs uppercase tracking-[0.2em] text-base-content/40 font-medium py-4 pr-4 hidden lg:table-cell">
                                Salary
                            </th>
                            <th className="text-left text-xs uppercase tracking-[0.2em] text-base-content/40 font-medium py-4 pr-4 hidden lg:table-cell">
                                Type
                            </th>
                            <th className="text-left text-xs uppercase tracking-[0.2em] text-base-content/40 font-medium py-4">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job) => {
                            const isSelected = selectedJob?.id === job.id;
                            return (
                                <TableRow
                                    key={job.id}
                                    job={job}
                                    isSelected={isSelected}
                                    onSelect={() => onSelectJob(job)}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─── Table Row with Expandable Detail ───────────────────────────────────── */

function TableRow({
    job,
    isSelected,
    onSelect,
}: {
    job: JobListing;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const detailRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!detailRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            if (isSelected) {
                gsap.fromTo(
                    detailRef.current,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
                );
            }
        },
        { dependencies: [isSelected] },
    );

    return (
        <>
            <tr
                onClick={onSelect}
                className={`border-b border-base-300/50 transition-colors group cursor-pointer ${
                    isSelected
                        ? "bg-base-200"
                        : "hover:bg-base-200/50"
                }`}
            >
                {/* Expand indicator */}
                <td className="py-5 pr-2 w-8">
                    <i
                        className={`fa-duotone fa-regular fa-chevron-right text-xs text-base-content/30 transition-transform duration-200 ${
                            isSelected ? "rotate-90 text-secondary" : ""
                        }`}
                    />
                </td>
                <td className="py-5 pr-4">
                    <div className="flex items-center gap-3">
                        {job.featured && (
                            <i className="fa-duotone fa-regular fa-star text-secondary text-xs shrink-0" />
                        )}
                        <div>
                            <p className={`font-semibold transition-colors ${
                                isSelected
                                    ? "text-secondary"
                                    : "text-base-content group-hover:text-secondary"
                            }`}>
                                {job.title}
                            </p>
                            <p className="text-xs text-base-content/40 mt-0.5">
                                {job.department} &middot; {experienceLabel(job.experienceLevel)}
                            </p>
                        </div>
                    </div>
                </td>
                <td className="py-5 pr-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={job.recruiter.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover hidden sm:block"
                        />
                        <span className="text-sm text-base-content/70">{job.company}</span>
                    </div>
                </td>
                <td className="py-5 pr-4 hidden md:table-cell">
                    <span className="text-sm text-base-content/60">{job.location}</span>
                </td>
                <td className="py-5 pr-4 hidden lg:table-cell">
                    <span className="text-sm text-base-content/70 font-medium">
                        {formatSalary(job.salary)}
                    </span>
                </td>
                <td className="py-5 pr-4 hidden lg:table-cell">
                    <span className="text-xs uppercase tracking-[0.1em] text-base-content/50 border border-base-300 px-2.5 py-1">
                        {typeLabel(job.type)}
                    </span>
                </td>
                <td className="py-5">
                    <span className={`text-xs uppercase tracking-[0.15em] font-medium ${statusColor(job.status)}`}>
                        {job.status}
                    </span>
                </td>
            </tr>

            {/* Expandable detail row */}
            {isSelected && (
                <tr className="border-b border-base-300">
                    <td colSpan={7} className="p-0">
                        <div ref={detailRef} className="bg-base-200/50 border-l-4 border-secondary">
                            <div className="p-8 md:p-10">
                                {/* Top: Description + Meta */}
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mb-10">
                                    {/* Description (wide column) */}
                                    <div className="lg:col-span-3">
                                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                                            About This Role
                                        </p>
                                        <p className="text-base-content/70 leading-relaxed mb-6">
                                            {job.description}
                                        </p>

                                        {/* Key info bar */}
                                        <div className="flex flex-wrap gap-6 text-sm text-base-content/50">
                                            <span>
                                                <i className="fa-duotone fa-regular fa-location-dot mr-1.5 text-secondary" />
                                                {job.location}
                                            </span>
                                            <span>
                                                <i className="fa-duotone fa-regular fa-money-bill mr-1.5 text-secondary" />
                                                {formatSalary(job.salary)}
                                            </span>
                                            <span>
                                                <i className="fa-duotone fa-regular fa-briefcase mr-1.5 text-secondary" />
                                                {experienceLabel(job.experienceLevel)}
                                            </span>
                                            {job.equity && (
                                                <span>
                                                    <i className="fa-duotone fa-regular fa-chart-pie-simple mr-1.5 text-secondary" />
                                                    {job.equity} equity
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recruiter card (narrow column) */}
                                    <div className="lg:col-span-1">
                                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">
                                            Posted By
                                        </p>
                                        <div className="flex items-center gap-4 mb-5">
                                            <img
                                                src={job.recruiter.avatar}
                                                alt={job.recruiter.name}
                                                className="w-12 h-12 object-cover rounded-full"
                                            />
                                            <div>
                                                <p className="font-semibold text-base-content">{job.recruiter.name}</p>
                                                <p className="text-sm text-base-content/50">{job.recruiter.agency}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6">
                                            <div>
                                                <p className="text-xl font-bold text-primary">{job.applicants}</p>
                                                <p className="text-xs uppercase tracking-[0.15em] text-base-content/40 mt-0.5">
                                                    Applicants
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-primary">{job.views.toLocaleString()}</p>
                                                <p className="text-xs uppercase tracking-[0.15em] text-base-content/40 mt-0.5">
                                                    Views
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 mt-4">
                                            <div>
                                                <p className="text-xs font-semibold text-base-content/60">{formatDate(job.postedDate)}</p>
                                                <p className="text-xs uppercase tracking-[0.15em] text-base-content/40 mt-0.5">
                                                    Posted
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-base-content/60">{formatDate(job.deadline)}</p>
                                                <p className="text-xs uppercase tracking-[0.15em] text-base-content/40 mt-0.5">
                                                    Deadline
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-base-300 mb-10" />

                                {/* Middle: Requirements + Responsibilities */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                                            Requirements
                                        </p>
                                        <ul className="space-y-2">
                                            {job.requirements.map((req, i) => (
                                                <li key={i} className="flex items-start gap-3 text-base-content/70 text-sm">
                                                    <i className="fa-duotone fa-regular fa-check text-secondary text-xs mt-1 shrink-0" />
                                                    <span>{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                                            Responsibilities
                                        </p>
                                        <ul className="space-y-2">
                                            {job.responsibilities.map((resp, i) => (
                                                <li key={i} className="flex items-start gap-3 text-base-content/70 text-sm">
                                                    <i className="fa-duotone fa-regular fa-circle-dot text-secondary/50 text-xs mt-1 shrink-0" />
                                                    <span>{resp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Bottom: Benefits + Tags */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                                            Benefits
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {job.benefits.map((benefit) => (
                                                <span
                                                    key={benefit}
                                                    className="text-xs uppercase tracking-[0.1em] text-base-content/50 border border-base-300 px-3 py-1.5"
                                                >
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                                            Skills & Technologies
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {job.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs font-medium text-secondary border border-secondary/30 px-3 py-1.5"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Grid View (Cards + Sidebar Detail Panel)
   ═══════════════════════════════════════════════════════════════════════════════ */

function GridView({
    jobs,
    selectedJob,
    onSelectJob,
}: {
    jobs: JobListing[];
    selectedJob: JobListing | null;
    onSelectJob: (job: JobListing) => void;
}) {
    return (
        <div className="flex">
            {/* Cards grid */}
            <div
                className={`flex-1 px-6 md:px-12 py-8 transition-all duration-300 ${
                    selectedJob ? "lg:pr-0" : ""
                }`}
            >
                <div
                    className={`grid gap-6 ${
                        selectedJob
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                >
                    {jobs.map((job) => (
                        <button
                            key={job.id}
                            onClick={() => onSelectJob(job)}
                            className={`text-left border p-6 transition-all duration-200 hover:border-secondary group ${
                                selectedJob?.id === job.id
                                    ? "border-secondary bg-base-200"
                                    : "border-base-300 bg-base-100"
                            }`}
                        >
                            {/* Top meta */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-xs uppercase tracking-[0.15em] font-medium ${statusColor(job.status)}`}>
                                    {job.status}
                                </span>
                                {job.featured && (
                                    <i className="fa-duotone fa-regular fa-star text-secondary text-xs" />
                                )}
                            </div>

                            {/* Title + Company */}
                            <h3 className="text-lg font-bold text-base-content tracking-tight leading-tight mb-1 group-hover:text-secondary transition-colors">
                                {job.title}
                            </h3>
                            <p className="text-sm text-base-content/50 mb-4">{job.company}</p>

                            {/* Location + Salary */}
                            <div className="space-y-1.5 mb-5">
                                <p className="text-sm text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-location-dot text-secondary/60 mr-1.5 w-4 inline-block text-center" />
                                    {job.location}
                                </p>
                                <p className="text-sm text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-money-bill text-secondary/60 mr-1.5 w-4 inline-block text-center" />
                                    {formatSalary(job.salary)}
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                                {job.tags.slice(0, 3).map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[10px] uppercase tracking-[0.1em] text-base-content/40 border border-base-300 px-2 py-0.5"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {job.tags.length > 3 && (
                                    <span className="text-[10px] text-base-content/30">
                                        +{job.tags.length - 3}
                                    </span>
                                )}
                            </div>

                            {/* Bottom bar */}
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-base-300/50">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={job.recruiter.avatar}
                                        alt=""
                                        className="w-5 h-5 rounded-full object-cover"
                                    />
                                    <span className="text-xs text-base-content/40">{job.recruiter.name}</span>
                                </div>
                                <span className="text-xs text-base-content/30">
                                    {job.applicants} applicants
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sidebar detail panel */}
            {selectedJob && (
                <div className="hidden lg:block w-[440px] shrink-0 border-l border-base-300 bg-base-100 sticky top-[73px] h-[calc(100vh-73px)] overflow-hidden">
                    <DetailPanel job={selectedJob} onClose={() => onSelectJob(selectedJob)} />
                </div>
            )}

            {/* Mobile detail overlay */}
            {selectedJob && (
                <div className="fixed inset-0 z-40 bg-base-100 lg:hidden overflow-y-auto">
                    <DetailPanel job={selectedJob} onClose={() => onSelectJob(selectedJob)} />
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Gmail View (List + Detail Split)
   ═══════════════════════════════════════════════════════════════════════════════ */

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
        <div className="flex border-t border-base-300">
            {/* Left list */}
            <div
                className={`shrink-0 border-r border-base-300 overflow-y-auto ${
                    selectedJob ? "hidden md:block w-[380px] lg:w-[440px]" : "w-full"
                }`}
                style={selectedJob ? { height: "calc(100vh - 73px)", position: "sticky", top: "73px" } : undefined}
            >
                {jobs.map((job) => (
                    <button
                        key={job.id}
                        onClick={() => onSelectJob(job)}
                        className={`w-full text-left px-6 py-5 border-b border-base-300/50 transition-colors hover:bg-base-200/70 group ${
                            selectedJob?.id === job.id ? "bg-base-200" : ""
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <img
                                src={job.recruiter.avatar}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5"
                            />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h3 className="font-semibold text-base-content truncate group-hover:text-secondary transition-colors">
                                        {job.title}
                                    </h3>
                                    <span className={`text-[10px] uppercase tracking-[0.15em] font-medium shrink-0 ${statusColor(job.status)}`}>
                                        {job.status}
                                    </span>
                                </div>
                                <p className="text-sm text-base-content/50 mb-1.5">
                                    {job.company}
                                    <span className="mx-1.5 text-base-content/20">/</span>
                                    {job.location}
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-base-content/40 font-medium">
                                        {formatSalary(job.salary)}
                                    </span>
                                    {job.featured && (
                                        <i className="fa-duotone fa-regular fa-star text-secondary text-[10px]" />
                                    )}
                                    <span className="text-[10px] text-base-content/30 ml-auto">
                                        {formatDate(job.postedDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Right detail */}
            {selectedJob ? (
                <div
                    className="flex-1 bg-base-100 overflow-y-auto"
                    style={{ height: "calc(100vh - 73px)", position: "sticky", top: "73px" }}
                >
                    <DetailPanel job={selectedJob} onClose={() => onSelectJob(selectedJob)} />
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center py-32 bg-base-100">
                    <div className="text-center">
                        <i className="fa-duotone fa-regular fa-hand-pointer text-4xl text-base-content/15 mb-4 block" />
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/30 font-medium">
                            Select a job to view details
                        </p>
                    </div>
                </div>
            )}

            {/* Mobile detail overlay */}
            {selectedJob && (
                <div className="fixed inset-0 z-40 bg-base-100 md:hidden overflow-y-auto">
                    <DetailPanel job={selectedJob} onClose={() => onSelectJob(selectedJob)} />
                </div>
            )}
        </div>
    );
}
