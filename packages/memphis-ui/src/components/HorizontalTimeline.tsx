import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface TimelineMilestone {
    /** Milestone label */
    label: string;
    /** FontAwesome icon class */
    icon: string;
    /** Accent color */
    color?: AccentColor;
    /** Date or time period display */
    date?: string;
    /** Status label (e.g. "Complete", "In Progress") */
    status?: string;
    /** Status accent color */
    statusColor?: AccentColor;
}

export interface HorizontalTimelineProps {
    /** Milestone definitions */
    milestones: TimelineMilestone[];
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
};

/**
 * HorizontalTimeline - Memphis-styled horizontal milestone timeline
 *
 * Displays milestones along a horizontal track with icons and status badges.
 * Extracted from timelines-six showcase.
 */
export function HorizontalTimeline({
    milestones,
    className = '',
}: HorizontalTimelineProps) {
    return (
        <div className={['relative overflow-x-auto pb-4', className].filter(Boolean).join(' ')}>
            {/* Track line */}
            <div
                className="absolute top-14 left-8 right-8 h-1"
                style={{ background: COLORS.dark }}
            />
            <div className="flex gap-0 min-w-[700px]">
                {milestones.map((m) => {
                    const hex = ACCENT_HEX[m.color || 'teal'];
                    const statusHex = m.statusColor ? ACCENT_HEX[m.statusColor] : hex;

                    return (
                        <div
                            key={m.label}
                            className="flex-1 flex flex-col items-center text-center"
                        >
                            {m.date && (
                                <span className="text-xs font-bold uppercase mb-2" style={{ color: '#999' }}>
                                    {m.date}
                                </span>
                            )}
                            <div
                                className="w-14 h-14 flex items-center justify-center z-10"
                                style={{
                                    background: hex,
                                    border: `4px solid ${COLORS.dark}`,
                                }}
                            >
                                <i className={`fa-duotone fa-solid ${m.icon} text-lg`} style={{ color: COLORS.dark }} />
                            </div>
                            <span
                                className="mt-3 font-black text-sm uppercase tracking-wider"
                                style={{ color: COLORS.dark }}
                            >
                                {m.label}
                            </span>
                            {m.status && (
                                <span
                                    className="mt-1 px-2 py-0.5 text-[10px] font-black uppercase"
                                    style={{
                                        background: statusHex,
                                        color: COLORS.dark,
                                        border: `2px solid ${COLORS.dark}`,
                                    }}
                                >
                                    {m.status}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
