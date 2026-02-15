import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

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

const COLORS = {
    dark: '#1A1A2E',
    coral: '#FF6B6B',
    yellow: '#FFE66D',
    purple: '#A78BFA',
};

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
                className,
            ].filter(Boolean).join(' ')}
            style={{
                background: isSelected ? COLORS.dark : isToday ? COLORS.yellow + '40' : '#fff',
                border: isToday ? `3px solid ${COLORS.coral}` : '1px solid #e5e5e5',
            }}
        >
            <span
                className="font-black text-sm"
                style={{ color: isSelected ? '#fff' : isToday ? COLORS.coral : COLORS.dark }}
            >
                {day}
            </span>
            <div className="mt-1 space-y-0.5">
                {events.slice(0, maxEvents).map((ev) => {
                    const hex = ACCENT_HEX[ev.color || 'teal'];
                    return (
                        <div
                            key={ev.id}
                            className="px-1.5 py-0.5 text-[10px] font-bold truncate"
                            style={{ background: hex, color: COLORS.dark }}
                        >
                            {ev.icon && <i className={`fa-duotone fa-solid ${ev.icon} mr-1`} />}
                            {ev.title}
                        </div>
                    );
                })}
                {events.length > maxEvents && (
                    <span className="text-[10px] font-black" style={{ color: COLORS.purple }}>
                        +{events.length - maxEvents} more
                    </span>
                )}
            </div>
        </div>
    );
}
