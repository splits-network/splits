import React from 'react';

export interface CalendarGridProps {
    /** Day-of-week header labels */
    dayLabels?: string[];
    /** Calendar cell content (typically CalendarDayCell components) */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
}

const DEFAULT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * CalendarGrid - Memphis-styled calendar month grid layout
 *
 * 7-column grid with dark header row for day labels.
 * Children should be CalendarDayCell components (or empty divs for leading blanks).
 * Extracted from calendars-six showcase.
 */
export function CalendarGrid({
    dayLabels = DEFAULT_DAYS,
    children,
    className = '',
}: CalendarGridProps) {
    return (
        <div className={className}>
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-dark">
                {dayLabels.map((d) => (
                    <div
                        key={d}
                        className="p-3 text-center font-black text-xs uppercase tracking-wider text-yellow"
                    >
                        {d}
                    </div>
                ))}
            </div>
            {/* Grid cells */}
            <div className="grid grid-cols-7">
                {children}
            </div>
        </div>
    );
}
