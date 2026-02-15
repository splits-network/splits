"use client";

import { useState, useMemo, Fragment } from "react";
import { mockCompanyInvitations } from "@/data/mock-company-invitations";
import type { CompanyInvitationListing } from "@/types/company-invitation-listing";
import { CompanyInvitationsAnimator } from "./company-invitations-animator";

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

function formatRevenue(amount: number | undefined) {
    if (!amount) return "N/A";
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
    return `$${amount}`;
}

function statusColor(status: CompanyInvitationListing["status"]) {
    switch (status) {
        case "pending": return COLORS.yellow;
        case "accepted": return COLORS.teal;
        case "declined": return COLORS.coral;
        case "expired": return COLORS.purple;
        case "negotiating": return COLORS.yellow;
    }
}

function typeLabel(type: CompanyInvitationListing["type"]) {
    switch (type) {
        case "platform_join": return "Platform Join";
        case "partnership": return "Partnership";
        case "exclusive_contract": return "Exclusive";
        case "trial_offer": return "Trial Offer";
    }
}

function channelIcon(channel: CompanyInvitationListing["channel"]) {
    switch (channel) {
        case "email": return "fa-duotone fa-regular fa-envelope";
        case "phone": return "fa-duotone fa-regular fa-phone";
        case "in_person": return "fa-duotone fa-regular fa-handshake";
        case "linkedin": return "fa-duotone fa-regular fa-share-nodes";
    }
}

function channelLabel(channel: CompanyInvitationListing["channel"]) {
    switch (channel) {
        case "email": return "Email";
        case "phone": return "Phone";
        case "in_person": return "In Person";
        case "linkedin": return "LinkedIn";
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

// ─── Detail Panel ───────────────────────────────────────────────────────────

function InvitationDetail({ invitation, accent, onClose }: { invitation: CompanyInvitationListing; accent: string; onClose?: () => void }) {
    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b-4" style={{ borderColor: accent }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {invitation.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                                style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-star"></i>
                                High Value
                            </span>
                        )}
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2"
                            style={{ color: COLORS.dark }}>
                            {invitation.company.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="font-bold" style={{ color: accent }}>{invitation.company.industry}</span>
                            <span style={{ color: COLORS.dark, opacity: 0.5 }}>|</span>
                            <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                                <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                {invitation.company.location}
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
                        style={{ borderColor: statusColor(invitation.status), color: statusColor(invitation.status) }}>
                        {invitation.status}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                        style={{ borderColor: COLORS.dark, color: COLORS.dark, opacity: 0.6 }}>
                        {typeLabel(invitation.type)}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                        style={{ borderColor: COLORS.dark, color: COLORS.dark, opacity: 0.6 }}>
                        <i className={`${channelIcon(invitation.channel)} mr-1`}></i>
                        {channelLabel(invitation.channel)}
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 border-b-4" style={{ borderColor: accent }}>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{formatRevenue(invitation.estimatedRevenue)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Est. Revenue</div>
                </div>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{invitation.followUpCount}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Follow-ups</div>
                </div>
                <div className="p-4 text-center">
                    <div className="text-lg font-black" style={{ color: accent }}>{invitation.responseTime ? `${invitation.responseTime}h` : "---"}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Response</div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Company Contact */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.teal, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-user"></i>
                        </span>
                        Company Contact
                    </h3>
                    <div className="flex items-center gap-3 p-3 border-2" style={{ borderColor: `${COLORS.teal}40` }}>
                        <img src={invitation.company.avatar} alt={invitation.company.name}
                            className="w-12 h-12 object-cover border-2" style={{ borderColor: accent }} />
                        <div>
                            <div className="font-bold text-sm" style={{ color: COLORS.dark }}>{invitation.company.contactName}</div>
                            <div className="text-xs" style={{ color: accent }}>{invitation.company.contactTitle}</div>
                            <div className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>{invitation.company.contactEmail}</div>
                        </div>
                    </div>
                </div>

                {/* Pitch Message */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-message-lines"></i>
                        </span>
                        Pitch Message
                    </h3>
                    <p className="text-sm leading-relaxed p-4 border-2" style={{ color: COLORS.dark, opacity: 0.8, borderColor: `${COLORS.coral}30` }}>
                        {invitation.message}
                    </p>
                </div>

                {/* Proposal Details */}
                {invitation.proposal && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                            style={{ color: COLORS.dark }}>
                            <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                                style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-file-contract"></i>
                            </span>
                            Proposal Details
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 border-2 text-center" style={{ borderColor: `${COLORS.yellow}60` }}>
                                <div className="text-lg font-black" style={{ color: COLORS.dark }}>{invitation.proposal.feePercentage}%</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Fee</div>
                            </div>
                            <div className="p-3 border-2 text-center" style={{ borderColor: `${COLORS.yellow}60` }}>
                                <div className="text-lg font-black" style={{ color: COLORS.dark }}>{invitation.proposal.guaranteeDays}d</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Guarantee</div>
                            </div>
                            <div className="p-3 border-2 text-center" style={{ borderColor: `${COLORS.yellow}60` }}>
                                <div className="text-lg font-black" style={{ color: invitation.proposal.exclusivity ? COLORS.coral : COLORS.teal }}>
                                    {invitation.proposal.exclusivity ? "Yes" : "No"}
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Exclusive</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.purple, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-clock"></i>
                        </span>
                        Timeline
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.dark, opacity: 0.75 }}>
                            <i className="fa-duotone fa-regular fa-paper-plane text-[10px]" style={{ color: COLORS.teal }}></i>
                            <span className="font-bold">Sent:</span>
                            {new Date(invitation.sentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        {invitation.respondedDate && (
                            <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.dark, opacity: 0.75 }}>
                                <i className="fa-duotone fa-regular fa-reply text-[10px]" style={{ color: COLORS.coral }}></i>
                                <span className="font-bold">Responded:</span>
                                {new Date(invitation.respondedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.dark, opacity: 0.75 }}>
                            <i className="fa-duotone fa-regular fa-calendar-xmark text-[10px]" style={{ color: COLORS.purple }}></i>
                            <span className="font-bold">Expires:</span>
                            {new Date(invitation.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
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
                        Industry Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {invitation.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                style={{ backgroundColor: ACCENT_CYCLE[i % 4], color: ACCENT_CYCLE[i % 4] === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recruiter */}
                <div className="p-4 border-4" style={{ borderColor: accent }}>
                    <h3 className="font-black text-xs uppercase tracking-wider mb-3" style={{ color: COLORS.dark }}>
                        Recruiter
                    </h3>
                    <div className="flex items-center gap-3">
                        <img src={invitation.recruiter.avatar} alt={invitation.recruiter.name}
                            className="w-12 h-12 object-cover border-2" style={{ borderColor: accent }} />
                        <div>
                            <div className="font-bold text-sm" style={{ color: COLORS.dark }}>{invitation.recruiter.name}</div>
                            <div className="text-xs" style={{ color: accent }}>{invitation.recruiter.agency}</div>
                        </div>
                    </div>
                </div>

                {/* Estimated Revenue */}
                {invitation.estimatedRevenue && (
                    <div className="mt-4 p-3 border-2 flex items-center gap-2"
                        style={{ borderColor: `${COLORS.teal}60` }}>
                        <i className="fa-duotone fa-regular fa-chart-line text-sm" style={{ color: COLORS.teal }}></i>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                            Est. Annual Revenue: {formatRevenue(invitation.estimatedRevenue)}
                        </span>
                    </div>
                )}

                {/* Expiry */}
                <div className="mt-4 p-3 border-2 flex items-center gap-2"
                    style={{ borderColor: `${COLORS.coral}60` }}>
                    <i className="fa-duotone fa-regular fa-calendar-clock text-sm" style={{ color: COLORS.coral }}></i>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                        Expires: {new Date(invitation.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Table View ─────────────────────────────────────────────────────────────

function TableView({ invitations, onSelect, selectedId }: { invitations: CompanyInvitationListing[]; onSelect: (inv: CompanyInvitationListing) => void; selectedId: string | null }) {
    const columnHeaders = ["", "Company", "Industry", "Type", "Status", "Est. Revenue", "Channel", "Sent"];
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
                    {invitations.map((inv, idx) => {
                        const accent = ACCENT_CYCLE[idx % 4];
                        const isSelected = selectedId === inv.id;
                        return (
                            <Fragment key={inv.id}>
                                <tr
                                    onClick={() => onSelect(inv)}
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
                                            {inv.featured && (
                                                <i className="fa-duotone fa-regular fa-star text-[10px]" style={{ color: COLORS.yellow }}></i>
                                            )}
                                            <span className="font-bold text-sm" style={{ color: COLORS.dark }}>{inv.company.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: accent }}>{inv.company.industry}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                            style={{ borderColor: `${accent}60`, color: accent }}>
                                            {typeLabel(inv.type)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                            style={{ backgroundColor: statusColor(inv.status), color: statusColor(inv.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold" style={{ color: COLORS.dark }}>{formatRevenue(inv.estimatedRevenue)}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.dark, opacity: 0.7 }}>
                                        <i className={`${channelIcon(inv.channel)} mr-1`}></i>
                                        {channelLabel(inv.channel)}
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.dark, opacity: 0.6 }}>{timeAgo(inv.sentDate)}</td>
                                </tr>
                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td colSpan={colCount} className="p-0"
                                            style={{ backgroundColor: COLORS.white, borderTop: `4px solid ${accent}`, borderBottom: `4px solid ${accent}` }}>
                                            <InvitationDetail invitation={inv} accent={accent} onClose={() => onSelect(inv)} />
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

function GridView({ invitations, onSelect, selectedId }: { invitations: CompanyInvitationListing[]; onSelect: (inv: CompanyInvitationListing) => void; selectedId: string | null }) {
    const selectedInv = invitations.find(inv => inv.id === selectedId);

    return (
        <div className="flex gap-6">
            {/* Cards Grid */}
            <div className={`grid gap-4 ${selectedInv ? "w-1/2 grid-cols-1 lg:grid-cols-2" : "w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {invitations.map((inv, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === inv.id;
                    return (
                        <div key={inv.id}
                            onClick={() => onSelect(inv)}
                            className="cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative"
                            style={{
                                borderColor: isSelected ? accent : `${COLORS.dark}30`,
                                backgroundColor: COLORS.white,
                            }}>
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-8 h-8"
                                style={{ backgroundColor: accent }} />

                            {inv.featured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                                    style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                    <i className="fa-duotone fa-regular fa-star"></i>
                                    High Value
                                </span>
                            )}

                            {/* Company initial + name */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 flex items-center justify-center text-base font-black flex-shrink-0"
                                    style={{ backgroundColor: accent, color: accent === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {inv.company.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-base uppercase tracking-tight leading-tight truncate"
                                        style={{ color: COLORS.dark }}>
                                        {inv.company.name}
                                    </h3>
                                    <div className="text-xs" style={{ color: COLORS.dark, opacity: 0.6 }}>{inv.company.industry}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                    style={{ borderColor: `${accent}60`, color: accent }}>
                                    {typeLabel(inv.type)}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(inv.status), color: statusColor(inv.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {inv.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-black" style={{ color: COLORS.dark }}>
                                    {formatRevenue(inv.estimatedRevenue)}
                                </span>
                                <span className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                    {timeAgo(inv.sentDate)}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {inv.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                        style={{ borderColor: `${ACCENT_CYCLE[i % 4]}60`, color: ACCENT_CYCLE[i % 4] }}>
                                        {tag}
                                    </span>
                                ))}
                                {inv.tags.length > 3 && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold"
                                        style={{ color: COLORS.dark, opacity: 0.4 }}>
                                        +{inv.tags.length - 3}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: `2px solid ${accent}30` }}>
                                <img src={inv.recruiter.avatar} alt={inv.recruiter.name}
                                    className="w-7 h-7 object-cover border-2" style={{ borderColor: accent }} />
                                <div>
                                    <div className="text-xs font-bold" style={{ color: COLORS.dark }}>{inv.recruiter.name}</div>
                                    <div className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>{inv.recruiter.agency}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Sidebar */}
            {selectedInv && (
                <div className="w-1/2 border-4 flex-shrink-0 sticky top-4 self-start"
                    style={{ borderColor: ACCENT_CYCLE[invitations.indexOf(selectedInv) % 4], backgroundColor: COLORS.white, maxHeight: "calc(100vh - 2rem)" }}>
                    <InvitationDetail invitation={selectedInv} accent={ACCENT_CYCLE[invitations.indexOf(selectedInv) % 4]} onClose={() => onSelect(selectedInv)} />
                </div>
            )}
        </div>
    );
}

// ─── Gmail View ─────────────────────────────────────────────────────────────

function GmailView({ invitations, onSelect, selectedId }: { invitations: CompanyInvitationListing[]; onSelect: (inv: CompanyInvitationListing) => void; selectedId: string | null }) {
    const selectedInv = invitations.find(inv => inv.id === selectedId);

    return (
        <div className="flex gap-0 border-4" style={{ borderColor: COLORS.dark, minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 overflow-y-auto border-r-4" style={{ borderColor: COLORS.dark, maxHeight: "calc(100vh - 16rem)" }}>
                {invitations.map((inv, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === inv.id;
                    return (
                        <div key={inv.id}
                            onClick={() => onSelect(inv)}
                            className="cursor-pointer p-4 transition-colors"
                            style={{
                                backgroundColor: isSelected ? `${accent}15` : COLORS.white,
                                borderBottom: `2px solid ${COLORS.dark}15`,
                                borderLeft: isSelected ? `4px solid ${accent}` : "4px solid transparent",
                            }}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    {inv.featured && (
                                        <i className="fa-duotone fa-regular fa-star text-[10px] flex-shrink-0" style={{ color: COLORS.yellow }}></i>
                                    )}
                                    <h4 className="font-black text-sm uppercase tracking-tight truncate"
                                        style={{ color: COLORS.dark }}>
                                        {inv.company.name}
                                    </h4>
                                </div>
                                <span className="text-[10px] font-bold flex-shrink-0 whitespace-nowrap"
                                    style={{ color: COLORS.dark, opacity: 0.4 }}>
                                    {timeAgo(inv.sentDate)}
                                </span>
                            </div>
                            <div className="text-xs font-bold mb-1" style={{ color: accent }}>{inv.company.industry}</div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px]" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                    {inv.company.location}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(inv.status), color: statusColor(inv.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {inv.status}
                                </span>
                            </div>
                            <div className="text-xs font-bold mt-1" style={{ color: COLORS.dark, opacity: 0.7 }}>
                                {formatRevenue(inv.estimatedRevenue)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden" style={{ backgroundColor: COLORS.white }}>
                {selectedInv ? (
                    <InvitationDetail invitation={selectedInv} accent={ACCENT_CYCLE[invitations.indexOf(selectedInv) % 4]} />
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
                                Select an Invitation
                            </h3>
                            <p className="text-sm" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                Click an invitation on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CompanyInvitationsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedInvId, setSelectedInvId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filteredInvitations = useMemo(() => {
        return mockCompanyInvitations.filter(inv => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const match = inv.company.name.toLowerCase().includes(q)
                    || inv.company.industry.toLowerCase().includes(q)
                    || inv.company.location.toLowerCase().includes(q)
                    || inv.recruiter.name.toLowerCase().includes(q)
                    || inv.recruiter.agency.toLowerCase().includes(q)
                    || inv.tags.some(t => t.toLowerCase().includes(q));
                if (!match) return false;
            }
            if (statusFilter !== "all" && inv.status !== statusFilter) return false;
            if (typeFilter !== "all" && inv.type !== typeFilter) return false;
            return true;
        });
    }, [searchQuery, statusFilter, typeFilter]);

    const handleSelect = (inv: CompanyInvitationListing) => {
        setSelectedInvId(prev => prev === inv.id ? null : inv.id);
    };

    const stats = {
        total: mockCompanyInvitations.length,
        pending: mockCompanyInvitations.filter(inv => inv.status === "pending").length,
        accepted: mockCompanyInvitations.filter(inv => inv.status === "accepted").length,
        revenue: mockCompanyInvitations.reduce((sum, inv) => sum + (inv.estimatedRevenue ?? 0), 0),
    };

    return (
        <CompanyInvitationsAnimator>
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
                                <i className="fa-duotone fa-regular fa-envelope-open-text"></i>
                                Invitations
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0"
                            style={{ color: COLORS.white }}>
                            Company{" "}
                            <span className="relative inline-block">
                                <span style={{ color: COLORS.coral }}>Outreach</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: COLORS.coral }} />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-0"
                            style={{ color: COLORS.white, opacity: 0.7 }}>
                            Grow the marketplace by inviting companies to join.
                            Track outreach, partnerships, and conversion.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {[
                                { label: "Total Sent", value: stats.total, color: COLORS.coral },
                                { label: "Pending", value: stats.pending, color: COLORS.yellow },
                                { label: "Accepted", value: stats.accepted, color: COLORS.teal },
                                { label: "Est. Revenue", value: formatRevenue(stats.revenue), color: COLORS.purple },
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
                                        placeholder="Search companies, industries, recruiters..."
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
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="declined">Declined</option>
                                        <option value="expired">Expired</option>
                                        <option value="negotiating">Negotiating</option>
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
                                        <option value="platform_join">Platform Join</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="exclusive_contract">Exclusive</option>
                                        <option value="trial_offer">Trial Offer</option>
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
                                            onClick={() => { setViewMode(mode); setSelectedInvId(null); }}
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
                                    Showing {filteredInvitations.length} of {mockCompanyInvitations.length} invitations
                                </span>
                                {searchQuery && (
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.coral }}>
                                        Filtered by: &ldquo;{searchQuery}&rdquo;
                                    </span>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="listings-content opacity-0">
                                {filteredInvitations.length === 0 ? (
                                    <div className="text-center py-20 border-4" style={{ borderColor: `${COLORS.dark}20`, backgroundColor: COLORS.white }}>
                                        <div className="flex justify-center gap-3 mb-6">
                                            <div className="w-8 h-8 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                            <div className="w-8 h-8 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                                        </div>
                                        <h3 className="font-black text-2xl uppercase tracking-tight mb-2" style={{ color: COLORS.dark }}>
                                            No Invitations Found
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
                                            <TableView invitations={filteredInvitations} onSelect={handleSelect} selectedId={selectedInvId} />
                                        )}
                                        {viewMode === "grid" && (
                                            <GridView invitations={filteredInvitations} onSelect={handleSelect} selectedId={selectedInvId} />
                                        )}
                                        {viewMode === "gmail" && (
                                            <GmailView invitations={filteredInvitations} onSelect={handleSelect} selectedId={selectedInvId} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </CompanyInvitationsAnimator>
    );
}
