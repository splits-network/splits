"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

// ─── Filter Types ─────────────────────────────────────────────────────────────

interface ActiveFilters {
    query: string;
    departments: string[];
    types: string[];
    statuses: string[];
    experienceLevels: string[];
    salaryMin: number;
    salaryMax: number;
    featured: boolean | null;
    sort: string;
}

const initialFilters: ActiveFilters = {
    query: "",
    departments: [],
    types: [],
    statuses: [],
    experienceLevels: [],
    salaryMin: 0,
    salaryMax: 350000,
    featured: null,
    sort: "newest",
};

const allDepartments = [...new Set(mockJobs.map((j) => j.department))].sort();
const allTypes = ["full-time", "part-time", "contract", "remote"] as const;
const allStatuses = ["open", "filled", "pending", "closed"] as const;
const allLevels = ["entry", "mid", "senior", "executive"] as const;
const sortOptions = [
    { value: "newest", label: "Newest First", icon: "fa-duotone fa-regular fa-clock" },
    { value: "salary-desc", label: "Highest Salary", icon: "fa-duotone fa-regular fa-arrow-down-wide-short" },
    { value: "salary-asc", label: "Lowest Salary", icon: "fa-duotone fa-regular fa-arrow-up-wide-short" },
    { value: "applicants", label: "Most Applicants", icon: "fa-duotone fa-regular fa-users" },
    { value: "views", label: "Most Viewed", icon: "fa-duotone fa-regular fa-eye" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(n: number) {
    return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
}

function applyFilters(jobs: JobListing[], filters: ActiveFilters): JobListing[] {
    let result = jobs.filter((job) => {
        const q = filters.query.toLowerCase();
        if (q && !job.title.toLowerCase().includes(q) && !job.company.toLowerCase().includes(q) && !job.location.toLowerCase().includes(q) && !job.tags.some((t) => t.toLowerCase().includes(q))) return false;
        if (filters.departments.length > 0 && !filters.departments.includes(job.department)) return false;
        if (filters.types.length > 0 && !filters.types.includes(job.type)) return false;
        if (filters.statuses.length > 0 && !filters.statuses.includes(job.status)) return false;
        if (filters.experienceLevels.length > 0 && !filters.experienceLevels.includes(job.experienceLevel)) return false;
        if (job.salary.min < filters.salaryMin || job.salary.max > filters.salaryMax) return false;
        if (filters.featured === true && !job.featured) return false;
        if (filters.featured === false && job.featured) return false;
        return true;
    });

    switch (filters.sort) {
        case "salary-desc": result.sort((a, b) => b.salary.max - a.salary.max); break;
        case "salary-asc": result.sort((a, b) => a.salary.min - b.salary.min); break;
        case "applicants": result.sort((a, b) => b.applicants - a.applicants); break;
        case "views": result.sort((a, b) => b.views - a.views); break;
        default: result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    }

    return result;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SearchFivePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState<ActiveFilters>(initialFilters);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [savedSearch, setSavedSearch] = useState(false);

    const results = applyFilters(mockJobs, filters);
    const activeFilterCount = [
        filters.departments.length > 0,
        filters.types.length > 0,
        filters.statuses.length > 0,
        filters.experienceLevels.length > 0,
        filters.salaryMin > 0,
        filters.salaryMax < 350000,
        filters.featured !== null,
    ].filter(Boolean).length;

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".opacity-0"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(".search-header", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
            tl.fromTo(".search-bar", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
            tl.fromTo(".filter-panel", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, "-=0.1");
            tl.fromTo(".results-area", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "-=0.1");
        },
        { scope: containerRef },
    );

    const toggleArrayFilter = (key: keyof ActiveFilters, value: string) => {
        setFilters((prev) => {
            const arr = prev[key] as string[];
            return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
        });
    };

    const removeFilter = (key: keyof ActiveFilters, value?: string) => {
        setFilters((prev) => {
            if (value && Array.isArray(prev[key])) {
                return { ...prev, [key]: (prev[key] as string[]).filter((v) => v !== value) };
            }
            return { ...prev, [key]: initialFilters[key] };
        });
    };

    const clearAll = () => setFilters(initialFilters);

    const chipCls = (active: boolean) =>
        `px-2.5 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-colors ${
            active ? "border-info/40 bg-info/10 text-info" : "border-[#27272a] text-[#e5e7eb]/25 hover:text-[#e5e7eb]/50 hover:border-[#e5e7eb]/10"
        }`;

    return (
        <div ref={containerRef} className="min-h-screen bg-[#09090b] text-[#e5e7eb]">
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)" }} />

            {/* Header */}
            <div className="border-b border-[#27272a] bg-[#0a0a0c]">
                <div className="container mx-auto px-4 py-8">
                    <div className="search-header opacity-0">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">Scanner Active</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="text-[#e5e7eb]">Advanced </span>
                            <span className="text-info">Search</span>
                        </h1>
                        <p className="text-sm text-[#e5e7eb]/40 font-mono">Scan the network with precision filters and signal intelligence.</p>
                    </div>
                </div>
            </div>

            {/* Search bar */}
            <div className="search-bar border-b border-[#27272a] bg-[#09090b] sticky top-0 z-30 opacity-0">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#e5e7eb]/15" />
                            <input
                                type="text"
                                placeholder="Search roles, companies, skills, locations..."
                                value={filters.query}
                                onChange={(e) => setFilters((p) => ({ ...p, query: e.target.value }))}
                                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-11 pr-4 py-3 text-sm text-[#e5e7eb] placeholder-[#e5e7eb]/15 font-mono focus:outline-none focus:border-info/30 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors ${
                                filtersOpen ? "border-info/30 bg-info/10 text-info" : "border-[#27272a] text-[#e5e7eb]/30 hover:border-info/20"
                            }`}
                        >
                            <i className="fa-duotone fa-regular fa-sliders" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-info text-[9px] font-bold flex items-center justify-center text-white">{activeFilterCount}</span>
                            )}
                        </button>
                        <button
                            onClick={() => { setSavedSearch(true); setTimeout(() => setSavedSearch(false), 2000); }}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors ${
                                savedSearch ? "border-success/30 bg-success/10 text-success" : "border-[#27272a] text-[#e5e7eb]/30 hover:border-info/20"
                            }`}
                        >
                            <i className={`fa-duotone fa-regular ${savedSearch ? "fa-check" : "fa-bookmark"}`} />
                            {savedSearch ? "Saved" : "Save"}
                        </button>
                    </div>

                    {/* Active filters chips */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#27272a]/50">
                            <span className="font-mono text-[9px] text-[#e5e7eb]/20 uppercase tracking-wider mr-1">Active:</span>
                            {filters.departments.map((d) => (
                                <button key={d} onClick={() => removeFilter("departments", d)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-info/20 bg-info/5 text-[10px] font-mono text-info hover:bg-info/10 transition-colors">
                                    {d} <i className="fa-duotone fa-regular fa-xmark text-[8px]" />
                                </button>
                            ))}
                            {filters.types.map((t) => (
                                <button key={t} onClick={() => removeFilter("types", t)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-warning/20 bg-warning/5 text-[10px] font-mono text-warning hover:bg-warning/10 transition-colors">
                                    {t} <i className="fa-duotone fa-regular fa-xmark text-[8px]" />
                                </button>
                            ))}
                            {filters.statuses.map((s) => (
                                <button key={s} onClick={() => removeFilter("statuses", s)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-success/20 bg-success/5 text-[10px] font-mono text-success hover:bg-success/10 transition-colors">
                                    {s} <i className="fa-duotone fa-regular fa-xmark text-[8px]" />
                                </button>
                            ))}
                            {filters.experienceLevels.map((l) => (
                                <button key={l} onClick={() => removeFilter("experienceLevels", l)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-accent/20 bg-accent/5 text-[10px] font-mono text-accent hover:bg-accent/10 transition-colors">
                                    {l} <i className="fa-duotone fa-regular fa-xmark text-[8px]" />
                                </button>
                            ))}
                            {(filters.salaryMin > 0 || filters.salaryMax < 350000) && (
                                <button onClick={() => { removeFilter("salaryMin"); removeFilter("salaryMax"); }} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[#27272a] bg-[#18181b] text-[10px] font-mono text-[#e5e7eb]/40 hover:text-[#e5e7eb] transition-colors">
                                    ${formatSalary(filters.salaryMin)}-${formatSalary(filters.salaryMax)} <i className="fa-duotone fa-regular fa-xmark text-[8px]" />
                                </button>
                            )}
                            <button onClick={clearAll} className="font-mono text-[10px] text-error/50 hover:text-error transition-colors ml-2">Clear all</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Filter panel */}
                    {filtersOpen && (
                        <aside className="filter-panel w-[260px] flex-shrink-0 space-y-6 opacity-0 hidden lg:block">
                            {/* Department */}
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-4">
                                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-3">Department</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {allDepartments.map((d) => (
                                        <button key={d} onClick={() => toggleArrayFilter("departments", d)} className={chipCls(filters.departments.includes(d))}>{d}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Job Type */}
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-4">
                                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-3">Job Type</h3>
                                <div className="space-y-1.5">
                                    {allTypes.map((t) => (
                                        <button key={t} onClick={() => toggleArrayFilter("types", t)} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${
                                            filters.types.includes(t) ? "border-info/30 bg-info/10 text-info" : "border-transparent text-[#e5e7eb]/30 hover:bg-[#e5e7eb]/[0.03]"
                                        }`}>
                                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${filters.types.includes(t) ? "border-info bg-info/20" : "border-[#27272a]"}`}>
                                                {filters.types.includes(t) && <i className="fa-duotone fa-regular fa-check text-[8px]" />}
                                            </span>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-4">
                                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-3">Status</h3>
                                <div className="space-y-1.5">
                                    {allStatuses.map((s) => {
                                        const dotColor = s === "open" ? "bg-success" : s === "filled" ? "bg-info" : s === "pending" ? "bg-warning" : "bg-error";
                                        return (
                                            <button key={s} onClick={() => toggleArrayFilter("statuses", s)} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors ${
                                                filters.statuses.includes(s) ? "border-info/30 bg-info/10 text-info" : "border-transparent text-[#e5e7eb]/30 hover:bg-[#e5e7eb]/[0.03]"
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-4">
                                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-3">Experience</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {allLevels.map((l) => (
                                        <button key={l} onClick={() => toggleArrayFilter("experienceLevels", l)} className={chipCls(filters.experienceLevels.includes(l))}>{l}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Salary Range */}
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-4">
                                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-3">Salary Range</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="font-mono text-[9px] text-[#e5e7eb]/20 mb-1 block">Min: ${formatSalary(filters.salaryMin)}</label>
                                        <input type="range" min={0} max={300000} step={10000} value={filters.salaryMin} onChange={(e) => setFilters((p) => ({ ...p, salaryMin: Number(e.target.value) }))} className="w-full accent-info h-1" />
                                    </div>
                                    <div>
                                        <label className="font-mono text-[9px] text-[#e5e7eb]/20 mb-1 block">Max: ${formatSalary(filters.salaryMax)}</label>
                                        <input type="range" min={50000} max={350000} step={10000} value={filters.salaryMax} onChange={(e) => setFilters((p) => ({ ...p, salaryMax: Number(e.target.value) }))} className="w-full accent-info h-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Featured toggle */}
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-4">
                                <button onClick={() => setFilters((p) => ({ ...p, featured: p.featured === true ? null : true }))} className={`w-full text-left flex items-center gap-2 text-xs font-mono transition-colors ${filters.featured === true ? "text-warning" : "text-[#e5e7eb]/30"}`}>
                                    <i className={`fa-duotone fa-regular fa-star ${filters.featured === true ? "text-warning" : ""}`} />
                                    Featured Only
                                </button>
                            </div>
                        </aside>
                    )}

                    {/* Results */}
                    <div className="results-area flex-1 min-w-0 opacity-0">
                        {/* Results header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                                <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/25">
                                    {results.length} result{results.length !== 1 ? "s" : ""} found
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] text-[#e5e7eb]/15 uppercase tracking-wider">Sort:</span>
                                <select value={filters.sort} onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))} className="bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-[10px] text-[#e5e7eb]/40 font-mono focus:outline-none focus:border-info/30 appearance-none cursor-pointer">
                                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Result cards */}
                        <div className="space-y-3">
                            {results.map((job) => (
                                <div key={job.id} className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-5 hover:border-[#e5e7eb]/10 hover:bg-[#18181b]/60 transition-all cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {job.featured && <i className="fa-duotone fa-regular fa-star text-warning text-xs" />}
                                                <h3 className="text-sm font-bold truncate">{job.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-[#e5e7eb]/40 mb-3">
                                                <span className="flex items-center gap-1"><i className="fa-duotone fa-regular fa-building text-[10px]" /> {job.company}</span>
                                                <span className="flex items-center gap-1"><i className="fa-duotone fa-regular fa-location-dot text-[10px]" /> {job.location}</span>
                                            </div>
                                            <p className="text-xs text-[#e5e7eb]/30 line-clamp-2 mb-3">{job.description}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {job.tags.slice(0, 5).map((tag, i) => (
                                                    <span key={i} className="font-mono text-[9px] text-[#e5e7eb]/20 border border-[#27272a]/50 px-1.5 py-0.5 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="font-mono text-sm font-bold text-info mb-1">{job.salary.currency} {formatSalary(job.salary.min)}-{formatSalary(job.salary.max)}</div>
                                            <div className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/20 mb-2">{job.type}</div>
                                            <span className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider ${job.status === "open" ? "text-success" : job.status === "filled" ? "text-info" : "text-warning"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${job.status === "open" ? "bg-success animate-pulse" : job.status === "filled" ? "bg-info" : "bg-warning"}`} />
                                                {job.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {results.length === 0 && (
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-16 text-center">
                                <div className="w-16 h-16 rounded-xl border border-[#27272a] bg-[#09090b] flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-radar text-2xl text-[#e5e7eb]/15" />
                                </div>
                                <div className="font-mono text-sm text-[#e5e7eb]/30 mb-1">No signals detected</div>
                                <div className="font-mono text-[10px] text-[#e5e7eb]/15 uppercase tracking-wider mb-4">Adjust filters to widen your scan radius</div>
                                <button onClick={clearAll} className="px-4 py-2 rounded-lg border border-info/20 bg-info/5 text-info text-xs font-mono uppercase tracking-wider hover:bg-info/10 transition-colors">
                                    <i className="fa-duotone fa-regular fa-rotate-left mr-1.5" /> Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
