import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface TestimonialCardProps {
    /** Quote text */
    quote: string;
    /** Author name */
    name: string;
    /** Author role/title */
    role: string;
    /** Author company */
    company?: string;
    /** Author initials for avatar */
    initials?: string;
    /** Rating (0-5) */
    rating?: number;
    /** Accent color for the quote icon and avatar */
    color?: AccentColor;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    yellow: '#FFE66D',
};

/**
 * TestimonialCard - Memphis-styled testimonial card
 *
 * Displays a quote, star rating, and author info with avatar.
 * 4px dark border, no border-radius. Extracted from testimonials-six showcase.
 */
export function TestimonialCard({
    quote,
    name,
    role,
    company,
    initials,
    rating,
    color = 'teal',
    className = '',
}: TestimonialCardProps) {
    const hex = ACCENT_HEX[color];

    return (
        <div
            className={[
                'p-6 flex flex-col transition-all hover:opacity-90 bg-white',
                className,
            ].filter(Boolean).join(' ')}
            style={{ border: `4px solid ${COLORS.dark}` }}
        >
            {/* Quote icon */}
            <i className="fa-duotone fa-solid fa-quote-left text-3xl mb-4" style={{ color: hex }} />

            {/* Quote text */}
            <p
                className="text-sm font-medium flex-1 leading-relaxed"
                style={{ color: COLORS.dark }}
            >
                &ldquo;{quote}&rdquo;
            </p>

            {/* Rating */}
            {rating !== undefined && (
                <div className="mt-4 mb-4 flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                        <i
                            key={i}
                            className={`fa-${i < rating ? 'solid' : 'regular'} fa-star text-sm`}
                            style={{ color: i < rating ? COLORS.yellow : '#ccc' }}
                        />
                    ))}
                </div>
            )}

            {/* Author */}
            <div
                className="flex items-center gap-3 pt-4"
                style={{ borderTop: `3px solid ${COLORS.dark}20` }}
            >
                {initials && (
                    <div
                        className="w-10 h-10 flex items-center justify-center font-black text-xs uppercase"
                        style={{
                            background: hex,
                            border: `4px solid ${COLORS.dark}`,
                            color: COLORS.dark,
                        }}
                    >
                        {initials}
                    </div>
                )}
                <div>
                    <p className="font-black text-sm uppercase" style={{ color: COLORS.dark }}>{name}</p>
                    <p className="text-xs font-bold" style={{ color: '#999' }}>
                        {role}{company ? `, ${company}` : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}
