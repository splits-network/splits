"use client";

import { BaselBadge } from "@splits-network/basel-ui";
import type { CallDetail } from "../../hooks/use-call-detail";

interface CallContextPanelProps {
    call: CallDetail;
}

export function CallContextPanel({ call }: CallContextPanelProps) {
    const entityLinks = call.entity_links || [];
    const hasEntities = entityLinks.length > 0;

    return (
        <div className="space-y-6">
            {/* Entity Links */}
            {hasEntities && (
                <div className="border-2 border-base-300">
                    <div className="px-4 py-3 bg-base-200 border-b-2 border-base-300">
                        <h3 className="font-bold text-sm uppercase tracking-[0.15em]">
                            Linked Entities
                        </h3>
                    </div>
                    <div className="divide-y divide-base-300">
                        {entityLinks.map((link) => (
                            <div
                                key={link.id}
                                className="px-4 py-3 flex items-center gap-3"
                            >
                                <i
                                    className={`fa-duotone fa-regular ${entityIcon(link.entity_type)} text-base-content/40`}
                                />
                                <div className="flex-1 min-w-0">
                                    <BaselBadge color="neutral">
                                        {link.entity_type}
                                    </BaselBadge>
                                </div>
                                <span className="text-sm text-base-content/40 font-mono truncate max-w-[120px]">
                                    {link.entity_id.slice(0, 8)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Agenda */}
            {call.agenda && (
                <div className="border-2 border-base-300">
                    <div className="px-4 py-3 bg-base-200 border-b-2 border-base-300">
                        <h3 className="font-bold text-sm uppercase tracking-[0.15em]">
                            Agenda
                        </h3>
                    </div>
                    <div className="px-4 py-3 border-l-4 border-primary">
                        <p className="text-sm whitespace-pre-wrap">
                            {call.agenda}
                        </p>
                    </div>
                </div>
            )}

            {/* Pre-call Notes (creator only — shown for all for now) */}
            {call.pre_call_notes && (
                <div className="border-2 border-base-300">
                    <div className="px-4 py-3 bg-base-200 border-b-2 border-base-300">
                        <h3 className="font-bold text-sm uppercase tracking-[0.15em]">
                            Pre-call Notes
                        </h3>
                    </div>
                    <div className="px-4 py-3 border-l-4 border-secondary">
                        <p className="text-sm whitespace-pre-wrap">
                            {call.pre_call_notes}
                        </p>
                    </div>
                </div>
            )}

            {/* Call Info */}
            <div className="border-2 border-base-300">
                <div className="px-4 py-3 bg-base-200 border-b-2 border-base-300">
                    <h3 className="font-bold text-sm uppercase tracking-[0.15em]">
                        Call Info
                    </h3>
                </div>
                <div className="divide-y divide-base-300">
                    <InfoRow label="Call ID" value={call.id.slice(0, 8)} mono />
                    <InfoRow
                        label="Created"
                        value={new Date(call.created_at).toLocaleDateString(
                            [],
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }
                        )}
                    />
                    {call.livekit_room_name && (
                        <InfoRow
                            label="Room"
                            value={call.livekit_room_name}
                            mono
                        />
                    )}
                    {call.cancel_reason && (
                        <InfoRow
                            label="Cancel Reason"
                            value={call.cancel_reason}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <span className="text-sm text-base-content/50">{label}</span>
            <span
                className={`text-sm text-right ${mono ? "font-mono" : ""}`}
            >
                {value}
            </span>
        </div>
    );
}

function entityIcon(type: string): string {
    switch (type) {
        case "company":
            return "fa-building";
        case "job":
            return "fa-briefcase";
        case "application":
            return "fa-file-user";
        case "candidate":
            return "fa-user";
        case "firm":
            return "fa-handshake";
        default:
            return "fa-link";
    }
}
