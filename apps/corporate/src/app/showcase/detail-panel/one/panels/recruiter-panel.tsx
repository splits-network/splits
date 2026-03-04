"use client";

import { data as d } from "./recruiter-data";
import { PanelHeader, PanelTabs } from "./panel-header";

export function RecruiterPanel() {
    return (
        <div>
            <PanelHeader
                kicker={d.firmName}
                badges={[
                    { label: "Active", className: "badge-success" },
                    { label: "Online", className: "badge-info" },
                    { label: "New", className: "badge-warning badge-soft badge-outline" },
                ]}
                avatar={{ initials: d.initials }}
                title={d.name}
                subtitle={d.tagline}
                meta={[
                    { icon: "fa-duotone fa-regular fa-location-dot", text: d.location },
                    { icon: "fa-duotone fa-regular fa-calendar", text: `Member since ${d.memberSince}` },
                ]}
                stats={d.stats}
                actions={[
                    { icon: "fa-duotone fa-regular fa-envelope", label: "Message", className: "btn-primary btn-sm" },
                    { icon: "fa-duotone fa-regular fa-user-plus", label: "Connect" },
                    { icon: "fa-duotone fa-regular fa-arrow-up-right-from-square", label: "Profile" },
                ]}
            />
            <PanelTabs
                tabs={[
                    { label: "About", value: "about", icon: "fa-duotone fa-regular fa-user" },
                    { label: "Contact", value: "contact", icon: "fa-duotone fa-regular fa-address-book" },
                ]}
            >
                {(tab) => tab === "about" ? <AboutTab /> : <ContactTab />}
            </PanelTabs>
        </div>
    );
}

function AboutTab() {
    return (
        <div className="space-y-8 p-6">
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">About</p>
                <p className="text-sm text-base-content/70 leading-relaxed">{d.bio}</p>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Specializations</p>
                <div className="flex flex-wrap gap-2">
                    {d.specialties.map((s) => (
                        <span key={s} className="badge badge-primary">{s}</span>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Industries</p>
                <div className="flex flex-wrap gap-2">
                    {d.industries.map((ind) => (
                        <span key={ind} className="badge badge-soft badge-outline">{ind}</span>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Partnership</p>
                <div className="flex flex-wrap gap-2">
                    <span className={`badge gap-2 ${d.isCompanyRecruiter ? "badge-primary" : "badge-ghost"}`}>
                        <i className="fa-duotone fa-regular fa-building" /> Company Recruiter
                    </span>
                    <span className={`badge gap-2 ${d.isCandidateRecruiter ? "badge-secondary" : "badge-ghost"}`}>
                        <i className="fa-duotone fa-regular fa-user-tie" /> Candidate Recruiter
                    </span>
                </div>
            </div>
        </div>
    );
}

function ContactTab() {
    const items = [
        { icon: "fa-duotone fa-regular fa-envelope", label: "Email", value: d.email },
        { icon: "fa-duotone fa-regular fa-phone", label: "Phone", value: d.phone },
        { icon: "fa-duotone fa-regular fa-location-dot", label: "Location", value: d.location },
    ];

    return (
        <div className="p-6">
            <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary">
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">Contact</p>
                </div>
                <div className="divide-y divide-base-300">
                    {items.map((c) => (
                        <div key={c.label} className="flex items-center gap-4 px-6 py-4">
                            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                <i className={`${c.icon} text-primary text-xs`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">{c.label}</p>
                                <p className="text-sm font-semibold text-base-content truncate">{c.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
