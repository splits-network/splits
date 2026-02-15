"use client";

import { useState, useMemo, Fragment } from "react";
import { mockRecruiters } from "@/data/mock-recruiters";
import type { RecruiterListing } from "@/types/recruiter-listing";
import { RecruitersAnimator } from "./recruiters-animator";

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

const ACTIVE_NAV = "recruiters";

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusColor(status: RecruiterListing["status"]) {
    switch (status) {
        case "active": return COLORS.teal;
        case "verified": return COLORS.coral;
        case "pending": return COLORS.yellow;
        case "suspended": return COLORS.coral;
        case "inactive": return COLORS.purple;
    }
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}

function formatRevenue(amount: number) {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
    return `$${amount}`;
}

function renderStars(rating: number) {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.3;
    const stars = [];
    for (let i = 0; i < 5; i++) {
        if (i < full) {
            stars.push(<i key={i} className="fa-duotone fa-solid fa-star text-[10px]" style={{ color: COLORS.yellow }}></i>);
        } else if (i === full && hasHalf) {
            stars.push(<i key={i} className="fa-duotone fa-solid fa-star-half-stroke text-[10px]" style={{ color: COLORS.yellow }}></i>);
        } else {
            stars.push(<i key={i} className="fa-duotone fa-regular fa-star text-[10px]" style={{ color: `${COLORS.dark}30` }}></i>);
        }
    }
    return stars;
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function RecruiterDetail({ recruiter, accent, onClose }: { recruiter: RecruiterListing; accent: string; onClose?: () => void }) {
    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b-4" style={{ borderColor: accent }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        <img src={recruiter.avatar} alt={recruiter.name}
                            className="w-16 h-16 object-cover border-4 flex-shrink-0" style={{ borderColor: accent }} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-black uppercase tracking-tight leading-tight"
                                    style={{ color: COLORS.dark }}>
                                    {recruiter.name}
                                </h2>
                                {recruiter.verified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em]"
                                        style={{ backgroundColor: COLORS.teal, color: COLORS.white }}>
                                        <i className="fa-duotone fa-regular fa-badge-check"></i>
                                        Verified
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-bold mb-1" style={{ color: accent }}>{recruiter.title}</div>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="font-semibold" style={{ color: COLORS.dark, opacity: 0.8 }}>{recruiter.agency}</span>
                                <span style={{ color: COLORS.dark, opacity: 0.5 }}>|</span>
                                <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                    {recruiter.location}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                {renderStars(recruiter.rating)}
                                <span className="text-xs font-bold ml-1" style={{ color: COLORS.dark }}>{recruiter.rating}</span>
                            </div>
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
                        style={{ borderColor: statusColor(recruiter.status), color: statusColor(recruiter.status) }}>
                        {recruiter.status}
                    </span>
                    {recruiter.featured && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider"
                            style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-star"></i>
                            Top Recruiter
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 border-b-4" style={{ borderColor: accent }}>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{recruiter.totalPlacements}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Placements</div>
                </div>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{recruiter.activeCandidates}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Candidates</div>
                </div>
                <div className="p-4 text-center">
                    <div className="text-lg font-black" style={{ color: accent }}>{recruiter.activeRoles}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Active Roles</div>
                </div>
            </div>

            {/* Detail Content */}
            <div className="p-6">
                {/* Bio */}
                <p className="text-sm leading-relaxed mb-6" style={{ color: COLORS.dark, opacity: 0.8 }}>
                    {recruiter.bio}
                </p>

                {/* Specializations */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-bullseye-arrow"></i>
                        </span>
                        Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {recruiter.specializations.map((spec, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                style={{ backgroundColor: ACCENT_CYCLE[i % 4], color: ACCENT_CYCLE[i % 4] === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Industries */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.teal, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-industry-windows"></i>
                        </span>
                        Industries
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {recruiter.industries.map((industry, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-semibold border-2"
                                style={{ borderColor: `${COLORS.teal}80`, color: COLORS.dark }}>
                                {industry}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recent Placements */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-handshake"></i>
                        </span>
                        Recent Placements
                    </h3>
                    <ul className="space-y-3">
                        {recruiter.recentPlacements.map((placement, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm p-3 border-2"
                                style={{ borderColor: `${ACCENT_CYCLE[i % 4]}40` }}>
                                <i className="fa-duotone fa-regular fa-user-check mt-0.5 flex-shrink-0 text-[10px]"
                                    style={{ color: ACCENT_CYCLE[i % 4] }}></i>
                                <div>
                                    <span className="font-bold" style={{ color: COLORS.dark }}>{placement.candidateName}</span>
                                    <span style={{ color: COLORS.dark, opacity: 0.5 }}> as </span>
                                    <span className="font-semibold" style={{ color: ACCENT_CYCLE[i % 4] }}>{placement.roleName}</span>
                                    <span style={{ color: COLORS.dark, opacity: 0.5 }}> at </span>
                                    <span className="font-semibold" style={{ color: COLORS.dark }}>{placement.company}</span>
                                    <div className="text-[10px] mt-0.5" style={{ color: COLORS.dark, opacity: 0.4 }}>
                                        {new Date(placement.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Split Fee Info */}
                <div className="mb-4 p-4 border-4" style={{ borderColor: accent }}>
                    <h3 className="font-black text-xs uppercase tracking-wider mb-3" style={{ color: COLORS.dark }}>
                        Split Fee Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-lg font-black" style={{ color: accent }}>{recruiter.splitFeeRate}%</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Split Rate</div>
                        </div>
                        <div>
                            <div className="text-lg font-black" style={{ color: accent }}>{formatRevenue(recruiter.revenue.ytd)}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>YTD Revenue</div>
                        </div>
                    </div>
                </div>

                {/* Response Time */}
                <div className="mt-4 p-3 border-2 flex items-center gap-2"
                    style={{ borderColor: `${COLORS.purple}60` }}>
                    <i className="fa-duotone fa-regular fa-clock text-sm" style={{ color: COLORS.purple }}></i>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                        Response Time: {recruiter.responseTime}
                    </span>
                </div>

                {/* Joined Date */}
                <div className="mt-4 p-3 border-2 flex items-center gap-2"
                    style={{ borderColor: `${COLORS.coral}60` }}>
                    <i className="fa-duotone fa-regular fa-calendar-clock text-sm" style={{ color: COLORS.coral }}></i>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                        Member Since: {new Date(recruiter.joinedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Table View ─────────────────────────────────────────────────────────────

function TableView({ recruiters, onSelect, selectedId }: { recruiters: RecruiterListing[]; onSelect: (r: RecruiterListing) => void; selectedId: string | null }) {
    const columnHeaders = ["", "Recruiter", "Agency", "Specializations", "Rating", "Placements", "Status", "Active Since"];
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
                    {recruiters.map((recruiter, idx) => {
                        const accent = ACCENT_CYCLE[idx % 4];
                        const isSelected = selectedId === recruiter.id;
                        return (
                            <Fragment key={recruiter.id}>
                                <tr
                                    onClick={() => onSelect(recruiter)}
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
                                        <div className="flex items-center gap-3">
                                            <img src={recruiter.avatar} alt={recruiter.name}
                                                className="w-8 h-8 object-cover border-2 flex-shrink-0" style={{ borderColor: accent }} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {recruiter.featured && (
                                                        <i className="fa-duotone fa-regular fa-star text-[10px]" style={{ color: COLORS.yellow }}></i>
                                                    )}
                                                    <span className="font-bold text-sm" style={{ color: COLORS.dark }}>{recruiter.name}</span>
                                                    {recruiter.verified && (
                                                        <i className="fa-duotone fa-regular fa-badge-check text-[10px]" style={{ color: COLORS.teal }}></i>
                                                    )}
                                                </div>
                                                <div className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>{recruiter.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: accent }}>{recruiter.agency}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {recruiter.specializations.slice(0, 2).map((spec, i) => (
                                                <span key={i} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
                                                    style={{ borderColor: `${ACCENT_CYCLE[i % 4]}60`, color: ACCENT_CYCLE[i % 4] }}>
                                                    {spec}
                                                </span>
                                            ))}
                                            {recruiter.specializations.length > 2 && (
                                                <span className="px-1 py-0.5 text-[9px] font-bold"
                                                    style={{ color: COLORS.dark, opacity: 0.4 }}>
                                                    +{recruiter.specializations.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold" style={{ color: COLORS.dark }}>{recruiter.rating}</span>
                                            <i className="fa-duotone fa-solid fa-star text-[10px]" style={{ color: COLORS.yellow }}></i>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold" style={{ color: COLORS.dark }}>{recruiter.totalPlacements}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                            style={{ backgroundColor: statusColor(recruiter.status), color: statusColor(recruiter.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                            {recruiter.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                        {new Date(recruiter.joinedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                    </td>
                                </tr>
                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td colSpan={colCount} className="p-0"
                                            style={{ backgroundColor: COLORS.white, borderTop: `4px solid ${accent}`, borderBottom: `4px solid ${accent}` }}>
                                            <RecruiterDetail recruiter={recruiter} accent={accent} onClose={() => onSelect(recruiter)} />
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

function GridView({ recruiters, onSelect, selectedId }: { recruiters: RecruiterListing[]; onSelect: (r: RecruiterListing) => void; selectedId: string | null }) {
    const selectedRecruiter = recruiters.find(r => r.id === selectedId);

    return (
        <div className="flex gap-6">
            {/* Cards Grid */}
            <div className={`grid gap-4 ${selectedRecruiter ? "w-1/2 grid-cols-1 lg:grid-cols-2" : "w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {recruiters.map((recruiter, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === recruiter.id;
                    return (
                        <div key={recruiter.id}
                            onClick={() => onSelect(recruiter)}
                            className="cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative"
                            style={{
                                borderColor: isSelected ? accent : `${COLORS.dark}30`,
                                backgroundColor: COLORS.white,
                            }}>
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-8 h-8"
                                style={{ backgroundColor: accent }} />

                            <div className="flex items-center gap-3 mb-3">
                                <img src={recruiter.avatar} alt={recruiter.name}
                                    className="w-12 h-12 object-cover border-2 flex-shrink-0" style={{ borderColor: accent }} />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-black text-sm uppercase tracking-tight truncate"
                                            style={{ color: COLORS.dark }}>
                                            {recruiter.name}
                                        </h3>
                                        {recruiter.verified && (
                                            <i className="fa-duotone fa-regular fa-badge-check text-[10px] flex-shrink-0" style={{ color: COLORS.teal }}></i>
                                        )}
                                    </div>
                                    <div className="text-xs font-bold truncate" style={{ color: accent }}>{recruiter.agency}</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                                {recruiter.specializations.slice(0, 3).map((spec, i) => (
                                    <span key={i} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                        style={{ borderColor: `${ACCENT_CYCLE[i % 4]}60`, color: ACCENT_CYCLE[i % 4] }}>
                                        {spec}
                                    </span>
                                ))}
                                {recruiter.specializations.length > 3 && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold"
                                        style={{ color: COLORS.dark, opacity: 0.4 }}>
                                        +{recruiter.specializations.length - 3}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1">
                                    {renderStars(recruiter.rating)}
                                    <span className="text-xs font-bold ml-1" style={{ color: COLORS.dark }}>{recruiter.rating}</span>
                                </div>
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(recruiter.status), color: statusColor(recruiter.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {recruiter.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-3" style={{ borderTop: `2px solid ${accent}30` }}>
                                <div className="flex items-center gap-1 text-xs">
                                    <i className="fa-duotone fa-regular fa-handshake" style={{ color: accent }}></i>
                                    <span className="font-bold" style={{ color: COLORS.dark }}>{recruiter.totalPlacements}</span>
                                    <span style={{ color: COLORS.dark, opacity: 0.5 }}>placements</span>
                                </div>
                                {recruiter.featured && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase"
                                        style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                        <i className="fa-duotone fa-regular fa-star"></i>
                                        Top
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Sidebar */}
            {selectedRecruiter && (
                <div className="w-1/2 border-4 flex-shrink-0 sticky top-4 self-start"
                    style={{ borderColor: ACCENT_CYCLE[recruiters.indexOf(selectedRecruiter) % 4], backgroundColor: COLORS.white, maxHeight: "calc(100vh - 2rem)" }}>
                    <RecruiterDetail recruiter={selectedRecruiter} accent={ACCENT_CYCLE[recruiters.indexOf(selectedRecruiter) % 4]} onClose={() => onSelect(selectedRecruiter)} />
                </div>
            )}
        </div>
    );
}

// ─── Gmail View ─────────────────────────────────────────────────────────────

function GmailView({ recruiters, onSelect, selectedId }: { recruiters: RecruiterListing[]; onSelect: (r: RecruiterListing) => void; selectedId: string | null }) {
    const selectedRecruiter = recruiters.find(r => r.id === selectedId);

    return (
        <div className="flex gap-0 border-4" style={{ borderColor: COLORS.dark, minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 overflow-y-auto border-r-4" style={{ borderColor: COLORS.dark, maxHeight: "calc(100vh - 16rem)" }}>
                {recruiters.map((recruiter, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === recruiter.id;
                    return (
                        <div key={recruiter.id}
                            onClick={() => onSelect(recruiter)}
                            className="cursor-pointer p-4 transition-colors"
                            style={{
                                backgroundColor: isSelected ? `${accent}15` : COLORS.white,
                                borderBottom: `2px solid ${COLORS.dark}15`,
                                borderLeft: isSelected ? `4px solid ${accent}` : "4px solid transparent",
                            }}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <img src={recruiter.avatar} alt={recruiter.name}
                                        className="w-8 h-8 object-cover border-2 flex-shrink-0" style={{ borderColor: accent }} />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            {recruiter.featured && (
                                                <i className="fa-duotone fa-regular fa-star text-[10px] flex-shrink-0" style={{ color: COLORS.yellow }}></i>
                                            )}
                                            <h4 className="font-black text-sm uppercase tracking-tight truncate"
                                                style={{ color: COLORS.dark }}>
                                                {recruiter.name}
                                            </h4>
                                            {recruiter.verified && (
                                                <i className="fa-duotone fa-regular fa-badge-check text-[10px] flex-shrink-0" style={{ color: COLORS.teal }}></i>
                                            )}
                                        </div>
                                        <div className="text-xs font-bold truncate" style={{ color: accent }}>{recruiter.agency}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 gap-1">
                                    <span className="text-[10px] font-bold whitespace-nowrap"
                                        style={{ color: COLORS.dark, opacity: 0.4 }}>
                                        {timeAgo(recruiter.lastActiveDate)}
                                    </span>
                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase"
                                        style={{ backgroundColor: statusColor(recruiter.status), color: statusColor(recruiter.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                        {recruiter.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 pl-10">
                                <div className="flex items-center gap-1">
                                    {renderStars(recruiter.rating)}
                                    <span className="text-[10px] font-bold ml-1" style={{ color: COLORS.dark }}>{recruiter.rating}</span>
                                </div>
                                <span className="text-[11px] font-bold" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                    {recruiter.totalPlacements} placements
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden" style={{ backgroundColor: COLORS.white }}>
                {selectedRecruiter ? (
                    <RecruiterDetail recruiter={selectedRecruiter} accent={ACCENT_CYCLE[recruiters.indexOf(selectedRecruiter) % 4]} />
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
                                Select a Recruiter
                            </h3>
                            <p className="text-sm" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                Click a recruiter on the left to view their profile
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RecruitersPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [specFilter, setSpecFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Get unique specializations for filter
    const allSpecializations = useMemo(() => {
        const specs = new Set<string>();
        mockRecruiters.forEach(r => r.specializations.forEach(s => specs.add(s)));
        return Array.from(specs).sort();
    }, []);

    const filteredRecruiters = useMemo(() => {
        return mockRecruiters.filter(recruiter => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const match = recruiter.name.toLowerCase().includes(q)
                    || recruiter.agency.toLowerCase().includes(q)
                    || recruiter.location.toLowerCase().includes(q)
                    || recruiter.specializations.some(s => s.toLowerCase().includes(q))
                    || recruiter.industries.some(ind => ind.toLowerCase().includes(q));
                if (!match) return false;
            }
            if (statusFilter !== "all" && recruiter.status !== statusFilter) return false;
            if (specFilter !== "all" && !recruiter.specializations.includes(specFilter)) return false;
            return true;
        });
    }, [searchQuery, statusFilter, specFilter]);

    const handleSelect = (recruiter: RecruiterListing) => {
        setSelectedRecruiterId(prev => prev === recruiter.id ? null : recruiter.id);
    };

    const stats = {
        total: mockRecruiters.length,
        active: mockRecruiters.filter(r => r.status === "active").length,
        verified: mockRecruiters.filter(r => r.verified).length,
        avgRating: (mockRecruiters.reduce((sum, r) => sum + r.rating, 0) / mockRecruiters.length).toFixed(1),
    };

    return (
        <RecruitersAnimator>
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
                                style={{ backgroundColor: COLORS.purple, color: COLORS.white }}>
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                Recruiters
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0"
                            style={{ color: COLORS.white }}>
                            Recruiter{" "}
                            <span className="relative inline-block">
                                <span style={{ color: COLORS.coral }}>Marketplace</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: COLORS.coral }} />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-0"
                            style={{ color: COLORS.white, opacity: 0.7 }}>
                            Find top-rated split-fee recruiting partners.
                            Collaborate, split fees, and place candidates faster.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {[
                                { label: "Total", value: stats.total, color: COLORS.coral },
                                { label: "Active", value: stats.active, color: COLORS.teal },
                                { label: "Verified", value: stats.verified, color: COLORS.yellow },
                                { label: "Avg Rating", value: stats.avgRating, color: COLORS.purple },
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
                                        placeholder="Search recruiters, agencies, specializations..."
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
                                        <option value="verified">Verified</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                {/* Specialization filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Spec:</span>
                                    <select
                                        value={specFilter}
                                        onChange={(e) => setSpecFilter(e.target.value)}
                                        className="px-3 py-2 text-xs font-bold uppercase border-2 bg-transparent outline-none cursor-pointer"
                                        style={{ borderColor: COLORS.purple, color: COLORS.dark }}>
                                        <option value="all">All</option>
                                        {allSpecializations.map(spec => (
                                            <option key={spec} value={spec}>{spec}</option>
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
                                            onClick={() => { setViewMode(mode); setSelectedRecruiterId(null); }}
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
                                    Showing {filteredRecruiters.length} of {mockRecruiters.length} recruiters
                                </span>
                                {searchQuery && (
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.coral }}>
                                        Filtered by: &ldquo;{searchQuery}&rdquo;
                                    </span>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="listings-content opacity-0">
                                {filteredRecruiters.length === 0 ? (
                                    <div className="text-center py-20 border-4" style={{ borderColor: `${COLORS.dark}20`, backgroundColor: COLORS.white }}>
                                        <div className="flex justify-center gap-3 mb-6">
                                            <div className="w-8 h-8 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                            <div className="w-8 h-8 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                                        </div>
                                        <h3 className="font-black text-2xl uppercase tracking-tight mb-2" style={{ color: COLORS.dark }}>
                                            No Recruiters Found
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                            Try adjusting your search or filters
                                        </p>
                                        <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setSpecFilter("all"); }}
                                            className="px-6 py-2 text-sm font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                            style={{ borderColor: COLORS.coral, color: COLORS.coral }}>
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {viewMode === "table" && (
                                            <TableView recruiters={filteredRecruiters} onSelect={handleSelect} selectedId={selectedRecruiterId} />
                                        )}
                                        {viewMode === "grid" && (
                                            <GridView recruiters={filteredRecruiters} onSelect={handleSelect} selectedId={selectedRecruiterId} />
                                        )}
                                        {viewMode === "gmail" && (
                                            <GmailView recruiters={filteredRecruiters} onSelect={handleSelect} selectedId={selectedRecruiterId} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </RecruitersAnimator>
    );
}
