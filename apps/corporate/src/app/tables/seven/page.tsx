"use client";

import { useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Mock Data ──────────────────────────────────────────────────────────────────

interface TableRow {
    id: string;
    candidate: string;
    role: string;
    company: string;
    status: "Active" | "Placed" | "Rejected" | "Interview" | "Offer";
    stage: string;
    submitted: string;
    splitFee: string;
    recruiter: string;
}

const tableData: TableRow[] = [
    { id: "APP-001", candidate: "Sarah Kim", role: "Staff Engineer", company: "Meridian Labs", status: "Placed", stage: "Complete", submitted: "Jan 15", splitFee: "50/50", recruiter: "M. Chen" },
    { id: "APP-002", candidate: "David Park", role: "Engineering Manager", company: "NovaTech", status: "Offer", stage: "Negotiation", submitted: "Jan 18", splitFee: "60/40", recruiter: "A. Rivera" },
    { id: "APP-003", candidate: "Emily Zhang", role: "Senior PM", company: "Vertex AI", status: "Interview", stage: "Round 3", submitted: "Jan 20", splitFee: "50/50", recruiter: "M. Chen" },
    { id: "APP-004", candidate: "James Wilson", role: "DevOps Lead", company: "CloudScale", status: "Rejected", stage: "Screening", submitted: "Jan 22", splitFee: "55/45", recruiter: "T. Santos" },
    { id: "APP-005", candidate: "Maria Santos", role: "Data Scientist", company: "Prism Financial", status: "Active", stage: "Phone Screen", submitted: "Jan 25", splitFee: "50/50", recruiter: "M. Chen" },
    { id: "APP-006", candidate: "Alex Nguyen", role: "Frontend Lead", company: "Pixel Dynamics", status: "Interview", stage: "Round 2", submitted: "Jan 28", splitFee: "60/40", recruiter: "A. Rivera" },
    { id: "APP-007", candidate: "Rachel Lee", role: "VP Engineering", company: "Apex Systems", status: "Active", stage: "Sourced", submitted: "Feb 01", splitFee: "50/50", recruiter: "T. Santos" },
    { id: "APP-008", candidate: "Chris Martinez", role: "ML Engineer", company: "DeepCore AI", status: "Interview", stage: "Technical", submitted: "Feb 03", splitFee: "55/45", recruiter: "M. Chen" },
    { id: "APP-009", candidate: "Diana Chen", role: "Product Director", company: "Meridian Labs", status: "Offer", stage: "Final Review", submitted: "Feb 05", splitFee: "50/50", recruiter: "A. Rivera" },
    { id: "APP-010", candidate: "Ryan Thompson", role: "Backend Engineer", company: "NovaTech", status: "Active", stage: "Submitted", submitted: "Feb 08", splitFee: "60/40", recruiter: "T. Santos" },
    { id: "APP-011", candidate: "Jennifer Wu", role: "Security Engineer", company: "CloudScale", status: "Placed", stage: "Complete", submitted: "Feb 10", splitFee: "50/50", recruiter: "M. Chen" },
    { id: "APP-012", candidate: "Kevin Brown", role: "CTO", company: "StartupX", status: "Active", stage: "Outreach", submitted: "Feb 12", splitFee: "55/45", recruiter: "A. Rivera" },
];

type SortKey = keyof TableRow;
type SortDir = "asc" | "desc";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TablesSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sortKey, setSortKey] = useState<SortKey>("id");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-table-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-table-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-table-toolbar", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3");
            tl.fromTo(".bp-table-container", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === filteredData.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filteredData.map((r) => r.id)));
        }
    };

    const filteredData = useMemo(() => {
        let data = [...tableData];
        if (filterStatus !== "all") {
            data = data.filter((r) => r.status === filterStatus);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(
                (r) =>
                    r.candidate.toLowerCase().includes(term) ||
                    r.role.toLowerCase().includes(term) ||
                    r.company.toLowerCase().includes(term) ||
                    r.id.toLowerCase().includes(term),
            );
        }
        data.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            const cmp = String(aVal).localeCompare(String(bVal));
            return sortDir === "asc" ? cmp : -cmp;
        });
        return data;
    }, [filterStatus, searchTerm, sortKey, sortDir]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const statusColor = (status: string) => {
        switch (status) {
            case "Placed": return "text-[#22c55e]/70 border-[#22c55e]/20 bg-[#22c55e]/5";
            case "Offer": return "text-[#14b8a6]/70 border-[#14b8a6]/20 bg-[#14b8a6]/5";
            case "Interview": return "text-[#3b5ccc]/70 border-[#3b5ccc]/20 bg-[#3b5ccc]/5";
            case "Rejected": return "text-[#ef4444]/70 border-[#ef4444]/20 bg-[#ef4444]/5";
            default: return "text-[#c8ccd4]/50 border-[#c8ccd4]/15 bg-[#c8ccd4]/5";
        }
    };

    const columns: { key: SortKey; label: string; width?: string }[] = [
        { key: "id", label: "REF", width: "w-24" },
        { key: "candidate", label: "CANDIDATE" },
        { key: "role", label: "ROLE" },
        { key: "company", label: "COMPANY" },
        { key: "status", label: "STATUS", width: "w-28" },
        { key: "stage", label: "STAGE", width: "w-28" },
        { key: "splitFee", label: "SPLIT", width: "w-20" },
        { key: "recruiter", label: "RECRUITER", width: "w-24" },
    ];

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    <div className="bp-table-ref flex justify-between items-center mb-6 opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-TABL07-2026</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            DATA_TABLE
                        </div>
                    </div>

                    <h1 className="bp-table-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                        Data <span className="text-[#3b5ccc]">Tables</span>
                    </h1>
                    <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mb-10">// ADVANCED DATA GRID WITH SORTING AND FILTERING</p>

                    <div className="max-w-7xl mx-auto">
                        {/* ═══ Toolbar ═══ */}
                        <div className="bp-table-toolbar opacity-0 flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#3b5ccc]/30"></i>
                                <input
                                    type="text"
                                    placeholder="Search candidates, roles, companies..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full bg-transparent border border-[#3b5ccc]/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#c8ccd4]/15 focus:border-[#3b5ccc]/40 focus:outline-none transition-colors font-mono"
                                />
                            </div>
                            <div className="flex gap-2">
                                {["all", "Active", "Interview", "Offer", "Placed", "Rejected"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                                        className={`px-3 py-2.5 font-mono text-[9px] tracking-widest border transition-colors ${
                                            filterStatus === status
                                                ? "border-[#3b5ccc] text-[#3b5ccc] bg-[#3b5ccc]/10"
                                                : "border-[#c8ccd4]/10 text-[#c8ccd4]/30 hover:text-[#c8ccd4]/60 hover:border-[#c8ccd4]/20"
                                        }`}
                                    >
                                        {status === "all" ? "ALL" : status.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ═══ Bulk Actions ═══ */}
                        {selected.size > 0 && (
                            <div className="flex items-center gap-4 mb-4 px-4 py-3 border border-[#3b5ccc]/20 bg-[#3b5ccc]/5">
                                <span className="font-mono text-[10px] text-[#3b5ccc] tracking-widest">
                                    {selected.size} SELECTED
                                </span>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 border border-[#3b5ccc]/20 text-[#3b5ccc]/60 font-mono text-[9px] tracking-widest hover:bg-[#3b5ccc]/10 transition-colors">
                                        EXPORT
                                    </button>
                                    <button className="px-3 py-1.5 border border-[#3b5ccc]/20 text-[#3b5ccc]/60 font-mono text-[9px] tracking-widest hover:bg-[#3b5ccc]/10 transition-colors">
                                        REASSIGN
                                    </button>
                                    <button className="px-3 py-1.5 border border-[#ef4444]/20 text-[#ef4444]/60 font-mono text-[9px] tracking-widest hover:bg-[#ef4444]/10 transition-colors">
                                        ARCHIVE
                                    </button>
                                </div>
                                <button
                                    onClick={() => setSelected(new Set())}
                                    className="ml-auto font-mono text-[9px] text-[#c8ccd4]/30 tracking-widest hover:text-[#c8ccd4]/60 transition-colors"
                                >
                                    CLEAR
                                </button>
                            </div>
                        )}

                        {/* ═══ Table ═══ */}
                        <div className="bp-table-container opacity-0 border border-[#3b5ccc]/15 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#3b5ccc]/10">
                                        <th className="w-10 px-4 py-3">
                                            <button
                                                onClick={toggleSelectAll}
                                                className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                                                    selected.size === filteredData.length && filteredData.length > 0
                                                        ? "border-[#3b5ccc] bg-[#3b5ccc]"
                                                        : "border-[#c8ccd4]/15 hover:border-[#3b5ccc]/30"
                                                }`}
                                            >
                                                {selected.size === filteredData.length && filteredData.length > 0 && (
                                                    <i className="fa-duotone fa-regular fa-check text-[8px] text-white"></i>
                                                )}
                                            </button>
                                        </th>
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                className={`px-4 py-3 text-left ${col.width || ""}`}
                                            >
                                                <button
                                                    onClick={() => handleSort(col.key)}
                                                    className="flex items-center gap-1 font-mono text-[9px] tracking-widest text-[#3b5ccc]/40 hover:text-[#3b5ccc] transition-colors"
                                                >
                                                    {col.label}
                                                    {sortKey === col.key && (
                                                        <i className={`fa-duotone fa-regular ${sortDir === "asc" ? "fa-arrow-up" : "fa-arrow-down"} text-[7px]`}></i>
                                                    )}
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#3b5ccc]/5">
                                    {paginatedData.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={`hover:bg-[#3b5ccc]/5 transition-colors ${
                                                selected.has(row.id) ? "bg-[#3b5ccc]/5" : ""
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => toggleSelect(row.id)}
                                                    className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                                                        selected.has(row.id)
                                                            ? "border-[#3b5ccc] bg-[#3b5ccc]"
                                                            : "border-[#c8ccd4]/15 hover:border-[#3b5ccc]/30"
                                                    }`}
                                                >
                                                    {selected.has(row.id) && (
                                                        <i className="fa-duotone fa-regular fa-check text-[8px] text-white"></i>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[10px] text-[#3b5ccc]/40 tracking-wider">{row.id}</td>
                                            <td className="px-4 py-3 text-sm text-white">{row.candidate}</td>
                                            <td className="px-4 py-3 text-sm text-[#c8ccd4]/50">{row.role}</td>
                                            <td className="px-4 py-3 text-sm text-[#c8ccd4]/50">{row.company}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 font-mono text-[9px] tracking-widest border ${statusColor(row.status)}`}>
                                                    {row.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider">{row.stage}</td>
                                            <td className="px-4 py-3 font-mono text-[10px] text-[#14b8a6]/50 tracking-wider">{row.splitFee}</td>
                                            <td className="px-4 py-3 font-mono text-[10px] text-[#c8ccd4]/40 tracking-wider">{row.recruiter}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ═══ Pagination ═══ */}
                        <div className="flex items-center justify-between mt-4 px-2">
                            <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest">
                                SHOWING {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredData.length)} OF {filteredData.length} RECORDS
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 border border-[#3b5ccc]/15 flex items-center justify-center font-mono text-[10px] text-[#c8ccd4]/30 hover:text-white hover:border-[#3b5ccc]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-left text-[8px]"></i>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 border flex items-center justify-center font-mono text-[10px] tracking-wider transition-colors ${
                                            currentPage === page
                                                ? "border-[#3b5ccc] text-[#3b5ccc] bg-[#3b5ccc]/10"
                                                : "border-[#3b5ccc]/15 text-[#c8ccd4]/30 hover:text-white hover:border-[#3b5ccc]/30"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 border border-[#3b5ccc]/15 flex items-center justify-center font-mono text-[10px] text-[#c8ccd4]/30 hover:text-white hover:border-[#3b5ccc]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-right text-[8px]"></i>
                                </button>
                            </div>
                        </div>

                        {/* ═══ Footer Status ═══ */}
                        <div className="mt-6 border-t border-[#3b5ccc]/10 pt-4 flex items-center justify-between">
                            <div className="font-mono text-[8px] text-[#c8ccd4]/15 tracking-widest">
                                TABLE_ENGINE v2.1 // LAST_SYNC: 2026-02-14T08:00:00Z
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest hover:text-[#3b5ccc] transition-colors">
                                    <i className="fa-duotone fa-regular fa-download text-[8px] mr-1"></i>
                                    EXPORT_CSV
                                </button>
                                <button className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest hover:text-[#3b5ccc] transition-colors">
                                    <i className="fa-duotone fa-regular fa-print text-[8px] mr-1"></i>
                                    PRINT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
