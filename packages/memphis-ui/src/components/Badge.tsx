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
 * Uses the plugin's `.memphis-badge` base (interactive tier border 3px,
 * sharp corners, bold typography, uppercase).
 * Supports solid and outline variants via border-color overrides.
 */
export function Badge({ children, variant = 'coral', outline = false, className = '' }: BadgeProps) {
    const variantClasses = outline ? OUTLINE_CLASSES[variant] : SOLID_CLASSES[variant];

    return (
        <span
            className={[
                'memphis-badge',
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
