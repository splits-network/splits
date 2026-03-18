"use client";

/**
 * Event detail panel — right side of the split view.
 * Shows full event info, attendees, conference link, description.
 * Interview events get additional info card, join button, and action buttons.
 */

import {
    useCalendar,
    isInterviewEvent,
    parseInterviewSummary,
} from "./calendar-context";
import { sanitizeCalendarHtml } from "@splits-network/shared-ui";

/* ─── Helpers ───────────────────────────────────────────────────────── */

function formatDateRange(
    startDT?: string,
    startDate?: string,
    endDT?: string,
    endDate?: string,
) {
    if (startDate && !startDT) {
        return {
            date: new Date(startDate + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                },
            ),
            time: "All day",
        };
    }

    if (!startDT) return { date: "", time: "" };

    const start = new Date(startDT);
    const end = endDT ? new Date(endDT) : null;

    const date = start.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const startTime = start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    if (!end) return { date, time: startTime };

    const endTime = end.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const durationMs = end.getTime() - start.getTime();
    const durationMin = Math.round(durationMs / 60000);
    const durationLabel =
        durationMin >= 60
            ? `${Math.floor(durationMin / 60)}h${durationMin % 60 ? ` ${durationMin % 60}m` : ""}`
            : `${durationMin}m`;

    return {
        date,
        time: `${startTime} - ${endTime} (${durationLabel})`,
    };
}

function getResponseStatusBadge(status: string) {
    switch (status) {
        case "accepted":
            return "badge-success";
        case "declined":
            return "badge-error";
        case "tentative":
            return "badge-warning";
        default:
            return "badge-ghost";
    }
}

/* ─── Component ─────────────────────────────────────────────────────── */

export default function CalendarEventDetail() {
    const { selectedEvent, closeEvent } = useCalendar();

    if (!selectedEvent) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-calendar-day text-2xl text-primary" />
                    </div>
                    <h3 className="font-black text-xl tracking-tight mb-2 text-base-content">
                        Select an Event
                    </h3>
                    <p className="text-sm text-base-content/50">
                        Click an event to view its full details
                    </p>
                </div>
            </div>
        );
    }

    const { date, time } = formatDateRange(
        selectedEvent.start.dateTime,
        selectedEvent.start.date,
        selectedEvent.end.dateTime,
        selectedEvent.end.date,
    );

    const videoLink = selectedEvent.conferenceData?.entryPoints?.find(
        (ep) => ep.entryPointType === "video",
    );

    const interview = isInterviewEvent(selectedEvent);
    const interviewInfo = interview
        ? parseInterviewSummary(selectedEvent.summary ?? "")
        : null;
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div
                className={`${interview ? "bg-accent text-accent-content" : "bg-base-300 text-base-content"} px-6 py-5 shrink-0`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <button
                            onClick={closeEvent}
                            className="lg:hidden btn btn-primary btn-sm mb-2"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left" />
                            Back
                        </button>
                        {interview && (
                            <div className="flex items-center gap-2 mb-1">
                                <i className="fa-duotone fa-regular fa-video" />
                                <span className="text-sm font-bold uppercase tracking-wider opacity-70">
                                    Interview
                                </span>
                            </div>
                        )}
                        <h2 className="text-xl font-black tracking-tight truncate">
                            {selectedEvent.summary || "(No title)"}
                        </h2>
                        {selectedEvent.status && (
                            <span
                                className={`badge badge-sm mt-2 ${
                                    selectedEvent.status === "confirmed"
                                        ? "badge-success"
                                        : selectedEvent.status === "cancelled"
                                          ? "badge-error"
                                          : "badge-warning"
                                }`}
                            >
                                {selectedEvent.status}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={closeEvent}
                        className="hidden lg:flex btn btn-primary btn-sm btn-square"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Interview info card */}
                {interview && interviewInfo && (
                    <div className="border-l-4 border-accent bg-accent/5 p-4">
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm font-bold text-base-content/50 uppercase">
                                    Candidate
                                </p>
                                <p className="text-sm font-bold">
                                    {interviewInfo.candidateName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-base-content/50 uppercase">
                                    Position
                                </p>
                                <p className="text-sm font-bold">
                                    {interviewInfo.jobTitle}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Date & Time */}
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="fa-duotone fa-regular fa-clock text-primary text-sm" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">{date}</p>
                        <p className="text-sm text-base-content/60">{time}</p>
                    </div>
                </div>

                {/* Location */}
                {selectedEvent.location && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <i className="fa-duotone fa-regular fa-location-dot text-primary text-sm" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Location</p>
                            <p className="text-sm text-base-content/60">
                                {selectedEvent.location}
                            </p>
                        </div>
                    </div>
                )}

                {/* Video Conference */}
                {videoLink && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <i className="fa-duotone fa-regular fa-video text-primary text-sm" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Video Meeting</p>
                            <a
                                href={videoLink.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline font-semibold"
                            >
                                {videoLink.label || "Join meeting"}
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square ml-1.5 text-sm" />
                            </a>
                        </div>
                    </div>
                )}

                {/* Description */}
                {selectedEvent.description && (
                    <div className="border-l-4 border-primary bg-base-200 p-4">
                        <p className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                            Description
                        </p>
                        <div
                            className="text-sm text-base-content/70 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                                __html: sanitizeCalendarHtml(selectedEvent.description),
                            }}
                        />
                    </div>
                )}

                {/* Attendees */}
                {selectedEvent.attendees &&
                    selectedEvent.attendees.length > 0 && (
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-3">
                                Attendees ({selectedEvent.attendees.length})
                            </p>
                            <div className="space-y-2">
                                {selectedEvent.attendees.map((att, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 px-3 py-2 bg-base-200 border border-base-300"
                                    >
                                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-black text-primary uppercase">
                                                {(
                                                    att.displayName || att.email
                                                ).charAt(0)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">
                                                {att.displayName || att.email}
                                            </p>
                                            {att.displayName && (
                                                <p className="text-sm text-base-content/50 truncate">
                                                    {att.email}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            className={`badge badge-sm ${getResponseStatusBadge(att.responseStatus)}`}
                                        >
                                            {att.responseStatus}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                {/* External link */}
                {selectedEvent.htmlLink && (
                    <div className="pt-2">
                        <a
                            href={selectedEvent.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline font-bold uppercase tracking-wider"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                            Open in Calendar
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
