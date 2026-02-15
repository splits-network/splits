import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface CardProps {
    children: React.ReactNode;
    accent?: AccentColor;
    dark?: boolean;
    className?: string;
    onClick?: () => void;
}

/**
 * Memphis Card
 *
 * Sharp borders, flat background, optional accent color on the left border.
 * No shadows, no rounded corners.
 */
export function Card({ children, accent, dark = false, className = '', onClick }: CardProps) {
    const accentBorderStyle = accent
        ? { borderLeftColor: ACCENT_HEX[accent], borderLeftWidth: '6px' }
        : undefined;

    return (
        <div
            className={[
                'border-4 border-dark p-6',
                dark ? 'bg-dark text-white' : 'bg-white text-dark',
                onClick ? 'cursor-pointer hover:bg-cream transition-colors' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={accentBorderStyle}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
