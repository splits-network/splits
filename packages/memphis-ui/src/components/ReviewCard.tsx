import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div
            className={['border-3 p-5', className].filter(Boolean).join(' ')}
            style={{ borderColor: hex }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 flex items-center justify-center border-2 rounded-full"
                        style={{ borderColor: hex, backgroundColor: hex }}
                    >
                        <span
                            className="text-xs font-black"
                            style={{ color: textHex }}
                        >
                            {initials}
                        </span>
                    </div>
                    <div>
                        <p
                            className="text-xs font-black uppercase"
                            style={{ color: '#1A1A2E' }}
                        >
                            {name}
                        </p>
                        <p className="text-[10px]" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                            {role}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <i
                            key={i}
                            className={`${i < rating ? 'fa-solid' : 'fa-regular'} fa-star text-xs`}
                            style={{ color: '#FFE66D' }}
                        />
                    ))}
                </div>
            </div>
            <p
                className="text-sm leading-relaxed"
                style={{ color: '#1A1A2E', opacity: 0.7 }}
            >
                {text}
            </p>
        </div>
    );
}
