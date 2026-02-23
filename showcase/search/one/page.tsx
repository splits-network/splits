"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Data ───────────────────────────────────────────────────────────────── */

const mockResults = [
    {
        id: 1,
        title: "Senior Full-Stack Engineer",
        company: "TechCorp",
        initials: "TC",
        location: "Remote",
        salary: "$180k-$220k",
        type: "Full-Time",
        department: "Engineering",
        posted: "2 days ago",
        tags: ["React", "Node.js", "AWS"],
        match: 96,
        applicants: 34,
    },
    {
        id: 2,
        title: "VP of Engineering",
        company: "DataFlow",
        initials: "DF",
        location: "San Francisco",
        salary: "$250k-$300k",
        type: "Full-Time",
        department: "Engineering",
        posted: "3 days ago",
        tags: ["Leadership", "Scale"],
        match: 91,
        applicants: 12,
    },
    {
        id: 3,
        title: "Product Manager",
        company: "InnovateCo",
        initials: "IC",
        location: "Remote",
        salary: "$160k-$185k",
        type: "Full-Time",
        department: "Product",
        posted: "1 week ago",
        tags: ["B2B SaaS", "PLG"],
        match: 87,
        applicants: 28,
    },
    {
        id: 4,
        title: "Data Scientist",
        company: "AnalyticsPro",
        initials: "AP",
        location: "Austin, TX",
        salary: "$150k-$190k",
        type: "Full-Time",
        department: "Data",
        posted: "3 days ago",
        tags: ["Python", "ML"],
        match: 84,
        applicants: 19,
    },
    {
        id: 5,
        title: "DevOps Engineer",
        company: "CloudScale",
        initials: "CS",
        location: "Remote",
        salary: "$170k-$210k",
        type: "Contract",
        department: "Engineering",
        posted: "1 day ago",
        tags: ["Kubernetes", "Terraform"],
        match: 82,
        applicants: 15,
    },
    {
        id: 6,
        title: "UX Designer",
        company: "DesignLab",
        initials: "DL",
        location: "New York",
        salary: "$140k-$170k",
        type: "Full-Time",
        department: "Design",
        posted: "5 days ago",
        tags: ["Figma", "Research"],
        match: 78,
        applicants: 42,
    },
    {
        id: 7,
        title: "Backend Engineer",
        company: "ScaleAI",
        initials: "SA",
        location: "SF / Remote",
        salary: "$190k-$240k",
        type: "Full-Time",
        department: "Engineering",
        posted: "1 week ago",
        tags: ["Go", "gRPC"],
        match: 75,
        applicants: 21,
    },
    {
        id: 8,
        title: "Marketing Manager",
        company: "GrowthCo",
        initials: "GC",
        location: "Chicago",
        salary: "$120k-$150k",
        type: "Full-Time",
        department: "Marketing",
        posted: "2 weeks ago",
        tags: ["B2B", "Content"],
        match: 71,
        applicants: 36,
    },
];

const departmentFilters = [
    "Engineering",
    "Product",
    "Design",
    "Data",
    "Marketing",
    "Sales",
];
const typeFilters = ["Full-Time", "Part-Time", "Contract", "Freelance"];
const locationFilters = [
    "Remote",
    "San Francisco",
    "New York",
    "Austin, TX",
    "Chicago",
    "Los Angeles",
];
const sortOptions = [
    "Best Match",
    "Newest First",
    "Salary: High to Low",
    "Salary: Low to High",
    "Most Applicants",
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function SearchOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [query, setQuery] = useState("Senior Engineer");
    const [departments, setDepartments] = useState<string[]>(["Engineering"]);
    const [types, setTypes] = useState<string[]>(["Full-Time"]);
    const [locations, setLocations] = useState<string[]>(["Remote"]);
    const [salaryRange, setSalaryRange] = useState([100, 300]);
    const [sortBy, setSortBy] = useState("Best Match");
    const [savedSearch, setSavedSearch] = useState(false);

    const activeFilters = [
        ...departments.map((d) => ({ type: "Department", value: d })),
        ...types.map((t) => ({ type: "Type", value: t })),
        ...locations.map((l) => ({ type: "Location", value: l })),
    ];

    const toggleFilter = (
        arr: string[],
        val: string,
        setter: (v: string[]) => void,
    ) => {
        setter(
            arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
        );
    };

    const removeFilter = (type: string, value: string) => {
        if (type === "Department")
            setDepartments((p) => p.filter((x) => x !== value));
        if (type === "Type") setTypes((p) => p.filter((x) => x !== value));
        if (type === "Location")
            setLocations((p) => p.filter((x) => x !== value));
    };

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                return;
            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(
                $1(".search-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            )
                .fromTo(
                    $(".search-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".search-bar-main"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.3",
                )
                .fromTo(
                    $1(".search-content"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.2",
                );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-14 lg:py-18">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <p className="search-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                        Advanced Search
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="search-title-word inline-block opacity-0">
                            Find your
                        </span>{" "}
                        <span className="search-title-word inline-block opacity-0 text-primary">
                            next placement.
                        </span>
                    </h1>
                    {/* Search bar */}
                    <div className="search-bar-main opacity-0 max-w-2xl">
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-neutral-content/40" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search jobs, skills, companies..."
                                className="input w-full pl-12 pr-24 bg-neutral-content/10 border-neutral-content/10 text-neutral-content placeholder:text-neutral-content/30 focus:border-coral focus:outline-none h-14 text-lg"
                            />
                            <button className="btn btn-primary absolute right-1.5 top-1/2 -translate-y-1/2">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Active Filters Bar */}
            {activeFilters.length > 0 && (
                <section className="bg-base-200 border-b border-base-300 py-3">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                                Active:
                            </span>
                            {activeFilters.map((f) => (
                                <button
                                    key={`${f.type}-${f.value}`}
                                    onClick={() =>
                                        removeFilter(f.type, f.value)
                                    }
                                    className="flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-content text-xs font-semibold"
                                >
                                    <span className="opacity-70">
                                        {f.type}:
                                    </span>{" "}
                                    {f.value}{" "}
                                    <i className="fa-solid fa-xmark text-[9px] ml-1 hover:opacity-70" />
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    setDepartments([]);
                                    setTypes([]);
                                    setLocations([]);
                                }}
                                className="text-xs text-error font-semibold hover:underline ml-2"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Content */}
            <section className="search-content opacity-0 container mx-auto px-6 lg:px-12 py-8 lg:py-12">
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                    Department
                                </h3>
                                <div className="space-y-1.5">
                                    {departmentFilters.map((d) => (
                                        <label
                                            key={d}
                                            className={`flex items-center gap-2 p-2 cursor-pointer transition-all text-sm ${departments.includes(d) ? "bg-primary/5 text-base-content font-semibold" : "text-base-content/60 hover:bg-base-200"}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={departments.includes(
                                                    d,
                                                )}
                                                onChange={() =>
                                                    toggleFilter(
                                                        departments,
                                                        d,
                                                        setDepartments,
                                                    )
                                                }
                                                className="checkbox checkbox-primary checkbox-xs"
                                            />
                                            {d}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                    Employment Type
                                </h3>
                                <div className="space-y-1.5">
                                    {typeFilters.map((t) => (
                                        <label
                                            key={t}
                                            className={`flex items-center gap-2 p-2 cursor-pointer transition-all text-sm ${types.includes(t) ? "bg-primary/5 text-base-content font-semibold" : "text-base-content/60 hover:bg-base-200"}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={types.includes(t)}
                                                onChange={() =>
                                                    toggleFilter(
                                                        types,
                                                        t,
                                                        setTypes,
                                                    )
                                                }
                                                className="checkbox checkbox-primary checkbox-xs"
                                            />
                                            {t}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                    Location
                                </h3>
                                <div className="space-y-1.5">
                                    {locationFilters.map((l) => (
                                        <label
                                            key={l}
                                            className={`flex items-center gap-2 p-2 cursor-pointer transition-all text-sm ${locations.includes(l) ? "bg-primary/5 text-base-content font-semibold" : "text-base-content/60 hover:bg-base-200"}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={locations.includes(l)}
                                                onChange={() =>
                                                    toggleFilter(
                                                        locations,
                                                        l,
                                                        setLocations,
                                                    )
                                                }
                                                className="checkbox checkbox-primary checkbox-xs"
                                            />
                                            {l}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                    Salary Range
                                </h3>
                                <div className="flex items-center gap-2 text-sm mb-2">
                                    <span className="font-bold text-primary">
                                        ${salaryRange[0]}k
                                    </span>
                                    <span className="text-base-content/30">
                                        -
                                    </span>
                                    <span className="font-bold text-primary">
                                        ${salaryRange[1]}k
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="400"
                                    value={salaryRange[1]}
                                    onChange={(e) =>
                                        setSalaryRange([
                                            salaryRange[0],
                                            Number(e.target.value),
                                        ])
                                    }
                                    className="range range-primary range-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-4">
                        {/* Results header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-base-content/50">
                                    <strong className="text-base-content">
                                        {mockResults.length}
                                    </strong>{" "}
                                    results
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSavedSearch(!savedSearch)}
                                    className={`btn btn-sm ${savedSearch ? "btn-secondary" : "btn-ghost"}`}
                                >
                                    <i
                                        className={`fa-${savedSearch ? "solid" : "regular"} fa-bookmark text-xs`}
                                    />{" "}
                                    {savedSearch ? "Saved" : "Save Search"}
                                </button>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="select select-sm bg-base-200 border-base-300 text-sm"
                                >
                                    {sortOptions.map((o) => (
                                        <option key={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Result cards */}
                        <div className="space-y-3">
                            {mockResults.map((r, idx) => (
                                <div
                                    key={r.id}
                                    className={`p-5 border hover:border-coral/50 transition-all cursor-pointer group ${idx === 0 ? "border-l-4 border-l-primary bg-base-200 border-t border-r border-b border-base-300" : "bg-base-200 border-base-300"}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-11 h-11 bg-primary text-primary-content flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {r.initials}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                                                        {r.title}
                                                    </h3>
                                                    {idx === 0 && (
                                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase">
                                                            Best Match
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-base-content/50 mb-2">
                                                    {r.company}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/50 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <i className="fa-duotone fa-regular fa-location-dot" />
                                                        {r.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <i className="fa-duotone fa-regular fa-dollar-sign" />
                                                        {r.salary}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <i className="fa-duotone fa-regular fa-clock" />
                                                        {r.type}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <i className="fa-duotone fa-regular fa-calendar" />
                                                        {r.posted}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <i className="fa-duotone fa-regular fa-users" />
                                                        {r.applicants}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    {r.tags.map((t) => (
                                                        <span
                                                            key={t}
                                                            className="px-2 py-0.5 bg-base-100 text-[10px] font-semibold text-base-content/40"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <div className="text-2xl font-black text-primary">
                                                {r.match}%
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-base-content/40">
                                                Match
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-base-300">
                            <span className="text-sm text-base-content/40">
                                Showing 1-8 of 156 results
                            </span>
                            <div className="flex gap-1">
                                <button
                                    className="btn btn-sm btn-ghost"
                                    disabled
                                >
                                    <i className="fa-solid fa-chevron-left text-xs" />
                                </button>
                                <button className="btn btn-sm btn-primary">
                                    1
                                </button>
                                <button className="btn btn-sm btn-ghost">
                                    2
                                </button>
                                <button className="btn btn-sm btn-ghost">
                                    3
                                </button>
                                <span className="btn btn-sm btn-ghost btn-disabled">
                                    ...
                                </span>
                                <button className="btn btn-sm btn-ghost">
                                    20
                                </button>
                                <button className="btn btn-sm btn-ghost">
                                    <i className="fa-solid fa-chevron-right text-xs" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
