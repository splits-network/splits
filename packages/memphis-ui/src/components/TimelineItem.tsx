import React, { useState } from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface TimelineItemProps {
    /** FontAwesome icon class */
    icon: string;
    /** Accent color for the icon box and type badge */
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

const COLORS = {
    dark: '#1A1A2E',
    cream: '#F5F0EB',
    teal: '#4ECDC4',
};

/**
 * TimelineItem - Memphis-styled vertical timeline event
 *
 * Card with icon box, type badge, title, description, and optional
 * expandable content. Includes a vertical connector line.
 * Extracted from timelines-six showcase.
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
    const hex = ACCENT_HEX[color];

    return (
        <div className={['flex items-start gap-6', className].filter(Boolean).join(' ')}>
            {/* Card */}
            <div className="flex-1">
                <div
                    className="p-5"
                    style={{ background: '#fff', border: `4px solid ${COLORS.dark}` }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        {type && (
                            <span
                                className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                                style={{
                                    background: hex,
                                    color: COLORS.dark,
                                    border: `2px solid ${COLORS.dark}`,
                                }}
                            >
                                {type}
                            </span>
                        )}
                        {time && (
                            <span className="text-xs font-bold" style={{ color: '#999' }}>{time}</span>
                        )}
                    </div>
                    <h3 className="font-black text-base uppercase" style={{ color: COLORS.dark }}>{title}</h3>
                    <p className="text-sm font-medium mt-1" style={{ color: COLORS.dark }}>{description}</p>

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
                                <p
                                    className="text-sm font-medium mt-3 p-3"
                                    style={{
                                        background: COLORS.cream,
                                        color: COLORS.dark,
                                        border: `2px solid ${COLORS.dark}30`,
                                    }}
                                >
                                    {expandableContent}
                                </p>
                            </div>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-2 text-xs font-black uppercase tracking-wider hover:underline"
                                style={{ color: COLORS.teal }}
                            >
                                {expanded ? 'Show Less' : 'Show More'}
                                <i className={`fa-duotone fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} ml-1`} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Center icon and connector */}
            <div className="flex flex-col items-center shrink-0">
                <div
                    className="w-12 h-12 flex items-center justify-center"
                    style={{
                        background: hex,
                        border: `4px solid ${COLORS.dark}`,
                    }}
                >
                    <i className={`fa-duotone fa-solid ${icon} text-lg`} style={{ color: COLORS.dark }} />
                </div>
                {showConnector && (
                    <div className="w-1 h-16 md:h-12" style={{ background: COLORS.dark }} />
                )}
            </div>
        </div>
    );
}
