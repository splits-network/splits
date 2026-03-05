"use client";

import { data as d } from "./firm-data";
import { PanelHeader, PanelTabs } from "./panel-header";

function fmt(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function mcDisplay() {
    return d.memberCount === d.activeMemberCount
        ? `${d.activeMemberCount} member${d.activeMemberCount !== 1 ? "s" : ""}`
        : `${d.activeMemberCount} active (${d.memberCount} total)`;
}
const RC: Record<string, string> = { owner: "text-primary bg-primary/10", admin: "text-secondary bg-secondary/10", member: "text-base-content/70 bg-base-200", collaborator: "text-accent bg-accent/10" };
const SC: Record<string, string> = { active: "text-success bg-success/10", invited: "text-info bg-info/10", removed: "text-error bg-error/10" };

export function FirmPanel() {
    return (
        <div>
            <PanelHeader
                kicker="Boutique Agency"
                badges={[{ label: "Active", className: "badge-success" }, { label: "Marketplace", className: "badge-primary badge-soft" }]}
                avatar={{ initials: d.initials }}
                title={d.name}
                subtitle={mcDisplay()}
                meta={[
                    { icon: "fa-duotone fa-regular fa-location-dot", text: `${d.headquartersCity}, ${d.headquartersState}` },
                    { icon: "fa-duotone fa-regular fa-calendar", text: `Founded ${d.foundedYear}` },
                ]}
                stats={d.stats}
                actions={[
                    { icon: "fa-duotone fa-regular fa-handshake", label: "Partner", className: "btn-primary btn-sm" },
                    { icon: "fa-duotone fa-regular fa-arrow-up-right-from-square", label: "View Firm" },
                ]}
            />
            <PanelTabs
                tabs={[
                    { label: "Members", value: "members", icon: "fa-duotone fa-regular fa-users" },
                    { label: "Billing", value: "billing", icon: "fa-duotone fa-regular fa-credit-card" },
                    { label: "Settings", value: "settings", icon: "fa-duotone fa-regular fa-gear" },
                ]}
            >
                {(tab) => tab === "members" ? <MembersTab /> : tab === "billing" ? <BillingTab /> : <SettingsTab />}
            </PanelTabs>
        </div>
    );
}

function MembersTab() {
    const pending = d.invitations.filter((i) => i.status === "pending");
    return (
        <div className="space-y-10 p-6">
            <section>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30">Active Members</p>
                    <button className="btn btn-sm btn-primary"><i className="fa-duotone fa-regular fa-user-plus mr-1" />Invite</button>
                </div>
                <div className="border border-base-300">
                    {d.members.map((m, i) => (
                        <div key={m.id} className={`flex items-center gap-4 p-4 ${i < d.members.length - 1 ? "border-b border-base-200" : ""}`}>
                            <div className="w-10 h-10 bg-base-200 border border-base-300 flex items-center justify-center text-sm font-bold shrink-0">{m.initials}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{m.name}</p>
                                <p className="text-sm text-base-content/50 truncate">{m.email}</p>
                            </div>
                            <span className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${RC[m.role] || ""}`}>{m.roleLabel}</span>
                            <span className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${SC[m.status] || ""}`}>{m.status.charAt(0).toUpperCase() + m.status.slice(1)}</span>
                        </div>
                    ))}
                </div>
            </section>
            {pending.length > 0 && (
                <section>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Pending Invitations <span className="text-base-content/20">({pending.length})</span></p>
                    <div className="border border-base-300">
                        {pending.map((inv, i) => (
                            <div key={inv.id} className={`flex items-center gap-4 p-4 ${i < pending.length - 1 ? "border-b border-base-200" : ""}`}>
                                <div className="w-10 h-10 bg-base-200 border border-base-300 border-dashed flex items-center justify-center text-sm shrink-0"><i className="fa-duotone fa-regular fa-envelope text-base-content/40" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate text-base-content/70">{inv.email}</p>
                                    <p className="text-sm text-base-content/40 truncate">Invited {inv.createdAt}{inv.expired && <span className="text-warning ml-2">(expired)</span>}</p>
                                </div>
                                <span className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${RC[inv.role] || ""}`}>{inv.roleLabel}</span>
                                <span className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${inv.expired ? "text-warning/70 bg-warning/10" : "text-info/70 bg-info/10"}`}>{inv.expired ? "Expired" : "Pending"}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function BillingTab() {
    const checks = [{ done: true, l: "Billing profile configured" }, { done: true, l: "Payment method on file" }, { done: false, l: "Payout account connected" }];
    return (
        <div className="space-y-6 p-6">
            <div className="bg-base-200 border border-base-300 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">Billing Readiness</p>
                {checks.map((c) => (
                    <div key={c.l} className="flex items-center gap-2 text-sm">
                        <i className={`fa-duotone fa-regular ${c.done ? "fa-circle-check text-success" : "fa-circle text-base-content/20"}`} />
                        <span className={c.done ? "text-base-content/70" : "text-base-content/40"}>{c.l}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BillingCol title="Sending Payments" icon="fa-arrow-up-right" rows={[["Billing Email", "billing@apextalent.com"], ["Terms", "Net 30"], ["Payment Method", "Visa ending 4242"]]} />
                <BillingCol title="Receiving Payouts" icon="fa-arrow-down-left" rows={[["Status", "Not connected"], ["Bank Account", "--"], ["Pending Balance", "$0"]]} />
            </div>
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Admin Take Rate</p>
                <p className="text-sm text-base-content/60 mb-3">The firm earns {d.adminTakeRate}% from member placement payouts.</p>
                <div className="bg-base-200 p-4 text-sm text-base-content/70">
                    <strong>Example:</strong> $1,000 split: firm receives <strong>{fmt((1000 * d.adminTakeRate) / 100)}</strong>, member receives <strong>{fmt(1000 - (1000 * d.adminTakeRate) / 100)}</strong>.
                </div>
            </div>
        </div>
    );
}

function SettingsTab() {
    const info = [["Firm ID", d.id, true], ["Status", d.status.charAt(0).toUpperCase() + d.status.slice(1)], ["Created", d.createdAt], ["Members", mcDisplay()], ["Total Placements", String(d.totalPlacements)], ["Total Revenue", fmt(d.totalRevenue)]] as const;
    return (
        <div className="space-y-8 p-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Firm Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    {info.map(([l, v, mono]) => (
                        <div key={l} className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">{l}</p>
                            <p className={`font-bold text-sm ${mono ? "font-mono truncate" : ""}`}>{v}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Specialization</p>
                {([["Industries", d.industries, "badge-soft badge-outline"], ["Specialties", d.specialties, "badge-primary"], ["Placement Types", d.placementTypes, "badge-secondary"], ["Geo Focus", d.geoFocus, "badge-accent"]] as const).map(([label, tags, cls]) => (
                    <div key={label} className="mb-4">
                        <p className="text-sm text-base-content/40 mb-2">{label}</p>
                        <div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t} className={`badge ${cls}`}>{t}</span>)}</div>
                    </div>
                ))}
            </div>
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Contact</p>
                <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                    {([["fa-duotone fa-regular fa-globe", "Website", d.websiteUrl], ["fa-duotone fa-regular fa-envelope", "Email", d.contactEmail], ["fa-duotone fa-regular fa-phone", "Phone", d.contactPhone]] as const).map(([icon, l, v]) => (
                        <div key={l} className="flex items-center gap-4 px-6 py-4">
                            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0"><i className={`${icon} text-primary text-sm`} /></div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">{l}</p>
                                <p className="text-sm font-semibold text-base-content truncate">{v}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Partnership</p>
                <div className="flex flex-wrap gap-2">
                    <span className={`badge gap-2 ${d.companyFirm ? "badge-primary" : "badge-ghost"}`}><i className="fa-duotone fa-regular fa-building" /> Company Firm</span>
                    <span className={`badge gap-2 ${d.candidateFirm ? "badge-secondary" : "badge-ghost"}`}><i className="fa-duotone fa-regular fa-user-tie" /> Candidate Firm</span>
                    <span className={`badge gap-2 ${d.marketplaceVisible ? "badge-accent" : "badge-ghost"}`}><i className="fa-duotone fa-regular fa-store" /> Marketplace Visible</span>
                </div>
            </div>
            <div className="border-2 border-error/20 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">Danger Zone</p>
                <p className="text-sm text-base-content/60 mb-4">Suspending a firm disables all member access and pauses active placements.</p>
                <button className="btn btn-sm btn-error btn-outline" disabled><i className="fa-duotone fa-regular fa-ban mr-2" />Suspend Firm</button>
            </div>
        </div>
    );
}

function BillingCol({ title, icon, rows }: { title: string; icon: string; rows: string[][] }) {
    return (
        <div className="border border-base-300">
            <div className="bg-base-200 px-4 py-3 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40"><i className={`fa-duotone fa-regular ${icon} mr-2`} />{title}</p>
            </div>
            <div className="p-4 space-y-3">
                {rows.map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                        <span className="text-base-content/50">{l}</span>
                        <span className="font-semibold">{v}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
