"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing, JobStatus, ExperienceLevel } from "@/types/job-listing";

/* ─── helpers ─── */

function formatSalary(salary: JobListing["salary"]): string {
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
  return `${salary.currency} ${fmt(salary.min)} - ${fmt(salary.max)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ─── status config ─── */

const statusConfig: Record<
  JobStatus,
  { label: string; color: string; dotColor: string }
> = {
  open: { label: "OPEN", color: "text-success", dotColor: "bg-success" },
  filled: { label: "FILLED", color: "text-info", dotColor: "bg-info" },
  pending: { label: "PENDING", color: "text-warning", dotColor: "bg-warning" },
  closed: { label: "CLOSED", color: "text-error", dotColor: "bg-error" },
};

/* ─── nav items ─── */

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: "fa-grid-2-plus" },
  { key: "roles", label: "Roles", icon: "fa-briefcase" },
  { key: "recruiters", label: "Recruiters", icon: "fa-user-tie" },
  { key: "candidates", label: "Candidates", icon: "fa-user-group" },
  { key: "companies", label: "Companies", icon: "fa-buildings" },
  { key: "applications", label: "Applications", icon: "fa-file-lines" },
  { key: "messages", label: "Messages", icon: "fa-comments" },
  { key: "placements", label: "Placements", icon: "fa-handshake" },
] as const;

const activeNav = "roles";

/* ─── types ─── */

type ViewMode = "table" | "grid" | "gmail";

/* ─── detail panel ─── */

function DetailPanel({
  job,
  onClose,
  className,
}: {
  job: JobListing | null;
  onClose?: () => void;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (job && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [job]);

  if (!job) {
    return (
      <div
        className={`flex items-center justify-center bg-base-200 border border-base-content/5 ${className ?? ""}`}
      >
        <div className="text-center p-8">
          <i className="fa-duotone fa-regular fa-crosshairs text-4xl text-base-content/10 mb-4 block" />
          <p className="font-mono text-xs text-base-content/20 uppercase tracking-wider">
            Select a target to inspect
          </p>
        </div>
      </div>
    );
  }

  const sc = statusConfig[job.status];

  return (
    <div
      ref={panelRef}
      className={`bg-base-200 border border-base-content/5 overflow-y-auto ${className ?? ""}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-base-content/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />
            <span
              className={`font-mono text-[10px] uppercase tracking-wider ${sc.color}`}
            >
              {sc.label}
            </span>
            {job.featured && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-warning ml-2">
                <i className="fa-duotone fa-regular fa-star mr-1" />
                FEATURED
              </span>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-base-content/30 hover:text-base-content/60 transition-colors"
            >
              <i className="fa-duotone fa-regular fa-xmark text-sm" />
            </button>
          )}
        </div>
        <h3 className="text-xl font-black tracking-tight mb-1">{job.title}</h3>
        <p className="text-sm text-base-content/50">{job.company}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-base-content/30">
          <span className="font-mono text-xs flex items-center gap-1.5">
            <i className="fa-duotone fa-regular fa-location-dot text-primary/50" />
            {job.location}
          </span>
          <span className="font-mono text-xs flex items-center gap-1.5">
            <i className="fa-duotone fa-regular fa-money-bill text-primary/50" />
            {formatSalary(job.salary)}
          </span>
          <span className="font-mono text-xs flex items-center gap-1.5">
            <i className="fa-duotone fa-regular fa-clock text-primary/50" />
            {timeAgo(job.postedDate)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {[job.type, job.experienceLevel, job.department].map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 bg-base-300 border border-base-content/5 text-base-content/40"
            >
              {tag}
            </span>
          ))}
          {job.equity && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 bg-base-300 border border-base-content/5 text-primary/60">
              Equity: {job.equity}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-base-content/5">
          <div>
            <span className="font-mono text-lg font-black text-primary">
              {job.applicants}
            </span>
            <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25 mt-0.5">
              Applicants
            </p>
          </div>
          <div>
            <span className="font-mono text-lg font-black text-base-content/50">
              {job.views.toLocaleString()}
            </span>
            <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25 mt-0.5">
              Views
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 border-b border-base-content/5">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">
          // mission.brief
        </p>
        <p className="text-sm text-base-content/50 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Tags */}
      <div className="p-6 border-b border-base-content/5">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">
          // tech.stack
        </p>
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] px-2.5 py-1 bg-primary/5 border border-primary/10 text-primary/70"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="p-6 border-b border-base-content/5">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">
          // requirements
        </p>
        <ul className="space-y-2">
          {job.requirements.map((req) => (
            <li
              key={req}
              className="flex items-start gap-2.5 text-sm text-base-content/50"
            >
              <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Responsibilities */}
      <div className="p-6 border-b border-base-content/5">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">
          // responsibilities
        </p>
        <ul className="space-y-2">
          {job.responsibilities.map((resp) => (
            <li
              key={resp}
              className="flex items-start gap-2.5 text-sm text-base-content/50"
            >
              <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
              {resp}
            </li>
          ))}
        </ul>
      </div>

      {/* Benefits */}
      <div className="p-6 border-b border-base-content/5">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">
          // benefits
        </p>
        <ul className="space-y-2">
          {job.benefits.map((ben) => (
            <li
              key={ben}
              className="flex items-start gap-2.5 text-sm text-base-content/50"
            >
              <span className="w-1 h-1 rounded-full bg-success mt-2 flex-shrink-0" />
              {ben}
            </li>
          ))}
        </ul>
      </div>

      {/* Recruiter */}
      <div className="p-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">
          // assigned.recruiter
        </p>
        <div className="flex items-start gap-4 p-4 bg-base-300 border border-base-content/5">
          <img
            src={job.recruiter.avatar}
            alt={job.recruiter.name}
            className="w-10 h-10 object-cover border border-base-content/10 flex-shrink-0"
            loading="lazy"
          />
          <div>
            <p className="font-mono text-sm font-bold">{job.recruiter.name}</p>
            <p className="text-xs text-base-content/40">{job.recruiter.agency}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── main page ─── */

export default function ListsTen() {
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── filtering ── */
  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  /* ── view switching animation ── */
  const switchView = useCallback(
    (mode: ViewMode) => {
      if (mode === viewMode) return;
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.15,
          ease: "power2.in",
          onComplete: () => {
            setViewMode(mode);
            setSelectedJob(null);
            gsap.fromTo(
              contentRef.current,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
            );
          },
        });
      } else {
        setViewMode(mode);
        setSelectedJob(null);
      }
    },
    [viewMode]
  );

  /* ── initial animation ── */
  useGSAP(
    () => {
      if (!mainRef.current) return;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.fromTo(
        ".header-scanline",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5 }
      )
        .fromTo(
          ".header-title",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.2"
        )
        .fromTo(
          ".controls-bar",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.2"
        )
        .fromTo(
          ".content-area",
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          "-=0.1"
        );

      gsap.fromTo(
        ".header-dot",
        { scale: 0.6, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }
      );

      /* ── sidebar nav items stagger ── */
      gsap.fromTo(
        ".sidebar-nav-item",
        { opacity: 0, x: -15 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.4,
        }
      );
    },
    { scope: mainRef }
  );

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-base-300 text-base-content overflow-x-hidden"
    >
      {/* Grid overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-56 bg-base-200 border-r border-base-content/5 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="px-5 pt-6 pb-4 border-b border-base-content/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center bg-primary/10 border border-primary/20">
                <i className="fa-duotone fa-regular fa-terminal text-primary text-xs" />
              </div>
              <span className="font-mono text-xs font-bold tracking-wider uppercase">
                Splits
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-6 h-6 flex items-center justify-center text-base-content/30 hover:text-base-content/60 transition-colors lg:hidden"
            >
              <i className="fa-duotone fa-regular fa-xmark text-xs" />
            </button>
          </div>
          <p className="font-mono text-[9px] text-base-content/20 tracking-wider mt-2 uppercase">
            // mission.control
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.key === activeNav;
            return (
              <button
                key={item.key}
                className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 text-left transition-colors duration-150 ${
                  isActive
                    ? "bg-primary/10 border-l-2 border-l-primary text-primary"
                    : "border-l-2 border-l-transparent text-base-content/40 hover:text-base-content/60 hover:bg-base-300/50"
                }`}
              >
                <i
                  className={`fa-duotone fa-regular ${item.icon} text-sm w-5 text-center ${
                    isActive ? "text-primary" : ""
                  }`}
                />
                <span
                  className={`font-mono text-xs tracking-wider ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-5 py-4 border-t border-base-content/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-base-content/20">
              Online
            </span>
          </div>
          <p className="font-mono text-[9px] text-base-content/15 mt-1">
            v2.0.0
          </p>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT (offset for sidebar on lg+) ═══ */}
      <div className="lg:ml-56">
        {/* ═══ HEADER ═══ */}
        <header className="relative z-10 px-6 pt-8 pb-6 border-b border-base-content/10">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4 mb-4">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-8 h-8 flex items-center justify-center border border-base-content/5 bg-base-200 text-base-content/40 hover:text-base-content/60 transition-colors lg:hidden"
              >
                <i className="fa-duotone fa-regular fa-bars text-xs" />
              </button>
              <div className="header-scanline h-[2px] bg-primary w-24 origin-left" />
            </div>
            <div className="header-title flex items-center gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Job Command
              </h1>
              <span className="header-dot w-2 h-2 rounded-full bg-success" />
            </div>
            <p className="font-mono text-xs text-base-content/30 tracking-wider">
              // network.jobs.active &mdash;{" "}
              <span className="text-primary">{filteredJobs.length}</span> targets
              in scope
            </p>
          </div>
        </header>

        {/* ═══ CONTROLS BAR ═══ */}
        <div className="controls-bar relative z-10 px-6 py-4 border-b border-base-content/5 bg-base-200">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/20 text-sm" />
              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm w-full pl-9 bg-base-300 border-base-content/5 font-mono text-xs focus:border-primary/30 focus:outline-none"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-base-content/20 uppercase tracking-wider mr-1">
                Filter:
              </span>
              {(["all", "open", "pending", "filled", "closed"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-colors duration-200 ${
                      statusFilter === status
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-base-300 border-base-content/5 text-base-content/30 hover:text-base-content/50"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 ml-auto">
              <span className="font-mono text-[10px] text-base-content/20 uppercase tracking-wider mr-2">
                View:
              </span>
              <button
                onClick={() => switchView("table")}
                className={`w-8 h-8 flex items-center justify-center border transition-colors duration-200 ${
                  viewMode === "table"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-base-300 border-base-content/5 text-base-content/30 hover:text-base-content/50"
                }`}
                title="Table view"
              >
                <i className="fa-duotone fa-regular fa-table-list text-xs" />
              </button>
              <button
                onClick={() => switchView("grid")}
                className={`w-8 h-8 flex items-center justify-center border transition-colors duration-200 ${
                  viewMode === "grid"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-base-300 border-base-content/5 text-base-content/30 hover:text-base-content/50"
                }`}
                title="Grid view"
              >
                <i className="fa-duotone fa-regular fa-grid-2 text-xs" />
              </button>
              <button
                onClick={() => switchView("gmail")}
                className={`w-8 h-8 flex items-center justify-center border transition-colors duration-200 ${
                  viewMode === "gmail"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-base-300 border-base-content/5 text-base-content/30 hover:text-base-content/50"
                }`}
                title="Split view"
              >
                <i className="fa-duotone fa-regular fa-columns-3 text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ CONTENT AREA ═══ */}
        <div className="content-area relative z-10 px-6 py-6">
          <div ref={contentRef} className="max-w-[1400px] mx-auto">
          {/* TABLE VIEW */}
          {viewMode === "table" && (
            <div className="flex gap-6">
              {/* Table */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-base-content/10">
                      {(selectedJob
                        ? ["Status", "Title", "Company", "Salary", "Posted"]
                        : ["Status", "Title", "Company", "Location", "Salary", "Type", "Level", "Posted"]
                      ).map((col) => (
                        <th
                          key={col}
                          className="text-left font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/20 py-3 px-4 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => {
                      const sc = statusConfig[job.status];
                      return (
                        <tr
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className={`border-b border-base-content/5 cursor-pointer transition-colors duration-150 hover:bg-base-200 ${
                            selectedJob?.id === job.id ? "bg-base-200" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`}
                              />
                              <span
                                className={`font-mono text-[10px] uppercase tracking-wider ${sc.color}`}
                              >
                                {sc.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm tracking-tight">
                                {job.title}
                              </span>
                              {job.featured && (
                                <i className="fa-duotone fa-regular fa-star text-[10px] text-warning" />
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-sm text-base-content/50">
                            {job.company}
                          </td>
                          {!selectedJob && (
                            <td className="py-3.5 px-4 font-mono text-xs text-base-content/40">
                              {job.location}
                            </td>
                          )}
                          <td className="py-3.5 px-4 font-mono text-xs text-primary/70 whitespace-nowrap">
                            {formatSalary(job.salary)}
                          </td>
                          {!selectedJob && (
                            <>
                              <td className="py-3.5 px-4 font-mono text-[10px] uppercase text-base-content/30">
                                {job.type}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[10px] uppercase text-base-content/30">
                                {job.experienceLevel}
                              </td>
                            </>
                          )}
                          <td className="py-3.5 px-4 font-mono text-xs text-base-content/30 whitespace-nowrap">
                            {timeAgo(job.postedDate)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Right-side detail panel */}
              {selectedJob && (
                <div className="hidden lg:block w-[420px] flex-shrink-0 sticky top-6 self-start max-h-[calc(100vh-160px)]">
                  <DetailPanel
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    className="h-full"
                  />
                </div>
              )}
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <div className="flex gap-6">
              {/* Cards grid */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${selectedJob ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-4 flex-1`}
              >
                {filteredJobs.map((job) => {
                  const sc = statusConfig[job.status];
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`group p-5 bg-base-200 border cursor-pointer transition-colors duration-200 ${
                        isSelected
                          ? "border-primary/30"
                          : "border-base-content/5 hover:border-base-content/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`}
                          />
                          <span
                            className={`font-mono text-[10px] uppercase tracking-wider ${sc.color}`}
                          >
                            {sc.label}
                          </span>
                          {job.featured && (
                            <i className="fa-duotone fa-regular fa-star text-[10px] text-warning" />
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-base-content/20">
                          {job.applicants} applicants
                        </span>
                      </div>

                      <h3 className="font-bold text-sm tracking-tight mb-1 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-base-content/40 mb-3">
                        {job.company}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-base-content/30">
                        <span className="font-mono text-[10px] flex items-center gap-1">
                          <i className="fa-duotone fa-regular fa-location-dot text-primary/40" />
                          {job.location}
                        </span>
                        <span className="font-mono text-[10px] flex items-center gap-1">
                          <i className="fa-duotone fa-regular fa-money-bill text-primary/40" />
                          {formatSalary(job.salary)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 bg-base-300 border border-base-content/5 text-base-content/30"
                          >
                            {tag}
                          </span>
                        ))}
                        {job.tags.length > 3 && (
                          <span className="font-mono text-[9px] text-base-content/20">
                            +{job.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-base-content/5 flex items-center gap-2">
                        <img
                          src={job.recruiter.avatar}
                          alt={job.recruiter.name}
                          className="w-5 h-5 object-cover border border-base-content/10"
                          loading="lazy"
                        />
                        <span className="font-mono text-[10px] text-base-content/30">
                          {job.recruiter.name}
                        </span>
                        <span className="font-mono text-[10px] text-base-content/15 ml-auto">
                          {timeAgo(job.postedDate)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar detail panel */}
              {selectedJob && (
                <div className="hidden lg:block w-[420px] flex-shrink-0 sticky top-6 self-start max-h-[calc(100vh-160px)]">
                  <DetailPanel
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    className="h-full"
                  />
                </div>
              )}
            </div>
          )}

          {/* GMAIL VIEW */}
          {viewMode === "gmail" && (
            <div className="flex gap-0 h-[calc(100vh-220px)] min-h-[500px]">
              {/* List pane */}
              <div className="w-full md:w-[440px] flex-shrink-0 overflow-y-auto border-r border-base-content/5">
                {filteredJobs.map((job) => {
                  const sc = statusConfig[job.status];
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`p-4 border-b border-base-content/5 cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? "bg-base-200 border-l-2 border-l-primary"
                          : "hover:bg-base-200/50 border-l-2 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`}
                          />
                          <span className="font-bold text-sm tracking-tight">
                            {job.title}
                          </span>
                          {job.featured && (
                            <i className="fa-duotone fa-regular fa-star text-[9px] text-warning" />
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-base-content/20 whitespace-nowrap ml-2">
                          {timeAgo(job.postedDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-base-content/40">
                          {job.company}
                        </span>
                        <span className="font-mono text-[10px] text-primary/60 whitespace-nowrap ml-2">
                          {formatSalary(job.salary)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-base-content/25">
                        <span className="font-mono text-[10px]">
                          {job.location}
                        </span>
                        <span className="font-mono text-[10px]">
                          {job.type}
                        </span>
                        <span className="font-mono text-[10px]">
                          {job.applicants} applicants
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail pane */}
              <div className="hidden md:block flex-1 overflow-y-auto">
                <DetailPanel job={selectedJob} className="h-full" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredJobs.length === 0 && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <i className="fa-duotone fa-regular fa-radar text-4xl text-base-content/10 mb-4 block" />
                <p className="font-mono text-sm text-base-content/30 mb-1">
                  No targets found
                </p>
                <p className="font-mono text-xs text-base-content/15">
                  Adjust search parameters or clear filters
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom padding for fixed footer */}
      <div className="h-12" />

      </div>{/* end lg:ml-56 wrapper */}

      {/* ═══ FOOTER STATUS BAR ═══ */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 px-6 py-2.5 bg-base-200 border-t border-base-content/5 lg:pl-[calc(14rem+1.5rem)]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/20">
                All Systems Operational
              </span>
            </div>
            <span className="text-base-content/10">|</span>
            <span className="font-mono text-[10px] text-base-content/15">
              {filteredJobs.length} / {mockJobs.length} jobs
            </span>
          </div>
          <span className="font-mono text-[10px] text-base-content/15 uppercase tracking-wider">
            Splits Network // Job Command v2.0
          </span>
        </div>
      </footer>
    </main>
  );
}
