"use client";

import { useState, useRef, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { mockJobs } from "@/data/mock-jobs";
import type { JobListing } from "@/types/job-listing";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type SortField = "title" | "company" | "salary" | "posted" | "status";
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<string, string> = {
  active: "badge-success",
  paused: "badge-warning",
  closed: "badge-error",
  draft: "badge-ghost",
};

function salaryMid(salary: { min: number; max: number }): number {
  return (salary.min + salary.max) / 2;
}

function daysSincePosted(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TablesFourPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* State */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("posted");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "title",
      "company",
      "location",
      "type",
      "salary",
      "posted",
      "status",
      "recruiter",
    ])
  );

  const ALL_COLUMNS = [
    { key: "title", label: "Job Title" },
    { key: "company", label: "Company" },
    { key: "location", label: "Location" },
    { key: "type", label: "Type" },
    { key: "salary", label: "Salary" },
    { key: "posted", label: "Posted" },
    { key: "status", label: "Status" },
    { key: "recruiter", label: "Recruiter" },
    { key: "tags", label: "Tags" },
    { key: "featured", label: "Featured" },
  ];

  /* Animations */
  useGSAP(() => {
    gsap.fromTo(
      ".cin-table-header",
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
    gsap.fromTo(
      ".cin-table-toolbar",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.15 }
    );
    gsap.fromTo(
      ".cin-table-body",
      { opacity: 0 },
      { opacity: 1, duration: 0.4, delay: 0.3 }
    );
  }, { scope: containerRef });

  /* Filtering + sorting */
  const filtered = useMemo(() => {
    let data = [...mockJobs];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((j) => j.status === statusFilter);
    }

    if (typeFilter !== "all") {
      data = data.filter((j) => j.type === typeFilter);
    }

    data.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "company":
          cmp = a.company.localeCompare(b.company);
          break;
        case "salary":
          cmp = salaryMid(a.salary) - salaryMid(b.salary);
          break;
        case "posted":
          cmp =
            new Date(a.postedDate).getTime() -
            new Date(b.postedDate).getTime();
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [search, statusFilter, typeFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allOnPageSelected = pageData.every((j) => selectedRows.has(j.id));

  /* Handlers */
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allOnPageSelected) {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        pageData.forEach((j) => next.delete(j.id));
        return next;
      });
    } else {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        pageData.forEach((j) => next.add(j.id));
        return next;
      });
    }
  };

  const startEdit = (id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditValue(value);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <i
      className={`fa-duotone fa-regular ${
        sortField === field
          ? sortDir === "asc"
            ? "fa-sort-up text-primary"
            : "fa-sort-down text-primary"
          : "fa-sort text-base-content/20"
      } text-xs ml-1`}
    />
  );

  const renderCellValue = (job: JobListing, col: string) => {
    switch (col) {
      case "title":
        return (
          <div
            className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
            onDoubleClick={() => startEdit(job.id, "title", job.title)}
          >
            {editingCell?.id === job.id && editingCell?.field === "title" ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={cancelEdit}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEdit();
                }}
                className="input input-xs input-bordered w-full bg-base-200"
              />
            ) : (
              <span>{job.title}</span>
            )}
          </div>
        );
      case "company":
        return <span className="text-sm">{job.company}</span>;
      case "location":
        return (
          <span className="text-sm text-base-content/60">
            <i className="fa-duotone fa-regular fa-location-dot text-xs mr-1" />
            {job.location}
          </span>
        );
      case "type":
        return (
          <span className="badge badge-sm badge-outline">{job.type}</span>
        );
      case "salary":
        return <span className="text-sm font-mono">{job.salary.currency}{job.salary.min.toLocaleString()}–{job.salary.max.toLocaleString()}</span>;
      case "posted": {
        const days = daysSincePosted(job.postedDate);
        return (
          <span className="text-sm text-base-content/60">
            {days === 0
              ? "Today"
              : days === 1
              ? "Yesterday"
              : `${days}d ago`}
          </span>
        );
      }
      case "status":
        return (
          <span
            className={`badge badge-sm ${STATUS_COLORS[job.status] || "badge-ghost"}`}
          >
            {job.status}
          </span>
        );
      case "recruiter":
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">
                {job.recruiter.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <span className="text-sm">{job.recruiter.name}</span>
          </div>
        );
      case "tags":
        return (
          <div className="flex flex-wrap gap-1">
            {job.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="badge badge-xs badge-outline text-[10px]"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 2 && (
              <span className="text-xs text-base-content/40">
                +{job.tags.length - 2}
              </span>
            )}
          </div>
        );
      case "featured":
        return job.featured ? (
          <i className="fa-duotone fa-regular fa-star text-warning text-sm" />
        ) : (
          <i className="fa-duotone fa-regular fa-star text-base-content/15 text-sm" />
        );
      default:
        return null;
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div ref={containerRef} className="min-h-screen bg-base-100">
      {/* Header */}
      <header className="cin-table-header bg-neutral text-neutral-content">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3 font-semibold">
            Data Tables
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Advanced Data Table
          </h1>
          <p className="text-neutral-content/60 max-w-xl">
            Sortable columns, inline editing, row selection, bulk actions,
            column customization, and pagination.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="cin-table-toolbar flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          {/* Left: search + filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial lg:w-64">
              <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search jobs..."
                className="input input-bordered input-sm w-full pl-9 bg-base-200/50 border-base-300 focus:border-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm bg-base-200/50 border-base-300"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm bg-base-200/50 border-base-300"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Bulk actions */}
            {selectedRows.size > 0 && (
              <div className="flex items-center gap-2 mr-2 pr-4 border-r border-base-300">
                <span className="text-xs text-base-content/50 font-semibold">
                  {selectedRows.size} selected
                </span>
                <button className="btn btn-xs btn-ghost text-error">
                  <i className="fa-duotone fa-regular fa-trash text-xs" />
                </button>
                <button className="btn btn-xs btn-ghost">
                  <i className="fa-duotone fa-regular fa-file-export text-xs" />
                </button>
                <button className="btn btn-xs btn-ghost">
                  <i className="fa-duotone fa-regular fa-tag text-xs" />
                </button>
              </div>
            )}

            {/* Column picker */}
            <div className="relative">
              <button
                onClick={() => setShowColumnPicker(!showColumnPicker)}
                className="btn btn-sm btn-ghost border border-base-300"
              >
                <i className="fa-duotone fa-regular fa-table-columns text-xs" />
                Columns
              </button>
              {showColumnPicker && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-base-100 border border-base-300 rounded-lg shadow-xl p-3 w-48">
                  {ALL_COLUMNS.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 py-1.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={visibleColumns.has(col.key)}
                        onChange={() => toggleColumn(col.key)}
                      />
                      <span className="text-sm">{col.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Export */}
            <button className="btn btn-sm btn-ghost border border-base-300">
              <i className="fa-duotone fa-regular fa-download text-xs" />
              Export
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-base-content/50">
            Showing{" "}
            <span className="font-semibold text-base-content">
              {(page - 1) * pageSize + 1}
            </span>
            -
            <span className="font-semibold text-base-content">
              {Math.min(page * pageSize, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-base-content">
              {filtered.length}
            </span>{" "}
            results
          </p>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="select select-bordered select-xs bg-base-200/50 border-base-300"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        {/* Table */}
        <div className="cin-table-body overflow-x-auto border border-base-300 rounded-lg">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-base-200/60">
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary"
                    checked={allOnPageSelected && pageData.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                {visibleColumns.has("title") && (
                  <th
                    className="cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => toggleSort("title")}
                  >
                    Job Title <SortIcon field="title" />
                  </th>
                )}
                {visibleColumns.has("company") && (
                  <th
                    className="cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => toggleSort("company")}
                  >
                    Company <SortIcon field="company" />
                  </th>
                )}
                {visibleColumns.has("location") && <th>Location</th>}
                {visibleColumns.has("type") && <th>Type</th>}
                {visibleColumns.has("salary") && (
                  <th
                    className="cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => toggleSort("salary")}
                  >
                    Salary <SortIcon field="salary" />
                  </th>
                )}
                {visibleColumns.has("posted") && (
                  <th
                    className="cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => toggleSort("posted")}
                  >
                    Posted <SortIcon field="posted" />
                  </th>
                )}
                {visibleColumns.has("status") && (
                  <th
                    className="cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => toggleSort("status")}
                  >
                    Status <SortIcon field="status" />
                  </th>
                )}
                {visibleColumns.has("recruiter") && <th>Recruiter</th>}
                {visibleColumns.has("tags") && <th>Tags</th>}
                {visibleColumns.has("featured") && (
                  <th className="w-10 text-center">
                    <i className="fa-duotone fa-regular fa-star text-xs" />
                  </th>
                )}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {pageData.map((job) => (
                <tr
                  key={job.id}
                  className={`hover:bg-base-200/40 transition-colors ${
                    selectedRows.has(job.id) ? "bg-primary/5" : ""
                  }`}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary"
                      checked={selectedRows.has(job.id)}
                      onChange={() => toggleRow(job.id)}
                    />
                  </td>
                  {ALL_COLUMNS.filter((c) => visibleColumns.has(c.key)).map(
                    (col) => (
                      <td key={col.key}>{renderCellValue(job, col.key)}</td>
                    )
                  )}
                  <td>
                    <div className="dropdown dropdown-end">
                      <button
                        tabIndex={0}
                        className="btn btn-ghost btn-xs"
                      >
                        <i className="fa-duotone fa-regular fa-ellipsis-vertical text-xs" />
                      </button>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-10 menu menu-xs bg-base-100 border border-base-300 rounded-lg shadow-xl w-36"
                      >
                        <li>
                          <a>
                            <i className="fa-duotone fa-regular fa-eye text-xs" />
                            View
                          </a>
                        </li>
                        <li>
                          <a>
                            <i className="fa-duotone fa-regular fa-pen text-xs" />
                            Edit
                          </a>
                        </li>
                        <li>
                          <a>
                            <i className="fa-duotone fa-regular fa-copy text-xs" />
                            Duplicate
                          </a>
                        </li>
                        <li>
                          <a className="text-error">
                            <i className="fa-duotone fa-regular fa-trash text-xs" />
                            Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      ALL_COLUMNS.filter((c) => visibleColumns.has(c.key))
                        .length + 2
                    }
                    className="text-center py-12"
                  >
                    <i className="fa-duotone fa-regular fa-inbox text-4xl text-base-content/20 mb-3 block" />
                    <p className="text-base-content/50 font-semibold">
                      No results found
                    </p>
                    <p className="text-xs text-base-content/40 mt-1">
                      Try adjusting your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-base-content/40">
              Page {page} of {totalPages}
            </p>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage(1)}
              >
                <i className="fa-duotone fa-regular fa-angles-left text-xs" />
              </button>
              <button
                className="join-item btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <i className="fa-duotone fa-regular fa-angle-left text-xs" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`join-item btn btn-sm ${
                      page === pageNum ? "btn-primary" : ""
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="join-item btn btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <i className="fa-duotone fa-regular fa-angle-right text-xs" />
              </button>
              <button
                className="join-item btn btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <i className="fa-duotone fa-regular fa-angles-right text-xs" />
              </button>
            </div>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        <div className="mt-8 p-4 bg-base-200/50 border border-base-300 rounded-lg">
          <p className="text-xs uppercase tracking-wider text-base-content/40 font-semibold mb-3">
            Table Interactions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { keys: "Click header", desc: "Sort column" },
              { keys: "Double-click cell", desc: "Inline edit" },
              { keys: "Checkbox", desc: "Select rows" },
              { keys: "Row menu", desc: "View / Edit / Delete" },
            ].map((hint) => (
              <div key={hint.keys} className="flex items-start gap-2">
                <span className="badge badge-sm badge-ghost font-mono text-[10px] whitespace-nowrap">
                  {hint.keys}
                </span>
                <span className="text-xs text-base-content/50">
                  {hint.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
