import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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

const SIZE_CLASSES = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-xl',
};

const COLOR_CLASSES: Record<AccentColor, string> = {
    coral: 'bg-coral text-dark',
    teal: 'bg-teal text-dark',
    yellow: 'bg-yellow text-dark',
    purple: 'bg-purple text-dark',
};

/**
 * Avatar - Memphis-styled initials avatar
 *
 * Uses .avatar and .avatar-placeholder CSS classes from avatar.css.
 * Square (no border-radius), thick dark border, accent background.
 */
export function Avatar({
    initials,
    color = 'coral',
    size = 'md',
    className = '',
}: AvatarProps) {
    return (
        <div className={['avatar avatar-placeholder', className].filter(Boolean).join(' ')}>
            <div
                className={[SIZE_CLASSES[size], COLOR_CLASSES[color], 'font-black uppercase'].filter(Boolean).join(' ')}
            >
                {initials}
            </div>
        </div>
    );
}
