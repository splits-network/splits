"use client";

import { useState, useMemo, Fragment, useCallback, useEffect, Suspense } from "react";
import { useStandardList } from "@/hooks/use-standard-list";
import { apiClient } from "@/lib/api-client";
import { formatSalary, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@splits-network/memphis-ui";
import type { Job, JobFilters } from "./types";
import {
    formatEmploymentType,
    formatCommuteTypes,
    formatJobLevel,
    getCompanyName,
    getCompanyIndustry,
    getCompanyHQ,
    getCompanyInitials,
    shouldShowSalary,
    formatStatus,
    EMPLOYMENT_TYPES,
} from "./types";
import { ListsSixAnimator } from "./lists-six-animator";

// ─── Accent Cycle (Tailwind classes, never hex) ─────────────────────────────

const ACCENT = [
    { bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral-light", textOnBg: "text-white" },
    { bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal-light", textOnBg: "text-dark" },
    { bg: "bg-yellow", text: "text-yellow", border: "border-yellow", bgLight: "bg-yellow-light", textOnBg: "text-dark" },
    { bg: "bg-purple", text: "text-purple", border: "border-purple", bgLight: "bg-purple-light", textOnBg: "text-white" },
] as const;

type AccentClasses = (typeof ACCENT)[number];

function accentAt(idx: number): AccentClasses {
    return ACCENT[idx % ACCENT.length];
}

function statusAccent(status?: string): AccentClasses {
    switch (status) {
        case "active":
            return ACCENT[1]; // teal
        case "filled":
            return ACCENT[0]; // coral
        case "paused":
            return ACCENT[2]; // yellow
        case "closed":
            return ACCENT[3]; // purple
        default:
            return ACCENT[1];
    }
}

type ViewMode = "table" | "grid" | "split";

// ─── Helpers ────────────────────────────────────────────────────────────────

function salaryDisplay(job: Job): string | null {
    if (!shouldShowSalary(job)) return null;
    return formatSalary(job.salary_min ?? 0, job.salary_max ?? 0);
}

function isNew(job: Job): boolean {
    if (!job.created_at) return false;
    const d = typeof job.created_at === "string" ? new Date(job.created_at) : job.created_at;
    return (Date.now() - d.getTime()) / 86400000 <= 7;
}

function postedAgo(job: Job): string {
    if (!job.created_at) return "";
    return formatRelativeTime(job.created_at);
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function JobDetail({
    job,
    accent,
    onClose,
}: {
    job: Job;
    accent: AccentClasses;
    onClose?: () => void;
}) {
    const companyName = getCompanyName(job);
    const companyIndustry = getCompanyIndustry(job);
    const companyHQ = getCompanyHQ(job);
    const salary = salaryDisplay(job);
    const commute = formatCommuteTypes(job.commute_types);
    const level = formatJobLevel(job.job_level);

    const mandatoryReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => a.sort_order - b.sort_order);
    const preferredReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "preferred")
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className={`p-6 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {isNew(job) && (
                            <Badge color="yellow" className="mb-3">
                                <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                                New
                            </Badge>
                        )}
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 text-dark">
                            {job.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className={`font-bold ${accent.text}`}>{companyName}</span>
                            <span className="text-dark/50">|</span>
                            {job.location && (
                                <span className="text-dark/70">
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                    {job.location}
                                </span>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={`w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-sm border-2 transition-transform hover:-translate-y-0.5 ${accent.border} ${accent.text}`}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <Badge color={statusAccent(job.status) === ACCENT[1] ? "teal" : statusAccent(job.status) === ACCENT[0] ? "coral" : statusAccent(job.status) === ACCENT[2] ? "yellow" : "purple"} variant="outline">
                        {formatStatus(job.status)}
                    </Badge>
                    {job.employment_type && (
                        <Badge color="dark" variant="outline">
                            {formatEmploymentType(job.employment_type)}
                        </Badge>
                    )}
                    {level && (
                        <Badge color="dark" variant="outline">
                            {level}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 border-b-4 ${accent.border}`}>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {salary || "N/A"}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                        Salary
                    </div>
                </div>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {commute || "N/A"}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                        Commute
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {job.department || "N/A"}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                        Department
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="p-6">
                {(job.candidate_description || job.description) && (
                    <p className="text-sm leading-relaxed mb-6 text-dark/80">
                        {job.candidate_description || job.description}
                    </p>
                )}

                {/* Mandatory Requirements */}
                {mandatoryReqs.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="w-6 h-6 flex items-center justify-center text-[10px] bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-list-check" />
                            </span>
                            Requirements
                        </h3>
                        <ul className="space-y-2">
                            {mandatoryReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start gap-2 text-sm text-dark/75"
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-right mt-1 flex-shrink-0 text-[10px] text-coral" />
                                    {req.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Preferred Requirements */}
                {preferredReqs.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="w-6 h-6 flex items-center justify-center text-[10px] bg-teal text-dark">
                                <i className="fa-duotone fa-regular fa-clipboard-list" />
                            </span>
                            Nice to Have
                        </h3>
                        <ul className="space-y-2">
                            {preferredReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start gap-2 text-sm text-dark/75"
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-right mt-1 flex-shrink-0 text-[10px] text-teal" />
                                    {req.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Company Info */}
                <div className={`p-4 border-4 ${accent.border}`}>
                    <h3 className="font-black text-xs uppercase tracking-wider mb-3 text-dark">
                        Company
                    </h3>
                    <div className="flex items-center gap-3">
                        {job.company?.logo_url ? (
                            <img
                                src={job.company.logo_url}
                                alt={companyName}
                                className={`w-12 h-12 object-cover border-2 ${accent.border}`}
                            />
                        ) : (
                            <div
                                className={`w-12 h-12 flex items-center justify-center border-2 ${accent.border} bg-cream font-bold text-sm text-dark`}
                            >
                                {getCompanyInitials(companyName)}
                            </div>
                        )}
                        <div>
                            <div className="font-bold text-sm text-dark">{companyName}</div>
                            {companyIndustry && (
                                <div className={`text-xs ${accent.text}`}>{companyIndustry}</div>
                            )}
                            {companyHQ && (
                                <div className="text-xs text-dark/50">{companyHQ}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Detail Loading Wrapper ─────────────────────────────────────────────────

function DetailLoader({
    jobId,
    accent,
    onClose,
}: {
    jobId: string;
    accent: AccentClasses;
    onClose: () => void;
}) {
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        apiClient
            .get(`/jobs/${jobId}`, { params: { include: "company,requirements" } })
            .then((res: any) => {
                if (!cancelled) setJob(res.data);
            })
            .catch((err: any) => console.error("Failed to fetch job detail:", err))
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [jobId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="flex justify-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-coral animate-pulse" />
                        <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                        <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-dark/50">
                        Loading details...
                    </span>
                </div>
            </div>
        );
    }

    if (!job) return null;

    return <JobDetail job={job} accent={accent} onClose={onClose} />;
}

// ─── Table View ─────────────────────────────────────────────────────────────

function TableView({
    jobs,
    onSelect,
    selectedId,
}: {
    jobs: Job[];
    onSelect: (j: Job) => void;
    selectedId: string | null;
}) {
    const columns = ["", "Title", "Company", "Location", "Salary", "Status", "Type", "Posted"];

    return (
        <div className="overflow-x-auto border-4 border-dark">
            <table className="w-full" style={{ minWidth: 800 }}>
                <thead>
                    <tr className="bg-dark">
                        {columns.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${i === 0 ? "w-8" : ""} ${accentAt(i).text}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job, idx) => {
                        const ac = accentAt(idx);
                        const isSelected = selectedId === job.id;
                        return (
                            <Fragment key={job.id}>
                                <tr
                                    onClick={() => onSelect(job)}
                                    className={`cursor-pointer transition-colors border-l-4 ${
                                        isSelected
                                            ? `${ac.bgLight} ${ac.border}`
                                            : `border-transparent ${idx % 2 === 0 ? "bg-white" : "bg-cream"}`
                                    }`}
                                >
                                    <td className="px-4 py-3 w-8">
                                        <i
                                            className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-[10px] transition-transform ${isSelected ? ac.text : "text-dark/40"}`}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {isNew(job) && (
                                                <i className="fa-duotone fa-regular fa-sparkles text-[10px] text-yellow" />
                                            )}
                                            <span className="font-bold text-sm text-dark">
                                                {job.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={`px-4 py-3 text-sm font-semibold ${ac.text}`}>
                                        {getCompanyName(job)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-dark/70">
                                        {job.location || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-dark">
                                        {salaryDisplay(job) || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge color={statusAccent(job.status) === ACCENT[1] ? "teal" : statusAccent(job.status) === ACCENT[0] ? "coral" : statusAccent(job.status) === ACCENT[2] ? "yellow" : "purple"}>
                                            {formatStatus(job.status)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-dark">
                                        {formatEmploymentType(job.employment_type)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-dark/60">
                                        {postedAgo(job)}
                                    </td>
                                </tr>
                                {isSelected && (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className={`p-0 bg-white border-t-4 border-b-4 ${ac.border}`}
                                        >
                                            <DetailLoader
                                                jobId={job.id}
                                                accent={ac}
                                                onClose={() => onSelect(job)}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Grid View ──────────────────────────────────────────────────────────────

function GridView({
    jobs,
    onSelect,
    selectedId,
}: {
    jobs: Job[];
    onSelect: (j: Job) => void;
    selectedId: string | null;
}) {
    const selectedJob = jobs.find((j) => j.id === selectedId);
    const selectedAc = selectedJob
        ? accentAt(jobs.indexOf(selectedJob))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            {/* Cards Grid */}
            <div
                className={`grid gap-4 ${
                    selectedJob
                        ? "w-1/2 grid-cols-1 lg:grid-cols-2"
                        : "w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
            >
                {jobs.map((job, idx) => {
                    const ac = accentAt(idx);
                    const isSelected = selectedId === job.id;
                    return (
                        <div
                            key={job.id}
                            onClick={() => onSelect(job)}
                            className={`cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative bg-white ${
                                isSelected ? ac.border : "border-dark/30"
                            }`}
                        >
                            {/* Corner accent */}
                            <div
                                className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`}
                            />

                            {isNew(job) && (
                                <Badge color="yellow" className="mb-2">
                                    <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                                    New
                                </Badge>
                            )}

                            <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark">
                                {job.title}
                            </h3>
                            <div className={`text-sm font-bold mb-2 ${ac.text}`}>
                                {getCompanyName(job)}
                            </div>

                            {job.location && (
                                <div className="flex items-center gap-1 text-xs mb-3 text-dark/60">
                                    <i className="fa-duotone fa-regular fa-location-dot" />
                                    {job.location}
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-black text-dark">
                                    {salaryDisplay(job) || "Competitive"}
                                </span>
                                <Badge color={statusAccent(job.status) === ACCENT[1] ? "teal" : statusAccent(job.status) === ACCENT[0] ? "coral" : statusAccent(job.status) === ACCENT[2] ? "yellow" : "purple"}>
                                    {formatStatus(job.status)}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {job.employment_type && (
                                    <Badge color={accentAt(0) === ac ? "teal" : "coral"} variant="outline" className="text-[10px]">
                                        {formatEmploymentType(job.employment_type)}
                                    </Badge>
                                )}
                                {job.job_level && (
                                    <Badge color="purple" variant="outline" className="text-[10px]">
                                        {formatJobLevel(job.job_level)}
                                    </Badge>
                                )}
                            </div>

                            {/* Company footer */}
                            <div className={`flex items-center gap-3 mt-3 pt-3 border-t-2 ${ac.border}/30`}>
                                {job.company?.logo_url ? (
                                    <img
                                        src={job.company.logo_url}
                                        alt={getCompanyName(job)}
                                        className={`w-7 h-7 object-cover border-2 ${ac.border}`}
                                    />
                                ) : (
                                    <div
                                        className={`w-7 h-7 flex items-center justify-center border-2 ${ac.border} bg-cream text-[10px] font-bold text-dark`}
                                    >
                                        {getCompanyInitials(getCompanyName(job))}
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs font-bold text-dark">
                                        {getCompanyName(job)}
                                    </div>
                                    {getCompanyIndustry(job) && (
                                        <div className="text-[10px] text-dark/50">
                                            {getCompanyIndustry(job)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Sidebar */}
            {selectedJob && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 sticky top-4 self-start bg-white ${selectedAc.border}`}
                    style={{ maxHeight: "calc(100vh - 2rem)" }}
                >
                    <DetailLoader
                        jobId={selectedJob.id}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedJob)}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Split View ─────────────────────────────────────────────────────────────

function SplitView({
    jobs,
    onSelect,
    selectedId,
}: {
    jobs: Job[];
    onSelect: (j: Job) => void;
    selectedId: string | null;
}) {
    const selectedJob = jobs.find((j) => j.id === selectedId);
    const selectedAc = selectedJob
        ? accentAt(jobs.indexOf(selectedJob))
        : ACCENT[0];

    return (
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div
                className="w-2/5 overflow-y-auto border-r-4 border-dark"
                style={{ maxHeight: "calc(100vh - 16rem)" }}
            >
                {jobs.map((job, idx) => {
                    const ac = accentAt(idx);
                    const isSelected = selectedId === job.id;
                    return (
                        <div
                            key={job.id}
                            onClick={() => onSelect(job)}
                            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                                isSelected
                                    ? `${ac.bgLight} ${ac.border}`
                                    : "bg-white border-transparent"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    {isNew(job) && (
                                        <i className="fa-duotone fa-regular fa-sparkles text-[10px] flex-shrink-0 text-yellow" />
                                    )}
                                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                                        {job.title}
                                    </h4>
                                </div>
                                <span className="text-[10px] font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                                    {postedAgo(job)}
                                </span>
                            </div>
                            <div className={`text-xs font-bold mb-1 ${ac.text}`}>
                                {getCompanyName(job)}
                            </div>
                            <div className="flex items-center justify-between">
                                {job.location && (
                                    <span className="text-[11px] text-dark/50">
                                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                        {job.location}
                                    </span>
                                )}
                                <Badge color={statusAccent(job.status) === ACCENT[1] ? "teal" : statusAccent(job.status) === ACCENT[0] ? "coral" : statusAccent(job.status) === ACCENT[2] ? "yellow" : "purple"} className="text-[9px]">
                                    {formatStatus(job.status)}
                                </Badge>
                            </div>
                            <div className="text-xs font-bold mt-1 text-dark/70">
                                {salaryDisplay(job) || "Competitive"}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden bg-white">
                {selectedJob ? (
                    <DetailLoader jobId={selectedJob.id} accent={selectedAc} onClose={() => onSelect(selectedJob)} />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Job
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a listing on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Inner Component (uses useSearchParams via useStandardList) ──────────────

function JobsPageInner() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const {
        data: jobs,
        loading,
        pagination,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        page,
        goToPage,
        total,
        totalPages,
    } = useStandardList<Job, JobFilters>({
        endpoint: "/jobs",
        defaultFilters: { employment_type: undefined },
        defaultSortBy: "updated_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        autoFetch: true,
        requireAuth: false,
        include: "company",
    });

    const handleSelect = useCallback(
        (job: Job) => {
            setSelectedJobId((prev) => (prev === job.id ? null : job.id));
        },
        [],
    );

    const stats = useMemo(
        () => ({
            total: pagination?.total || jobs.length,
            active: jobs.filter((j) => j.status === "active").length,
            newJobs: jobs.filter((j) => isNew(j)).length,
            remote: jobs.filter((j) => j.commute_types?.includes("remote")).length,
        }),
        [jobs, pagination],
    );

    return (
        <ListsSixAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HEADER
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden py-16 bg-dark">
                {/* Memphis shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[4%] w-20 h-20 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[50%] right-[6%] w-16 h-16 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[10%] left-[12%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[20%] right-[18%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[25%] right-[30%] w-20 h-8 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[22%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[15%] right-[42%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="header-badge inline-block mb-6 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-briefcase" />
                                Job Listings
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-white opacity-0">
                            Browse{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">Open Roles</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-white/70 opacity-0">
                            Explore opportunities from top companies. Split-fee
                            recruiting, made transparent.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {[
                                { label: "Total Jobs", value: stats.total, accent: ACCENT[0] },
                                { label: "Active", value: stats.active, accent: ACCENT[1] },
                                { label: "New", value: stats.newJobs, accent: ACCENT[2] },
                                { label: "Remote", value: stats.remote, accent: ACCENT[3] },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className={`stat-pill flex items-center gap-2 px-4 py-2 border-2 opacity-0 ${stat.accent.border}`}
                                >
                                    <span className={`text-lg font-black ${stat.accent.text}`}>
                                        {stat.value}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CONTROLS + CONTENT
               ══════════════════════════════════════════════════════════════ */}
            <section className="min-h-screen bg-cream">
                <div className="py-8 px-4 lg:px-8 max-w-7xl mx-auto">
                    {/* Controls Bar */}
                    <div className="controls-bar flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8 p-4 border-4 border-dark bg-white opacity-0">
                        {/* Search */}
                        <div className="flex-1 flex items-center gap-2 px-3 py-2 border-2 border-dark/30">
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-sm text-coral" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search jobs, companies, locations..."
                                className="flex-1 bg-transparent outline-none text-sm font-semibold text-dark placeholder:text-dark/40"
                            />
                            {searchInput && (
                                <button
                                    onClick={clearSearch}
                                    className="text-xs font-bold uppercase text-coral"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Employment type filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                                Type:
                            </span>
                            <select
                                value={filters.employment_type || ""}
                                onChange={(e) =>
                                    setFilter(
                                        "employment_type",
                                        e.target.value || undefined,
                                    )
                                }
                                className="px-3 py-2 text-xs font-bold uppercase border-2 border-teal bg-transparent outline-none cursor-pointer text-dark"
                            >
                                <option value="">All</option>
                                {EMPLOYMENT_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View mode toggles */}
                        <div className="flex items-center border-2 border-dark">
                            {(
                                [
                                    {
                                        mode: "table" as ViewMode,
                                        icon: "fa-duotone fa-regular fa-table-list",
                                        label: "Table",
                                    },
                                    {
                                        mode: "grid" as ViewMode,
                                        icon: "fa-duotone fa-regular fa-grid-2",
                                        label: "Grid",
                                    },
                                    {
                                        mode: "split" as ViewMode,
                                        icon: "fa-duotone fa-regular fa-table-columns",
                                        label: "Split",
                                    },
                                ] as const
                            ).map(({ mode, icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => {
                                        setViewMode(mode);
                                        setSelectedJobId(null);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        viewMode === mode
                                            ? "bg-dark text-yellow"
                                            : "bg-transparent text-dark"
                                    }`}
                                >
                                    <i className={icon} />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-dark/50">
                            Showing {jobs.length} of {total} listings
                            {page > 1 && ` (page ${page})`}
                        </span>
                        {searchInput && (
                            <span className="text-xs font-bold uppercase tracking-wider text-coral">
                                Filtered by: &ldquo;{searchInput}&rdquo;
                            </span>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="listings-content opacity-0">
                        {loading && jobs.length === 0 ? (
                            <div className="text-center py-20 border-4 border-dark/20 bg-white">
                                <div className="flex justify-center gap-3 mb-6">
                                    <div className="w-8 h-8 rotate-12 bg-coral animate-pulse" />
                                    <div className="w-8 h-8 rounded-full bg-teal animate-pulse" />
                                    <div className="w-8 h-8 rotate-45 bg-yellow animate-pulse" />
                                </div>
                                <h3 className="font-black text-2xl uppercase tracking-tight mb-2 text-dark">
                                    Loading Jobs...
                                </h3>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-20 border-4 border-dark/20 bg-white">
                                <div className="flex justify-center gap-3 mb-6">
                                    <div className="w-8 h-8 rotate-12 bg-coral" />
                                    <div className="w-8 h-8 rounded-full bg-teal" />
                                    <div className="w-8 h-8 rotate-45 bg-yellow" />
                                </div>
                                <h3 className="font-black text-2xl uppercase tracking-tight mb-2 text-dark">
                                    No Jobs Found
                                </h3>
                                <p className="text-sm mb-4 text-dark/50">
                                    Try adjusting your search or filters
                                </p>
                                <button
                                    onClick={() => {
                                        clearSearch();
                                        setFilter("employment_type", undefined);
                                    }}
                                    className="px-6 py-2 text-sm font-bold uppercase tracking-wider border-4 border-coral text-coral transition-transform hover:-translate-y-1"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                {viewMode === "table" && (
                                    <TableView
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                    />
                                )}
                                {viewMode === "split" && (
                                    <SplitView
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8 p-4 border-4 border-dark bg-white">
                            <span className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page <= 1}
                                    className="w-8 h-8 flex items-center justify-center border-2 border-dark text-dark disabled:opacity-30"
                                >
                                    <i className="fa-solid fa-chevron-left text-xs" />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 7) }).map(
                                    (_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 7) {
                                            pageNum = i + 1;
                                        } else if (page <= 4) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 3) {
                                            pageNum = totalPages - 6 + i;
                                        } else {
                                            pageNum = page - 3 + i;
                                        }
                                        const ac = accentAt(i);
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => goToPage(pageNum)}
                                                className={`w-8 h-8 flex items-center justify-center border-2 text-xs font-black ${
                                                    page === pageNum
                                                        ? `${ac.border} ${ac.bg} ${ac.textOnBg}`
                                                        : "border-dark text-dark"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    },
                                )}
                                <button
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="w-8 h-8 flex items-center justify-center border-2 border-dark text-dark disabled:opacity-30"
                                >
                                    <i className="fa-solid fa-chevron-right text-xs" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </ListsSixAnimator>
    );
}

// ─── Loading Fallback ───────────────────────────────────────────────────────

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 bg-coral mx-auto mb-4 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-briefcase text-2xl text-white animate-pulse"></i>
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-dark mb-2">
                    Loading Jobs
                </h2>
                <p className="text-dark/60 text-sm">
                    Finding the best opportunities for you...
                </p>
            </div>
        </div>
    );
}

// ─── Main Page Component (wrapped in Suspense) ──────────────────────────────

/**
 * Jobs Page - Browse available job opportunities
 * 
 * Wrapped in Suspense for useSearchParams compatibility with Next.js 16.
 */
export default function JobsPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <JobsPageInner />
        </Suspense>
    );
}
