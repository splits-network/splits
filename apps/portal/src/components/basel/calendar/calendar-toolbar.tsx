"use client";

/**
 * Calendar toolbar — view toggle (week/agenda), date navigation,
 * today button, and create event button.
 */

import { useCalendar } from "./calendar-context";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function CalendarToolbar() {
    const {
        view,
        setView,
        currentDate,
        goToday,
        goNext,
        goPrev,
        openCreate,
        connections,
        loading,
    } = useCalendar();

    const month = MONTHS[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    const noConnections = !loading && connections.length === 0;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            {/* Left: Date nav */}
            <div className="flex items-center gap-3">
                <button
                    onClick={goToday}
                    className="btn btn-sm btn-outline rounded-none font-bold uppercase tracking-wider"
                >
                    Today
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={goPrev}
                        className="btn btn-sm btn-ghost btn-square rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-chevron-left" />
                    </button>
                    <button
                        onClick={goNext}
                        className="btn btn-sm btn-ghost btn-square rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-chevron-right" />
                    </button>
                </div>
                <h2 className="text-lg font-black tracking-tight">
                    {month} {year}
                </h2>
            </div>

            {/* Right: View toggle + Create */}
            <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="join">
                    <button
                        onClick={() => setView("week")}
                        className={`join-item btn btn-sm rounded-none font-bold uppercase tracking-wider ${
                            view === "week" ? "btn-primary" : "btn-ghost"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-calendar-week mr-1.5" />
                        Week
                    </button>
                    <button
                        onClick={() => setView("agenda")}
                        className={`join-item btn btn-sm rounded-none font-bold uppercase tracking-wider ${
                            view === "agenda" ? "btn-primary" : "btn-ghost"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-list-timeline mr-1.5" />
                        Agenda
                    </button>
                </div>

                {!noConnections && (
                    <button
                        onClick={openCreate}
                        className="btn btn-sm btn-primary rounded-none font-bold uppercase tracking-wider"
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        Event
                    </button>
                )}
            </div>
        </div>
    );
}
