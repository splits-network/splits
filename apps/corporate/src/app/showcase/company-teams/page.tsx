"use client";

import { useState, useMemo, Fragment } from "react";
import { mockCompanyTeams } from "@/data/mock-company-teams";
import type { CompanyTeamListing, TeamStatus } from "@/types/company-team-listing";
import { CompanyTeamsAnimator } from "./company-teams-animator";

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

const ACTIVE_NAV = "companies";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBudget(amount: number, currency: string) {
    if (amount >= 1000000) return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${currency} ${Math.round(amount / 1000)}K`;
    return `${currency} ${amount}`;
}

function budgetUtilization(budget: CompanyTeamListing["budget"]) {
    if (budget.allocated === 0) return 0;
    return Math.round((budget.spent / budget.allocated) * 100);
}

function statusColor(status: TeamStatus) {
    switch (status) {
        case "active": return COLORS.teal;
        case "hiring": return COLORS.yellow;
        case "paused": return COLORS.purple;
        case "full": return COLORS.coral;
        case "archived": return COLORS.coral;
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

// ─── Member Avatar Stack ────────────────────────────────────────────────────

function MemberAvatarStack({ members, max = 4, accent }: { members: CompanyTeamListing["members"]; max?: number; accent: string }) {
    const shown = members.slice(0, max);
    const extra = members.length - max;
    return (
        <div className="flex items-center -space-x-2">
            {shown.map((m, i) => (
                <img key={i} src={m.avatar} alt={m.name}
                    className="w-7 h-7 rounded-full object-cover border-2"
                    style={{ borderColor: COLORS.white, zIndex: max - i }}
                    title={m.name} />
            ))}
            {extra > 0 && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                    style={{ backgroundColor: accent, borderColor: COLORS.white, color: accent === COLORS.yellow ? COLORS.dark : COLORS.white, zIndex: 0 }}>
                    +{extra}
                </div>
            )}
        </div>
    );
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function TeamDetail({ team, accent, onClose }: { team: CompanyTeamListing; accent: string; onClose?: () => void }) {
    const util = budgetUtilization(team.budget);
    const goalProgress = team.hiringGoal ? Math.round((team.totalHires / team.hiringGoal) * 100) : null;

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b-4" style={{ borderColor: accent }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {team.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                                style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-star"></i>
                                Featured
                            </span>
                        )}
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2"
                            style={{ color: COLORS.dark }}>
                            {team.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="font-bold" style={{ color: accent }}>{team.company.name}</span>
                            <span style={{ color: COLORS.dark, opacity: 0.5 }}>|</span>
                            <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                                <i className="fa-duotone fa-regular fa-building mr-1"></i>
                                {team.department}
                            </span>
                            <span style={{ color: COLORS.dark, opacity: 0.5 }}>|</span>
                            <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                                <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                {team.company.location}
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
                        style={{ borderColor: statusColor(team.status), color: statusColor(team.status) }}>
                        {team.status}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                        style={{ borderColor: COLORS.dark, color: COLORS.dark, opacity: 0.6 }}>
                        {team.company.industry}
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 border-b-4" style={{ borderColor: accent }}>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{team.openRoles}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Open Roles</div>
                </div>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{team.totalHires}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Total Hires</div>
                </div>
                <div className="p-4 text-center">
                    <div className="text-lg font-black" style={{ color: accent }}>{team.avgTimeToFill}d</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Avg TTF</div>
                </div>
            </div>

            {/* Detail Content */}
            <div className="p-6">
                {/* Description */}
                <p className="text-sm leading-relaxed mb-6" style={{ color: COLORS.dark, opacity: 0.8 }}>
                    {team.description}
                </p>

                {/* Admin Card */}
                <div className="p-4 border-4 mb-6" style={{ borderColor: accent }}>
                    <h3 className="font-black text-xs uppercase tracking-wider mb-3" style={{ color: COLORS.dark }}>
                        Team Admin
                    </h3>
                    <div className="flex items-center gap-3">
                        <img src={team.admin.avatar} alt={team.admin.name}
                            className="w-12 h-12 object-cover border-2" style={{ borderColor: accent }} />
                        <div>
                            <div className="font-bold text-sm" style={{ color: COLORS.dark }}>{team.admin.name}</div>
                            <div className="text-xs" style={{ color: accent }}>{team.admin.title}</div>
                        </div>
                    </div>
                </div>

                {/* Budget */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.teal, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-money-bill-wave"></i>
                        </span>
                        Budget
                    </h3>
                    <div className="flex items-center justify-between text-xs mb-2">
                        <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                            {formatBudget(team.budget.spent, team.budget.currency)} of {formatBudget(team.budget.allocated, team.budget.currency)}
                        </span>
                        <span className="font-bold" style={{ color: util > 80 ? COLORS.coral : COLORS.teal }}>
                            {util}%
                        </span>
                    </div>
                    <div className="w-full h-3 border-2" style={{ borderColor: COLORS.dark }}>
                        <div className="h-full transition-all" style={{
                            width: `${Math.min(util, 100)}%`,
                            backgroundColor: util > 80 ? COLORS.coral : COLORS.teal,
                        }} />
                    </div>
                </div>

                {/* Hiring Goal */}
                {goalProgress !== null && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                            style={{ color: COLORS.dark }}>
                            <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                                style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-bullseye-arrow"></i>
                            </span>
                            Hiring Goal
                        </h3>
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                                {team.totalHires} of {team.hiringGoal} hires
                            </span>
                            <span className="font-bold" style={{ color: goalProgress >= 100 ? COLORS.teal : COLORS.yellow }}>
                                {goalProgress}%
                            </span>
                        </div>
                        <div className="w-full h-3 border-2" style={{ borderColor: COLORS.dark }}>
                            <div className="h-full transition-all" style={{
                                width: `${Math.min(goalProgress, 100)}%`,
                                backgroundColor: goalProgress >= 100 ? COLORS.teal : COLORS.yellow,
                            }} />
                        </div>
                    </div>
                )}

                {/* Recruiters Assigned */}
                <div className="mb-6 p-3 border-2 flex items-center gap-2"
                    style={{ borderColor: `${COLORS.purple}60` }}>
                    <i className="fa-duotone fa-regular fa-user-tie text-sm" style={{ color: COLORS.purple }}></i>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                        {team.recruitersAssigned} External Recruiter{team.recruitersAssigned !== 1 ? "s" : ""} Assigned
                    </span>
                </div>

                {/* Members */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-users"></i>
                        </span>
                        Team Members ({team.members.length})
                    </h3>
                    <div className="space-y-3">
                        {team.members.map((member, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 border-2"
                                style={{ borderColor: `${ACCENT_CYCLE[i % 4]}40` }}>
                                <img src={member.avatar} alt={member.name}
                                    className="w-9 h-9 rounded-full object-cover border-2"
                                    style={{ borderColor: ACCENT_CYCLE[i % 4] }} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold truncate" style={{ color: COLORS.dark }}>{member.name}</div>
                                    <div className="text-[10px]" style={{ color: ACCENT_CYCLE[i % 4] }}>{member.role}</div>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border"
                                    style={{ borderColor: `${COLORS.dark}20`, color: COLORS.dark, opacity: 0.5 }}>
                                    {member.department}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.purple, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-tags"></i>
                        </span>
                        Focus Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {team.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                style={{ backgroundColor: ACCENT_CYCLE[i % 4], color: ACCENT_CYCLE[i % 4] === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Last Active */}
                <div className="mt-4 p-3 border-2 flex items-center gap-2"
                    style={{ borderColor: `${COLORS.coral}60` }}>
                    <i className="fa-duotone fa-regular fa-clock text-sm" style={{ color: COLORS.coral }}></i>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                        Last Active: {timeAgo(team.lastActiveDate)}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Table View ─────────────────────────────────────────────────────────────

function TableView({ teams, onSelect, selectedId }: { teams: CompanyTeamListing[]; onSelect: (t: CompanyTeamListing) => void; selectedId: string | null }) {
    const columnHeaders = ["", "Team", "Company", "Department", "Status", "Open Roles", "Hires", "Avg TTF"];
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
                    {teams.map((team, idx) => {
                        const accent = ACCENT_CYCLE[idx % 4];
                        const isSelected = selectedId === team.id;
                        return (
                            <Fragment key={team.id}>
                                <tr
                                    onClick={() => onSelect(team)}
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
                                            {team.featured && (
                                                <i className="fa-duotone fa-regular fa-star text-[10px]" style={{ color: COLORS.yellow }}></i>
                                            )}
                                            <span className="font-bold text-sm" style={{ color: COLORS.dark }}>{team.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: accent }}>{team.company.name}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.dark, opacity: 0.7 }}>{team.department}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                            style={{ backgroundColor: statusColor(team.status), color: statusColor(team.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                            {team.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold" style={{ color: COLORS.dark }}>{team.openRoles}</td>
                                    <td className="px-4 py-3 text-xs font-bold" style={{ color: COLORS.dark }}>{team.totalHires}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.dark, opacity: 0.6 }}>{team.avgTimeToFill}d</td>
                                </tr>
                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td colSpan={colCount} className="p-0"
                                            style={{ backgroundColor: COLORS.white, borderTop: `4px solid ${accent}`, borderBottom: `4px solid ${accent}` }}>
                                            <TeamDetail team={team} accent={accent} onClose={() => onSelect(team)} />
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

function GridView({ teams, onSelect, selectedId }: { teams: CompanyTeamListing[]; onSelect: (t: CompanyTeamListing) => void; selectedId: string | null }) {
    const selectedTeam = teams.find(t => t.id === selectedId);

    return (
        <div className="flex gap-6">
            {/* Cards Grid */}
            <div className={`grid gap-4 ${selectedTeam ? "w-1/2 grid-cols-1 lg:grid-cols-2" : "w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {teams.map((team, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === team.id;
                    const util = budgetUtilization(team.budget);
                    return (
                        <div key={team.id}
                            onClick={() => onSelect(team)}
                            className="cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative"
                            style={{
                                borderColor: isSelected ? accent : `${COLORS.dark}30`,
                                backgroundColor: COLORS.white,
                            }}>
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-8 h-8"
                                style={{ backgroundColor: accent }} />

                            {team.featured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                                    style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                    <i className="fa-duotone fa-regular fa-star"></i>
                                    Featured
                                </span>
                            )}

                            <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1"
                                style={{ color: COLORS.dark }}>
                                {team.name}
                            </h3>
                            <div className="text-sm font-bold mb-1" style={{ color: accent }}>{team.company.name}</div>

                            <div className="flex items-center gap-1 text-xs mb-3" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                <i className="fa-duotone fa-regular fa-building"></i>
                                {team.department}
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <MemberAvatarStack members={team.members} accent={accent} />
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(team.status), color: statusColor(team.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {team.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs mb-2">
                                <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                                    <span className="font-bold" style={{ color: COLORS.dark }}>{team.openRoles}</span> open roles
                                </span>
                                <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                                    <span className="font-bold" style={{ color: COLORS.dark }}>{team.totalHires}</span> hires
                                </span>
                            </div>

                            {/* Budget utilization bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.4 }}>Budget</span>
                                    <span className="font-bold" style={{ color: util > 80 ? COLORS.coral : COLORS.teal }}>{util}%</span>
                                </div>
                                <div className="w-full h-2 border" style={{ borderColor: `${COLORS.dark}30` }}>
                                    <div className="h-full" style={{
                                        width: `${Math.min(util, 100)}%`,
                                        backgroundColor: util > 80 ? COLORS.coral : COLORS.teal,
                                    }} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {team.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                        style={{ borderColor: `${ACCENT_CYCLE[i % 4]}60`, color: ACCENT_CYCLE[i % 4] }}>
                                        {tag}
                                    </span>
                                ))}
                                {team.tags.length > 3 && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold"
                                        style={{ color: COLORS.dark, opacity: 0.4 }}>
                                        +{team.tags.length - 3}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: `2px solid ${accent}30` }}>
                                <img src={team.admin.avatar} alt={team.admin.name}
                                    className="w-7 h-7 object-cover border-2" style={{ borderColor: accent }} />
                                <div>
                                    <div className="text-xs font-bold" style={{ color: COLORS.dark }}>{team.admin.name}</div>
                                    <div className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>{team.admin.title}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Sidebar */}
            {selectedTeam && (
                <div className="w-1/2 border-4 flex-shrink-0 sticky top-4 self-start"
                    style={{ borderColor: ACCENT_CYCLE[teams.indexOf(selectedTeam) % 4], backgroundColor: COLORS.white, maxHeight: "calc(100vh - 2rem)" }}>
                    <TeamDetail team={selectedTeam} accent={ACCENT_CYCLE[teams.indexOf(selectedTeam) % 4]} onClose={() => onSelect(selectedTeam)} />
                </div>
            )}
        </div>
    );
}

// ─── Gmail View ─────────────────────────────────────────────────────────────

function GmailView({ teams, onSelect, selectedId }: { teams: CompanyTeamListing[]; onSelect: (t: CompanyTeamListing) => void; selectedId: string | null }) {
    const selectedTeam = teams.find(t => t.id === selectedId);

    return (
        <div className="flex gap-0 border-4" style={{ borderColor: COLORS.dark, minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 overflow-y-auto border-r-4" style={{ borderColor: COLORS.dark, maxHeight: "calc(100vh - 16rem)" }}>
                {teams.map((team, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === team.id;
                    return (
                        <div key={team.id}
                            onClick={() => onSelect(team)}
                            className="cursor-pointer p-4 transition-colors"
                            style={{
                                backgroundColor: isSelected ? `${accent}15` : COLORS.white,
                                borderBottom: `2px solid ${COLORS.dark}15`,
                                borderLeft: isSelected ? `4px solid ${accent}` : "4px solid transparent",
                            }}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    {team.featured && (
                                        <i className="fa-duotone fa-regular fa-star text-[10px] flex-shrink-0" style={{ color: COLORS.yellow }}></i>
                                    )}
                                    <h4 className="font-black text-sm uppercase tracking-tight truncate"
                                        style={{ color: COLORS.dark }}>
                                        {team.name}
                                    </h4>
                                </div>
                                <span className="text-[10px] font-bold flex-shrink-0 whitespace-nowrap"
                                    style={{ color: COLORS.dark, opacity: 0.4 }}>
                                    {timeAgo(team.lastActiveDate)}
                                </span>
                            </div>
                            <div className="text-xs font-bold mb-1" style={{ color: accent }}>{team.company.name}</div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px]" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                    <i className="fa-duotone fa-regular fa-building mr-1"></i>
                                    {team.department}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(team.status), color: statusColor(team.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {team.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold mt-1" style={{ color: COLORS.dark, opacity: 0.7 }}>
                                <span>{team.openRoles} open</span>
                                <span style={{ opacity: 0.3 }}>|</span>
                                <span>{team.members.length} members</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden" style={{ backgroundColor: COLORS.white }}>
                {selectedTeam ? (
                    <TeamDetail team={selectedTeam} accent={ACCENT_CYCLE[teams.indexOf(selectedTeam) % 4]} />
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
                                Select a Team
                            </h3>
                            <p className="text-sm" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                Click a team on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CompanyTeamsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const departments = useMemo(() => {
        const depts = new Set(mockCompanyTeams.map(t => t.department));
        return Array.from(depts).sort();
    }, []);

    const filteredTeams = useMemo(() => {
        return mockCompanyTeams.filter(team => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const match = team.name.toLowerCase().includes(q)
                    || team.company.name.toLowerCase().includes(q)
                    || team.department.toLowerCase().includes(q)
                    || team.tags.some(t => t.toLowerCase().includes(q));
                if (!match) return false;
            }
            if (statusFilter !== "all" && team.status !== statusFilter) return false;
            if (departmentFilter !== "all" && team.department !== departmentFilter) return false;
            return true;
        });
    }, [searchQuery, statusFilter, departmentFilter]);

    const handleSelect = (team: CompanyTeamListing) => {
        setSelectedTeamId(prev => prev === team.id ? null : team.id);
    };

    const stats = {
        total: mockCompanyTeams.length,
        active: mockCompanyTeams.filter(t => t.status === "active" || t.status === "hiring").length,
        openRoles: mockCompanyTeams.reduce((sum, t) => sum + t.openRoles, 0),
        totalHires: mockCompanyTeams.reduce((sum, t) => sum + t.totalHires, 0),
    };

    return (
        <CompanyTeamsAnimator>
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
                                style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-people-group"></i>
                                Teams
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0"
                            style={{ color: COLORS.white }}>
                            Company{" "}
                            <span className="relative inline-block">
                                <span style={{ color: COLORS.teal }}>Teams</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: COLORS.teal }} />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-0"
                            style={{ color: COLORS.white, opacity: 0.7 }}>
                            Manage internal hiring teams across your organization.
                            Coordinate recruitment, track budgets, and hit hiring goals.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {[
                                { label: "Total Teams", value: stats.total, color: COLORS.coral },
                                { label: "Active", value: stats.active, color: COLORS.teal },
                                { label: "Open Roles", value: stats.openRoles, color: COLORS.yellow },
                                { label: "Total Hires", value: stats.totalHires, color: COLORS.purple },
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
                                        placeholder="Search teams, companies, focus areas..."
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
                                        <option value="active">Active</option>
                                        <option value="hiring">Hiring</option>
                                        <option value="paused">Paused</option>
                                        <option value="full">Full</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                {/* Department filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Dept:</span>
                                    <select
                                        value={departmentFilter}
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                        className="px-3 py-2 text-xs font-bold uppercase border-2 bg-transparent outline-none cursor-pointer"
                                        style={{ borderColor: COLORS.purple, color: COLORS.dark }}>
                                        <option value="all">All</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
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
                                            onClick={() => { setViewMode(mode); setSelectedTeamId(null); }}
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
                                    Showing {filteredTeams.length} of {mockCompanyTeams.length} teams
                                </span>
                                {searchQuery && (
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.coral }}>
                                        Filtered by: &ldquo;{searchQuery}&rdquo;
                                    </span>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="listings-content opacity-0">
                                {filteredTeams.length === 0 ? (
                                    <div className="text-center py-20 border-4" style={{ borderColor: `${COLORS.dark}20`, backgroundColor: COLORS.white }}>
                                        <div className="flex justify-center gap-3 mb-6">
                                            <div className="w-8 h-8 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                            <div className="w-8 h-8 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                                        </div>
                                        <h3 className="font-black text-2xl uppercase tracking-tight mb-2" style={{ color: COLORS.dark }}>
                                            No Teams Found
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                            Try adjusting your search or filters
                                        </p>
                                        <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setDepartmentFilter("all"); }}
                                            className="px-6 py-2 text-sm font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                            style={{ borderColor: COLORS.coral, color: COLORS.coral }}>
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {viewMode === "table" && (
                                            <TableView teams={filteredTeams} onSelect={handleSelect} selectedId={selectedTeamId} />
                                        )}
                                        {viewMode === "grid" && (
                                            <GridView teams={filteredTeams} onSelect={handleSelect} selectedId={selectedTeamId} />
                                        )}
                                        {viewMode === "gmail" && (
                                            <GmailView teams={filteredTeams} onSelect={handleSelect} selectedId={selectedTeamId} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </CompanyTeamsAnimator>
    );
}
