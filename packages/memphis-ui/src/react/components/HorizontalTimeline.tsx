import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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

/** Map AccentColor to the CSS step color variant class */
const STEP_COLOR_CLASS: Record<AccentColor, string> = {
    coral: 'step-coral',
    teal: 'step-teal',
    yellow: 'step-yellow',
    purple: 'step-purple',
};

/** Map AccentColor to the CSS variable for inline use (status badges) */
/**
 * HorizontalTimeline - Memphis-styled horizontal milestone timeline
 *
 * Uses Memphis `.steps .steps-horizontal` CSS classes with step color variants.
 * Displays milestones along a horizontal track with icons and status badges.
 * Extracted from timelines-six showcase.
 */
export function HorizontalTimeline({
    milestones,
    className = '',
}: HorizontalTimelineProps) {
    return (
        <ul className={['steps steps-horizontal w-full', className].filter(Boolean).join(' ')}>
            {milestones.map((m) => {
                const colorClass = STEP_COLOR_CLASS[m.color || 'teal'];
                const statusAccent = m.statusColor || m.color || 'teal';

                return (
                    <li key={m.label} className={`step ${colorClass}`}>
                        <span className="step-icon">
                            <i className={`fa-duotone fa-solid ${m.icon}`} />
                        </span>
                        <div className="flex flex-col items-center gap-1 mt-2">
                            {m.date && (
                                <span className="text-xs font-bold uppercase opacity-50">
                                    {m.date}
                                </span>
                            )}
                            <span className="font-black text-sm uppercase tracking-wider">
                                {m.label}
                            </span>
                            {m.status && (
                                <span
                                    className={`accent-${statusAccent} px-2 py-0.5 text-[10px] font-black uppercase text-dark border-xs bg-accent`}
                                >
                                    {m.status}
                                </span>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
