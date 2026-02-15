import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
    /** Custom class name */
    className?: string;
}

/**
 * Timeline - Vertical activity timeline
 *
 * Memphis compliant timeline with icon nodes, bordered content cards, and vertical connector line.
 * Extracted from details-six showcase.
 */
export function Timeline({ entries, className = '' }: TimelineProps) {
    return (
        <div className={['relative', className].filter(Boolean).join(' ')}>
            {/* Vertical connector line */}
            <div
                className="absolute left-5 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: 'rgba(26,26,46,0.1)' }}
            />

            <div className="space-y-8">
                {entries.map((entry, i) => {
                    const hex = ACCENT_HEX[entry.accent];
                    const textHex = ACCENT_TEXT[entry.accent];

                    return (
                        <div key={i} className="flex items-start gap-5 relative">
                            <div
                                className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-3 relative z-10"
                                style={{ borderColor: hex, backgroundColor: '#FFFFFF' }}
                            >
                                <i className={`${entry.icon} text-sm`} style={{ color: hex }} />
                            </div>
                            <div
                                className="flex-1 border-3 p-4"
                                style={{ borderColor: hex }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span
                                        className="text-sm font-bold"
                                        style={{ color: '#1A1A2E' }}
                                    >
                                        {entry.event}
                                    </span>
                                    <span
                                        className="text-xs font-bold uppercase tracking-wider px-2 py-0.5"
                                        style={{ backgroundColor: hex, color: textHex }}
                                    >
                                        {entry.date}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
