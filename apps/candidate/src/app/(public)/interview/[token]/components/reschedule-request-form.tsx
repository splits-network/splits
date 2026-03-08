'use client';

import { useState, useMemo } from 'react';

interface TimeSlot {
    start: string;
    end: string;
}

interface RescheduleRequestFormProps {
    interviewId: string;
    token: string;
    availableSlots: TimeSlot[];
    candidateTimezone: string;
    rescheduleCount: number;
    maxReschedules: number;
    hasPendingRequest: boolean;
    onSuccess: () => void;
}

const API_BASE =
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

function formatSlotTime(isoString: string, timezone: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone,
    });
}

function formatSlotDate(isoString: string, timezone: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: timezone,
    });
}

/** Group slots by day for display */
function groupSlotsByDay(
    slots: TimeSlot[],
    timezone: string,
): Map<string, TimeSlot[]> {
    const groups = new Map<string, TimeSlot[]>();
    for (const slot of slots) {
        const dayKey = formatSlotDate(slot.start, timezone);
        const existing = groups.get(dayKey) || [];
        existing.push(slot);
        groups.set(dayKey, existing);
    }
    return groups;
}

export function RescheduleRequestForm({
    interviewId,
    token,
    availableSlots,
    candidateTimezone,
    rescheduleCount,
    maxReschedules,
    hasPendingRequest,
    onSuccess,
}: RescheduleRequestFormProps) {
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const groupedSlots = useMemo(
        () => groupSlotsByDay(availableSlots, candidateTimezone),
        [availableSlots, candidateTimezone],
    );

    // Limit reached
    if (rescheduleCount >= maxReschedules) {
        return (
            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info" />
                <span className="text-sm">
                    You have reached the maximum number of reschedule requests
                    ({maxReschedules}).
                </span>
            </div>
        );
    }

    // Pending request
    if (hasPendingRequest) {
        return (
            <div className="alert alert-warning">
                <i className="fa-duotone fa-regular fa-clock" />
                <div>
                    <p className="text-sm font-semibold">
                        Reschedule request pending
                    </p>
                    <p className="text-sm">
                        Waiting for interviewer response.
                    </p>
                </div>
                <span className="badge badge-warning">Pending</span>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="alert alert-success">
                <i className="fa-duotone fa-regular fa-circle-check" />
                <div>
                    <p className="text-sm font-semibold">
                        Reschedule request sent
                    </p>
                    <p className="text-sm">
                        The interviewer will review your proposed times and
                        confirm a new schedule.
                    </p>
                </div>
            </div>
        );
    }

    const toggleSlot = (slot: TimeSlot) => {
        setSelectedSlots((prev) => {
            const exists = prev.some(
                (s) => s.start === slot.start && s.end === slot.end,
            );
            if (exists) {
                return prev.filter(
                    (s) => !(s.start === slot.start && s.end === slot.end),
                );
            }
            if (prev.length >= 3) return prev;
            return [...prev, slot];
        });
    };

    const isSelected = (slot: TimeSlot) =>
        selectedSlots.some(
            (s) => s.start === slot.start && s.end === slot.end,
        );

    const canSubmit = selectedSlots.length >= 2 && selectedSlots.length <= 3;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE}/api/v2/interviews/${interviewId}/reschedule-request`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token,
                        proposed_times: selectedSlots,
                        notes: notes.trim() || undefined,
                    }),
                },
            );

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(
                    body.error || 'Failed to submit reschedule request',
                );
            }

            setSuccess(true);
            onSuccess();
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to submit reschedule request',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-base-content/70">
                Select <strong>2 to 3</strong> preferred time slots for your
                rescheduled interview.
            </p>

            {/* Slot selection grouped by day */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {Array.from(groupedSlots.entries()).map(([day, slots]) => (
                    <div key={day}>
                        <p className="text-sm font-semibold text-base-content/60 mb-1">
                            {day}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {slots.map((slot) => {
                                const selected = isSelected(slot);
                                return (
                                    <button
                                        key={slot.start}
                                        type="button"
                                        onClick={() => toggleSlot(slot)}
                                        disabled={
                                            !selected &&
                                            selectedSlots.length >= 3
                                        }
                                        className={`btn btn-sm ${
                                            selected
                                                ? 'btn-primary'
                                                : 'btn-ghost border border-base-300'
                                        }`}
                                    >
                                        {formatSlotTime(
                                            slot.start,
                                            candidateTimezone,
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {selectedSlots.length > 0 && (
                <p className="text-sm text-base-content/60">
                    {selectedSlots.length} of 3 slots selected
                    {selectedSlots.length < 2 && ' (minimum 2 required)'}
                </p>
            )}

            {/* Notes */}
            <fieldset className="fieldset">
                <legend className="fieldset-legend">
                    Reason for reschedule (optional)
                </legend>
                <textarea
                    className="textarea textarea-bordered w-full"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Let the interviewer know why you need to reschedule..."
                />
            </fieldset>

            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Submit */}
            <button
                type="button"
                className="btn btn-primary btn-block"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
            >
                {submitting && (
                    <span className="loading loading-spinner loading-sm" />
                )}
                Request Reschedule
            </button>

            <p className="text-sm text-base-content/50 text-center">
                Reschedule request {rescheduleCount + 1} of {maxReschedules}
            </p>
        </div>
    );
}
