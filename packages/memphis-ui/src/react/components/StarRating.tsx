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

const SIZE_CLASSES = {
    sm: 'rating-sm',
    md: 'rating-md',
    lg: 'rating-lg',
};

/**
 * StarRating - Memphis-styled star rating display
 *
 * Uses `.rating` CSS container class with FontAwesome star icons.
 * Filled stars use Memphis yellow via CSS variable, empty stars are muted.
 */
export function StarRating({
    rating,
    max = 5,
    size = 'md',
    className = '',
}: StarRatingProps) {
    return (
        <div className={['rating gap-1', SIZE_CLASSES[size], className].filter(Boolean).join(' ')}>
            {Array.from({ length: max }, (_, i) => (
                <i
                    key={i}
                    className={`fa-${i < rating ? 'solid' : 'regular'} fa-star ${i < rating ? 'text-yellow' : 'text-base-content opacity-30'}`}
                />
            ))}
        </div>
    );
}
