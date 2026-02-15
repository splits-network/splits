"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const locationOptions = ["Remote", "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Chicago, IL", "Boston, MA", "Denver, CO"];
const typeOptions = ["Full-time", "Part-time", "Contract", "Freelance"];
const experienceOptions = ["Entry", "Mid", "Senior", "Staff", "Principal", "Director", "VP", "C-Level"];
const departmentOptions = ["Engineering", "Product", "Design", "Marketing", "Sales", "Data Science", "Operations"];
const sortOptions = [{ value: "relevance", label: "Relevance" }, { value: "salary-desc", label: "Highest Salary" }, { value: "salary-asc", label: "Lowest Salary" }, { value: "newest", label: "Newest" }, { value: "applicants", label: "Most Applied" }];

interface SearchResult {
    id: number; title: string; company: string; initials: string; location: string; type: string;
    salary: string; splitFee: string; skills: string[]; applicants: number; posted: string; urgency: string;
}

const results: SearchResult[] = [
    { id: 1, title: "Staff Software Engineer", company: "Meridian Corp", initials: "MC", location: "San Francisco, CA", type: "Full-time", salary: "$220k\u2013$280k", splitFee: "20%", skills: ["TypeScript", "Go", "Kubernetes"], applicants: 34, posted: "2 days ago", urgency: "Urgent" },
    { id: 2, title: "VP of Engineering", company: "Quantum Financial", initials: "QF", location: "New York, NY", type: "Full-time", salary: "$300k\u2013$400k", splitFee: "25%", skills: ["Leadership", "System Design"], applicants: 12, posted: "4 days ago", urgency: "Critical" },
    { id: 3, title: "Senior Frontend Engineer", company: "Cirrus Technologies", initials: "CT", location: "Remote", type: "Full-time", salary: "$180k\u2013$240k", splitFee: "20%", skills: ["React", "TypeScript"], applicants: 45, posted: "1 week ago", urgency: "Standard" },
    { id: 4, title: "Data Engineering Lead", company: "Apex Robotics", initials: "AR", location: "Austin, TX", type: "Hybrid", salary: "$190k\u2013$250k", splitFee: "22%", skills: ["Python", "Spark", "AWS"], applicants: 18, posted: "3 days ago", urgency: "Standard" },
    { id: 5, title: "Principal Engineer", company: "Helix Dynamics", initials: "HD", location: "Seattle, WA", type: "Full-time", salary: "$250k\u2013$320k", splitFee: "20%", skills: ["System Design", "Go", "PostgreSQL"], applicants: 8, posted: "1 day ago", urgency: "Urgent" },
    { id: 6, title: "Engineering Manager", company: "Meridian Corp", initials: "MC", location: "San Francisco, CA", type: "Full-time", salary: "$200k\u2013$260k", splitFee: "20%", skills: ["Leadership", "Agile"], applicants: 22, posted: "5 days ago", urgency: "Standard" },
    { id: 7, title: "DevOps Architect", company: "Quantum Financial", initials: "QF", location: "Remote", type: "Contract", salary: "$150\u2013$200/hr", splitFee: "18%", skills: ["Terraform", "Kubernetes", "AWS"], applicants: 15, posted: "6 days ago", urgency: "Standard" },
    { id: 8, title: "ML Engineer", company: "Apex Robotics", initials: "AR", location: "Austin, TX", type: "Full-time", salary: "$200k\u2013$270k", splitFee: "22%", skills: ["Python", "PyTorch", "MLOps"], applicants: 29, posted: "2 days ago", urgency: "Urgent" },
];

interface ActiveFilter { type: string; value: string; }

export default function SearchTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState("");
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const [sortBy, setSortBy] = useState("relevance");
    const [salaryRange, setSalaryRange] = useState([100, 400]);
    const [showFilters, setShowFilters] = useState(true);
    const [savedSearch, setSavedSearch] = useState(false);

    useGSAP(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.from("[data-sh]", { y: -30, opacity: 0, duration: 0.7, ease: "power3.out" });
        gsap.from("[data-sf]", { x: -30, opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.2 });
        gsap.from("[data-sr]", { y: 20, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.3 });
    }, { scope: containerRef });

    const addFilter = (type: string, value: string) => {
        if (!activeFilters.some((f) => f.type === type && f.value === value)) setActiveFilters([...activeFilters, { type, value }]);
    };
    const removeFilter = (type: string, value: string) => setActiveFilters(activeFilters.filter((f) => !(f.type === type && f.value === value)));
    const clearFilters = () => setActiveFilters([]);

    const filtered = results.filter((r) => {
        if (query && !r.title.toLowerCase().includes(query.toLowerCase()) && !r.company.toLowerCase().includes(query.toLowerCase())) return false;
        const locFilters = activeFilters.filter((f) => f.type === "location").map((f) => f.value);
        if (locFilters.length > 0 && !locFilters.includes(r.location)) return false;
        const typeFilters = activeFilters.filter((f) => f.type === "type").map((f) => f.value);
        if (typeFilters.length > 0 && !typeFilters.includes(r.type)) return false;
        return true;
    });

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            <div data-sh className="border-b border-base-300">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-base-content/30 font-semibold mb-2">Search</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content mb-5">Find Opportunities</h1>
                    <div className="relative max-w-3xl">
                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs, companies, skills..." className="w-full pl-11 pr-4 py-3.5 bg-base-200/50 border border-base-300 rounded-xl text-sm focus:outline-none focus:border-secondary/50 transition-colors placeholder:text-base-content/30" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
                {/* Active Filters + Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${showFilters ? "border-base-content bg-base-content text-base-100" : "border-base-300 text-base-content/50 hover:border-base-content/30"}`}>
                            <i className="fa-duotone fa-regular fa-sliders text-[10px]" /> Filters
                        </button>
                        {activeFilters.map((f) => (
                            <span key={`${f.type}-${f.value}`} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/10 rounded-full text-[11px] font-medium text-secondary">
                                {f.value}
                                <button onClick={() => removeFilter(f.type, f.value)} className="hover:text-error transition-colors"><i className="fa-duotone fa-regular fa-xmark text-[9px]" /></button>
                            </span>
                        ))}
                        {activeFilters.length > 0 && <button onClick={clearFilters} className="text-[11px] text-base-content/30 hover:text-base-content/60 transition-colors">Clear all</button>}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-base-content/30">{filtered.length} results</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-base-200/50 border border-base-300 rounded-lg text-xs focus:outline-none focus:border-secondary/50">
                            {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <button onClick={() => setSavedSearch(!savedSearch)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${savedSearch ? "border-secondary bg-secondary/10 text-secondary" : "border-base-300 text-base-content/40 hover:border-base-content/30"}`}>
                            <i className={`${savedSearch ? "fa-solid" : "fa-regular"} fa-bookmark text-[10px]`} /> {savedSearch ? "Saved" : "Save"}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Panel */}
                    {showFilters && (
                        <aside data-sf className="w-full lg:w-[260px] shrink-0 space-y-6">
                            <FilterSection title="Location" options={locationOptions} type="location" activeFilters={activeFilters} onToggle={(v) => activeFilters.some((f) => f.type === "location" && f.value === v) ? removeFilter("location", v) : addFilter("location", v)} />
                            <FilterSection title="Job Type" options={typeOptions} type="type" activeFilters={activeFilters} onToggle={(v) => activeFilters.some((f) => f.type === "type" && f.value === v) ? removeFilter("type", v) : addFilter("type", v)} />
                            <div className="border border-base-200 rounded-xl p-4">
                                <h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-3">Salary Range</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-base-content/40">${salaryRange[0]}k</span>
                                    <input type="range" min={50} max={500} value={salaryRange[1]} onChange={(e) => setSalaryRange([salaryRange[0], Number(e.target.value)])} className="flex-1 accent-secondary" />
                                    <span className="text-xs text-base-content/40">${salaryRange[1]}k</span>
                                </div>
                            </div>
                            <FilterSection title="Experience" options={experienceOptions} type="experience" activeFilters={activeFilters} onToggle={(v) => activeFilters.some((f) => f.type === "experience" && f.value === v) ? removeFilter("experience", v) : addFilter("experience", v)} />
                            <FilterSection title="Department" options={departmentOptions} type="department" activeFilters={activeFilters} onToggle={(v) => activeFilters.some((f) => f.type === "department" && f.value === v) ? removeFilter("department", v) : addFilter("department", v)} />
                        </aside>
                    )}

                    {/* Results */}
                    <div className="flex-1 min-w-0 space-y-3">
                        {filtered.length === 0 && (
                            <div className="text-center py-16"><i className="fa-duotone fa-regular fa-magnifying-glass text-3xl text-base-content/10 mb-4" /><p className="text-sm text-base-content/40">No results found. Try adjusting your filters.</p></div>
                        )}
                        {filtered.map((r) => (
                            <a key={r.id} href="#" data-sr className="flex flex-col md:flex-row md:items-center gap-4 p-5 border border-base-200 rounded-xl hover:border-base-300 transition-all group">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{r.initials}</div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-base-content group-hover:text-secondary transition-colors truncate">{r.title}</p>
                                            {r.urgency !== "Standard" && <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${r.urgency === "Critical" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"}`}>{r.urgency}</span>}
                                        </div>
                                        <p className="text-xs text-base-content/40 truncate">{r.company} &middot; {r.location} &middot; {r.type}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 md:justify-end">{r.skills.slice(0, 3).map((s) => <span key={s} className="px-2 py-0.5 rounded-full bg-base-200/60 text-[10px] font-medium text-base-content/40">{s}</span>)}</div>
                                <div className="flex items-center gap-4 md:gap-6 shrink-0 text-xs">
                                    <span className="font-semibold text-base-content/60">{r.salary}</span>
                                    <span className="text-secondary font-semibold">{r.splitFee}</span>
                                    <span className="text-base-content/30">{r.posted}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterSection({ title, options, type, activeFilters, onToggle }: { title: string; options: string[]; type: string; activeFilters: ActiveFilter[]; onToggle: (v: string) => void }) {
    return (
        <div className="border border-base-200 rounded-xl p-4">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-3">{title}</h4>
            <div className="space-y-1.5">
                {options.map((opt) => {
                    const checked = activeFilters.some((f) => f.type === type && f.value === opt);
                    return (
                        <button key={opt} onClick={() => onToggle(opt)} className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs transition-all text-left ${checked ? "bg-secondary/10 text-secondary font-semibold" : "text-base-content/50 hover:bg-base-200/50"}`}>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checked ? "border-secondary bg-secondary" : "border-base-300"}`}>
                                {checked && <i className="fa-solid fa-check text-[8px] text-white" />}
                            </div>
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
