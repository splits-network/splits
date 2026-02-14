"use client";

import { useState, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ── Animation constants ──────────────────────────────────────────────────────
const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };

// ── Filter types ─────────────────────────────────────────────────────────────

interface ActiveFilter {
    key: string;
    label: string;
    value: string;
}

type SortOption = "relevance" | "newest" | "salary-high" | "salary-low" | "applicants";

const jobTypes = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];
const experienceLevels = ["Entry", "Mid", "Senior", "Lead", "Executive"];
const locations = ["San Francisco", "New York", "Remote", "London", "Berlin", "Toronto", "Austin", "Seattle"];
const industries = ["Technology", "Finance", "Healthcare", "Education", "E-commerce", "AI/ML", "SaaS", "Crypto"];
const salaryRanges = [
    { label: "Under $100K", min: 0, max: 100000 },
    { label: "$100K - $150K", min: 100000, max: 150000 },
    { label: "$150K - $200K", min: 150000, max: 200000 },
    { label: "$200K - $250K", min: 200000, max: 250000 },
    { label: "$250K+", min: 250000, max: 999999 },
];

// ── Mock search results ──────────────────────────────────────────────────────

const allResults = [
    { id: 1, title: "Senior Frontend Engineer", company: "Stripe", location: "San Francisco", salary: 210000, type: "Full-time", experience: "Senior", industry: "Finance", posted: "2d ago", applicants: 47, skills: ["React", "TypeScript"], hot: true },
    { id: 2, title: "Staff ML Engineer", company: "OpenAI", location: "San Francisco", salary: 290000, type: "Full-time", experience: "Lead", industry: "AI/ML", posted: "1d ago", applicants: 63, skills: ["Python", "PyTorch"], hot: true },
    { id: 3, title: "Product Designer", company: "Figma", location: "Remote", salary: 185000, type: "Remote", experience: "Senior", industry: "Technology", posted: "3d ago", applicants: 32, skills: ["Figma", "Design Systems"], hot: false },
    { id: 4, title: "Engineering Manager", company: "Notion", location: "New York", salary: 240000, type: "Full-time", experience: "Lead", industry: "SaaS", posted: "1w ago", applicants: 19, skills: ["Leadership", "Architecture"], hot: false },
    { id: 5, title: "Backend Engineer", company: "Vercel", location: "Remote", salary: 195000, type: "Remote", experience: "Mid", industry: "Technology", posted: "5d ago", applicants: 28, skills: ["Node.js", "Go"], hot: false },
    { id: 6, title: "Data Scientist", company: "Airbnb", location: "San Francisco", salary: 220000, type: "Full-time", experience: "Senior", industry: "E-commerce", posted: "2d ago", applicants: 35, skills: ["Python", "SQL"], hot: false },
    { id: 7, title: "DevOps Lead", company: "Datadog", location: "New York", salary: 205000, type: "Full-time", experience: "Senior", industry: "SaaS", posted: "4d ago", applicants: 22, skills: ["Kubernetes", "AWS"], hot: false },
    { id: 8, title: "Head of Design", company: "Linear", location: "Remote", salary: 235000, type: "Remote", experience: "Executive", industry: "SaaS", posted: "1w ago", applicants: 15, skills: ["Leadership", "Design"], hot: false },
    { id: 9, title: "iOS Engineer", company: "Spotify", location: "London", salary: 165000, type: "Full-time", experience: "Mid", industry: "Technology", posted: "3d ago", applicants: 41, skills: ["Swift", "iOS"], hot: false },
    { id: 10, title: "Full Stack Developer", company: "Shopify", location: "Toronto", salary: 175000, type: "Full-time", experience: "Mid", industry: "E-commerce", posted: "6d ago", applicants: 38, skills: ["Ruby", "React"], hot: false },
    { id: 11, title: "Security Engineer", company: "CrowdStrike", location: "Austin", salary: 215000, type: "Full-time", experience: "Senior", industry: "Technology", posted: "2d ago", applicants: 14, skills: ["Security", "Cloud"], hot: true },
    { id: 12, title: "Frontend Architect", company: "Meta", location: "Seattle", salary: 275000, type: "Full-time", experience: "Lead", industry: "Technology", posted: "1d ago", applicants: 56, skills: ["React", "GraphQL"], hot: true },
];

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function SearchThreePage() {
    const [query, setQuery] = useState("frontend engineer");
    const [sort, setSort] = useState<SortOption>("relevance");
    const [selectedTypes, setSelectedTypes] = useState<string[]>(["Full-time", "Remote"]);
    const [selectedExperience, setSelectedExperience] = useState<string[]>(["Senior"]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [salaryRange, setSalaryRange] = useState<{ min: number; max: number }>({ min: 0, max: 999999 });
    const [filtersOpen, setFiltersOpen] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Active filters for display
    const activeFilters = useMemo<ActiveFilter[]>(() => {
        const filters: ActiveFilter[] = [];
        selectedTypes.forEach((t) => filters.push({ key: "type", label: "Type", value: t }));
        selectedExperience.forEach((e) => filters.push({ key: "experience", label: "Level", value: e }));
        selectedLocations.forEach((l) => filters.push({ key: "location", label: "Location", value: l }));
        selectedIndustries.forEach((i) => filters.push({ key: "industry", label: "Industry", value: i }));
        if (salaryRange.min > 0 || salaryRange.max < 999999) {
            const label = salaryRange.max >= 999999
                ? `$${(salaryRange.min / 1000)}K+`
                : `$${(salaryRange.min / 1000)}K - $${(salaryRange.max / 1000)}K`;
            filters.push({ key: "salary", label: "Salary", value: label });
        }
        return filters;
    }, [selectedTypes, selectedExperience, selectedLocations, selectedIndustries, salaryRange]);

    const removeFilter = (filter: ActiveFilter) => {
        switch (filter.key) {
            case "type": setSelectedTypes((prev) => prev.filter((t) => t !== filter.value)); break;
            case "experience": setSelectedExperience((prev) => prev.filter((e) => e !== filter.value)); break;
            case "location": setSelectedLocations((prev) => prev.filter((l) => l !== filter.value)); break;
            case "industry": setSelectedIndustries((prev) => prev.filter((i) => i !== filter.value)); break;
            case "salary": setSalaryRange({ min: 0, max: 999999 }); break;
        }
    };

    const clearAllFilters = () => {
        setSelectedTypes([]);
        setSelectedExperience([]);
        setSelectedLocations([]);
        setSelectedIndustries([]);
        setSalaryRange({ min: 0, max: 999999 });
    };

    // Filtered results
    const results = useMemo(() => {
        let filtered = allResults.filter((r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.company.toLowerCase().includes(query.toLowerCase()) ||
            r.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())),
        );
        if (selectedTypes.length > 0) filtered = filtered.filter((r) => selectedTypes.includes(r.type));
        if (selectedExperience.length > 0) filtered = filtered.filter((r) => selectedExperience.includes(r.experience));
        if (selectedLocations.length > 0) filtered = filtered.filter((r) => selectedLocations.includes(r.location));
        if (selectedIndustries.length > 0) filtered = filtered.filter((r) => selectedIndustries.includes(r.industry));
        if (salaryRange.min > 0 || salaryRange.max < 999999) {
            filtered = filtered.filter((r) => r.salary >= salaryRange.min && r.salary <= salaryRange.max);
        }

        switch (sort) {
            case "newest": return [...filtered]; // already sorted by recency in mock
            case "salary-high": return [...filtered].sort((a, b) => b.salary - a.salary);
            case "salary-low": return [...filtered].sort((a, b) => a.salary - b.salary);
            case "applicants": return [...filtered].sort((a, b) => b.applicants - a.applicants);
            default: return filtered;
        }
    }, [query, selectedTypes, selectedExperience, selectedLocations, selectedIndustries, salaryRange, sort]);

    const toggleArray = (arr: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
    };

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: E.precise } });
            tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
            tl.fromTo($1(".page-title"), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.3");
            tl.fromTo($1(".search-bar"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: D.normal }, "-=0.2");
            tl.fromTo($(".filter-section"), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: D.fast, stagger: 0.06 }, "-=0.1");
            tl.fromTo($(".result-item"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.03 }, "-=0.2");
        },
        { scope: containerRef },
    );

    const fmtSalary = (n: number) => "$" + Math.round(n / 1000) + "K";

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            {/* ── HEADER ─────────────────────────────────────── */}
            <header className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-10 pb-6">
                    <div className="flex items-end gap-4 mb-5">
                        <span className="page-number opacity-0 text-5xl lg:text-7xl font-black tracking-tighter text-neutral/6 select-none leading-none">
                            S3
                        </span>
                        <div className="page-title opacity-0 pb-1">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-1">
                                Advanced
                            </p>
                            <h1 className="text-2xl lg:text-4xl font-black tracking-tight">
                                Search & Filter
                            </h1>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="search-bar opacity-0">
                        <div className="flex gap-[2px]">
                            <div className="flex-1 relative">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-base-content/25" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search roles, companies, skills..."
                                    className="w-full pl-11 pr-4 py-4 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral placeholder:text-base-content/25 transition-colors"
                                />
                            </div>
                            <button className="px-6 py-4 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── CONTENT ────────────────────────────────────── */}
            <div className="flex min-h-[70vh]">
                {/* Sidebar filters */}
                <aside className={`border-r border-neutral/10 flex-shrink-0 overflow-y-auto transition-all duration-300 ${
                    filtersOpen ? "w-64 lg:w-72" : "w-0"
                }`}>
                    {filtersOpen && (
                        <div className="px-5 py-6">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold">
                                    Filters
                                </p>
                                <button
                                    onClick={() => setFiltersOpen(false)}
                                    className="text-base-content/20 hover:text-base-content text-xs transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            </div>

                            {/* Job Type */}
                            <div className="filter-section opacity-0 mb-6">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/30 font-bold mb-3">
                                    Job Type
                                </p>
                                <div className="space-y-1">
                                    {jobTypes.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => toggleArray(selectedTypes, setSelectedTypes, type)}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-base-200"
                                        >
                                            <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${
                                                selectedTypes.includes(type)
                                                    ? "border-neutral bg-neutral"
                                                    : "border-neutral/20"
                                            }`}>
                                                {selectedTypes.includes(type) && (
                                                    <i className="fa-duotone fa-regular fa-check text-neutral-content text-[7px]" />
                                                )}
                                            </div>
                                            <span className="text-[11px] font-medium tracking-tight text-base-content/50">{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="filter-section opacity-0 mb-6">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/30 font-bold mb-3">
                                    Experience Level
                                </p>
                                <div className="space-y-1">
                                    {experienceLevels.map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => toggleArray(selectedExperience, setSelectedExperience, level)}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-base-200"
                                        >
                                            <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${
                                                selectedExperience.includes(level)
                                                    ? "border-neutral bg-neutral"
                                                    : "border-neutral/20"
                                            }`}>
                                                {selectedExperience.includes(level) && (
                                                    <i className="fa-duotone fa-regular fa-check text-neutral-content text-[7px]" />
                                                )}
                                            </div>
                                            <span className="text-[11px] font-medium tracking-tight text-base-content/50">{level}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Salary Range */}
                            <div className="filter-section opacity-0 mb-6">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/30 font-bold mb-3">
                                    Salary Range
                                </p>
                                <div className="space-y-1">
                                    {salaryRanges.map((range) => (
                                        <button
                                            key={range.label}
                                            onClick={() => setSalaryRange({ min: range.min, max: range.max })}
                                            className={`w-full text-left px-2 py-1.5 text-[11px] font-medium tracking-tight transition-colors ${
                                                salaryRange.min === range.min && salaryRange.max === range.max
                                                    ? "bg-neutral text-neutral-content"
                                                    : "text-base-content/50 hover:bg-base-200"
                                            }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="filter-section opacity-0 mb-6">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/30 font-bold mb-3">
                                    Location
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {locations.map((loc) => (
                                        <button
                                            key={loc}
                                            onClick={() => toggleArray(selectedLocations, setSelectedLocations, loc)}
                                            className={`px-2 py-1 text-[9px] uppercase tracking-[0.1em] font-bold border transition-colors ${
                                                selectedLocations.includes(loc)
                                                    ? "border-neutral bg-neutral text-neutral-content"
                                                    : "border-neutral/10 text-base-content/25 hover:border-neutral/30"
                                            }`}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Industry */}
                            <div className="filter-section opacity-0 mb-6">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/30 font-bold mb-3">
                                    Industry
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {industries.map((ind) => (
                                        <button
                                            key={ind}
                                            onClick={() => toggleArray(selectedIndustries, setSelectedIndustries, ind)}
                                            className={`px-2 py-1 text-[9px] uppercase tracking-[0.1em] font-bold border transition-colors ${
                                                selectedIndustries.includes(ind)
                                                    ? "border-neutral bg-neutral text-neutral-content"
                                                    : "border-neutral/10 text-base-content/25 hover:border-neutral/30"
                                            }`}
                                        >
                                            {ind}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save search */}
                            <button className="filter-section opacity-0 w-full py-2.5 border-2 border-neutral/15 text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/30 hover:border-neutral hover:text-base-content transition-colors flex items-center justify-center gap-2">
                                <i className="fa-duotone fa-regular fa-bookmark text-xs" />
                                Save This Search
                            </button>
                        </div>
                    )}
                </aside>

                {/* Results */}
                <div className="flex-1 min-w-0">
                    {/* Results toolbar */}
                    <div className="px-6 py-4 border-b border-neutral/10 flex flex-wrap items-center gap-3">
                        {!filtersOpen && (
                            <button
                                onClick={() => setFiltersOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-base-200 text-[10px] uppercase tracking-[0.15em] font-bold text-base-content/40 hover:text-base-content transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-sliders text-xs" />
                                Filters
                            </button>
                        )}

                        <span className="text-[10px] uppercase tracking-[0.2em] text-base-content/25 font-bold">
                            {results.length} results
                        </span>

                        {/* Active filters */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 flex-1">
                                {activeFilters.map((filter, i) => (
                                    <button
                                        key={`${filter.key}-${filter.value}-${i}`}
                                        onClick={() => removeFilter(filter)}
                                        className="flex items-center gap-1.5 px-2 py-1 bg-neutral text-neutral-content text-[9px] uppercase tracking-[0.1em] font-bold hover:bg-error transition-colors"
                                    >
                                        {filter.value}
                                        <i className="fa-duotone fa-regular fa-xmark text-[8px]" />
                                    </button>
                                ))}
                                <button
                                    onClick={clearAllFilters}
                                    className="text-[9px] uppercase tracking-[0.1em] font-bold text-base-content/20 hover:text-base-content px-2 py-1 transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        <div className="flex-1" />

                        {/* Sort */}
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOption)}
                            className="bg-base-200 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-bold outline-none cursor-pointer border-2 border-transparent focus:border-neutral"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="newest">Newest</option>
                            <option value="salary-high">Salary: High to Low</option>
                            <option value="salary-low">Salary: Low to High</option>
                            <option value="applicants">Most Applicants</option>
                        </select>
                    </div>

                    {/* Results list */}
                    <div className="divide-y divide-base-300">
                        {results.map((result) => (
                            <div
                                key={result.id}
                                className="result-item opacity-0 px-6 py-5 hover:bg-base-200/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-base-200 flex items-center justify-center text-xs font-black text-base-content/30 flex-shrink-0 group-hover:bg-neutral group-hover:text-neutral-content transition-colors">
                                        {result.company[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            {result.hot && (
                                                <span className="px-1.5 py-0.5 bg-error/10 text-error text-[7px] uppercase tracking-[0.15em] font-black">
                                                    Hot
                                                </span>
                                            )}
                                            <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/25 font-bold">
                                                {result.company}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-black tracking-tight mb-1.5 group-hover:text-primary transition-colors">
                                            {result.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-base-content/30">
                                            <span><i className="fa-duotone fa-regular fa-location-dot mr-1" />{result.location}</span>
                                            <span><i className="fa-duotone fa-regular fa-clock mr-1" />{result.type}</span>
                                            <span><i className="fa-duotone fa-regular fa-layer-group mr-1" />{result.experience}</span>
                                            <span><i className="fa-duotone fa-regular fa-tag mr-1" />{result.industry}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-0.5 mt-2">
                                            {result.skills.map((skill) => (
                                                <span key={skill} className="px-1.5 py-0.5 bg-base-200 text-[7px] uppercase tracking-[0.15em] font-bold text-base-content/30">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-black tracking-tight">{fmtSalary(result.salary)}</div>
                                        <div className="text-[9px] text-base-content/20 mt-1">{result.posted}</div>
                                        <div className="text-[9px] text-base-content/20">{result.applicants} applicants</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {results.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="text-6xl font-black tracking-tighter text-neutral/5 mb-4 select-none">00</div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/25 font-bold mb-4">
                                    No results match your criteria
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-4 py-2 bg-base-200 text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 hover:text-base-content transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
