"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import type {
    IntegrationProvider,
    OAuthConnectionPublic,
} from "@splits-network/shared-types";

interface CalendarPreferences {
    connection_id: string | null;
    primary_calendar_id: string | null;
    additional_calendar_ids: string[];
    working_hours_start: string;
    working_hours_end: string;
    working_days: number[];
    timezone: string;
}

interface CalendarPreferencesPanelProps {
    connections: OAuthConnectionPublic[];
    providers: IntegrationProvider[];
}

const DAY_LABELS = [
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
    { value: 7, label: "Sun" },
];

function generateTimeOptions(startHour: number, endHour: number): string[] {
    const options: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
        options.push(`${String(h).padStart(2, "0")}:00`);
        if (h < endHour) {
            options.push(`${String(h).padStart(2, "0")}:30`);
        }
    }
    return options;
}

const START_TIMES = generateTimeOptions(6, 12);
const END_TIMES = generateTimeOptions(12, 22);

export default function CalendarPreferencesPanel({
    connections,
    providers,
}: CalendarPreferencesPanelProps) {
    const { getToken } = useAuth();

    const [prefs, setPrefs] = useState<CalendarPreferences>({
        connection_id: null,
        primary_calendar_id: null,
        additional_calendar_ids: [],
        working_hours_start: "09:00",
        working_hours_end: "17:00",
        working_days: [1, 2, 3, 4, 5],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const toast = useToast();

    // Find active calendar connections
    const calendarConnections = useMemo(() => {
        const calendarSlugs = new Set(
            providers
                .filter(
                    (p) =>
                        p.category === "calendar" || p.category === "combo",
                )
                .map((p) => p.slug),
        );
        return connections.filter(
            (c) =>
                c.status === "active" && calendarSlugs.has(c.provider_slug),
        );
    }, [connections, providers]);

    // Don't render if no calendar connections
    if (calendarConnections.length === 0 && !loaded) {
        return null;
    }

    const timezones = useMemo(() => {
        try {
            return Intl.supportedValuesOf("timeZone");
        } catch {
            // Fallback for environments that don't support this
            return [
                "America/New_York",
                "America/Chicago",
                "America/Denver",
                "America/Los_Angeles",
                "America/Phoenix",
                "Europe/London",
                "Europe/Paris",
                "Europe/Berlin",
                "Asia/Tokyo",
                "Asia/Shanghai",
                "Australia/Sydney",
                "Pacific/Auckland",
                "UTC",
            ];
        }
    }, []);

    // Load existing preferences on mount
    const loadPreferences = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const res = (await client.get(
                "/interviews/calendar-preferences",
            )) as { data: CalendarPreferences };

            if (res.data) {
                setPrefs(res.data);
            }
        } catch (err) {
            console.error("Failed to load calendar preferences:", err);
        } finally {
            setLoaded(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        loadPreferences();
    }, [loadPreferences]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.put("/interviews/calendar-preferences", prefs);

            toast.success("Preferences saved.");
        } catch (err: any) {
            console.error("Failed to save calendar preferences:", err);
            toast.error("Preferences couldn't be saved. Try again.");
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: number) => {
        setPrefs((prev) => ({
            ...prev,
            working_days: prev.working_days.includes(day)
                ? prev.working_days.filter((d) => d !== day)
                : [...prev.working_days, day].sort(),
        }));
    };

    if (calendarConnections.length === 0) {
        return null;
    }

    return (
        <>
            <section className="mt-12 border-t border-base-300 pt-8">
                {/* Section header */}
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                    Scheduling Preferences
                </p>
                <h2 className="text-xl font-bold text-base-content mb-6">
                    Working Hours & Calendar Settings
                </h2>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Working Hours */}
                    <div>
                        <h3 className="text-sm font-bold text-base-content mb-4">
                            <i className="fa-duotone fa-regular fa-clock mr-2 text-primary" />
                            Working Hours
                        </h3>

                        <div className="flex items-center gap-3 mb-4">
                            <fieldset className="flex-1">
                                <label className="label">
                                    <span className="label-text text-sm">
                                        Start
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={prefs.working_hours_start}
                                    onChange={(e) =>
                                        setPrefs((p) => ({
                                            ...p,
                                            working_hours_start:
                                                e.target.value,
                                        }))
                                    }
                                >
                                    {START_TIMES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>

                            <span className="text-base-content/40 font-bold mt-8">
                                to
                            </span>

                            <fieldset className="flex-1">
                                <label className="label">
                                    <span className="label-text text-sm">
                                        End
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={prefs.working_hours_end}
                                    onChange={(e) =>
                                        setPrefs((p) => ({
                                            ...p,
                                            working_hours_end: e.target.value,
                                        }))
                                    }
                                >
                                    {END_TIMES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>
                        </div>

                        {/* Working Days */}
                        <div className="mb-4">
                            <label className="label">
                                <span className="label-text text-sm">
                                    Working Days
                                </span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {DAY_LABELS.map((day) => (
                                    <label
                                        key={day.value}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary"
                                            checked={prefs.working_days.includes(
                                                day.value,
                                            )}
                                            onChange={() =>
                                                toggleDay(day.value)
                                            }
                                        />
                                        <span className="text-sm font-medium">
                                            {day.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Timezone */}
                        <fieldset>
                            <label className="label">
                                <span className="label-text text-sm">
                                    Timezone
                                </span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={prefs.timezone}
                                onChange={(e) =>
                                    setPrefs((p) => ({
                                        ...p,
                                        timezone: e.target.value,
                                    }))
                                }
                            >
                                {timezones.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz.replace(/_/g, " ")}
                                    </option>
                                ))}
                            </select>
                        </fieldset>
                    </div>

                    {/* Calendar Selection */}
                    <div>
                        <h3 className="text-sm font-bold text-base-content mb-4">
                            <i className="fa-duotone fa-regular fa-calendar-check mr-2 text-primary" />
                            Calendars for Free/Busy Checks
                        </h3>

                        <p className="text-sm text-base-content/60 mb-4">
                            Select which connected calendars should be checked
                            for availability when scheduling calls.
                        </p>

                        <div className="space-y-3">
                            {calendarConnections.map((conn) => {
                                const provider = providers.find(
                                    (p) => p.slug === conn.provider_slug,
                                );
                                const isPrimary =
                                    prefs.connection_id === conn.id;
                                const isIncluded =
                                    isPrimary ||
                                    prefs.additional_calendar_ids?.includes(
                                        conn.id,
                                    );

                                return (
                                    <label
                                        key={conn.id}
                                        className="flex items-center gap-3 p-3 border border-base-300 hover:border-primary/30 transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary"
                                            checked={isIncluded}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    if (
                                                        !prefs.connection_id
                                                    ) {
                                                        // First calendar selected becomes primary
                                                        setPrefs((p) => ({
                                                            ...p,
                                                            connection_id:
                                                                conn.id,
                                                        }));
                                                    } else {
                                                        setPrefs((p) => ({
                                                            ...p,
                                                            additional_calendar_ids:
                                                                [
                                                                    ...(p.additional_calendar_ids ||
                                                                        []),
                                                                    conn.id,
                                                                ],
                                                        }));
                                                    }
                                                } else {
                                                    if (isPrimary) {
                                                        setPrefs((p) => ({
                                                            ...p,
                                                            connection_id:
                                                                null,
                                                        }));
                                                    } else {
                                                        setPrefs((p) => ({
                                                            ...p,
                                                            additional_calendar_ids:
                                                                (
                                                                    p.additional_calendar_ids ||
                                                                    []
                                                                ).filter(
                                                                    (id) =>
                                                                        id !==
                                                                        conn.id,
                                                                ),
                                                        }));
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-semibold">
                                                {provider?.name ||
                                                    conn.provider_slug}
                                            </span>
                                            {isPrimary && (
                                                <span className="ml-2 text-sm text-primary font-medium">
                                                    (Primary)
                                                </span>
                                            )}
                                        </div>
                                        {provider?.icon && (
                                            <i
                                                className={`${provider.icon} text-base-content/40`}
                                            />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Save button */}
                <div className="mt-8 flex justify-end">
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving && (
                            <span className="loading loading-spinner loading-sm" />
                        )}
                        Save Preferences
                    </button>
                </div>
            </section>
        </>
    );
}
