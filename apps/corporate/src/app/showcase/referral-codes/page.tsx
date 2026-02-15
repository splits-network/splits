"use client";

import { useState, useMemo, Fragment } from "react";
import { mockReferralCodes } from "@/data/mock-referral-codes";
import type { ReferralCodeListing } from "@/types/referral-code-listing";
import { ReferralCodesAnimator } from "./referral-codes-animator";

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

const ACTIVE_NAV = "dashboard";

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusColor(status: ReferralCodeListing["status"]) {
    switch (status) {
        case "active": return COLORS.teal;
        case "expired": return COLORS.purple;
        case "paused": return COLORS.yellow;
        case "maxed_out": return COLORS.coral;
        case "revoked": return COLORS.coral;
    }
}

function statusLabel(status: ReferralCodeListing["status"]) {
    switch (status) {
        case "active": return "Active";
        case "expired": return "Expired";
        case "paused": return "Paused";
        case "maxed_out": return "Maxed Out";
        case "revoked": return "Revoked";
    }
}

function typeColor(type: ReferralCodeListing["type"]) {
    switch (type) {
        case "recruiter": return COLORS.coral;
        case "company": return COLORS.teal;
        case "candidate": return COLORS.yellow;
        case "partner": return COLORS.purple;
    }
}

function formatRevenue(amount: number) {
    if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
    return `$${amount}`;
}

function formatRevenueExact(amount: number) {
    return `$${amount.toLocaleString()}`;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function rewardLabel(reward: ReferralCodeListing["reward"]) {
    switch (reward.type) {
        case "percentage": return `${reward.value}%`;
        case "flat": return `$${reward.value}`;
        case "credit": return `$${reward.value} credit`;
    }
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function CodeDetail({ code: item, accent, onClose }: { code: ReferralCodeListing; accent: string; onClose?: () => void }) {
    const usagePercent = item.maxUses ? Math.round((item.totalUses / item.maxUses) * 100) : null;

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b-4" style={{ borderColor: accent }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {item.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                                style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-star"></i>
                                Top Performer
                            </span>
                        )}
                        <h2 className="text-xl font-black uppercase tracking-widest leading-tight mb-2 font-mono"
                            style={{ color: COLORS.dark }}>
                            {item.code}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                                style={{ borderColor: typeColor(item.type), color: typeColor(item.type) }}>
                                {item.type}
                            </span>
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                style={{ backgroundColor: statusColor(item.status), color: statusColor(item.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                {statusLabel(item.status)}
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 border-b-4" style={{ borderColor: accent }}>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>
                        {item.totalUses}{item.maxUses ? `/${item.maxUses}` : ""}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Uses</div>
                </div>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{item.conversionRate}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Conversion</div>
                </div>
                <div className="p-4 text-center">
                    <div className="text-lg font-black" style={{ color: accent }}>{formatRevenueExact(item.revenue.earned)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Earned</div>
                </div>
            </div>

            {/* Detail Content */}
            <div className="p-6">
                {/* Creator Card */}
                <div className="mb-6 p-4 border-4" style={{ borderColor: accent }}>
                    <h3 className="font-black text-xs uppercase tracking-wider mb-3" style={{ color: COLORS.dark }}>
                        Creator
                    </h3>
                    <div className="flex items-center gap-3">
                        <img src={item.creator.avatar} alt={item.creator.name}
                            className="w-12 h-12 object-cover border-2" style={{ borderColor: accent }} />
                        <div>
                            <div className="font-bold text-sm" style={{ color: COLORS.dark }}>{item.creator.name}</div>
                            <div className="text-xs" style={{ color: accent }}>{item.creator.role}</div>
                        </div>
                    </div>
                </div>

                {/* Reward Details */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.teal, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-gift"></i>
                        </span>
                        Reward
                    </h3>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-black" style={{ color: COLORS.teal }}>
                            {rewardLabel(item.reward)}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                            style={{ borderColor: COLORS.teal, color: COLORS.teal }}>
                            {item.reward.type}
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: COLORS.dark, opacity: 0.7 }}>
                        {item.reward.description}
                    </p>
                </div>

                {/* Usage Progress */}
                {item.maxUses && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                            style={{ color: COLORS.dark }}>
                            <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                                style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                                <i className="fa-duotone fa-regular fa-chart-bar"></i>
                            </span>
                            Usage Progress
                        </h3>
                        <div className="flex items-center justify-between text-xs font-bold mb-2"
                            style={{ color: COLORS.dark }}>
                            <span>{item.totalUses} used</span>
                            <span>{item.maxUses} max</span>
                        </div>
                        <div className="w-full h-4 border-2" style={{ borderColor: COLORS.dark, backgroundColor: `${COLORS.dark}10` }}>
                            <div
                                className="h-full transition-all duration-500"
                                style={{
                                    width: `${usagePercent}%`,
                                    backgroundColor: usagePercent! >= 90 ? COLORS.coral : usagePercent! >= 70 ? COLORS.yellow : COLORS.teal,
                                }}
                            />
                        </div>
                        <div className="text-xs font-bold mt-1 text-right" style={{ color: COLORS.dark, opacity: 0.5 }}>
                            {usagePercent}% utilized
                        </div>
                    </div>
                )}

                {/* Revenue Breakdown */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-coins"></i>
                        </span>
                        Revenue
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border-2" style={{ borderColor: `${COLORS.teal}60` }}>
                            <div className="text-lg font-black" style={{ color: COLORS.teal }}>{formatRevenueExact(item.revenue.earned)}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Earned</div>
                        </div>
                        <div className="p-3 border-2" style={{ borderColor: `${COLORS.yellow}60` }}>
                            <div className="text-lg font-black" style={{ color: COLORS.yellow === "#FFE66D" ? COLORS.dark : COLORS.yellow }}>{formatRevenueExact(item.revenue.pending)}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Pending</div>
                        </div>
                    </div>
                </div>

                {/* Recent Signups */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.purple, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                        </span>
                        Recent Signups
                    </h3>
                    <ul className="space-y-2">
                        {item.recentSignups.map((signup, i) => (
                            <li key={i} className="flex items-center justify-between p-2 border-2"
                                style={{ borderColor: `${ACCENT_CYCLE[i % 4]}40` }}>
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-[10px]"
                                        style={{ color: ACCENT_CYCLE[i % 4] }}></i>
                                    <span className="text-sm font-bold" style={{ color: COLORS.dark }}>{signup.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
                                        style={{ borderColor: typeColor(signup.type as ReferralCodeListing["type"]), color: typeColor(signup.type as ReferralCodeListing["type"]) }}>
                                        {signup.type}
                                    </span>
                                    <span className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.4 }}>
                                        {timeAgo(signup.date)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Campaign */}
                {item.campaign && (
                    <div className="mb-4 p-3 border-2 flex items-center gap-2"
                        style={{ borderColor: `${COLORS.purple}60` }}>
                        <i className="fa-duotone fa-regular fa-bullhorn text-sm" style={{ color: COLORS.purple }}></i>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                            Campaign: {item.campaign}
                        </span>
                    </div>
                )}

                {/* Expiry Date */}
                {item.expiryDate && (
                    <div className="mb-4 p-3 border-2 flex items-center gap-2"
                        style={{ borderColor: `${COLORS.coral}60` }}>
                        <i className="fa-duotone fa-regular fa-calendar-clock text-sm" style={{ color: COLORS.coral }}></i>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                            Expires: {new Date(item.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                    </div>
                )}

                {/* Tags */}
                <div>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-tags"></i>
                        </span>
                        Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                style={{ backgroundColor: ACCENT_CYCLE[i % 4], color: ACCENT_CYCLE[i % 4] === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Table View ─────────────────────────────────────────────────────────────

function TableView({ codes, onSelect, selectedId }: { codes: ReferralCodeListing[]; onSelect: (c: ReferralCodeListing) => void; selectedId: string | null }) {
    const columnHeaders = ["", "Code", "Creator", "Type", "Status", "Uses", "Conversion", "Revenue"];
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
                    {codes.map((item, idx) => {
                        const accent = ACCENT_CYCLE[idx % 4];
                        const isSelected = selectedId === item.id;
                        return (
                            <Fragment key={item.id}>
                                <tr
                                    onClick={() => onSelect(item)}
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
                                            {item.featured && (
                                                <i className="fa-duotone fa-regular fa-star text-[10px]" style={{ color: COLORS.yellow }}></i>
                                            )}
                                            <span className="font-bold text-sm uppercase tracking-widest font-mono" style={{ color: COLORS.dark }}>{item.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: accent }}>{item.creator.name}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                            style={{ borderColor: typeColor(item.type), color: typeColor(item.type) }}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                            style={{ backgroundColor: statusColor(item.status), color: statusColor(item.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                            {statusLabel(item.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold" style={{ color: COLORS.dark }}>
                                        {item.totalUses}{item.maxUses ? `/${item.maxUses}` : ""}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 border" style={{ borderColor: `${COLORS.dark}30` }}>
                                                <div className="h-full" style={{ width: `${item.conversionRate}%`, backgroundColor: accent }} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: COLORS.dark }}>{item.conversionRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold" style={{ color: COLORS.dark }}>{formatRevenueExact(item.revenue.earned)}</td>
                                </tr>
                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td colSpan={colCount} className="p-0"
                                            style={{ backgroundColor: COLORS.white, borderTop: `4px solid ${accent}`, borderBottom: `4px solid ${accent}` }}>
                                            <CodeDetail code={item} accent={accent} onClose={() => onSelect(item)} />
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

function GridView({ codes, onSelect, selectedId }: { codes: ReferralCodeListing[]; onSelect: (c: ReferralCodeListing) => void; selectedId: string | null }) {
    const selectedCode = codes.find(c => c.id === selectedId);

    return (
        <div className="flex gap-6">
            {/* Cards Grid */}
            <div className={`grid gap-4 ${selectedCode ? "w-1/2 grid-cols-1 lg:grid-cols-2" : "w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {codes.map((item, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === item.id;
                    return (
                        <div key={item.id}
                            onClick={() => onSelect(item)}
                            className="cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative"
                            style={{
                                borderColor: isSelected ? accent : `${COLORS.dark}30`,
                                backgroundColor: COLORS.white,
                            }}>
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-8 h-8"
                                style={{ backgroundColor: accent }} />

                            {item.featured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                                    style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                    <i className="fa-duotone fa-regular fa-star"></i>
                                    Top Performer
                                </span>
                            )}

                            <h3 className="font-black text-sm uppercase tracking-widest leading-tight mb-1 font-mono"
                                style={{ color: COLORS.dark }}>
                                {item.code}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
                                    style={{ borderColor: typeColor(item.type), color: typeColor(item.type) }}>
                                    {item.type}
                                </span>
                            </div>

                            <div className="text-xs font-bold mb-3" style={{ color: accent }}>
                                <i className="fa-duotone fa-regular fa-user mr-1"></i>
                                {item.creator.name}
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-black" style={{ color: COLORS.dark }}>
                                    {item.totalUses}{item.maxUses ? `/${item.maxUses}` : ""} uses
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(item.status), color: statusColor(item.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {statusLabel(item.status)}
                                </span>
                            </div>

                            {/* Revenue */}
                            <div className="text-sm font-black mb-3" style={{ color: accent }}>
                                {formatRevenueExact(item.revenue.earned)}
                                <span className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: COLORS.dark, opacity: 0.5 }}>earned</span>
                            </div>

                            {/* Conversion Rate Bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between text-[10px] font-bold mb-1" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                    <span>Conversion</span>
                                    <span>{item.conversionRate}%</span>
                                </div>
                                <div className="w-full h-2 border" style={{ borderColor: `${COLORS.dark}30` }}>
                                    <div className="h-full" style={{ width: `${item.conversionRate}%`, backgroundColor: accent }} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {item.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                        style={{ borderColor: `${ACCENT_CYCLE[i % 4]}60`, color: ACCENT_CYCLE[i % 4] }}>
                                        {tag}
                                    </span>
                                ))}
                                {item.tags.length > 3 && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold"
                                        style={{ color: COLORS.dark, opacity: 0.4 }}>
                                        +{item.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Sidebar */}
            {selectedCode && (
                <div className="w-1/2 border-4 flex-shrink-0 sticky top-4 self-start"
                    style={{ borderColor: ACCENT_CYCLE[codes.indexOf(selectedCode) % 4], backgroundColor: COLORS.white, maxHeight: "calc(100vh - 2rem)" }}>
                    <CodeDetail code={selectedCode} accent={ACCENT_CYCLE[codes.indexOf(selectedCode) % 4]} onClose={() => onSelect(selectedCode)} />
                </div>
            )}
        </div>
    );
}

// ─── Gmail View ─────────────────────────────────────────────────────────────

function GmailView({ codes, onSelect, selectedId }: { codes: ReferralCodeListing[]; onSelect: (c: ReferralCodeListing) => void; selectedId: string | null }) {
    const selectedCode = codes.find(c => c.id === selectedId);

    return (
        <div className="flex gap-0 border-4" style={{ borderColor: COLORS.dark, minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 overflow-y-auto border-r-4" style={{ borderColor: COLORS.dark, maxHeight: "calc(100vh - 16rem)" }}>
                {codes.map((item, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === item.id;
                    return (
                        <div key={item.id}
                            onClick={() => onSelect(item)}
                            className="cursor-pointer p-4 transition-colors"
                            style={{
                                backgroundColor: isSelected ? `${accent}15` : COLORS.white,
                                borderBottom: `2px solid ${COLORS.dark}15`,
                                borderLeft: isSelected ? `4px solid ${accent}` : "4px solid transparent",
                            }}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    {item.featured && (
                                        <i className="fa-duotone fa-regular fa-star text-[10px] flex-shrink-0" style={{ color: COLORS.yellow }}></i>
                                    )}
                                    <h4 className="font-black text-xs uppercase tracking-widest truncate font-mono"
                                        style={{ color: COLORS.dark }}>
                                        {item.code}
                                    </h4>
                                </div>
                                <span className="text-[10px] font-bold flex-shrink-0 whitespace-nowrap"
                                    style={{ color: COLORS.dark, opacity: 0.4 }}>
                                    {item.lastUsedDate ? timeAgo(item.lastUsedDate) : "Never"}
                                </span>
                            </div>
                            <div className="text-xs font-bold mb-1" style={{ color: accent }}>
                                <i className="fa-duotone fa-regular fa-user mr-1"></i>
                                {item.creator.name}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                    <i className="fa-duotone fa-regular fa-users mr-1"></i>
                                    {item.totalUses} uses
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(item.status), color: statusColor(item.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {statusLabel(item.status)}
                                </span>
                            </div>
                            <div className="text-xs font-bold mt-1" style={{ color: COLORS.dark, opacity: 0.7 }}>
                                {formatRevenueExact(item.revenue.earned)} earned
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden" style={{ backgroundColor: COLORS.white }}>
                {selectedCode ? (
                    <CodeDetail code={selectedCode} accent={ACCENT_CYCLE[codes.indexOf(selectedCode) % 4]} />
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
                                Select a Code
                            </h3>
                            <p className="text-sm" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                Click a referral code on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ReferralCodesPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filteredCodes = useMemo(() => {
        return mockReferralCodes.filter(item => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const match = item.code.toLowerCase().includes(q)
                    || item.creator.name.toLowerCase().includes(q)
                    || item.campaign?.toLowerCase().includes(q)
                    || item.tags.some(t => t.toLowerCase().includes(q));
                if (!match) return false;
            }
            if (statusFilter !== "all" && item.status !== statusFilter) return false;
            if (typeFilter !== "all" && item.type !== typeFilter) return false;
            return true;
        });
    }, [searchQuery, statusFilter, typeFilter]);

    const handleSelect = (item: ReferralCodeListing) => {
        setSelectedCodeId(prev => prev === item.id ? null : item.id);
    };

    const totalRevenue = mockReferralCodes.reduce((sum, c) => sum + c.revenue.earned, 0);

    const stats = {
        total: mockReferralCodes.length,
        active: mockReferralCodes.filter(c => c.status === "active").length,
        totalUses: mockReferralCodes.reduce((sum, c) => sum + c.totalUses, 0),
        revenue: totalRevenue,
    };

    return (
        <ReferralCodesAnimator>
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
                                <i className="fa-duotone fa-regular fa-ticket"></i>
                                Referral Codes
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0"
                            style={{ color: COLORS.white }}>
                            Referral{" "}
                            <span className="relative inline-block">
                                <span style={{ color: COLORS.coral }}>Program</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: COLORS.coral }} />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-0"
                            style={{ color: COLORS.white, opacity: 0.7 }}>
                            Manage referral codes and track performance.
                            Grow your network through incentivized invites.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {[
                                { label: "Total Codes", value: stats.total, color: COLORS.coral },
                                { label: "Active", value: stats.active, color: COLORS.teal },
                                { label: "Total Uses", value: stats.totalUses.toLocaleString(), color: COLORS.yellow },
                                { label: "Revenue", value: formatRevenue(stats.revenue), color: COLORS.purple },
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
                                        placeholder="Search codes, creators, campaigns..."
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
                                        <option value="expired">Expired</option>
                                        <option value="paused">Paused</option>
                                        <option value="maxed_out">Maxed Out</option>
                                        <option value="revoked">Revoked</option>
                                    </select>
                                </div>

                                {/* Type filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Type:</span>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="px-3 py-2 text-xs font-bold uppercase border-2 bg-transparent outline-none cursor-pointer"
                                        style={{ borderColor: COLORS.purple, color: COLORS.dark }}>
                                        <option value="all">All</option>
                                        <option value="recruiter">Recruiter</option>
                                        <option value="company">Company</option>
                                        <option value="candidate">Candidate</option>
                                        <option value="partner">Partner</option>
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
                                            onClick={() => { setViewMode(mode); setSelectedCodeId(null); }}
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
                                    Showing {filteredCodes.length} of {mockReferralCodes.length} codes
                                </span>
                                {searchQuery && (
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.coral }}>
                                        Filtered by: &ldquo;{searchQuery}&rdquo;
                                    </span>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="listings-content opacity-0">
                                {filteredCodes.length === 0 ? (
                                    <div className="text-center py-20 border-4" style={{ borderColor: `${COLORS.dark}20`, backgroundColor: COLORS.white }}>
                                        <div className="flex justify-center gap-3 mb-6">
                                            <div className="w-8 h-8 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                            <div className="w-8 h-8 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                                        </div>
                                        <h3 className="font-black text-2xl uppercase tracking-tight mb-2" style={{ color: COLORS.dark }}>
                                            No Codes Found
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                            Try adjusting your search or filters
                                        </p>
                                        <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setTypeFilter("all"); }}
                                            className="px-6 py-2 text-sm font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                            style={{ borderColor: COLORS.coral, color: COLORS.coral }}>
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {viewMode === "table" && (
                                            <TableView codes={filteredCodes} onSelect={handleSelect} selectedId={selectedCodeId} />
                                        )}
                                        {viewMode === "grid" && (
                                            <GridView codes={filteredCodes} onSelect={handleSelect} selectedId={selectedCodeId} />
                                        )}
                                        {viewMode === "gmail" && (
                                            <GmailView codes={filteredCodes} onSelect={handleSelect} selectedId={selectedCodeId} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </ReferralCodesAnimator>
    );
}
