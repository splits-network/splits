"use client";

import { data as d } from "./application-data";
import { PanelHeader, PanelTabs } from "./panel-header";

const STAGE_BADGE: Record<string, string> = { submitted: "badge-info", screening: "badge-info", interview: "badge-warning", offer: "badge-success", hired: "badge-success", rejected: "badge-error" };

export function ApplicationPanel() {
    return (
        <div>
            <PanelHeader
                kicker={`Submitted ${d.submittedAt}`}
                badges={[{ label: d.stage.charAt(0).toUpperCase() + d.stage.slice(1), className: STAGE_BADGE[d.stage] || "badge-info" }]}
                avatar={{ initials: d.candidate.initials }}
                title={d.candidate.fullName}
                subtitle={`${d.job.title} at ${d.job.company.name}`}
                meta={[
                    { icon: "fa-duotone fa-regular fa-briefcase", text: d.candidate.currentTitle },
                    { icon: "fa-duotone fa-regular fa-building", text: d.candidate.currentCompany },
                ]}
                stats={d.stats}
                actions={[
                    { icon: "fa-duotone fa-regular fa-arrow-right", label: "Advance", className: "btn-success btn-sm" },
                    { icon: "fa-duotone fa-regular fa-xmark", label: "Reject", className: "btn-ghost btn-sm text-error" },
                    { icon: "fa-duotone fa-regular fa-comment", label: "Note" },
                ]}
            />
            <PanelTabs tabs={[
                { label: "Overview", value: "overview", icon: "fa-duotone fa-regular fa-clipboard" },
                { label: "Candidate", value: "candidate", icon: "fa-duotone fa-regular fa-user" },
                { label: "Role", value: "role", icon: "fa-duotone fa-regular fa-briefcase" },
                { label: "AI Analysis", value: "ai", icon: "fa-duotone fa-regular fa-brain" },
                { label: "Documents", value: "docs", icon: "fa-duotone fa-regular fa-file" },
                { label: "Notes", value: "notes", icon: "fa-duotone fa-regular fa-comments" },
                { label: "Timeline", value: "timeline", icon: "fa-duotone fa-regular fa-timeline" },
            ]}>
                {(tab) => {
                    if (tab === "overview") return <OverviewTab />;
                    if (tab === "candidate") return <CandidateTab />;
                    if (tab === "role") return <RoleTab />;
                    if (tab === "ai") return <AITab />;
                    if (tab === "docs") return <DocsTab />;
                    if (tab === "notes") return <NotesTab />;
                    return <TimelineTab />;
                }}
            </PanelTabs>
        </div>
    );
}

/* ─── Overview ──────────────────────────────────────────────────────── */
function OverviewTab() {
    return (
        <div className="space-y-6 p-6">
            <SummaryCard title="Role Summary" border="border-primary" heading={d.job.title} sub={d.job.company.name}
                metas={[
                    { icon: "fa-location-dot", color: "text-primary", text: d.job.location },
                    { icon: "fa-briefcase", color: "text-secondary", text: d.job.employmentType },
                    { icon: "fa-money-bill-wave", color: "text-accent", text: d.job.salaryDisplay },
                ]}
                body={d.job.recruiterDescription} />
            <SummaryCard title="Candidate Summary" border="border-secondary" heading={d.candidate.fullName}
                sub={`${d.candidate.currentTitle} at ${d.candidate.currentCompany}`}
                metas={[
                    { icon: "fa-envelope", color: "text-secondary", text: d.candidate.email },
                    { icon: "fa-phone", color: "text-primary", text: d.candidate.phone },
                    { icon: "fa-location-dot", color: "text-accent", text: d.candidate.location },
                ]}
                body={d.candidate.bio} />
            <div className="flex items-center gap-2 text-sm text-base-content/50">
                <i className="fa-duotone fa-regular fa-calendar" /> Submitted {d.submittedAt}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <PersonCard label="Candidate Recruiter" {...d.candidateRecruiter} border="border-primary" avatar="bg-primary text-primary-content" />
                    <SourcerRow label="Candidate Sourcer" name={d.candidateSourcer.name} initials={d.candidateSourcer.initials} accent="text-primary" border="border-primary" />
                </div>
                <div className="space-y-3">
                    <PersonCard label="Company Recruiter" {...d.companyRecruiter} border="border-secondary" avatar="bg-secondary text-secondary-content" />
                    <SourcerRow label="Company Sourcer" name={null} initials="?" accent="text-secondary" border="border-secondary" />
                </div>
            </div>
            <div className="bg-base-200 border-l-4 border-info p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-info text-info-content flex items-center justify-center font-black text-lg shrink-0">{d.aiReview.fitScore}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">AI Fit Score</p>
                    <p className="text-sm text-base-content/60 truncate">{d.aiReview.summary.slice(0, 80)}...</p>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, border, heading, sub, metas, body }: {
    title: string; border: string; heading: string; sub: string;
    metas: { icon: string; color: string; text: string }[]; body: string;
}) {
    return (
        <div className={`bg-base-100 border-l-4 ${border} p-6`}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">{title}</p>
            <p className="text-lg font-black tracking-tight">{heading}</p>
            <p className="text-sm text-base-content/60">{sub}</p>
            <div className="flex flex-wrap gap-4 text-sm text-base-content/60 mt-3">
                {metas.map((m) => (
                    <span key={m.text} className="flex items-center gap-2">
                        <i className={`fa-duotone fa-regular ${m.icon} ${m.color}`} />{m.text}
                    </span>
                ))}
            </div>
            <div className="text-sm text-base-content/60 leading-relaxed pt-3 mt-3 border-t border-base-300">{body}</div>
        </div>
    );
}

function PersonCard({ label, name, email, initials, border, avatar }: {
    label: string; name: string; email: string; initials: string; border: string; avatar: string;
}) {
    return (
        <div className={`bg-base-100 border-l-4 ${border} p-6`}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">{label}</p>
            <div className="flex gap-4 items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${avatar}`}>{initials}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-lg font-black tracking-tight truncate">{name}</p>
                    <p className="text-sm text-primary font-bold truncate">{email}</p>
                </div>
            </div>
        </div>
    );
}

function SourcerRow({ label, name, initials, accent, border }: {
    label: string; name: string | null; initials: string; accent: string; border: string;
}) {
    return (
        <div className={`bg-base-200/50 border-l-4 ${border} px-4 py-3 flex items-center gap-3`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${name ? `${accent} bg-base-300` : "bg-base-200 text-base-content/30"}`}>{initials}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-base-content/40 uppercase tracking-[0.15em] font-bold">{label}</p>
                <p className="text-sm font-bold truncate">{name || "Not yet assigned"}</p>
            </div>
        </div>
    );
}

/* ─── Candidate ─────────────────────────────────────────────────────── */
function CandidateTab() {
    const c = d.candidate;
    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-envelope" /> {c.email}</span>
                <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-phone" /> {c.phone}</span>
                <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-location-dot" /> {c.location}</span>
            </div>
            <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-success/15 text-success inline-block">Verified</span>
            <div className="flex flex-wrap gap-3">
                <span className="text-sm font-bold text-base-content/50 flex items-center gap-1.5"><i className="fa-brands fa-linkedin" /> LinkedIn</span>
                <span className="text-sm font-bold text-base-content/50 flex items-center gap-1.5"><i className="fa-brands fa-github" /> GitHub</span>
            </div>
            <div className="border-l-4 border-primary pl-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">About</p>
                <p className="text-sm text-base-content/70 leading-relaxed">{c.bio}</p>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Career Preferences</p>
                <div className="grid grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4"><p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Desired Salary</p><p className="text-lg font-black tracking-tight">{c.desiredSalary}</p></div>
                    <div className="bg-base-100 p-4"><p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Job Type</p><p className="text-lg font-black tracking-tight">{c.desiredJobType}</p></div>
                    <div className="bg-base-100 p-4"><p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Availability</p><p className="text-lg font-black tracking-tight">{c.availability}</p></div>
                    <div className="bg-base-100 p-4"><p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Work Mode</p>
                        <div className="flex gap-1.5 mt-1">
                            <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-success/15 text-success">Remote</span>
                            <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-info/15 text-info">Relocation</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Skills & Expertise</p>
                <div className="flex flex-wrap gap-2">
                    {c.skills.map((s) => <span key={s} className="bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">{s}</span>)}
                </div>
            </div>
        </div>
    );
}

/* ─── Role ──────────────────────────────────────────────────────────── */
function RoleTab() {
    const j = d.job;
    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                <span><i className="fa-duotone fa-regular fa-building mr-1" />{j.company.name}</span>
                <span><i className="fa-duotone fa-regular fa-location-dot mr-1" />{j.location}</span>
                <span><i className="fa-duotone fa-regular fa-briefcase mr-1" />{j.employmentType}</span>
            </div>
            <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-3"><p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-0.5">Compensation</p><p className="text-sm font-black tracking-tight">{j.salaryDisplay}</p></div>
                <div className="bg-base-100 p-3"><p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-0.5">Fee</p><p className="text-sm font-black tracking-tight">{j.feePercentage}%</p></div>
                <div className="bg-base-100 p-3"><p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-0.5">Candidates</p><p className="text-sm font-black tracking-tight">34</p></div>
            </div>
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Recruiter Brief</p>
                <p className="text-sm text-base-content/70 leading-relaxed">{j.recruiterDescription}</p>
            </div>
        </div>
    );
}

/* ─── AI Analysis ───────────────────────────────────────────────────── */
function AITab() {
    const ai = d.aiReview;
    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-info text-info-content flex items-center justify-center font-black text-2xl shrink-0">{ai.fitScore}</div>
                <div><p className="text-lg font-black tracking-tight">AI Fit Score</p><p className="text-sm text-base-content/50">Strong technical match</p></div>
            </div>
            <div className="border-l-4 border-l-info pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Analysis Summary</p>
                <p className="text-sm text-base-content/70 leading-relaxed">{ai.summary}</p>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Strengths</p>
                <ul className="space-y-2">{ai.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-base-content/70"><i className="fa-duotone fa-regular fa-check text-success text-sm mt-1 flex-shrink-0" /><span className="text-sm leading-relaxed">{s}</span></li>
                ))}</ul>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Concerns</p>
                <ul className="space-y-2">{ai.concerns.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-base-content/70"><i className="fa-duotone fa-regular fa-triangle-exclamation text-warning text-sm mt-1 flex-shrink-0" /><span className="text-sm leading-relaxed">{c}</span></li>
                ))}</ul>
            </div>
        </div>
    );
}

/* ─── Documents ─────────────────────────────────────────────────────── */
function DocsTab() {
    const icons: Record<string, string> = { resume: "fa-file-user", cover_letter: "fa-file-lines" };
    return (
        <div className="p-6"><div className="border-l-4 border-primary">
            <div className="px-6 py-3 border-b border-base-300"><p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30">Documents</p></div>
            <div className="divide-y divide-base-200">{d.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between px-6 py-3 bg-base-200/50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <i className={`fa-duotone fa-regular ${icons[doc.documentType] || "fa-file"} text-primary`} />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{doc.fileName}</p>
                            <p className="text-sm text-base-content/50">{doc.documentType.replace("_", " ").toUpperCase()} &bull; {(doc.fileSize / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    {doc.isPrimary && <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-0.5 bg-primary/15 text-primary">Primary</span>}
                </div>
            ))}</div>
        </div></div>
    );
}

/* ─── Notes ─────────────────────────────────────────────────────────── */
function NotesTab() {
    const colors: Record<string, string> = { candidate_recruiter: "bg-primary text-primary-content", company_admin: "bg-secondary text-secondary-content" };
    return (
        <div className="space-y-4 p-6">{d.notes.map((n) => (
            <div key={n.id} className="bg-base-200/50 border-l-4 border-base-300 p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${colors[n.creatorType] || "bg-base-300"}`}>{n.initials}</div>
                    <div><p className="text-sm font-bold">{n.author}</p><p className="text-sm text-base-content/40">{n.createdAt}</p></div>
                </div>
                <p className="text-sm text-base-content/70 leading-relaxed">{n.content}</p>
            </div>
        ))}</div>
    );
}

/* ─── Timeline ──────────────────────────────────────────────────────── */
function TimelineTab() {
    return (
        <div className="p-6"><div className="space-y-0">{d.timeline.map((ev, i) => (
            <div key={i} className="flex gap-4 pb-5 relative">
                {i < d.timeline.length - 1 && <div className="absolute left-[14px] top-8 bottom-0 w-px bg-base-300" />}
                <div className="w-7 h-7 bg-primary text-primary-content flex items-center justify-center shrink-0">
                    <i className={`fa-duotone fa-regular ${ev.icon} text-xs`} />
                </div>
                <div className="pt-0.5">
                    <p className="text-sm font-bold">{ev.action}</p>
                    <p className="text-sm text-base-content/60">{ev.actor}</p>
                    <p className="text-sm text-base-content/30 mt-1">{ev.date} {ev.time}</p>
                </div>
            </div>
        ))}</div></div>
    );
}
