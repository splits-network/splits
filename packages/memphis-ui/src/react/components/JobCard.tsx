import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
    return (
        <div
            className={[
                `accent-${accent}`,
                'border-4 p-0 transition-transform cursor-pointer relative overflow-hidden bg-white',
                hovered ? 'border-accent -translate-y-1' : 'border-dark',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={onClick}
        >
            {/* Top color strip */}
            <div className="h-1.5 bg-accent" />

            <div className="p-5">
                {/* Header badges */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span
                            className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-accent text-on-accent"
                        >
                            {type}
                        </span>
                        <span
                            className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border-2 border-accent text-accent"
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
                            className="w-7 h-7 flex items-center justify-center border-2 transition-colors border-dark/[0.15] text-dark/30"
                        >
                            <i className="fa-regular fa-bookmark text-xs" />
                        </button>
                    )}
                </div>

                {/* Title & Company */}
                <h3 className="text-base font-black uppercase tracking-wide leading-tight mb-1 text-dark">
                    {title}
                </h3>
                <p className="text-sm font-semibold mb-3 text-dark opacity-50">
                    {company} -- {location}
                </p>

                {/* Salary */}
                <p className="text-lg font-black mb-3 text-accent">
                    {salary}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] font-bold uppercase border-2 border-dark/[0.15] text-dark"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                {(applicants !== undefined || daysAgo !== undefined) && (
                    <div className="flex items-center justify-between pt-3 border-t-2 border-cream">
                        {applicants !== undefined && (
                            <span className="text-[10px] font-bold uppercase text-dark opacity-40">
                                <i className="fa-duotone fa-regular fa-users mr-1" />
                                {applicants} applied
                            </span>
                        )}
                        {daysAgo !== undefined && (
                            <span className="text-[10px] font-bold uppercase text-dark opacity-40">
                                {daysAgo}d ago
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
