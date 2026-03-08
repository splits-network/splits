"use client";

/**
 * Week view — 7-column day grid with time rows (7 AM – 9 PM).
 * Events rendered as positioned blocks within day columns.
 */

import { useMemo, useCallback } from "react";
import { useCalendar, isInterviewEvent } from "./calendar-context";
import type { CalendarEvent } from "@splits-network/shared-types";

/* ─── Constants ─────────────────────────────────────────────────────── */

const START_HOUR = 7;
const END_HOUR = 21;
const HOUR_HEIGHT = 60; // px per hour
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ─── Helpers ───────────────────────────────────────────────────────── */

function getWeekDays(date: Date): Date[] {
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
        const dd = new Date(start);
        dd.setDate(start.getDate() + i);
        return dd;
    });
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isToday(d: Date) {
    return isSameDay(d, new Date());
}

function getEventPosition(event: CalendarEvent) {
    const startStr = event.start.dateTime;
    if (!startStr) return null;

    const start = new Date(startStr);
    const endStr = event.end.dateTime || event.end.date;
    const end = endStr ? new Date(endStr) : new Date(start.getTime() + 3600000);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const top =
        ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
    const height = Math.max(
        ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT,
        20,
    );

    return { top, height, start, end };
}

function formatTime(d: Date) {
    return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

/* ─── All-Day Bar ───────────────────────────────────────────────────── */

function AllDayBar({
    weekDays,
    events,
    onSelect,
}: {
    weekDays: Date[];
    events: CalendarEvent[];
    onSelect: (e: CalendarEvent) => void;
}) {
    const allDayEvents = events.filter(
        (e) => e.start.date && !e.start.dateTime,
    );
    if (allDayEvents.length === 0) return null;

    return (
        <div className="flex border-b border-base-300">
            {/* Time gutter spacer */}
            <div className="w-16 shrink-0 border-r border-base-300 px-2 py-1">
                <span className="text-sm text-base-content/40">All day</span>
            </div>
            {/* Day columns */}
            <div className="flex-1 grid grid-cols-7">
                {weekDays.map((day) => {
                    const dayEvents = allDayEvents.filter((e) => {
                        const d = new Date(e.start.date + "T00:00:00");
                        return isSameDay(d, day);
                    });
                    return (
                        <div
                            key={day.toISOString()}
                            className="border-r border-base-300 last:border-r-0 px-1 py-1 min-h-[28px]"
                        >
                            {dayEvents.map((evt) => (
                                <button
                                    key={evt.id}
                                    onClick={() => onSelect(evt)}
                                    className="block w-full text-left px-1.5 py-0.5 bg-primary/15 text-primary border-l-2 border-primary text-sm font-semibold truncate mb-0.5 hover:bg-primary/25 transition-colors"
                                >
                                    {evt.summary || "(No title)"}
                                </button>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Component ─────────────────────────────────────────────────────── */

export default function CalendarWeekView() {
    const { currentDate, events, loading, selectEvent, openCreateWithTime } = useCalendar();

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
    const hours = useMemo(
        () => Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i),
        [],
    );

    // Group timed events by day index
    const eventsByDay = useMemo(() => {
        const map: Record<number, (CalendarEvent & { pos: NonNullable<ReturnType<typeof getEventPosition>> })[]> = {};
        for (let i = 0; i < 7; i++) map[i] = [];

        for (const evt of events) {
            const pos = getEventPosition(evt);
            if (!pos) continue; // all-day events handled separately
            const dayIdx = weekDays.findIndex((d) => isSameDay(d, pos.start));
            if (dayIdx >= 0) {
                map[dayIdx].push({ ...evt, pos });
            }
        }
        return map;
    }, [events, weekDays]);

    const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

    const handleSlotClick = useCallback(
        (dayIdx: number, e: React.MouseEvent<HTMLDivElement>) => {
            // Only handle clicks on the column itself, not on event buttons
            if ((e.target as HTMLElement).closest("button")) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            const totalMinutes = START_HOUR * 60 + (offsetY / HOUR_HEIGHT) * 60;
            // Snap to 15-minute intervals
            const snappedMinutes = Math.floor(totalMinutes / 15) * 15;
            const hour = Math.floor(snappedMinutes / 60);
            const minute = snappedMinutes % 60;

            const day = weekDays[dayIdx];
            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

            openCreateWithTime(dateStr, timeStr);
        },
        [weekDays, openCreateWithTime],
    );

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

    return (
        <div className="border border-base-300 bg-base-100 overflow-hidden">
            {/* Day headers */}
            <div className="flex border-b border-base-300 bg-base-200">
                <div className="w-16 shrink-0 border-r border-base-300" />
                <div className="flex-1 grid grid-cols-7">
                    {weekDays.map((day, i) => (
                        <div
                            key={i}
                            className={`text-center py-3 border-r border-base-300 last:border-r-0 ${
                                isToday(day) ? "bg-primary/5" : ""
                            }`}
                        >
                            <div className="text-sm font-bold uppercase tracking-wider text-base-content/50">
                                {DAYS[i]}
                            </div>
                            <div
                                className={`text-lg font-black ${
                                    isToday(day)
                                        ? "text-primary"
                                        : "text-base-content"
                                }`}
                            >
                                {day.getDate()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* All-day events bar */}
            <AllDayBar
                weekDays={weekDays}
                events={events}
                onSelect={selectEvent}
            />

            {/* Time grid */}
            <div className="flex overflow-y-auto" style={{ maxHeight: "calc(100vh - 28rem)" }}>
                {/* Time gutter */}
                <div className="w-16 shrink-0 border-r border-base-300">
                    {hours.map((h) => (
                        <div
                            key={h}
                            style={{ height: HOUR_HEIGHT }}
                            className="relative"
                        >
                            <span className="absolute -top-2.5 right-2 text-sm text-base-content/40">
                                {h > 12
                                    ? `${h - 12} PM`
                                    : h === 12
                                      ? "12 PM"
                                      : `${h} AM`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day columns */}
                <div className="flex-1 grid grid-cols-7">
                    {weekDays.map((day, dayIdx) => (
                        <div
                            key={dayIdx}
                            className={`relative border-r border-base-300 last:border-r-0 cursor-pointer hover:bg-primary/[0.03] ${
                                isToday(day) ? "bg-primary/[0.02]" : ""
                            }`}
                            style={{ height: totalHeight }}
                            onClick={(e) => handleSlotClick(dayIdx, e)}
                        >
                            {/* Hour lines */}
                            {hours.map((h) => (
                                <div
                                    key={h}
                                    className="absolute left-0 right-0 border-t border-base-200"
                                    style={{
                                        top: (h - START_HOUR) * HOUR_HEIGHT,
                                    }}
                                />
                            ))}

                            {/* Events */}
                            {eventsByDay[dayIdx]?.map((evt) => {
                                const interview = isInterviewEvent(evt);
                                return (
                                    <button
                                        key={evt.id}
                                        onClick={() => selectEvent(evt)}
                                        className={`absolute left-0.5 right-0.5 transition-colors overflow-hidden px-1.5 py-0.5 text-left cursor-pointer group ${
                                            interview
                                                ? "bg-accent/15 border-l-4 border-accent hover:bg-accent/25"
                                                : "bg-primary/15 border-l-2 border-primary hover:bg-primary/25"
                                        }`}
                                        style={{
                                            top: evt.pos.top,
                                            height: evt.pos.height,
                                        }}
                                    >
                                        <p className={`text-sm font-bold truncate ${
                                            interview ? "text-accent-content" : "text-primary"
                                        }`}>
                                            {interview && (
                                                <i className="fa-duotone fa-regular fa-video mr-1" />
                                            )}
                                            {evt.summary || "(No title)"}
                                        </p>
                                        {evt.pos.height > 30 && (
                                            <p className="text-sm text-base-content/50 truncate">
                                                {formatTime(evt.pos.start)}
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
