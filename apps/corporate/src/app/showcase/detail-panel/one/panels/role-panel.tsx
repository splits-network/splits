"use client";

import { data as d } from "./role-data";
import { PanelHeader, PanelTabs } from "./panel-header";

export function RolePanel() {
    return (
        <div>
            <PanelHeader
                kicker={d.department}
                badges={[
                    { label: "Active", className: "badge-success" },
                    ...(d.isNew ? [{ label: "New", className: "badge-warning badge-soft badge-outline" }] : []),
                    { label: d.employmentType, className: "badge-ghost" },
                    { label: d.jobLevel, className: "badge-ghost" },
                ]}
                avatar={{ initials: d.companyInitials }}
                title={d.title}
                subtitle={d.companyName}
                meta={[
                    { icon: "fa-duotone fa-regular fa-building", text: d.companyName },
                    { icon: "fa-duotone fa-regular fa-location-dot", text: d.location },
                ]}
                stats={d.stats}
                actions={[
                    { icon: "fa-duotone fa-regular fa-paper-plane", label: "Submit Candidate", className: "btn-primary btn-sm" },
                    { icon: "fa-duotone fa-regular fa-bookmark", label: "Save" },
                    { icon: "fa-duotone fa-regular fa-share-nodes", label: "Share" },
                ]}
            />
            <PanelTabs
                tabs={[
                    { label: "Recruiter Brief", value: "brief", icon: "fa-duotone fa-regular fa-file-lines" },
                    { label: "Candidate", value: "candidate", icon: "fa-duotone fa-regular fa-user" },
                    { label: "Financials", value: "financials", icon: "fa-duotone fa-regular fa-calculator" },
                    { label: "Company", value: "company", icon: "fa-duotone fa-regular fa-building" },
                ]}
            >
                {(tab) => {
                    if (tab === "brief") return <BriefTab />;
                    if (tab === "candidate") return <CandidateTab />;
                    if (tab === "financials") return <FinancialsTab />;
                    return <CompanyTab />;
                }}
            </PanelTabs>
        </div>
    );
}

/* ─── Grid Cell helper ──────────────────────────────────────────────── */
function Cell({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="bg-base-100 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">{label}</p>
            {children}
        </div>
    );
}

/* ─── Recruiter Brief ───────────────────────────────────────────────── */
function BriefTab() {
    return (
        <div className="space-y-8 p-6">
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Recruiter Brief</p>
                <p className="text-sm text-base-content/70 leading-relaxed">{d.recruiterDescription}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                <Cell label="Commute"><p className="font-bold text-sm">{d.commute}</p></Cell>
                <Cell label="Department"><p className="font-bold text-sm">{d.department}</p></Cell>
                <Cell label="Guarantee"><p className="font-bold text-sm">{d.guaranteeDays} days</p></Cell>
                <Cell label="Level"><p className="font-bold text-sm">{d.jobLevel}</p></Cell>
                <Cell label="Relocation"><p className="font-bold text-sm text-secondary">Open to relocation</p></Cell>
            </div>
            <ReqList title="Must Have" items={d.mandatoryRequirements} icon="fa-check" color="text-primary" />
            <ReqList title="Preferred" items={d.preferredRequirements} icon="fa-arrow-right" color="text-secondary" />
            <SkillRow title="Required Skills" skills={d.requiredSkills} cls="badge badge-primary" />
            <SkillRow title="Nice-to-Have Skills" skills={d.preferredSkills} cls="badge badge-soft badge-outline" />
        </div>
    );
}

function ReqList({ title, items, icon, color }: { title: string; items: { id: string; description: string }[]; icon: string; color: string }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">{title}</p>
            <ul className="space-y-2">
                {items.map((r) => (
                    <li key={r.id} className="flex items-start gap-3 text-base-content/70">
                        <i className={`fa-duotone fa-regular ${icon} ${color} text-sm mt-1 flex-shrink-0`} />
                        <span className="text-sm leading-relaxed">{r.description}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SkillRow({ title, skills, cls }: { title: string; skills: string[]; cls: string }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">{title}</p>
            <div className="flex flex-wrap gap-2">
                {skills.map((s) => <span key={s} className={cls}>{s}</span>)}
            </div>
        </div>
    );
}

/* ─── Candidate Description ─────────────────────────────────────────── */
function CandidateTab() {
    return (
        <div className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Candidate Description</p>
            <p className="text-sm text-base-content/70 leading-relaxed">{d.candidateDescription}</p>
        </div>
    );
}

/* ─── Financials ────────────────────────────────────────────────────── */
function FinancialsTab() {
    return (
        <div className="space-y-6 p-6">
            <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                <Cell label="Compensation"><p className="text-lg font-black tracking-tight">{d.salaryDisplay}</p></Cell>
                <Cell label="Fee"><p className="text-lg font-black tracking-tight">{d.feePercentage}%</p></Cell>
                <Cell label="Guarantee"><p className="text-lg font-black tracking-tight">{d.guaranteeDays} days</p></Cell>
            </div>
            <div className="border-l-4 border-primary bg-base-100 shadow-sm p-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    <i className="fa-duotone fa-regular fa-calculator mr-2" />Payout Estimate
                </p>
                <div className="grid grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-200 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">At Min Salary</p>
                        <p className="text-lg font-black tracking-tight text-primary">$36,000</p>
                        <p className="text-sm text-base-content/40">20% of $180K</p>
                    </div>
                    <div className="bg-base-200 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">At Max Salary</p>
                        <p className="text-lg font-black tracking-tight text-primary">$44,000</p>
                        <p className="text-sm text-base-content/40">20% of $220K</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Company ───────────────────────────────────────────────────────── */
function CompanyTab() {
    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-lg">{d.companyInitials}</div>
                <div>
                    <p className="text-lg font-black">{d.companyName}</p>
                    <p className="text-sm text-base-content/50">{d.companyIndustry}</p>
                    <p className="text-sm text-base-content/50"><i className="fa-duotone fa-regular fa-location-dot mr-1" />{d.companyHQ}</p>
                </div>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">About</p>
                <p className="text-sm text-base-content/70 leading-relaxed">{d.companyDescription}</p>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">Website</p>
                <span className="text-sm text-primary"><i className="fa-duotone fa-regular fa-globe mr-1" />{d.companyWebsite}</span>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Team Members</p>
                <div className="space-y-[2px] bg-base-300">
                    {d.teamMembers.map((m) => (
                        <div key={m.name} className="flex items-center gap-3 bg-base-100 p-4">
                            <div className="w-9 h-9 flex items-center justify-center bg-base-200 border border-base-300 text-sm font-bold text-base-content/60">{m.initials}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{m.name}</p>
                                <p className="text-sm text-base-content/40 truncate">{m.email}</p>
                            </div>
                            <span className="text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 bg-base-200 text-base-content/50 shrink-0">{m.role}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
