"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// -- Data ---------------------------------------------------------------------

const allResults = [
    { title: "Senior Frontend Engineer", company: "TechCorp", initials: "TC", salary: "$150-200K", location: "San Francisco, CA", remote: true, type: "Full-Time", cat: "Engineering", exp: "Senior", posted: "3d ago", ref: "JOB-0847" },
    { title: "Product Manager", company: "StartupXYZ", initials: "SX", salary: "$130-170K", location: "Remote", remote: true, type: "Full-Time", cat: "Product", exp: "Mid", posted: "2d ago", ref: "JOB-0852" },
    { title: "UX Designer", company: "DesignCo", initials: "DC", salary: "$110-140K", location: "Austin, TX", remote: false, type: "Full-Time", cat: "Design", exp: "Mid", posted: "5d ago", ref: "JOB-0838" },
    { title: "Backend Engineer", company: "CloudSys", initials: "CS", salary: "$140-180K", location: "Seattle, WA", remote: true, type: "Full-Time", cat: "Engineering", exp: "Senior", posted: "1d ago", ref: "JOB-0856" },
    { title: "Marketing Director", company: "GrowthCo", initials: "GC", salary: "$120-160K", location: "Chicago, IL", remote: false, type: "Full-Time", cat: "Marketing", exp: "Lead", posted: "4d ago", ref: "JOB-0841" },
    { title: "Sales Engineer", company: "SaaS Corp", initials: "SC", salary: "$130-170K", location: "Remote", remote: true, type: "Contract", cat: "Sales", exp: "Mid", posted: "6d ago", ref: "JOB-0835" },
    { title: "Staff Engineer", company: "DataFlow", initials: "DF", salary: "$180-240K", location: "Boston, MA", remote: true, type: "Full-Time", cat: "Engineering", exp: "Lead", posted: "2d ago", ref: "JOB-0862" },
    { title: "Design Lead", company: "Pixel Inc", initials: "PI", salary: "$140-175K", location: "Portland, OR", remote: false, type: "Full-Time", cat: "Design", exp: "Lead", posted: "3d ago", ref: "JOB-0849" },
    { title: "Junior Developer", company: "LearnTech", initials: "LT", salary: "$70-90K", location: "Denver, CO", remote: true, type: "Full-Time", cat: "Engineering", exp: "Entry", posted: "1d ago", ref: "JOB-0870" },
    { title: "Content Strategist", company: "MediaCo", initials: "MC", salary: "$80-110K", location: "Remote", remote: true, type: "Part-Time", cat: "Marketing", exp: "Mid", posted: "7d ago", ref: "JOB-0830" },
];

const categoryOptions = ["Engineering", "Product", "Design", "Marketing", "Sales"];
const experienceOptions = ["Entry", "Mid", "Senior", "Lead"];
const typeOptions = ["Full-Time", "Part-Time", "Contract"];
const sortOptions = ["Newest", "Salary: High to Low", "Salary: Low to High", "Most Applicants"];

// -- Component ----------------------------------------------------------------

export default function SearchNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [remoteOnly, setRemoteOnly] = useState(false);
    const [salaryMin, setSalaryMin] = useState(50);
    const [sortBy, setSortBy] = useState("Newest");

    const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) => {
        setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    };

    const activeFilters = [
        ...selectedCategories.map((c) => ({ label: c, remove: () => toggleFilter(selectedCategories, setSelectedCategories, c) })),
        ...selectedExperience.map((e) => ({ label: e, remove: () => toggleFilter(selectedExperience, setSelectedExperience, e) })),
        ...selectedTypes.map((t) => ({ label: t, remove: () => toggleFilter(selectedTypes, setSelectedTypes, t) })),
        ...(remoteOnly ? [{ label: "Remote Only", remove: () => setRemoteOnly(false) }] : []),
        ...(salaryMin > 50 ? [{ label: `$${salaryMin}K+ min`, remove: () => setSalaryMin(50) }] : []),
    ];

    const clearAll = () => {
        setSelectedCategories([]); setSelectedExperience([]); setSelectedTypes([]);
        setRemoteOnly(false); setSalaryMin(50); setQuery("");
    };

    const results = allResults.filter((r) => {
        if (query && !r.title.toLowerCase().includes(query.toLowerCase()) && !r.company.toLowerCase().includes(query.toLowerCase())) return false;
        if (selectedCategories.length && !selectedCategories.includes(r.cat)) return false;
        if (selectedExperience.length && !selectedExperience.includes(r.exp)) return false;
        if (selectedTypes.length && !selectedTypes.includes(r.type)) return false;
        if (remoteOnly && !r.remote) return false;
        const min = parseInt(r.salary.replace(/[^0-9]/g, ""));
        if (min < salaryMin) return false;
        return true;
    });

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo($1(".search-nine-title"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
            tl.fromTo($1(".search-nine-bar"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
            tl.fromTo($1(".search-nine-sidebar"), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 }, "-=0.3");
            tl.fromTo($1(".search-nine-results"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f7f8fa]">
            {/* Header */}
            <section className="relative py-12 bg-white overflow-hidden border-b-2 border-[#233876]/10">
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="search-nine-title opacity-0 mb-6">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-3">REF: EN-SEARCH-09 // Advanced Search</span>
                            <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] leading-tight">
                                Find <span className="text-[#233876]">Roles</span>
                            </h1>
                        </div>

                        {/* Search bar */}
                        <div className="search-nine-bar opacity-0">
                            <div className="flex gap-px">
                                <div className="flex-1 flex items-center gap-3 px-5 py-3 border-2 border-[#233876]/10 border-r-0 bg-white">
                                    <i className="fa-regular fa-magnifying-glass text-[#233876]/30" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search by job title, company, or keyword..."
                                        className="flex-1 text-sm bg-transparent outline-none text-[#0f1b3d] placeholder-[#0f1b3d]/25"
                                    />
                                    {query && (
                                        <button onClick={() => setQuery("")} className="text-[#233876]/30 hover:text-[#233876] transition-colors">
                                            <i className="fa-regular fa-xmark text-sm" />
                                        </button>
                                    )}
                                </div>
                                <button className="px-8 py-3 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Active filters */}
            {activeFilters.length > 0 && (
                <section className="relative py-3 bg-white border-b border-[#233876]/5">
                    <div className="container mx-auto px-6">
                        <div className="max-w-6xl mx-auto flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[9px] text-[#233876]/30 tracking-wider uppercase mr-1">Active:</span>
                            {activeFilters.map((f, i) => (
                                <button key={i} onClick={f.remove} className="flex items-center gap-1.5 px-3 py-1 border border-[#233876]/15 bg-[#233876]/[0.03] text-xs text-[#233876]/60 hover:border-red-300 hover:text-red-500 transition-colors group">
                                    {f.label}
                                    <i className="fa-regular fa-xmark text-[9px] group-hover:text-red-500" />
                                </button>
                            ))}
                            <button onClick={clearAll} className="font-mono text-[10px] text-red-400 hover:text-red-600 transition-colors ml-2">
                                Clear All
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Main: Sidebar + Results */}
            <section className="relative py-8 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-4 gap-6">
                            {/* Sidebar filters */}
                            <div className="search-nine-sidebar opacity-0">
                                <div className="border-2 border-[#233876]/10 bg-white relative">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                                    <div className="p-4 border-b border-dashed border-[#233876]/10">
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Filters</div>
                                        <div className="text-sm font-bold text-[#0f1b3d]">Refine Results</div>
                                    </div>

                                    {/* Category */}
                                    <div className="p-4 border-b border-[#233876]/5">
                                        <div className="text-xs font-semibold text-[#0f1b3d] mb-3">Category</div>
                                        <div className="space-y-1.5">
                                            {categoryOptions.map((c) => (
                                                <label key={c} onClick={() => toggleFilter(selectedCategories, setSelectedCategories, c)} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${selectedCategories.includes(c) ? "border-[#233876] bg-[#233876]" : "border-[#233876]/15 group-hover:border-[#233876]/30"}`}>
                                                        {selectedCategories.includes(c) && <i className="fa-regular fa-check text-[8px] text-white" />}
                                                    </div>
                                                    <span className="text-xs text-[#0f1b3d]/50 group-hover:text-[#0f1b3d]/70 transition-colors">{c}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    <div className="p-4 border-b border-[#233876]/5">
                                        <div className="text-xs font-semibold text-[#0f1b3d] mb-3">Experience</div>
                                        <div className="space-y-1.5">
                                            {experienceOptions.map((e) => (
                                                <label key={e} onClick={() => toggleFilter(selectedExperience, setSelectedExperience, e)} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${selectedExperience.includes(e) ? "border-[#233876] bg-[#233876]" : "border-[#233876]/15 group-hover:border-[#233876]/30"}`}>
                                                        {selectedExperience.includes(e) && <i className="fa-regular fa-check text-[8px] text-white" />}
                                                    </div>
                                                    <span className="text-xs text-[#0f1b3d]/50 group-hover:text-[#0f1b3d]/70 transition-colors">{e}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Employment Type */}
                                    <div className="p-4 border-b border-[#233876]/5">
                                        <div className="text-xs font-semibold text-[#0f1b3d] mb-3">Employment Type</div>
                                        <div className="space-y-1.5">
                                            {typeOptions.map((t) => (
                                                <label key={t} onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${selectedTypes.includes(t) ? "border-[#233876] bg-[#233876]" : "border-[#233876]/15 group-hover:border-[#233876]/30"}`}>
                                                        {selectedTypes.includes(t) && <i className="fa-regular fa-check text-[8px] text-white" />}
                                                    </div>
                                                    <span className="text-xs text-[#0f1b3d]/50 group-hover:text-[#0f1b3d]/70 transition-colors">{t}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Remote toggle */}
                                    <div className="p-4 border-b border-[#233876]/5">
                                        <label onClick={() => setRemoteOnly(!remoteOnly)} className="flex items-center justify-between cursor-pointer group">
                                            <span className="text-xs font-semibold text-[#0f1b3d]">Remote Only</span>
                                            <div className={`w-10 h-5 border-2 relative transition-colors ${remoteOnly ? "border-[#233876] bg-[#233876]" : "border-[#233876]/15"}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white transition-all ${remoteOnly ? "left-[calc(100%-14px)]" : "left-0.5"}`} />
                                            </div>
                                        </label>
                                    </div>

                                    {/* Salary Range */}
                                    <div className="p-4 border-b border-[#233876]/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-semibold text-[#0f1b3d]">Min Salary</span>
                                            <span className="font-mono text-xs text-[#233876]">${salaryMin}K+</span>
                                        </div>
                                        <input type="range" min={50} max={250} step={10} value={salaryMin} onChange={(e) => setSalaryMin(Number(e.target.value))} className="w-full accent-[#233876]" />
                                        <div className="flex justify-between mt-1">
                                            <span className="font-mono text-[9px] text-[#233876]/20">$50K</span>
                                            <span className="font-mono text-[9px] text-[#233876]/20">$250K</span>
                                        </div>
                                    </div>

                                    {/* Save Search */}
                                    <div className="p-4">
                                        <button className="w-full px-4 py-2 border-2 border-[#233876]/15 text-xs text-[#233876] font-medium hover:border-[#233876] transition-colors flex items-center justify-center gap-2">
                                            <i className="fa-regular fa-bookmark text-[10px]" />
                                            Save This Search
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="lg:col-span-3 search-nine-results opacity-0">
                                {/* Results header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm font-bold text-[#0f1b3d]">{results.length}</span>
                                        <span className="text-sm text-[#0f1b3d]/40">results found</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[9px] text-[#233876]/25 tracking-wider uppercase">Sort:</span>
                                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs border border-[#233876]/10 px-3 py-1.5 bg-white outline-none text-[#0f1b3d]/60 focus:border-[#233876]/25">
                                            {sortOptions.map((s) => (<option key={s}>{s}</option>))}
                                        </select>
                                    </div>
                                </div>

                                {/* Result cards */}
                                {results.length > 0 ? (
                                    <div className="space-y-px bg-[#233876]/10">
                                        {results.map((r, i) => (
                                            <div key={i} className="bg-white p-5 relative group hover:bg-[#f7f8fa] transition-colors cursor-pointer">
                                                <div className="absolute top-3 right-3 font-mono text-[9px] text-[#233876]/12">{r.ref}</div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center bg-[#233876] flex-shrink-0">
                                                        <span className="font-mono text-[10px] font-bold text-white">{r.initials}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h3 className="font-bold text-sm text-[#0f1b3d] group-hover:text-[#233876] transition-colors">{r.title}</h3>
                                                                <div className="text-xs text-[#0f1b3d]/35">{r.company}</div>
                                                            </div>
                                                            <span className="font-mono text-sm font-bold text-[#233876] whitespace-nowrap">{r.salary}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="flex items-center gap-1 text-[11px] text-[#0f1b3d]/35">
                                                                <i className="fa-regular fa-location-dot text-[9px]" />{r.location}
                                                            </span>
                                                            {r.remote && (
                                                                <span className="font-mono text-[9px] text-[#233876]/40 border border-[#233876]/15 px-1.5 py-0.5">REMOTE</span>
                                                            )}
                                                            <span className="font-mono text-[9px] text-[#0f1b3d]/25 border border-[#233876]/10 px-1.5 py-0.5">{r.type}</span>
                                                            <span className="font-mono text-[9px] text-[#0f1b3d]/25 border border-[#233876]/10 px-1.5 py-0.5">{r.exp}</span>
                                                            <span className="font-mono text-[9px] text-[#0f1b3d]/20 ml-auto">{r.posted}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#233876] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-2 border-[#233876]/10 bg-white p-12 text-center">
                                        <div className="w-14 h-14 border-2 border-[#233876]/15 flex items-center justify-center mx-auto mb-4">
                                            <i className="fa-duotone fa-regular fa-magnifying-glass text-xl text-[#233876]/25" />
                                        </div>
                                        <h3 className="font-bold text-[#0f1b3d] mb-2">No Results Found</h3>
                                        <p className="text-sm text-[#0f1b3d]/40 mb-4">Try adjusting your filters or search terms.</p>
                                        <button onClick={clearAll} className="px-5 py-2 border-2 border-[#233876]/15 text-xs text-[#233876] font-medium hover:border-[#233876] transition-colors">
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference bar */}
            <section className="relative py-6 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">EMPLOYMENT NETWORKS // SEARCH v9.0</span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">CLEAN ARCHITECTURE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
