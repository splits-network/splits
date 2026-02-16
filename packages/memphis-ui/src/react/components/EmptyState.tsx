import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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

/**
 * EmptyState - Memphis-styled empty state display
 *
 * Uses Memphis `.card .card-border` CSS classes for the container.
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
    return (
        <div
            className={[
                `accent-${color}`,
                'card card-border text-center rounded-none',
                className,
            ].filter(Boolean).join(' ')}
        >
            <div className="card-body items-center p-12">
                <div
                    className="w-16 h-16 mb-4 flex items-center justify-center border-4 border-solid border-accent"
                >
                    <i className={`${icon} text-2xl text-accent`} />
                </div>
                <h3 className="card-title justify-center mb-2">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-dark opacity-50">{description}</p>
                )}
                {action && <div className="card-actions mt-4">{action}</div>}
            </div>
        </div>
    );
}
