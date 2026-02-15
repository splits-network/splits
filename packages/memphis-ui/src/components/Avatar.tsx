import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface AvatarProps {
    /** Initials to display (e.g. "SC") */
    initials: string;
    /** Accent color for the background */
    color?: AccentColor;
    /** Avatar size */
    size?: 'sm' | 'md' | 'lg';
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
};

const SIZES = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-xl',
};

/**
 * Avatar - Memphis-styled initials avatar
 *
 * Square (no border-radius), thick 4px dark border, accent background.
 * Extracted from testimonials-six showcase.
 */
export function Avatar({
    initials,
    color = 'coral',
    size = 'md',
    className = '',
}: AvatarProps) {
    const hex = ACCENT_HEX[color];

    return (
        <div
            className={[
                SIZES[size],
                'flex items-center justify-center font-black uppercase',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                background: hex,
                border: `4px solid ${COLORS.dark}`,
                color: COLORS.dark,
            }}
        >
            {initials}
        </div>
    );
}
