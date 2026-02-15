"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function formatSalary(salary: JobListing["salary"]) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: salary.currency, maximumFractionDigits: 0 }).format(n);
    return `${fmt(salary.min)} - ${fmt(salary.max)}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusColor(status: JobListing["status"]) {
    switch (status) { case "open": return "badge-success"; case "filled": return "badge-error"; case "pending": return "badge-warning"; case "closed": return "badge-neutral"; }
}

/* ─── Filter Options ──────────────────────────────────────────────────────── */
const JOB_TYPES = ["full-time", "part-time", "contract", "remote"];
const EXPERIENCE_LEVELS = ["entry", "mid", "senior", "executive"];
const DEPARTMENTS = [...new Set(mockJobs.map((j) => j.department))].sort();
const LOCATIONS = [...new Set(mockJobs.map((j) => j.location))].sort();
const SORT_OPTIONS = [
    { value: "relevance", label: "Most Relevant" },
    { value: "date-desc", label: "Newest First" },
    { value: "date-asc", label: "Oldest First" },
    { value: "salary-desc", label: "Highest Salary" },
    { value: "salary-asc", label: "Lowest Salary" },
    { value: "applicants-desc", label: "Most Applicants" },
];

interface ActiveFilter {
    key: string;
    value: string;
    label: string;
}

export default function SearchFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("relevance");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [salaryMin, setSalaryMin] = useState(0);
    const [salaryMax, setSalaryMax] = useState(350000);
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [openOnly, setOpenOnly] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [saveSearchOpen, setSaveSearchOpen] = useState(false);

    /* ── Toggle helpers ── */
    const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
        setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
    };

    /* ── Active filters ── */
    const activeFilters: ActiveFilter[] = [
        ...selectedTypes.map((v) => ({ key: "type", value: v, label: `Type: ${v}` })),
        ...selectedLevels.map((v) => ({ key: "level", value: v, label: `Level: ${v}` })),
        ...selectedDepartments.map((v) => ({ key: "dept", value: v, label: `Dept: ${v}` })),
        ...selectedLocations.map((v) => ({ key: "loc", value: v, label: `Location: ${v}` })),
        ...(featuredOnly ? [{ key: "featured", value: "true", label: "Featured Only" }] : []),
        ...(openOnly ? [{ key: "open", value: "true", label: "Open Only" }] : []),
        ...(salaryMin > 0 ? [{ key: "salMin", value: String(salaryMin), label: `Min Salary: $${(salaryMin / 1000).toFixed(0)}k` }] : []),
        ...(salaryMax < 350000 ? [{ key: "salMax", value: String(salaryMax), label: `Max Salary: $${(salaryMax / 1000).toFixed(0)}k` }] : []),
    ];

    const removeFilter = (f: ActiveFilter) => {
        if (f.key === "type") setSelectedTypes((p) => p.filter((v) => v !== f.value));
        else if (f.key === "level") setSelectedLevels((p) => p.filter((v) => v !== f.value));
        else if (f.key === "dept") setSelectedDepartments((p) => p.filter((v) => v !== f.value));
        else if (f.key === "loc") setSelectedLocations((p) => p.filter((v) => v !== f.value));
        else if (f.key === "featured") setFeaturedOnly(false);
        else if (f.key === "open") setOpenOnly(false);
        else if (f.key === "salMin") setSalaryMin(0);
        else if (f.key === "salMax") setSalaryMax(350000);
    };

    const clearAll = () => {
        setQuery("");
        setSelectedTypes([]);
        setSelectedLevels([]);
        setSelectedDepartments([]);
        setSelectedLocations([]);
        setSalaryMin(0);
        setSalaryMax(350000);
        setFeaturedOnly(false);
        setOpenOnly(false);
    };

    /* ── Filtering + Sorting ── */
    let results = mockJobs.filter((job) => {
        const matchesQuery = query === "" ||
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.company.toLowerCase().includes(query.toLowerCase()) ||
            job.location.toLowerCase().includes(query.toLowerCase()) ||
            job.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
        const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(job.experienceLevel);
        const matchesDept = selectedDepartments.length === 0 || selectedDepartments.includes(job.department);
        const matchesLoc = selectedLocations.length === 0 || selectedLocations.includes(job.location);
        const matchesSalary = job.salary.min >= salaryMin && job.salary.max <= salaryMax;
        const matchesFeatured = !featuredOnly || job.featured;
        const matchesOpen = !openOnly || job.status === "open";
        return matchesQuery && matchesType && matchesLevel && matchesDept && matchesLoc && matchesSalary && matchesFeatured && matchesOpen;
    });

    results = [...results].sort((a, b) => {
        switch (sortBy) {
            case "date-desc": return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
            case "date-asc": return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
            case "salary-desc": return b.salary.max - a.salary.max;
            case "salary-asc": return a.salary.min - b.salary.min;
            case "applicants-desc": return b.applicants - a.applicants;
            default: return 0;
        }
    });

    /* ── Animations ── */
    useEffect(() => {
        if (!resultsRef.current) return;
        const items = resultsRef.current.querySelectorAll(".cin-result-item");
        if (items.length) {
            gsap.fromTo(items, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" });
        }
    }, [results.length, sortBy, query, selectedTypes.length, selectedLevels.length, selectedDepartments.length, selectedLocations.length, salaryMin, salaryMax, featuredOnly, openOnly]);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current.querySelector(".cin-search-hero"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 });
        }
    }, []);

    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-base-100">
            {/* Header */}
            <div className="cin-search-hero bg-neutral text-white opacity-0">
                <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
                    <p className="text-xs uppercase tracking-[0.3em] font-medium text-primary mb-4">Cinematic Editorial</p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-4">
                        Advanced <span className="text-primary">Search</span>
                    </h1>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mt-6">
                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search jobs, companies, skills, locations..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-base text-white placeholder-white/30 focus:outline-none focus:border-primary"
                        />
                        {query && (
                            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Filters Bar */}
            {activeFilters.length > 0 && (
                <div className="bg-base-200 border-b border-base-content/5">
                    <div className="max-w-7xl mx-auto px-6 py-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs uppercase tracking-wider text-base-content/40 font-semibold shrink-0">Active Filters:</span>
                            {activeFilters.map((f, i) => (
                                <button
                                    key={i}
                                    onClick={() => removeFilter(f)}
                                    className="badge bg-primary/10 text-primary border-0 font-medium gap-1.5 hover:bg-primary/20 transition-colors cursor-pointer"
                                >
                                    {f.label}
                                    <i className="fa-duotone fa-regular fa-xmark text-[10px]" />
                                </button>
                            ))}
                            <button onClick={clearAll} className="text-xs text-error font-semibold hover:underline ml-2">
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    {/* ── Filters Sidebar ── */}
                    <aside className={`${filtersOpen ? "w-[280px]" : "w-0 overflow-hidden"} shrink-0 transition-all duration-300 hidden lg:block`}>
                        <div className="sticky top-4 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Filters</h3>
                                <button onClick={() => setFiltersOpen(false)} className="text-base-content/30 hover:text-base-content/60 transition-colors">
                                    <i className="fa-duotone fa-regular fa-sidebar-flip text-sm" />
                                </button>
                            </div>

                            {/* Job Type */}
                            <div>
                                <h4 className="text-xs font-bold text-base-content/50 mb-3 uppercase tracking-wider">Job Type</h4>
                                <div className="space-y-2">
                                    {JOB_TYPES.map((t) => (
                                        <label key={t} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggle(selectedTypes, t, setSelectedTypes)} className="checkbox checkbox-primary checkbox-sm" />
                                            <span className="text-sm text-base-content/60 group-hover:text-base-content transition-colors capitalize">{t}</span>
                                            <span className="text-xs text-base-content/20 ml-auto">{mockJobs.filter((j) => j.type === t).length}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Level */}
                            <div>
                                <h4 className="text-xs font-bold text-base-content/50 mb-3 uppercase tracking-wider">Experience</h4>
                                <div className="space-y-2">
                                    {EXPERIENCE_LEVELS.map((l) => (
                                        <label key={l} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={selectedLevels.includes(l)} onChange={() => toggle(selectedLevels, l, setSelectedLevels)} className="checkbox checkbox-primary checkbox-sm" />
                                            <span className="text-sm text-base-content/60 group-hover:text-base-content transition-colors capitalize">{l}</span>
                                            <span className="text-xs text-base-content/20 ml-auto">{mockJobs.filter((j) => j.experienceLevel === l).length}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Department */}
                            <div>
                                <h4 className="text-xs font-bold text-base-content/50 mb-3 uppercase tracking-wider">Department</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {DEPARTMENTS.map((d) => (
                                        <label key={d} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={selectedDepartments.includes(d)} onChange={() => toggle(selectedDepartments, d, setSelectedDepartments)} className="checkbox checkbox-primary checkbox-sm" />
                                            <span className="text-sm text-base-content/60 group-hover:text-base-content transition-colors">{d}</span>
                                            <span className="text-xs text-base-content/20 ml-auto">{mockJobs.filter((j) => j.department === d).length}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Salary Range */}
                            <div>
                                <h4 className="text-xs font-bold text-base-content/50 mb-3 uppercase tracking-wider">Salary Range</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-base-content/40 mb-1 block">Minimum: ${(salaryMin / 1000).toFixed(0)}k</label>
                                        <input type="range" min={0} max={300000} step={10000} value={salaryMin} onChange={(e) => setSalaryMin(Number(e.target.value))} className="range range-primary range-sm w-full" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-base-content/40 mb-1 block">Maximum: ${(salaryMax / 1000).toFixed(0)}k</label>
                                        <input type="range" min={50000} max={350000} step={10000} value={salaryMax} onChange={(e) => setSalaryMax(Number(e.target.value))} className="range range-primary range-sm w-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <h4 className="text-xs font-bold text-base-content/50 mb-3 uppercase tracking-wider">Location</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {LOCATIONS.map((loc) => (
                                        <label key={loc} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={selectedLocations.includes(loc)} onChange={() => toggle(selectedLocations, loc, setSelectedLocations)} className="checkbox checkbox-primary checkbox-sm" />
                                            <span className="text-sm text-base-content/60 group-hover:text-base-content transition-colors truncate">{loc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-base-content/60 font-medium">Featured Only</span>
                                    <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} className="toggle toggle-primary toggle-sm" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-base-content/60 font-medium">Open Positions Only</span>
                                    <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="toggle toggle-primary toggle-sm" />
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* ── Results ── */}
                    <div className="flex-1 min-w-0">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                {!filtersOpen && (
                                    <button onClick={() => setFiltersOpen(true)} className="hidden lg:flex btn btn-sm bg-base-200 border-base-content/10 font-medium">
                                        <i className="fa-duotone fa-regular fa-sidebar" />
                                        Filters
                                    </button>
                                )}
                                <span className="text-sm text-base-content/40 font-medium">
                                    <strong className="text-base-content">{results.length}</strong> results
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSaveSearchOpen(!saveSearchOpen)}
                                    className="btn btn-sm bg-base-200 border-base-content/10 font-medium"
                                >
                                    <i className="fa-duotone fa-regular fa-bookmark" />
                                    <span className="hidden sm:inline">Save Search</span>
                                </button>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="select select-sm select-bordered bg-base-200 border-base-content/10 focus:border-primary font-medium"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Save Search Modal */}
                        {saveSearchOpen && (
                            <div className="mb-6 border border-primary/20 bg-primary/5 rounded-xl p-5">
                                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-bookmark text-primary" />
                                    Save This Search
                                </h3>
                                <div className="flex gap-3">
                                    <input type="text" placeholder="e.g. Senior Engineering Roles" className="input input-bordered input-sm bg-base-200 border-base-content/10 flex-1 focus:border-primary focus:outline-none" />
                                    <button className="btn btn-primary btn-sm font-semibold">Save</button>
                                    <button onClick={() => setSaveSearchOpen(false)} className="btn btn-sm bg-base-200 border-base-content/10">Cancel</button>
                                </div>
                                <p className="text-xs text-base-content/40 mt-2">You will be notified when new jobs match this search.</p>
                            </div>
                        )}

                        {/* Results List */}
                        <div ref={resultsRef}>
                            {results.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4">
                                        <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/20 text-2xl" />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">No results found</h3>
                                    <p className="text-base-content/40 max-w-sm mx-auto mb-6">
                                        Try adjusting your search query or removing some filters to find what you are looking for.
                                    </p>
                                    <button onClick={clearAll} className="btn btn-primary btn-sm font-semibold">
                                        <i className="fa-duotone fa-regular fa-filter-slash" />
                                        Clear All Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {results.map((job) => (
                                        <div
                                            key={job.id}
                                            className="cin-result-item group bg-base-100 border border-base-content/5 rounded-xl p-5 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Avatar */}
                                                <img src={job.recruiter.avatar} alt="" className="w-11 h-11 rounded-xl object-cover ring-1 ring-base-content/10 shrink-0 hidden sm:block" />

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className={`badge badge-xs ${statusColor(job.status)} font-semibold uppercase tracking-wider`}>{job.status}</span>
                                                        {job.featured && <span className="badge badge-xs badge-primary font-semibold"><i className="fa-duotone fa-regular fa-star mr-0.5" />Featured</span>}
                                                        <span className="badge badge-xs bg-base-200 border-0 text-base-content/40 capitalize">{job.type}</span>
                                                    </div>
                                                    <h3 className="font-black text-base leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
                                                    <p className="text-sm text-base-content/50 font-medium">{job.company}</p>
                                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-base-content/40">
                                                        <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-location-dot text-primary text-xs" />{job.location}</span>
                                                        <span className="font-semibold text-base-content/60">{formatSalary(job.salary)}</span>
                                                        <span className="capitalize flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-chart-simple text-primary text-xs" />{job.experienceLevel}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {job.tags.slice(0, 4).map((t, i) => <span key={i} className="badge badge-xs bg-base-200 border-0 text-base-content/50">{t}</span>)}
                                                    </div>
                                                </div>

                                                {/* Right meta */}
                                                <div className="text-right shrink-0 hidden md:block">
                                                    <div className="text-xs text-base-content/30">{formatDate(job.postedDate)}</div>
                                                    <div className="text-xs text-base-content/30 mt-1">{job.applicants} applicants</div>
                                                    <button className="btn btn-ghost btn-xs text-base-content/20 hover:text-primary mt-2">
                                                        <i className="fa-duotone fa-regular fa-bookmark" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
