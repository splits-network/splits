import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface RecruiterCardProps {
    /** Recruiter name */
    name: string;
    /** Title/role */
    title: string;
    /** Specialties */
    specialties?: string[];
    /** Stats to display */
    stats?: { label: string; value: string | number }[];
    /** Accent color */
    accent?: AccentColor;
    /** Action button label */
    actionLabel?: string;
    /** Action click handler */
    onAction?: () => void;
    /** Click handler */
    onClick?: () => void;
    /** Custom class name */
    className?: string;
}

/**
 * RecruiterCard - Recruiter profile card
 *
 * Memphis compliant card with avatar initials, specialties, stats, and action button.
 * Extracted from cards-six showcase.
 */
export function RecruiterCard({
    name,
    title,
    specialties = [],
    stats = [],
    accent = 'coral',
    actionLabel = 'View Profile',
    onAction,
    onClick,
    className = '',
}: RecruiterCardProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div
            className={[
                `accent-${accent}`,
                'border-4 p-6 text-center transition-transform hover:-translate-y-1 cursor-pointer border-accent bg-white',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={onClick}
        >
            {/* Avatar */}
            <div
                className="w-16 h-16 mx-auto mb-4 border-4 rounded-full flex items-center justify-center border-accent bg-accent"
            >
                <span className="text-lg font-black text-on-accent">
                    {initials}
                </span>
            </div>

            <h3
                className="text-sm font-black uppercase tracking-wide mb-0.5 text-dark"
            >
                {name}
            </h3>
            <p className="text-sm font-semibold mb-3 text-accent">
                {title}
            </p>

            {/* Specialties */}
            {specialties.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {specialties.map((s) => (
                        <span
                            key={s}
                            className="px-2 py-0.5 text-[10px] font-bold uppercase border-2 border-accent text-dark"
                        >
                            {s}
                        </span>
                    ))}
                </div>
            )}

            {/* Stats */}
            {stats.length > 0 && (
                <div className="flex justify-center gap-4 mb-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-lg font-black text-accent">
                                {stat.value}
                            </p>
                            <p
                                className="text-[10px] font-bold uppercase text-dark/40"
                            >
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Action button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onAction?.();
                }}
                className="w-full py-2 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 border-accent bg-accent text-on-accent"
            >
                {actionLabel}
            </button>
        </div>
    );
}
