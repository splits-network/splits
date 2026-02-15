import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div
            className={[
                'border-4 p-6 text-center transition-transform hover:-translate-y-1 cursor-pointer',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ borderColor: hex, backgroundColor: '#FFFFFF' }}
            onClick={onClick}
        >
            {/* Avatar */}
            <div
                className="w-16 h-16 mx-auto mb-4 border-4 rounded-full flex items-center justify-center"
                style={{ borderColor: hex, backgroundColor: hex }}
            >
                <span className="text-lg font-black" style={{ color: textHex }}>
                    {initials}
                </span>
            </div>

            <h3
                className="text-sm font-black uppercase tracking-wide mb-0.5"
                style={{ color: '#1A1A2E' }}
            >
                {name}
            </h3>
            <p className="text-xs font-semibold mb-3" style={{ color: hex }}>
                {title}
            </p>

            {/* Specialties */}
            {specialties.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {specialties.map((s) => (
                        <span
                            key={s}
                            className="px-2 py-0.5 text-[10px] font-bold uppercase border-2"
                            style={{ borderColor: hex, color: '#1A1A2E' }}
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
                            <p className="text-lg font-black" style={{ color: hex }}>
                                {stat.value}
                            </p>
                            <p
                                className="text-[10px] font-bold uppercase"
                                style={{ color: '#1A1A2E', opacity: 0.4 }}
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
                className="w-full py-2 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                style={{ borderColor: hex, backgroundColor: hex, color: textHex }}
            >
                {actionLabel}
            </button>
        </div>
    );
}
