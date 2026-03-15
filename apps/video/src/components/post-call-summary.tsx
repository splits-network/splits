"use client";

import { useBrand } from "@/hooks/use-brand";
import type { CallDetail } from "@/lib/types";

/* ─── Types ────────────────────────────────────────────────────────── */

interface PostCallSummaryProps {
    call: CallDetail;
    duration: number;
}

/* ─── Constants ────────────────────────────────────────────────────── */

const MAX_VISIBLE_AVATARS = 5;

/* ─── Helpers ──────────────────────────────────────────────────────── */

function formatCallDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
}

function buildPortalCallUrl(portalUrl: string, callId: string): string {
    return `${portalUrl}/portal/calls/${callId}`;
}

function buildFollowUpUrl(portalUrl: string, call: CallDetail): string {
    const params = new URLSearchParams();
    params.set("mode", "scheduled");
    params.set("followUpFrom", call.id);

    const participantIds = call.participants
        .map((p) => p.user_id)
        .filter((id) => !id.startsWith("email:"));
    if (participantIds.length > 0) {
        params.set("participants", participantIds.join(","));
    }

    if (call.entity_links.length > 0) {
        const link = call.entity_links[0];
        params.set("entityType", link.entity_type);
        params.set("entityId", link.entity_id);
    }

    return `${portalUrl}/portal/calls/new?${params.toString()}`;
}

function entityIcon(type: string): string {
    switch (type) {
        case "application":
            return "fa-file-user";
        case "job":
            return "fa-briefcase";
        case "candidate":
            return "fa-user";
        default:
            return "fa-link";
    }
}

/* ─── Component ────────────────────────────────────────────────────── */

export function PostCallSummary({ call, duration }: PostCallSummaryProps) {
    const brand = useBrand();
    const portalCallUrl = buildPortalCallUrl(brand.portalUrl, call.id);
    const followUpUrl = buildFollowUpUrl(brand.portalUrl, call);
    const visibleAvatars = call.participants.slice(0, MAX_VISIBLE_AVATARS);
    const overflowCount = call.participants.length - MAX_VISIBLE_AVATARS;

    return (
        <div className="max-w-lg w-full space-y-8">
            {/* Hero — Call Complete */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-success/15 flex items-center justify-center shadow-sm">
                        <i className="fa-duotone fa-regular fa-check text-4xl text-success" />
                    </div>
                </div>
                <div>
                    <p className="tracking-[0.2em] text-sm uppercase font-semibold text-success mb-1">
                        Session Wrapped
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black text-base-content leading-tight">
                        Call Complete
                    </h2>
                </div>
                <div className="inline-flex items-center gap-2 bg-base-200 px-4 py-2">
                    <i className="fa-duotone fa-regular fa-stopwatch text-primary" />
                    <span className="text-xl font-bold text-base-content tracking-tight">
                        {formatCallDuration(duration)}
                    </span>
                </div>
            </div>

            {/* Title & Type */}
            {(call.title || call.call_type) && (
                <div className="bg-base-100 border-l-4 border-primary p-4 shadow-sm">
                    {call.title && (
                        <h3 className="font-bold text-base-content text-lg">
                            {call.title}
                        </h3>
                    )}
                    <span className="badge badge-ghost rounded-none text-sm mt-1">
                        {call.call_type.replace(/_/g, " ")}
                    </span>
                </div>
            )}

            {/* Participants — overlapping avatar stack */}
            {call.participants.length > 0 && (
                <div className="space-y-3">
                    <p className="tracking-[0.15em] text-sm uppercase font-semibold text-base-content/50">
                        On This Call
                    </p>
                    <div className="bg-base-100 p-4 shadow-sm">
                        <div className="flex items-center">
                            {visibleAvatars.map((p, i) => (
                                <div
                                    key={p.id}
                                    className={`w-10 h-10 rounded-none border-2 border-base-100 overflow-hidden flex-shrink-0 ${i > 0 ? "-ml-2" : ""}`}
                                >
                                    {p.user.avatar_url ? (
                                        <img
                                            src={p.user.avatar_url}
                                            alt={p.user.name || ""}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                                            {(p.user.name || "?")[0]}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {overflowCount > 0 && (
                                <div className="-ml-2 w-10 h-10 rounded-none border-2 border-base-100 bg-base-300 text-base-content flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    +{overflowCount}
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-base-content/60 mt-3">
                            {call.participants
                                .map((p) => p.user.name || "Unknown")
                                .join(", ")}
                        </p>
                    </div>
                </div>
            )}

            {/* Entity Links — editorial cards */}
            {call.entity_links.length > 0 && (
                <div className="space-y-3">
                    <p className="tracking-[0.15em] text-sm uppercase font-semibold text-base-content/50">
                        Linked Records
                    </p>
                    <div className="space-y-2">
                        {call.entity_links.map((link) => (
                            <div
                                key={`${link.entity_type}-${link.entity_id}`}
                                className="bg-base-100 border-l-4 border-accent p-3 flex items-center gap-3 shadow-sm"
                            >
                                <i
                                    className={`fa-duotone fa-regular ${entityIcon(link.entity_type)} text-accent`}
                                />
                                <span className="text-sm font-medium text-base-content capitalize">
                                    {link.entity_type}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recording Status — callout */}
            <div className="bg-base-100 border-l-4 border-info p-4 flex items-start gap-3 shadow-sm">
                <i className="fa-duotone fa-regular fa-waveform-lines text-info text-lg mt-0.5" />
                <div>
                    <p className="tracking-[0.1em] text-sm uppercase font-semibold text-base-content">
                        Recording
                    </p>
                    <p className="text-sm text-base-content/60 mt-1">
                        {call.status === "completed"
                            ? "Your recording is being processed and will appear in the portal shortly."
                            : "Head to the portal to check your recording status."}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
                <a
                    href={followUpUrl}
                    className="btn btn-primary btn-block rounded-none gap-2"
                >
                    <i className="fa-duotone fa-regular fa-calendar-plus" />
                    Schedule Follow-up
                </a>
                <a
                    href={portalCallUrl}
                    className="btn btn-outline btn-block rounded-none gap-2"
                >
                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                    View Call Details
                </a>
                <a
                    href={brand.portalUrl}
                    className="btn btn-ghost btn-block rounded-none gap-2"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Return to Portal
                </a>
            </div>
        </div>
    );
}
