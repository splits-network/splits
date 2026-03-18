"use client";

import Link from "next/link";
import { BaselSectionHeading } from "@splits-network/basel-ui";
import type { CallListItem } from "../hooks/use-upcoming-calls";

interface UpcomingCallsWidgetProps {
    calls: CallListItem[];
    loading: boolean;
}

function formatScheduledTime(isoString: string): string {
    return new Date(isoString).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getCallDisplayTitle(call: CallListItem): string {
    if (call.title) return call.title;
    const names = call.participants
        ?.filter((p) => p.name)
        .map((p) => p.name)
        .slice(0, 3);
    if (names && names.length > 0) return `Call with ${names.join(", ")}`;
    return "Scheduled Call";
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
                <div
                    key={i}
                    className="border-2 border-base-300 border-l-4 border-l-primary p-5"
                >
                    <div className="h-4 w-48 bg-base-content/10 animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-base-content/5 animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-base-content/5 animate-pulse" />
                </div>
            ))}
        </div>
    );
}

export default function UpcomingCallsWidget({
    calls,
    loading,
}: UpcomingCallsWidgetProps) {
    if (!loading && calls.length === 0) {
        return null;
    }

    return (
        <div className="scroll-reveal fade-up">
            <BaselSectionHeading
                kicker="COMING UP"
                title="Your upcoming calls"
                className="section-heading mb-6"
            />

            {loading ? (
                <LoadingSkeleton />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calls.map((call) => {
                        const hoursUntil = (new Date(call.scheduled_at).getTime() - Date.now()) / 3_600_000;
                        const borderColor = hoursUntil <= 1 ? "border-l-accent" : hoursUntil <= 24 ? "border-l-warning" : "border-l-primary";
                        return (
                        <div
                            key={call.id}
                            className={`border-2 border-base-300 border-l-4 ${borderColor} p-5 flex flex-col gap-2`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-base font-bold tracking-tight text-base-content line-clamp-2">
                                    {getCallDisplayTitle(call)}
                                </h4>
                                {hoursUntil <= 1 && hoursUntil > 0 && (
                                    <span className="badge badge-accent badge-sm shrink-0 font-bold uppercase tracking-wider">
                                        Soon
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-base-content/60">
                                <i className="fa-duotone fa-regular fa-calendar-clock" />
                                {formatScheduledTime(call.scheduled_at)}
                            </div>

                            {call.participants && call.participants.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-base-content/50">
                                    <i className="fa-duotone fa-regular fa-users" />
                                    {call.participants.length} participant{call.participants.length !== 1 ? "s" : ""}
                                </div>
                            )}

                            <div className="mt-2">
                                <Link
                                    href={`/portal/calls/${call.id}/join`}
                                    className="btn btn-primary btn-sm"
                                    style={{ borderRadius: 0 }}
                                >
                                    <i className="fa-duotone fa-regular fa-video" />
                                    Join Call
                                </Link>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
