"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

// ─── Memphis Colors ─────────────────────────────────────────────────────────
const C = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    dark: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface Filters {
    query: string;
    type: string[];
    remote: string[];
    experience: string[];
    salaryMin: number;
    salaryMax: number;
    category: string;
    datePosted: string;
    sortBy: string;
}

interface Job {
    title: string;
    company: string;
    location: string;
    salary: string;
    salaryNum: number;
    type: string;
    remote: string;
    experience: string;
    category: string;
    tags: string[];
    applicants: number;
    daysAgo: number;
    color: string;
}

const INITIAL_FILTERS: Filters = {
    query: "",
    type: [],
    remote: [],
    experience: [],
    salaryMin: 0,
    salaryMax: 300,
    category: "",
    datePosted: "",
    sortBy: "relevance",
};

const ALL_JOBS: Job[] = [
    { title: "Senior Frontend Engineer", company: "TechCorp", location: "San Francisco, CA", salary: "$160K-$200K", salaryNum: 180, type: "Full-Time", remote: "Remote", experience: "Senior", category: "Engineering", tags: ["React", "TypeScript", "Next.js"], applicants: 34, daysAgo: 2, color: C.coral },
    { title: "Product Designer", company: "DesignStudio", location: "Austin, TX", salary: "$120K-$160K", salaryNum: 140, type: "Full-Time", remote: "On-site", experience: "Mid", category: "Design", tags: ["Figma", "UX Research", "Prototyping"], applicants: 22, daysAgo: 3, color: C.teal },
    { title: "Backend Engineer", company: "DataDriven", location: "Seattle, WA", salary: "$150K-$190K", salaryNum: 170, type: "Full-Time", remote: "Remote", experience: "Senior", category: "Engineering", tags: ["Node.js", "PostgreSQL", "Redis"], applicants: 41, daysAgo: 1, color: C.purple },
    { title: "Product Manager", company: "StartupXYZ", location: "Denver, CO", salary: "$130K-$170K", salaryNum: 150, type: "Full-Time", remote: "Hybrid", experience: "Mid", category: "Product", tags: ["B2B", "SaaS", "Agile"], applicants: 56, daysAgo: 5, color: C.yellow },
    { title: "Junior Developer", company: "LearnTech", location: "Remote", salary: "$70K-$90K", salaryNum: 80, type: "Full-Time", remote: "Remote", experience: "Entry", category: "Engineering", tags: ["JavaScript", "HTML/CSS"], applicants: 112, daysAgo: 1, color: C.coral },
    { title: "DevOps Engineer", company: "CloudScale", location: "Chicago, IL", salary: "$140K-$180K", salaryNum: 160, type: "Contract", remote: "Remote", experience: "Senior", category: "Engineering", tags: ["Kubernetes", "AWS", "Terraform"], applicants: 27, daysAgo: 4, color: C.teal },
    { title: "Content Strategist", company: "BrandCo", location: "Remote", salary: "$90K-$120K", salaryNum: 105, type: "Full-Time", remote: "Remote", experience: "Mid", category: "Marketing", tags: ["SEO", "Content Writing", "Analytics"], applicants: 63, daysAgo: 1, color: C.purple },
    { title: "Sales Director", company: "GrowthEngine", location: "Boston, MA", salary: "$140K-$200K", salaryNum: 170, type: "Full-Time", remote: "On-site", experience: "Lead", category: "Sales", tags: ["Enterprise", "SaaS", "Team Lead"], applicants: 15, daysAgo: 3, color: C.yellow },
    { title: "UX Researcher", company: "UserFirst", location: "Portland, OR", salary: "$110K-$140K", salaryNum: 125, type: "Part-Time", remote: "Remote", experience: "Mid", category: "Design", tags: ["User Interviews", "Analytics", "A/B Testing"], applicants: 18, daysAgo: 2, color: C.coral },
    { title: "VP of Engineering", company: "RocketLab", location: "New York, NY", salary: "$250K-$320K", salaryNum: 285, type: "Full-Time", remote: "Hybrid", experience: "Executive", category: "Engineering", tags: ["Leadership", "Strategy", "Scaling"], applicants: 8, daysAgo: 6, color: C.teal },
    { title: "Mobile Engineer", company: "AppWorks", location: "Miami, FL", salary: "$130K-$170K", salaryNum: 150, type: "Full-Time", remote: "Hybrid", experience: "Senior", category: "Engineering", tags: ["React Native", "iOS", "Android"], applicants: 29, daysAgo: 2, color: C.purple },
    { title: "Data Scientist", company: "InsightAI", location: "Remote", salary: "$160K-$210K", salaryNum: 185, type: "Full-Time", remote: "Remote", experience: "Senior", category: "Engineering", tags: ["Python", "ML", "TensorFlow"], applicants: 38, daysAgo: 1, color: C.yellow },
];

const FILTER_OPTIONS = {
    type: ["Full-Time", "Part-Time", "Contract"],
    remote: ["Remote", "Hybrid", "On-site"],
    experience: ["Entry", "Mid", "Senior", "Lead", "Executive"],
    category: ["Engineering", "Design", "Product", "Marketing", "Sales"],
    datePosted: [
        { value: "1", label: "Last 24 hours" },
        { value: "3", label: "Last 3 days" },
        { value: "7", label: "Last 7 days" },
        { value: "30", label: "Last 30 days" },
    ],
    sortBy: [
        { value: "relevance", label: "Most Relevant" },
        { value: "newest", label: "Newest First" },
        { value: "salary-high", label: "Salary: High to Low" },
        { value: "salary-low", label: "Salary: Low to High" },
        { value: "applicants", label: "Most Applied" },
    ],
};

// ─── Checkbox Filter Group ──────────────────────────────────────────────────
function FilterCheckboxGroup({
    label, options, selected, onChange, color,
}: {
    label: string; options: string[]; selected: string[];
    onChange: (selected: string[]) => void; color: string;
}) {
    const toggle = (opt: string) => {
        onChange(
            selected.includes(opt)
                ? selected.filter((s) => s !== opt)
                : [...selected, opt],
        );
    };

    return (
        <div className="mb-6">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2"
                style={{ color: C.dark }}>
                <div className="w-1.5 h-4" style={{ backgroundColor: color }} />
                {label}
            </h4>
            <div className="space-y-2">
                {options.map((opt) => {
                    const isSelected = selected.includes(opt);
                    return (
                        <button key={opt} type="button" onClick={() => toggle(opt)}
                            className="flex items-center gap-2.5 w-full text-left group">
                            <div className="w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center transition-all"
                                style={{
                                    borderColor: isSelected ? color : "rgba(26,26,46,0.2)",
                                    backgroundColor: isSelected ? color : "transparent",
                                }}>
                                {isSelected && <i className="fa-solid fa-check text-[9px]"
                                    style={{ color: color === C.yellow ? C.dark : C.white }}></i>}
                            </div>
                            <span className="text-sm font-semibold" style={{ color: C.dark, opacity: isSelected ? 1 : 0.6 }}>
                                {opt}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function SearchSixPage() {
    const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
    const [savedSearch, setSavedSearch] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Filter logic
    const filtered = ALL_JOBS.filter((job) => {
        if (filters.query && !job.title.toLowerCase().includes(filters.query.toLowerCase()) && !job.company.toLowerCase().includes(filters.query.toLowerCase())) return false;
        if (filters.type.length && !filters.type.includes(job.type)) return false;
        if (filters.remote.length && !filters.remote.includes(job.remote)) return false;
        if (filters.experience.length && !filters.experience.includes(job.experience)) return false;
        if (filters.category && job.category !== filters.category) return false;
        if (job.salaryNum < filters.salaryMin || job.salaryNum > filters.salaryMax) return false;
        if (filters.datePosted && job.daysAgo > parseInt(filters.datePosted)) return false;
        return true;
    }).sort((a, b) => {
        switch (filters.sortBy) {
            case "newest": return a.daysAgo - b.daysAgo;
            case "salary-high": return b.salaryNum - a.salaryNum;
            case "salary-low": return a.salaryNum - b.salaryNum;
            case "applicants": return b.applicants - a.applicants;
            default: return 0;
        }
    });

    // Active filters for display
    const activeFilters: { key: string; label: string; value: string }[] = [];
    filters.type.forEach((t) => activeFilters.push({ key: "type", label: "Type", value: t }));
    filters.remote.forEach((r) => activeFilters.push({ key: "remote", label: "Remote", value: r }));
    filters.experience.forEach((e) => activeFilters.push({ key: "experience", label: "Level", value: e }));
    if (filters.category) activeFilters.push({ key: "category", label: "Category", value: filters.category });
    if (filters.datePosted) {
        const label = FILTER_OPTIONS.datePosted.find((d) => d.value === filters.datePosted)?.label || "";
        activeFilters.push({ key: "datePosted", label: "Posted", value: label });
    }
    if (filters.salaryMin > 0) activeFilters.push({ key: "salaryMin", label: "Min Salary", value: `$${filters.salaryMin}K` });
    if (filters.salaryMax < 300) activeFilters.push({ key: "salaryMax", label: "Max Salary", value: `$${filters.salaryMax}K` });

    const removeFilter = (key: string, value: string) => {
        setFilters((prev) => {
            const next = { ...prev };
            if (key === "type") next.type = prev.type.filter((t) => t !== value);
            else if (key === "remote") next.remote = prev.remote.filter((r) => r !== value);
            else if (key === "experience") next.experience = prev.experience.filter((e) => e !== value);
            else if (key === "category") next.category = "";
            else if (key === "datePosted") next.datePosted = "";
            else if (key === "salaryMin") next.salaryMin = 0;
            else if (key === "salaryMax") next.salaryMax = 300;
            return next;
        });
    };

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(
            pageRef.current.querySelector(".page-heading"),
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        );
    }, []);

    // Animate results on filter change
    useEffect(() => {
        if (!resultsRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const cards = resultsRef.current.querySelectorAll(".result-card");
        gsap.fromTo(
            cards,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", stagger: 0.03 },
        );
    }, [filtered.length, filters.sortBy, filters.query]);

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.cream }}>
            {/* Color Bar */}
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            {/* Search Header */}
            <div style={{ backgroundColor: C.dark }}>
                <div className="container mx-auto px-4 py-12">
                    <div className="page-heading text-center mb-8">
                        <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] mb-6"
                            style={{ backgroundColor: C.yellow, color: C.dark }}>
                            <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                            Advanced Search
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95]"
                            style={{ color: C.white }}>
                            Find Your{" "}
                            <span className="relative inline-block">
                                <span style={{ color: C.yellow }}>Perfect</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: C.yellow }} />
                            </span>
                            {" "}Role
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto">
                        <div className="flex border-4" style={{ borderColor: C.white }}>
                            <div className="flex items-center px-5" style={{ backgroundColor: C.yellow }}>
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-lg" style={{ color: C.dark }}></i>
                            </div>
                            <input
                                type="text"
                                value={filters.query}
                                onChange={(e) => updateFilter("query", e.target.value)}
                                placeholder="Job title, company, or keyword..."
                                className="flex-1 px-5 py-4 text-sm font-semibold outline-none"
                                style={{ backgroundColor: C.white, color: C.dark }}
                            />
                            <button className="px-6 text-sm font-black uppercase tracking-wider"
                                style={{ backgroundColor: C.coral, color: C.white }}>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        {/* Mobile filter toggle */}
                        <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                            className="lg:hidden w-full mb-4 py-3 text-sm font-black uppercase tracking-wider border-3 flex items-center justify-center gap-2"
                            style={{ borderColor: C.dark, backgroundColor: C.white, color: C.dark }}>
                            <i className="fa-duotone fa-regular fa-sliders"></i>
                            {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
                        </button>

                        <div className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block`}>
                            <div className="border-4 p-6" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: C.dark }}>
                                        <i className="fa-duotone fa-regular fa-sliders" style={{ color: C.coral }}></i>
                                        Filters
                                    </h3>
                                    <button onClick={() => setFilters(INITIAL_FILTERS)}
                                        className="text-xs font-bold uppercase tracking-wider" style={{ color: C.coral }}>
                                        Clear All
                                    </button>
                                </div>

                                <FilterCheckboxGroup label="Employment Type" options={FILTER_OPTIONS.type}
                                    selected={filters.type} onChange={(v) => updateFilter("type", v)} color={C.coral} />

                                <FilterCheckboxGroup label="Work Location" options={FILTER_OPTIONS.remote}
                                    selected={filters.remote} onChange={(v) => updateFilter("remote", v)} color={C.teal} />

                                <FilterCheckboxGroup label="Experience Level" options={FILTER_OPTIONS.experience}
                                    selected={filters.experience} onChange={(v) => updateFilter("experience", v)} color={C.purple} />

                                {/* Category Select */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: C.dark }}>
                                        <div className="w-1.5 h-4" style={{ backgroundColor: C.yellow }} />
                                        Category
                                    </h4>
                                    <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}
                                        className="w-full px-3 py-2.5 border-3 text-sm font-semibold outline-none cursor-pointer"
                                        style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }}>
                                        <option value="">All Categories</option>
                                        {FILTER_OPTIONS.category.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Salary Range */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: C.dark }}>
                                        <div className="w-1.5 h-4" style={{ backgroundColor: C.coral }} />
                                        Salary Range
                                    </h4>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold" style={{ color: C.dark }}>${filters.salaryMin}K</span>
                                        <div className="flex-1 h-0.5" style={{ backgroundColor: C.coral }} />
                                        <span className="text-xs font-bold" style={{ color: C.dark }}>${filters.salaryMax}K</span>
                                    </div>
                                    <input type="range" min={0} max={300} step={10} value={filters.salaryMin}
                                        onChange={(e) => updateFilter("salaryMin", parseInt(e.target.value))}
                                        className="w-full mb-1" style={{ accentColor: C.coral }} />
                                    <input type="range" min={0} max={300} step={10} value={filters.salaryMax}
                                        onChange={(e) => updateFilter("salaryMax", parseInt(e.target.value))}
                                        className="w-full" style={{ accentColor: C.coral }} />
                                </div>

                                {/* Date Posted */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: C.dark }}>
                                        <div className="w-1.5 h-4" style={{ backgroundColor: C.teal }} />
                                        Date Posted
                                    </h4>
                                    <div className="space-y-2">
                                        {FILTER_OPTIONS.datePosted.map((opt) => (
                                            <button key={opt.value} type="button"
                                                onClick={() => updateFilter("datePosted", filters.datePosted === opt.value ? "" : opt.value)}
                                                className="flex items-center gap-2.5 w-full text-left">
                                                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                                                    style={{
                                                        borderColor: filters.datePosted === opt.value ? C.teal : "rgba(26,26,46,0.2)",
                                                    }}>
                                                    {filters.datePosted === opt.value && (
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.teal }} />
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold" style={{ color: C.dark, opacity: filters.datePosted === opt.value ? 1 : 0.6 }}>
                                                    {opt.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Save Search */}
                                <button onClick={() => setSavedSearch(!savedSearch)}
                                    className="w-full py-3 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    style={{
                                        borderColor: savedSearch ? C.teal : C.dark,
                                        backgroundColor: savedSearch ? C.teal : "transparent",
                                        color: savedSearch ? C.dark : C.dark,
                                    }}>
                                    <i className={`${savedSearch ? "fa-solid" : "fa-regular"} fa-bookmark text-xs`}></i>
                                    {savedSearch ? "Search Saved!" : "Save This Search"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-wide" style={{ color: C.dark }}>
                                    <span style={{ color: C.coral }}>{filtered.length}</span> Jobs Found
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.4 }}>
                                    Sort:
                                </span>
                                <select value={filters.sortBy} onChange={(e) => updateFilter("sortBy", e.target.value)}
                                    className="px-3 py-2 border-3 text-xs font-bold uppercase outline-none cursor-pointer"
                                    style={{ borderColor: C.dark, backgroundColor: C.white, color: C.dark }}>
                                    {FILTER_OPTIONS.sortBy.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.4 }}>
                                    Active:
                                </span>
                                {activeFilters.map((f, i) => {
                                    const colors = [C.coral, C.teal, C.purple, C.yellow];
                                    const color = colors[i % colors.length];
                                    return (
                                        <button key={`${f.key}-${f.value}`} onClick={() => removeFilter(f.key, f.value)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 border-2 text-xs font-bold uppercase tracking-wider transition-all group"
                                            style={{ borderColor: color, color: C.dark }}>
                                            {f.value}
                                            <i className="fa-solid fa-xmark text-[10px] transition-colors" style={{ color }}></i>
                                        </button>
                                    );
                                })}
                                <button onClick={() => setFilters(INITIAL_FILTERS)}
                                    className="text-xs font-bold uppercase tracking-wider ml-2" style={{ color: C.coral }}>
                                    Clear All
                                </button>
                            </div>
                        )}

                        {/* Results List */}
                        <div ref={resultsRef} className="space-y-4">
                            {filtered.length === 0 ? (
                                <div className="border-4 p-12 text-center" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4"
                                        style={{ borderColor: C.coral }}>
                                        <i className="fa-duotone fa-regular fa-face-thinking text-2xl" style={{ color: C.coral }}></i>
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-wide mb-2" style={{ color: C.dark }}>
                                        No Results Found
                                    </h3>
                                    <p className="text-sm mb-4" style={{ color: C.dark, opacity: 0.5 }}>
                                        Try adjusting your filters or search terms.
                                    </p>
                                    <button onClick={() => setFilters(INITIAL_FILTERS)}
                                        className="px-5 py-2.5 text-xs font-black uppercase tracking-wider border-3"
                                        style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                filtered.map((job, i) => (
                                    <div key={i} className="result-card border-4 p-0 transition-transform hover:-translate-y-0.5 cursor-pointer"
                                        style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                        <div className="flex">
                                            {/* Color accent */}
                                            <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: job.color }} />

                                            <div className="flex-1 p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        {/* Tags Row */}
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className="px-2 py-0.5 text-[10px] font-black uppercase"
                                                                style={{ backgroundColor: job.color, color: job.color === C.yellow ? C.dark : C.white }}>
                                                                {job.type}
                                                            </span>
                                                            <span className="px-2 py-0.5 text-[10px] font-black uppercase border-2"
                                                                style={{ borderColor: job.color, color: job.color }}>
                                                                {job.remote}
                                                            </span>
                                                            <span className="px-2 py-0.5 text-[10px] font-black uppercase border-2"
                                                                style={{ borderColor: "rgba(26,26,46,0.15)", color: C.dark }}>
                                                                {job.experience}
                                                            </span>
                                                        </div>

                                                        {/* Title & Company */}
                                                        <h3 className="text-base font-black uppercase tracking-wide mb-1" style={{ color: C.dark }}>
                                                            {job.title}
                                                        </h3>
                                                        <p className="text-xs font-semibold mb-3" style={{ color: C.dark, opacity: 0.5 }}>
                                                            <i className="fa-duotone fa-regular fa-building mr-1"></i>{job.company}
                                                            <span className="mx-2">--</span>
                                                            <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>{job.location}
                                                        </p>

                                                        {/* Skills Tags */}
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {job.tags.map((tag) => (
                                                                <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase border-2"
                                                                    style={{ borderColor: "rgba(26,26,46,0.12)", color: C.dark }}>
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Right Side */}
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-lg font-black mb-1" style={{ color: job.color }}>
                                                            {job.salary}
                                                        </p>
                                                        <p className="text-[10px] font-bold uppercase mb-3" style={{ color: C.dark, opacity: 0.3 }}>
                                                            {job.applicants} applied -- {job.daysAgo}d ago
                                                        </p>
                                                        <button className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                                            style={{ borderColor: job.color, backgroundColor: job.color, color: job.color === C.yellow ? C.dark : C.white }}>
                                                            View
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
