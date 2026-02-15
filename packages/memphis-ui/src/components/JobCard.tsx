import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

export interface JobCardProps {
    /** Job title */
    title: string;
    /** Company name */
    company: string;
    /** Location */
    location: string;
    /** Salary range */
    salary: string;
    /** Employment type (e.g., "Full-Time") */
    type: string;
    /** Remote status (e.g., "Remote", "Hybrid") */
    remote: string;
    /** Skill/keyword tags */
    tags?: string[];
    /** Number of applicants */
    applicants?: number;
    /** Days since posting */
    daysAgo?: number;
    /** Accent color for the card */
    accent?: AccentColor;
    /** Whether the card is hovered (controls border color) */
    hovered?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Bookmark handler */
    onBookmark?: () => void;
    /** Custom class name */
    className?: string;
}

/**
 * JobCard - Standard job listing card
 *
 * Memphis compliant card with color strip, type/remote badges, salary, tags, and footer stats.
 * Extracted from cards-six showcase.
 */
export function JobCard({
    title,
    company,
    location,
    salary,
    type,
    remote,
    tags = [],
    applicants,
    daysAgo,
    accent = 'coral',
    hovered = false,
    onClick,
    onBookmark,
    className = '',
}: JobCardProps) {
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];

    return (
        <div
            className={[
                'border-4 p-0 transition-transform cursor-pointer relative overflow-hidden',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                borderColor: hovered ? hex : '#1A1A2E',
                backgroundColor: '#FFFFFF',
                transform: hovered ? 'translateY(-4px)' : 'none',
            }}
            onClick={onClick}
        >
            {/* Top color strip */}
            <div className="h-1.5" style={{ backgroundColor: hex }} />

            <div className="p-5">
                {/* Header badges */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span
                            className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                            style={{ backgroundColor: hex, color: textHex }}
                        >
                            {type}
                        </span>
                        <span
                            className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border-2"
                            style={{ borderColor: hex, color: hex }}
                        >
                            {remote}
                        </span>
                    </div>
                    {onBookmark && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onBookmark();
                            }}
                            className="w-7 h-7 flex items-center justify-center border-2 transition-colors"
                            style={{ borderColor: 'rgba(26,26,46,0.15)', color: 'rgba(26,26,46,0.3)' }}
                        >
                            <i className="fa-regular fa-bookmark text-xs" />
                        </button>
                    )}
                </div>

                {/* Title & Company */}
                <h3
                    className="text-base font-black uppercase tracking-wide leading-tight mb-1"
                    style={{ color: '#1A1A2E' }}
                >
                    {title}
                </h3>
                <p className="text-xs font-semibold mb-3" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                    {company} -- {location}
                </p>

                {/* Salary */}
                <p className="text-lg font-black mb-3" style={{ color: hex }}>
                    {salary}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] font-bold uppercase border-2"
                                style={{ borderColor: 'rgba(26,26,46,0.15)', color: '#1A1A2E' }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                {(applicants !== undefined || daysAgo !== undefined) && (
                    <div
                        className="flex items-center justify-between pt-3 border-t-2"
                        style={{ borderColor: '#F5F0EB' }}
                    >
                        {applicants !== undefined && (
                            <span
                                className="text-[10px] font-bold uppercase"
                                style={{ color: '#1A1A2E', opacity: 0.4 }}
                            >
                                <i className="fa-duotone fa-regular fa-users mr-1" />
                                {applicants} applied
                            </span>
                        )}
                        {daysAgo !== undefined && (
                            <span
                                className="text-[10px] font-bold uppercase"
                                style={{ color: '#1A1A2E', opacity: 0.4 }}
                            >
                                {daysAgo}d ago
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
