"use client";

import { useState, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── types ─── */

interface Placement {
  id: string; candidate: string; role: string; company: string; recruiter: string;
  fee: string; status: "placed" | "in-progress" | "pending" | "rejected";
  date: string; split: string; salary: string;
}

type SortField = keyof Placement;
type SortDir = "asc" | "desc";

/* ─── data ─── */

const allPlacements: Placement[] = [
  { id: "PLC-001", candidate: "Rachel Chen", role: "Senior Software Engineer", company: "Nexus Dynamics", recruiter: "K. Reyes", fee: "$24,000", status: "placed", date: "2026-02-10", split: "50/50", salary: "$160,000" },
  { id: "PLC-002", candidate: "James Wilson", role: "Engineering Manager", company: "Cortex AI", recruiter: "M. Chen", fee: "$38,500", status: "placed", date: "2026-02-08", split: "60/40", salary: "$220,000" },
  { id: "PLC-003", candidate: "Priya Sharma", role: "Staff Frontend Engineer", company: "DataVault", recruiter: "K. Reyes", fee: "$29,000", status: "in-progress", date: "2026-02-12", split: "50/50", salary: "$195,000" },
  { id: "PLC-004", candidate: "David Okonkwo", role: "DevOps Engineer", company: "CloudBase", recruiter: "S. Kim", fee: "$22,500", status: "pending", date: "2026-02-14", split: "50/50", salary: "$175,000" },
  { id: "PLC-005", candidate: "Maria Lopez", role: "Product Manager", company: "Relay Systems", recruiter: "M. Chen", fee: "$21,000", status: "rejected", date: "2026-02-05", split: "40/60", salary: "$165,000" },
  { id: "PLC-006", candidate: "Tom Nguyen", role: "Backend Engineer", company: "Pipeline Co", recruiter: "K. Reyes", fee: "$19,500", status: "placed", date: "2026-01-28", split: "50/50", salary: "$155,000" },
  { id: "PLC-007", candidate: "Lisa Park", role: "UX Researcher", company: "Cortex AI", recruiter: "S. Kim", fee: "$18,000", status: "in-progress", date: "2026-02-11", split: "50/50", salary: "$140,000" },
  { id: "PLC-008", candidate: "Alex Rivera", role: "VP of Engineering", company: "Growth Labs", recruiter: "K. Reyes", fee: "$52,000", status: "pending", date: "2026-02-13", split: "70/30", salary: "$310,000" },
  { id: "PLC-009", candidate: "Emma Brown", role: "Full-Stack Engineer", company: "DataVault", recruiter: "M. Chen", fee: "$20,000", status: "placed", date: "2026-01-30", split: "50/50", salary: "$160,000" },
  { id: "PLC-010", candidate: "Kai Tanaka", role: "ML Engineer", company: "Nexus Dynamics", recruiter: "S. Kim", fee: "$27,500", status: "in-progress", date: "2026-02-09", split: "60/40", salary: "$185,000" },
];

const columns = [
  { key: "id" as SortField, label: "ID", w: "w-24" },
  { key: "candidate" as SortField, label: "Candidate", w: "w-40" },
  { key: "role" as SortField, label: "Role", w: "flex-1" },
  { key: "company" as SortField, label: "Company", w: "w-36" },
  { key: "fee" as SortField, label: "Fee", w: "w-24" },
  { key: "status" as SortField, label: "Status", w: "w-28" },
  { key: "date" as SortField, label: "Date", w: "w-28" },
];

const statusColors: Record<string, string> = {
  placed: "bg-success/10 border-success/20 text-success",
  "in-progress": "bg-primary/10 border-primary/20 text-primary",
  pending: "bg-warning/10 border-warning/20 text-warning",
  rejected: "bg-error/10 border-error/20 text-error",
};

/* ─── component ─── */

export default function TablesShowcaseTen() {
  const mainRef = useRef<HTMLElement>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(new Set(columns.map(c => c.key)));
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const rowsPerPage = 8;

  useGSAP(() => {
    if (!mainRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(".table-scanline", { scaleX: 0 }, { scaleX: 1, duration: 0.6 })
      .fromTo(".table-header", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
      .fromTo(".table-container", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    gsap.fromTo(".status-pulse", { scale: 0.6, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { scope: mainRef });

  const filtered = useMemo(() => {
    let data = [...allPlacements];
    if (statusFilter) data = data.filter(d => d.status === statusFilter);
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      data = data.filter(d => d.candidate.toLowerCase().includes(q) || d.role.toLowerCase().includes(q) || d.company.toLowerCase().includes(q) || d.id.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [statusFilter, searchFilter, sortField, sortDir]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleRow = (id: string) => setSelectedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => { if (selectedRows.size === paged.length) setSelectedRows(new Set()); else setSelectedRows(new Set(paged.map(r => r.id))); };

  return (
    <main ref={mainRef} className="min-h-screen bg-base-300 text-base-content overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/30 pointer-events-none z-10" />

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-8">
        <div className="table-scanline h-[2px] bg-primary w-32 mb-6 origin-left" />
        <div className="table-header">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3 opacity-80">sys.data &gt; placement_records v2.0</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Placement Records</h1>
        </div>
      </section>

      <section className="table-container relative z-10 max-w-7xl mx-auto px-6 pb-24">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-base-200 border border-base-content/5">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <i className="fa-duotone fa-regular fa-magnifying-glass text-xs text-base-content/30" />
            <input type="text" value={searchFilter} onChange={e => { setSearchFilter(e.target.value); setPage(1); }} placeholder="Search records..." className="bg-transparent border-none outline-none font-mono text-xs flex-1 text-base-content placeholder:text-base-content/20" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="select select-xs bg-base-300 border border-base-content/10 font-mono text-[10px]">
            <option value="">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="flex border border-base-content/10">
            <button onClick={() => setDense(false)} className={`w-7 h-7 flex items-center justify-center transition-colors ${!dense ? "bg-primary/10 text-primary" : "text-base-content/30"}`} title="Comfortable"><i className="fa-duotone fa-regular fa-expand text-[10px]" /></button>
            <button onClick={() => setDense(true)} className={`w-7 h-7 flex items-center justify-center transition-colors ${dense ? "bg-primary/10 text-primary" : "text-base-content/30"}`} title="Dense"><i className="fa-duotone fa-regular fa-compress text-[10px]" /></button>
          </div>
          <div className="relative">
            <button onClick={() => setColMenuOpen(!colMenuOpen)} className="btn btn-ghost btn-xs font-mono uppercase tracking-wider text-[9px]"><i className="fa-duotone fa-regular fa-table-columns mr-1" /> Columns</button>
            {colMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-base-200 border border-base-content/10 shadow-xl z-50 p-2">
                {columns.map(c => (
                  <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-base-content/5">
                    <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={visibleCols.has(c.key)} onChange={() => setVisibleCols(prev => { const n = new Set(prev); n.has(c.key) ? n.delete(c.key) : n.add(c.key); return n; })} />
                    <span className="font-mono text-[10px] text-base-content/50">{c.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-ghost btn-xs font-mono uppercase tracking-wider text-[9px]"><i className="fa-duotone fa-regular fa-download mr-1" /> Export</button>
        </div>

        {/* Bulk Actions */}
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-4 mb-3 p-3 bg-primary/5 border border-primary/20">
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary">{selectedRows.size} selected</span>
            <button className="btn btn-primary btn-xs font-mono uppercase tracking-wider text-[9px]"><i className="fa-duotone fa-regular fa-file-export mr-1" /> Export Selected</button>
            <button className="btn btn-ghost btn-xs font-mono uppercase tracking-wider text-[9px]"><i className="fa-duotone fa-regular fa-tags mr-1" /> Update Status</button>
            <button className="btn btn-ghost btn-xs font-mono uppercase tracking-wider text-[9px] text-error/50"><i className="fa-duotone fa-regular fa-trash mr-1" /> Delete</button>
            <button onClick={() => setSelectedRows(new Set())} className="ml-auto font-mono text-[10px] text-base-content/30 hover:text-base-content/50 uppercase tracking-wider">Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto border border-base-content/5">
          <table className="w-full">
            <thead className="bg-base-200">
              <tr>
                <th className="px-3 py-2.5 w-10"><input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={selectedRows.size === paged.length && paged.length > 0} onChange={toggleAll} /></th>
                {columns.filter(c => visibleCols.has(c.key)).map(col => (
                  <th key={col.key} className={`px-3 ${dense ? "py-2" : "py-2.5"} text-left cursor-pointer hover:bg-base-content/5 transition-colors`} onClick={() => toggleSort(col.key)}>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">{col.label}</span>
                      {sortField === col.key && <i className={`fa-duotone fa-regular ${sortDir === "asc" ? "fa-arrow-up" : "fa-arrow-down"} text-[9px] text-primary`} />}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2.5 w-16"><span className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(row => (
                <tr key={row.id} className={`border-t border-base-content/5 hover:bg-base-content/[0.02] transition-colors ${selectedRows.has(row.id) ? "bg-primary/[0.03]" : ""}`}>
                  <td className="px-3 py-2"><input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={selectedRows.has(row.id)} onChange={() => toggleRow(row.id)} /></td>
                  {visibleCols.has("id") && <td className={`px-3 ${dense ? "py-1.5" : "py-3"} font-mono text-xs text-primary`}>{row.id}</td>}
                  {visibleCols.has("candidate") && <td className={`px-3 ${dense ? "py-1.5" : "py-3"} text-sm font-bold`}>{row.candidate}</td>}
                  {visibleCols.has("role") && <td className={`px-3 ${dense ? "py-1.5" : "py-3"} text-sm text-base-content/60`}>{row.role}</td>}
                  {visibleCols.has("company") && <td className={`px-3 ${dense ? "py-1.5" : "py-3"} text-sm text-base-content/50`}>{row.company}</td>}
                  {visibleCols.has("fee") && <td className={`px-3 ${dense ? "py-1.5" : "py-3"} font-mono text-xs font-bold text-primary`}>{row.fee}</td>}
                  {visibleCols.has("status") && <td className={`px-3 ${dense ? "py-1.5" : "py-3"}`}><span className={`px-2 py-0.5 border font-mono text-[9px] uppercase tracking-wider ${statusColors[row.status]}`}>{row.status}</span></td>}
                  {visibleCols.has("date") && <td className={`px-3 ${dense ? "py-1.5" : "py-3"} font-mono text-[11px] text-base-content/30`}>{row.date}</td>}
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs btn-square" title="View"><i className="fa-duotone fa-regular fa-eye text-[10px] text-base-content/30" /></button>
                      <button className="btn btn-ghost btn-xs btn-square" title="Edit"><i className="fa-duotone fa-regular fa-pen text-[10px] text-base-content/30" /></button>
                      <button className="btn btn-ghost btn-xs btn-square" title="Delete"><i className="fa-duotone fa-regular fa-trash text-[10px] text-error/30" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 p-3 bg-base-200 border border-base-content/5">
          <span className="font-mono text-[10px] text-base-content/25 uppercase tracking-wider">
            Showing {(page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center bg-base-300 border border-base-content/10 text-base-content/30 font-mono text-xs disabled:opacity-30"><i className="fa-duotone fa-regular fa-chevron-left text-[10px]" /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-7 h-7 flex items-center justify-center border font-mono text-xs ${page === i + 1 ? "bg-primary/10 border-primary/20 text-primary" : "bg-base-300 border-base-content/10 text-base-content/30"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center bg-base-300 border border-base-content/10 text-base-content/30 font-mono text-xs disabled:opacity-30"><i className="fa-duotone fa-regular fa-chevron-right text-[10px]" /></button>
          </div>
        </div>
      </section>

      <section className="py-10 px-6 border-t border-base-content/10 bg-base-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
          <div className="flex items-center gap-2"><span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" /><span className="font-mono text-[10px] uppercase tracking-wider">Table System Operational</span></div>
          <span className="text-base-content/10">|</span><span className="font-mono text-[10px] uppercase tracking-wider">Splits Network // Component Showcase</span>
        </div>
      </section>
    </main>
  );
}
