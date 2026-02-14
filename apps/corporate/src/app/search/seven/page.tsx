"use client";

import { useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Data ───────────────────────────────────────────────────────────────────

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    salaryNum: number;
    type: string;
    remote: string;
    level: string;
    posted: string;
    postedDays: number;
    tags: string[];
    applicants: number;
    status: string;
}

const allJobs: Job[] = [
    { id: "JOB-2847", title: "Senior Software Engineer", company: "Nexus Technologies", location: "San Francisco, CA", salary: "$165K - $210K", salaryNum: 210, type: "Full-Time", remote: "Hybrid", level: "Senior", posted: "2d ago", postedDays: 2, tags: ["TypeScript", "Node.js", "PostgreSQL"], applicants: 23, status: "ACTIVE" },
    { id: "JOB-2851", title: "Staff Product Designer", company: "Meridian Labs", location: "New York, NY", salary: "$180K - $240K", salaryNum: 240, type: "Full-Time", remote: "Remote", level: "Staff", posted: "5d ago", postedDays: 5, tags: ["Figma", "Design Systems", "Research"], applicants: 14, status: "ACTIVE" },
    { id: "JOB-2853", title: "Backend Engineer", company: "Vertex Labs", location: "Austin, TX", salary: "$140K - $180K", salaryNum: 180, type: "Full-Time", remote: "Hybrid", level: "Mid", posted: "1d ago", postedDays: 1, tags: ["Go", "Kubernetes", "gRPC"], applicants: 8, status: "ACTIVE" },
    { id: "JOB-2855", title: "Product Manager", company: "Apex Dynamics", location: "Seattle, WA", salary: "$155K - $200K", salaryNum: 200, type: "Full-Time", remote: "Remote", level: "Senior", posted: "3d ago", postedDays: 3, tags: ["B2B SaaS", "Analytics", "Strategy"], applicants: 19, status: "ACTIVE" },
    { id: "JOB-2857", title: "Data Scientist", company: "Cipher Analytics", location: "Chicago, IL", salary: "$130K - $170K", salaryNum: 170, type: "Contract", remote: "Remote", level: "Mid", posted: "6h ago", postedDays: 0, tags: ["Python", "ML", "SQL"], applicants: 31, status: "ACTIVE" },
    { id: "JOB-2859", title: "UX Researcher", company: "Form Studio", location: "Portland, OR", salary: "$120K - $150K", salaryNum: 150, type: "Full-Time", remote: "Hybrid", level: "Mid", posted: "4d ago", postedDays: 4, tags: ["User Research", "Interviews", "Analytics"], applicants: 6, status: "ACTIVE" },
    { id: "JOB-2861", title: "Account Executive", company: "Pipeline Corp", location: "Denver, CO", salary: "$95K - $130K", salaryNum: 130, type: "Full-Time", remote: "On-Site", level: "Mid", posted: "1d ago", postedDays: 1, tags: ["Enterprise Sales", "SaaS", "CRM"], applicants: 12, status: "ACTIVE" },
    { id: "JOB-2863", title: "ML Engineer", company: "Neural Path", location: "Remote", salary: "$175K - $225K", salaryNum: 225, type: "Full-Time", remote: "Remote", level: "Senior", posted: "2d ago", postedDays: 2, tags: ["PyTorch", "LLMs", "Python"], applicants: 42, status: "ACTIVE" },
    { id: "JOB-2865", title: "DevOps Engineer", company: "CloudScale Inc", location: "Remote", salary: "$145K - $185K", salaryNum: 185, type: "Full-Time", remote: "Remote", level: "Senior", posted: "7d ago", postedDays: 7, tags: ["AWS", "Terraform", "Docker"], applicants: 17, status: "ACTIVE" },
    { id: "JOB-2867", title: "Frontend Developer", company: "PixelCraft", location: "Los Angeles, CA", salary: "$110K - $145K", salaryNum: 145, type: "Full-Time", remote: "Hybrid", level: "Mid", posted: "3d ago", postedDays: 3, tags: ["React", "TypeScript", "CSS"], applicants: 28, status: "ACTIVE" },
    { id: "JOB-2869", title: "Technical Writer", company: "DocuFlow", location: "Remote", salary: "$85K - $115K", salaryNum: 115, type: "Contract", remote: "Remote", level: "Mid", posted: "5d ago", postedDays: 5, tags: ["Documentation", "API Docs", "Markdown"], applicants: 9, status: "ACTIVE" },
];

const typeOptions = ["All Types", "Full-Time", "Contract", "Part-Time"];
const remoteOptions = ["All Locations", "Remote", "Hybrid", "On-Site"];
const levelOptions = ["All Levels", "Entry", "Mid", "Senior", "Staff", "Lead"];
const sortOptions = [
    { value: "newest", label: "NEWEST FIRST" },
    { value: "salary-desc", label: "SALARY: HIGH-LOW" },
    { value: "salary-asc", label: "SALARY: LOW-HIGH" },
    { value: "applicants", label: "MOST APPLICANTS" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SearchSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [remoteFilter, setRemoteFilter] = useState("All Locations");
    const [levelFilter, setLevelFilter] = useState("All Levels");
    const [salaryMin, setSalaryMin] = useState(0);
    const [salaryMax, setSalaryMax] = useState(300);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("newest");
    const [savedSearch, setSavedSearch] = useState(false);

    // Gather all unique tags
    const allTags = Array.from(new Set(allJobs.flatMap((j) => j.tags))).sort();

    // Filter logic
    const filteredJobs = allJobs
        .filter((job) => {
            if (query && !job.title.toLowerCase().includes(query.toLowerCase()) && !job.company.toLowerCase().includes(query.toLowerCase()) && !job.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
                return false;
            if (typeFilter !== "All Types" && job.type !== typeFilter) return false;
            if (remoteFilter !== "All Locations" && job.remote !== remoteFilter) return false;
            if (levelFilter !== "All Levels" && job.level !== levelFilter) return false;
            if (job.salaryNum < salaryMin || job.salaryNum > salaryMax) return false;
            if (selectedTags.length > 0 && !selectedTags.some((t) => job.tags.includes(t))) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "newest") return a.postedDays - b.postedDays;
            if (sortBy === "salary-desc") return b.salaryNum - a.salaryNum;
            if (sortBy === "salary-asc") return a.salaryNum - b.salaryNum;
            if (sortBy === "applicants") return b.applicants - a.applicants;
            return 0;
        });

    const activeFilterCount = [
        typeFilter !== "All Types",
        remoteFilter !== "All Locations",
        levelFilter !== "All Levels",
        salaryMin > 0 || salaryMax < 300,
        selectedTags.length > 0,
    ].filter(Boolean).length;

    const clearFilters = useCallback(() => {
        setQuery("");
        setTypeFilter("All Types");
        setRemoteFilter("All Locations");
        setLevelFilter("All Levels");
        setSalaryMin(0);
        setSalaryMax(300);
        setSelectedTags([]);
    }, []);

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    }, []);

    const removeFilter = useCallback((type: string) => {
        switch (type) {
            case "type": setTypeFilter("All Types"); break;
            case "remote": setRemoteFilter("All Locations"); break;
            case "level": setLevelFilter("All Levels"); break;
            case "salary": setSalaryMin(0); setSalaryMax(300); break;
        }
    }, []);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-search-header", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
            tl.fromTo(".bp-search-bar", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3");
            tl.fromTo(".bp-filters-panel", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
            tl.fromTo(".bp-results-header", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "-=0.1");
            tl.fromTo(".bp-result-row", { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04 }, "-=0.1");
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image:
                        linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03] pointer-events-none"></div>
                <div className="absolute top-6 left-6 font-mono text-[10px] text-[#3b5ccc]/30 tracking-widest z-20">REF: SN-SRC07-2026</div>
                <div className="absolute top-6 right-6 font-mono text-[10px] text-[#3b5ccc]/30 tracking-widest z-20">SEARCH INTERFACE</div>

                <div className="container mx-auto px-4 relative z-10 py-16">
                    <div className="max-w-5xl mx-auto">

                        {/* ─── Header ────────────────────────────────────── */}
                        <div className="bp-search-header text-center mb-10 opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4">// ADVANCED SEARCH</div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Search & Filter</h1>
                            <p className="text-[#c8ccd4]/40 max-w-md mx-auto text-sm">
                                Query the network. Filter by type, location, experience, salary, and skills.
                            </p>
                        </div>

                        {/* ─── Search Bar ─────────────────────────────────── */}
                        <div className="bp-search-bar mb-6 opacity-0">
                            <div className="flex border border-[#3b5ccc]/20 bg-[#0d1220]">
                                <div className="flex items-center px-4">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-[#3b5ccc]/40 text-sm"></i>
                                </div>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="SEARCH_QUERY... (job title, company, or skill)"
                                    className="flex-1 bg-transparent text-[#c8ccd4] font-mono text-sm py-3.5 focus:outline-none placeholder:text-[#c8ccd4]/15 tracking-wider"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery("")}
                                        className="px-3 text-[#c8ccd4]/20 hover:text-[#c8ccd4]/50 transition-colors"
                                    >
                                        <i className="fa-duotone fa-regular fa-xmark text-xs"></i>
                                    </button>
                                )}
                                <button className="px-5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border-l border-[#3b5ccc]">
                                    SEARCH
                                </button>
                            </div>
                        </div>

                        {/* ─── Filters Panel ─────────────────────────────── */}
                        <div className="bp-filters-panel border border-[#3b5ccc]/10 bg-[#0d1220] p-5 mb-6 opacity-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">// FILTERS</span>
                                    {activeFilterCount > 0 && (
                                        <span className="font-mono text-[9px] text-[#3b5ccc] px-2 py-0.5 border border-[#3b5ccc]/20">
                                            {activeFilterCount} ACTIVE
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setSavedSearch(true);
                                            setTimeout(() => setSavedSearch(false), 2000);
                                        }}
                                        className="font-mono text-[10px] text-[#14b8a6]/50 hover:text-[#14b8a6] tracking-wider transition-colors flex items-center gap-1.5"
                                    >
                                        <i className={`fa-duotone fa-regular ${savedSearch ? "fa-check" : "fa-floppy-disk"} text-[9px]`}></i>
                                        {savedSearch ? "SAVED" : "SAVE SEARCH"}
                                    </button>
                                    {activeFilterCount > 0 && (
                                        <button onClick={clearFilters} className="font-mono text-[10px] text-[#ef4444]/40 hover:text-[#ef4444]/70 tracking-wider transition-colors">
                                            CLEAR ALL
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filter dropdowns row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <fieldset className="space-y-1">
                                    <label className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">TYPE</label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="w-full bg-[#0a0e17] border border-[#3b5ccc]/15 text-[#c8ccd4] px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#3b5ccc]/40 appearance-none cursor-pointer"
                                    >
                                        {typeOptions.map((o) => <option key={o} value={o} className="bg-[#0a0e17]">{o}</option>)}
                                    </select>
                                </fieldset>
                                <fieldset className="space-y-1">
                                    <label className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">LOCATION</label>
                                    <select
                                        value={remoteFilter}
                                        onChange={(e) => setRemoteFilter(e.target.value)}
                                        className="w-full bg-[#0a0e17] border border-[#3b5ccc]/15 text-[#c8ccd4] px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#3b5ccc]/40 appearance-none cursor-pointer"
                                    >
                                        {remoteOptions.map((o) => <option key={o} value={o} className="bg-[#0a0e17]">{o}</option>)}
                                    </select>
                                </fieldset>
                                <fieldset className="space-y-1">
                                    <label className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">LEVEL</label>
                                    <select
                                        value={levelFilter}
                                        onChange={(e) => setLevelFilter(e.target.value)}
                                        className="w-full bg-[#0a0e17] border border-[#3b5ccc]/15 text-[#c8ccd4] px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#3b5ccc]/40 appearance-none cursor-pointer"
                                    >
                                        {levelOptions.map((o) => <option key={o} value={o} className="bg-[#0a0e17]">{o}</option>)}
                                    </select>
                                </fieldset>
                                <fieldset className="space-y-1">
                                    <label className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">SORT</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full bg-[#0a0e17] border border-[#3b5ccc]/15 text-[#c8ccd4] px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#3b5ccc]/40 appearance-none cursor-pointer"
                                    >
                                        {sortOptions.map((o) => <option key={o.value} value={o.value} className="bg-[#0a0e17]">{o.label}</option>)}
                                    </select>
                                </fieldset>
                            </div>

                            {/* Salary range */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">SALARY RANGE (K)</label>
                                    <span className="font-mono text-[10px] text-[#14b8a6]/50">
                                        ${salaryMin}K - ${salaryMax}K
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min={0}
                                        max={300}
                                        step={10}
                                        value={salaryMin}
                                        onChange={(e) => setSalaryMin(Math.min(Number(e.target.value), salaryMax - 10))}
                                        className="flex-1 accent-[#3b5ccc] h-1 bg-[#3b5ccc]/10 cursor-pointer"
                                    />
                                    <input
                                        type="range"
                                        min={0}
                                        max={300}
                                        step={10}
                                        value={salaryMax}
                                        onChange={(e) => setSalaryMax(Math.max(Number(e.target.value), salaryMin + 10))}
                                        className="flex-1 accent-[#3b5ccc] h-1 bg-[#3b5ccc]/10 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest block mb-2">SKILLS</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {allTags.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-2.5 py-1 border font-mono text-[9px] tracking-wider transition-colors ${
                                                selectedTags.includes(tag)
                                                    ? "border-[#3b5ccc]/40 bg-[#3b5ccc]/10 text-[#3b5ccc]"
                                                    : "border-[#c8ccd4]/8 text-[#c8ccd4]/25 hover:border-[#c8ccd4]/15 hover:text-[#c8ccd4]/40"
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ─── Active Filters Display ────────────────────── */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">ACTIVE:</span>
                                {typeFilter !== "All Types" && (
                                    <button onClick={() => removeFilter("type")} className="flex items-center gap-1.5 px-2.5 py-1 border border-[#3b5ccc]/20 font-mono text-[9px] text-[#3b5ccc]/60 hover:border-[#ef4444]/30 hover:text-[#ef4444]/60 transition-colors">
                                        {typeFilter}
                                        <i className="fa-duotone fa-regular fa-xmark text-[8px]"></i>
                                    </button>
                                )}
                                {remoteFilter !== "All Locations" && (
                                    <button onClick={() => removeFilter("remote")} className="flex items-center gap-1.5 px-2.5 py-1 border border-[#3b5ccc]/20 font-mono text-[9px] text-[#3b5ccc]/60 hover:border-[#ef4444]/30 hover:text-[#ef4444]/60 transition-colors">
                                        {remoteFilter}
                                        <i className="fa-duotone fa-regular fa-xmark text-[8px]"></i>
                                    </button>
                                )}
                                {levelFilter !== "All Levels" && (
                                    <button onClick={() => removeFilter("level")} className="flex items-center gap-1.5 px-2.5 py-1 border border-[#3b5ccc]/20 font-mono text-[9px] text-[#3b5ccc]/60 hover:border-[#ef4444]/30 hover:text-[#ef4444]/60 transition-colors">
                                        {levelFilter}
                                        <i className="fa-duotone fa-regular fa-xmark text-[8px]"></i>
                                    </button>
                                )}
                                {(salaryMin > 0 || salaryMax < 300) && (
                                    <button onClick={() => removeFilter("salary")} className="flex items-center gap-1.5 px-2.5 py-1 border border-[#3b5ccc]/20 font-mono text-[9px] text-[#3b5ccc]/60 hover:border-[#ef4444]/30 hover:text-[#ef4444]/60 transition-colors">
                                        ${salaryMin}K-${salaryMax}K
                                        <i className="fa-duotone fa-regular fa-xmark text-[8px]"></i>
                                    </button>
                                )}
                                {selectedTags.map((tag) => (
                                    <button key={tag} onClick={() => toggleTag(tag)} className="flex items-center gap-1.5 px-2.5 py-1 border border-[#14b8a6]/20 font-mono text-[9px] text-[#14b8a6]/60 hover:border-[#ef4444]/30 hover:text-[#ef4444]/60 transition-colors">
                                        {tag}
                                        <i className="fa-duotone fa-regular fa-xmark text-[8px]"></i>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ─── Results Header ────────────────────────────── */}
                        <div className="bp-results-header flex items-center justify-between mb-4 opacity-0">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">// RESULTS</span>
                                <span className="font-mono text-xs text-white">{filteredJobs.length}</span>
                                <span className="font-mono text-[10px] text-[#c8ccd4]/20">
                                    of {allJobs.length} listings
                                </span>
                            </div>
                        </div>

                        {/* ─── Results ────────────────────────────────────── */}
                        <div className="border border-[#3b5ccc]/10">
                            {/* Table header */}
                            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-[#3b5ccc]/10 bg-[#0d1220] font-mono text-[9px] text-[#3b5ccc]/40 tracking-widest">
                                <div className="col-span-1">ID</div>
                                <div className="col-span-3">POSITION</div>
                                <div className="col-span-2">COMPANY</div>
                                <div className="col-span-2">LOCATION</div>
                                <div className="col-span-2">SALARY</div>
                                <div className="col-span-1">APPS</div>
                                <div className="col-span-1">AGE</div>
                            </div>

                            {filteredJobs.length === 0 ? (
                                <div className="py-16 text-center">
                                    <i className="fa-duotone fa-regular fa-radar text-[#3b5ccc]/15 text-4xl mb-4"></i>
                                    <div className="font-mono text-sm text-[#c8ccd4]/30 mb-2">NO RESULTS FOUND</div>
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/15">
                                        Adjust filters or broaden your search query
                                    </div>
                                </div>
                            ) : (
                                filteredJobs.map((job, idx) => (
                                    <div
                                        key={job.id}
                                        className={`bp-result-row grid grid-cols-12 gap-2 px-5 py-3.5 items-center opacity-0 cursor-pointer group hover:bg-[#3b5ccc]/[0.03] transition-colors ${
                                            idx < filteredJobs.length - 1 ? "border-b border-[#3b5ccc]/[0.06]" : ""
                                        }`}
                                    >
                                        <div className="col-span-1 font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest">{job.id}</div>
                                        <div className="col-span-3">
                                            <div className="text-sm text-white font-semibold group-hover:text-[#3b5ccc] transition-colors truncate">{job.title}</div>
                                            <div className="flex gap-1 mt-1">
                                                {job.tags.slice(0, 2).map((t) => (
                                                    <span key={t} className="font-mono text-[8px] text-[#c8ccd4]/20">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-span-2 font-mono text-xs text-[#c8ccd4]/45 truncate">{job.company}</div>
                                        <div className="col-span-2">
                                            <div className="font-mono text-xs text-[#c8ccd4]/35 truncate">{job.location}</div>
                                            <span className={`font-mono text-[8px] tracking-wider ${
                                                job.remote === "Remote" ? "text-[#14b8a6]/50" : "text-[#c8ccd4]/20"
                                            }`}>
                                                [{job.remote.toUpperCase()}]
                                            </span>
                                        </div>
                                        <div className="col-span-2 font-mono text-xs text-[#14b8a6]/70">{job.salary}</div>
                                        <div className="col-span-1 font-mono text-xs text-[#c8ccd4]/30">{job.applicants}</div>
                                        <div className="col-span-1 font-mono text-[10px] text-[#c8ccd4]/20">{job.posted}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Bottom */}
                        <div className="mt-12 text-center">
                            <div className="h-px bg-[#3b5ccc]/10 mb-4 max-w-xs mx-auto"></div>
                            <div className="font-mono text-[10px] text-[#c8ccd4]/15 tracking-widest">
                                SEARCH & FILTER -- INDUSTRIAL BLUEPRINT DESIGN SYSTEM
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
