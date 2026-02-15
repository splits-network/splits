import React from 'react';

export interface StarRatingProps {
    /** Rating value (0-5) */
    rating: number;
    /** Maximum number of stars */
    max?: number;
    /** Size of the star icons */
    size?: 'sm' | 'md' | 'lg';
    /** Additional className */
    className?: string;
}

const COLORS = {
    yellow: '#FFE66D',
};

const SIZES = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
};

/**
 * StarRating - Memphis-styled star rating display
 *
 * Filled stars in Memphis yellow, empty stars in gray.
 * Extracted from testimonials-six showcase.
 */
export function StarRating({
    rating,
    max = 5,
    size = 'md',
    className = '',
}: StarRatingProps) {
    return (
        <div className={['flex gap-1', className].filter(Boolean).join(' ')}>
            {Array.from({ length: max }, (_, i) => (
                <i
                    key={i}
                    className={`fa-${i < rating ? 'solid' : 'regular'} fa-star ${SIZES[size]}`}
                    style={{ color: i < rating ? COLORS.yellow : '#ccc' }}
                />
            ))}
        </div>
    );
}
