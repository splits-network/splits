"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

/* --- Data ----------------------------------------------------------------- */

const candidates = [
    { id: 1, name: "Alex Rivera", initials: "AR", email: "alex@email.com", role: "Senior Engineer", company: "TechCorp", status: "Active", match: 96, stage: "Interview", salary: "$195K", applied: "Feb 10, 2026", recruiter: "Sarah Kim" },
    { id: 2, name: "Jordan Lee", initials: "JL", email: "jordan@email.com", role: "VP Engineering", company: "DataFlow", status: "Active", match: 91, stage: "Submitted", salary: "$280K", applied: "Feb 8, 2026", recruiter: "Sarah Kim" },
    { id: 3, name: "Morgan Chen", initials: "MC", email: "morgan@email.com", role: "Product Manager", company: "InnovateCo", status: "Active", match: 87, stage: "Screen", salary: "$170K", applied: "Feb 7, 2026", recruiter: "David Park" },
    { id: 4, name: "Casey Nguyen", initials: "CN", email: "casey@email.com", role: "Data Scientist", company: "AnalyticsPro", status: "Placed", match: 94, stage: "Placed", salary: "$185K", applied: "Jan 28, 2026", recruiter: "Sarah Kim" },
    { id: 5, name: "Taylor Swift", initials: "TS", email: "taylor@email.com", role: "DevOps Engineer", company: "CloudScale", status: "Active", match: 82, stage: "Offer", salary: "$200K", applied: "Feb 5, 2026", recruiter: "Mike Jones" },
    { id: 6, name: "Riley Kim", initials: "RK", email: "riley@email.com", role: "UX Designer", company: "DesignLab", status: "Rejected", match: 65, stage: "Rejected", salary: "$155K", applied: "Jan 25, 2026", recruiter: "David Park" },
    { id: 7, name: "Sam Patel", initials: "SP", email: "sam@email.com", role: "Backend Engineer", company: "ScaleAI", status: "Active", match: 88, stage: "Interview", salary: "$210K", applied: "Feb 12, 2026", recruiter: "Sarah Kim" },
    { id: 8, name: "Jamie Wong", initials: "JW", email: "jamie@email.com", role: "Marketing Manager", company: "GrowthCo", status: "Active", match: 75, stage: "Submitted", salary: "$140K", applied: "Feb 11, 2026", recruiter: "Mike Jones" },
    { id: 9, name: "Drew Tanaka", initials: "DT", email: "drew@email.com", role: "Frontend Engineer", company: "TechCorp", status: "Active", match: 90, stage: "Screen", salary: "$180K", applied: "Feb 13, 2026", recruiter: "David Park" },
    { id: 10, name: "Robin Foster", initials: "RF", email: "robin@email.com", role: "Engineering Manager", company: "DataFlow", status: "Active", match: 85, stage: "Interview", salary: "$245K", applied: "Feb 9, 2026", recruiter: "Sarah Kim" },
];

type SortField = "name" | "match" | "applied" | "salary" | "stage";
type SortDir = "asc" | "desc";

const stageColor: Record<string, string> = {
    Submitted: "bg-info/10 text-info",
    Screen: "bg-warning/10 text-warning",
    Interview: "bg-primary/10 text-primary",
    Offer: "bg-accent/10 text-accent",
    Placed: "bg-success/10 text-success",
    Rejected: "bg-error/10 text-error",
};

/* --- Page ----------------------------------------------------------------- */

export default function TablesOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [sortField, setSortField] = useState<SortField>("match");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [search, setSearch] = useState("");
    const [stageFilter, setStageFilter] = useState("All");

    const toggleSelect = (id: number) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        setSelected(selected.length === filtered.length ? [] : filtered.map((c) => c.id));
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) { setSortDir(sortDir === "asc" ? "desc" : "asc"); }
        else { setSortField(field); setSortDir("desc"); }
    };

    const filtered = candidates
        .filter((c) => {
            if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.role.toLowerCase().includes(search.toLowerCase())) return false;
            if (stageFilter !== "All" && c.stage !== stageFilter) return false;
            return true;
        })
        .sort((a, b) => {
            const dir = sortDir === "asc" ? 1 : -1;
            if (sortField === "name") return a.name.localeCompare(b.name) * dir;
            if (sortField === "match") return (a.match - b.match) * dir;
            if (sortField === "salary") return (parseInt(a.salary.replace(/\D/g, "")) - parseInt(b.salary.replace(/\D/g, ""))) * dir;
            if (sortField === "applied") return (new Date(a.applied).getTime() - new Date(b.applied).getTime()) * dir;
            return a.stage.localeCompare(b.stage) * dir;
        });

    useGSAP(() => {
        if (!mainRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => mainRef.current!.querySelectorAll(s);
        const $1 = (s: string) => mainRef.current!.querySelector(s);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo($1(".table-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
          .fromTo($(".table-title-word"), { opacity: 0, y: 60, rotateX: 30 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1 }, "-=0.3")
          .fromTo($1(".table-desc"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
          .fromTo($1(".table-content"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
    }, { scope: mainRef });

    const SortIcon = ({ field }: { field: SortField }) => (
        <i className={`fa-solid fa-sort${sortField === field ? (sortDir === "asc" ? "-up" : "-down") : ""} text-[9px] ${sortField === field ? "text-primary" : "text-base-content/20"}`} />
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10" style={{ clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)" }} />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="table-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">Data Tables</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="table-title-word inline-block opacity-0">Your</span>{" "}
                            <span className="table-title-word inline-block opacity-0 text-primary">pipeline.</span>
                        </h1>
                        <p className="table-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                            Track, sort, and manage every candidate across your active placements.
                        </p>
                    </div>
                </div>
            </section>

            {/* Table */}
            <section className="table-content opacity-0 container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates..."
                                className="input input-bordered input-sm pl-9 w-56" />
                        </div>
                        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="select select-bordered select-sm">
                            <option>All</option>
                            <option>Submitted</option>
                            <option>Screen</option>
                            <option>Interview</option>
                            <option>Offer</option>
                            <option>Placed</option>
                            <option>Rejected</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        {selected.length > 0 && (
                            <div className="flex items-center gap-2 mr-3">
                                <span className="text-xs font-semibold text-primary">{selected.length} selected</span>
                                <button className="btn btn-xs btn-primary"><i className="fa-duotone fa-regular fa-paper-plane" /> Bulk Submit</button>
                                <button className="btn btn-xs btn-ghost"><i className="fa-duotone fa-regular fa-download" /> Export</button>
                            </div>
                        )}
                        <button className="btn btn-sm btn-ghost"><i className="fa-duotone fa-regular fa-download" /> Export All</button>
                        <button className="btn btn-sm btn-primary"><i className="fa-duotone fa-regular fa-plus" /> Add Candidate</button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-base-300">
                    <table className="table table-sm w-full">
                        <thead>
                            <tr className="bg-base-200">
                                <th className="w-10"><input type="checkbox" className="checkbox checkbox-primary checkbox-xs" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                                <th className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                                    <span className="flex items-center gap-1.5">Candidate <SortIcon field="name" /></span>
                                </th>
                                <th>Role</th>
                                <th>Company</th>
                                <th className="cursor-pointer select-none" onClick={() => handleSort("stage")}>
                                    <span className="flex items-center gap-1.5">Stage <SortIcon field="stage" /></span>
                                </th>
                                <th className="cursor-pointer select-none" onClick={() => handleSort("match")}>
                                    <span className="flex items-center gap-1.5">Match <SortIcon field="match" /></span>
                                </th>
                                <th className="cursor-pointer select-none" onClick={() => handleSort("salary")}>
                                    <span className="flex items-center gap-1.5">Salary <SortIcon field="salary" /></span>
                                </th>
                                <th className="cursor-pointer select-none" onClick={() => handleSort("applied")}>
                                    <span className="flex items-center gap-1.5">Applied <SortIcon field="applied" /></span>
                                </th>
                                <th>Recruiter</th>
                                <th className="w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr key={c.id} className={`hover:bg-base-200/50 transition-colors ${selected.includes(c.id) ? "bg-primary/5" : ""}`}>
                                    <td><input type="checkbox" className="checkbox checkbox-primary checkbox-xs" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary text-primary-content flex items-center justify-center text-[10px] font-bold flex-shrink-0">{c.initials}</div>
                                            <div>
                                                <div className="font-bold text-sm">{c.name}</div>
                                                <div className="text-[10px] text-base-content/40">{c.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-sm">{c.role}</td>
                                    <td className="text-sm text-base-content/60">{c.company}</td>
                                    <td><span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${stageColor[c.stage] || ""}`}>{c.stage}</span></td>
                                    <td><span className="font-bold text-sm">{c.match}%</span></td>
                                    <td className="text-sm font-semibold">{c.salary}</td>
                                    <td className="text-xs text-base-content/50">{c.applied}</td>
                                    <td className="text-xs text-base-content/50">{c.recruiter}</td>
                                    <td>
                                        <div className="dropdown dropdown-end">
                                            <button tabIndex={0} className="btn btn-ghost btn-xs"><i className="fa-solid fa-ellipsis-vertical" /></button>
                                            <ul tabIndex={0} className="dropdown-content menu p-1 shadow bg-base-100 border border-base-300 w-40 z-50">
                                                <li><button className="text-xs">View Profile</button></li>
                                                <li><button className="text-xs">Edit</button></li>
                                                <li><button className="text-xs text-error">Remove</button></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-base-300">
                    <span className="text-sm text-base-content/40">Showing {filtered.length} of {candidates.length} candidates</span>
                    <div className="flex gap-1">
                        <button className="btn btn-sm btn-ghost" disabled><i className="fa-solid fa-chevron-left text-xs" /></button>
                        <button className="btn btn-sm btn-primary">1</button>
                        <button className="btn btn-sm btn-ghost">2</button>
                        <button className="btn btn-sm btn-ghost">3</button>
                        <button className="btn btn-sm btn-ghost"><i className="fa-solid fa-chevron-right text-xs" /></button>
                    </div>
                </div>
            </section>
        </main>
    );
}
