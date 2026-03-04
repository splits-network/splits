"use client";

import { data as d } from "./candidate-data";
import { PanelHeader, PanelTabs } from "./panel-header";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const JOB_TYPE_LABELS: Record<string, string> = { full_time: "Full Time", contract: "Contract", freelance: "Freelance", part_time: "Part Time" };
const AVAIL_LABELS: Record<string, string> = { immediate: "Immediate", two_weeks: "2 Weeks", one_month: "1 Month", three_months: "3 Months", not_looking: "Not Looking" };

function salaryDisplay(): string {
    const min = d.desiredSalaryMin ? `$${d.desiredSalaryMin.toLocaleString()}` : "";
    const max = d.desiredSalaryMax ? `$${d.desiredSalaryMax.toLocaleString()}` : "";
    if (min && max) return `${min} - ${max}`;
    return min || max || "N/A";
}

/* ─── Panel ─────────────────────────────────────────────────────────────── */

export function CandidatePanel() {
    return (
        <div>
            <PanelHeader
                kicker={d.currentCompany}
                badges={[
                    { label: "Verified", className: "badge-success" },
                    ...(d.isNew ? [{ label: "New", className: "badge-warning badge-soft badge-outline" }] : []),
                    { label: "Open to Work", className: "badge-info badge-soft" },
                ]}
                avatar={{ initials: d.initials }}
                title={d.name}
                subtitle={d.currentTitle}
                meta={[
                    { icon: "fa-duotone fa-regular fa-envelope", text: d.email },
                    { icon: "fa-duotone fa-regular fa-phone", text: d.phone },
                    { icon: "fa-duotone fa-regular fa-location-dot", text: d.location },
                ]}
                stats={d.stats}
                actions={[
                    { icon: "fa-duotone fa-regular fa-paper-plane", label: "Send Opportunity", className: "btn-primary btn-sm" },
                    { icon: "fa-duotone fa-regular fa-handshake", label: "Request to Represent" },
                    { icon: "fa-duotone fa-regular fa-bookmark", label: "Save" },
                ]}
            />

            {/* Social links row */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-base-300 bg-base-100">
                <a href={d.linkedinUrl} className="text-sm font-bold text-base-content/50 hover:text-primary flex items-center gap-1.5">
                    <i className="fa-brands fa-linkedin" /> LinkedIn
                </a>
                <a href={d.githubUrl} className="text-sm font-bold text-base-content/50 hover:text-primary flex items-center gap-1.5">
                    <i className="fa-brands fa-github" /> GitHub
                </a>
                <a href={d.portfolioUrl} className="text-sm font-bold text-base-content/50 hover:text-primary flex items-center gap-1.5">
                    <i className="fa-duotone fa-regular fa-globe" /> Portfolio
                </a>
            </div>

            <PanelTabs
                tabs={[
                    { label: "Overview", value: "overview", icon: "fa-duotone fa-regular fa-user" },
                    { label: "Resume", value: "resume", icon: "fa-duotone fa-regular fa-file-user" },
                    { label: "Applications", value: "applications", icon: "fa-duotone fa-regular fa-briefcase" },
                    { label: "Documents", value: "documents", icon: "fa-duotone fa-regular fa-file-lines" },
                ]}
            >
                {(tab) => {
                    if (tab === "overview") return <OverviewTab />;
                    if (tab === "resume") return <ResumeTab />;
                    if (tab === "applications") return <ApplicationsTab />;
                    return <DocumentsTab />;
                }}
            </PanelTabs>
        </div>
    );
}

/* ─── Overview Tab ──────────────────────────────────────────────────────── */

function OverviewTab() {
    return (
        <div className="space-y-8 p-6">
            {/* About / Bio */}
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">About</p>
                <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line">{d.bio}</p>
            </div>

            {/* Career Preferences */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Career Preferences</p>
                <div className="grid grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Desired Salary</p>
                        <p className="text-lg font-black tracking-tight">{salaryDisplay()}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Job Type</p>
                        <p className="text-lg font-black tracking-tight capitalize">{JOB_TYPE_LABELS[d.desiredJobType] || d.desiredJobType}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Availability</p>
                        <p className="text-lg font-black tracking-tight capitalize">{AVAIL_LABELS[d.availability] || d.availability}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Work Mode</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {d.openToRemote && (
                                <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-success/15 text-success">Remote</span>
                            )}
                            {d.openToRelocation && (
                                <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-info/15 text-info">Relocation</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills & Expertise */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Skills & Expertise</p>
                <div className="flex flex-wrap gap-2">
                    {d.skills.map((s) => (
                        <span key={s} className="bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">{s}</span>
                    ))}
                </div>
            </div>

            {/* Profile Status */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Profile Status</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Representation</p>
                        <p className="font-bold text-sm text-success flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-user-check" /> Your Candidate
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Verification</p>
                        <p className="font-bold text-sm capitalize">{d.verificationStatus}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Marketplace</p>
                        <p className="font-bold text-sm capitalize">{d.marketplaceVisibility}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Onboarding</p>
                        <p className="font-bold text-sm capitalize">{d.onboardingStatus}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Profile Created</p>
                        <p className="font-bold text-sm">{new Date(d.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Achievements</p>
                <div className="grid grid-cols-3 gap-3">
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

/* ─── Resume Tab ────────────────────────────────────────────────────────── */

function ResumeTab() {
    return (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center">
                <i className="fa-duotone fa-regular fa-file-user text-3xl text-base-content/20 mb-4 block" />
                <h3 className="text-lg font-black tracking-tight mb-2">No Resume on File</h3>
                <p className="text-sm text-base-content/40">Resume parsing is not yet available. Upload documents in the Documents tab.</p>
            </div>
        </div>
    );
}

/* ─── Applications Tab ──────────────────────────────────────────────────── */

function ApplicationsTab() {
    return (
        <div className="p-6 space-y-[2px] bg-base-300">
            {d.applications.map((app) => (
                <div key={app.id} className="bg-base-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h4 className="font-bold text-sm tracking-tight">{app.jobTitle}</h4>
                            <p className="text-sm text-base-content/60 mt-0.5">{app.companyName}</p>
                        </div>
                        <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-base-200 text-base-content/60">
                            {app.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Documents Tab ─────────────────────────────────────────────────────── */

function DocumentsTab() {
    return (
        <div className="p-6 space-y-4">
            <div className="bg-base-200 border border-base-300 p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <i className="fa-duotone fa-regular fa-file-pdf text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{d.resumeName}</p>
                    <p className="text-sm text-base-content/40">Resume</p>
                </div>
                <button className="btn btn-sm btn-ghost"><i className="fa-duotone fa-regular fa-download" /></button>
            </div>
            {d.certifications.map((cert) => (
                <div key={cert} className="bg-base-200 border border-base-300 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center shrink-0">
                        <i className="fa-duotone fa-regular fa-certificate text-secondary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{cert}</p>
                        <p className="text-sm text-base-content/40">Certification</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
