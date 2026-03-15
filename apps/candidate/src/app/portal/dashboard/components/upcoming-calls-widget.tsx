"use client";

import Link from "next/link";
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
        <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-base-100 border-2 border-base-200 border-l-4 border-l-primary p-5"
                >
                    <div className="h-4 w-48 bg-base-content/10 animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-base-content/5 animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-base-content/5 animate-pulse" />
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-8">
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <i className="fa-duotone fa-regular fa-phone-slash text-xl text-primary/30" />
            </div>
            <p className="text-sm font-semibold text-base-content/60">
                No upcoming calls
            </p>
            <p className="text-sm text-base-content/40 mt-1">
                Scheduled calls will appear here
            </p>
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
        <section className="py-12 bg-base-100 scroll-reveal fade-up">
            <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                        Coming Up
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-base-content">
                        Your upcoming calls
                    </h2>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {calls.map((call) => (
                            <div
                                key={call.id}
                                className="bg-base-100 border-2 border-base-200 border-l-4 border-l-primary p-5 flex flex-col gap-2"
                            >
                                <h4 className="text-base font-bold tracking-tight text-base-content line-clamp-2">
                                    {getCallDisplayTitle(call)}
                                </h4>

                                <div className="flex items-center gap-2 text-sm text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-calendar-clock" />
                                    {formatScheduledTime(call.scheduled_at)}
                                </div>

                                {call.participants && call.participants.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-base-content/40">
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
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
