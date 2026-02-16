"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── data ─── */

const jobTypeOptions = ["Full-Time", "Part-Time", "Contract", "Freelance"];
const locationOptions = [
    "Remote",
    "San Francisco, CA",
    "New York, NY",
    "Austin, TX",
    "Chicago, IL",
    "Seattle, WA",
    "Los Angeles, CA",
];
const experienceOptions = [
    "Entry Level",
    "Junior (1-3 yrs)",
    "Mid-Level (3-5 yrs)",
    "Senior (6-9 yrs)",
    "Lead (10+ yrs)",
    "Executive",
];
const departmentOptions = [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Sales",
    "Operations",
    "Finance",
    "HR",
];
const splitOptions = ["50/50", "60/40", "40/60", "70/30", "Custom"];
const sortOptions = [
    "Most Relevant",
    "Newest First",
    "Highest Salary",
    "Most Applicants",
    "Closing Soon",
];

interface ActiveFilter {
    category: string;
    value: string;
}

const mockResults = [
    {
        id: 1,
        title: "Senior Software Engineer",
        company: "Nexus Dynamics",
        location: "San Francisco, CA",
        type: "Full-Time",
        salary: "$160K - $210K",
        split: "50/50",
        applicants: 24,
        posted: "3 days ago",
        skills: ["React", "TypeScript", "Node.js"],
        match: 97,
    },
    {
        id: 2,
        title: "Staff Frontend Engineer",
        company: "DataVault",
        location: "Remote",
        type: "Full-Time",
        salary: "$180K - $240K",
        split: "50/50",
        applicants: 18,
        posted: "1 day ago",
        skills: ["React", "GraphQL", "Design Systems"],
        match: 94,
    },
    {
        id: 3,
        title: "Backend Engineer",
        company: "Relay Systems",
        location: "Austin, TX",
        type: "Full-Time",
        salary: "$150K - $195K",
        split: "60/40",
        applicants: 31,
        posted: "5 days ago",
        skills: ["Node.js", "PostgreSQL", "Redis"],
        match: 89,
    },
    {
        id: 4,
        title: "Full-Stack Engineer",
        company: "Cortex AI",
        location: "Hybrid",
        type: "Contract",
        salary: "$95/hr - $120/hr",
        split: "50/50",
        applicants: 14,
        posted: "2 days ago",
        skills: ["React", "Python", "AWS"],
        match: 85,
    },
    {
        id: 5,
        title: "Platform Engineer",
        company: "CloudBase",
        location: "Remote",
        type: "Full-Time",
        salary: "$170K - $215K",
        split: "50/50",
        applicants: 9,
        posted: "Today",
        skills: ["Kubernetes", "Terraform", "Go"],
        match: 82,
    },
    {
        id: 6,
        title: "Engineering Manager",
        company: "Nexus Dynamics",
        location: "San Francisco, CA",
        type: "Full-Time",
        salary: "$200K - $260K",
        split: "40/60",
        applicants: 12,
        posted: "4 days ago",
        skills: ["Leadership", "System Design", "Agile"],
        match: 78,
    },
    {
        id: 7,
        title: "DevOps Engineer",
        company: "Pipeline Co",
        location: "New York, NY",
        type: "Full-Time",
        salary: "$155K - $190K",
        split: "50/50",
        applicants: 21,
        posted: "6 days ago",
        skills: ["Docker", "CI/CD", "AWS"],
        match: 75,
    },
    {
        id: 8,
        title: "Senior React Developer",
        company: "Growth Labs",
        location: "Remote",
        type: "Contract",
        salary: "$85/hr - $105/hr",
        split: "50/50",
        applicants: 33,
        posted: "1 week ago",
        skills: ["React", "Next.js", "TypeScript"],
        match: 72,
    },
];

/* ─── component ─── */

export default function SearchShowcaseTen() {
    const mainRef = useRef<HTMLElement>(null);
    const [searchQuery, setSearchQuery] = useState("React Engineer");
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
        { category: "Type", value: "Full-Time" },
        { category: "Location", value: "Remote" },
    ]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(["Full-Time"]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([
        "Remote",
    ]);
    const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
        [],
    );
    const [salaryMin, setSalaryMin] = useState("100");
    const [salaryMax, setSalaryMax] = useState("250");
    const [selectedSplit, setSelectedSplit] = useState("");
    const [sortBy, setSortBy] = useState("Most Relevant");
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [saveSearchOpen, setSaveSearchOpen] = useState(false);

    const removeFilter = (filter: ActiveFilter) => {
        setActiveFilters((prev) =>
            prev.filter(
                (f) =>
                    f.category !== filter.category || f.value !== filter.value,
            ),
        );
        if (filter.category === "Type")
            setSelectedTypes((prev) => prev.filter((t) => t !== filter.value));
        if (filter.category === "Location")
            setSelectedLocations((prev) =>
                prev.filter((l) => l !== filter.value),
            );
    };

    const addFilter = (category: string, value: string) => {
        if (
            !activeFilters.find(
                (f) => f.category === category && f.value === value,
            )
        ) {
            setActiveFilters((prev) => [...prev, { category, value }]);
        }
    };

    const clearAllFilters = () => {
        setActiveFilters([]);
        setSelectedTypes([]);
        setSelectedLocations([]);
        setSelectedExperience([]);
        setSelectedDepartments([]);
        setSelectedSplit("");
        setSalaryMin("0");
        setSalaryMax("300");
    };

    const toggleCheckbox = (
        value: string,
        selected: string[],
        setSelected: React.Dispatch<React.SetStateAction<string[]>>,
        category: string,
    ) => {
        if (selected.includes(value)) {
            setSelected((prev) => prev.filter((v) => v !== value));
            removeFilter({ category, value });
        } else {
            setSelected((prev) => [...prev, value]);
            addFilter(category, value);
        }
    };

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(
                ".search-scanline",
                { scaleX: 0 },
                { scaleX: 1, duration: 0.6 },
            )
                .fromTo(
                    ".search-bar",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.2",
                )
                .fromTo(
                    ".filter-panel",
                    { opacity: 0, x: -30 },
                    { opacity: 1, x: 0, duration: 0.5 },
                    "-=0.2",
                )
                .fromTo(
                    ".result-item",
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 },
                    "-=0.2",
                );

            gsap.fromTo(
                ".status-pulse",
                { scale: 0.6, opacity: 0.4 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                },
            );
        },
        { scope: mainRef },
    );

    return (
        <main
            ref={mainRef}
            className="min-h-screen bg-base-300 text-base-content overflow-x-hidden"
        >
            <div
                className="fixed inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
            <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-coral/30 pointer-events-none z-10" />

            {/* Header */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-8">
                <div className="search-scanline h-[2px] bg-primary w-32 mb-6 origin-left" />
                <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3 opacity-80">
                    sys.search &gt; advanced_query v2.0
                </p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                    Network Search
                </h1>
                <p className="text-base-content/40 text-sm">
                    Advanced filtering across all positions in the recruiting
                    network
                </p>
            </section>

            {/* Search Bar */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-6">
                <div className="search-bar flex items-center gap-3 p-3 bg-base-200 border border-base-content/10">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-primary text-sm ml-2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search jobs, skills, companies..."
                        className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-base-content placeholder:text-base-content/20"
                    />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSaveSearchOpen(!saveSearchOpen)}
                            className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-[10px]"
                        >
                            <i className="fa-duotone fa-regular fa-floppy-disk mr-1" />{" "}
                            Save Search
                        </button>
                        <button className="btn btn-primary btn-sm font-mono uppercase tracking-wider text-[10px]">
                            <i className="fa-duotone fa-regular fa-search mr-1" />{" "}
                            Search
                        </button>
                    </div>
                </div>
                {saveSearchOpen && (
                    <div className="mt-2 p-4 bg-base-200 border border-coral/20 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-floppy-disk text-primary text-sm" />
                        <input
                            type="text"
                            placeholder="Name this search..."
                            className="input input-sm flex-1 bg-base-300 border border-base-content/10 font-mono text-xs"
                        />
                        <button
                            onClick={() => setSaveSearchOpen(false)}
                            className="btn btn-primary btn-xs font-mono uppercase tracking-wider text-[9px]"
                        >
                            <i className="fa-duotone fa-regular fa-check mr-1" />{" "}
                            Save
                        </button>
                        <button
                            onClick={() => setSaveSearchOpen(false)}
                            className="btn btn-ghost btn-xs font-mono text-[9px]"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </section>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <section className="relative z-10 max-w-7xl mx-auto px-6 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/25 mr-1">
                            Active Filters:
                        </span>
                        {activeFilters.map((f) => (
                            <button
                                key={`${f.category}-${f.value}`}
                                onClick={() => removeFilter(f)}
                                className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-coral/20 text-primary font-mono text-[10px] uppercase tracking-wider hover:bg-primary/20 transition-colors group"
                            >
                                <span className="text-primary/50">
                                    {f.category}:
                                </span>
                                {f.value}
                                <i className="fa-duotone fa-regular fa-xmark text-[9px] opacity-50 group-hover:opacity-100" />
                            </button>
                        ))}
                        <button
                            onClick={clearAllFilters}
                            className="font-mono text-[10px] text-error/50 hover:text-error transition-colors uppercase tracking-wider ml-2"
                        >
                            Clear All
                        </button>
                    </div>
                </section>
            )}

            {/* Main Content */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
                <div className="flex gap-6">
                    {/* Filter Sidebar */}
                    <div
                        className={`filter-panel w-72 flex-shrink-0 ${filtersOpen ? "block" : "hidden"}`}
                    >
                        <div className="bg-base-200 border border-base-content/5 sticky top-6">
                            <div className="flex items-center justify-between p-4 border-b border-base-content/5">
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-filter text-primary text-sm" />
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                        Filters
                                    </span>
                                </div>
                                <button
                                    onClick={() => setFiltersOpen(false)}
                                    className="btn btn-ghost btn-xs btn-square"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark text-xs text-base-content/30" />
                                </button>
                            </div>

                            <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Job Type */}
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mb-2.5">
                                        Employment Type
                                    </p>
                                    <div className="space-y-1.5">
                                        {jobTypeOptions.map((t) => (
                                            <label
                                                key={t}
                                                className="flex items-center gap-2.5 cursor-pointer group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-xs checkbox-primary"
                                                    checked={selectedTypes.includes(
                                                        t,
                                                    )}
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            t,
                                                            selectedTypes,
                                                            setSelectedTypes,
                                                            "Type",
                                                        )
                                                    }
                                                />
                                                <span className="font-mono text-xs text-base-content/40 group-hover:text-base-content/60 transition-colors">
                                                    {t}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mb-2.5">
                                        Location
                                    </p>
                                    <div className="space-y-1.5">
                                        {locationOptions.map((l) => (
                                            <label
                                                key={l}
                                                className="flex items-center gap-2.5 cursor-pointer group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-xs checkbox-primary"
                                                    checked={selectedLocations.includes(
                                                        l,
                                                    )}
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            l,
                                                            selectedLocations,
                                                            setSelectedLocations,
                                                            "Location",
                                                        )
                                                    }
                                                />
                                                <span className="font-mono text-xs text-base-content/40 group-hover:text-base-content/60 transition-colors">
                                                    {l}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Salary Range */}
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mb-2.5">
                                        Salary Range ($K)
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={salaryMin}
                                            onChange={(e) =>
                                                setSalaryMin(e.target.value)
                                            }
                                            className="input input-xs w-20 bg-base-300 border border-base-content/10 font-mono text-xs text-center"
                                        />
                                        <span className="text-base-content/20 font-mono text-xs">
                                            to
                                        </span>
                                        <input
                                            type="number"
                                            value={salaryMax}
                                            onChange={(e) =>
                                                setSalaryMax(e.target.value)
                                            }
                                            className="input input-xs w-20 bg-base-300 border border-base-content/10 font-mono text-xs text-center"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="300"
                                            value={salaryMin}
                                            onChange={(e) =>
                                                setSalaryMin(e.target.value)
                                            }
                                            className="range range-xs range-primary w-full"
                                        />
                                    </div>
                                </div>

                                {/* Experience */}
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mb-2.5">
                                        Experience Level
                                    </p>
                                    <div className="space-y-1.5">
                                        {experienceOptions.map((e) => (
                                            <label
                                                key={e}
                                                className="flex items-center gap-2.5 cursor-pointer group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-xs checkbox-primary"
                                                    checked={selectedExperience.includes(
                                                        e,
                                                    )}
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            e,
                                                            selectedExperience,
                                                            setSelectedExperience,
                                                            "Experience",
                                                        )
                                                    }
                                                />
                                                <span className="font-mono text-xs text-base-content/40 group-hover:text-base-content/60 transition-colors">
                                                    {e}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Department */}
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mb-2.5">
                                        Department
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {departmentOptions.map((d) => (
                                            <button
                                                key={d}
                                                onClick={() =>
                                                    toggleCheckbox(
                                                        d,
                                                        selectedDepartments,
                                                        setSelectedDepartments,
                                                        "Department",
                                                    )
                                                }
                                                className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                                                    selectedDepartments.includes(
                                                        d,
                                                    )
                                                        ? "bg-primary/10 border-coral/20 text-primary"
                                                        : "bg-base-300 border-base-content/10 text-base-content/30 hover:border-base-content/20"
                                                }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Split Fee */}
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mb-2.5">
                                        Split Fee
                                    </p>
                                    <select
                                        value={selectedSplit}
                                        onChange={(e) =>
                                            setSelectedSplit(e.target.value)
                                        }
                                        className="select select-xs w-full bg-base-300 border border-base-content/10 font-mono text-xs"
                                    >
                                        <option value="">Any Split</option>
                                        {splitOptions.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-1 min-w-0">
                        {/* Results header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {!filtersOpen && (
                                    <button
                                        onClick={() => setFiltersOpen(true)}
                                        className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-[10px]"
                                    >
                                        <i className="fa-duotone fa-regular fa-filter mr-1" />{" "}
                                        Filters
                                    </button>
                                )}
                                <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/25">
                                    {mockResults.length} results for &quot;
                                    {searchQuery}&quot;
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/20">
                                    Sort:
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="select select-xs bg-base-200 border border-base-content/10 font-mono text-[10px]"
                                >
                                    {sortOptions.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Results list */}
                        <div className="space-y-3">
                            {mockResults.map((result) => (
                                <div
                                    key={result.id}
                                    className="result-item group p-5 bg-base-200 border border-base-content/5 hover:border-coral/20 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                                                    {result.title}
                                                </h3>
                                                <span className="px-1.5 py-0.5 bg-base-300 border border-base-content/10 font-mono text-[9px] uppercase text-base-content/30">
                                                    {result.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-base-content/30">
                                                <span className="flex items-center gap-1">
                                                    <i className="fa-duotone fa-regular fa-building text-[10px]" />
                                                    {result.company}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <i className="fa-duotone fa-regular fa-location-dot text-[10px]" />
                                                    {result.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <i className="fa-duotone fa-regular fa-clock text-[10px]" />
                                                    {result.posted}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <div
                                                className={`px-2 py-0.5 border font-mono text-[10px] uppercase tracking-wider mb-1 ${
                                                    result.match >= 90
                                                        ? "bg-success/10 border-success/20 text-success"
                                                        : result.match >= 80
                                                          ? "bg-primary/10 border-coral/20 text-primary"
                                                          : "bg-base-300 border-base-content/10 text-base-content/30"
                                                }`}
                                            >
                                                {result.match}% match
                                            </div>
                                            <p className="font-mono text-sm font-bold text-primary">
                                                {result.salary}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.skills.map((s) => (
                                                <span
                                                    key={s}
                                                    className="px-2 py-0.5 bg-primary/5 border border-coral/10 text-primary font-mono text-[9px]"
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-base-content/25">
                                            <span className="font-mono">
                                                Split: {result.split}
                                            </span>
                                            <span className="font-mono">
                                                {result.applicants} applicants
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-base-content/10">
                            <span className="font-mono text-[10px] text-base-content/25 uppercase tracking-wider">
                                Showing 1-8 of 247 results
                            </span>
                            <div className="flex gap-1">
                                <button className="w-8 h-8 flex items-center justify-center bg-primary/10 border border-coral/20 text-primary font-mono text-xs">
                                    1
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center bg-base-200 border border-base-content/10 text-base-content/30 font-mono text-xs hover:border-base-content/20">
                                    2
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center bg-base-200 border border-base-content/10 text-base-content/30 font-mono text-xs hover:border-base-content/20">
                                    3
                                </button>
                                <span className="w-8 h-8 flex items-center justify-center text-base-content/20 font-mono text-xs">
                                    ...
                                </span>
                                <button className="w-8 h-8 flex items-center justify-center bg-base-200 border border-base-content/10 text-base-content/30 font-mono text-xs hover:border-base-content/20">
                                    31
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center bg-base-200 border border-base-content/10 text-base-content/30 font-mono text-xs hover:border-base-content/20">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-[10px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <section className="py-10 px-6 border-t border-base-content/10 bg-base-200">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
                    <div className="flex items-center gap-2">
                        <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">
                            Search System Operational
                        </span>
                    </div>
                    <span className="text-base-content/10">|</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                        Splits Network // Component Showcase
                    </span>
                </div>
            </section>
        </main>
    );
}
