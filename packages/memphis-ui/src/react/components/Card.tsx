import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
    return (
        <div
            className={[
                'card card-border',
                accent && `accent-${accent} border-l-[6px] border-l-accent`,
                dark ? 'bg-dark text-white' : 'bg-white text-dark',
                onClick ? 'cursor-pointer hover:-translate-y-1 transition-transform' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
