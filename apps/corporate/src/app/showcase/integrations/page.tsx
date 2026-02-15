"use client";

import { useState, useMemo, Fragment } from "react";
import { mockIntegrations } from "@/data/mock-integrations";
import type { IntegrationListing } from "@/types/integration-listing";
import { IntegrationsAnimator } from "./integrations-animator";

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

function statusColor(status: IntegrationListing["status"]) {
    switch (status) {
        case "active": return COLORS.teal;
        case "inactive": return COLORS.purple;
        case "error": return COLORS.coral;
        case "pending_setup": return COLORS.yellow;
        case "maintenance": return COLORS.yellow;
    }
}

function statusLabel(status: IntegrationListing["status"]) {
    switch (status) {
        case "active": return "Active";
        case "inactive": return "Inactive";
        case "error": return "Error";
        case "pending_setup": return "Pending";
        case "maintenance": return "Maintenance";
    }
}

function categoryLabel(category: IntegrationListing["category"]) {
    switch (category) {
        case "ats": return "ATS";
        case "crm": return "CRM";
        case "hris": return "HRIS";
        case "job_board": return "Job Board";
        case "background_check": return "Background Check";
        case "assessment": return "Assessment";
        case "communication": return "Communication";
        case "analytics": return "Analytics";
    }
}

function frequencyLabel(freq: IntegrationListing["syncFrequency"]) {
    switch (freq) {
        case "real_time": return "Real-time";
        case "hourly": return "Hourly";
        case "daily": return "Daily";
        case "weekly": return "Weekly";
        case "manual": return "Manual";
    }
}

function formatNumber(n: number) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return String(n);
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function IntegrationDetail({ integration, accent, onClose }: { integration: IntegrationListing; accent: string; onClose?: () => void }) {
    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b-4" style={{ borderColor: accent }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {integration.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                                style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-star"></i>
                                Critical
                            </span>
                        )}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: accent }}>
                                <i className={`${integration.icon} text-lg`}
                                    style={{ color: accent === COLORS.yellow ? COLORS.dark : COLORS.white }}></i>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight leading-tight"
                                    style={{ color: COLORS.dark }}>
                                    {integration.name}
                                </h2>
                                <div className="text-sm font-bold" style={{ color: accent }}>{integration.provider}</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                                style={{ borderColor: statusColor(integration.status), color: statusColor(integration.status) }}>
                                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                                    style={{ backgroundColor: statusColor(integration.status) }} />
                                {statusLabel(integration.status)}
                            </span>
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                                style={{ borderColor: COLORS.dark, color: COLORS.dark, opacity: 0.6 }}>
                                {categoryLabel(integration.category)}
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
                    <div className="text-lg font-black" style={{ color: accent }}>{formatNumber(integration.dataPointsSynced)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Data Points</div>
                </div>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{integration.uptime ? `${integration.uptime}%` : "N/A"}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Uptime</div>
                </div>
                <div className="p-4 text-center">
                    <div className="text-lg font-black" style={{ color: integration.errorCount > 0 ? COLORS.coral : accent }}>{integration.errorCount}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Errors</div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Description */}
                <p className="text-sm leading-relaxed mb-6" style={{ color: COLORS.dark, opacity: 0.8 }}>
                    {integration.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.teal, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-puzzle-piece"></i>
                        </span>
                        Synced Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {integration.features.map((feature, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                style={{ backgroundColor: ACCENT_CYCLE[i % 4], color: ACCENT_CYCLE[i % 4] === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Sync Schedule */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-arrows-rotate"></i>
                        </span>
                        Sync Schedule
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border-2" style={{ borderColor: `${COLORS.dark}15` }}>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.6 }}>Frequency</span>
                            <span className="text-xs font-black uppercase" style={{ color: COLORS.coral }}>{frequencyLabel(integration.syncFrequency)}</span>
                        </div>
                        {integration.lastSyncDate && (
                            <div className="flex items-center justify-between p-3 border-2" style={{ borderColor: `${COLORS.dark}15` }}>
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.6 }}>Last Sync</span>
                                <span className="text-xs font-bold" style={{ color: COLORS.dark }}>{timeAgo(integration.lastSyncDate)}</span>
                            </div>
                        )}
                        {integration.nextSyncDate && (
                            <div className="flex items-center justify-between p-3 border-2" style={{ borderColor: `${COLORS.dark}15` }}>
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.6 }}>Next Sync</span>
                                <span className="text-xs font-bold" style={{ color: COLORS.dark }}>{formatDate(integration.nextSyncDate)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Connection Details */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.purple, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-link"></i>
                        </span>
                        Connection Details
                    </h3>
                    <div className="p-4 border-4" style={{ borderColor: accent }}>
                        <div className="flex items-center gap-3 mb-3">
                            <img src={integration.connectedBy.avatar} alt={integration.connectedBy.name}
                                className="w-12 h-12 object-cover border-2" style={{ borderColor: accent }} />
                            <div>
                                <div className="font-bold text-sm" style={{ color: COLORS.dark }}>{integration.connectedBy.name}</div>
                                <div className="text-xs" style={{ color: COLORS.dark, opacity: 0.5 }}>Connected on {formatDate(integration.connectedDate)}</div>
                            </div>
                        </div>
                        {integration.apiVersion && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>API Version:</span>
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                    style={{ borderColor: `${COLORS.purple}60`, color: COLORS.purple }}>
                                    {integration.apiVersion}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Webhook Status */}
                <div className="mb-6 p-3 border-2 flex items-center gap-2"
                    style={{ borderColor: integration.webhooksEnabled ? `${COLORS.teal}60` : `${COLORS.dark}20` }}>
                    <i className={`fa-duotone fa-regular ${integration.webhooksEnabled ? "fa-circle-check" : "fa-circle-xmark"} text-sm`}
                        style={{ color: integration.webhooksEnabled ? COLORS.teal : `${COLORS.dark}40` }}></i>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>
                        Webhooks {integration.webhooksEnabled ? "Enabled" : "Disabled"}
                    </span>
                </div>

                {/* Error Log */}
                {integration.errorCount > 0 && (
                    <div className="p-4 border-4" style={{ borderColor: COLORS.coral }}>
                        <h3 className="font-black text-xs uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: COLORS.coral }}>
                            <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                            Error Log ({integration.errorCount} recent errors)
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 text-xs" style={{ color: COLORS.dark, opacity: 0.75 }}>
                                <i className="fa-duotone fa-regular fa-chevron-right mt-0.5 flex-shrink-0 text-[10px]"
                                    style={{ color: COLORS.coral }}></i>
                                Rate limit exceeded during batch sync operation
                            </div>
                            <div className="flex items-start gap-2 text-xs" style={{ color: COLORS.dark, opacity: 0.75 }}>
                                <i className="fa-duotone fa-regular fa-chevron-right mt-0.5 flex-shrink-0 text-[10px]"
                                    style={{ color: COLORS.coral }}></i>
                                Authentication token expired, auto-refresh triggered
                            </div>
                            {integration.errorCount > 2 && (
                                <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: COLORS.coral }}>
                                    + {integration.errorCount - 2} more errors
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Table View ─────────────────────────────────────────────────────────────

function TableView({ integrations, onSelect, selectedId }: { integrations: IntegrationListing[]; onSelect: (i: IntegrationListing) => void; selectedId: string | null }) {
    const columnHeaders = ["", "Integration", "Provider", "Category", "Status", "Data Points", "Last Sync", "Errors"];
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
                    {integrations.map((integration, idx) => {
                        const accent = ACCENT_CYCLE[idx % 4];
                        const isSelected = selectedId === integration.id;
                        return (
                            <Fragment key={integration.id}>
                                <tr
                                    onClick={() => onSelect(integration)}
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
                                            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: `${accent}20` }}>
                                                <i className={`${integration.icon} text-xs`} style={{ color: accent }}></i>
                                            </div>
                                            {integration.featured && (
                                                <i className="fa-duotone fa-regular fa-star text-[10px]" style={{ color: COLORS.yellow }}></i>
                                            )}
                                            <span className="font-bold text-sm" style={{ color: COLORS.dark }}>{integration.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: accent }}>{integration.provider}</td>
                                    <td className="px-4 py-3 text-xs font-bold uppercase" style={{ color: COLORS.dark, opacity: 0.7 }}>{categoryLabel(integration.category)}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                            style={{ backgroundColor: statusColor(integration.status), color: statusColor(integration.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                            {statusLabel(integration.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold" style={{ color: COLORS.dark }}>{formatNumber(integration.dataPointsSynced)}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.dark, opacity: 0.6 }}>{integration.lastSyncDate ? timeAgo(integration.lastSyncDate) : "Never"}</td>
                                    <td className="px-4 py-3">
                                        {integration.errorCount > 0 ? (
                                            <span className="px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${COLORS.coral}20`, color: COLORS.coral }}>
                                                {integration.errorCount}
                                            </span>
                                        ) : (
                                            <span className="text-xs" style={{ color: COLORS.dark, opacity: 0.3 }}>0</span>
                                        )}
                                    </td>
                                </tr>
                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td colSpan={colCount} className="p-0"
                                            style={{ backgroundColor: COLORS.white, borderTop: `4px solid ${accent}`, borderBottom: `4px solid ${accent}` }}>
                                            <IntegrationDetail integration={integration} accent={accent} onClose={() => onSelect(integration)} />
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

function GridView({ integrations, onSelect, selectedId }: { integrations: IntegrationListing[]; onSelect: (i: IntegrationListing) => void; selectedId: string | null }) {
    const selectedIntegration = integrations.find(i => i.id === selectedId);

    return (
        <div className="flex gap-6">
            {/* Cards Grid */}
            <div className={`grid gap-4 ${selectedIntegration ? "w-1/2 grid-cols-1 lg:grid-cols-2" : "w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {integrations.map((integration, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === integration.id;
                    return (
                        <div key={integration.id}
                            onClick={() => onSelect(integration)}
                            className="cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative"
                            style={{
                                borderColor: isSelected ? accent : `${COLORS.dark}30`,
                                backgroundColor: COLORS.white,
                            }}>
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-8 h-8"
                                style={{ backgroundColor: accent }} />

                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${accent}20` }}>
                                    <i className={`${integration.icon} text-lg`} style={{ color: accent }}></i>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                        {integration.featured && (
                                            <i className="fa-duotone fa-regular fa-star text-[10px]" style={{ color: COLORS.yellow }}></i>
                                        )}
                                        <h3 className="font-black text-base uppercase tracking-tight leading-tight truncate"
                                            style={{ color: COLORS.dark }}>
                                            {integration.name}
                                        </h3>
                                    </div>
                                    <div className="text-xs font-bold" style={{ color: accent }}>{integration.provider}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                    style={{ borderColor: `${COLORS.dark}30`, color: COLORS.dark, opacity: 0.7 }}>
                                    {categoryLabel(integration.category)}
                                </span>
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(integration.status), color: statusColor(integration.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: statusColor(integration.status) === COLORS.yellow ? COLORS.dark : COLORS.white }} />
                                    {statusLabel(integration.status)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-black" style={{ color: COLORS.dark }}>
                                    {formatNumber(integration.dataPointsSynced)} synced
                                </span>
                                {integration.lastSyncDate && (
                                    <span className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                        {timeAgo(integration.lastSyncDate)}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {integration.features.slice(0, 3).map((feature, i) => (
                                    <span key={i} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                        style={{ borderColor: `${ACCENT_CYCLE[i % 4]}60`, color: ACCENT_CYCLE[i % 4] }}>
                                        {feature}
                                    </span>
                                ))}
                                {integration.features.length > 3 && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold"
                                        style={{ color: COLORS.dark, opacity: 0.4 }}>
                                        +{integration.features.length - 3}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: `2px solid ${accent}30` }}>
                                <img src={integration.connectedBy.avatar} alt={integration.connectedBy.name}
                                    className="w-7 h-7 object-cover border-2" style={{ borderColor: accent }} />
                                <div>
                                    <div className="text-xs font-bold" style={{ color: COLORS.dark }}>{integration.connectedBy.name}</div>
                                    <div className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>Connected {timeAgo(integration.connectedDate)}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Sidebar */}
            {selectedIntegration && (
                <div className="w-1/2 border-4 flex-shrink-0 sticky top-4 self-start"
                    style={{ borderColor: ACCENT_CYCLE[integrations.indexOf(selectedIntegration) % 4], backgroundColor: COLORS.white, maxHeight: "calc(100vh - 2rem)" }}>
                    <IntegrationDetail integration={selectedIntegration} accent={ACCENT_CYCLE[integrations.indexOf(selectedIntegration) % 4]} onClose={() => onSelect(selectedIntegration)} />
                </div>
            )}
        </div>
    );
}

// ─── Gmail View ─────────────────────────────────────────────────────────────

function GmailView({ integrations, onSelect, selectedId }: { integrations: IntegrationListing[]; onSelect: (i: IntegrationListing) => void; selectedId: string | null }) {
    const selectedIntegration = integrations.find(i => i.id === selectedId);

    return (
        <div className="flex gap-0 border-4" style={{ borderColor: COLORS.dark, minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 overflow-y-auto border-r-4" style={{ borderColor: COLORS.dark, maxHeight: "calc(100vh - 16rem)" }}>
                {integrations.map((integration, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === integration.id;
                    return (
                        <div key={integration.id}
                            onClick={() => onSelect(integration)}
                            className="cursor-pointer p-4 transition-colors"
                            style={{
                                backgroundColor: isSelected ? `${accent}15` : COLORS.white,
                                borderBottom: `2px solid ${COLORS.dark}15`,
                                borderLeft: isSelected ? `4px solid ${accent}` : "4px solid transparent",
                            }}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${accent}20` }}>
                                        <i className={`${integration.icon} text-xs`} style={{ color: accent }}></i>
                                    </div>
                                    {integration.featured && (
                                        <i className="fa-duotone fa-regular fa-star text-[10px] flex-shrink-0" style={{ color: COLORS.yellow }}></i>
                                    )}
                                    <h4 className="font-black text-sm uppercase tracking-tight truncate"
                                        style={{ color: COLORS.dark }}>
                                        {integration.name}
                                    </h4>
                                </div>
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase flex-shrink-0"
                                    style={{ backgroundColor: statusColor(integration.status), color: statusColor(integration.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {statusLabel(integration.status)}
                                </span>
                            </div>
                            <div className="text-xs font-bold mb-1 ml-9" style={{ color: accent }}>{integration.provider}</div>
                            <div className="flex items-center justify-between ml-9">
                                <span className="text-[11px]" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                    {categoryLabel(integration.category)}
                                </span>
                                <span className="text-[10px] font-bold" style={{ color: COLORS.dark, opacity: 0.4 }}>
                                    {formatNumber(integration.dataPointsSynced)} pts
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden" style={{ backgroundColor: COLORS.white }}>
                {selectedIntegration ? (
                    <IntegrationDetail integration={selectedIntegration} accent={ACCENT_CYCLE[integrations.indexOf(selectedIntegration) % 4]} />
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
                                Select an Integration
                            </h3>
                            <p className="text-sm" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                Click an integration on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function IntegrationsSixPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filteredIntegrations = useMemo(() => {
        return mockIntegrations.filter(integration => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const match = integration.name.toLowerCase().includes(q)
                    || integration.provider.toLowerCase().includes(q)
                    || integration.description.toLowerCase().includes(q)
                    || integration.features.some(f => f.toLowerCase().includes(q));
                if (!match) return false;
            }
            if (statusFilter !== "all" && integration.status !== statusFilter) return false;
            if (categoryFilter !== "all" && integration.category !== categoryFilter) return false;
            return true;
        });
    }, [searchQuery, statusFilter, categoryFilter]);

    const handleSelect = (integration: IntegrationListing) => {
        setSelectedId(prev => prev === integration.id ? null : integration.id);
    };

    const totalDataPoints = mockIntegrations.reduce((sum, i) => sum + i.dataPointsSynced, 0);

    const stats = {
        total: mockIntegrations.length,
        active: mockIntegrations.filter(i => i.status === "active").length,
        errors: mockIntegrations.filter(i => i.errorCount > 0).length,
        dataPoints: formatNumber(totalDataPoints),
    };

    return (
        <IntegrationsAnimator>
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
                                <i className="fa-duotone fa-regular fa-plug-circle-bolt"></i>
                                Integrations
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0"
                            style={{ color: COLORS.white }}>
                            Connected{" "}
                            <span className="relative inline-block">
                                <span style={{ color: COLORS.coral }}>Systems</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: COLORS.coral }} />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-0"
                            style={{ color: COLORS.white, opacity: 0.7 }}>
                            Manage your third-party integrations and data pipelines.
                            Keep your recruiting stack in perfect sync.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {[
                                { label: "Total", value: stats.total, color: COLORS.coral },
                                { label: "Active", value: stats.active, color: COLORS.teal },
                                { label: "Errors", value: stats.errors, color: COLORS.yellow },
                                { label: "Data Points", value: stats.dataPoints, color: COLORS.purple },
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
                                        placeholder="Search integrations, providers, features..."
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
                                        <option value="inactive">Inactive</option>
                                        <option value="error">Error</option>
                                        <option value="pending_setup">Pending</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>

                                {/* Category filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Category:</span>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="px-3 py-2 text-xs font-bold uppercase border-2 bg-transparent outline-none cursor-pointer"
                                        style={{ borderColor: COLORS.purple, color: COLORS.dark }}>
                                        <option value="all">All</option>
                                        <option value="ats">ATS</option>
                                        <option value="crm">CRM</option>
                                        <option value="hris">HRIS</option>
                                        <option value="job_board">Job Board</option>
                                        <option value="background_check">Background Check</option>
                                        <option value="assessment">Assessment</option>
                                        <option value="communication">Communication</option>
                                        <option value="analytics">Analytics</option>
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
                                            onClick={() => { setViewMode(mode); setSelectedId(null); }}
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
                                    Showing {filteredIntegrations.length} of {mockIntegrations.length} integrations
                                </span>
                                {searchQuery && (
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.coral }}>
                                        Filtered by: &ldquo;{searchQuery}&rdquo;
                                    </span>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="listings-content opacity-0">
                                {filteredIntegrations.length === 0 ? (
                                    <div className="text-center py-20 border-4" style={{ borderColor: `${COLORS.dark}20`, backgroundColor: COLORS.white }}>
                                        <div className="flex justify-center gap-3 mb-6">
                                            <div className="w-8 h-8 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                            <div className="w-8 h-8 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                                        </div>
                                        <h3 className="font-black text-2xl uppercase tracking-tight mb-2" style={{ color: COLORS.dark }}>
                                            No Integrations Found
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                            Try adjusting your search or filters
                                        </p>
                                        <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCategoryFilter("all"); }}
                                            className="px-6 py-2 text-sm font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                            style={{ borderColor: COLORS.coral, color: COLORS.coral }}>
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {viewMode === "table" && (
                                            <TableView integrations={filteredIntegrations} onSelect={handleSelect} selectedId={selectedId} />
                                        )}
                                        {viewMode === "grid" && (
                                            <GridView integrations={filteredIntegrations} onSelect={handleSelect} selectedId={selectedId} />
                                        )}
                                        {viewMode === "gmail" && (
                                            <GmailView integrations={filteredIntegrations} onSelect={handleSelect} selectedId={selectedId} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </IntegrationsAnimator>
    );
}
