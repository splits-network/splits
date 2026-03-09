'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

/* ─── Types ────────────────────────────────────────────────────────── */

export interface ScheduleSelection {
    dateTime: string; // ISO string
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
}

interface BusySlot {
    start: string;
    end: string;
}

interface UserAvailability {
    clerk_user_id: string;
    busy_slots: BusySlot[];
}

interface SchedulingPanelProps {
    participantUserIds: string[];
    onScheduleSelect: (selection: ScheduleSelection | null) => void;
    selection: ScheduleSelection | null;
}

/* ─── Component ────────────────────────────────────────────────────── */

export function SchedulingPanel({
    participantUserIds,
    onScheduleSelect,
    selection,
}: SchedulingPanelProps) {
    const { getToken } = useAuth();
    const [date, setDate] = useState(selection?.date || '');
    const [time, setTime] = useState(selection?.time || '');
    const [availability, setAvailability] = useState<UserAvailability[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [hasCalendars, setHasCalendars] = useState<boolean | null>(null);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    /* ── Fetch availability when date changes ── */
    const fetchAvailability = useCallback(async (selectedDate: string) => {
        if (!selectedDate || participantUserIds.length === 0) return;

        setLoadingAvailability(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            const userIds = participantUserIds.join(',');
            const res = await client.get(
                `/integrations/calendar/availability?user_ids=${userIds}&date_from=${selectedDate}&date_to=${selectedDate}`,
            ) as { data: UserAvailability[] };

            const data = res.data || [];
            setAvailability(data);

            // Determine if all participants have calendars (have busy slots or empty means no calendar)
            const allHaveCalendars = data.length === participantUserIds.length &&
                data.every((u) => u.busy_slots !== undefined);
            setHasCalendars(allHaveCalendars);
        } catch {
            setHasCalendars(false);
            setAvailability([]);
        } finally {
            setLoadingAvailability(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [participantUserIds.join(',')]);

    useEffect(() => {
        if (date) fetchAvailability(date);
    }, [date, fetchAvailability]);

    /* ── Update selection ── */
    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        if (time) {
            onScheduleSelect({
                date: newDate,
                time,
                dateTime: `${newDate}T${time}:00`,
            });
        } else {
            onScheduleSelect(null);
        }
    };

    const handleTimeChange = (newTime: string) => {
        setTime(newTime);
        if (date) {
            onScheduleSelect({
                date,
                time: newTime,
                dateTime: `${date}T${newTime}:00`,
            });
        }
    };

    const selectSlot = (slotTime: string) => {
        setTime(slotTime);
        if (date) {
            onScheduleSelect({
                date,
                time: slotTime,
                dateTime: `${date}T${slotTime}:00`,
            });
        }
    };

    /* ── Generate available time slots (30-min intervals, 8am–6pm) ── */
    const generateSlots = (): { time: string; label: string; available: boolean }[] => {
        const slots: { time: string; label: string; available: boolean }[] = [];
        for (let hour = 8; hour < 18; hour++) {
            for (const min of [0, 30]) {
                const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                const slotStart = new Date(`${date}T${timeStr}:00`);
                const slotEnd = new Date(slotStart.getTime() + 30 * 60_000);

                const isBusy = availability.some((u) =>
                    u.busy_slots.some((slot) => {
                        const busyStart = new Date(slot.start);
                        const busyEnd = new Date(slot.end);
                        return slotStart < busyEnd && slotEnd > busyStart;
                    }),
                );

                const label = slotStart.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });

                slots.push({ time: timeStr, label, available: !isBusy });
            }
        }
        return slots;
    };

    const minDate = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-base-content/50">
                Schedule
            </label>

            {/* Date picker */}
            <fieldset>
                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                    Date
                </legend>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={minDate}
                    className="input w-full"
                />
            </fieldset>

            {/* Time selection */}
            {date && (
                <>
                    {loadingAvailability && (
                        <div className="flex items-center gap-2 py-3">
                            <span className="loading loading-spinner loading-sm" />
                            <span className="text-sm text-base-content/50">
                                Checking availability...
                            </span>
                        </div>
                    )}

                    {!loadingAvailability && hasCalendars && availability.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm text-base-content/50">
                                <i className="fa-duotone fa-regular fa-calendar-check text-success mr-1" />
                                Calendar availability loaded. Green slots are free for all participants.
                            </p>
                            <div className="grid grid-cols-4 gap-1.5">
                                {generateSlots().map((slot) => (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        className={`btn btn-sm ${
                                            time === slot.time
                                                ? 'btn-primary'
                                                : slot.available
                                                    ? 'btn-outline btn-success'
                                                    : 'btn-ghost opacity-40'
                                        }`}
                                        onClick={() => slot.available && selectSlot(slot.time)}
                                        disabled={!slot.available}
                                    >
                                        {slot.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loadingAvailability && !hasCalendars && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-base-200 border border-base-300">
                                <i className="fa-duotone fa-regular fa-calendar-xmark text-warning" />
                                <span className="text-sm text-base-content/60">
                                    Calendar not connected for all participants. Select a time manually.
                                </span>
                            </div>
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Time
                                </legend>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    className="input w-full"
                                />
                            </fieldset>
                        </div>
                    )}

                    {/* Timezone display */}
                    <p className="text-sm text-base-content/40">
                        <i className="fa-duotone fa-regular fa-globe mr-1" />
                        {timeZone}
                    </p>

                    {/* Selection summary */}
                    {selection && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 border border-primary/20">
                            <i className="fa-duotone fa-regular fa-calendar-check text-primary" />
                            <span className="text-sm font-bold">
                                {new Date(`${selection.date}T00:00:00`).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                                {' at '}
                                {new Date(`${selection.date}T${selection.time}:00`).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
