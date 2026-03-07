"use client";

/**
 * Calendar split view — 25% sidebar / 50% calendar / 25% event detail.
 * On mobile: full-width with view switching.
 */

import { useCalendar } from "./calendar-context";
import CalendarToolbar from "./calendar-toolbar";
import CalendarSidebarPanel from "./calendar-sidebar-panel";
import CalendarWeekView from "./calendar-week-view";
import CalendarAgendaView from "./calendar-agenda-view";
import CalendarEventDetail from "./calendar-event-detail";

export default function CalendarSplitView() {
    const { view, selectedEvent, connections, loading } = useCalendar();

    const noConnections = !loading && connections.length === 0;

    return (
        <div className="flex flex-col">
            <CalendarToolbar />

            <div className="flex gap-0 lg:gap-6 h-[calc(100vh-24rem)] min-h-[500px]">
                {/* ── SIDEBAR (left ~22%) ─────────────────────────────── */}
                <div
                    className={`hidden lg:flex flex-col w-[22%] bg-base-200 border border-base-300 overflow-hidden`}
                >
                    <CalendarSidebarPanel />
                </div>

                {/* ── CALENDAR VIEW (center) ─────────────────────────── */}
                <div
                    className={`flex flex-col flex-1 overflow-hidden ${
                        selectedEvent
                            ? "hidden lg:flex"
                            : "flex"
                    }`}
                >
                    {noConnections ? (
                        <div className="flex flex-col items-center justify-center h-full border border-base-300 bg-base-100 p-8">
                            <div className="w-16 h-16 bg-base-300 flex items-center justify-center mb-4">
                                <i className="fa-duotone fa-regular fa-calendar-circle-plus text-2xl text-base-content/30" />
                            </div>
                            <p className="text-sm font-bold text-base-content/50 mb-1">
                                No calendar connected
                            </p>
                            <p className="text-sm text-base-content/40 mb-4 text-center">
                                Connect your Google Calendar or Outlook account
                                to view and manage your schedule.
                            </p>
                            <a
                                href="/portal/integrations"
                                className="btn btn-primary btn-sm rounded-none font-bold uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-plug" />
                                Connect Calendar
                            </a>
                        </div>
                    ) : view === "week" ? (
                        <CalendarWeekView />
                    ) : (
                        <div className="border border-base-300 bg-base-100 p-6 overflow-y-auto h-full">
                            <CalendarAgendaView />
                        </div>
                    )}
                </div>

                {/* ── EVENT DETAIL (right ~30%) ──────────────────────── */}
                <div
                    className={`flex flex-col bg-base-100 border border-base-300 overflow-hidden ${
                        selectedEvent
                            ? "fixed inset-0 z-50 flex bg-base-100 lg:static lg:z-auto lg:w-[30%]"
                            : "hidden lg:flex lg:w-[30%]"
                    }`}
                >
                    <CalendarEventDetail />
                </div>
            </div>
        </div>
    );
}
