import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface EmptyStateProps {
    /** FontAwesome icon class */
    icon: string;
    /** Heading text */
    title: string;
    /** Description text */
    description?: string;
    /** Accent color for the icon container border */
    color?: AccentColor;
    /** Optional action button */
    action?: React.ReactNode;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    white: '#FFFFFF',
};

/**
 * EmptyState - Memphis-styled empty state display
 *
 * Centered icon in a bordered square, heading, and optional description.
 * Extracted from notifications-six showcase.
 */
export function EmptyState({
    icon,
    title,
    description,
    color = 'teal',
    action,
    className = '',
}: EmptyStateProps) {
    const hex = ACCENT_HEX[color];

    return (
        <div
            className={[
                'border-4 p-12 text-center',
                className,
            ].filter(Boolean).join(' ')}
            style={{ borderColor: COLORS.dark, backgroundColor: COLORS.white }}
        >
            <div
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4"
                style={{ borderColor: hex }}
            >
                <i className={`${icon} text-2xl`} style={{ color: hex }} />
            </div>
            <h3
                className="text-lg font-black uppercase tracking-wide mb-2"
                style={{ color: COLORS.dark }}
            >
                {title}
            </h3>
            {description && (
                <p className="text-sm" style={{ color: COLORS.dark, opacity: 0.5 }}>{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
