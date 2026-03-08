"use client";

/* ─── Types ────────────────────────────────────────────────────────────── */

export interface TimeSlot {
    start: string;
    end: string;
}

interface AvailableSlotsListProps {
    slots: TimeSlot[];
    selectedSlot: TimeSlot | null;
    onSelect: (slot: TimeSlot) => void;
    loading: boolean;
    timezone: string;
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function groupSlotsByDay(slots: TimeSlot[]): Map<string, TimeSlot[]> {
    const groups = new Map<string, TimeSlot[]>();

    for (const slot of slots) {
        const date = new Date(slot.start);
        const dayKey = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });

        const existing = groups.get(dayKey) || [];
        existing.push(slot);
        groups.set(dayKey, existing);
    }

    return groups;
}

function formatTimeRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const fmt = (d: Date) =>
        d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

    return `${fmt(startDate)} - ${fmt(endDate)}`;
}

function isSameSlot(a: TimeSlot | null, b: TimeSlot): boolean {
    if (!a) return false;
    return a.start === b.start && a.end === b.end;
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function AvailableSlotsList({
    slots,
    selectedSlot,
    onSelect,
    loading,
    timezone,
}: AvailableSlotsListProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-3">
                    <i className="fa-duotone fa-regular fa-calendar-xmark text-xl text-base-content/30" />
                </div>
                <p className="text-sm font-bold text-base-content/50 mb-1">
                    No available slots
                </p>
                <p className="text-sm text-base-content/40">
                    No available slots in this time range. Try expanding the
                    date range or adjusting working hours.
                </p>
            </div>
        );
    }

    const grouped = groupSlotsByDay(slots);

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold uppercase tracking-wider text-base-content/50">
                    Available Slots
                </p>
                <p className="text-sm text-base-content/40">{timezone}</p>
            </div>
            <div className="max-h-64 overflow-y-auto border border-base-300">
                {Array.from(grouped.entries()).map(
                    ([dayLabel, daySlots], groupIndex) => (
                        <div key={dayLabel}>
                            {groupIndex > 0 && (
                                <div className="border-t border-base-300" />
                            )}
                            <div className="px-3 py-2 bg-base-200 border-b border-base-300">
                                <p className="text-sm font-bold text-base-content/70">
                                    {dayLabel}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-1 p-2">
                                {daySlots.map((slot) => {
                                    const selected = isSameSlot(
                                        selectedSlot,
                                        slot,
                                    );
                                    return (
                                        <button
                                            key={slot.start}
                                            type="button"
                                            onClick={() => onSelect(slot)}
                                            className={`px-3 py-2 border text-sm font-semibold transition-colors ${
                                                selected
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-base-300 hover:border-primary/30 text-base-content"
                                            }`}
                                        >
                                            {formatTimeRange(
                                                slot.start,
                                                slot.end,
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}
