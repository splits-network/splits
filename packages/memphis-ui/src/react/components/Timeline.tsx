import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface TimelineEntry {
    /** Date or time label */
    date: string;
    /** Event description */
    event: string;
    /** FontAwesome icon class */
    icon: string;
    /** Accent color for this entry */
    accent: AccentColor;
}

export interface TimelineProps {
    /** List of timeline entries */
    entries: TimelineEntry[];
    /** Horizontal layout instead of vertical */
    horizontal?: boolean;
    /** Compact mode (no start content, tighter spacing) */
    compact?: boolean;
    /** Custom class name */
    className?: string;
}

const ACCENT_BADGE_CLASS: Record<AccentColor, string> = {
    coral: 'badge-coral',
    teal: 'badge-teal',
    yellow: 'badge-yellow',
    purple: 'badge-purple',
};

/**
 * Timeline - Vertical (or horizontal) activity timeline
 *
 * Uses CSS classes from timeline.css:
 * - `.timeline` container on `<ul>`
 * - `.timeline-vertical` / `.timeline-horizontal` for layout direction
 * - `.timeline-compact` for compact mode
 * - `.timeline-start`, `.timeline-middle`, `.timeline-end` for content placement
 * - `.timeline-box` for styled content boxes
 * - `<hr>` elements for connector lines
 */
export function Timeline({
    entries,
    horizontal = false,
    compact = false,
    className = '',
}: TimelineProps) {
    return (
        <ul
            className={[
                'timeline',
                horizontal ? 'timeline-horizontal' : 'timeline-vertical',
                compact ? 'timeline-compact' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {entries.map((entry, i) => {
                const isFirst = i === 0;
                const isLast = i === entries.length - 1;

                return (
                    <li key={i}>
                        {/* Connector line before (hidden for first) */}
                        {!isFirst && <hr />}

                        {/* Date label above (or left in vertical) */}
                        <div className="timeline-start timeline-box">
                            {entry.date}
                        </div>

                        {/* Center icon node */}
                        <div className="timeline-middle">
                            <i className={`${entry.icon} text-sm`} />
                        </div>

                        {/* Event description below (or right in vertical) */}
                        <div className="timeline-end timeline-box">
                            <span className="font-bold text-sm">{entry.event}</span>
                        </div>

                        {/* Connector line after (hidden for last) */}
                        {!isLast && <hr />}
                    </li>
                );
            })}
        </ul>
    );
}
