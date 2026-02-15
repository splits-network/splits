import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];

    return (
        <div
            className={['border-4 p-6 flex items-center gap-6', className]
                .filter(Boolean)
                .join(' ')}
            style={{ borderColor: '#1A1A2E', backgroundColor: '#FFFFFF' }}
        >
            <div
                className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-3"
                style={{ borderColor: hex }}
            >
                <i className={`${icon} text-xl`} style={{ color: hex }} />
            </div>
            <div className="flex-1">
                <h4
                    className="text-sm font-black uppercase tracking-wider mb-1"
                    style={{ color: '#1A1A2E' }}
                >
                    {title}
                </h4>
                <p className="text-xs" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                    {description}
                </p>
            </div>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-4 py-2.5 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex-shrink-0"
                    style={{ borderColor: hex, backgroundColor: hex, color: textHex }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
