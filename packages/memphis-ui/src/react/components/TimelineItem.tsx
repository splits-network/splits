"use client";

import React, { useState } from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface TimelineItemProps {
    /** FontAwesome icon class (without fa-duotone fa-solid prefix) */
    icon: string;
    /** Accent color for the icon badge */
    color?: AccentColor;
    /** Item title */
    title: string;
    /** Item description */
    description: string;
    /** Time display string */
    time?: string;
    /** Type/category label badge */
    type?: string;
    /** Expandable detail text */
    expandableContent?: string;
    /** Whether to show the connecting line below */
    showConnector?: boolean;
    /** Additional className */
    className?: string;
}

const COLOR_CLASS: Record<AccentColor, string> = {
    coral: 'badge-coral',
    teal: 'badge-teal',
    yellow: 'badge-yellow',
    purple: 'badge-purple',
};

/**
 * TimelineItem - A single vertical timeline event for use inside `<ul class="timeline timeline-vertical">`
 *
 * Uses CSS classes from timeline.css:
 * - `.timeline-start` for the time label
 * - `.timeline-middle` for the center icon node
 * - `.timeline-end` for the event card content
 * - `.timeline-box` for styled content boxes
 * - `<hr>` for connector lines between items
 *
 * Also uses `.badge` classes for the type label and `.collapse` behavior
 * for expandable content.
 */
export function TimelineItem({
    icon,
    color = 'teal',
    title,
    description,
    time,
    type,
    expandableContent,
    showConnector = true,
    className = '',
}: TimelineItemProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <li className={className || undefined}>
            {/* Connector line above */}
            <hr />

            {/* Time label on the start side */}
            {time && (
                <div className="timeline-start text-xs font-bold opacity-60">
                    {time}
                </div>
            )}

            {/* Center icon node */}
            <div className="timeline-middle">
                <div className={`badge ${COLOR_CLASS[color]} badge-lg`}>
                    <i className={`fa-duotone fa-solid ${icon} text-sm`} />
                </div>
            </div>

            {/* Event card content */}
            <div className="timeline-end timeline-box">
                <div className="flex items-center gap-2 mb-1">
                    {type && (
                        <span className={`badge badge-sm ${COLOR_CLASS[color]}`}>
                            {type}
                        </span>
                    )}
                </div>
                <h3 className="font-black text-sm uppercase">{title}</h3>
                <p className="text-sm font-medium mt-1">{description}</p>

                {expandableContent && (
                    <>
                        <div
                            style={{
                                height: expanded ? 'auto' : 0,
                                opacity: expanded ? 1 : 0,
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <p className="text-sm font-medium mt-3 p-3 bg-base-200">
                                {expandableContent}
                            </p>
                        </div>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-2 text-sm font-black uppercase tracking-wider link link-hover"
                        >
                            {expanded ? 'Show Less' : 'Show More'}
                            <i
                                className={`fa-duotone fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} ml-1`}
                            />
                        </button>
                    </>
                )}
            </div>

            {/* Connector line below */}
            {showConnector && <hr />}
        </li>
    );
}
