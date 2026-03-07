"use client";

/**
 * Agenda view — chronological list of upcoming events grouped by day.
 * Basel editorial card style with border-l-4 accent.
 */

import { useMemo } from "react";
import { useCalendar } from "./calendar-context";
import type { CalendarEvent } from "@splits-network/shared-types";

/* ─── Helpers ───────────────────────────────────────────────────────── */

function getEventDate(event: CalendarEvent): string {
    const dt = event.start.dateTime || event.start.date;
    if (!dt) return "";
    return new Date(dt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function getEventTime(event: CalendarEvent): string {
    if (event.start.date && !event.start.dateTime) return "All day";

    const start = event.start.dateTime
        ? new Date(event.start.dateTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
          })
        : "";
    const end = event.end.dateTime
        ? new Date(event.end.dateTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
          })
        : "";

    return end ? `${start} - ${end}` : start;
}

function isToday(dateStr: string) {
    const today = new Date();
    const d = new Date(dateStr);
    return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
    );
}

function isPast(event: CalendarEvent) {
    const dt = event.end.dateTime || event.end.date || event.start.dateTime || event.start.date;
    if (!dt) return false;
    return new Date(dt) < new Date();
}

/* ─── Component ─────────────────────────────────────────────────────── */

export default function CalendarAgendaView() {
    const { events, loading, selectEvent, selectedEvent } = useCalendar();

    // Group events by date
    const groupedEvents = useMemo(() => {
        const groups: { date: string; events: CalendarEvent[] }[] = [];
        const map = new Map<string, CalendarEvent[]>();

        for (const evt of events) {
            const dt = evt.start.dateTime || evt.start.date;
            if (!dt) continue;
            const dateKey = new Date(dt).toDateString();
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(evt);
        }

        for (const [dateKey, evts] of map) {
            groups.push({ date: dateKey, events: evts });
        }

        return groups;
    }, [events]);

    if (loading && events.length === 0) {
        return (
            <div className="flex items-center justify-center py-24">
                <span className="loading loading-spinner loading-md text-primary" />
                <p className="text-sm text-base-content/50 ml-3">
                    Loading events...
                </p>
            </div>
        );
    }

    if (!loading && events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 opacity-40">
                <i className="fa-duotone fa-regular fa-calendar-xmark text-4xl mb-3" />
                <p className="text-sm font-bold">No events in this period</p>
                <p className="text-sm mt-1">
                    Try a different date range or create an event
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groupedEvents.map((group) => {
                const dateLabel = getEventDate(group.events[0]);
                const todayFlag = isToday(
                    group.events[0].start.dateTime ||
                        group.events[0].start.date ||
                        "",
                );

                return (
                    <div key={group.date}>
                        {/* Date heading */}
                        <div className="flex items-center gap-3 mb-3">
                            {todayFlag && (
                                <span className="badge badge-primary badge-sm rounded-none font-bold uppercase">
                                    Today
                                </span>
                            )}
                            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-base-content/60">
                                {dateLabel}
                            </h3>
                        </div>

                        {/* Event cards */}
                        <div className="space-y-2">
                            {group.events.map((evt) => {
                                const past = isPast(evt);
                                const isSelected =
                                    selectedEvent?.id === evt.id;
                                const time = getEventTime(evt);
                                const hasConference =
                                    evt.conferenceData?.entryPoints?.some(
                                        (ep) => ep.entryPointType === "video",
                                    );

                                return (
                                    <button
                                        key={evt.id}
                                        onClick={() => selectEvent(evt)}
                                        className={`w-full text-left border transition-colors ${
                                            isSelected
                                                ? "border-primary bg-primary/5 border-l-4"
                                                : "border-base-300 hover:border-primary/30 border-l-4 border-l-transparent"
                                        } ${past ? "opacity-50" : ""}`}
                                    >
                                        <div className="px-4 py-3 flex items-start gap-4">
                                            {/* Time column */}
                                            <div className="w-28 shrink-0">
                                                <p className="text-sm font-bold text-base-content">
                                                    {time}
                                                </p>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-base-content truncate">
                                                    {evt.summary ||
                                                        "(No title)"}
                                                </p>
                                                {evt.location && (
                                                    <p className="text-sm text-base-content/50 truncate mt-0.5">
                                                        <i className="fa-duotone fa-regular fa-location-dot mr-1.5" />
                                                        {evt.location}
                                                    </p>
                                                )}
                                                {evt.attendees &&
                                                    evt.attendees.length >
                                                        0 && (
                                                        <p className="text-sm text-base-content/40 mt-0.5">
                                                            <i className="fa-duotone fa-regular fa-users mr-1.5" />
                                                            {
                                                                evt.attendees
                                                                    .length
                                                            }{" "}
                                                            attendee
                                                            {evt.attendees
                                                                .length !== 1
                                                                ? "s"
                                                                : ""}
                                                        </p>
                                                    )}
                                            </div>

                                            {/* Indicators */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {hasConference && (
                                                    <span className="badge badge-sm badge-ghost rounded-none">
                                                        <i className="fa-duotone fa-regular fa-video mr-1" />
                                                        Video
                                                    </span>
                                                )}
                                                {evt.status ===
                                                    "tentative" && (
                                                    <span className="badge badge-sm badge-warning rounded-none">
                                                        Tentative
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
