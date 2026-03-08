"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import { BaselWizardModal, BaselAlertBox } from "@splits-network/basel-ui";
import AvailableSlotsList from "./available-slots-list";
import type { TimeSlot } from "./available-slots-list";

/* ---- Types ------------------------------------------------------------ */

interface RescheduleInterviewModalProps {
    interviewId: string;
    currentScheduledAt: string;
    currentDuration: number;
    candidateName: string;
    jobTitle: string;
    calendarEventId?: string;
    calendarConnectionId?: string;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = "new-time" | "confirm";

const STEPS = [
    { label: "New Time" },
    { label: "Confirm" },
];

const DURATION_OPTIONS = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
];

/* ---- Helpers ----------------------------------------------------------- */

function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function extractDate(iso: string): string {
    return new Date(iso).toISOString().split("T")[0];
}

function extractTime(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ---- Component --------------------------------------------------------- */

export default function RescheduleInterviewModal({
    interviewId,
    currentScheduledAt,
    currentDuration,
    candidateName,
    jobTitle,
    calendarEventId,
    calendarConnectionId,
    onClose,
    onSuccess,
}: RescheduleInterviewModalProps) {
    const { getToken } = useAuth();

    const [step, setStep] = useState<Step>("new-time");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    /* form fields pre-filled with current values */
    const [date, setDate] = useState(() => extractDate(currentScheduledAt));
    const [startTime, setStartTime] = useState(() => extractTime(currentScheduledAt));
    const [duration, setDuration] = useState(currentDuration);
    const [reason, setReason] = useState("");

    /* available slots */
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [timeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

    const hasCalendar = !!calendarEventId && !!calendarConnectionId;

    /* fetch available slots when calendar connected */
    const fetchAvailableSlots = useCallback(async () => {
        if (!calendarConnectionId) return;
        setSlotsLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const now = new Date();
            const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
            const res = (await client.post(
                `/integrations/calendar/${calendarConnectionId}/availability`,
                {
                    calendar_ids: ["primary"],
                    time_min: now.toISOString(),
                    time_max: twoWeeks.toISOString(),
                },
            )) as { data: any };

            const slots = computeAvailableSlots(res.data, now, twoWeeks, duration);
            setAvailableSlots(slots);
        } catch {
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    }, [calendarConnectionId, duration]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (step === "new-time" && calendarConnectionId) {
            fetchAvailableSlots();
        }
    }, [step, calendarConnectionId, fetchAvailableSlots]);

    /* handlers */
    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        const d = new Date(slot.start);
        setDate(d.toISOString().split("T")[0]);
        setStartTime(
            `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        );
    };

    const handleNext = () => {
        if (step === "new-time" && date && startTime) {
            setStep("confirm");
        }
    };

    const handleBack = () => {
        if (step === "confirm") setStep("new-time");
    };

    const handleSubmit = async () => {
        if (!date || !startTime) return;
        setSubmitting(true);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);

            const scheduledAt = `${date}T${startTime}:00`;

            // 1. Reschedule the interview
            await client.patch(`/interviews/${interviewId}/reschedule`, {
                scheduled_at: scheduledAt,
                scheduled_duration_minutes: duration,
                reason: reason || undefined,
            });

            // 2. Update calendar event if connected
            if (calendarEventId && calendarConnectionId) {
                const endMs = new Date(scheduledAt).getTime() + duration * 60_000;
                const endDate = new Date(endMs);
                const endDateTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}T${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}:00`;

                await client.patch(
                    `/integrations/calendar/${calendarConnectionId}/events/${calendarEventId}`,
                    {
                        start_date_time: scheduledAt,
                        end_date_time: endDateTime,
                        time_zone: timeZone,
                    },
                );
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to reschedule interview");
        } finally {
            setSubmitting(false);
        }
    };

    const stepIndex = step === "new-time" ? 0 : 1;
    const nextDisabled = !date || !startTime;

    const newDateTime = date && startTime ? `${date}T${startTime}:00` : "";

    return (
        <ModalPortal>
            <BaselWizardModal
                isOpen
                onClose={onClose}
                title={step === "new-time" ? "Select New Time" : "Confirm Reschedule"}
                icon="fa-calendar-pen"
                accentColor="warning"
                steps={STEPS}
                currentStep={stepIndex}
                onNext={handleNext}
                onBack={handleBack}
                onSubmit={handleSubmit}
                submitting={submitting}
                nextDisabled={nextDisabled}
                nextLabel="Continue"
                submitLabel="Reschedule Interview"
                submittingLabel="Rescheduling..."
                maxWidth="max-w-2xl"
            >
                {error && (
                    <BaselAlertBox variant="error" className="mb-4">
                        {error}
                    </BaselAlertBox>
                )}

                {/* Step 1: New Time */}
                {step === "new-time" && (
                    <div className="space-y-4">
                        {/* Current time info */}
                        <div className="bg-base-200 border border-base-300 p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <i className="fa-duotone fa-regular fa-clock text-base-content/50" />
                                <p className="text-sm font-bold text-base-content/50 uppercase tracking-wider">
                                    Currently Scheduled
                                </p>
                            </div>
                            <p className="text-sm font-semibold">
                                {formatDateTime(currentScheduledAt)}
                            </p>
                            <p className="text-sm text-base-content/60">
                                {candidateName} &mdash; {jobTitle} ({currentDuration} min)
                            </p>
                        </div>

                        {/* Available slots from calendar */}
                        {calendarConnectionId && (
                            <AvailableSlotsList
                                slots={availableSlots}
                                selectedSlot={selectedSlot}
                                onSelect={handleSlotSelect}
                                loading={slotsLoading}
                                timezone={timeZone}
                            />
                        )}

                        {calendarConnectionId && availableSlots.length > 0 && (
                            <div className="divider text-sm text-base-content/40">
                                Or pick a custom time
                            </div>
                        )}

                        {/* Manual time entry */}
                        <div className="grid grid-cols-2 gap-4">
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Date
                                </legend>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                        setSelectedSlot(null);
                                    }}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="input w-full"
                                />
                            </fieldset>
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Start Time
                                </legend>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => {
                                        setStartTime(e.target.value);
                                        setSelectedSlot(null);
                                    }}
                                    className="input w-full"
                                />
                            </fieldset>
                        </div>

                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Duration
                            </legend>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="select w-full"
                            >
                                {DURATION_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Reason for Reschedule (optional)
                            </legend>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Let participants know why the interview is being rescheduled..."
                                className="textarea w-full"
                                rows={3}
                            />
                        </fieldset>
                    </div>
                )}

                {/* Step 2: Confirm */}
                {step === "confirm" && (
                    <div className="space-y-4">
                        <div className="bg-base-200 border border-base-300 p-5">
                            <p className="text-sm font-bold tracking-[0.2em] uppercase text-base-content/50 mb-4">
                                Reschedule Summary
                            </p>

                            <div className="space-y-4">
                                {/* Old vs new time comparison */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-base-content/50 uppercase mb-1">
                                            Previous Time
                                        </p>
                                        <p className="text-sm line-through text-base-content/40">
                                            {formatDateTime(currentScheduledAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary uppercase mb-1">
                                            New Time
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {newDateTime
                                                ? formatDateTime(newDateTime)
                                                : ""}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-base-content/50 uppercase">
                                        Duration
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {duration} minutes
                                    </p>
                                </div>

                                {reason && (
                                    <div>
                                        <p className="text-sm font-bold text-base-content/50 uppercase">
                                            Reason
                                        </p>
                                        <p className="text-sm text-base-content/70">
                                            {reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <BaselAlertBox variant="info">
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-bell" />
                                <span>
                                    Participants will be notified of the time change
                                </span>
                            </div>
                        </BaselAlertBox>
                    </div>
                )}
            </BaselWizardModal>
        </ModalPortal>
    );
}

/* ---- Slot Computation -------------------------------------------------- */

function computeAvailableSlots(
    availabilityData: any,
    rangeStart: Date,
    rangeEnd: Date,
    slotMinutes: number,
): TimeSlot[] {
    const busyPeriods: Array<{ start: Date; end: Date }> = [];

    if (availabilityData?.calendars) {
        for (const calData of Object.values(availabilityData.calendars) as any[]) {
            if (calData?.busy) {
                for (const b of calData.busy) {
                    busyPeriods.push({ start: new Date(b.start), end: new Date(b.end) });
                }
            }
        }
    } else if (Array.isArray(availabilityData?.busy)) {
        for (const b of availabilityData.busy) {
            busyPeriods.push({ start: new Date(b.start), end: new Date(b.end) });
        }
    }

    const slots: TimeSlot[] = [];
    const slotMs = slotMinutes * 60 * 1000;
    const cursor = new Date(rangeStart);
    cursor.setMinutes(Math.ceil(cursor.getMinutes() / slotMinutes) * slotMinutes, 0, 0);

    while (cursor.getTime() + slotMs <= rangeEnd.getTime()) {
        const day = cursor.getDay();
        const hour = cursor.getHours();

        if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) {
            const slotEnd = new Date(cursor.getTime() + slotMs);
            const isBusy = busyPeriods.some(
                (bp) => cursor < bp.end && slotEnd > bp.start,
            );
            if (!isBusy) {
                slots.push({ start: cursor.toISOString(), end: slotEnd.toISOString() });
            }
        }

        cursor.setTime(cursor.getTime() + slotMs);
    }

    return slots.slice(0, 100);
}
