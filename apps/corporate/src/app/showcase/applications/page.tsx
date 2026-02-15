"use client";

import { useState, useMemo, Fragment } from "react";
import { mockApplications } from "@/data/mock-applications";
import type { ApplicationListing } from "@/types/application-listing";
import { ApplicationsAnimator } from "./applications-animator";

// ─── Memphis Color Palette ──────────────────────────────────────────────────
const COLORS = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    dark: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
};

const ACCENT_CYCLE = [COLORS.coral, COLORS.teal, COLORS.yellow, COLORS.purple];

type ViewMode = "table" | "grid" | "gmail";

// ─── Sidebar Navigation ────────────────────────────────────────────────────

const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", icon: "fa-duotone fa-regular fa-grid-2-plus", color: COLORS.coral },
    { key: "roles", label: "Roles", icon: "fa-duotone fa-regular fa-briefcase", color: COLORS.teal },
    { key: "recruiters", label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie", color: COLORS.purple },
    { key: "candidates", label: "Candidates", icon: "fa-duotone fa-regular fa-users", color: COLORS.coral },
    { key: "companies", label: "Companies", icon: "fa-duotone fa-regular fa-building", color: COLORS.yellow },
    { key: "applications", label: "Applications", icon: "fa-duotone fa-regular fa-file-lines", color: COLORS.teal },
    { key: "messages", label: "Messages", icon: "fa-duotone fa-regular fa-comments", color: COLORS.purple },
    { key: "placements", label: "Placements", icon: "fa-duotone fa-regular fa-handshake", color: COLORS.coral },
] as const;

const ACTIVE_NAV = "applications";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatSalary(salary: ApplicationListing["salary"]) {
    const fmt = (n: number) =>
        n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
    return `${salary.currency} ${fmt(salary.min)} - ${fmt(salary.max)}`;
}

function statusColor(status: ApplicationListing["status"]) {
    switch (status) {
        case "submitted": return COLORS.purple;
        case "screening": return COLORS.yellow;
        case "interviewing": return COLORS.teal;
        case "offered": return COLORS.coral;
        case "placed": return COLORS.teal;
        case "rejected": return COLORS.coral;
        case "withdrawn": return COLORS.purple;
    }
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function daysInPipeline(appliedDate: string) {
    const diff = Date.now() - new Date(appliedDate).getTime();
    return Math.floor(diff / 86400000);
}

function matchScoreColor(score: number) {
    if (score >= 90) return COLORS.teal;
    if (score >= 75) return COLORS.yellow;
    if (score >= 60) return COLORS.coral;
    return COLORS.purple;
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function ApplicationDetail({ app, accent, onClose }: { app: ApplicationListing; accent: string; onClose?: () => void }) {
    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b-4" style={{ borderColor: accent }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={app.candidateAvatar} alt={app.candidateName}
                                className="w-14 h-14 object-cover border-3" style={{ borderColor: accent }} />
                            <div>
                                {app.featured && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                                        style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                        <i className="fa-duotone fa-regular fa-fire"></i>
                                        Hot Candidate
                                    </span>
                                )}
                                <h2 className="text-2xl font-black uppercase tracking-tight leading-tight"
                                    style={{ color: COLORS.dark }}>
                                    {app.candidateName}
                                </h2>
                                <div className="text-sm font-semibold" style={{ color: COLORS.dark, opacity: 0.7 }}>
                                    {app.candidateTitle}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="font-bold" style={{ color: accent }}>{app.company}</span>
                            <span style={{ color: COLORS.dark, opacity: 0.5 }}>|</span>
                            <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                                <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                {app.location}
                            </span>
                            <span style={{ color: COLORS.dark, opacity: 0.5 }}>|</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                style={{ backgroundColor: matchScoreColor(app.matchScore), color: matchScoreColor(app.matchScore) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                {app.matchScore}% Match
                            </span>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-sm border-2 transition-transform hover:-translate-y-0.5"
                            style={{ borderColor: accent, color: accent }}>
                            <i className="fa-duotone fa-regular fa-xmark"></i>
                        </button>
                    )}
                </div>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                        style={{ borderColor: statusColor(app.status), color: statusColor(app.status) }}>
                        {app.status}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                        style={{ borderColor: COLORS.dark, color: COLORS.dark, opacity: 0.6 }}>
                        {app.source.replace("_", " ")}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                        style={{ borderColor: COLORS.dark, color: COLORS.dark, opacity: 0.6 }}>
                        {app.stage}
                    </span>
                </div>
            </div>

            {/* Salary & Stats */}
            <div className="grid grid-cols-3 border-b-4" style={{ borderColor: accent }}>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{formatSalary(app.salary)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Salary Range</div>
                </div>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{app.matchScore}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Match Score</div>
                </div>
                <div className="p-4 text-center">
                    <div className="text-lg font-black" style={{ color: accent }}>{daysInPipeline(app.appliedDate)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Days in Pipeline</div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Job Details */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-briefcase"></i>
                        </span>
                        Job Details
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.dark, opacity: 0.75 }}>
                            <i className="fa-duotone fa-regular fa-chevron-right text-[10px] flex-shrink-0"
                                style={{ color: COLORS.coral }}></i>
                            <span className="font-bold">Role:</span> {app.jobTitle}
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.dark, opacity: 0.75 }}>
                            <i className="fa-duotone fa-regular fa-chevron-right text-[10px] flex-shrink-0"
                                style={{ color: COLORS.coral }}></i>
                            <span className="font-bold">Company:</span> {app.company}
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.dark, opacity: 0.75 }}>
                            <i className="fa-duotone fa-regular fa-chevron-right text-[10px] flex-shrink-0"
                                style={{ color: COLORS.coral }}></i>
                            <span className="font-bold">Location:</span> {app.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.dark, opacity: 0.75 }}>
                            <i className="fa-duotone fa-regular fa-chevron-right text-[10px] flex-shrink-0"
                                style={{ color: COLORS.coral }}></i>
                            <span className="font-bold">Compensation:</span> {formatSalary(app.salary)}
                        </div>
                    </div>
                </div>

                {/* Matched Skills */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.purple, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-tags"></i>
                        </span>
                        Matched Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {app.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                style={{ backgroundColor: ACCENT_CYCLE[i % 4], color: ACCENT_CYCLE[i % 4] === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Interview Stage */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.teal, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-clipboard-list"></i>
                        </span>
                        Interview Stage
                    </h3>
                    <div className="flex items-center gap-2">
                        {["Phone Screen", "Technical", "Onsite", "Final"].map((stage, i) => {
                            const stageOrder = ["Phone Screen", "Technical", "Onsite", "Final"];
                            const currentIdx = stageOrder.indexOf(app.stage);
                            const isComplete = i <= currentIdx;
                            const isCurrent = i === currentIdx;
                            return (
                                <Fragment key={stage}>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-8 h-8 flex items-center justify-center text-[10px] font-black"
                                            style={{
                                                backgroundColor: isComplete ? ACCENT_CYCLE[i % 4] : "transparent",
                                                border: isComplete ? "none" : `2px solid ${COLORS.dark}30`,
                                                color: isComplete ? (ACCENT_CYCLE[i % 4] === COLORS.yellow ? COLORS.dark : COLORS.white) : `${COLORS.dark}40`,
                                            }}>
                                            {isComplete ? (
                                                isCurrent ? <i className="fa-duotone fa-regular fa-circle-dot"></i> : <i className="fa-duotone fa-regular fa-check"></i>
                                            ) : (
                                                <span>{i + 1}</span>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-center"
                                            style={{ color: isCurrent ? ACCENT_CYCLE[i % 4] : `${COLORS.dark}50` }}>
                                            {stage}
                                        </span>
                                    </div>
                                    {i < 3 && (
                                        <div className="flex-1 h-0.5 mt-[-16px]"
                                            style={{ backgroundColor: i < currentIdx ? ACCENT_CYCLE[i % 4] : `${COLORS.dark}20` }} />
                                    )}
                                </Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-note-sticky"></i>
                        </span>
                        Notes
                    </h3>
                    <p className="text-sm leading-relaxed p-3 border-2"
                        style={{ color: COLORS.dark, opacity: 0.8, borderColor: `${COLORS.yellow}60`, backgroundColor: `${COLORS.yellow}10` }}>
                        {app.notes}
                    </p>
                </div>

                {/* Recruiter */}
                <div className="p-4 border-4" style={{ borderColor: accent }}>
                    <h3 className="font-black text-xs uppercase tracking-wider mb-3" style={{ color: COLORS.dark }}>
                        Recruiter
                    </h3>
                    <div className="flex items-center gap-3">
                        <img src={app.recruiter.avatar} alt={app.recruiter.name}
                            className="w-12 h-12 object-cover border-2" style={{ borderColor: accent }} />
                        <div>
                            <div className="font-bold text-sm" style={{ color: COLORS.dark }}>{app.recruiter.name}</div>
                            <div className="text-xs" style={{ color: accent }}>{app.recruiter.agency}</div>
                        </div>
                    </div>
                </div>

                {/* Applied / Last Activity */}
                <div className="mt-4 p-3 border-2 flex items-center gap-2"
                    style={{ borderColor: `${COLORS.coral}60` }}>
                    <i className="fa-duotone fa-regular fa-calendar-clock text-sm" style={{ color: COLORS.coral }}></i>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                        Applied: {new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>

                <div className="mt-2 p-3 border-2 flex items-center gap-2"
                    style={{ borderColor: `${COLORS.purple}60` }}>
                    <i className="fa-duotone fa-regular fa-clock-rotate-left text-sm" style={{ color: COLORS.purple }}></i>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                        Last Activity: {new Date(app.lastActivityDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Table View ─────────────────────────────────────────────────────────────

function TableView({ apps, onSelect, selectedId }: { apps: ApplicationListing[]; onSelect: (a: ApplicationListing) => void; selectedId: string | null }) {
    const columnHeaders = ["", "Candidate", "Job Title", "Company", "Status", "Match", "Stage", "Applied"];
    const colCount = columnHeaders.length;

    return (
        <div className="overflow-x-auto border-4" style={{ borderColor: COLORS.dark }}>
            <table className="w-full" style={{ minWidth: 800 }}>
                <thead>
                    <tr style={{ backgroundColor: COLORS.dark }}>
                        {columnHeaders.map((h, i) => (
                            <th key={i} className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${i === 0 ? "w-8" : ""}`}
                                style={{ color: ACCENT_CYCLE[i % 4] }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {apps.map((app, idx) => {
                        const accent = ACCENT_CYCLE[idx % 4];
                        const isSelected = selectedId === app.id;
                        return (
                            <Fragment key={app.id}>
                                <tr
                                    onClick={() => onSelect(app)}
                                    className="cursor-pointer transition-colors"
                                    style={{
                                        backgroundColor: isSelected ? `${accent}15` : idx % 2 === 0 ? COLORS.white : COLORS.cream,
                                        borderLeft: isSelected ? `4px solid ${accent}` : "4px solid transparent",
                                    }}>
                                    <td className="px-4 py-3 w-8">
                                        <i className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-[10px] transition-transform`}
                                            style={{ color: isSelected ? accent : `${COLORS.dark}40` }}></i>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <img src={app.candidateAvatar} alt={app.candidateName}
                                                className="w-7 h-7 object-cover border-2 flex-shrink-0" style={{ borderColor: accent }} />
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    {app.featured && (
                                                        <i className="fa-duotone fa-regular fa-fire text-[10px]" style={{ color: COLORS.coral }}></i>
                                                    )}
                                                    <span className="font-bold text-sm" style={{ color: COLORS.dark }}>{app.candidateName}</span>
                                                </div>
                                                <div className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>{app.candidateTitle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: accent }}>{app.jobTitle}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.dark, opacity: 0.7 }}>{app.company}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                            style={{ backgroundColor: statusColor(app.status), color: statusColor(app.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${COLORS.dark}15` }}>
                                                <div className="h-full rounded-full" style={{ width: `${app.matchScore}%`, backgroundColor: matchScoreColor(app.matchScore) }} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: matchScoreColor(app.matchScore) }}>{app.matchScore}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold" style={{ color: COLORS.dark }}>{app.stage}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.dark, opacity: 0.6 }}>{timeAgo(app.appliedDate)}</td>
                                </tr>
                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td colSpan={colCount} className="p-0"
                                            style={{ backgroundColor: COLORS.white, borderTop: `4px solid ${accent}`, borderBottom: `4px solid ${accent}` }}>
                                            <ApplicationDetail app={app} accent={accent} onClose={() => onSelect(app)} />
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

function GridView({ apps, onSelect, selectedId }: { apps: ApplicationListing[]; onSelect: (a: ApplicationListing) => void; selectedId: string | null }) {
    const selectedApp = apps.find(a => a.id === selectedId);

    return (
        <div className="flex gap-6">
            {/* Cards Grid */}
            <div className={`grid gap-4 ${selectedApp ? "w-1/2 grid-cols-1 lg:grid-cols-2" : "w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {apps.map((app, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === app.id;
                    return (
                        <div key={app.id}
                            onClick={() => onSelect(app)}
                            className="cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative"
                            style={{
                                borderColor: isSelected ? accent : `${COLORS.dark}30`,
                                backgroundColor: COLORS.white,
                            }}>
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-8 h-8"
                                style={{ backgroundColor: accent }} />

                            {/* Candidate header */}
                            <div className="flex items-center gap-3 mb-3">
                                <img src={app.candidateAvatar} alt={app.candidateName}
                                    className="w-10 h-10 object-cover border-2 flex-shrink-0" style={{ borderColor: accent }} />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                        {app.featured && (
                                            <i className="fa-duotone fa-regular fa-fire text-[10px]" style={{ color: COLORS.coral }}></i>
                                        )}
                                        <h3 className="font-black text-sm uppercase tracking-tight truncate"
                                            style={{ color: COLORS.dark }}>
                                            {app.candidateName}
                                        </h3>
                                    </div>
                                    <div className="text-[10px] truncate" style={{ color: COLORS.dark, opacity: 0.5 }}>{app.candidateTitle}</div>
                                </div>
                            </div>

                            <div className="text-sm font-bold mb-1" style={{ color: accent }}>{app.jobTitle}</div>

                            <div className="flex items-center gap-1 text-xs mb-3" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                <i className="fa-duotone fa-regular fa-building"></i>
                                {app.company}
                            </div>

                            {/* Match Score Bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                        Match
                                    </span>
                                    <span className="text-xs font-black" style={{ color: matchScoreColor(app.matchScore) }}>
                                        {app.matchScore}%
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${COLORS.dark}10` }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${app.matchScore}%`, backgroundColor: matchScoreColor(app.matchScore) }} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(app.status), color: statusColor(app.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {app.status}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                    {app.stage}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {app.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                        style={{ borderColor: `${ACCENT_CYCLE[i % 4]}60`, color: ACCENT_CYCLE[i % 4] }}>
                                        {tag}
                                    </span>
                                ))}
                                {app.tags.length > 3 && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold"
                                        style={{ color: COLORS.dark, opacity: 0.4 }}>
                                        +{app.tags.length - 3}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: `2px solid ${accent}30` }}>
                                <img src={app.recruiter.avatar} alt={app.recruiter.name}
                                    className="w-7 h-7 object-cover border-2" style={{ borderColor: accent }} />
                                <div>
                                    <div className="text-xs font-bold" style={{ color: COLORS.dark }}>{app.recruiter.name}</div>
                                    <div className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>{app.recruiter.agency}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Sidebar */}
            {selectedApp && (
                <div className="w-1/2 border-4 flex-shrink-0 sticky top-4 self-start"
                    style={{ borderColor: ACCENT_CYCLE[apps.indexOf(selectedApp) % 4], backgroundColor: COLORS.white, maxHeight: "calc(100vh - 2rem)" }}>
                    <ApplicationDetail app={selectedApp} accent={ACCENT_CYCLE[apps.indexOf(selectedApp) % 4]} onClose={() => onSelect(selectedApp)} />
                </div>
            )}
        </div>
    );
}

// ─── Gmail View ─────────────────────────────────────────────────────────────

function GmailView({ apps, onSelect, selectedId }: { apps: ApplicationListing[]; onSelect: (a: ApplicationListing) => void; selectedId: string | null }) {
    const selectedApp = apps.find(a => a.id === selectedId);

    return (
        <div className="flex gap-0 border-4" style={{ borderColor: COLORS.dark, minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 overflow-y-auto border-r-4" style={{ borderColor: COLORS.dark, maxHeight: "calc(100vh - 16rem)" }}>
                {apps.map((app, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === app.id;
                    return (
                        <div key={app.id}
                            onClick={() => onSelect(app)}
                            className="cursor-pointer p-4 transition-colors"
                            style={{
                                backgroundColor: isSelected ? `${accent}15` : COLORS.white,
                                borderBottom: `2px solid ${COLORS.dark}15`,
                                borderLeft: isSelected ? `4px solid ${accent}` : "4px solid transparent",
                            }}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <img src={app.candidateAvatar} alt={app.candidateName}
                                        className="w-7 h-7 object-cover border-2 flex-shrink-0" style={{ borderColor: accent }} />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                            {app.featured && (
                                                <i className="fa-duotone fa-regular fa-fire text-[10px] flex-shrink-0" style={{ color: COLORS.coral }}></i>
                                            )}
                                            <h4 className="font-black text-sm uppercase tracking-tight truncate"
                                                style={{ color: COLORS.dark }}>
                                                {app.candidateName}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold flex-shrink-0 whitespace-nowrap"
                                    style={{ color: COLORS.dark, opacity: 0.4 }}>
                                    {timeAgo(app.appliedDate)}
                                </span>
                            </div>
                            <div className="text-xs font-bold mb-1 ml-9" style={{ color: accent }}>{app.jobTitle}</div>
                            <div className="flex items-center justify-between ml-9">
                                <span className="text-[11px]" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                    <i className="fa-duotone fa-regular fa-building mr-1"></i>
                                    {app.company}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(app.status), color: statusColor(app.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {app.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 ml-9 mt-1">
                                <div className="w-10 h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${COLORS.dark}15` }}>
                                    <div className="h-full rounded-full" style={{ width: `${app.matchScore}%`, backgroundColor: matchScoreColor(app.matchScore) }} />
                                </div>
                                <span className="text-[10px] font-bold" style={{ color: matchScoreColor(app.matchScore) }}>{app.matchScore}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden" style={{ backgroundColor: COLORS.white }}>
                {selectedApp ? (
                    <ApplicationDetail app={selectedApp} accent={ACCENT_CYCLE[apps.indexOf(selectedApp) % 4]} />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            {/* Memphis decoration */}
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                <div className="w-8 h-8 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2" style={{ color: COLORS.dark }}>
                                Select an Application
                            </h3>
                            <p className="text-sm" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                Click a candidate on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sourceFilter, setSourceFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filteredApps = useMemo(() => {
        return mockApplications.filter(app => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const match = app.candidateName.toLowerCase().includes(q)
                    || app.jobTitle.toLowerCase().includes(q)
                    || app.company.toLowerCase().includes(q)
                    || app.candidateTitle.toLowerCase().includes(q)
                    || app.tags.some(t => t.toLowerCase().includes(q));
                if (!match) return false;
            }
            if (statusFilter !== "all" && app.status !== statusFilter) return false;
            if (sourceFilter !== "all" && app.source !== sourceFilter) return false;
            return true;
        });
    }, [searchQuery, statusFilter, sourceFilter]);

    const handleSelect = (app: ApplicationListing) => {
        setSelectedAppId(prev => prev === app.id ? null : app.id);
    };

    const stats = {
        total: mockApplications.length,
        interviewing: mockApplications.filter(a => a.status === "interviewing").length,
        offered: mockApplications.filter(a => a.status === "offered").length,
        hot: mockApplications.filter(a => a.featured).length,
    };

    return (
        <ApplicationsAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HEADER - Memphis style
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden py-16" style={{ backgroundColor: COLORS.dark }}>
                {/* Memphis shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[4%] w-20 h-20 rounded-full border-[5px] opacity-0"
                        style={{ borderColor: COLORS.coral }} />
                    <div className="memphis-shape absolute top-[50%] right-[6%] w-16 h-16 rounded-full opacity-0"
                        style={{ backgroundColor: COLORS.teal }} />
                    <div className="memphis-shape absolute bottom-[10%] left-[12%] w-10 h-10 rounded-full opacity-0"
                        style={{ backgroundColor: COLORS.yellow }} />
                    <div className="memphis-shape absolute top-[20%] right-[18%] w-14 h-14 rotate-12 opacity-0"
                        style={{ backgroundColor: COLORS.purple }} />
                    <div className="memphis-shape absolute bottom-[25%] right-[30%] w-20 h-8 -rotate-6 border-[3px] opacity-0"
                        style={{ borderColor: COLORS.coral }} />
                    <div className="memphis-shape absolute top-[40%] left-[22%] w-10 h-10 rotate-45 opacity-0"
                        style={{ backgroundColor: COLORS.coral }} />
                    {/* Triangle */}
                    <div className="memphis-shape absolute top-[15%] left-[45%] opacity-0"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "20px solid transparent",
                            borderRight: "20px solid transparent",
                            borderBottom: "35px solid #FFE66D",
                            transform: "rotate(-12deg)",
                        }} />
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[15%] right-[42%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag */}
                    <svg className="memphis-shape absolute top-[65%] left-[35%] opacity-0" width="80" height="25" viewBox="0 0 80 25">
                        <polyline points="0,20 10,5 20,20 30,5 40,20 50,5 60,20 70,5 80,20"
                            fill="none" stroke={COLORS.purple} strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[60%] left-[7%] opacity-0" width="25" height="25" viewBox="0 0 25 25">
                        <line x1="12.5" y1="2" x2="12.5" y2="23" stroke={COLORS.yellow} strokeWidth="3" strokeLinecap="round" />
                        <line x1="2" y1="12.5" x2="23" y2="12.5" stroke={COLORS.yellow} strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="header-badge inline-block mb-6 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em]"
                                style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                                <i className="fa-duotone fa-regular fa-file-lines"></i>
                                Applications
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0"
                            style={{ color: COLORS.white }}>
                            Candidate{" "}
                            <span className="relative inline-block">
                                <span style={{ color: COLORS.coral }}>Pipeline</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: COLORS.coral }} />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-0"
                            style={{ color: COLORS.white, opacity: 0.7 }}>
                            Track every application from submission to placement.
                            AI-powered matching, transparent split-fees.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {[
                                { label: "Total", value: stats.total, color: COLORS.coral },
                                { label: "Interviewing", value: stats.interviewing, color: COLORS.teal },
                                { label: "Offered", value: stats.offered, color: COLORS.yellow },
                                { label: "Hot Candidates", value: stats.hot, color: COLORS.purple },
                            ].map((stat, i) => (
                                <div key={i} className="stat-pill flex items-center gap-2 px-4 py-2 border-2 opacity-0"
                                    style={{ borderColor: stat.color }}>
                                    <span className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${COLORS.white}80` }}>
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SIDEBAR + CONTROLS + CONTENT
               ══════════════════════════════════════════════════════════════ */}
            <section className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
                <div className="flex relative">
                    {/* ── Mobile sidebar overlay ── */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                            style={{ backgroundColor: "rgba(26,26,46,0.5)" }} />
                    )}

                    {/* ── Sidebar ── */}
                    <aside
                        className={`
                            sidebar-nav
                            fixed lg:sticky top-0 left-0 z-50 lg:z-auto
                            h-screen lg:h-auto
                            w-64 lg:w-56 flex-shrink-0
                            border-r-4 overflow-y-auto
                            transition-transform duration-300
                            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                        `}
                        style={{ backgroundColor: COLORS.dark, borderColor: `${COLORS.white}15` }}>

                        {/* Sidebar header */}
                        <div className="p-5 border-b-2" style={{ borderColor: `${COLORS.white}15` }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 flex items-center justify-center"
                                        style={{ backgroundColor: COLORS.coral }}>
                                        <i className="fa-duotone fa-regular fa-bolt text-sm" style={{ color: COLORS.white }}></i>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: COLORS.white }}>
                                        Splits
                                    </span>
                                </div>
                                {/* Close button (mobile only) */}
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="lg:hidden w-7 h-7 flex items-center justify-center border-2"
                                    style={{ borderColor: `${COLORS.white}40`, color: COLORS.white }}>
                                    <i className="fa-duotone fa-regular fa-xmark text-xs"></i>
                                </button>
                            </div>
                        </div>

                        {/* Nav items */}
                        <nav className="p-3 space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = item.key === ACTIVE_NAV;
                                return (
                                    <button key={item.key}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-transform hover:-translate-y-0.5"
                                        style={{
                                            backgroundColor: isActive ? `${item.color}20` : "transparent",
                                            borderLeft: isActive ? `4px solid ${item.color}` : "4px solid transparent",
                                        }}>
                                        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: isActive ? item.color : "transparent",
                                                border: isActive ? "none" : `2px solid ${COLORS.white}25`,
                                            }}>
                                            <i className={`${item.icon} text-xs`}
                                                style={{ color: isActive ? (item.color === COLORS.yellow ? COLORS.dark : COLORS.white) : `${COLORS.white}60` }}></i>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: isActive ? item.color : `${COLORS.white}60` }}>
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Sidebar footer decoration */}
                        <div className="mt-auto p-5 border-t-2" style={{ borderColor: `${COLORS.white}10` }}>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                <div className="w-4 h-4 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                                <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: COLORS.purple }} />
                            </div>
                        </div>
                    </aside>

                    {/* ── Main Content ── */}
                    <div className="flex-1 min-w-0 py-8">
                        <div className="px-4 lg:px-8">
                            {/* Mobile sidebar toggle */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 border-4 text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                                style={{ borderColor: COLORS.dark, backgroundColor: COLORS.white, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-bars"></i>
                                Menu
                            </button>

                            {/* Controls Bar */}
                            <div className="controls-bar flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8 p-4 border-4 opacity-0"
                                style={{ borderColor: COLORS.dark, backgroundColor: COLORS.white }}>
                                {/* Search */}
                                <div className="flex-1 flex items-center gap-2 px-3 py-2 border-2"
                                    style={{ borderColor: `${COLORS.dark}30` }}>
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-sm" style={{ color: COLORS.coral }}></i>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search candidates, jobs, skills..."
                                        className="flex-1 bg-transparent outline-none text-sm font-semibold placeholder-current"
                                        style={{ color: COLORS.dark }}
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery("")}
                                            className="text-xs font-bold uppercase" style={{ color: COLORS.coral }}>
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Status filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Status:</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-2 text-xs font-bold uppercase border-2 bg-transparent outline-none cursor-pointer"
                                        style={{ borderColor: COLORS.teal, color: COLORS.dark }}>
                                        <option value="all">All</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="screening">Screening</option>
                                        <option value="interviewing">Interviewing</option>
                                        <option value="offered">Offered</option>
                                        <option value="placed">Placed</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="withdrawn">Withdrawn</option>
                                    </select>
                                </div>

                                {/* Source filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Source:</span>
                                    <select
                                        value={sourceFilter}
                                        onChange={(e) => setSourceFilter(e.target.value)}
                                        className="px-3 py-2 text-xs font-bold uppercase border-2 bg-transparent outline-none cursor-pointer"
                                        style={{ borderColor: COLORS.purple, color: COLORS.dark }}>
                                        <option value="all">All</option>
                                        <option value="direct">Direct</option>
                                        <option value="referral">Referral</option>
                                        <option value="recruiter_submit">Recruiter Submit</option>
                                        <option value="marketplace">Marketplace</option>
                                    </select>
                                </div>

                                {/* View mode toggles */}
                                <div className="flex items-center border-2" style={{ borderColor: COLORS.dark }}>
                                    {([
                                        { mode: "table" as ViewMode, icon: "fa-duotone fa-regular fa-table-list", label: "Table" },
                                        { mode: "grid" as ViewMode, icon: "fa-duotone fa-regular fa-grid-2", label: "Grid" },
                                        { mode: "gmail" as ViewMode, icon: "fa-duotone fa-regular fa-table-columns", label: "Split" },
                                    ]).map(({ mode, icon, label }) => (
                                        <button key={mode}
                                            onClick={() => { setViewMode(mode); setSelectedAppId(null); }}
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                                            style={{
                                                backgroundColor: viewMode === mode ? COLORS.dark : "transparent",
                                                color: viewMode === mode ? COLORS.yellow : COLORS.dark,
                                            }}>
                                            <i className={icon}></i>
                                            <span className="hidden sm:inline">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Results count */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                    Showing {filteredApps.length} of {mockApplications.length} applications
                                </span>
                                {searchQuery && (
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.coral }}>
                                        Filtered by: &ldquo;{searchQuery}&rdquo;
                                    </span>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="listings-content opacity-0">
                                {filteredApps.length === 0 ? (
                                    <div className="text-center py-20 border-4" style={{ borderColor: `${COLORS.dark}20`, backgroundColor: COLORS.white }}>
                                        <div className="flex justify-center gap-3 mb-6">
                                            <div className="w-8 h-8 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                            <div className="w-8 h-8 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                                        </div>
                                        <h3 className="font-black text-2xl uppercase tracking-tight mb-2" style={{ color: COLORS.dark }}>
                                            No Applications Found
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                            Try adjusting your search or filters
                                        </p>
                                        <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setSourceFilter("all"); }}
                                            className="px-6 py-2 text-sm font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                            style={{ borderColor: COLORS.coral, color: COLORS.coral }}>
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {viewMode === "table" && (
                                            <TableView apps={filteredApps} onSelect={handleSelect} selectedId={selectedAppId} />
                                        )}
                                        {viewMode === "grid" && (
                                            <GridView apps={filteredApps} onSelect={handleSelect} selectedId={selectedAppId} />
                                        )}
                                        {viewMode === "gmail" && (
                                            <GmailView apps={filteredApps} onSelect={handleSelect} selectedId={selectedAppId} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </ApplicationsAnimator>
    );
}
