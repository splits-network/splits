"use client";

import { useState, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out" };

type SortDir = "asc" | "desc" | null;
type SortCol = "candidate" | "role" | "company" | "stage" | "match" | "submitted" | "salary" | null;

const mockData = [
    { id: 1, candidate: "James Wilson", role: "Senior Frontend Engineer", company: "Stripe", stage: "Interview", match: 94, submitted: "2026-02-10", salary: 240000, recruiter: "Sarah M." },
    { id: 2, candidate: "Lisa Chen", role: "Staff Engineer", company: "Shopify", stage: "Screening", match: 91, submitted: "2026-02-09", salary: 210000, recruiter: "Sarah M." },
    { id: 3, candidate: "Alex Rivera", role: "Frontend Architect", company: "Meta", stage: "Offer", match: 96, submitted: "2026-02-05", salary: 275000, recruiter: "David C." },
    { id: 4, candidate: "Priya Patel", role: "ML Engineer", company: "OpenAI", stage: "Interview", match: 88, submitted: "2026-02-08", salary: 310000, recruiter: "Maria G." },
    { id: 5, candidate: "Tom Baker", role: "Engineering Manager", company: "Notion", stage: "Submitted", match: 85, submitted: "2026-02-12", salary: 260000, recruiter: "James P." },
    { id: 6, candidate: "Maya Johnson", role: "Product Designer", company: "Figma", stage: "Interview", match: 92, submitted: "2026-02-07", salary: 195000, recruiter: "Sarah M." },
    { id: 7, candidate: "Ryan Park", role: "DevOps Lead", company: "Datadog", stage: "Screening", match: 87, submitted: "2026-02-11", salary: 225000, recruiter: "David C." },
    { id: 8, candidate: "Emma Davis", role: "Data Scientist", company: "Airbnb", stage: "Placed", match: 95, submitted: "2026-01-28", salary: 230000, recruiter: "Maria G." },
    { id: 9, candidate: "Chris Lee", role: "Backend Engineer", company: "Vercel", stage: "Rejected", match: 72, submitted: "2026-02-01", salary: 195000, recruiter: "James P." },
    { id: 10, candidate: "Sofia Ruiz", role: "iOS Engineer", company: "Spotify", stage: "Submitted", match: 83, submitted: "2026-02-13", salary: 185000, recruiter: "Sarah M." },
    { id: 11, candidate: "Daniel Kim", role: "Security Engineer", company: "CrowdStrike", stage: "Interview", match: 90, submitted: "2026-02-06", salary: 215000, recruiter: "David C." },
    { id: 12, candidate: "Olivia Brown", role: "Full Stack Dev", company: "Linear", stage: "Screening", match: 86, submitted: "2026-02-04", salary: 200000, recruiter: "Maria G." },
];

const columns = [
    { id: "candidate" as const, label: "Candidate", width: "flex-[2]" },
    { id: "role" as const, label: "Role", width: "flex-[2]" },
    { id: "company" as const, label: "Company", width: "flex-1" },
    { id: "stage" as const, label: "Stage", width: "flex-1" },
    { id: "match" as const, label: "Match", width: "w-20" },
    { id: "salary" as const, label: "Salary", width: "w-24" },
    { id: "submitted" as const, label: "Submitted", width: "w-24" },
];

const stageColors: Record<string, string> = {
    Submitted: "bg-base-200 text-base-content/40",
    Screening: "bg-primary/10 text-primary",
    Interview: "bg-secondary/10 text-secondary",
    Offer: "bg-success/10 text-success",
    Placed: "bg-neutral text-neutral-content",
    Rejected: "bg-error/10 text-error",
};

export default function TablesThreePage() {
    const [sortCol, setSortCol] = useState<SortCol>("match");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState("");
    const [stageFilter, setStageFilter] = useState("all");
    const [dense, setDense] = useState(false);
    const [page, setPage] = useState(1);
    const perPage = 8;
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSort = (col: SortCol) => {
        if (sortCol === col) {
            setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
            if (sortDir === "desc") setSortCol(null);
        } else {
            setSortCol(col);
            setSortDir("asc");
        }
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    };

    const toggleAll = () => {
        if (selected.size === sortedData.length) setSelected(new Set());
        else setSelected(new Set(sortedData.map((r) => r.id)));
    };

    const filtered = useMemo(() => {
        let data = [...mockData];
        if (search) data = data.filter((r) => r.candidate.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase()) || r.company.toLowerCase().includes(search.toLowerCase()));
        if (stageFilter !== "all") data = data.filter((r) => r.stage === stageFilter);
        return data;
    }, [search, stageFilter]);

    const sortedData = useMemo(() => {
        if (!sortCol || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            const av = a[sortCol]; const bv = b[sortCol];
            const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [filtered, sortCol, sortDir]);

    const totalPages = Math.ceil(sortedData.length / perPage);
    const pageData = sortedData.slice((page - 1) * perPage, page * perPage);

    useGSAP(() => {
        if (!containerRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
        const $1 = (sel: string) => containerRef.current!.querySelector(sel);
        const tl = gsap.timeline({ defaults: { ease: E.precise } });
        tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
        tl.fromTo($1(".page-title"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.3");
        tl.fromTo($(".toolbar-item"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.03 }, "-=0.2");
    }, { scope: containerRef });

    const fmtSalary = (n: number) => "$" + Math.round(n / 1000) + "K";
    const fmtDate = (d: string) => { const dt = new Date(d); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            <header className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-10 pb-6">
                    <div className="flex items-end gap-4 mb-5">
                        <span className="page-number opacity-0 text-5xl lg:text-7xl font-black tracking-tighter text-neutral/6 select-none leading-none">T3</span>
                        <div className="page-title opacity-0 pb-1">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-1">Data Management</p>
                            <h1 className="text-2xl lg:text-4xl font-black tracking-tight">Applications Table</h1>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="toolbar-item opacity-0 flex-1 min-w-[200px] max-w-sm relative">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/25 text-xs" />
                            <input type="text" placeholder="Search candidates, roles, companies..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-base-200 text-sm font-medium tracking-tight outline-none border-2 border-transparent focus:border-neutral placeholder:text-base-content/25 transition-colors" />
                        </div>
                        <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1); }} className="toolbar-item opacity-0 bg-base-200 px-3 py-2.5 text-[10px] uppercase tracking-[0.15em] font-bold outline-none cursor-pointer border-2 border-transparent focus:border-neutral">
                            <option value="all">All Stages</option>
                            {["Submitted", "Screening", "Interview", "Offer", "Placed", "Rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="flex-1" />
                        <button onClick={() => setDense(!dense)} className={`toolbar-item opacity-0 px-3 py-2.5 text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${dense ? "bg-neutral text-neutral-content" : "bg-base-200 text-base-content/40 hover:text-base-content"}`}>
                            <i className="fa-duotone fa-regular fa-table-cells text-xs mr-1.5" />{dense ? "Dense" : "Comfortable"}
                        </button>
                        <button className="toolbar-item opacity-0 px-3 py-2.5 bg-base-200 text-[10px] uppercase tracking-[0.15em] font-bold text-base-content/40 hover:text-base-content transition-colors">
                            <i className="fa-duotone fa-regular fa-download text-xs mr-1.5" />Export
                        </button>
                    </div>
                </div>
            </header>

            {/* Bulk actions bar */}
            {selected.size > 0 && (
                <div className="px-6 lg:px-12 py-3 bg-neutral text-neutral-content flex items-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{selected.size} selected</span>
                    <div className="flex gap-[2px]">
                        {[
                            { icon: "fa-paper-plane", label: "Move Stage" },
                            { icon: "fa-envelope", label: "Email" },
                            { icon: "fa-download", label: "Export" },
                            { icon: "fa-trash", label: "Archive" },
                        ].map((a) => (
                            <button key={a.label} className="px-3 py-1.5 bg-neutral-content/10 text-[9px] uppercase tracking-[0.15em] font-bold text-neutral-content/60 hover:text-neutral-content hover:bg-neutral-content/20 transition-colors">
                                <i className={`fa-duotone fa-regular ${a.icon} text-xs mr-1`} />{a.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => setSelected(new Set())} className="text-[9px] uppercase tracking-[0.15em] font-bold text-neutral-content/40 hover:text-neutral-content transition-colors">Clear</button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="flex items-center gap-0 px-6 lg:px-12 border-b-2 border-neutral/10 bg-base-200/50">
                        <div className="w-10 flex-shrink-0 py-3">
                            <button onClick={toggleAll} className={`w-4 h-4 border flex items-center justify-center ${selected.size === sortedData.length && sortedData.length > 0 ? "border-neutral bg-neutral" : "border-neutral/20"}`}>
                                {selected.size === sortedData.length && sortedData.length > 0 && <i className="fa-duotone fa-regular fa-check text-neutral-content text-[7px]" />}
                            </button>
                        </div>
                        {columns.map((col) => (
                            <button key={col.id} onClick={() => handleSort(col.id)} className={`${col.width} py-3 flex items-center gap-1.5 text-left group`}>
                                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-base-content/30 group-hover:text-base-content transition-colors">{col.label}</span>
                                {sortCol === col.id && sortDir && (
                                    <i className={`fa-duotone fa-regular ${sortDir === "asc" ? "fa-arrow-up" : "fa-arrow-down"} text-[8px] text-base-content/40`} />
                                )}
                            </button>
                        ))}
                        <div className="w-10 flex-shrink-0" />
                    </div>

                    {/* Rows */}
                    {pageData.map((row) => (
                        <div key={row.id} className={`flex items-center gap-0 px-6 lg:px-12 border-b border-base-300 hover:bg-base-200/30 transition-colors group ${selected.has(row.id) ? "bg-base-200/50" : ""} ${dense ? "py-1.5" : "py-3"}`}>
                            <div className="w-10 flex-shrink-0">
                                <button onClick={() => toggleSelect(row.id)} className={`w-4 h-4 border flex items-center justify-center ${selected.has(row.id) ? "border-neutral bg-neutral" : "border-neutral/20"}`}>
                                    {selected.has(row.id) && <i className="fa-duotone fa-regular fa-check text-neutral-content text-[7px]" />}
                                </button>
                            </div>
                            <div className="flex-[2] flex items-center gap-2">
                                <div className="w-7 h-7 bg-base-200 flex items-center justify-center text-[8px] font-black text-base-content/25 flex-shrink-0">
                                    {row.candidate.split(" ").map((n) => n[0]).join("")}
                                </div>
                                <div>
                                    <div className="text-xs font-bold tracking-tight">{row.candidate}</div>
                                    <div className="text-[9px] text-base-content/25">{row.recruiter}</div>
                                </div>
                            </div>
                            <div className="flex-[2] text-xs text-base-content/50 tracking-tight">{row.role}</div>
                            <div className="flex-1 text-xs text-base-content/50 tracking-tight">{row.company}</div>
                            <div className="flex-1">
                                <span className={`px-2 py-0.5 text-[8px] uppercase tracking-[0.15em] font-black ${stageColors[row.stage] || ""}`}>{row.stage}</span>
                            </div>
                            <div className="w-20 text-sm font-black tracking-tighter">{row.match}%</div>
                            <div className="w-24 text-xs text-base-content/40 tracking-tight">{fmtSalary(row.salary)}</div>
                            <div className="w-24 text-[10px] text-base-content/30">{fmtDate(row.submitted)}</div>
                            <div className="w-10 flex-shrink-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-base-content/25 hover:text-base-content transition-colors">
                                    <i className="fa-duotone fa-regular fa-ellipsis text-xs" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {pageData.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="text-4xl font-black tracking-tighter text-neutral/5 mb-2 select-none">00</div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/25 font-bold">No matching records</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="px-6 lg:px-12 py-4 border-t border-neutral/10 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.15em] text-base-content/25 font-bold">
                    {sortedData.length > 0 ? `${(page - 1) * perPage + 1}-${Math.min(page * perPage, sortedData.length)} of ${sortedData.length}` : "0 results"}
                </span>
                <div className="flex items-center gap-[2px]">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 bg-base-200 text-[10px] font-bold text-base-content/30 hover:text-base-content disabled:opacity-30 transition-colors">
                        <i className="fa-duotone fa-regular fa-chevron-left text-[9px]" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 text-[10px] font-bold transition-colors ${p === page ? "bg-neutral text-neutral-content" : "bg-base-200 text-base-content/30 hover:text-base-content"}`}>
                            {p}
                        </button>
                    ))}
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || totalPages === 0} className="px-3 py-1.5 bg-base-200 text-[10px] font-bold text-base-content/30 hover:text-base-content disabled:opacity-30 transition-colors">
                        <i className="fa-duotone fa-regular fa-chevron-right text-[9px]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
