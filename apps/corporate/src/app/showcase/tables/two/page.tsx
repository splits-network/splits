"use client";

import { useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Data ───────────────────────────────────────────────────────────────────── */

interface Application {
    id: number;
    candidate: string;
    position: string;
    company: string;
    recruiter: string;
    status: "Submitted" | "Screening" | "Interview" | "Offer" | "Placed" | "Rejected";
    date: string;
    dateSortable: number;
    salary: string;
    salaryNum: number;
    splitFee: string;
}

const applications: Application[] = [
    { id: 1, candidate: "Alex Kim", position: "Staff Frontend Engineer", company: "Meridian Corp", recruiter: "Sarah Chen", status: "Interview", date: "Feb 12", dateSortable: 12, salary: "$230K", salaryNum: 230, splitFee: "50/50" },
    { id: 2, candidate: "Jordan Lee", position: "VP of Engineering", company: "Quantum Financial", recruiter: "Marcus Webb", status: "Offer", date: "Feb 11", dateSortable: 11, salary: "$320K", salaryNum: 320, splitFee: "60/40" },
    { id: 3, candidate: "Priya Patel", position: "Product Designer", company: "Nova Analytics", recruiter: "Sarah Chen", status: "Screening", date: "Feb 10", dateSortable: 10, salary: "$155K", salaryNum: 155, splitFee: "50/50" },
    { id: 4, candidate: "Marcus Rivera", position: "Data Scientist", company: "Prism AI", recruiter: "Lisa Park", status: "Submitted", date: "Feb 10", dateSortable: 10, salary: "$185K", salaryNum: 185, splitFee: "50/50" },
    { id: 5, candidate: "Emily Zhang", position: "DevOps Lead", company: "CloudNine Infra", recruiter: "James Rivera", status: "Placed", date: "Feb 8", dateSortable: 8, salary: "$175K", salaryNum: 175, splitFee: "70/30" },
    { id: 6, candidate: "David Thompson", position: "CRO", company: "Pinnacle SaaS", recruiter: "Sarah Chen", status: "Interview", date: "Feb 7", dateSortable: 7, salary: "$290K", salaryNum: 290, splitFee: "60/40" },
    { id: 7, candidate: "Sofia Martinez", position: "Growth Marketing Lead", company: "Spark Commerce", recruiter: "Lisa Park", status: "Rejected", date: "Feb 6", dateSortable: 6, salary: "$145K", salaryNum: 145, splitFee: "50/50" },
    { id: 8, candidate: "James Wright", position: "Risk Analyst", company: "Atlas Capital", recruiter: "Marcus Webb", status: "Screening", date: "Feb 5", dateSortable: 5, salary: "$115K", salaryNum: 115, splitFee: "50/50" },
    { id: 9, candidate: "Olivia Brown", position: "Clinical Data Manager", company: "BioVance Labs", recruiter: "James Rivera", status: "Submitted", date: "Feb 4", dateSortable: 4, salary: "$130K", salaryNum: 130, splitFee: "50/50" },
    { id: 10, candidate: "Ryan Chen", position: "Head of Talent", company: "Orion Labs", recruiter: "Sarah Chen", status: "Interview", date: "Feb 3", dateSortable: 3, salary: "$195K", salaryNum: 195, splitFee: "50/50" },
];

type SortField = "candidate" | "position" | "status" | "date" | "salary";
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<string, string> = {
    Submitted: "bg-base-200 text-base-content/60",
    Screening: "bg-info/10 text-info",
    Interview: "bg-warning/10 text-warning",
    Offer: "bg-secondary/10 text-secondary",
    Placed: "bg-success/10 text-success",
    Rejected: "bg-error/10 text-error",
};

const STATUSES = ["All", "Submitted", "Screening", "Interview", "Offer", "Placed", "Rejected"];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function TablesPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [dense, setDense] = useState(false);
    const [page, setPage] = useState(1);
    const perPage = 5;

    useGSAP(() => {
        gsap.from("[data-page-text]", { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
        gsap.from("[data-table]", { y: 30, opacity: 0, duration: 0.7, delay: 0.3, ease: "power2.out" });
    }, { scope: containerRef });

    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortField(field); setSortDir("asc"); }
    };

    const filtered = useMemo(() => {
        let result = [...applications];
        if (statusFilter !== "All") result = result.filter((a) => a.status === statusFilter);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((a) => a.candidate.toLowerCase().includes(q) || a.position.toLowerCase().includes(q) || a.company.toLowerCase().includes(q));
        }
        result.sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case "candidate": cmp = a.candidate.localeCompare(b.candidate); break;
                case "position": cmp = a.position.localeCompare(b.position); break;
                case "status": cmp = a.status.localeCompare(b.status); break;
                case "date": cmp = a.dateSortable - b.dateSortable; break;
                case "salary": cmp = a.salaryNum - b.salaryNum; break;
            }
            return sortDir === "desc" ? -cmp : cmp;
        });
        return result;
    }, [statusFilter, searchQuery, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const pageData = filtered.slice((page - 1) * perPage, page * perPage);
    const allSelected = pageData.length > 0 && pageData.every((a) => selected.has(a.id));

    const toggleAll = () => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(pageData.map((a) => a.id)));
    };

    const toggleRow = (id: number) => {
        setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    };

    const SortIcon = ({ field }: { field: SortField }) => (
        <i className={`fa-regular ${sortField === field ? (sortDir === "asc" ? "fa-arrow-up" : "fa-arrow-down") : "fa-arrows-up-down"} text-[10px] ml-1.5 ${sortField === field ? "text-secondary" : "text-base-content/20"}`} />
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100 overflow-hidden">
            <section className="bg-neutral text-neutral-content py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p data-page-text className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4">Component Showcase</p>
                    <h1 data-page-text className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-4">Data<br />Tables</h1>
                    <p data-page-text className="text-lg text-neutral-content/60 max-w-lg">Advanced data table with sorting, filtering, selection, bulk actions, pagination, and density toggle.</p>
                </div>
            </section>

            <section className="py-10 md:py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    {/* Toolbar */}
                    <div data-table className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex-1 max-w-sm">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                                <input type="text" placeholder="Search applications..." className="input input-bordered input-sm w-full bg-base-200 pl-9 focus:border-secondary" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
                            </div>
                            <select className="select select-bordered select-sm bg-base-200 text-xs focus:border-secondary" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            {selected.size > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-base-content/50">{selected.size} selected</span>
                                    <button className="btn btn-ghost btn-xs border border-base-300 text-[10px] uppercase tracking-wider font-medium">Export</button>
                                    <button className="btn btn-ghost btn-xs border border-error/30 text-error text-[10px] uppercase tracking-wider font-medium">Archive</button>
                                </div>
                            )}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-[10px] uppercase tracking-wider text-base-content/40 font-medium">Dense</span>
                                <input type="checkbox" className="toggle toggle-secondary toggle-xs" checked={dense} onChange={(e) => setDense(e.target.checked)} />
                            </label>
                            <button className="btn btn-ghost btn-sm border border-base-300 text-[10px] uppercase tracking-wider font-medium">
                                <i className="fa-duotone fa-regular fa-download mr-1.5" />Export
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div data-table className="border border-base-300 overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-base-200">
                                    <th className={`${dense ? "py-2" : "py-3"} px-4 w-10`}>
                                        <input type="checkbox" className="checkbox checkbox-secondary checkbox-xs" checked={allSelected} onChange={toggleAll} />
                                    </th>
                                    {([["candidate", "Candidate"], ["position", "Position"], ["status", "Status"], ["date", "Date"], ["salary", "Salary"]] as [SortField, string][]).map(([field, label]) => (
                                        <th key={field} className={`${dense ? "py-2" : "py-3"} px-4 cursor-pointer select-none`} onClick={() => toggleSort(field)}>
                                            <span className="text-[10px] uppercase tracking-wider font-medium text-base-content/50 flex items-center">{label}<SortIcon field={field} /></span>
                                        </th>
                                    ))}
                                    <th className={`${dense ? "py-2" : "py-3"} px-4`}><span className="text-[10px] uppercase tracking-wider font-medium text-base-content/50">Split</span></th>
                                    <th className={`${dense ? "py-2" : "py-3"} px-4 w-16`} />
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-base-content/40">No applications match your filters.</td></tr>
                                ) : pageData.map((a) => (
                                    <tr key={a.id} className={`border-b border-base-300 last:border-0 hover:bg-base-200/50 transition-colors ${selected.has(a.id) ? "bg-secondary/5" : ""}`}>
                                        <td className={`${dense ? "py-2" : "py-3"} px-4`}>
                                            <input type="checkbox" className="checkbox checkbox-secondary checkbox-xs" checked={selected.has(a.id)} onChange={() => toggleRow(a.id)} />
                                        </td>
                                        <td className={`${dense ? "py-2" : "py-3"} px-4`}>
                                            <p className="text-sm font-medium text-base-content">{a.candidate}</p>
                                            <p className="text-xs text-base-content/40">{a.recruiter}</p>
                                        </td>
                                        <td className={`${dense ? "py-2" : "py-3"} px-4`}>
                                            <p className="text-sm text-base-content">{a.position}</p>
                                            <p className="text-xs text-base-content/40">{a.company}</p>
                                        </td>
                                        <td className={`${dense ? "py-2" : "py-3"} px-4`}>
                                            <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                                        </td>
                                        <td className={`${dense ? "py-2" : "py-3"} px-4 text-xs text-base-content/50`}>{a.date}</td>
                                        <td className={`${dense ? "py-2" : "py-3"} px-4 text-sm font-medium text-primary`}>{a.salary}</td>
                                        <td className={`${dense ? "py-2" : "py-3"} px-4 text-xs text-base-content/50`}>{a.splitFee}</td>
                                        <td className={`${dense ? "py-2" : "py-3"} px-4`}>
                                            <div className="dropdown dropdown-end">
                                                <button tabIndex={0} className="btn btn-ghost btn-xs text-base-content/30 hover:text-base-content"><i className="fa-regular fa-ellipsis-vertical" /></button>
                                                <ul tabIndex={0} className="dropdown-content z-10 bg-base-100 border border-base-300 shadow-lg w-36 py-1">
                                                    <li><button className="block w-full text-left px-3 py-2 text-xs text-base-content/60 hover:bg-base-200">View Details</button></li>
                                                    <li><button className="block w-full text-left px-3 py-2 text-xs text-base-content/60 hover:bg-base-200">Edit</button></li>
                                                    <li><button className="block w-full text-left px-3 py-2 text-xs text-error hover:bg-base-200">Archive</button></li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-base-content/40">Showing {((page - 1) * perPage) + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-xs text-base-content/40 disabled:opacity-30"><i className="fa-regular fa-chevron-left" /></button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button key={p} onClick={() => setPage(p)} className={`btn btn-xs ${page === p ? "btn-secondary" : "btn-ghost text-base-content/40"}`}>{p}</button>
                            ))}
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-ghost btn-xs text-base-content/40 disabled:opacity-30"><i className="fa-regular fa-chevron-right" /></button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-base-200 border-t border-base-300 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">Splits Network &middot; Table Patterns &middot; Magazine Editorial</p>
                </div>
            </section>
        </div>
    );
}
