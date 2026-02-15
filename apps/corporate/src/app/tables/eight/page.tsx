"use client";

import { useRef, useState, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const BG = {
  deep: "#0a1628",
  mid: "#0d1d33",
  card: "#0f2847",
  dark: "#081220",
  input: "#0b1a2e",
};

const D = { fast: 0.3, normal: 0.6, hero: 1.0, build: 1.4 };
const E = { smooth: "power2.out", bounce: "back.out(1.2)", elastic: "elastic.out(1, 0.5)" };

type SortDir = "asc" | "desc";
type SortKey = "name" | "role" | "status" | "date" | "salary" | "location";

interface Candidate {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "interviewing" | "offered" | "placed" | "rejected";
  date: string;
  salary: string;
  salaryNum: number;
  location: string;
  avatar: string;
  match: number;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  interviewing: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  offered: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  placed: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  rejected: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

const MOCK_DATA: Candidate[] = [
  { id: 1, name: "Sarah Chen", email: "sarah.chen@email.com", role: "Senior Frontend Engineer", status: "interviewing", date: "2026-02-10", salary: "$165,000", salaryNum: 165000, location: "San Francisco, CA", avatar: "SC", match: 96 },
  { id: 2, name: "Marcus Rivera", email: "marcus@email.com", role: "Full Stack Developer", status: "active", date: "2026-02-08", salary: "$145,000", salaryNum: 145000, location: "Austin, TX", avatar: "MR", match: 92 },
  { id: 3, name: "Emily Watson", email: "emily.w@email.com", role: "DevOps Engineer", status: "offered", date: "2026-02-07", salary: "$155,000", salaryNum: 155000, location: "Seattle, WA", avatar: "EW", match: 89 },
  { id: 4, name: "James Park", email: "jpark@email.com", role: "Product Manager", status: "placed", date: "2026-02-05", salary: "$170,000", salaryNum: 170000, location: "New York, NY", avatar: "JP", match: 94 },
  { id: 5, name: "Aisha Patel", email: "aisha.p@email.com", role: "Data Scientist", status: "active", date: "2026-02-04", salary: "$160,000", salaryNum: 160000, location: "Chicago, IL", avatar: "AP", match: 87 },
  { id: 6, name: "David Kim", email: "dkim@email.com", role: "Backend Engineer", status: "interviewing", date: "2026-02-03", salary: "$150,000", salaryNum: 150000, location: "Portland, OR", avatar: "DK", match: 91 },
  { id: 7, name: "Rachel Torres", email: "rachel.t@email.com", role: "UX Designer", status: "rejected", date: "2026-02-02", salary: "$130,000", salaryNum: 130000, location: "Denver, CO", avatar: "RT", match: 74 },
  { id: 8, name: "Alex Nguyen", email: "alex.n@email.com", role: "Cloud Architect", status: "offered", date: "2026-02-01", salary: "$185,000", salaryNum: 185000, location: "Seattle, WA", avatar: "AN", match: 95 },
  { id: 9, name: "Lisa Johnson", email: "lisa.j@email.com", role: "Engineering Manager", status: "active", date: "2026-01-30", salary: "$195,000", salaryNum: 195000, location: "San Francisco, CA", avatar: "LJ", match: 88 },
  { id: 10, name: "Tom Bradley", email: "tbradley@email.com", role: "ML Engineer", status: "interviewing", date: "2026-01-28", salary: "$175,000", salaryNum: 175000, location: "Boston, MA", avatar: "TB", match: 93 },
  { id: 11, name: "Nina Kowalski", email: "nina.k@email.com", role: "Security Engineer", status: "active", date: "2026-01-27", salary: "$160,000", salaryNum: 160000, location: "Austin, TX", avatar: "NK", match: 85 },
  { id: 12, name: "Chris Morgan", email: "cmorgan@email.com", role: "Site Reliability Eng", status: "placed", date: "2026-01-25", salary: "$165,000", salaryNum: 165000, location: "Remote", avatar: "CM", match: 90 },
];

export default function TablesEightPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useGSAP(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: E.smooth } });
    tl.from(".table-header", { opacity: 0, y: -20, duration: D.normal })
      .from(".table-controls", { opacity: 0, y: 10, duration: D.fast }, "-=0.3")
      .from(".table-container", { opacity: 0, y: 20, duration: D.normal }, "-=0.2");
  }, { scope: containerRef });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredData.map(d => d.id)));
    }
  };

  const filteredData = useMemo(() => {
    let data = [...MOCK_DATA];
    if (statusFilter !== "all") data = data.filter(d => d.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => d.name.toLowerCase().includes(q) || d.role.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.location.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "role": cmp = a.role.localeCompare(b.role); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "date": cmp = a.date.localeCompare(b.date); break;
        case "salary": cmp = a.salaryNum - b.salaryNum; break;
        case "location": cmp = a.location.localeCompare(b.location); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [search, sortKey, sortDir, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / perPage);
  const pageData = filteredData.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <i className="fa-duotone fa-regular fa-sort text-white/20 ml-1" />;
    return <i className={`fa-duotone fa-regular fa-sort-${sortDir === "asc" ? "up" : "down"} text-cyan-400 ml-1`} />;
  };

  return (
    <div ref={containerRef} className="min-h-screen text-white" style={{ background: BG.deep }}>
      {/* Blueprint Grid Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner Dimension Marks */}
      <div className="fixed top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="table-header flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-cyan-500/30 flex items-center justify-center" style={{ background: BG.card }}>
              <i className="fa-duotone fa-regular fa-table-cells text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Candidate Pipeline</h1>
              <p className="text-white/40 font-mono text-xs tracking-wider uppercase">// DATA TABLE - {MOCK_DATA.length} RECORDS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded border border-cyan-500/20 font-mono text-xs text-white/50 hover:text-white/70 hover:border-cyan-500/30 transition-colors flex items-center gap-2" style={{ background: BG.card }}>
              <i className="fa-duotone fa-regular fa-download" />
              Export
            </button>
            <button className="px-3 py-2 rounded font-mono text-xs font-bold text-white flex items-center gap-2" style={{ background: "#22d3ee" }}>
              <i className="fa-duotone fa-regular fa-plus" />
              Add Candidate
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="table-controls flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search candidates..."
              className="w-full pl-9 pr-3 py-2 rounded border border-cyan-500/20 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors placeholder:text-white/20"
              style={{ background: BG.input }}
            />
          </div>
          <div className="flex items-center gap-2">
            {["all", "active", "interviewing", "offered", "placed", "rejected"].map(status => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${
                  statusFilter === status
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-400"
                    : "border border-cyan-500/10 text-white/40 hover:text-white/60"
                }`}
                style={statusFilter !== status ? { background: BG.input } : {}}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="mb-4 p-3 rounded border border-cyan-500/20 flex items-center justify-between" style={{ background: BG.card }}>
            <span className="font-mono text-xs text-cyan-400">{selected.size} selected</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded border border-cyan-500/20 font-mono text-xs text-white/50 hover:text-white/70 transition-colors">
                <i className="fa-duotone fa-regular fa-envelope mr-1" /> Email
              </button>
              <button className="px-3 py-1.5 rounded border border-cyan-500/20 font-mono text-xs text-white/50 hover:text-white/70 transition-colors">
                <i className="fa-duotone fa-regular fa-tag mr-1" /> Tag
              </button>
              <button className="px-3 py-1.5 rounded border border-red-500/20 font-mono text-xs text-red-400/60 hover:text-red-400 transition-colors">
                <i className="fa-duotone fa-regular fa-trash mr-1" /> Remove
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-container rounded-lg border border-cyan-500/20 overflow-hidden" style={{ background: BG.card }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: BG.dark }}>
                  <th className="p-3 text-left w-10">
                    <input type="checkbox" checked={selected.size === filteredData.length && filteredData.length > 0} onChange={toggleAll} className="checkbox checkbox-xs checkbox-primary border-cyan-500/30" />
                  </th>
                  <th className="p-3 text-left">
                    <button onClick={() => handleSort("name")} className="font-mono text-xs text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors flex items-center">
                      Candidate <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="p-3 text-left">
                    <button onClick={() => handleSort("role")} className="font-mono text-xs text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors flex items-center">
                      Role <SortIcon col="role" />
                    </button>
                  </th>
                  <th className="p-3 text-left">
                    <button onClick={() => handleSort("status")} className="font-mono text-xs text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors flex items-center">
                      Status <SortIcon col="status" />
                    </button>
                  </th>
                  <th className="p-3 text-left hidden lg:table-cell">
                    <button onClick={() => handleSort("salary")} className="font-mono text-xs text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors flex items-center">
                      Salary <SortIcon col="salary" />
                    </button>
                  </th>
                  <th className="p-3 text-left hidden md:table-cell">
                    <button onClick={() => handleSort("location")} className="font-mono text-xs text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors flex items-center">
                      Location <SortIcon col="location" />
                    </button>
                  </th>
                  <th className="p-3 text-left hidden lg:table-cell">
                    <span className="font-mono text-xs text-white/40 uppercase tracking-wider">Match</span>
                  </th>
                  <th className="p-3 text-left hidden sm:table-cell">
                    <button onClick={() => handleSort("date")} className="font-mono text-xs text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors flex items-center">
                      Added <SortIcon col="date" />
                    </button>
                  </th>
                  <th className="p-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {pageData.map(row => {
                  const st = STATUS_STYLES[row.status];
                  return (
                    <tr key={row.id} className={`border-t border-cyan-500/10 hover:bg-cyan-500/5 transition-colors ${selected.has(row.id) ? "bg-cyan-500/5" : ""}`}>
                      <td className="p-3">
                        <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} className="checkbox checkbox-xs checkbox-primary border-cyan-500/30" />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded border border-cyan-500/20 flex items-center justify-center font-mono text-xs text-cyan-400 font-bold shrink-0" style={{ background: BG.input }}>
                            {row.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{row.name}</p>
                            <p className="text-white/30 text-xs font-mono truncate">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-white/70 text-sm truncate block max-w-[180px]">{row.role}</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-mono border ${st.bg} ${st.text} ${st.border}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-white/70 font-mono text-sm">{row.salary}</span>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-white/50 text-sm">{row.location}</span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <div className="h-full rounded-full" style={{ width: `${row.match}%`, background: row.match >= 90 ? "#22d3ee" : row.match >= 80 ? "#34d399" : "#fbbf24" }} />
                          </div>
                          <span className="font-mono text-xs text-white/40">{row.match}%</span>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <span className="text-white/40 text-xs font-mono">{new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </td>
                      <td className="p-3">
                        <button className="text-white/30 hover:text-white/60 transition-colors">
                          <i className="fa-duotone fa-regular fa-ellipsis-vertical" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-cyan-500/10" style={{ background: BG.dark }}>
            <p className="font-mono text-xs text-white/40">
              Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredData.length)} of {filteredData.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded border border-cyan-500/10 flex items-center justify-center text-white/40 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" style={{ background: BG.input }}>
                <i className="fa-duotone fa-regular fa-chevron-left text-xs" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded border font-mono text-xs transition-colors ${page === p ? "border-cyan-400 bg-cyan-500/10 text-cyan-400" : "border-cyan-500/10 text-white/40 hover:text-white/60"}`} style={page !== p ? { background: BG.input } : {}}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded border border-cyan-500/10 flex items-center justify-center text-white/40 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" style={{ background: BG.input }}>
                <i className="fa-duotone fa-regular fa-chevron-right text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          {[
            { label: "Total", value: MOCK_DATA.length, icon: "fa-users" },
            { label: "Active", value: MOCK_DATA.filter(d => d.status === "active").length, icon: "fa-circle-check" },
            { label: "Interviewing", value: MOCK_DATA.filter(d => d.status === "interviewing").length, icon: "fa-comments" },
            { label: "Offered", value: MOCK_DATA.filter(d => d.status === "offered").length, icon: "fa-file-contract" },
            { label: "Placed", value: MOCK_DATA.filter(d => d.status === "placed").length, icon: "fa-trophy" },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg border border-cyan-500/10 p-4 text-center" style={{ background: BG.card }}>
              <i className={`fa-duotone fa-regular ${stat.icon} text-cyan-400/50 text-lg mb-2 block`} />
              <p className="text-2xl font-bold font-mono text-white">{stat.value}</p>
              <p className="text-white/40 text-xs font-mono uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
