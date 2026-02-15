"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import gsap from "gsap";

const C = { coral: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

interface Application {
    id: number;
    candidate: string;
    role: string;
    company: string;
    status: "Applied" | "Screening" | "Interview" | "Offer" | "Placed" | "Rejected";
    date: string;
    salary: string;
    recruiter: string;
    score: number;
}

const STATUSES = ["Applied", "Screening", "Interview", "Offer", "Placed", "Rejected"] as const;
const statusColor = (s: string) => {
    switch (s) { case "Applied": return C.dark; case "Screening": return C.yellow; case "Interview": return C.teal; case "Offer": return C.purple; case "Placed": return C.teal; case "Rejected": return C.coral; default: return C.dark; }
};

const DATA: Application[] = [
    { id: 1, candidate: "Priya Sharma", role: "Senior Frontend Engineer", company: "TechCorp", status: "Interview", date: "2026-02-12", salary: "$180K", recruiter: "Marcus T.", score: 92 },
    { id: 2, candidate: "James Wilson", role: "Backend Engineer", company: "DataDriven", status: "Applied", date: "2026-02-14", salary: "$170K", recruiter: "Sarah K.", score: 78 },
    { id: 3, candidate: "Emily Chen", role: "Product Manager", company: "StartupXYZ", status: "Offer", date: "2026-02-10", salary: "$160K", recruiter: "Marcus T.", score: 95 },
    { id: 4, candidate: "David Rodriguez", role: "UX Designer", company: "DesignCo", status: "Screening", date: "2026-02-13", salary: "$140K", recruiter: "David C.", score: 85 },
    { id: 5, candidate: "Sarah Johnson", role: "DevOps Engineer", company: "CloudScale", status: "Placed", date: "2026-02-08", salary: "$175K", recruiter: "Marcus T.", score: 88 },
    { id: 6, candidate: "Michael Lee", role: "Data Scientist", company: "InsightAI", status: "Interview", date: "2026-02-11", salary: "$190K", recruiter: "Sarah K.", score: 91 },
    { id: 7, candidate: "Jennifer Park", role: "Sales Director", company: "GrowthEngine", status: "Rejected", date: "2026-02-09", salary: "$200K", recruiter: "David C.", score: 65 },
    { id: 8, candidate: "Alex Turner", role: "Mobile Engineer", company: "AppWorks", status: "Applied", date: "2026-02-14", salary: "$155K", recruiter: "Marcus T.", score: 82 },
    { id: 9, candidate: "Maria Garcia", role: "Content Strategist", company: "BrandCo", status: "Screening", date: "2026-02-13", salary: "$115K", recruiter: "Sarah K.", score: 76 },
    { id: 10, candidate: "Robert Kim", role: "Staff Engineer", company: "RocketLab", status: "Offer", date: "2026-02-07", salary: "$240K", recruiter: "Marcus T.", score: 97 },
    { id: 11, candidate: "Lisa Wang", role: "Platform Engineer", company: "DataDriven", status: "Interview", date: "2026-02-12", salary: "$185K", recruiter: "David C.", score: 89 },
    { id: 12, candidate: "Chris Brown", role: "VP Engineering", company: "RocketLab", status: "Placed", date: "2026-02-06", salary: "$300K", recruiter: "Marcus T.", score: 98 },
];

type SortKey = "candidate" | "role" | "status" | "date" | "score";

export default function TablesSixPage() {
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [sortKey, setSortKey] = useState<SortKey>("date");
    const [sortAsc, setSortAsc] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [dense, setDense] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editStatus, setEditStatus] = useState("");
    const [visibleCols, setVisibleCols] = useState({ candidate: true, role: true, company: true, status: true, date: true, salary: true, recruiter: true, score: true });
    const [showColMenu, setShowColMenu] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    const perPage = 8;

    const filtered = useMemo(() => {
        let d = [...DATA];
        if (search) d = d.filter(r => r.candidate.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase()));
        if (statusFilter) d = d.filter(r => r.status === statusFilter);
        d.sort((a, b) => {
            const mul = sortAsc ? 1 : -1;
            if (sortKey === "score") return (a.score - b.score) * mul;
            if (sortKey === "date") return (a.date.localeCompare(b.date)) * mul;
            return (a[sortKey] as string).localeCompare(b[sortKey] as string) * mul;
        });
        return d;
    }, [search, statusFilter, sortKey, sortAsc]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);
    const allSelected = paged.length > 0 && paged.every(r => selected.has(r.id));

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortAsc(!sortAsc);
        else { setSortKey(key); setSortAsc(true); }
    };

    const toggleAll = () => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(paged.map(r => r.id)));
    };

    const startEdit = (id: number, status: string) => { setEditingId(id); setEditStatus(status); };
    const saveEdit = () => { setEditingId(null); };

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(pageRef.current.querySelector(".table-card"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.2 });
    }, []);

    const SortIcon = ({ k }: { k: SortKey }) => (
        <span className="ml-1 text-[10px]" style={{ color: sortKey === k ? C.coral : "rgba(26,26,46,0.2)" }}>
            <i className={`fa-solid ${sortKey === k ? (sortAsc ? "fa-sort-up" : "fa-sort-down") : "fa-sort"}`}></i>
        </span>
    );

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.cream }}>
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            {/* Header */}
            <div style={{ backgroundColor: C.dark }}>
                <div className="container mx-auto px-4 py-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                        style={{ backgroundColor: C.purple, color: C.white }}>
                        <i className="fa-duotone fa-regular fa-table"></i>Data Table
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight" style={{ color: C.white }}>
                        Application{" "}<span style={{ color: C.purple }}>Tracker</span>
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="table-card border-4" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                    {/* Toolbar */}
                    <div className="p-4 border-b-3 flex flex-wrap items-center gap-3" style={{ borderColor: C.cream }}>
                        {/* Search */}
                        <div className="flex border-3 flex-1 min-w-[200px] max-w-sm" style={{ borderColor: C.dark }}>
                            <div className="flex items-center px-3" style={{ backgroundColor: C.cream }}>
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-xs" style={{ color: C.dark }}></i>
                            </div>
                            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search candidates or roles..."
                                className="flex-1 px-3 py-2 text-xs font-semibold outline-none" style={{ color: C.dark }} />
                        </div>

                        {/* Status Filter */}
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2 border-3 text-xs font-bold uppercase outline-none cursor-pointer"
                            style={{ borderColor: C.dark, backgroundColor: C.cream, color: C.dark }}>
                            <option value="">All Statuses</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* View Toggle */}
                        <div className="flex border-3" style={{ borderColor: C.dark }}>
                            <button onClick={() => setDense(false)} className="px-3 py-2 text-xs font-bold"
                                style={{ backgroundColor: !dense ? C.dark : "transparent", color: !dense ? C.white : C.dark }}>
                                <i className="fa-duotone fa-regular fa-expand text-xs"></i>
                            </button>
                            <button onClick={() => setDense(true)} className="px-3 py-2 text-xs font-bold"
                                style={{ backgroundColor: dense ? C.dark : "transparent", color: dense ? C.white : C.dark }}>
                                <i className="fa-duotone fa-regular fa-compress text-xs"></i>
                            </button>
                        </div>

                        {/* Column Visibility */}
                        <div className="relative">
                            <button onClick={() => setShowColMenu(!showColMenu)}
                                className="px-3 py-2 border-3 text-xs font-bold uppercase" style={{ borderColor: C.dark, color: C.dark }}>
                                <i className="fa-duotone fa-regular fa-columns-3 text-xs mr-1"></i>Columns
                            </button>
                            {showColMenu && (
                                <div className="absolute right-0 top-10 w-40 border-3 z-20 p-2" style={{ backgroundColor: C.white, borderColor: C.dark }}>
                                    {Object.keys(visibleCols).map((col) => (
                                        <button key={col} onClick={() => setVisibleCols(v => ({ ...v, [col]: !v[col as keyof typeof v] }))}
                                            className="flex items-center gap-2 w-full px-2 py-1.5 text-left">
                                            <div className="w-4 h-4 border-2 flex items-center justify-center"
                                                style={{ borderColor: visibleCols[col as keyof typeof visibleCols] ? C.teal : "rgba(26,26,46,0.2)", backgroundColor: visibleCols[col as keyof typeof visibleCols] ? C.teal : "transparent" }}>
                                                {visibleCols[col as keyof typeof visibleCols] && <i className="fa-solid fa-check text-[8px]" style={{ color: C.dark }}></i>}
                                            </div>
                                            <span className="text-xs font-bold uppercase" style={{ color: C.dark }}>{col}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Export */}
                        <button className="px-3 py-2 border-3 text-xs font-bold uppercase" style={{ borderColor: C.teal, color: C.teal }}>
                            <i className="fa-duotone fa-regular fa-download text-xs mr-1"></i>Export
                        </button>
                    </div>

                    {/* Bulk Actions */}
                    {selected.size > 0 && (
                        <div className="px-4 py-3 flex items-center gap-3 border-b-3" style={{ backgroundColor: C.coral, borderColor: C.coral }}>
                            <span className="text-xs font-black uppercase tracking-wider" style={{ color: C.white }}>
                                {selected.size} selected
                            </span>
                            <button className="px-3 py-1.5 text-xs font-bold uppercase border-2" style={{ borderColor: C.white, color: C.white }}>
                                <i className="fa-duotone fa-regular fa-envelope mr-1"></i>Email
                            </button>
                            <button className="px-3 py-1.5 text-xs font-bold uppercase border-2" style={{ borderColor: C.white, color: C.white }}>
                                <i className="fa-duotone fa-regular fa-tag mr-1"></i>Tag
                            </button>
                            <button className="px-3 py-1.5 text-xs font-bold uppercase border-2" style={{ borderColor: C.white, color: C.white }}>
                                <i className="fa-duotone fa-regular fa-trash mr-1"></i>Delete
                            </button>
                            <button onClick={() => setSelected(new Set())} className="ml-auto text-xs font-bold uppercase" style={{ color: C.white }}>
                                Clear
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: C.cream }}>
                                    <th className="px-4 py-3 text-left w-10">
                                        <button onClick={toggleAll} className="w-5 h-5 border-2 flex items-center justify-center"
                                            style={{ borderColor: allSelected ? C.coral : "rgba(26,26,46,0.2)", backgroundColor: allSelected ? C.coral : "transparent" }}>
                                            {allSelected && <i className="fa-solid fa-check text-[8px]" style={{ color: C.white }}></i>}
                                        </button>
                                    </th>
                                    {visibleCols.candidate && <th onClick={() => toggleSort("candidate")} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider cursor-pointer" style={{ color: C.dark }}>Candidate<SortIcon k="candidate" /></th>}
                                    {visibleCols.role && <th onClick={() => toggleSort("role")} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider cursor-pointer" style={{ color: C.dark }}>Role<SortIcon k="role" /></th>}
                                    {visibleCols.company && <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider" style={{ color: C.dark }}>Company</th>}
                                    {visibleCols.status && <th onClick={() => toggleSort("status")} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider cursor-pointer" style={{ color: C.dark }}>Status<SortIcon k="status" /></th>}
                                    {visibleCols.date && <th onClick={() => toggleSort("date")} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider cursor-pointer" style={{ color: C.dark }}>Date<SortIcon k="date" /></th>}
                                    {visibleCols.salary && <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider" style={{ color: C.dark }}>Salary</th>}
                                    {visibleCols.recruiter && <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider" style={{ color: C.dark }}>Recruiter</th>}
                                    {visibleCols.score && <th onClick={() => toggleSort("score")} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider cursor-pointer" style={{ color: C.dark }}>Score<SortIcon k="score" /></th>}
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider w-16" style={{ color: C.dark }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map((row) => {
                                    const isSelected = selected.has(row.id);
                                    return (
                                        <tr key={row.id} className="border-b-2 transition-colors"
                                            style={{ borderColor: C.cream, backgroundColor: isSelected ? "rgba(255,107,107,0.05)" : "transparent" }}>
                                            <td className={`px-4 ${dense ? "py-2" : "py-3"}`}>
                                                <button onClick={() => { const s = new Set(selected); if (s.has(row.id)) s.delete(row.id); else s.add(row.id); setSelected(s); }}
                                                    className="w-5 h-5 border-2 flex items-center justify-center"
                                                    style={{ borderColor: isSelected ? C.coral : "rgba(26,26,46,0.2)", backgroundColor: isSelected ? C.coral : "transparent" }}>
                                                    {isSelected && <i className="fa-solid fa-check text-[8px]" style={{ color: C.white }}></i>}
                                                </button>
                                            </td>
                                            {visibleCols.candidate && <td className={`px-4 ${dense ? "py-2" : "py-3"} text-sm font-bold`} style={{ color: C.dark }}>{row.candidate}</td>}
                                            {visibleCols.role && <td className={`px-4 ${dense ? "py-2" : "py-3"} text-xs font-semibold`} style={{ color: C.dark, opacity: 0.7 }}>{row.role}</td>}
                                            {visibleCols.company && <td className={`px-4 ${dense ? "py-2" : "py-3"} text-xs font-semibold`} style={{ color: C.dark, opacity: 0.7 }}>{row.company}</td>}
                                            {visibleCols.status && (
                                                <td className={`px-4 ${dense ? "py-2" : "py-3"}`}>
                                                    {editingId === row.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                                                                className="px-1 py-0.5 border-2 text-[10px] font-bold uppercase outline-none"
                                                                style={{ borderColor: C.dark, color: C.dark }}>
                                                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                            <button onClick={saveEdit} className="w-5 h-5 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                                                <i className="fa-solid fa-check text-[8px]" style={{ color: C.dark }}></i>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase cursor-pointer"
                                                            onClick={() => startEdit(row.id, row.status)}
                                                            style={{ backgroundColor: statusColor(row.status), color: row.status === "Screening" ? C.dark : C.white }}>
                                                            {row.status}
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                            {visibleCols.date && <td className={`px-4 ${dense ? "py-2" : "py-3"} text-xs`} style={{ color: C.dark, opacity: 0.5 }}>{row.date}</td>}
                                            {visibleCols.salary && <td className={`px-4 ${dense ? "py-2" : "py-3"} text-xs font-bold`} style={{ color: C.teal }}>{row.salary}</td>}
                                            {visibleCols.recruiter && <td className={`px-4 ${dense ? "py-2" : "py-3"} text-xs font-semibold`} style={{ color: C.dark, opacity: 0.7 }}>{row.recruiter}</td>}
                                            {visibleCols.score && (
                                                <td className={`px-4 ${dense ? "py-2" : "py-3"}`}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 h-1.5 border" style={{ borderColor: "rgba(26,26,46,0.1)" }}>
                                                            <div className="h-full" style={{ width: `${row.score}%`, backgroundColor: row.score >= 90 ? C.teal : row.score >= 75 ? C.yellow : C.coral }} />
                                                        </div>
                                                        <span className="text-xs font-bold" style={{ color: row.score >= 90 ? C.teal : row.score >= 75 ? C.yellow : C.coral }}>{row.score}</span>
                                                    </div>
                                                </td>
                                            )}
                                            <td className={`px-4 ${dense ? "py-2" : "py-3"}`}>
                                                <div className="flex items-center gap-1">
                                                    <button className="w-6 h-6 flex items-center justify-center border" style={{ borderColor: "rgba(26,26,46,0.1)", color: C.teal }}>
                                                        <i className="fa-duotone fa-regular fa-eye text-[10px]"></i>
                                                    </button>
                                                    <button onClick={() => startEdit(row.id, row.status)} className="w-6 h-6 flex items-center justify-center border" style={{ borderColor: "rgba(26,26,46,0.1)", color: C.purple }}>
                                                        <i className="fa-duotone fa-regular fa-pen text-[10px]"></i>
                                                    </button>
                                                    <button className="w-6 h-6 flex items-center justify-center border" style={{ borderColor: "rgba(26,26,46,0.1)", color: C.coral }}>
                                                        <i className="fa-duotone fa-regular fa-trash text-[10px]"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-4 border-t-3 flex items-center justify-between" style={{ borderColor: C.cream }}>
                        <span className="text-xs font-bold" style={{ color: C.dark, opacity: 0.5 }}>
                            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center border-2 disabled:opacity-30"
                                style={{ borderColor: C.dark, color: C.dark }}>
                                <i className="fa-solid fa-chevron-left text-xs"></i>
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button key={i} onClick={() => setPage(i + 1)}
                                    className="w-8 h-8 flex items-center justify-center border-2 text-xs font-black"
                                    style={{
                                        borderColor: page === i + 1 ? C.coral : C.dark,
                                        backgroundColor: page === i + 1 ? C.coral : "transparent",
                                        color: page === i + 1 ? C.white : C.dark,
                                    }}>{i + 1}</button>
                            ))}
                            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                                className="w-8 h-8 flex items-center justify-center border-2 disabled:opacity-30"
                                style={{ borderColor: C.dark, color: C.dark }}>
                                <i className="fa-solid fa-chevron-right text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
