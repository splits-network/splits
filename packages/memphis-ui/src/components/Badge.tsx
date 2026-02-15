import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: AccentColor | 'dark';
    outline?: boolean;
    className?: string;
}

const SOLID_CLASSES: Record<string, string> = {
    coral: 'bg-coral text-white border-dark',
    teal: 'bg-teal text-dark border-dark',
    yellow: 'bg-yellow text-dark border-dark',
    purple: 'bg-purple text-white border-dark',
    dark: 'bg-dark text-white border-dark',
};

const OUTLINE_CLASSES: Record<string, string> = {
    coral: 'bg-transparent text-coral border-coral',
    teal: 'bg-transparent text-teal border-teal',
    yellow: 'bg-transparent text-yellow border-yellow',
    purple: 'bg-transparent text-purple border-purple',
    dark: 'bg-transparent text-dark border-dark',
};

/**
 * Memphis Badge
 *
 * Sharp corners, thick border, bold typography.
 * Supports solid and outline variants.
 */
export function Badge({ children, variant = 'coral', outline = false, className = '' }: BadgeProps) {
    const variantClasses = outline ? OUTLINE_CLASSES[variant] : SOLID_CLASSES[variant];

    return (
        <span
            className={[
                'inline-flex items-center px-3 py-1',
                'border-2 font-bold text-xs uppercase tracking-wider',
                variantClasses,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {children}
        </span>
    );
}
