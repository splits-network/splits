"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

const D = { fast: 0.3, normal: 0.5, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.04, normal: 0.08 };
const BG = { deep: "#0a1628", mid: "#0d1d33", card: "#0f2847", dark: "#081220", input: "#0b1a2e" };

const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "Data", "Operations"];
const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Freelance"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior", "Lead", "Executive"];
const WORK_MODELS = ["Remote", "Hybrid", "On-site"];
const SORT_OPTIONS = ["Most Relevant", "Newest First", "Salary: High to Low", "Salary: Low to High", "Most Applicants"];

interface SearchResult {
    id: string;
    title: string;
    company: string;
    companyInit: string;
    location: string;
    salary: string;
    splitFee: number;
    type: string;
    experience: string;
    workModel: string;
    department: string;
    skills: string[];
    applicants: number;
    posted: string;
    urgency: "standard" | "urgent" | "critical";
    match: number;
}

const ALL_RESULTS: SearchResult[] = [
    { id: "1", title: "Senior Backend Engineer", company: "TechForge Systems", companyInit: "TF", location: "San Francisco, CA", salary: "$180K-$240K", splitFee: 25, type: "Full-Time", experience: "Senior", workModel: "Hybrid", department: "Engineering", skills: ["Go", "K8s", "PostgreSQL"], applicants: 24, posted: "2 days ago", urgency: "urgent", match: 95 },
    { id: "2", title: "Staff Frontend Engineer", company: "CloudScale", companyInit: "CS", location: "New York, NY", salary: "$220K-$280K", splitFee: 25, type: "Full-Time", experience: "Lead", workModel: "Remote", department: "Engineering", skills: ["React", "TypeScript", "Next.js"], applicants: 31, posted: "3 days ago", urgency: "standard", match: 92 },
    { id: "3", title: "Product Designer", company: "DesignHub", companyInit: "DH", location: "Remote", salary: "$140K-$180K", splitFee: 20, type: "Full-Time", experience: "Mid Level", workModel: "Remote", department: "Design", skills: ["Figma", "Design Systems", "UX Research"], applicants: 45, posted: "5 days ago", urgency: "standard", match: 88 },
    { id: "4", title: "ML Engineer", company: "NexGen AI", companyInit: "NG", location: "Seattle, WA", salary: "$200K-$260K", splitFee: 25, type: "Full-Time", experience: "Senior", workModel: "Hybrid", department: "Engineering", skills: ["Python", "PyTorch", "MLOps"], applicants: 18, posted: "1 week ago", urgency: "standard", match: 85 },
    { id: "5", title: "DevOps Lead", company: "InfraCore", companyInit: "IC", location: "Austin, TX", salary: "$170K-$220K", splitFee: 22, type: "Full-Time", experience: "Lead", workModel: "On-site", department: "Engineering", skills: ["Terraform", "AWS", "Docker"], applicants: 12, posted: "3 days ago", urgency: "urgent", match: 82 },
    { id: "6", title: "Growth Marketing Manager", company: "ScaleUp Co", companyInit: "SU", location: "Remote", salary: "$130K-$170K", splitFee: 18, type: "Full-Time", experience: "Senior", workModel: "Remote", department: "Marketing", skills: ["SEO", "Analytics", "Content"], applicants: 56, posted: "1 day ago", urgency: "standard", match: 78 },
    { id: "7", title: "Product Manager", company: "BuildRight", companyInit: "BR", location: "NYC", salary: "$160K-$200K", splitFee: 20, type: "Full-Time", experience: "Senior", workModel: "Hybrid", department: "Product", skills: ["Strategy", "Analytics", "Agile"], applicants: 38, posted: "4 days ago", urgency: "standard", match: 75 },
    { id: "8", title: "iOS Engineer", company: "MobileFirst", companyInit: "MF", location: "Remote", salary: "$150K-$190K", splitFee: 20, type: "Contract", experience: "Mid Level", workModel: "Remote", department: "Engineering", skills: ["Swift", "SwiftUI", "iOS"], applicants: 22, posted: "6 days ago", urgency: "standard", match: 72 },
    { id: "9", title: "VP of Engineering", company: "QuantumLeap", companyInit: "QL", location: "Remote", salary: "$320K-$400K", splitFee: 30, type: "Full-Time", experience: "Executive", workModel: "Remote", department: "Engineering", skills: ["Leadership", "Strategy", "Architecture"], applicants: 8, posted: "1 day ago", urgency: "critical", match: 70 },
    { id: "10", title: "Data Analyst", company: "DataFlow Inc", companyInit: "DF", location: "Chicago, IL", salary: "$95K-$130K", splitFee: 15, type: "Full-Time", experience: "Entry Level", workModel: "On-site", department: "Data", skills: ["SQL", "Python", "Tableau"], applicants: 67, posted: "2 weeks ago", urgency: "standard", match: 65 },
];

export default function SearchEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState("");
    const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedExp, setSelectedExp] = useState<string[]>([]);
    const [selectedWork, setSelectedWork] = useState<string[]>([]);
    const [salaryRange, setSalaryRange] = useState([0, 400]);
    const [sortBy, setSortBy] = useState("Most Relevant");
    const [showFilters, setShowFilters] = useState(true);
    const [savedSearch, setSavedSearch] = useState(false);

    useGSAP(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => containerRef.current!.querySelectorAll(s);
        const $1 = (s: string) => containerRef.current!.querySelector(s);

        gsap.fromTo($1(".bp-search-header"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth });
        gsap.fromTo($1(".bp-search-bar"), { opacity: 0, y: 15, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: D.build, ease: E.bounce, delay: 0.15 });
        gsap.fromTo($(".bp-filter-section"), { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: D.fast, ease: E.smooth, stagger: S.normal, delay: 0.3 });
        gsap.fromTo($(".bp-search-result"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: D.fast, ease: E.smooth, stagger: S.tight, delay: 0.4 });
        gsap.fromTo($(".bp-corner"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: D.fast, ease: E.elastic, stagger: S.normal, delay: 0.5 });
    }, { scope: containerRef });

    const toggleFilter = (arr: string[], setArr: (v: string[]) => void, item: string) => {
        setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
    };

    const activeFilters = [...selectedDepts, ...selectedTypes, ...selectedExp, ...selectedWork];
    const hasFilters = activeFilters.length > 0 || salaryRange[0] > 0 || salaryRange[1] < 400 || query.trim().length > 0;

    const clearAllFilters = () => {
        setSelectedDepts([]);
        setSelectedTypes([]);
        setSelectedExp([]);
        setSelectedWork([]);
        setSalaryRange([0, 400]);
        setQuery("");
    };

    const removeFilter = (filter: string) => {
        setSelectedDepts((p) => p.filter((x) => x !== filter));
        setSelectedTypes((p) => p.filter((x) => x !== filter));
        setSelectedExp((p) => p.filter((x) => x !== filter));
        setSelectedWork((p) => p.filter((x) => x !== filter));
    };

    const filteredResults = ALL_RESULTS.filter((r) => {
        if (query.trim() && !r.title.toLowerCase().includes(query.toLowerCase()) && !r.company.toLowerCase().includes(query.toLowerCase()) && !r.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))) return false;
        if (selectedDepts.length > 0 && !selectedDepts.includes(r.department)) return false;
        if (selectedTypes.length > 0 && !selectedTypes.includes(r.type)) return false;
        if (selectedExp.length > 0 && !selectedExp.includes(r.experience)) return false;
        if (selectedWork.length > 0 && !selectedWork.includes(r.workModel)) return false;
        return true;
    });

    const FilterSection = ({ title, icon, items, selected, onToggle }: { title: string; icon: string; items: string[]; selected: string[]; onToggle: (item: string) => void }) => (
        <div className="bp-filter-section opacity-0">
            <h4 className="flex items-center gap-2 text-[10px] font-mono text-cyan-500/40 uppercase tracking-wider mb-2.5">
                <i className={`${icon} text-[9px]`} /> {title}
            </h4>
            <div className="space-y-1">
                {items.map((item) => (
                    <button key={item} onClick={() => onToggle(item)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${selected.includes(item) ? "text-cyan-400 border border-cyan-500/30" : "text-slate-500 border border-transparent hover:text-slate-300 hover:bg-cyan-500/3"}`} style={{ backgroundColor: selected.includes(item) ? "rgba(34,211,238,0.06)" : "transparent" }}>
                        <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${selected.includes(item) ? "border-cyan-400 bg-cyan-500/20" : "border-slate-600"}`}>
                                {selected.includes(item) && <i className="fa-solid fa-check text-[7px] text-cyan-400" />}
                            </div>
                            {item}
                        </div>
                        <span className="text-[10px] font-mono text-slate-700">
                            {ALL_RESULTS.filter((r) => {
                                if (title === "Department") return r.department === item;
                                if (title === "Job Type") return r.type === item;
                                if (title === "Experience") return r.experience === item;
                                return r.workModel === item;
                            }).length}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: BG.deep }}>
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="bp-corner fixed top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />

            {/* Header */}
            <div className="bp-search-header border-b opacity-0" style={{ backgroundColor: BG.mid, borderColor: "rgba(34,211,238,0.12)" }}>
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/30" style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-xl">Search Marketplace</h1>
                            <p className="text-[10px] font-mono text-cyan-500/50">ADVANCED SEARCH // BLUEPRINT CONSTRUCTION</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bp-search-bar border-b opacity-0" style={{ backgroundColor: BG.dark, borderColor: "rgba(34,211,238,0.08)" }}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex gap-3 max-w-4xl">
                        <div className="flex-1 relative">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-cyan-500/30" />
                            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs, companies, skills..." className="w-full pl-11 pr-4 py-3 rounded-lg border border-cyan-500/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors" style={{ backgroundColor: BG.input }} />
                            {query && (
                                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors">
                                    <i className="fa-regular fa-xmark text-sm" />
                                </button>
                            )}
                        </div>
                        <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-3 rounded-lg border text-sm flex items-center gap-2 transition-all ${showFilters ? "border-cyan-500/30 text-cyan-400" : "border-cyan-500/15 text-slate-400"}`} style={{ backgroundColor: showFilters ? "rgba(34,211,238,0.08)" : BG.input }}>
                            <i className="fa-duotone fa-regular fa-sliders text-xs" />
                            <span className="hidden sm:inline">Filters</span>
                            {activeFilters.length > 0 && <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "#22d3ee", color: BG.deep }}>{activeFilters.length}</span>}
                        </button>
                        <button onClick={() => setSavedSearch(!savedSearch)} className={`px-4 py-3 rounded-lg border text-sm flex items-center gap-2 transition-all ${savedSearch ? "border-cyan-500/30 text-cyan-400" : "border-cyan-500/15 text-slate-400 hover:text-cyan-400"}`} style={{ backgroundColor: savedSearch ? "rgba(34,211,238,0.08)" : BG.input }}>
                            <i className={`${savedSearch ? "fa-solid" : "fa-regular"} fa-bookmark text-xs`} />
                            <span className="hidden sm:inline">{savedSearch ? "Saved" : "Save"}</span>
                        </button>
                    </div>

                    {/* Active filters */}
                    {hasFilters && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="text-[10px] font-mono text-slate-600">ACTIVE:</span>
                            {activeFilters.map((f) => (
                                <button key={f} onClick={() => removeFilter(f)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-colors" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>
                                    {f} <i className="fa-regular fa-xmark text-[8px]" />
                                </button>
                            ))}
                            {query && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border border-cyan-500/20 text-cyan-400" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>
                                    &quot;{query}&quot;
                                </span>
                            )}
                            <button onClick={clearAllFilters} className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition-colors ml-1">
                                CLEAR ALL
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6 relative z-10">
                <div className="flex gap-6">
                    {/* Sidebar Filters */}
                    {showFilters && (
                        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
                            <FilterSection title="Department" icon="fa-duotone fa-regular fa-sitemap" items={DEPARTMENTS} selected={selectedDepts} onToggle={(i) => toggleFilter(selectedDepts, setSelectedDepts, i)} />
                            <FilterSection title="Job Type" icon="fa-duotone fa-regular fa-briefcase" items={JOB_TYPES} selected={selectedTypes} onToggle={(i) => toggleFilter(selectedTypes, setSelectedTypes, i)} />
                            <FilterSection title="Experience" icon="fa-duotone fa-regular fa-chart-bar" items={EXPERIENCE_LEVELS} selected={selectedExp} onToggle={(i) => toggleFilter(selectedExp, setSelectedExp, i)} />
                            <FilterSection title="Work Model" icon="fa-duotone fa-regular fa-house-laptop" items={WORK_MODELS} selected={selectedWork} onToggle={(i) => toggleFilter(selectedWork, setSelectedWork, i)} />

                            {/* Salary Range */}
                            <div className="bp-filter-section opacity-0">
                                <h4 className="flex items-center gap-2 text-[10px] font-mono text-cyan-500/40 uppercase tracking-wider mb-2.5">
                                    <i className="fa-duotone fa-regular fa-money-bill-wave text-[9px]" /> Salary Range
                                </h4>
                                <div className="px-1">
                                    <div className="flex justify-between text-[10px] font-mono text-slate-600 mb-2">
                                        <span>${salaryRange[0]}K</span>
                                        <span>${salaryRange[1]}K</span>
                                    </div>
                                    <input type="range" min={0} max={400} step={10} value={salaryRange[0]} onChange={(e) => setSalaryRange([Number(e.target.value), salaryRange[1]])} className="w-full accent-cyan-400 mb-1" />
                                    <input type="range" min={0} max={400} step={10} value={salaryRange[1]} onChange={(e) => setSalaryRange([salaryRange[0], Number(e.target.value)])} className="w-full accent-cyan-400" />
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Results */}
                    <div className="flex-1">
                        {/* Results header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-white font-medium">{filteredResults.length} results</span>
                                <span className="text-[10px] font-mono text-slate-600">of {ALL_RESULTS.length} total</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-600">SORT BY</span>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1.5 rounded-lg border border-cyan-500/15 text-xs text-slate-400 focus:outline-none focus:border-cyan-500/30" style={{ backgroundColor: BG.input }}>
                                    {SORT_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Results list */}
                        {filteredResults.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/15" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-2xl text-cyan-500/20" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-400 mb-2">No results found</h3>
                                <p className="text-sm text-slate-600 mb-4">Try adjusting your filters or search terms.</p>
                                <button onClick={clearAllFilters} className="px-4 py-2 rounded-lg border border-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredResults.map((result) => (
                                    <div key={result.id} className="bp-search-result group rounded-xl border border-cyan-500/10 p-5 hover:border-cyan-400/25 transition-all cursor-pointer opacity-0" style={{ backgroundColor: BG.card }}>
                                        <div className="flex items-start gap-4">
                                            <div className="w-11 h-11 rounded-lg border border-cyan-500/20 flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: "rgba(34,211,238,0.06)", color: "#22d3ee" }}>{result.companyInit}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-white text-sm truncate">{result.title}</h3>
                                                    {result.urgency === "urgent" && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/25 flex-shrink-0">URGENT</span>}
                                                    {result.urgency === "critical" && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/25 flex-shrink-0">CRITICAL</span>}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
                                                    <span>{result.company}</span>
                                                    <span className="text-cyan-500/15">|</span>
                                                    <span className="flex items-center gap-1"><i className="fa-duotone fa-regular fa-location-dot text-[9px] text-cyan-500/25" />{result.location}</span>
                                                    <span className="text-cyan-500/15">|</span>
                                                    <span>{result.type}</span>
                                                    <span className="text-cyan-500/15">|</span>
                                                    <span>{result.workModel}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {result.skills.map((s) => <span key={s} className="px-2 py-0.5 rounded text-[10px] border border-cyan-500/12 text-cyan-500/50" style={{ backgroundColor: "rgba(34,211,238,0.03)" }}>{s}</span>)}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-mono font-bold text-cyan-400">{result.salary}</span>
                                                    <span className="text-[10px] font-mono text-slate-600"><i className="fa-duotone fa-regular fa-handshake mr-1" />{result.splitFee}% split</span>
                                                    <span className="text-[10px] font-mono text-slate-600"><i className="fa-duotone fa-regular fa-users mr-1" />{result.applicants} applicants</span>
                                                    <span className="text-[10px] font-mono text-slate-700 ml-auto">{result.posted}</span>
                                                </div>
                                            </div>
                                            <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-cyan-500/15" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>
                                                    <span className="text-[10px] font-mono text-cyan-500/50">MATCH</span>
                                                    <span className="text-sm font-bold font-mono text-cyan-400">{result.match}%</span>
                                                </div>
                                                <button className="w-8 h-8 rounded-lg border border-cyan-500/12 flex items-center justify-center text-slate-600 hover:text-cyan-400 hover:border-cyan-500/25 transition-colors">
                                                    <i className="fa-regular fa-bookmark text-xs" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredResults.length > 0 && (
                            <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid rgba(34,211,238,0.06)" }}>
                                <span className="text-[10px] font-mono text-slate-600">
                                    SHOWING 1-{filteredResults.length} OF {filteredResults.length}
                                </span>
                                <div className="flex gap-1">
                                    <button className="w-8 h-8 rounded-lg border border-cyan-500/15 flex items-center justify-center text-slate-600">
                                        <i className="fa-regular fa-chevron-left text-xs" />
                                    </button>
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#22d3ee", color: BG.deep }}>1</button>
                                    <button className="w-8 h-8 rounded-lg border border-cyan-500/15 flex items-center justify-center text-xs text-slate-500 hover:text-cyan-400 transition-colors">2</button>
                                    <button className="w-8 h-8 rounded-lg border border-cyan-500/15 flex items-center justify-center text-xs text-slate-500 hover:text-cyan-400 transition-colors">3</button>
                                    <button className="w-8 h-8 rounded-lg border border-cyan-500/15 flex items-center justify-center text-slate-600">
                                        <i className="fa-regular fa-chevron-right text-xs" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
