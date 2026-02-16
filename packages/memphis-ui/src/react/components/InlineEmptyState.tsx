import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface InlineEmptyStateProps {
    /** Title text */
    title: string;
    /** Description text */
    description: string;
    /** FontAwesome icon class */
    icon: string;
    /** Accent color for the icon */
    accent?: AccentColor;
    /** Action button label */
    actionLabel?: string;
    /** Action click handler */
    onAction?: () => void;
    /** Custom class name */
    className?: string;
}

/**
 * InlineEmptyState - Compact inline empty state row
 *
 * Memphis compliant horizontal layout with icon, text, and optional action button.
 * Extracted from empty-six showcase (inline variants section).
 */
export function InlineEmptyState({
    title,
    description,
    icon,
    accent = 'teal',
    actionLabel,
    onAction,
    className = '',
}: InlineEmptyStateProps) {
    return (
        <div
            className={[`accent-${accent}`, 'border-container bg-white p-6 flex items-center gap-6', className]
                .filter(Boolean)
                .join(' ')}
        >
            <div
                className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-3 border-accent"
            >
                <i className={`${icon} text-xl text-accent`} />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-black uppercase tracking-wider mb-1 text-dark">
                    {title}
                </h4>
                <p className="text-sm text-dark opacity-50">
                    {description}
                </p>
            </div>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-4 py-2.5 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex-shrink-0 border-accent bg-accent text-on-accent"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
