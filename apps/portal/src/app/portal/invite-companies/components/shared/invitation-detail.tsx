"use client";

import { useState, type ReactNode } from "react";
import { PanelHeader, PanelTabs } from "@splits-network/basel-ui";
import type { CompanyInvitation } from "../../types";
import { statusBadgeClass, statusIcon } from "./status-color";
import {
    formatStatus,
    formatDate,
    getDaysUntilExpiry,
    isExpiringSoon,
    getInviteLink,
    recruiterName,
    recruiterInitials,
} from "./helpers";
import InvitationActionsToolbar from "./actions-toolbar";

export function InvitationDetail({
    invitation,
    onClose,
    onRefresh,
}: {
    invitation: CompanyInvitation;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const name = invitation.company_name_hint || "Company Invitation";
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const daysLeft = invitation.expires_at
        ? getDaysUntilExpiry(invitation.expires_at)
        : null;
    const expiringSoon = isExpiringSoon(invitation);

    return (
        <div>
            <PanelHeader
                kicker="Company Invitation"
                badges={[
                    {
                        label: formatStatus(invitation.status),
                        className: statusBadgeClass(invitation.status),
                    },
                    ...(invitation.email_sent_at
                        ? [{ label: "Email Sent", className: "badge-success badge-outline" }]
                        : []),
                    ...(expiringSoon
                        ? [{ label: "Expires Soon", className: "badge-error badge-outline" }]
                        : []),
                ]}
                avatar={{ initials }}
                title={name}
                subtitle={invitation.invited_email}
                meta={[
                    ...(invitation.invited_email
                        ? [{ icon: "fa-duotone fa-regular fa-envelope", text: invitation.invited_email }]
                        : []),
                    {
                        icon: "fa-duotone fa-regular fa-calendar",
                        text: `Created ${formatDate(invitation.created_at)}`,
                    },
                ]}
                stats={[
                    {
                        label: "Days Left",
                        value:
                            daysLeft !== null
                                ? daysLeft > 0
                                    ? `${daysLeft}d`
                                    : "Expired"
                                : "\u2014",
                        icon: "fa-duotone fa-regular fa-hourglass-half",
                    },
                    {
                        label: "Status",
                        value: formatStatus(invitation.status),
                        icon: `fa-duotone fa-regular ${statusIcon(invitation.status)}`,
                    },
                ]}
                actions={
                    <InvitationActionsToolbar
                        invitation={invitation}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                    />
                }
                onClose={onClose}
            />

            <PanelTabs
                tabs={[
                    { label: "Details", value: "details", icon: "fa-duotone fa-regular fa-circle-info" },
                    { label: "History", value: "history", icon: "fa-duotone fa-regular fa-clock-rotate-left" },
                ]}
            >
                {(tab) =>
                    tab === "details" ? (
                        <DetailsTab invitation={invitation} />
                    ) : (
                        <HistoryTab invitation={invitation} />
                    )
                }
            </PanelTabs>
        </div>
    );
}

/* ─── Details Tab ─────────────────────────────────────────────────────── */

function DetailsTab({ invitation }: { invitation: CompanyInvitation }) {
    const daysLeft = invitation.expires_at
        ? getDaysUntilExpiry(invitation.expires_at)
        : null;

    const dates = [
        { label: "Created", value: formatDate(invitation.created_at), cls: "" },
        {
            label: "Expires",
            value: invitation.expires_at ? formatDate(invitation.expires_at) : "\u2014",
            cls: daysLeft !== null && daysLeft <= 0 ? "border-error/30 bg-error/5 text-error" : "",
        },
        ...(invitation.accepted_at
            ? [{ label: "Accepted", value: formatDate(invitation.accepted_at), cls: "border-success/30 bg-success/5 text-success" }]
            : []),
        ...(invitation.email_sent_at
            ? [{ label: "Email Sent", value: formatDate(invitation.email_sent_at), cls: "" }]
            : []),
    ];

    return (
        <div className="space-y-8 p-6">
            {/* Invitation Details */}
            <div>
                <SectionLabel>Invitation Details</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40">Invite Code</p>
                            <CopyButton value={invitation.invite_code} />
                        </div>
                        <p className="text-sm font-black tracking-tight font-mono">{invitation.invite_code}</p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40">Invite Link</p>
                            <CopyButton value={getInviteLink(invitation)} />
                        </div>
                        <p className="text-sm font-bold truncate">{getInviteLink(invitation)}</p>
                    </div>
                </div>
            </div>

            {/* Personal Message */}
            {invitation.personal_message && (
                <div className="border-l-4 border-l-primary pl-6">
                    <SectionLabel>Personal Message</SectionLabel>
                    <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">
                        {invitation.personal_message}
                    </p>
                </div>
            )}

            {/* Timeline */}
            <div>
                <SectionLabel icon="fa-clock text-primary">Timeline</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dates.map((item) => (
                        <div key={item.label} className={`p-3 border ${item.cls || "border-base-200"}`}>
                            <p className={`text-sm font-bold uppercase tracking-[0.15em] mb-1 ${item.cls ? "" : "text-base-content/40"}`}>
                                {item.label}
                            </p>
                            <p className="text-sm font-semibold">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invited By */}
            {invitation.recruiter && (
                <div className="border-t-2 border-base-300 pt-6">
                    <SectionLabel>Invited By</SectionLabel>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm">
                            {recruiterInitials(recruiterName(invitation))}
                        </div>
                        <div>
                            <p className="font-bold">{recruiterName(invitation)}</p>
                            {invitation.recruiter.user?.email && (
                                <p className="text-sm text-base-content/50">
                                    {invitation.recruiter.user.email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── History Tab ─────────────────────────────────────────────────────── */

function HistoryTab({ invitation }: { invitation: CompanyInvitation }) {
    const events = buildTimeline(invitation);

    if (events.length === 0) {
        return (
            <div className="p-6 text-center text-sm text-base-content/40">
                No history available.
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="space-y-0">
                {events.map((event, i) => (
                    <div key={i} className="flex gap-4 pb-5 relative">
                        {i < events.length - 1 && (
                            <div className="absolute left-[14px] top-8 bottom-0 w-px bg-base-300" />
                        )}
                        <div className="w-7 h-7 bg-primary text-primary-content flex items-center justify-center shrink-0">
                            <i className="fa-duotone fa-regular fa-circle text-xs" />
                        </div>
                        <div className="pt-0.5">
                            <p className="text-sm font-bold">{event.action}</p>
                            <p className="text-sm text-base-content/40">{event.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button onClick={handleCopy} className="btn btn-xs btn-ghost btn-square">
            <i className={`fa-duotone fa-regular text-base ${copied ? "fa-check text-success" : "fa-copy text-base-content/40"}`} />
        </button>
    );
}

function SectionLabel({ children, icon }: { children: ReactNode; icon?: string }) {
    return (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
            {icon && <i className={`fa-duotone fa-regular ${icon} mr-1`} />}
            {children}
        </p>
    );
}

interface TimelineEvent {
    action: string;
    date: string;
}

function buildTimeline(invitation: CompanyInvitation): TimelineEvent[] {
    const events: { action: string; at: Date; date: string }[] = [];

    if (invitation.created_at) {
        const d = new Date(invitation.created_at);
        events.push({ action: "Invitation created", at: d, date: formatDate(invitation.created_at) });
    }

    if (invitation.email_sent_at) {
        const d = new Date(invitation.email_sent_at);
        events.push({ action: "Email sent", at: d, date: formatDate(invitation.email_sent_at) });
    }

    if (invitation.accepted_at) {
        const d = new Date(invitation.accepted_at);
        events.push({ action: "Invitation accepted", at: d, date: formatDate(invitation.accepted_at) });
    }

    if (invitation.status === "revoked") {
        events.push({ action: "Invitation revoked", at: new Date(), date: "—" });
    }

    const isExpired =
        invitation.expires_at &&
        new Date(invitation.expires_at) < new Date() &&
        invitation.status !== "accepted";
    if (isExpired) {
        const d = new Date(invitation.expires_at!);
        events.push({ action: "Invitation expired", at: d, date: formatDate(invitation.expires_at!) });
    }

    events.sort((a, b) => a.at.getTime() - b.at.getTime());
    return events.map(({ action, date }) => ({ action, date }));
}
