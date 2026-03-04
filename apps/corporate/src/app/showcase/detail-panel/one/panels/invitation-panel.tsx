"use client";

import { data as d } from "./invitation-data";
import { PanelHeader, PanelTabs } from "./panel-header";

const statusBadge: Record<string, string> = {
    pending: "badge-warning", representing: "badge-success", declined: "badge-error",
    expired: "badge-ghost", revoked: "badge-error badge-outline", cancelled: "badge-error badge-outline",
};

export function InvitationPanel() {
    return (
        <div>
            <PanelHeader
                kicker={d.companyNameHint}
                badges={[
                    { label: d.status.charAt(0).toUpperCase() + d.status.slice(1), className: statusBadge[d.status] || "badge-warning" },
                    ...(d.emailSent ? [{ label: "Email Sent", className: "badge-success badge-outline" }] : []),
                    ...(d.expiringSoon ? [{ label: "Expires Soon", className: "badge-error badge-outline" }] : []),
                ]}
                avatar={{ initials: d.candidateInitials }}
                title={d.candidateName}
                subtitle={d.candidateTitle}
                meta={[
                    { icon: "fa-duotone fa-regular fa-envelope", text: d.candidateEmail },
                    { icon: "fa-duotone fa-regular fa-location-dot", text: d.candidateLocation },
                ]}
                stats={d.stats}
                actions={[
                    { icon: "fa-duotone fa-regular fa-paper-plane", label: "Resend", className: "btn-primary btn-sm" },
                    { icon: "fa-duotone fa-regular fa-user", label: "View Candidate" },
                    { icon: "fa-duotone fa-regular fa-ban", label: "Cancel", className: "btn-ghost btn-sm text-error" },
                ]}
            />
            <PanelTabs
                tabs={[
                    { label: "Details", value: "details", icon: "fa-duotone fa-regular fa-circle-info" },
                    { label: "History", value: "history", icon: "fa-duotone fa-regular fa-clock-rotate-left" },
                ]}
            >
                {(tab) => (tab === "details" ? <DetailsTab /> : <HistoryTab />)}
            </PanelTabs>
        </div>
    );
}

function DetailsTab() {
    const fmt = (s: string | null) => {
        if (!s) return "N/A";
        return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const dates = [
        { label: "Invited", value: fmt(d.invitedAt), cls: "" },
        { label: "Expires", value: fmt(d.expiresAt), cls: "" },
        ...(d.consentGivenAt ? [{ label: "Accepted", value: fmt(d.consentGivenAt), cls: "border-success/30 bg-success/5 text-success" }] : []),
        ...(d.declinedAt ? [{ label: "Declined", value: fmt(d.declinedAt), cls: "border-error/30 bg-error/5 text-error" }] : []),
        ...(d.emailSentAt ? [{ label: "Email Sent", value: fmt(d.emailSentAt), cls: "" }] : []),
    ];

    return (
        <div className="space-y-8 p-6">
            {/* Candidate Info Card */}
            <div className="border-2 border-base-300 p-4">
                <SectionLabel icon="fa-user text-primary">Candidate Information</SectionLabel>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm text-base-content/60">
                        {d.candidateInitials}
                    </div>
                    <div>
                        <p className="font-bold text-sm">{d.candidateName}</p>
                        <p className="text-sm text-base-content/50">{d.candidateEmail}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[["Title", d.candidateTitle], ["Company", d.candidateCompany], ["Location", d.candidateLocation], ["Phone", d.candidatePhone]].map(([l, v]) => (
                        <div key={l} className="p-3 border border-base-200">
                            <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/40 mb-1">{l}</p>
                            <p className="text-sm font-semibold">{v}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Personal Message */}
            {d.personalMessage && (
                <div className="border-l-4 border-l-primary pl-6">
                    <SectionLabel>Personal Message</SectionLabel>
                    <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">{d.personalMessage}</p>
                </div>
            )}

            {/* Invite Code & Link */}
            <div>
                <SectionLabel>Invitation Details</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Invite Code</p>
                        <p className="text-sm font-black tracking-tight font-mono">{d.inviteCode}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">Invite Link</p>
                        <p className="text-sm font-bold truncate">{d.inviteLink}</p>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div>
                <SectionLabel icon="fa-clock text-primary">Timeline</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dates.map((item) => (
                        <div key={item.label} className={`p-3 border ${item.cls || "border-base-200"}`}>
                            <p className={`text-sm font-bold uppercase tracking-[0.15em] mb-1 ${item.cls ? "" : "text-base-content/40"}`}>{item.label}</p>
                            <p className="text-sm font-semibold">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decline Reason */}
            {d.declinedAt && d.declinedReason && (
                <div>
                    <SectionLabel icon="fa-times-circle text-error">Decline Reason</SectionLabel>
                    <div className="p-3 border border-error/30 bg-error/5 text-sm text-base-content/70">{d.declinedReason}</div>
                </div>
            )}

            {/* Verification */}
            <div>
                <SectionLabel icon="fa-badge-check text-success">Verification</SectionLabel>
                <div className="flex items-center gap-3 text-sm">
                    <i className={`fa-duotone fa-regular ${d.candidateVerification === "verified" ? "fa-check-circle text-success" : "fa-clock text-warning"}`} />
                    <span className="text-base-content/75 capitalize">{d.candidateVerification}</span>
                </div>
            </div>

            {/* Permissions */}
            <div>
                <SectionLabel>Permissions</SectionLabel>
                <div className="flex items-center gap-3 text-sm">
                    <i className={`fa-duotone fa-regular ${d.canManageCompanyJobs ? "fa-check-circle text-success" : "fa-times-circle text-base-content/30"}`} />
                    <span className="text-base-content/75">Can manage company jobs</span>
                </div>
                {d.canManageCompanyJobs && (
                    <div className="p-3 border-2 border-success/20 mt-3 text-sm text-base-content/70">
                        <i className="fa-duotone fa-regular fa-info-circle mr-1 text-success" />
                        You can create and edit job postings for this company.
                    </div>
                )}
            </div>

            {/* Invited By */}
            <div className="border-t-2 border-base-300 pt-6">
                <SectionLabel>Invited By</SectionLabel>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm">{d.recruiter.initials}</div>
                    <div>
                        <p className="font-bold">{d.recruiter.name}</p>
                        <p className="text-sm text-base-content/50">{d.recruiter.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HistoryTab() {
    return (
        <div className="p-6">
            <div className="space-y-0">
                {d.history.map((h, i) => (
                    <div key={i} className="flex gap-4 pb-5 relative">
                        {i < d.history.length - 1 && <div className="absolute left-[14px] top-8 bottom-0 w-px bg-base-300" />}
                        <div className="w-7 h-7 bg-primary text-primary-content flex items-center justify-center shrink-0">
                            <i className="fa-duotone fa-regular fa-circle text-xs" />
                        </div>
                        <div className="pt-0.5">
                            <p className="text-sm font-bold">{h.action}</p>
                            <p className="text-sm text-base-content/40">{h.date} at {h.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: string }) {
    return (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
            {icon && <i className={`fa-duotone fa-regular ${icon} mr-1`} />}
            {children}
        </p>
    );
}
