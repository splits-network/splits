import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
    return (
        <div
            className={[
                `accent-${color}`,
                'p-6 flex flex-col transition-all hover:opacity-90 bg-white border-lg',
                className,
            ].filter(Boolean).join(' ')}
        >
            {/* Quote icon */}
            <i className="fa-duotone fa-solid fa-quote-left text-3xl mb-4 text-accent" />

            {/* Quote text */}
            <p className="text-sm font-medium flex-1 leading-relaxed text-dark">
                &ldquo;{quote}&rdquo;
            </p>

            {/* Rating */}
            {rating !== undefined && (
                <div className="mt-4 mb-4 flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                        <i
                            key={i}
                            className={`fa-${i < rating ? 'solid' : 'regular'} fa-star text-sm ${i < rating ? 'text-yellow' : 'text-[#ccc]'}`}
                        />
                    ))}
                </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t-3 border-dark/20">
                {initials && (
                    <div className="w-10 h-10 flex items-center justify-center font-black text-xs uppercase bg-accent border-lg text-dark">
                        {initials}
                    </div>
                )}
                <div>
                    <p className="font-black text-sm uppercase text-dark">{name}</p>
                    <p className="text-sm font-bold text-[#999]">
                        {role}{company ? `, ${company}` : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}
