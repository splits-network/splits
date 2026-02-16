import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface CalendarDayEvent {
    /** Unique event ID */
    id: string | number;
    /** Event title */
    title: string;
    /** FontAwesome icon class */
    icon?: string;
    /** Accent color */
    color?: AccentColor;
}

export interface CalendarDayCellProps {
    /** Day number */
    day: number;
    /** Events for this day */
    events?: CalendarDayEvent[];
    /** Whether this day is today */
    isToday?: boolean;
    /** Whether this day is selected */
    isSelected?: boolean;
    /** Maximum number of events to show before "+N more" */
    maxEvents?: number;
    /** Called when the day cell is clicked */
    onClick?: () => void;
    /** Additional className */
    className?: string;
}

/**
 * CalendarDayCell - Memphis-styled calendar day cell
 *
 * Displays day number and event badges. Supports today/selected states
 * with Memphis-appropriate styling (no border-radius).
 * Extracted from calendars-six showcase.
 */
export function CalendarDayCell({
    day,
    events = [],
    isToday = false,
    isSelected = false,
    maxEvents = 2,
    onClick,
    className = '',
}: CalendarDayCellProps) {
    return (
        <div
            onClick={onClick}
            className={[
                'p-2 min-h-[80px] cursor-pointer transition-colors relative',
                isSelected ? 'bg-dark' : isToday ? 'bg-yellow/25' : 'bg-white',
                isToday ? 'border-3 border-coral' : 'border border-[#e5e5e5]',
                className,
            ].filter(Boolean).join(' ')}
        >
            <span
                className={[
                    'font-black text-sm',
                    isSelected ? 'text-white' : isToday ? 'text-coral' : 'text-dark',
                ].join(' ')}
            >
                {day}
            </span>
            <div className="mt-1 space-y-0.5">
                {events.slice(0, maxEvents).map((ev) => {
                    const eventColor = ev.color || 'teal';
                    return (
                        <div
                            key={ev.id}
                            className={`accent-${eventColor} px-1.5 py-0.5 text-[10px] font-bold truncate bg-accent text-dark`}
                        >
                            {ev.icon && <i className={`fa-duotone fa-solid ${ev.icon} mr-1`} />}
                            {ev.title}
                        </div>
                    );
                })}
                {events.length > maxEvents && (
                    <span className="text-[10px] font-black text-purple">
                        +{events.length - maxEvents} more
                    </span>
                )}
            </div>
        </div>
    );
}
