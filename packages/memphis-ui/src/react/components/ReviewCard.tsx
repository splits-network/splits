import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface ReviewCardProps {
    /** Reviewer name */
    name: string;
    /** Reviewer role/title */
    role: string;
    /** Review text */
    text: string;
    /** Rating (1-5) */
    rating: number;
    /** Accent color */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * ReviewCard - Star-rated review card
 *
 * Memphis compliant review card with avatar initials, star rating, and review text.
 * Extracted from profiles-six showcase.
 */
export function ReviewCard({
    name,
    role,
    text,
    rating,
    accent = 'coral',
    className = '',
}: ReviewCardProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div
            className={[`accent-${accent}`, 'border-3 p-5 border-accent', className].filter(Boolean).join(' ')}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 flex items-center justify-center border-2 rounded-full border-accent bg-accent"
                    >
                        <span
                            className="text-sm font-black text-on-accent"
                        >
                            {initials}
                        </span>
                    </div>
                    <div>
                        <p
                            className="text-sm font-black uppercase text-dark"
                        >
                            {name}
                        </p>
                        <p className="text-[10px] text-dark/50">
                            {role}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <i
                            key={i}
                            className={`${i < rating ? 'fa-solid' : 'fa-regular'} fa-star text-xs text-yellow`}
                        />
                    ))}
                </div>
            </div>
            <p
                className="text-sm leading-relaxed text-dark/70"
            >
                {text}
            </p>
        </div>
    );
}
