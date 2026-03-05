"use client";

import type { ReactNode } from "react";
import { PanelHeader, PanelTabs } from "@splits-network/basel-ui";
import type { Invitation } from "../../types";
import { getDisplayStatus } from "../../types";
import { statusBadgeClass } from "./status-color";
import { formatInvitationDate, getInitials, candidateName } from "./helpers";
import ActionsToolbar from "./actions-toolbar";

export function InvitationDetail({
    invitation,
    onClose,
    onRefresh,
}: {
    invitation: Invitation;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const candidate = invitation.candidate;
    const status = getDisplayStatus(invitation);
    const name = candidateName(invitation);

    const isExpiringSoon =
        invitation.invitation_expires_at &&
        !invitation.consent_given &&
        !invitation.declined_at &&
        new Date(invitation.invitation_expires_at).getTime() -
            Date.now() <
            3 * 24 * 60 * 60 * 1000;

    return (
        <div>
            <PanelHeader
                kicker="Candidate Invitation"
                badges={[
                    {
                        label: status.label,
                        className: statusBadgeClass(invitation),
                    },
                    ...(isExpiringSoon
                        ? [
                              {
                                  label: "Expires Soon",
                                  className: "badge-error badge-outline",
                              },
                          ]
                        : []),
                ]}
                avatar={{
                    initials: getInitials(name),
                }}
                title={name}
                subtitle={candidate?.current_title}
                meta={[
                    ...(candidate?.email
                        ? [
                              {
                                  icon: "fa-duotone fa-regular fa-envelope",
                                  text: candidate.email,
                              },
                          ]
                        : []),
                    ...(candidate?.phone
                        ? [
                              {
                                  icon: "fa-duotone fa-regular fa-phone",
                                  text: candidate.phone,
                              },
                          ]
                        : []),
                    ...(candidate?.location
                        ? [
                              {
                                  icon: "fa-duotone fa-regular fa-location-dot",
                                  text: candidate.location,
                              },
                          ]
                        : []),
                ]}
                stats={[
                    {
                        label: "Status",
                        value: status.label,
                        icon: `fa-duotone fa-regular ${status.icon}`,
                    },
                    {
                        label: "Invited",
                        value: formatInvitationDate(invitation.invited_at),
                        icon: "fa-duotone fa-regular fa-paper-plane",
                    },
                    {
                        label: "Expires",
                        value: formatInvitationDate(
                            invitation.invitation_expires_at,
                        ),
                        icon: "fa-duotone fa-regular fa-clock",
                    },
                ]}
                actions={
                    <ActionsToolbar
                        invitation={invitation}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewCandidate: true,
                            resend: true,
                            cancel: true,
                            viewDeclineReason: true,
                        }}
                    />
                }
                onClose={onClose}
            />

            <PanelTabs
                tabs={[
                    {
                        label: "Details",
                        value: "details",
                        icon: "fa-duotone fa-regular fa-circle-info",
                    },
                    {
                        label: "History",
                        value: "history",
                        icon: "fa-duotone fa-regular fa-clock-rotate-left",
                    },
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

function DetailsTab({ invitation }: { invitation: Invitation }) {
    const candidate = invitation.candidate;
    const name = candidateName(invitation);
    const isDeclined = !!invitation.declined_at;

    const dates = [
        { label: "Invited", value: formatInvitationDate(invitation.invited_at), cls: "" },
        { label: "Expires", value: formatInvitationDate(invitation.invitation_expires_at), cls: "" },
        ...(invitation.consent_given_at
            ? [{ label: "Accepted", value: formatInvitationDate(invitation.consent_given_at), cls: "border-success/30 bg-success/5 text-success" }]
            : []),
        ...(invitation.declined_at
            ? [{ label: "Declined", value: formatInvitationDate(invitation.declined_at), cls: "border-error/30 bg-error/5 text-error" }]
            : []),
    ];

    return (
        <div className="space-y-8 p-6">
            {/* Candidate Information */}
            {candidate && (
                <div className="border-2 border-base-300 p-4">
                    <SectionLabel icon="fa-user text-primary">
                        Candidate Information
                    </SectionLabel>
                    <div className="flex items-center gap-3 mb-4">
                        {candidate.profile_picture ? (
                            <img
                                src={candidate.profile_picture}
                                alt={name}
                                className="w-12 h-12 object-cover border-2 border-base-300"
                            />
                        ) : (
                            <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm text-base-content/60">
                                {getInitials(name)}
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-sm">{name}</p>
                            <p className="text-sm text-base-content/50">
                                {candidate.email}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            ["Title", candidate.current_title],
                            ["Company", candidate.current_company],
                            ["Location", candidate.location],
                            ["Phone", candidate.phone],
                        ]
                            .filter(([, v]) => v)
                            .map(([label, value]) => (
                                <div
                                    key={label}
                                    className="p-3 border border-base-200"
                                >
                                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/40 mb-1">
                                        {label}
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {value}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div>
                <SectionLabel icon="fa-clock text-primary">
                    Timeline
                </SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dates.map((item) => (
                        <div
                            key={item.label}
                            className={`p-3 border ${item.cls || "border-base-200"}`}
                        >
                            <p
                                className={`text-sm font-bold uppercase tracking-[0.15em] mb-1 ${item.cls ? "" : "text-base-content/40"}`}
                            >
                                {item.label}
                            </p>
                            <p className="text-sm font-semibold">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decline Reason */}
            {isDeclined && invitation.declined_reason && (
                <div>
                    <SectionLabel icon="fa-times-circle text-error">
                        Decline Reason
                    </SectionLabel>
                    <div className="p-3 border border-error/30 bg-error/5 text-sm text-base-content/70">
                        {invitation.declined_reason}
                    </div>
                </div>
            )}

            {/* Verification */}
            {candidate?.verification_status && (
                <div>
                    <SectionLabel icon="fa-badge-check text-success">
                        Verification
                    </SectionLabel>
                    <div className="flex items-center gap-3 text-sm">
                        <i
                            className={`fa-duotone fa-regular ${
                                candidate.verification_status === "verified"
                                    ? "fa-check-circle text-success"
                                    : "fa-clock text-warning"
                            }`}
                        />
                        <span className="text-base-content/75 capitalize">
                            {candidate.verification_status}
                        </span>
                    </div>
                </div>
            )}

            {/* Invited By */}
            {invitation.recruiter_name && (
                <div className="border-t-2 border-base-300 pt-6">
                    <SectionLabel>Invited By</SectionLabel>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm">
                            {getInitials(invitation.recruiter_name)}
                        </div>
                        <div>
                            <p className="font-bold">
                                {invitation.recruiter_name}
                            </p>
                            {invitation.recruiter_email && (
                                <p className="text-sm text-base-content/50">
                                    {invitation.recruiter_email}
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

function HistoryTab({ invitation }: { invitation: Invitation }) {
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
                            <p className="text-sm text-base-content/40">
                                {event.date}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function SectionLabel({
    children,
    icon,
}: {
    children: ReactNode;
    icon?: string;
}) {
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

function buildTimeline(invitation: Invitation): TimelineEvent[] {
    const events: { action: string; at: Date; date: string }[] = [];

    if (invitation.invited_at) {
        const d = new Date(invitation.invited_at);
        events.push({
            action: "Invitation sent",
            at: d,
            date: formatInvitationDate(invitation.invited_at),
        });
    }

    if (invitation.consent_given_at) {
        const d = new Date(invitation.consent_given_at);
        events.push({
            action: "Invitation accepted",
            at: d,
            date: formatInvitationDate(invitation.consent_given_at),
        });
    }

    if (invitation.declined_at) {
        const d = new Date(invitation.declined_at);
        events.push({
            action: invitation.declined_reason
                ? `Invitation declined — ${invitation.declined_reason}`
                : "Invitation declined",
            at: d,
            date: formatInvitationDate(invitation.declined_at),
        });
    }

    const isExpired =
        invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date() &&
        !invitation.consent_given;
    if (isExpired) {
        const d = new Date(invitation.invitation_expires_at!);
        events.push({
            action: "Invitation expired",
            at: d,
            date: formatInvitationDate(invitation.invitation_expires_at),
        });
    }

    if (
        invitation.status === "terminated" ||
        invitation.status === "cancelled"
    ) {
        events.push({
            action:
                invitation.status === "terminated"
                    ? "Invitation revoked"
                    : "Invitation cancelled",
            at: new Date(invitation.updated_at),
            date: formatInvitationDate(invitation.updated_at),
        });
    }

    events.sort((a, b) => a.at.getTime() - b.at.getTime());

    return events.map(({ action, date }) => ({ action, date }));
}
