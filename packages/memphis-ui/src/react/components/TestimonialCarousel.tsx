"use client";

import React, { useState } from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface CarouselTestimonial {
    /** Unique ID */
    id: string | number;
    /** Quote text */
    quote: string;
    /** Author name */
    name: string;
    /** Author role */
    role: string;
    /** Author company */
    company?: string;
    /** Author initials */
    initials?: string;
    /** Rating (0-5) */
    rating?: number;
    /** Accent color */
    color?: AccentColor;
}

export interface TestimonialCarouselProps {
    /** Testimonial items */
    testimonials: CarouselTestimonial[];
    /** Starting index */
    startIndex?: number;
    /** Additional className */
    className?: string;
}

/**
 * TestimonialCarousel - Memphis-styled testimonial carousel
 *
 * Single-slide view with prev/next navigation and dot indicators.
 * Extracted from testimonials-six showcase.
 */
export function TestimonialCarousel({
    testimonials,
    startIndex = 0,
    className = '',
}: TestimonialCarouselProps) {
    const [current, setCurrent] = useState(startIndex);

    const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    if (testimonials.length === 0) return null;
    const t = testimonials[current];

    return (
        <div
            className={[`accent-${t.color || 'teal'} p-8 bg-white border-container`, className].filter(Boolean).join(' ')}
        >
            <div className="text-center">
                {/* Avatar */}
                {t.initials && (
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 flex items-center justify-center font-black text-xl uppercase bg-accent border-container text-dark">
                            {t.initials}
                        </div>
                    </div>
                )}

                {/* Quote */}
                <i className="fa-duotone fa-solid fa-quote-left text-4xl mb-4 block text-accent" />
                <p className="text-lg font-medium max-w-2xl mx-auto leading-relaxed text-dark">
                    &ldquo;{t.quote}&rdquo;
                </p>

                {/* Rating */}
                {t.rating !== undefined && (
                    <div className="mt-6 flex justify-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                            <i
                                key={i}
                                className={`fa-${i < t.rating! ? 'solid' : 'regular'} fa-star text-sm ${i < t.rating! ? 'text-yellow' : 'text-[#ccc]'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Author */}
                <p className="mt-4 font-black text-base uppercase text-dark">{t.name}</p>
                <p className="text-sm font-bold text-[#999]">
                    {t.role}{t.company ? `, ${t.company}` : ''}
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
                <button
                    onClick={prev}
                    className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80 bg-teal border-interactive text-dark"
                >
                    <i className="fa-duotone fa-solid fa-chevron-left" />
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-4 h-4 transition-all border-detail ${i === current ? 'bg-coral' : 'bg-[#ddd]'}`}
                        />
                    ))}
                </div>

                <button
                    onClick={next}
                    className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80 bg-teal border-interactive text-dark"
                >
                    <i className="fa-duotone fa-solid fa-chevron-right" />
                </button>
            </div>
        </div>
    );
}
