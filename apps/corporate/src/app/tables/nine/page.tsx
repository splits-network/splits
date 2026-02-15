"use client";

import { useState, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// -- Data ---------------------------------------------------------------------

type SortDir = "asc" | "desc" | null;
type SortCol = "candidate" | "role" | "company" | "stage" | "submitted" | "salary" | null;

interface Application {
    id: string;
    candidate: string;
    initials: string;
    email: string;
    role: string;
    company: string;
    stage: string;
    submitted: string;
    sortDate: number;
    salary: string;
    salaryNum: number;
    source: string;
    score: number;
}

const stages = ["All", "Applied", "Screening", "Interview", "Offer", "Placed", "Rejected"];
const stageColors: Record<string, string> = {
    Applied: "text-[#233876]/50 border-[#233876]/15",
    Screening: "text-amber-600 border-amber-200",
    Interview: "text-blue-600 border-blue-200",
    Offer: "text-emerald-600 border-emerald-200",
    Placed: "text-emerald-700 border-emerald-300 bg-emerald-50",
    Rejected: "text-red-400 border-red-200",
};

const rawApplications: Application[] = [
    { id: "APP-0901", candidate: "Alex Martinez", initials: "AM", email: "alex.m@email.com", role: "Senior Frontend Engineer", company: "TechCorp", stage: "Interview", submitted: "Feb 10, 2026", sortDate: 20260210, salary: "$165,000", salaryNum: 165000, source: "LinkedIn", score: 92 },
    { id: "APP-0902", candidate: "Priya Sharma", initials: "PS", email: "priya.s@email.com", role: "Backend Engineer", company: "CloudSys", stage: "Screening", submitted: "Feb 9, 2026", sortDate: 20260209, salary: "$155,000", salaryNum: 155000, source: "Referral", score: 88 },
    { id: "APP-0903", candidate: "Jordan Lee", initials: "JL", email: "jordan.l@email.com", role: "Product Manager", company: "StartupXYZ", stage: "Applied", submitted: "Feb 12, 2026", sortDate: 20260212, salary: "$145,000", salaryNum: 145000, source: "Direct", score: 75 },
    { id: "APP-0904", candidate: "Sarah Kim", initials: "SK", email: "sarah.k@email.com", role: "UX Designer", company: "DesignCo", stage: "Offer", submitted: "Jan 28, 2026", sortDate: 20260128, salary: "$130,000", salaryNum: 130000, source: "LinkedIn", score: 95 },
    { id: "APP-0905", candidate: "Marcus Chen", initials: "MC", email: "marcus.c@email.com", role: "Staff Engineer", company: "DataFlow", stage: "Interview", submitted: "Feb 5, 2026", sortDate: 20260205, salary: "$210,000", salaryNum: 210000, source: "Network", score: 91 },
    { id: "APP-0906", candidate: "Emily Rodriguez", initials: "ER", email: "emily.r@email.com", role: "Marketing Director", company: "GrowthCo", stage: "Placed", submitted: "Jan 15, 2026", sortDate: 20260115, salary: "$140,000", salaryNum: 140000, source: "Referral", score: 89 },
    { id: "APP-0907", candidate: "David Park", initials: "DP", email: "david.p@email.com", role: "Sales Engineer", company: "SaaS Corp", stage: "Screening", submitted: "Feb 8, 2026", sortDate: 20260208, salary: "$150,000", salaryNum: 150000, source: "Job Board", score: 72 },
    { id: "APP-0908", candidate: "Aisha Johnson", initials: "AJ", email: "aisha.j@email.com", role: "DevOps Engineer", company: "CloudSys", stage: "Applied", submitted: "Feb 13, 2026", sortDate: 20260213, salary: "$160,000", salaryNum: 160000, source: "Direct", score: 81 },
    { id: "APP-0909", candidate: "Tom Wilson", initials: "TW", email: "tom.w@email.com", role: "Senior Frontend Engineer", company: "TechCorp", stage: "Rejected", submitted: "Jan 20, 2026", sortDate: 20260120, salary: "$155,000", salaryNum: 155000, source: "LinkedIn", score: 45 },
    { id: "APP-0910", candidate: "Lisa Chang", initials: "LC", email: "lisa.c@email.com", role: "Product Analyst", company: "MetricsCo", stage: "Interview", submitted: "Feb 7, 2026", sortDate: 20260207, salary: "$110,000", salaryNum: 110000, source: "Referral", score: 86 },
    { id: "APP-0911", candidate: "Ryan Foster", initials: "RF", email: "ryan.f@email.com", role: "Engineering Manager", company: "ScaleUp", stage: "Offer", submitted: "Feb 1, 2026", sortDate: 20260201, salary: "$195,000", salaryNum: 195000, source: "Network", score: 94 },
    { id: "APP-0912", candidate: "Nina Patel", initials: "NP", email: "nina.p@email.com", role: "Design Lead", company: "Pixel Inc", stage: "Screening", submitted: "Feb 11, 2026", sortDate: 20260211, salary: "$145,000", salaryNum: 145000, source: "LinkedIn", score: 83 },
];

const columns = [
    { key: "candidate" as SortCol, label: "Candidate", width: "w-[220px]" },
    { key: "role" as SortCol, label: "Role", width: "w-[180px]" },
    { key: "company" as SortCol, label: "Company", width: "w-[120px]" },
    { key: "stage" as SortCol, label: "Stage", width: "w-[100px]" },
    { key: "submitted" as SortCol, label: "Submitted", width: "w-[120px]" },
    { key: "salary" as SortCol, label: "Salary", width: "w-[120px]" },
];

// -- Component ----------------------------------------------------------------

export default function TablesNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [stageFilter, setStageFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortCol, setSortCol] = useState<SortCol>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [dense, setDense] = useState(false);
    const rowsPerPage = 8;

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo($1(".table-nine-title"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
            tl.fromTo($(".table-nine-filter"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04 }, "-=0.4");
            tl.fromTo($1(".table-nine-container"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
        },
        { scope: containerRef },
    );

    const handleSort = (col: SortCol) => {
        if (sortCol === col) {
            setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
            if (sortDir === "desc") setSortCol(null);
        } else {
            setSortCol(col);
            setSortDir("asc");
        }
    };

    const filteredAndSorted = useMemo(() => {
        let data = [...rawApplications];

        if (stageFilter !== "All") {
            data = data.filter((a) => a.stage === stageFilter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter((a) =>
                a.candidate.toLowerCase().includes(q) ||
                a.role.toLowerCase().includes(q) ||
                a.company.toLowerCase().includes(q) ||
                a.id.toLowerCase().includes(q)
            );
        }

        if (sortCol && sortDir) {
            data.sort((a, b) => {
                let cmp = 0;
                switch (sortCol) {
                    case "candidate": cmp = a.candidate.localeCompare(b.candidate); break;
                    case "role": cmp = a.role.localeCompare(b.role); break;
                    case "company": cmp = a.company.localeCompare(b.company); break;
                    case "stage": cmp = a.stage.localeCompare(b.stage); break;
                    case "submitted": cmp = a.sortDate - b.sortDate; break;
                    case "salary": cmp = a.salaryNum - b.salaryNum; break;
                }
                return sortDir === "desc" ? -cmp : cmp;
            });
        }

        return data;
    }, [stageFilter, searchQuery, sortCol, sortDir]);

    const totalPages = Math.ceil(filteredAndSorted.length / rowsPerPage);
    const paginatedData = filteredAndSorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const toggleRow = (id: string) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedData.map((a) => a.id)));
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f7f8fa]">
            {/* Header */}
            <section className="relative bg-white overflow-hidden border-b border-[#233876]/10">
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">v9.0</div>

                <div className="container mx-auto px-6 relative z-10 py-12">
                    <div className="max-w-7xl mx-auto table-nine-title opacity-0">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                            REF: EN-TABLE-09 // Applications
                        </span>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-2">Applications</h1>
                                <p className="text-[#0f1b3d]/40 text-sm">{rawApplications.length} total applications across all stages</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-5 py-2.5 border-2 border-[#233876]/15 text-sm text-[#233876] hover:border-[#233876] transition-colors font-medium">
                                    <i className="fa-regular fa-download mr-2" />Export
                                </button>
                                <button className="px-5 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium">
                                    <i className="fa-regular fa-plus mr-2" />Add Application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="relative py-6">
                <div className="container mx-auto px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {stages.map((stage, i) => (
                                    <button
                                        key={stage}
                                        onClick={() => { setStageFilter(stage); setCurrentPage(1); }}
                                        className={`table-nine-filter opacity-0 px-4 py-2 text-xs font-medium transition-colors ${
                                            stageFilter === stage
                                                ? "border-2 border-[#233876] bg-[#233876] text-white"
                                                : "border-2 border-[#233876]/10 text-[#0f1b3d]/40 hover:border-[#233876]/25"
                                        }`}
                                    >
                                        {stage}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <i className="fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#233876]/25 text-xs" />
                                    <input
                                        type="text"
                                        placeholder="Search applications..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        className="pl-9 pr-4 py-2 border-2 border-[#233876]/10 bg-white text-sm text-[#0f1b3d] focus:border-[#233876]/30 focus:outline-none transition-colors w-64"
                                    />
                                </div>
                                <button
                                    onClick={() => setDense(!dense)}
                                    className={`px-3 py-2 border-2 text-xs transition-colors ${
                                        dense ? "border-[#233876] text-[#233876]" : "border-[#233876]/10 text-[#0f1b3d]/30"
                                    }`}
                                    title={dense ? "Comfortable view" : "Dense view"}
                                >
                                    <i className={`fa-regular ${dense ? "fa-list" : "fa-table-cells"}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Table */}
            <section className="relative pb-10">
                <div className="container mx-auto px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Bulk Actions */}
                        {selectedRows.size > 0 && (
                            <div className="flex items-center gap-4 mb-3 p-3 border-2 border-[#233876]/20 bg-[#233876]/5">
                                <span className="font-mono text-xs text-[#233876]">{selectedRows.size} selected</span>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 border border-[#233876]/20 text-xs text-[#233876] hover:bg-[#233876] hover:text-white transition-colors">
                                        <i className="fa-regular fa-arrows-rotate mr-1" />Update Stage
                                    </button>
                                    <button className="px-3 py-1.5 border border-[#233876]/20 text-xs text-[#233876] hover:bg-[#233876] hover:text-white transition-colors">
                                        <i className="fa-regular fa-envelope mr-1" />Send Email
                                    </button>
                                    <button className="px-3 py-1.5 border border-red-200 text-xs text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                                        <i className="fa-regular fa-trash mr-1" />Delete
                                    </button>
                                </div>
                                <button onClick={() => setSelectedRows(new Set())} className="ml-auto text-xs text-[#0f1b3d]/30 hover:text-[#0f1b3d] transition-colors">
                                    Clear selection
                                </button>
                            </div>
                        )}

                        <div className="table-nine-container opacity-0 border-2 border-[#233876]/10 bg-white relative overflow-hidden">
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-[#233876]/10">
                                            <th className="w-12 px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                                    onChange={toggleAll}
                                                    className="accent-[#233876]"
                                                />
                                            </th>
                                            <th className="w-16 px-2 py-3 text-left">
                                                <span className="font-mono text-[9px] text-[#233876]/30 tracking-wider uppercase">Score</span>
                                            </th>
                                            {columns.map((col) => (
                                                <th
                                                    key={col.key}
                                                    className={`${col.width} px-4 py-3 text-left cursor-pointer select-none group`}
                                                    onClick={() => handleSort(col.key)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[9px] text-[#233876]/30 tracking-wider uppercase">{col.label}</span>
                                                        <span className="text-[8px] text-[#233876]/20 group-hover:text-[#233876]/50 transition-colors">
                                                            {sortCol === col.key && sortDir === "asc" && <i className="fa-regular fa-arrow-up" />}
                                                            {sortCol === col.key && sortDir === "desc" && <i className="fa-regular fa-arrow-down" />}
                                                            {sortCol !== col.key && <i className="fa-regular fa-arrow-up-arrow-down" />}
                                                        </span>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="w-20 px-4 py-3 text-right">
                                                <span className="font-mono text-[9px] text-[#233876]/30 tracking-wider uppercase">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((app) => (
                                            <tr
                                                key={app.id}
                                                className={`border-b border-dashed border-[#233876]/6 last:border-b-0 hover:bg-[#f7f8fa] transition-colors cursor-pointer ${
                                                    selectedRows.has(app.id) ? "bg-[#233876]/[0.03]" : ""
                                                }`}
                                            >
                                                <td className={`px-4 ${dense ? "py-2" : "py-3.5"}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.has(app.id)}
                                                        onChange={() => toggleRow(app.id)}
                                                        className="accent-[#233876]"
                                                    />
                                                </td>
                                                <td className={`px-2 ${dense ? "py-2" : "py-3.5"}`}>
                                                    <div className={`w-8 h-8 border-2 flex items-center justify-center font-mono text-[10px] font-bold ${
                                                        app.score >= 90 ? "border-emerald-300 text-emerald-600 bg-emerald-50" :
                                                        app.score >= 75 ? "border-[#233876]/20 text-[#233876]" :
                                                        "border-[#233876]/10 text-[#0f1b3d]/30"
                                                    }`}>
                                                        {app.score}
                                                    </div>
                                                </td>
                                                <td className={`px-4 ${dense ? "py-2" : "py-3.5"}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 border border-[#233876]/15 flex items-center justify-center bg-[#233876] flex-shrink-0">
                                                            <span className="font-mono text-[9px] font-bold text-white">{app.initials}</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm text-[#0f1b3d]">{app.candidate}</div>
                                                            <div className="font-mono text-[10px] text-[#0f1b3d]/25">{app.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-4 ${dense ? "py-2" : "py-3.5"}`}>
                                                    <div className="text-sm text-[#0f1b3d]/60">{app.role}</div>
                                                </td>
                                                <td className={`px-4 ${dense ? "py-2" : "py-3.5"}`}>
                                                    <div className="text-sm text-[#0f1b3d]/50">{app.company}</div>
                                                </td>
                                                <td className={`px-4 ${dense ? "py-2" : "py-3.5"}`}>
                                                    <span className={`font-mono text-[10px] tracking-wider uppercase border px-2 py-0.5 ${stageColors[app.stage] || ""}`}>
                                                        {app.stage}
                                                    </span>
                                                </td>
                                                <td className={`px-4 ${dense ? "py-2" : "py-3.5"}`}>
                                                    <div className="font-mono text-xs text-[#0f1b3d]/40">{app.submitted}</div>
                                                </td>
                                                <td className={`px-4 ${dense ? "py-2" : "py-3.5"}`}>
                                                    <div className="font-mono text-xs font-semibold text-[#233876]">{app.salary}</div>
                                                </td>
                                                <td className={`px-4 ${dense ? "py-2" : "py-3.5"} text-right`}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button className="w-7 h-7 border border-[#233876]/10 flex items-center justify-center hover:border-[#233876]/30 transition-colors" title="View">
                                                            <i className="fa-regular fa-eye text-[10px] text-[#233876]/40" />
                                                        </button>
                                                        <button className="w-7 h-7 border border-[#233876]/10 flex items-center justify-center hover:border-[#233876]/30 transition-colors" title="Edit">
                                                            <i className="fa-regular fa-pen text-[10px] text-[#233876]/40" />
                                                        </button>
                                                        <button className="w-7 h-7 border border-[#233876]/10 flex items-center justify-center hover:border-red-300 transition-colors" title="Delete">
                                                            <i className="fa-regular fa-trash text-[10px] text-[#0f1b3d]/20" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginatedData.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="px-4 py-16 text-center">
                                                    <div className="w-12 h-12 border-2 border-[#233876]/10 flex items-center justify-center mx-auto mb-4">
                                                        <i className="fa-duotone fa-regular fa-inbox text-[#233876]/20 text-xl" />
                                                    </div>
                                                    <div className="text-sm text-[#0f1b3d]/30">No applications match your filters.</div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-4 py-3 border-t-2 border-[#233876]/8 bg-[#f7f8fa]/50">
                                <div className="font-mono text-[10px] text-[#0f1b3d]/25">
                                    Showing {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 border border-[#233876]/10 flex items-center justify-center hover:border-[#233876]/30 transition-colors disabled:opacity-30"
                                    >
                                        <i className="fa-regular fa-chevron-left text-[10px] text-[#233876]/40" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 border text-xs font-mono transition-colors ${
                                                page === currentPage
                                                    ? "border-[#233876] bg-[#233876] text-white"
                                                    : "border-[#233876]/10 text-[#0f1b3d]/30 hover:border-[#233876]/30"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-8 h-8 border border-[#233876]/10 flex items-center justify-center hover:border-[#233876]/30 transition-colors disabled:opacity-30"
                                    >
                                        <i className="fa-regular fa-chevron-right text-[10px] text-[#233876]/40" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference bar */}
            <section className="relative py-6 bg-white border-t border-[#233876]/10">
                <div className="container mx-auto px-6">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">EMPLOYMENT NETWORKS // TABLES v9.0</span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">CLEAN ARCHITECTURE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
