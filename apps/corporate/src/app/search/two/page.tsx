"use client";

import { useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Data ───────────────────────────────────────────────────────────────────── */

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    salaryNum: number;
    type: string;
    splitFee: string;
    posted: string;
    postedDays: number;
    applicants: number;
    category: string;
    remote: boolean;
    urgent: boolean;
    skills: string[];
}

const allJobs: Job[] = [
    { id: 1, title: "Senior Product Designer", company: "Meridian Tech", location: "San Francisco, CA", salary: "$145K - $185K", salaryNum: 165, type: "Full-time", splitFee: "25%", posted: "3 days ago", postedDays: 3, applicants: 47, category: "Technology", remote: false, urgent: false, skills: ["Figma", "Design Systems", "Prototyping"] },
    { id: 2, title: "VP of Engineering", company: "Quantum Financial", location: "New York, NY", salary: "$280K - $350K", salaryNum: 315, type: "Full-time", splitFee: "30%", posted: "2 days ago", postedDays: 2, applicants: 12, category: "Executive", remote: false, urgent: true, skills: ["Leadership", "Architecture", "Scaling"] },
    { id: 3, title: "Clinical Data Manager", company: "BioVance Labs", location: "Boston, MA", salary: "$110K - $140K", salaryNum: 125, type: "Full-time", splitFee: "20%", posted: "1 week ago", postedDays: 7, applicants: 23, category: "Healthcare", remote: false, urgent: false, skills: ["Clinical Trials", "SAS", "Regulatory"] },
    { id: 4, title: "Growth Marketing Lead", company: "Spark Commerce", location: "Remote", salary: "$130K - $165K", salaryNum: 148, type: "Full-time", splitFee: "22%", posted: "5 days ago", postedDays: 5, applicants: 38, category: "Marketing", remote: true, urgent: false, skills: ["SEO", "Analytics", "Paid Media"] },
    { id: 5, title: "Chief Revenue Officer", company: "Pinnacle SaaS", location: "Austin, TX", salary: "$250K - $320K", salaryNum: 285, type: "Full-time", splitFee: "30%", posted: "1 day ago", postedDays: 1, applicants: 8, category: "Executive", remote: false, urgent: true, skills: ["Revenue", "GTM", "Enterprise Sales"] },
    { id: 6, title: "DevOps Engineer", company: "CloudNine Infra", location: "Remote", salary: "$140K - $175K", salaryNum: 158, type: "Contract", splitFee: "20%", posted: "2 days ago", postedDays: 2, applicants: 31, category: "Technology", remote: true, urgent: false, skills: ["AWS", "Kubernetes", "Terraform"] },
    { id: 7, title: "Risk Analyst", company: "Atlas Capital", location: "Chicago, IL", salary: "$95K - $125K", salaryNum: 110, type: "Full-time", splitFee: "18%", posted: "4 days ago", postedDays: 4, applicants: 19, category: "Finance", remote: false, urgent: false, skills: ["Risk Modeling", "Python", "Compliance"] },
    { id: 8, title: "Frontend Engineer", company: "NovaPay", location: "Remote", salary: "$150K - $190K", salaryNum: 170, type: "Full-time", splitFee: "25%", posted: "1 day ago", postedDays: 1, applicants: 54, category: "Technology", remote: true, urgent: false, skills: ["React", "TypeScript", "Next.js"] },
    { id: 9, title: "Head of Talent", company: "Orion Labs", location: "Seattle, WA", salary: "$170K - $210K", salaryNum: 190, type: "Full-time", splitFee: "25%", posted: "6 days ago", postedDays: 6, applicants: 15, category: "Executive", remote: false, urgent: false, skills: ["Recruiting", "Strategy", "Leadership"] },
    { id: 10, title: "Data Scientist", company: "Prism AI", location: "Remote", salary: "$160K - $200K", salaryNum: 180, type: "Full-time", splitFee: "22%", posted: "3 days ago", postedDays: 3, applicants: 42, category: "Technology", remote: true, urgent: true, skills: ["Python", "ML", "Statistics"] },
];

const CATEGORIES = ["Technology", "Healthcare", "Finance", "Marketing", "Executive"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Contract-to-Hire"];
const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "salary-high", label: "Salary: High to Low" },
    { value: "salary-low", label: "Salary: Low to High" },
    { value: "applicants", label: "Most Applicants" },
];

interface Filters {
    query: string;
    categories: string[];
    types: string[];
    remoteOnly: boolean;
    urgentOnly: boolean;
    salaryMin: number;
    salaryMax: number;
    postedWithin: number;
}

const defaultFilters: Filters = {
    query: "",
    categories: [],
    types: [],
    remoteOnly: false,
    urgentOnly: false,
    salaryMin: 0,
    salaryMax: 400,
    postedWithin: 30,
};

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function SearchPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState<Filters>(defaultFilters);
    const [sortBy, setSortBy] = useState("newest");
    const [savedSearch, setSavedSearch] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(true);

    useGSAP(
        () => {
            gsap.from("[data-page-text]", {
                y: 50,
                opacity: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
            });

            gsap.from("[data-search-bar]", {
                y: 30,
                opacity: 0,
                duration: 0.7,
                delay: 0.3,
                ease: "power2.out",
            });

            gsap.from("[data-filter-panel]", {
                x: -30,
                opacity: 0,
                duration: 0.7,
                delay: 0.4,
                ease: "power2.out",
            });
        },
        { scope: containerRef }
    );

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.categories.length > 0) count++;
        if (filters.types.length > 0) count++;
        if (filters.remoteOnly) count++;
        if (filters.urgentOnly) count++;
        if (filters.salaryMin > 0) count++;
        if (filters.salaryMax < 400) count++;
        if (filters.postedWithin < 30) count++;
        return count;
    }, [filters]);

    const activeFilterTags = useMemo(() => {
        const tags: { label: string; clear: () => void }[] = [];
        filters.categories.forEach((cat) => {
            tags.push({
                label: cat,
                clear: () =>
                    setFilters((prev) => ({
                        ...prev,
                        categories: prev.categories.filter((c) => c !== cat),
                    })),
            });
        });
        filters.types.forEach((type) => {
            tags.push({
                label: type,
                clear: () =>
                    setFilters((prev) => ({
                        ...prev,
                        types: prev.types.filter((t) => t !== type),
                    })),
            });
        });
        if (filters.remoteOnly) {
            tags.push({
                label: "Remote Only",
                clear: () => setFilters((prev) => ({ ...prev, remoteOnly: false })),
            });
        }
        if (filters.urgentOnly) {
            tags.push({
                label: "Urgent Only",
                clear: () => setFilters((prev) => ({ ...prev, urgentOnly: false })),
            });
        }
        if (filters.salaryMin > 0 || filters.salaryMax < 400) {
            tags.push({
                label: `$${filters.salaryMin}K - $${filters.salaryMax}K`,
                clear: () => setFilters((prev) => ({ ...prev, salaryMin: 0, salaryMax: 400 })),
            });
        }
        if (filters.postedWithin < 30) {
            tags.push({
                label: `Last ${filters.postedWithin} days`,
                clear: () => setFilters((prev) => ({ ...prev, postedWithin: 30 })),
            });
        }
        return tags;
    }, [filters]);

    const filteredJobs = useMemo(() => {
        let result = allJobs.filter((job) => {
            if (filters.query) {
                const q = filters.query.toLowerCase();
                if (
                    !job.title.toLowerCase().includes(q) &&
                    !job.company.toLowerCase().includes(q) &&
                    !job.location.toLowerCase().includes(q) &&
                    !job.skills.some((s) => s.toLowerCase().includes(q))
                )
                    return false;
            }
            if (filters.categories.length > 0 && !filters.categories.includes(job.category))
                return false;
            if (filters.types.length > 0 && !filters.types.includes(job.type)) return false;
            if (filters.remoteOnly && !job.remote) return false;
            if (filters.urgentOnly && !job.urgent) return false;
            if (job.salaryNum < filters.salaryMin || job.salaryNum > filters.salaryMax)
                return false;
            if (job.postedDays > filters.postedWithin) return false;
            return true;
        });

        switch (sortBy) {
            case "salary-high":
                result.sort((a, b) => b.salaryNum - a.salaryNum);
                break;
            case "salary-low":
                result.sort((a, b) => a.salaryNum - b.salaryNum);
                break;
            case "applicants":
                result.sort((a, b) => b.applicants - a.applicants);
                break;
            default:
                result.sort((a, b) => a.postedDays - b.postedDays);
        }

        return result;
    }, [filters, sortBy]);

    const toggleCategory = (cat: string) => {
        setFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter((c) => c !== cat)
                : [...prev.categories, cat],
        }));
    };

    const toggleType = (type: string) => {
        setFilters((prev) => ({
            ...prev,
            types: prev.types.includes(type)
                ? prev.types.filter((t) => t !== type)
                : [...prev.types, type],
        }));
    };

    const clearAllFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100 overflow-hidden">
            {/* Hero */}
            <section className="bg-neutral text-neutral-content py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p
                        data-page-text
                        className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-6"
                    >
                        Component Showcase
                    </p>
                    <h1
                        data-page-text
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-6"
                    >
                        Search &
                        <br />
                        Filters
                    </h1>
                    <p
                        data-page-text
                        className="text-lg md:text-xl text-neutral-content/70 max-w-xl leading-relaxed"
                    >
                        Advanced search with multi-faceted filtering, active filter
                        tags, sort controls, and save-search functionality for the
                        recruiting marketplace.
                    </p>
                </div>
            </section>

            {/* Search Bar */}
            <div className="bg-base-200 border-b border-base-300 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
                    <div data-search-bar className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                            <input
                                type="text"
                                placeholder="Search jobs, companies, skills..."
                                value={filters.query}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, query: e.target.value }))
                                }
                                className="input input-bordered w-full bg-base-100 pl-11 focus:border-secondary"
                            />
                            {filters.query && (
                                <button
                                    onClick={() => setFilters((prev) => ({ ...prev, query: "" }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content"
                                >
                                    <i className="fa-regular fa-xmark" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className={`btn btn-ghost border font-semibold uppercase text-[10px] tracking-wider px-4 ${
                                filtersOpen
                                    ? "border-secondary text-secondary"
                                    : "border-base-300 text-base-content/60"
                            }`}
                        >
                            <i className="fa-duotone fa-regular fa-sliders mr-2" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-2 w-5 h-5 bg-secondary text-secondary-content text-[10px] font-bold flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setSavedSearch(!savedSearch)}
                            className={`btn btn-ghost border font-semibold uppercase text-[10px] tracking-wider px-4 ${
                                savedSearch
                                    ? "border-secondary text-secondary"
                                    : "border-base-300 text-base-content/60"
                            }`}
                        >
                            <i className={`fa-${savedSearch ? "solid" : "regular"} fa-bookmark mr-2`} />
                            {savedSearch ? "Saved" : "Save Search"}
                        </button>
                    </div>

                    {/* Active Filter Tags */}
                    {activeFilterTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="text-[10px] uppercase tracking-wider text-base-content/40 font-medium">
                                Active:
                            </span>
                            {activeFilterTags.map((tag, i) => (
                                <button
                                    key={i}
                                    onClick={tag.clear}
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-medium hover:bg-secondary/20 transition-colors"
                                >
                                    {tag.label}
                                    <i className="fa-regular fa-xmark text-[10px]" />
                                </button>
                            ))}
                            <button
                                onClick={clearAllFilters}
                                className="text-[10px] uppercase tracking-wider text-base-content/40 hover:text-error transition-colors ml-2"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <section className="py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex gap-8">
                        {/* Sidebar Filters */}
                        {filtersOpen && (
                            <aside data-filter-panel className="hidden lg:block w-64 shrink-0">
                                <div className="sticky top-28 space-y-8">
                                    {/* Categories */}
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-3">
                                            Category
                                        </p>
                                        <div className="space-y-2">
                                            {CATEGORIES.map((cat) => (
                                                <label
                                                    key={cat}
                                                    className="flex items-center gap-3 cursor-pointer group"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-secondary checkbox-sm"
                                                        checked={filters.categories.includes(cat)}
                                                        onChange={() => toggleCategory(cat)}
                                                    />
                                                    <span className="text-sm text-base-content/60 group-hover:text-base-content transition-colors">
                                                        {cat}
                                                    </span>
                                                    <span className="ml-auto text-[10px] text-base-content/30">
                                                        {allJobs.filter((j) => j.category === cat).length}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-base-300" />

                                    {/* Job Type */}
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-3">
                                            Job Type
                                        </p>
                                        <div className="space-y-2">
                                            {JOB_TYPES.map((type) => (
                                                <label
                                                    key={type}
                                                    className="flex items-center gap-3 cursor-pointer group"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-secondary checkbox-sm"
                                                        checked={filters.types.includes(type)}
                                                        onChange={() => toggleType(type)}
                                                    />
                                                    <span className="text-sm text-base-content/60 group-hover:text-base-content transition-colors">
                                                        {type}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-base-300" />

                                    {/* Salary Range */}
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-3">
                                            Salary Range
                                        </p>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-[10px] uppercase tracking-wider text-base-content/40 mb-1">
                                                    <span>Min: ${filters.salaryMin}K</span>
                                                    <span>Max: ${filters.salaryMax}K</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="400"
                                                    step="10"
                                                    value={filters.salaryMin}
                                                    onChange={(e) =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            salaryMin: Math.min(Number(e.target.value), prev.salaryMax - 10),
                                                        }))
                                                    }
                                                    className="range range-secondary range-xs w-full"
                                                />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="400"
                                                    step="10"
                                                    value={filters.salaryMax}
                                                    onChange={(e) =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            salaryMax: Math.max(Number(e.target.value), prev.salaryMin + 10),
                                                        }))
                                                    }
                                                    className="range range-secondary range-xs w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-base-300" />

                                    {/* Posted Within */}
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-3">
                                            Posted Within
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { value: 1, label: "24h" },
                                                { value: 3, label: "3d" },
                                                { value: 7, label: "7d" },
                                                { value: 14, label: "14d" },
                                                { value: 30, label: "Any" },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            postedWithin: opt.value,
                                                        }))
                                                    }
                                                    className={`px-3 py-1 text-[10px] uppercase tracking-wider font-medium border transition-colors ${
                                                        filters.postedWithin === opt.value
                                                            ? "bg-secondary text-secondary-content border-secondary"
                                                            : "text-base-content/50 border-base-300 hover:border-secondary"
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-base-300" />

                                    {/* Toggles */}
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-base-content/60">Remote Only</span>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-secondary toggle-sm"
                                                checked={filters.remoteOnly}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        remoteOnly: e.target.checked,
                                                    }))
                                                }
                                            />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-base-content/60">Urgent Only</span>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-secondary toggle-sm"
                                                checked={filters.urgentOnly}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        urgentOnly: e.target.checked,
                                                    }))
                                                }
                                            />
                                        </label>
                                    </div>
                                </div>
                            </aside>
                        )}

                        {/* Results */}
                        <div className="flex-1 min-w-0">
                            {/* Results header */}
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-base-content/50">
                                    <span className="font-bold text-base-content">
                                        {filteredJobs.length}
                                    </span>{" "}
                                    result{filteredJobs.length !== 1 ? "s" : ""} found
                                </p>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="select select-bordered select-sm bg-base-100 text-xs focus:border-secondary"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="h-px bg-base-300 mb-6" />

                            {/* Job Results */}
                            {filteredJobs.length === 0 ? (
                                <div className="text-center py-20">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/15 text-5xl mb-6 block" />
                                    <h3 className="text-xl font-bold text-base-content tracking-tight mb-2">
                                        No results found
                                    </h3>
                                    <p className="text-sm text-base-content/50 mb-6 max-w-sm mx-auto">
                                        Try adjusting your search query or removing some filters
                                        to see more results.
                                    </p>
                                    <button
                                        onClick={clearAllFilters}
                                        className="btn btn-secondary btn-sm font-semibold uppercase text-[10px] tracking-wider"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredJobs.map((job) => (
                                        <div
                                            key={job.id}
                                            className="border border-base-300 p-5 md:p-6 hover:border-secondary/40 transition-all group cursor-pointer"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        {job.urgent && (
                                                            <span className="text-[10px] uppercase tracking-wider font-medium bg-error/10 text-error px-2 py-0.5">
                                                                Urgent
                                                            </span>
                                                        )}
                                                        {job.remote && (
                                                            <span className="text-[10px] uppercase tracking-wider font-medium bg-secondary/10 text-secondary px-2 py-0.5">
                                                                Remote
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] uppercase tracking-wider text-base-content/30">
                                                            {job.posted}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-base-content tracking-tight mb-1 group-hover:text-secondary transition-colors">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-sm text-base-content/50 mb-3">
                                                        {job.company} &middot; {job.location}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {job.skills.map((skill) => (
                                                            <span
                                                                key={skill}
                                                                className="text-[10px] uppercase tracking-wider font-medium bg-base-200 text-base-content/50 px-2 py-0.5"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 md:ml-6">
                                                    <p className="text-base font-bold text-primary mb-1">
                                                        {job.salary}
                                                    </p>
                                                    <p className="text-[10px] uppercase tracking-wider text-base-content/40 mb-1">
                                                        {job.splitFee} split &middot; {job.type}
                                                    </p>
                                                    <p className="text-xs text-base-content/40">
                                                        {job.applicants} applicants
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Colophon */}
            <section className="bg-base-200 border-t border-base-300 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">
                        Splits Network &middot; Search Patterns &middot; Magazine Editorial
                    </p>
                </div>
            </section>
        </div>
    );
}
