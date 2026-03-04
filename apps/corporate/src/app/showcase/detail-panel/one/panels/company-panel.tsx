"use client";

import { data as d } from "./company-data";
import { PanelHeader, PanelTabs } from "./panel-header";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const SIZE_LABELS: Record<string, string> = {
    "1-10": "1-10 employees", "11-50": "11-50 employees", "51-200": "51-200 employees",
    "201-500": "201-500 employees", "501+": "501+ employees",
};

/* ─── Panel ─────────────────────────────────────────────────────────────── */

export function CompanyPanel() {
    return (
        <div>
            <PanelHeader
                kicker={d.industry}
                badges={[
                    { label: "Active", className: "badge-success" },
                    { label: SIZE_LABELS[d.companySize] || d.companySize, className: "badge-ghost" },
                ]}
                avatar={{ initials: d.initials }}
                title={d.name}
                subtitle={d.industry}
                meta={[
                    { icon: "fa-duotone fa-regular fa-location-dot", text: d.headquartersLocation },
                    { icon: "fa-duotone fa-regular fa-globe", text: d.website },
                ]}
                stats={d.stats}
                actions={[
                    { icon: "fa-duotone fa-regular fa-briefcase", label: "View Roles", className: "btn-primary btn-sm" },
                    { icon: "fa-duotone fa-regular fa-handshake", label: "Request Partnership" },
                    { icon: "fa-duotone fa-regular fa-arrow-up-right-from-square", label: "Website" },
                ]}
            />

            <PanelTabs
                tabs={[
                    { label: "Overview", value: "overview", icon: "fa-duotone fa-regular fa-building" },
                    { label: "Roles", value: "roles", icon: "fa-duotone fa-regular fa-briefcase" },
                    { label: "Contacts", value: "contacts", icon: "fa-duotone fa-regular fa-address-book" },
                ]}
            >
                {(tab) => {
                    if (tab === "overview") return <OverviewTab />;
                    if (tab === "roles") return <RolesTab />;
                    return <ContactsTab />;
                }}
            </PanelTabs>
        </div>
    );
}

/* ─── Overview Tab ──────────────────────────────────────────────────────── */

function OverviewTab() {
    return (
        <div className="space-y-8 p-6">
            {/* Stats Grid — Size, Stage, Founded, Open Roles, Avg Salary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Size</p>
                    <p className="text-lg font-black tracking-tight">{d.companySize}</p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Stage</p>
                    <p className="text-lg font-black tracking-tight">{d.stage}</p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Founded</p>
                    <p className="text-lg font-black tracking-tight">{d.foundedYear}</p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Open Roles</p>
                    <p className="text-lg font-black tracking-tight">{d.openRolesCount}</p>
                </div>
                <div className="bg-base-100 p-4 col-span-2 md:col-span-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Avg Salary</p>
                    <p className="text-lg font-black tracking-tight">${Math.round(d.avgSalary / 1000)}k</p>
                </div>
            </div>

            {/* Tagline */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Tagline</p>
                <p className="text-lg italic text-base-content/70 border-l-4 border-l-primary pl-4">{d.tagline}</p>
            </div>

            {/* About / Description */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">About</p>
                <p className="text-sm text-base-content/70 leading-relaxed">{d.description}</p>
            </div>

            {/* Social Links */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Social</p>
                <div className="flex items-center gap-4">
                    <a href={d.linkedinUrl} className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                        <i className="fa-brands fa-linkedin text-lg" /> LinkedIn
                    </a>
                    <a href={d.twitterUrl} className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                        <i className="fa-brands fa-x-twitter text-lg" /> X / Twitter
                    </a>
                    <a href={d.glassdoorUrl} className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                        <i className="fa-duotone fa-regular fa-star text-lg" /> Glassdoor
                    </a>
                </div>
            </div>

            {/* Tech Stack */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                    {d.techStack.map((s) => (
                        <span key={s} className="badge badge-outline">{s}</span>
                    ))}
                </div>
            </div>

            {/* Perks & Benefits */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Perks & Benefits</p>
                <div className="flex flex-wrap gap-1.5">
                    {d.perks.map((p) => (
                        <span key={p} className="badge badge-secondary">{p}</span>
                    ))}
                </div>
            </div>

            {/* Culture & Values */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Culture & Values</p>
                <div className="flex flex-wrap gap-1.5">
                    {d.cultureTags.map((t) => (
                        <span key={t} className="badge badge-accent">{t}</span>
                    ))}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Location</p>
                    <p className="font-bold text-sm">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />{d.headquartersLocation}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Website</p>
                    <a href={`https://${d.website}`} className="text-sm font-bold text-primary hover:underline">{d.website}</a>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Industry</p>
                    <p className="font-bold text-sm">{d.industry}</p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Company Size</p>
                    <p className="font-bold text-sm">{SIZE_LABELS[d.companySize] || d.companySize}</p>
                </div>
            </div>

            {/* Relationship */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Relationship</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Status</p>
                        <span className="inline-flex items-center px-2 py-0.5 text-sm uppercase tracking-[0.15em] font-bold bg-success/15 text-success">
                            {d.relationship.status.charAt(0).toUpperCase() + d.relationship.status.slice(1)}
                        </span>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Type</p>
                        <p className="font-bold text-sm capitalize">{d.relationship.relationshipType}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Start Date</p>
                        <p className="font-bold text-sm">{new Date(d.relationship.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Can Manage Jobs</p>
                        <p className="font-bold text-sm text-success">{d.relationship.canManageCompanyJobs ? "Yes" : "No"}</p>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Achievements</p>
                <div className="grid grid-cols-2 gap-3">
                    {d.badges.map((b) => (
                        <div key={b.name} className="flex items-center gap-3 bg-base-200 border border-base-300 p-3">
                            <div className="w-9 h-9 flex items-center justify-center bg-primary/10 shrink-0">
                                <i className={`${b.icon} text-primary text-sm`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{b.name}</p>
                                <p className="text-sm text-base-content/40 capitalize">{b.tier}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Roles Tab ─────────────────────────────────────────────────────────── */

function RolesTab() {
    return (
        <div className="p-6 space-y-3">
            {d.roles.map((role) => (
                <div key={role.title} className="bg-base-200 border border-base-300 border-l-4 border-l-primary p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold mb-1">{role.title}</p>
                            <div className="flex items-center gap-3 text-sm text-base-content/50">
                                <span className="flex items-center gap-1">
                                    <i className="fa-duotone fa-regular fa-sitemap" /> {role.department}
                                </span>
                                <span className="flex items-center gap-1">
                                    <i className="fa-duotone fa-regular fa-location-dot" /> {role.location}
                                </span>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-primary whitespace-nowrap">{role.salary}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Contacts Tab ──────────────────────────────────────────────────────── */

function ContactsTab() {
    return (
        <div className="p-6">
            <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary">
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">Team Contacts</p>
                </div>
                <div className="divide-y divide-base-300">
                    {d.contacts.map((c) => (
                        <div key={c.name} className="flex items-center gap-4 px-6 py-4">
                            <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center text-sm font-black shrink-0">
                                {c.name.split(" ").map((w) => w[0]).join("").toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold">{c.name}</p>
                                <p className="text-sm text-base-content/50">{c.role}</p>
                            </div>
                            <a href={`mailto:${c.email}`} className="text-sm text-primary hover:underline truncate">
                                {c.email}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
