"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    OAuthConnectionPublic,
    CalendarInfo,
    CalendarEvent,
} from "@splits-network/shared-types";

/* ─── Types ──────────────────────────────────────────────────────────── */

export type CalendarView = "week" | "agenda";

interface CalendarContextValue {
    /* connections */
    connections: OAuthConnectionPublic[];
    selectedConnection: OAuthConnectionPublic | null;
    selectConnection: (conn: OAuthConnectionPublic) => void;

    /* calendars */
    calendars: CalendarInfo[];
    enabledCalendarIds: Set<string>;
    toggleCalendar: (calendarId: string) => void;

    /* events */
    events: CalendarEvent[];
    loading: boolean;
    error: string;
    clearError: () => void;
    refresh: () => void;

    /* view */
    view: CalendarView;
    setView: (v: CalendarView) => void;
    currentDate: Date;
    goToday: () => void;
    goNext: () => void;
    goPrev: () => void;

    /* selected event */
    selectedEvent: CalendarEvent | null;
    selectEvent: (event: CalendarEvent) => void;
    closeEvent: () => void;

    /* create */
    showCreate: boolean;
    openCreate: () => void;
    closeCreate: () => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function useCalendar() {
    const ctx = useContext(CalendarContext);
    if (!ctx)
        throw new Error("useCalendar must be used within CalendarProvider");
    return ctx;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getWeekRange(date: Date): { start: Date; end: Date } {
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
}

function getAgendaRange(date: Date): { start: Date; end: Date } {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 14);
    return { start, end };
}

function toISO(d: Date) {
    return d.toISOString();
}

/* ─── Provider ───────────────────────────────────────────────────────── */

export function CalendarProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();
    const getTokenRef = useRef(getToken);
    getTokenRef.current = getToken;

    /* connections */
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [selectedConnection, setSelectedConnection] =
        useState<OAuthConnectionPublic | null>(null);

    /* calendars */
    const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
    const [enabledCalendarIds, setEnabledCalendarIds] = useState<Set<string>>(
        new Set(),
    );

    /* events */
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* view */
    const [view, setView] = useState<CalendarView>("week");
    const [currentDate, setCurrentDate] = useState(() => new Date());

    /* selected event */
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null,
    );

    /* create */
    const [showCreate, setShowCreate] = useState(false);

    /* ── Fetch connections ── */
    const fetchConnections = useCallback(async () => {
        try {
            const token = await getTokenRef.current();
            if (!token) { setLoading(false); return; }
            const client = createAuthenticatedClient(token);
            const res = (await client.get("/integrations/connections")) as {
                data: OAuthConnectionPublic[];
            };
            const calConns = (res.data ?? []).filter(
                (c) =>
                    (c.provider_slug.includes("calendar") ||
                        c.provider_slug.includes("combo")) &&
                    c.status === "active",
            );
            setConnections(calConns);
            if (calConns.length >= 1) {
                setSelectedConnection(calConns[0]);
            }
            if (calConns.length === 0) setLoading(false);
        } catch {
            setError("Failed to load calendar connections");
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Fetch calendars ── */
    const fetchCalendars = useCallback(
        async (connectionId: string) => {
            try {
                const token = await getTokenRef.current();
                if (!token) { setLoading(false); return; }
                const client = createAuthenticatedClient(token);
                const res = (await client.get(
                    `/integrations/calendar/${connectionId}/calendars`,
                )) as { data: CalendarInfo[] };
                const cals = res.data ?? [];
                setCalendars(cals);
                // Enable all calendars by default
                setEnabledCalendarIds(new Set(cals.map((c) => c.id)));
                // If no calendars, stop loading (loadAllEvents won't fire)
                if (cals.length === 0) setLoading(false);
            } catch {
                setError("Failed to load calendars");
                setLoading(false);
            }
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    /* ── Fetch events ── */
    const fetchEvents = useCallback(
        async (connectionId: string, calendarId: string, start: Date, end: Date) => {
            try {
                const token = await getTokenRef.current();
                if (!token) return [];
                const client = createAuthenticatedClient(token);
                const res = (await client.get(
                    `/integrations/calendar/${connectionId}/events`,
                    {
                        params: {
                            calendar_id: calendarId,
                            time_min: toISO(start),
                            time_max: toISO(end),
                            max_results: "100",
                        },
                    },
                )) as { data: CalendarEvent[] };
                return res.data ?? [];
            } catch {
                return [];
            }
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const [refreshKey, setRefreshKey] = useState(0);

    /* ── Effects ── */
    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    useEffect(() => {
        if (selectedConnection) {
            fetchCalendars(selectedConnection.id);
        }
    }, [selectedConnection, fetchCalendars]);

    // Load events — inline async to avoid stale closures
    useEffect(() => {
        if (!selectedConnection || calendars.length === 0) return;
        let cancelled = false;
        const connId = selectedConnection.id;

        async function load() {
            setLoading(true);
            setError("");

            const range =
                view === "week"
                    ? getWeekRange(currentDate)
                    : getAgendaRange(currentDate);

            const enabledCals = calendars.filter((c) =>
                enabledCalendarIds.has(c.id),
            );

            if (enabledCals.length === 0) {
                if (!cancelled) { setEvents([]); setLoading(false); }
                return;
            }

            try {
                const allEvents = await Promise.all(
                    enabledCals.map((cal) =>
                        fetchEvents(connId, cal.id, range.start, range.end),
                    ),
                );
                if (cancelled) return;

                const seen = new Set<string>();
                const merged: CalendarEvent[] = [];
                for (const batch of allEvents) {
                    for (const evt of batch) {
                        if (!seen.has(evt.id)) {
                            seen.add(evt.id);
                            merged.push(evt);
                        }
                    }
                }
                merged.sort((a, b) => {
                    const aStart = a.start.dateTime || a.start.date || "";
                    const bStart = b.start.dateTime || b.start.date || "";
                    return aStart.localeCompare(bStart);
                });
                setEvents(merged);
            } catch {
                if (!cancelled) setError("Failed to load events");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConnection, calendars, enabledCalendarIds, view, currentDate, refreshKey, fetchEvents]);

    /* ── Handlers ── */
    const selectConnection = useCallback((conn: OAuthConnectionPublic) => {
        setSelectedConnection(conn);
        setCalendars([]);
        setEvents([]);
        setSelectedEvent(null);
    }, []);

    const toggleCalendar = useCallback((calendarId: string) => {
        setEnabledCalendarIds((prev) => {
            const next = new Set(prev);
            if (next.has(calendarId)) next.delete(calendarId);
            else next.add(calendarId);
            return next;
        });
    }, []);

    const goToday = useCallback(() => setCurrentDate(new Date()), []);

    const goNext = useCallback(() => {
        setCurrentDate((prev) => {
            const d = new Date(prev);
            d.setDate(d.getDate() + (view === "week" ? 7 : 14));
            return d;
        });
    }, [view]);

    const goPrev = useCallback(() => {
        setCurrentDate((prev) => {
            const d = new Date(prev);
            d.setDate(d.getDate() - (view === "week" ? 7 : 14));
            return d;
        });
    }, [view]);

    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    return (
        <CalendarContext.Provider
            value={{
                connections,
                selectedConnection,
                selectConnection,
                calendars,
                enabledCalendarIds,
                toggleCalendar,
                events,
                loading,
                error,
                clearError: () => setError(""),
                refresh,
                view,
                setView,
                currentDate,
                goToday,
                goNext,
                goPrev,
                selectedEvent,
                selectEvent: setSelectedEvent,
                closeEvent: () => setSelectedEvent(null),
                showCreate,
                openCreate: () => setShowCreate(true),
                closeCreate: () => setShowCreate(false),
            }}
        >
            {children}
        </CalendarContext.Provider>
    );
}
