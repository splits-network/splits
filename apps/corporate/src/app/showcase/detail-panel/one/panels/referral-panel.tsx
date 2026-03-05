"use client";

import { data as d } from "./referral-data";
import { PanelHeader, PanelTabs } from "./panel-header";

export function ReferralPanel() {
    return (
        <div>
            <PanelHeader
                kicker="Referral Code"
                badges={[{ label: d.status === "active" ? "Active" : "Inactive", className: d.status === "active" ? "badge-success" : "badge-error" }]}
                avatar={{ initials: d.creatorInitials }}
                title={d.code}
                subtitle={d.creatorName}
                meta={[
                    { icon: "fa-duotone fa-regular fa-tag", text: d.label },
                    { icon: "fa-duotone fa-regular fa-calendar", text: `Created ${fmt(d.createdAt)}` },
                ]}
                stats={d.stats}
                actions={[
                    { icon: "fa-duotone fa-regular fa-copy", label: "Copy Link", className: "btn-primary btn-sm" },
                    { icon: "fa-duotone fa-regular fa-share-nodes", label: "Share" },
                    { icon: "fa-duotone fa-regular fa-pause", label: "Deactivate", className: "btn-ghost btn-sm text-warning" },
                    { icon: "fa-duotone fa-regular fa-trash", label: "Delete", className: "btn-ghost btn-sm text-error" },
                ]}
            />
            <PanelTabs
                tabs={[
                    { label: "Overview", value: "overview", icon: "fa-duotone fa-regular fa-circle-info" },
                    { label: "Performance", value: "performance", icon: "fa-duotone fa-regular fa-chart-line" },
                    { label: "Settings", value: "settings", icon: "fa-duotone fa-regular fa-gear" },
                ]}
            >
                {(tab) => {
                    if (tab === "overview") return <OverviewTab />;
                    if (tab === "performance") return <PerformanceTab />;
                    return <SettingsTab />;
                }}
            </PanelTabs>
        </div>
    );
}

function OverviewTab() {
    return (
        <div className="space-y-8 p-6">
            <div className="border-l-4 border-l-primary pl-6">
                <Label>Referral Code</Label>
                <p className="font-mono text-2xl font-black tracking-wide bg-base-200 px-4 py-2 border border-base-300 inline-block">{d.code}</p>
            </div>

            <div>
                <Label>Share Link</Label>
                <div className="flex items-center gap-2 bg-base-200 border border-base-300 px-4 py-3">
                    <i className="fa-duotone fa-regular fa-link text-primary text-sm shrink-0" />
                    <p className="text-sm font-semibold truncate">{d.shareLink}</p>
                </div>
            </div>

            <div>
                <Label>Code Details</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <Cell label="Label" value={d.label} />
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Status</p>
                        <span className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${d.status === "active" ? "bg-success/15 text-success" : "bg-error/15 text-error"}`}>
                            <i className={`fa-duotone fa-regular ${d.status === "active" ? "fa-circle-check" : "fa-circle-pause"} mr-1`} />
                            {d.status}
                        </span>
                    </div>
                    <Cell label="Total Signups" value={String(d.usageCount)} bold />
                    <Cell label="Created" value={fmt(d.createdAt)} />
                </div>
            </div>

            <div>
                <Label>Recent Signups</Label>
                <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                    {d.recentSignups.map((s) => (
                        <div key={s.name} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                    <i className="fa-duotone fa-regular fa-user text-primary text-xs" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{s.name}</p>
                                    <p className="text-sm text-base-content/40">{s.date}</p>
                                </div>
                            </div>
                            <span className={`text-sm uppercase tracking-wider font-bold px-2 py-1 ${s.status === "converted" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                                {s.status === "converted" ? "Converted" : "Signed Up"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PerformanceTab() {
    const rows = [
        { label: "Total Clicks", value: d.usageStats.totalClicks, icon: "fa-duotone fa-regular fa-mouse-pointer" },
        { label: "Unique Visitors", value: d.usageStats.uniqueVisitors, icon: "fa-duotone fa-regular fa-users" },
        { label: "Signups", value: d.usageStats.signups, icon: "fa-duotone fa-regular fa-user-plus" },
        { label: "Conversions", value: d.usageStats.conversions, icon: "fa-duotone fa-regular fa-check" },
    ];
    const rate = Math.round((d.usageStats.conversions / d.usageStats.signups) * 100);

    return (
        <div className="p-6 space-y-8">
            <div>
                <Label>Usage Statistics</Label>
                <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                    {rows.map((r) => (
                        <div key={r.label} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                    <i className={`${r.icon} text-primary text-xs`} />
                                </div>
                                <span className="text-sm text-base-content/70">{r.label}</span>
                            </div>
                            <span className="text-sm font-black">{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-l-4 border-l-primary pl-6">
                <Label>Conversion Rate</Label>
                <p className="text-3xl font-black text-primary">{rate}%</p>
                <p className="text-sm text-base-content/40 mt-1">of signups converted</p>
            </div>
        </div>
    );
}

function SettingsTab() {
    const rows = [
        { label: "Expiry Date", value: d.settings.expiryDate, icon: "fa-duotone fa-regular fa-calendar-xmark" },
        { label: "Max Uses", value: String(d.settings.maxUses), icon: "fa-duotone fa-regular fa-hashtag" },
        { label: "Uses Remaining", value: String(d.settings.usesRemaining), icon: "fa-duotone fa-regular fa-battery-half" },
        { label: "Commission Rate", value: d.settings.commission, icon: "fa-duotone fa-regular fa-percent" },
    ];

    return (
        <div className="p-6 space-y-8">
            <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary divide-y divide-base-300">
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">Code Settings</p>
                </div>
                {rows.map((r) => (
                    <div key={r.label} className="flex items-center gap-4 px-6 py-4">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                            <i className={`${r.icon} text-primary text-xs`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">{r.label}</p>
                            <p className="text-sm font-semibold text-base-content">{r.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-l-4 border-l-primary pl-6">
                <Label>Last Updated</Label>
                <p className="text-sm font-semibold">{fmt(d.updatedAt)}</p>
            </div>
        </div>
    );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
    return <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">{children}</p>;
}

function Cell({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div className="bg-base-100 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">{label}</p>
            <p className={`text-sm ${bold ? "text-lg font-black tracking-tight" : "font-bold"}`}>{value}</p>
        </div>
    );
}

function fmt(s: string | null): string {
    if (!s) return "N/A";
    return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
