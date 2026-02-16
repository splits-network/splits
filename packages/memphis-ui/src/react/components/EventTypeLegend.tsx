import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface LegendItem {
    /** Legend label */
    label: string;
    /** FontAwesome icon class */
    icon: string;
    /** Accent color */
    color?: AccentColor;
}

export interface EventTypeLegendProps {
    /** Legend items */
    items: LegendItem[];
    /** Additional className */
    className?: string;
}

/**
 * EventTypeLegend - Memphis-styled legend for event type indicators
 *
 * Displays a horizontal list of colored badge-like indicators with icons.
 * Extracted from timelines-six showcase.
 */
export function EventTypeLegend({
    items,
    className = '',
}: EventTypeLegendProps) {
    return (
        <div className={['flex flex-wrap gap-4', className].filter(Boolean).join(' ')}>
            {items.map((item) => (
                <div
                    key={item.label}
                    className={[
                        'flex items-center gap-2 px-4 py-2 border-interactive text-dark',
                        `accent-${item.color || 'teal'}`,
                        'bg-accent',
                    ].join(' ')}
                >
                    <i className={`fa-duotone fa-solid ${item.icon} text-sm`} />
                    <span className="font-black text-xs uppercase tracking-wider">{item.label}</span>
                </div>
            ))}
        </div>
    );
}
