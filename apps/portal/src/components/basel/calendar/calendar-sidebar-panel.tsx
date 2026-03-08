"use client";

/**
 * Calendar sidebar — shows calendar list with toggles,
 * connection switcher, and mini month reference.
 */

import { useCalendar } from "./calendar-context";

/* ─── Calendar colors ───────────────────────────────────────────────── */

const COLORS = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-success",
    "bg-info",
    "bg-warning",
];

function getCalendarColor(index: number) {
    return COLORS[index % COLORS.length];
}

/* ─── Component ─────────────────────────────────────────────────────── */

export default function CalendarSidebarPanel() {
    const {
        connections,
        selectedConnection,
        selectConnection,
        calendars,
        enabledCalendarIds,
        toggleCalendar,
        loading,
    } = useCalendar();

    const noConnections = !loading && connections.length === 0;

    return (
        <div className="flex flex-col h-full">
            {/* Connection switcher */}
            {connections.length > 1 && (
                <div className="px-4 py-3 border-b border-base-300">
                    <p className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                        Account
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {connections.map((conn) => (
                            <button
                                key={conn.id}
                                onClick={() => selectConnection(conn)}
                                className={`px-3 py-1.5 text-sm font-semibold transition-colors border ${
                                    selectedConnection?.id === conn.id
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-base-300 text-base-content/60 hover:border-primary/30"
                                }`}
                            >
                                {conn.provider_account_name ||
                                    conn.provider_slug}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar list */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-sm text-primary" />
                    </div>
                ) : noConnections ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-base-300 flex items-center justify-center mx-auto mb-3">
                            <i className="fa-duotone fa-regular fa-calendar-circle-plus text-xl text-base-content/30" />
                        </div>
                        <p className="text-sm font-bold text-base-content/50 mb-1">
                            No calendar connected
                        </p>
                        <p className="text-sm text-base-content/40 mb-4">
                            Connect Google Calendar or Outlook to see your
                            events.
                        </p>
                        <a
                            href="/portal/integrations"
                            className="btn btn-primary btn-sm rounded-none font-bold uppercase tracking-wider"
                        >
                            <i className="fa-duotone fa-regular fa-plug" />
                            Connect Calendar
                        </a>
                    </div>
                ) : (
                    <>
                        <p className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-3">
                            My Calendars
                        </p>
                        <div className="space-y-1.5">
                            {calendars.map((cal, i) => {
                                const enabled = enabledCalendarIds.has(cal.id);
                                const color = getCalendarColor(i);

                                return (
                                    <label
                                        key={cal.id}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-base-200 transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={enabled}
                                            onChange={() =>
                                                toggleCalendar(cal.id)
                                            }
                                            className="checkbox checkbox-sm checkbox-primary rounded-none"
                                        />
                                        <div
                                            className={`w-3 h-3 shrink-0 ${color}`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">
                                                {cal.summary}
                                            </p>
                                            {cal.primary && (
                                                <p className="text-sm text-primary font-bold">
                                                    Primary
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Calendar info */}
                        {selectedConnection && (
                            <div className="mt-6 pt-4 border-t border-base-300">
                                <p className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Connected Account
                                </p>
                                <div className="flex items-center gap-2">
                                    <i
                                        className={`${
                                            selectedConnection.provider_slug.startsWith(
                                                "microsoft",
                                            )
                                                ? "fa-brands fa-microsoft"
                                                : "fa-brands fa-google"
                                        } text-primary`}
                                    />
                                    <p className="text-sm font-semibold truncate">
                                        {selectedConnection.provider_account_name ||
                                            selectedConnection.provider_account_id}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
